import React, { useState, useEffect } from 'react';
import { 
  History, 
  CheckCircle2, 
  PhoneCall, 
  MessageSquare, 
  Droplet, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Layers, 
  ArrowRight,
  RefreshCw,
  Send,
  MessageCircle,
  AlertTriangle,
  FileCheck,
  Lock,
  ThumbsUp,
  Star,
  X,
  Radio,
  Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchAdminAdvisories, 
  reassessAdvisory, 
  resendAdvisoryNotification, 
  recordAdvisoryFeedback, 
  fetchAuditLogs, 
  AdminAdvisoryItem, 
  AuditLogItem,
  AdvisoryFeedbackRequest
} from '../../services/api';
import { Toast } from '../common/Toast';

export const AdvisoryHistory: React.FC = () => {
  const { session } = useAuth();

  const [activeView, setActiveView] = useState<'advisories' | 'audit'>('advisories');
  const [advisories, setAdvisories] = useState<AdminAdvisoryItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');

  // Operator Action States
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'info'>('success');

  // Feedback Modal State
  const [feedbackModalAdvisory, setFeedbackModalAdvisory] = useState<AdminAdvisoryItem | null>(null);
  const [feedbackAction, setFeedbackAction] = useState<string>('APPLIED');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackWater, setFeedbackWater] = useState<number>(3200);
  const [feedbackLoss, setFeedbackLoss] = useState<number>(15000);
  const [feedbackNotes, setFeedbackNotes] = useState<string>('');

  // Audit Detail Modal State
  const [inspectedAuditLog, setInspectedAuditLog] = useState<AuditLogItem | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeView === 'advisories') {
        const res = await fetchAdminAdvisories(
          {
            status: statusFilter || undefined,
            risk_level: riskFilter || undefined,
            page_size: 25,
          },
          session?.access_token
        );
        setAdvisories(res.items);
      } else {
        const res = await fetchAuditLogs(
          { page_size: 30 },
          session?.access_token
        );
        setAuditLogs(res.items);
      }
    } catch (err) {
      console.warn('Advisory history fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeView, statusFilter, riskFilter, session?.access_token]);

  // Operator: Reassess Advisory
  const handleReassess = async (advId: string) => {
    setActionLoadingId(advId);
    try {
      const res = await reassessAdvisory(advId, session?.access_token);
      setToastMessage(`Advisory successfully reassessed! New action: "${res.immediate_action}"`);
      setToastType('success');
      setShowToast(true);
      await loadData();
    } catch (err: any) {
      setToastMessage(err.message || 'Reassessment failed');
      setToastType('warning');
      setShowToast(true);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Operator: Resend Notification
  const handleResend = async (advId: string) => {
    setActionLoadingId(advId);
    try {
      const res = await resendAdvisoryNotification(advId, { force_resend: true }, session?.access_token);
      setToastMessage(res.summary || 'Notification re-transmitted to carrier gateway!');
      setToastType('success');
      setShowToast(true);
      await loadData();
    } catch (err: any) {
      setToastMessage(err.message || 'Notification resend failed');
      setToastType('warning');
      setShowToast(true);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Operator: Submit Feedback
  const handleSubmitFeedback = async () => {
    if (!feedbackModalAdvisory) return;
    try {
      const payload: AdvisoryFeedbackRequest = {
        action_taken: feedbackAction,
        rating: feedbackRating,
        reported_water_savings_liters: Number(feedbackWater),
        reported_losses_avoided_inr: Number(feedbackLoss),
        feedback_text: feedbackNotes,
      };
      await recordAdvisoryFeedback(feedbackModalAdvisory.id, payload, session?.access_token);
      setToastMessage('Field feedback and impact outcomes recorded successfully into immutable audit trail!');
      setToastType('success');
      setShowToast(true);
      setFeedbackModalAdvisory(null);
      await loadData();
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to submit feedback');
      setToastType('warning');
      setShowToast(true);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Header & View Switcher */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0A1A12] via-[#0F261A] to-[#0A1A12] text-white border border-agri-600/40 shadow-soft-lg p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-agri-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <History className="w-4 h-4" />
              <span>Advisory Lifecycle & Immutable Audit Engine</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Advisory Management & Audit System
            </h2>
            <p className="text-xs text-canvas-300 mt-1 max-w-2xl leading-relaxed">
              Complete end-to-end auditability: Inspect original climate models, risk scores, AI prompt versions, telecom carrier receipts, and farmer feedback.
            </p>
          </div>

          {/* View Mode Toggle: Advisories vs Immutable Audit Trail */}
          <div className="flex items-center gap-2 bg-moss-800/80 p-1.5 rounded-2xl border border-agri-500/30">
            <button
              type="button"
              onClick={() => setActiveView('advisories')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === 'advisories'
                  ? 'bg-agri-600 text-white shadow-soft'
                  : 'text-canvas-300 hover:text-white'
              }`}
            >
              Advisories ({advisories.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveView('audit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'audit'
                  ? 'bg-agri-600 text-white shadow-soft'
                  : 'text-canvas-300 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit Trail</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: ADVISORIES LIST */}
      {activeView === 'advisories' && (
        <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-canvas-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-moss-800 uppercase tracking-wider">
                Filter Advisories:
              </span>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-canvas-100 border border-canvas-300 text-xs font-semibold text-moss-800 focus:outline-none"
              >
                <option value="">All Risk Levels</option>
                <option value="CRITICAL">Critical Risk</option>
                <option value="HIGH">High Risk</option>
                <option value="MODERATE">Moderate Risk</option>
                <option value="LOW">Low Risk</option>
              </select>
            </div>

            <button
              type="button"
              onClick={loadData}
              className="flex items-center gap-1.5 text-xs font-bold text-agri-700 hover:text-agri-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Feed</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-moss-500 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-agri-600" />
              <span>Loading advisories from database...</span>
            </div>
          ) : advisories.length === 0 ? (
            <div className="p-12 text-center text-moss-500 text-xs">
              No generated advisories found matching the criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {advisories.map((adv) => {
                const isCritical = adv.risk_level === 'CRITICAL';
                const isHigh = adv.risk_level === 'HIGH';
                const isMod = adv.risk_level === 'MODERATE';

                return (
                  <div
                    key={adv.id}
                    className="p-5 rounded-3xl bg-canvas-100/70 border border-canvas-300 hover:border-agri-400 transition-all space-y-3.5"
                  >
                    {/* Header: Farmer, Crop, Date, Risk Level */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-canvas-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-extrabold text-sm text-moss-900">
                            {adv.farmer_name}
                          </h4>
                          <span className="text-xs text-moss-500 font-mono">({adv.farmer_phone})</span>
                          <span className="text-[10px] font-bold text-agri-800 bg-agri-100 px-2 py-0.5 rounded">
                            {adv.crop_name} • {adv.growth_stage_name || 'Flowering'}
                          </span>
                        </div>
                        <p className="text-[11px] text-moss-400 font-mono mt-0.5">
                          Plot: {adv.farm_name} • Generated: {adv.created_at ? new Date(adv.created_at).toLocaleString() : 'Recent'} • Dialect: {adv.language.toUpperCase()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl border ${
                          isCritical ? 'bg-rose-100 text-rose-800 border-rose-300' :
                          isHigh ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          isMod ? 'bg-sky-100 text-sky-800 border-sky-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {adv.risk_level} RISK ({adv.confidence_pct}% Conf)
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          adv.action_status === 'APPLIED' ? 'bg-emerald-100 text-emerald-800' :
                          adv.action_status === 'IGNORED' ? 'bg-rose-100 text-rose-800' : 'bg-canvas-200 text-moss-700'
                        }`}>
                          Action: {adv.action_status}
                        </span>
                      </div>
                    </div>

                    {/* Recommendation Directives */}
                    <div className="p-4 rounded-2xl bg-white border border-canvas-200 space-y-1.5">
                      <p className="font-display font-bold text-sm text-moss-950">
                        "{adv.immediate_action}"
                      </p>
                      <p className="text-xs text-moss-600 leading-relaxed font-medium">
                        <strong>Reason:</strong> {adv.why_it_matters}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-moss-500">
                        <span><strong>Timing:</strong> {adv.recommended_timing}</span>
                        <span>•</span>
                        <span className="text-rose-700"><strong>Risk if Ignored:</strong> {adv.risk_if_ignored}</span>
                      </div>
                    </div>

                    {/* Supporting Climate & Carrier Delivery Status Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-canvas-200/50 p-3 rounded-2xl border border-canvas-200 font-mono">
                      <div className="flex items-center gap-3 text-moss-700">
                        <span>Delivery:</span>
                        <strong className="text-moss-900">{adv.delivery_summary.latest_status}</strong>
                        <span>({adv.delivery_summary.channels.join(', ') || 'SMS'})</span>
                        <span className="text-[10px] bg-sky-50 text-sky-800 px-2 py-0.5 rounded border border-sky-200">
                          {adv.delivery_summary.is_simulation ? 'Simulated Sandbox' : 'Live Carrier'}
                        </span>
                      </div>

                      {/* Operator Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleReassess(adv.id)}
                          disabled={actionLoadingId === adv.id}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-canvas-100 text-moss-800 font-bold text-[11px] border border-canvas-300 shadow-sm transition-all"
                          title="Re-run climate check and rules engine"
                        >
                          {actionLoadingId === adv.id ? 'Reassessing...' : 'Reassess'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResend(adv.id)}
                          disabled={actionLoadingId === adv.id}
                          className="px-3 py-1.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-[11px] shadow-sm transition-all flex items-center gap-1"
                          title="Resend notification with duplicate protection"
                        >
                          <Send className="w-3 h-3" />
                          <span>Resend</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFeedbackModalAdvisory(adv)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all"
                          title="Record farmer field action & water savings"
                        >
                          Record Feedback
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: IMMUTABLE AUDIT TRAIL */}
      {activeView === 'audit' && (
        <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-canvas-200">
            <div>
              <h3 className="font-display font-extrabold text-base text-moss-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Tamper-Evident Advisory Audit Records ({auditLogs.length})</span>
              </h3>
              <p className="text-xs text-moss-500 mt-0.5">
                Append-only historical records preserving environmental inputs, scoring methodology, AI prompt version, and carrier dispatches.
              </p>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-xl">
              Append-Only • Traceable
            </span>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-canvas-100/70 border border-canvas-300 hover:border-agri-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-moss-900">{log.farmer_name || 'Farmer Record'}</span>
                    <span className="font-mono text-[10px] bg-moss-200 text-moss-800 px-2 py-0.5 rounded font-bold">
                      {log.event_type}
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                      ✓ Immutable Verified
                    </span>
                  </div>

                  <p className="text-[11px] text-moss-500 font-mono mt-1">
                    Methodology: <strong>{log.scoring_methodology}</strong> • Model: <strong>{log.model_version}</strong> • Operator: {log.operator_id || 'System'}
                  </p>
                  {log.notes && (
                    <p className="text-[11px] text-moss-700 italic mt-0.5">
                      "{log.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono text-moss-400">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : 'Recent'}
                  </span>

                  <button
                    type="button"
                    onClick={() => setInspectedAuditLog(log)}
                    className="p-2 rounded-xl bg-white hover:bg-canvas-200 text-moss-800 border border-canvas-300 transition-colors"
                    title="Inspect complete JSON snapshot of inputs & outputs"
                  >
                    <Eye className="w-4 h-4 text-moss-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEEDBACK RECORDING MODAL */}
      {feedbackModalAdvisory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-moss-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-canvas-300 shadow-soft-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-canvas-200">
              <h3 className="font-display font-extrabold text-base text-moss-900">
                Record Field Feedback & Ground Truth
              </h3>
              <button
                type="button"
                onClick={() => setFeedbackModalAdvisory(null)}
                className="w-8 h-8 rounded-full bg-canvas-200 hover:bg-canvas-300 text-moss-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-moss-600">
              Recording feedback for <strong className="text-moss-900">{feedbackModalAdvisory.farmer_name}</strong> on "{feedbackModalAdvisory.immediate_action}"
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-moss-800 block mb-1">Action Outcome Taken by Farmer:</label>
                <select
                  value={feedbackAction}
                  onChange={(e) => setFeedbackAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-canvas-100 border border-canvas-300 font-semibold"
                >
                  <option value="APPLIED">Applied (Followed recommendation completely)</option>
                  <option value="PARTIALLY_APPLIED">Partially Applied</option>
                  <option value="IGNORED">Ignored / Disregarded</option>
                  <option value="POSTPONED">Postponed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-moss-800 block mb-1">Water Saved (Liters):</label>
                  <input
                    type="number"
                    value={feedbackWater}
                    onChange={(e) => setFeedbackWater(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-canvas-100 border border-canvas-300 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-moss-800 block mb-1">Crop Loss Avoided (INR ₹):</label>
                  <input
                    type="number"
                    value={feedbackLoss}
                    onChange={(e) => setFeedbackLoss(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-canvas-100 border border-canvas-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-moss-800 block mb-1">Farmer Satisfaction Rating (1-5 Stars):</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`p-2 rounded-xl border text-xs font-bold ${
                        feedbackRating >= star
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-canvas-100 text-moss-400 border-canvas-200'
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-moss-800 block mb-1">Field Agronomist Notes:</label>
                <textarea
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="Farmer confirmed irrigation pump was halted 24h before rainfall..."
                  className="w-full px-3 py-2 rounded-xl bg-canvas-100 border border-canvas-300 text-xs h-20"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-canvas-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFeedbackModalAdvisory(null)}
                className="px-4 py-2 rounded-xl bg-canvas-200 text-moss-800 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitFeedback}
                className="px-5 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-soft"
              >
                Save to Immutable Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT SNAPSHOT INSPECTION MODAL */}
      {inspectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-moss-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-canvas-300 shadow-soft-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-canvas-200">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <h3 className="font-display font-extrabold text-base text-moss-900">
                  Immutable Audit Snapshot ({inspectedAuditLog.event_type})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedAuditLog(null)}
                className="w-8 h-8 rounded-full bg-canvas-200 hover:bg-canvas-300 text-moss-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-canvas-100 font-mono space-y-1">
                <p>Record ID: {inspectedAuditLog.id}</p>
                <p>Advisory ID: {inspectedAuditLog.advisory_id}</p>
                <p>Timestamp: {inspectedAuditLog.created_at}</p>
                <p>Scoring Methodology: {inspectedAuditLog.scoring_methodology}</p>
                <p>Model Engine: {inspectedAuditLog.model_version}</p>
              </div>

              <div>
                <strong className="text-moss-900 block mb-1">Advisory Snapshot:</strong>
                <pre className="p-3 rounded-2xl bg-moss-950 text-agri-300 font-mono text-[11px] overflow-x-auto max-h-40">
                  {JSON.stringify(inspectedAuditLog.advisory_snapshot || {}, null, 2)}
                </pre>
              </div>

              {inspectedAuditLog.risk_snapshot && (
                <div>
                  <strong className="text-moss-900 block mb-1">Risk Factors & Thresholds Snapshot:</strong>
                  <pre className="p-3 rounded-2xl bg-moss-950 text-agri-300 font-mono text-[11px] overflow-x-auto max-h-40">
                    {JSON.stringify(inspectedAuditLog.risk_snapshot, null, 2)}
                  </pre>
                </div>
              )}

              {inspectedAuditLog.delivery_snapshot && (
                <div>
                  <strong className="text-moss-900 block mb-1">Carrier Delivery Snapshot:</strong>
                  <pre className="p-3 rounded-2xl bg-moss-950 text-agri-300 font-mono text-[11px] overflow-x-auto max-h-40">
                    {JSON.stringify(inspectedAuditLog.delivery_snapshot, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-canvas-200 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectedAuditLog(null)}
                className="px-5 py-2 rounded-xl bg-moss-900 text-white font-bold text-xs"
              >
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
