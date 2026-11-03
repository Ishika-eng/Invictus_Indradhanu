import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  Globe2,
  Sprout,
  ArrowRight,
  Filter,
  X,
  History,
  Layers,
  ChevronRight,
  CheckCircle2,
  Ban,
  Clock,
  RefreshCw,
  Radio
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchAdminFarmers, 
  fetchAdminFarmerDetail, 
  AdminFarmerItem, 
  AdminFarmerDetailResponse 
} from '../../services/api';

export const FarmersDirectory: React.FC = () => {
  const { setSelectedLanguage, setActiveTab, setFarmerName, setFarmerPhone } = useAdvisory();
  const { session } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [farmers, setFarmers] = useState<AdminFarmerItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  // Detail Modal / Drawer
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
  const [farmerDetail, setFarmerDetail] = useState<AdminFarmerDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  const loadFarmers = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminFarmers(
        {
          q: searchQuery || undefined,
          district: districtFilter || undefined,
          page,
          page_size: 12,
        },
        session?.access_token
      );
      setFarmers(res.items);
      setTotalCount(res.total);
    } catch (err) {
      console.warn('Farmers directory fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadFarmers();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, districtFilter, page, session?.access_token]);

  const handleOpenDetail = async (farmerId: string) => {
    setSelectedFarmerId(farmerId);
    setDetailLoading(true);
    try {
      const res = await fetchAdminFarmerDetail(farmerId, session?.access_token);
      setFarmerDetail(res);
    } catch (err) {
      console.error('Failed to load farmer detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelectForAdvisoryFlow = (f: AdminFarmerItem) => {
    setFarmerName(f.full_name);
    setFarmerPhone(f.phone_number);
    setSelectedLanguage(f.preferred_language as any);
    setActiveTab('advisory-wizard');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Search */}
      <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-agri-100 text-agri-800">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-moss-900">
                Smallholder Farmers Directory
              </h2>
            </div>
            <p className="text-xs text-moss-500 mt-0.5">
              Authorized administrator view: Inspect farmer profiles, micro-zone farm plots, registered crops, and advisory dispatch logs.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono font-bold text-agri-800 bg-agri-50 px-3 py-1 rounded-xl border border-agri-200">
              {totalCount} Total Registered
            </span>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-moss-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by farmer name, phone number, village..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-canvas-100 border border-canvas-300 text-xs focus:outline-none focus:border-agri-600 font-medium"
            />
          </div>

          <div className="w-full sm:w-56">
            <input
              type="text"
              placeholder="Filter by district (e.g. Pune)..."
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-canvas-100 border border-canvas-300 text-xs focus:outline-none focus:border-agri-600 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Farmers Grid */}
      {loading ? (
        <div className="p-12 text-center text-moss-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-agri-600" />
          <span>Loading verified farmer profiles from database...</span>
        </div>
      ) : farmers.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-canvas-300 text-center text-moss-500 text-xs">
          No farmers matched the query "{searchQuery}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farmers.map((farmer) => (
            <div
              key={farmer.id}
              className="rounded-3xl bg-white border border-canvas-300 shadow-soft hover:shadow-soft-lg transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-canvas-200 border border-canvas-300 flex items-center justify-center text-2xl">
                      👨🏽‍🌾
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-moss-900">
                        {farmer.full_name}
                      </h3>
                      <p className="text-xs text-moss-500 flex items-center gap-1 font-medium mt-0.5">
                        <MapPin className="w-3 h-3 text-agri-600 shrink-0" />
                        <span>{farmer.village}, {farmer.district}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-agri-50 text-agri-800 border border-agri-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3 text-agri-600" />
                    <span>{farmer.trust_score}%</span>
                  </div>
                </div>

                {/* Attributes */}
                <div className="space-y-1.5 py-2.5 border-y border-canvas-200 text-xs">
                  <div className="flex items-center justify-between text-moss-600">
                    <span className="text-[11px]">Phone:</span>
                    <span className="font-mono font-bold text-moss-800">{farmer.phone_number}</span>
                  </div>
                  <div className="flex items-center justify-between text-moss-600">
                    <span className="text-[11px]">Farm Acreage:</span>
                    <strong className="text-moss-800">{farmer.total_acreage} Acres ({farmer.farms_count} plots)</strong>
                  </div>
                  <div className="flex items-center justify-between text-moss-600">
                    <span className="text-[11px]">Crops:</span>
                    <span className="text-agri-800 font-bold truncate max-w-[150px]">
                      {farmer.crops.length > 0 ? farmer.crops.join(', ') : 'Tomato, Cotton'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-moss-600">
                    <span className="text-[11px]">Dialect & Channel:</span>
                    <span className="font-mono text-moss-700 uppercase">
                      {farmer.preferred_language} • {farmer.preferred_channel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-moss-600">
                    <span className="text-[11px]">Consent:</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      farmer.is_opted_in ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {farmer.is_opted_in ? 'Opted In' : 'Opted Out'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenDetail(farmer.id)}
                  className="flex-1 py-2 rounded-xl bg-canvas-200 hover:bg-canvas-300 text-moss-800 text-xs font-bold transition-colors"
                >
                  View Details & Plots
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectForAdvisoryFlow(farmer)}
                  className="px-3 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold shadow-soft transition-all"
                  title="Load farmer into live 6-step advisory flow"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Single Farmer Detail Modal */}
      {selectedFarmerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-moss-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-canvas-300 shadow-soft-lg p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-canvas-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-agri-100 text-agri-800 flex items-center justify-center text-xl font-bold">
                  🌾
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-moss-900">
                    {farmerDetail?.farmer.full_name || 'Farmer Details'}
                  </h3>
                  <p className="text-xs text-moss-500 font-mono">
                    {farmerDetail?.farmer.phone_number} • {farmerDetail?.farmer.village}, {farmerDetail?.farmer.district}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFarmerId(null)}
                className="w-8 h-8 rounded-full bg-canvas-200 hover:bg-canvas-300 text-moss-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-8 text-center text-xs text-moss-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-agri-600" />
                <span>Loading plots and advisory history...</span>
              </div>
            ) : farmerDetail ? (
              <div className="space-y-4 text-xs">
                {/* Registered Plots & Crops */}
                <div>
                  <h4 className="font-display font-bold text-moss-900 mb-2 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-agri-600" />
                    <span>Registered Farm Plots ({farmerDetail.farms.length})</span>
                  </h4>

                  <div className="space-y-2">
                    {farmerDetail.farms.map((f) => (
                      <div key={f.id} className="p-3.5 rounded-2xl bg-canvas-100 border border-canvas-200 space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-moss-900">
                          <span>{f.name} ({f.acreage} Acres)</span>
                          <span className="font-mono text-[11px] text-moss-500">
                            GPS: {f.latitude.toFixed(4)}, {f.longitude.toFixed(4)}
                          </span>
                        </div>
                        <p className="text-[11px] text-moss-500">
                          Soil: <strong>{f.soil_type}</strong> • Irrigation: <strong>{f.irrigation_source}</strong>
                        </p>

                        {/* Crops list in this plot */}
                        {f.crops.length > 0 && (
                          <div className="pt-1.5 border-t border-canvas-200/80 flex flex-wrap gap-1.5">
                            {f.crops.map((c) => (
                              <span key={c.id} className="px-2 py-0.5 rounded-lg bg-agri-100 text-agri-900 font-bold text-[10px]">
                                {c.crop_name} ({c.cultivated_acreage} ac) • Stage: {c.current_stage || 'Flowering'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advisories Generated for this Farmer */}
                <div>
                  <h4 className="font-display font-bold text-moss-900 mb-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <span>Advisory History ({farmerDetail.advisories.length})</span>
                  </h4>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {farmerDetail.advisories.length === 0 ? (
                      <p className="text-moss-400 italic">No previous advisories generated yet.</p>
                    ) : (
                      farmerDetail.advisories.map((a) => (
                        <div key={a.id} className="p-3 rounded-2xl bg-canvas-100 border border-canvas-200 space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-moss-900">{a.crop_name}</span>
                            <span className="text-[10px] font-mono text-agri-700">{a.status}</span>
                          </div>
                          <p className="text-moss-800 font-medium">"{a.immediate_action}"</p>
                          <div className="text-[10px] text-moss-400 flex items-center justify-between">
                            <span>Dialect: {a.language.toUpperCase()}</span>
                            <span>Action Status: <strong>{a.action_status}</strong></span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Carrier Delivery Logs */}
                <div>
                  <h4 className="font-display font-bold text-moss-900 mb-2 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-emerald-600" />
                    <span>Recent Carrier Delivery Transmissions ({farmerDetail.delivery_logs.length})</span>
                  </h4>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {farmerDetail.delivery_logs.map((dl) => (
                      <div key={dl.id} className="p-2 rounded-xl bg-canvas-100 border border-canvas-200 flex items-center justify-between text-[11px]">
                        <div>
                          <strong className="text-moss-900">{dl.channel}</strong> • To: {dl.recipient_phone} ({dl.provider})
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          dl.status === 'DELIVERED' || dl.status === 'ANSWERED' ? 'bg-emerald-100 text-emerald-800' :
                          dl.is_simulation ? 'bg-sky-100 text-sky-800' : 'bg-canvas-200 text-moss-700'
                        }`}>
                          {dl.is_simulation ? 'SIMULATED' : dl.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-3 border-t border-canvas-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedFarmerId(null)}
                className="px-5 py-2 rounded-xl bg-moss-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
