import json
import re
from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings
from app.core.logging import logger
from app.services.advisory.advisory_types import (
    AgronomicDirective,
    FarmerAdvisoryOutput,
)
from app.services.advisory.multilingual_template_engine import MultilingualTemplateEngine


class GeminiAdvisoryService:
    """Modular Google Gemini LLM Service for agricultural advisory explanation.
    
    Transforms approved deterministic agronomic directives into empathetic, simple,
    farmer-friendly phrasing in the farmer's native tongue (Marathi, Hindi, Telugu, Kiswahili, English).
    
    STRICT SAFETY GUARDS:
    - Ground truth comes strictly from deterministic rules; Gemini CANNOT override risk scores.
    - Never recommends chemical dosages.
    - Falls back instantly to MultilingualTemplateEngine if API key is absent, rate-limited, or offline.
    """

    MODEL = getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash")
    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

    LANGUAGE_NAMES = {
        "en": "English",
        "mr": "Marathi (मराठी)",
        "hi": "Hindi (हिन्दी)",
        "te": "Telugu (తెలుగు)",
        "sw": "Kiswahili (Swahili)",
    }

    @classmethod
    async def generate_advisory_explanation(
        cls,
        primary_directive: AgronomicDirective,
        secondary_directives: List[AgronomicDirective],
        target_lang: str,
        crop_name: str,
        stage_name: str,
        farmer_name: str = "Farmer",
        location_str: str = "Farm Plot",
        timeout_seconds: float = 12.0,
    ) -> FarmerAdvisoryOutput:
        """Invokes Gemini API or falls back to MultilingualTemplateEngine."""
        api_key = settings.GEMINI_API_KEY
        lang = target_lang.lower() if target_lang.lower() in cls.LANGUAGE_NAMES else "en"

        # Check if Gemini API Key is missing or a template placeholder
        if not api_key or "YOUR_GEMINI" in api_key or len(api_key) < 15:
            logger.info("Gemini API key unconfigured; using deterministic multilingual template engine.")
            return MultilingualTemplateEngine.translate_directive(
                directive=primary_directive,
                target_lang=lang,
                crop_name=crop_name,
                stage_name=stage_name,
            )

        endpoint = f"{cls.BASE_URL}/{cls.MODEL}:generateContent?key={api_key}"
        lang_name = cls.LANGUAGE_NAMES.get(lang, "English")

        system_instruction = (
            "You are an empathetic agricultural extension expert communicating with a smallholder farmer.\n"
            "You are given verified agricultural directives and biophysical evidence produced by ICAR and FAO models.\n\n"
            "STRICT RULES:\n"
            "1. Ground truth actions and evidence are fixed. DO NOT alter risk scores or invent crop thresholds.\n"
            f"2. Translate and explain the recommendation in simple, respectful, farmer-friendly {lang_name} without academic jargon.\n"
            "3. NEVER recommend specific chemical pesticide dosages. Always advise consulting the nearest Krishi Vigyan Kendra (KVK) or local extension officer for chemical formulations.\n"
            "4. Never claim a disease is diagnosed from weather data alone (frame as environmental favorability).\n"
            "5. Always return a single, valid JSON object strictly matching the specified structure without markdown code blocks."
        )

        user_prompt = f"""
Farmer: {farmer_name}
Location: {location_str}
Crop: {crop_name} (Growth Stage: {stage_name})
Target Language: {lang_name}

Approved Agricultural Directive:
- Category: {primary_directive.category.value}
- Action: {primary_directive.immediate_action}
- Why it matters: {primary_directive.why_it_matters}
- Recommended timing: {primary_directive.recommended_timing}
- Risk if ignored: {primary_directive.risk_if_ignored}
- Projected impact: {primary_directive.projected_impact or 'Protects yield and prevents crop loss'}
- Action steps: {json.dumps(primary_directive.action_steps)}
- Supporting evidence: {json.dumps(primary_directive.supporting_evidence)}
- Data limitations: {primary_directive.data_limitations or 'None'}

Produce a valid JSON object in {lang_name} with the following exact keys:
{{
  "immediate_action": "clear directive of what the farmer should do right now",
  "why_it_matters": "simple empathetic reason explaining why this action is essential",
  "recommended_timing": "precise window when the farmer should act",
  "risk_if_ignored": "consequences to yield, crop health, or money if ignored",
  "projected_impact": "tangible benefit of following this advice",
  "action_steps": ["step 1", "step 2", "step 3"],
  "scientific_reasoning": ["agronomic reason 1", "environmental reason 2"],
  "supporting_evidence": ["metric 1", "metric 2"],
  "data_limitations": "mention if in-situ soil moisture sensor is unavailable",
  "disclaimer": "clear notice that advice is decision support and to consult local KVK for chemical dosages"
}}
"""

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"text": f"{system_instruction}\n\n{user_prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 1024,
                "responseMimeType": "application/json",
            }
        }

        try:
            async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                res = await client.post(endpoint, json=payload)
                if res.status_code != 200:
                    logger.warning(f"Gemini API returned status {res.status_code}: {res.text}. Falling back to template.")
                    return MultilingualTemplateEngine.translate_directive(
                        directive=primary_directive,
                        target_lang=lang,
                        crop_name=crop_name,
                        stage_name=stage_name,
                    )

                data = res.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                
                # Clean any accidental markdown wrap
                cleaned_json = re.sub(r"^```(?:json)?\s*", "", raw_text, flags=re.MULTILINE)
                cleaned_json = re.sub(r"\s*```$", "", cleaned_json, flags=re.MULTILINE)

                parsed = json.loads(cleaned_json)

                return FarmerAdvisoryOutput(
                    immediate_action=parsed.get("immediate_action", primary_directive.immediate_action),
                    why_it_matters=parsed.get("why_it_matters", primary_directive.why_it_matters),
                    recommended_timing=parsed.get("recommended_timing", primary_directive.recommended_timing),
                    risk_if_ignored=parsed.get("risk_if_ignored", primary_directive.risk_if_ignored),
                    projected_impact=parsed.get("projected_impact", primary_directive.projected_impact),
                    action_steps=parsed.get("action_steps", primary_directive.action_steps),
                    scientific_reasoning=parsed.get("scientific_reasoning", [f"Category: {primary_directive.category.value}"]),
                    supporting_evidence=parsed.get("supporting_evidence", primary_directive.supporting_evidence),
                    data_limitations=parsed.get("data_limitations", primary_directive.data_limitations),
                    confidence_pct=primary_directive.confidence_pct,
                    needs_expert_review=primary_directive.needs_expert_review,
                    disclaimer=parsed.get("disclaimer", MultilingualTemplateEngine.DISCLAIMERS.get(lang, MultilingualTemplateEngine.DISCLAIMERS["en"])),
                    language=lang,
                    model_version=f"rules_v1+{cls.MODEL}",
                )

        except Exception as e:
            logger.warning(f"Gemini API request failed ({e}). Gracefully falling back to deterministic template.")
            return MultilingualTemplateEngine.translate_directive(
                directive=primary_directive,
                target_lang=lang,
                crop_name=crop_name,
                stage_name=stage_name,
            )

