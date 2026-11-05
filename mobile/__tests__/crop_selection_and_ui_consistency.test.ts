import fs from 'fs';
import path from 'path';
import { 
  createDefaultAdvisoryForCrop, 
  shouldInvalidateAdvisoryOnCropSwitch 
} from '../../src/utils/cropAdvisory';

describe('Indradhanu Crop Selection & UI Consistency Audit', () => {

  describe('1. Crop Selection Consistency (Rice vs Tomato)', () => {
    it('generates Rice-specific advisory when Rice is selected without any Tomato traces', () => {
      const adv = createDefaultAdvisoryForCrop(
        'Rice (Paddy)',
        'Vegetative',
        'Rameshwar Patil',
        'Karjat'
      );

      // Verify crop identity
      expect(adv.cropName).toBe('Rice (Paddy)');
      expect(adv.growthStage).toBe('Vegetative');
      expect(adv.farmerName).toBe('Rameshwar Patil');

      // Verify action & reasoning is Rice-specific
      expect(adv.immediateAction.toLowerCase()).toContain('rice');
      expect(adv.immediateAction.toLowerCase()).toContain('basin');
      expect(adv.immediateAction.toLowerCase()).not.toContain('tomato');
      expect(adv.whyItMatters.toLowerCase()).toContain('bunds');
      expect(adv.whyItMatters.toLowerCase()).not.toContain('flower drop');

      // Verify action steps are Rice-specific
      expect(adv.actionSteps.some(s => s.toLowerCase().includes('canal') || s.toLowerCase().includes('bunds'))).toBe(true);
      expect(adv.actionSteps.some(s => s.toLowerCase().includes('tomato beds'))).toBe(false);

      // Verify all 5 language translations strictly reference Rice and the farmer
      const langs = ['en', 'hi', 'mr', 'te', 'sw'] as const;
      for (const lang of langs) {
        const trans = adv.translations[lang];
        expect(trans).toBeDefined();
        expect(trans.immediateAction).not.toBe('');
        expect(trans.whyItMatters).not.toBe('');

        // SMS & Voice script must contain recipient farmer name
        expect(trans.smsBody).toContain('Rameshwar Patil');
        expect(trans.voiceScript).toContain('Rameshwar Patil');

        // Never contain Tomato or foreign crop references
        expect(trans.immediateAction).not.toContain('Tomato');
        expect(trans.immediateAction).not.toContain('टोमॅटो');
        expect(trans.smsBody).not.toContain('Tomato');
        expect(trans.smsBody).not.toContain('टोमॅटो');
        expect(trans.voiceScript).not.toContain('Tomato');
        expect(trans.voiceScript).not.toContain('टोमॅटो');
      }
    });

    it('generates Tomato-specific advisory when Tomato is selected', () => {
      const adv = createDefaultAdvisoryForCrop(
        'Tomato',
        'Flowering',
        'Santosh Kadam',
        'Nashik'
      );

      expect(adv.cropName).toBe('Tomato');
      expect(adv.farmerName).toBe('Santosh Kadam');
      expect(adv.immediateAction.toLowerCase()).toContain('irrigation');
      expect(adv.impactPotential.toLowerCase()).toContain('flower');

      // Check Marathi translation mentions farmer and is non-empty
      expect(adv.translations.mr.voiceScript).toContain('Santosh Kadam');
      expect(adv.translations.mr.smsBody).toContain('Santosh Kadam');
    });
  });

  describe('2. Crop Switching & Stale Advisory Invalidation', () => {
    it('invalidates existing advisory when switching from Rice to Tomato', () => {
      const shouldInvalidate = shouldInvalidateAdvisoryOnCropSwitch('Rice (Paddy)', 'Tomato');
      expect(shouldInvalidate).toBe(true);
    });

    it('invalidates existing advisory when switching from Tomato to Rice', () => {
      const shouldInvalidate = shouldInvalidateAdvisoryOnCropSwitch('Tomato', 'Rice (Paddy)');
      expect(shouldInvalidate).toBe(true);
    });

    it('does not invalidate when crop name is synonymous or matching', () => {
      expect(shouldInvalidateAdvisoryOnCropSwitch('Rice', 'Rice (Paddy)')).toBe(false);
      expect(shouldInvalidateAdvisoryOnCropSwitch('Rice (Paddy)', 'Rice')).toBe(false);
      expect(shouldInvalidateAdvisoryOnCropSwitch(null, 'Rice')).toBe(false);
      expect(shouldInvalidateAdvisoryOnCropSwitch(undefined, 'Tomato')).toBe(false);
    });
  });

  describe('3. UI Simplification & Single-Line Concise Button Labels', () => {
    const wizardDir = path.resolve(__dirname, '../../src/components/advisory-wizard');

    it('enforces single-line concise button labels in Step 1 (Farmer Profile)', () => {
      const content = fs.readFileSync(path.join(wizardDir, 'Step1FarmerProfile.tsx'), 'utf-8');
      expect(content).toContain('Detect GPS');
      expect(content).toContain('Save Profile');
      expect(content).toContain('Continue');
      // Must not contain verbose multi-line labels
      expect(content).not.toContain('Continue to Step 2 — Crop Selection');
      expect(content).not.toContain('Save Profile & Farm Coordinates');
    });

    it('enforces single-line concise button labels in Step 2 (Crop Selection)', () => {
      const content = fs.readFileSync(path.join(wizardDir, 'Step2CropSelection.tsx'), 'utf-8');
      expect(content).toContain('>Back<');
      expect(content).toContain('>Save & Continue<');
      // Must not contain verbose multi-line labels
      expect(content).not.toContain('Save & Continue to Step 3 — Generate Advisory');
      expect(content).not.toContain('Back to Farmer Profile');
    });

    it('enforces single-line concise button labels in Step 3 (Processing)', () => {
      const content = fs.readFileSync(path.join(wizardDir, 'Step3Processing.tsx'), 'utf-8');
      expect(content).toContain('Change Crop');
      expect(content).toContain('Generate Advice');
    });

    it('enforces single-line concise button labels in Step 4 (Climate Intelligence)', () => {
      const content = fs.readFileSync(path.join(wizardDir, 'Step4ClimateIntelligence.tsx'), 'utf-8');
      expect(content).toContain('>Back<');
      expect(content).toContain('>Continue<');
      expect(content).not.toContain('Continue to Step 5 — AI Recommendation');
      expect(content).not.toContain('Back to Crop Selection');
    });

    it('enforces single-line concise button labels in Step 5 (Recommendation)', () => {
      const content = fs.readFileSync(path.join(wizardDir, 'Step5Recommendation.tsx'), 'utf-8');
      expect(content).toContain('>Back<');
      expect(content).toContain('>Continue<');
      expect(content).not.toContain('Continue to Step 6 — Last-Mile Delivery');
      expect(content).not.toContain('Back to Climate Data');
    });

    it('enforces single-line concise button labels in Step 6 (Delivery)', () => {
      const content = fs.readFileSync(path.join(wizardDir, 'Step6Delivery.tsx'), 'utf-8');
      expect(content).toContain('>Back<');
      expect(content).toContain('>Restart<');
      expect(content).toContain('>Simulate Delivery<');
      expect(content).toContain('>Send Advisory<');
      expect(content).toContain('Broadcast All Channels');
      // Must not contain verbose multi-line labels
      expect(content).not.toContain('Simulate Advisory Delivery');
      expect(content).not.toContain('Send Live Advisory');
      expect(content).not.toContain('Back to Recommendation');
      expect(content).not.toContain('Run Demo Again');
      expect(content).not.toContain('Broadcast All 3 Channels Simultaneously');
    });
  });
});
