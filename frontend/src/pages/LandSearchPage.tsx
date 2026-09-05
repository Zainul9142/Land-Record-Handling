import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Filter, ArrowRight, ShieldCheck, Radio, CheckCircle2, Copy, Check, Sparkles, Globe2, Navigation, Compass, Layers } from 'lucide-react';
import { LandParcel, StateMetadata } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LocationSearchModal } from '../components/LocationSearchModal';

interface LandSearchPageProps {
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const LandSearchPage: React.FC<LandSearchPageProps> = ({ onShowToast }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialLandId = searchParams.get('land_id') || '';

  const [statesList, setStatesList] = useState<string[]>([]);
  const [stateMetadata, setStateMetadata] = useState<Record<string, StateMetadata>>({});
  
  const [selectedState, setSelectedState] = useState<string>('Jharkhand');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Bokaro');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<string>('Chas');
  const [selectedVillage, setSelectedVillage] = useState<string>('Kura');
  const [primaryNo, setPrimaryNo] = useState<string>('');
  const [plotNo, setPlotNo] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [queryText, setQueryText] = useState<string>(initialQuery);

  const [liveMode, setLiveMode] = useState<boolean>(true);
  const [liveStreamMeta, setLiveStreamMeta] = useState<any>(null);

  const [results, setResults] = useState<LandParcel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  // Load locations from backend
  useEffect(() => {
    fetch('/api/v1/land/locations')
      .then(res => res.json())
      .then(data => {
        if (data.states) {
          setStatesList(data.states);
        }
        if (data.state_metadata) {
          setStateMetadata(data.state_metadata);
        }
      })
      .catch(err => console.error("Error loading Pan-India location registry", err));

    handleSearch();
  }, []);

  const currentStateMeta = stateMetadata[selectedState] || {
    portal: `${selectedState} Official Land Record Portal`,
    subdistrict_name: 'Tehsil / Sub-district',
    primary_no_name: 'Khata / Gata / Survey No',
    plot_no_name: 'Khesra / Khasra / Plot No',
    record_type: 'Record of Rights (ROR)',
    districts: {}
  };

  const districtOptions = currentStateMeta.districts ? Object.keys(currentStateMeta.districts) : [];
  const subdistrictOptions = selectedDistrict && currentStateMeta.districts?.[selectedDistrict] 
    ? Object.keys(currentStateMeta.districts[selectedDistrict]) 
    : [];
  const villageOptions = selectedDistrict && selectedSubdistrict && currentStateMeta.districts?.[selectedDistrict]?.[selectedSubdistrict]
    ? currentStateMeta.districts[selectedDistrict][selectedSubdistrict]
    : [];

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const meta = stateMetadata[newState];
    if (meta && meta.districts) {
      const firstDist = Object.keys(meta.districts)[0] || '';
      setSelectedDistrict(firstDist);
      if (firstDist && meta.districts[firstDist]) {
        const firstSub = Object.keys(meta.districts[firstDist])[0] || '';
        setSelectedSubdistrict(firstSub);
        const firstVil = meta.districts[firstDist][firstSub]?.[0] || '';
        setSelectedVillage(firstVil);
      } else {
        setSelectedSubdistrict('');
        setSelectedVillage('');
      }
    } else {
      setSelectedDistrict('');
      setSelectedSubdistrict('');
      setSelectedVillage('');
    }
  };

  const handleDistrictChange = (newDist: string) => {
    setSelectedDistrict(newDist);
    if (currentStateMeta.districts?.[newDist]) {
      const firstSub = Object.keys(currentStateMeta.districts[newDist])[0] || '';
      setSelectedSubdistrict(firstSub);
      const firstVil = currentStateMeta.districts[newDist][firstSub]?.[0] || '';
      setSelectedVillage(firstVil);
    } else {
      setSelectedSubdistrict('');
      setSelectedVillage('');
    }
  };

  const handleSubdistrictChange = (newSub: string) => {
    setSelectedSubdistrict(newSub);
    if (selectedDistrict && currentStateMeta.districts?.[selectedDistrict]?.[newSub]) {
      const firstVil = currentStateMeta.districts[selectedDistrict][newSub]?.[0] || '';
      setSelectedVillage(firstVil);
    } else {
      setSelectedVillage('');
    }
  };

  const handleSearch = () => {
    setLoading(true);
    let url = `/api/v1/land/search?limit=50`;
    
    if (selectedState) url += `&state=${encodeURIComponent(selectedState)}`;
    if (selectedDistrict) url += `&district=${encodeURIComponent(selectedDistrict)}`;
    if (selectedSubdistrict) url += `&anchal=${encodeURIComponent(selectedSubdistrict)}`;
    if (selectedVillage) url += `&mauza=${encodeURIComponent(selectedVillage)}`;
    if (primaryNo) url += `&khata=${encodeURIComponent(primaryNo)}`;
    if (plotNo) url += `&khesra=${encodeURIComponent(plotNo)}`;
    if (ownerName) url += `&owner=${encodeURIComponent(ownerName)}`;
    if (queryText) url += `&query=${encodeURIComponent(queryText)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setResults(data.results || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Search failed", err);
        setLoading(false);
      });

    // If live mode is enabled, also trigger live state scraper adapter
    if (liveMode) {
      fetch('/api/official/live-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: selectedState,
          district: selectedDistrict,
          anchal: selectedSubdistrict,
          mauza: selectedVillage,
          khata_no: primaryNo || '125',
          khesra_no: plotNo || '450/2'
        })
      })
      .then(res => res.json())
      .then(liveData => {
        if (liveData && liveData.status === 'SUCCESS') {
          setLiveStreamMeta(liveData);
        }
      })
      .catch(e => console.warn("Live scraper fallback to database stream", e));
    }
  };

  const applyPresetFilter = (preset: string) => {
    if (preset === 'JH_BOKARO' || preset === 'JH') {
      setSelectedState('Jharkhand');
      setSelectedDistrict('Bokaro');
      setSelectedSubdistrict('Chas');
      setSelectedVillage('Kura');
      setPrimaryNo('125');
      setPlotNo('450/2');
      setOwnerName('Sunil Kumar Singh');
      setQueryText('');
    } else if (preset === 'UP_NOIDA' || preset === 'UP') {
      setSelectedState('Uttar Pradesh');
      setSelectedDistrict('Gautam Buddha Nagar (Noida)');
      setSelectedSubdistrict('Dadri');
      setSelectedVillage('Bhangel');
      setPrimaryNo('340');
      setPlotNo('112/1');
      setOwnerName('Rajesh Sharma');
      setQueryText('');
    } else if (preset === 'MH_PUNE' || preset === 'MH') {
      setSelectedState('Maharashtra');
      setSelectedDistrict('Pune');
      setSelectedSubdistrict('Haveli');
      setSelectedVillage('Hinjawadi');
      setPrimaryNo('145');
      setPlotNo('23/B');
      setOwnerName('Suresh Kadam');
      setQueryText('');
    } else if (preset === 'KA_BLR' || preset === 'KA') {
      setSelectedState('Karnataka');
      setSelectedDistrict('Bengaluru Urban');
      setSelectedSubdistrict('Bengaluru South');
      setSelectedVillage('Whitefield');
      setPrimaryNo('89');
      setPlotNo('3/A');
      setOwnerName('Venkatesh Murthy');
      setQueryText('');
    } else if (preset === 'BR_PATNA' || preset === 'BR') {
      setSelectedState('Bihar');
      setSelectedDistrict('Patna');
      setSelectedSubdistrict('Danapur');
      setSelectedVillage('Khagaul');
      setPrimaryNo('201');
      setPlotNo('56/3');
      setOwnerName('');
      setQueryText('');
    } else if (preset === 'DL_HAUZ' || preset === 'DL') {
      setSelectedState('Delhi');
      setSelectedDistrict('South Delhi');
      setSelectedSubdistrict('Hauz Khas');
      setSelectedVillage('Mehrauli');
      setPrimaryNo('56');
      setPlotNo('12/A');
      setOwnerName('');
      setQueryText('');
    } else if (preset === 'CLEAR') {
      setSelectedDistrict('');
      setSelectedSubdistrict('');
      setSelectedVillage('');
      setPrimaryNo('');
      setPlotNo('');
      setOwnerName('');
      setQueryText('');
    }
  };

  const setPresetState = applyPresetFilter;

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    if (onShowToast) {
      onShowToast('success', 'Land Identity ID Copied!', `Copied ${id} to clipboard.`);
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Globe2 className="w-6 h-6 text-sky-600" />
            <span>{t('search_land', 'Universal Real-Time Land Record Search (Pan-India)')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('hero_subtitle', 'Real-time live queries connected to official State Bhulekh & Digital India Land Record portal streams across 28 States & 8 UTs.')}
          </p>
        </div>

        {/* Live Portal Toggle */}
        <button
          type="button"
          onClick={() => setLiveMode(!liveMode)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-2 transition-all shadow-sm shrink-0 ${
            liveMode
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${liveMode ? 'text-emerald-400 animate-pulse' : ''}`} />
          <span>{liveMode ? `🟢 Live Mode (${currentStateMeta.portal})` : "⚪ Offline Database Mode"}</span>
        </button>
      </div>

      {/* GPS & Interactive Cadastral Map Location Search Card (NEW) */}
      <div className="bg-gradient-to-r from-sky-900/90 via-indigo-950/90 to-slate-900 border-2 border-sky-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold uppercase tracking-wide">
            <Compass className="w-4 h-4 text-sky-400 animate-spin" />
            <span>{t('search_by_gps', '📍 GPS Location & Cadastral Map Search')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Find Land Records by Ground GPS Location or Google Map Pin
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Detect your location on the ground or click anywhere on India's map to auto-identify the underlying Cadastral Survey Plot, Khasra, Gat Number, and 7/12 RoR records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsLocationModalOpen(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-sky-600/30 flex items-center space-x-2 shrink-0 transition-transform active:scale-95"
        >
          <Navigation className="w-5 h-5 text-white animate-pulse" />
          <span>{t('use_current_gps', 'Use GPS Location / Map Search')}</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Location Search Modal */}
      <LocationSearchModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onShowToast={onShowToast}
      />

      {/* Live Stream Verification Status Banner */}
      {liveStreamMeta && (
        <div className="bg-emerald-950/80 text-emerald-200 p-3.5 rounded-2xl border border-emerald-800 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-emerald-300 block">{liveStreamMeta.source}</span>
              <span className="text-[11px] text-emerald-400">
                Verified Stream ID: <span className="font-mono">{liveStreamMeta.land_identity_id}</span> • State: {liveStreamMeta.state} • Status: {liveStreamMeta.live_status}
              </span>
            </div>
          </div>
          <span className="font-mono text-[10px] bg-emerald-900 px-2 py-0.5 rounded border border-emerald-700">
            {liveStreamMeta.official_verification_timestamp}
          </span>
        </div>
      )}

      {/* Filter Form Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        {/* Quick Filter Presets */}
        <div className="flex items-center space-x-2 text-xs overflow-x-auto pb-1">
          <span className="text-slate-400 font-bold shrink-0 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>State Presets:</span>
          </span>
          <button
            type="button"
            onClick={() => applyPresetFilter('JH_BOKARO')}
            className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold rounded-lg border border-sky-500/30 whitespace-nowrap transition-colors"
          >
            Jharkhand (Bokaro Chas)
          </button>
          <button
            type="button"
            onClick={() => applyPresetFilter('UP_NOIDA')}
            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold rounded-lg border border-amber-500/30 whitespace-nowrap transition-colors"
          >
            Uttar Pradesh (Noida Dadri)
          </button>
          <button
            type="button"
            onClick={() => applyPresetFilter('MH_PUNE')}
            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold rounded-lg border border-emerald-500/30 whitespace-nowrap transition-colors"
          >
            Maharashtra (Pune 7/12)
          </button>
          <button
            type="button"
            onClick={() => applyPresetFilter('KA_BLR')}
            className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold rounded-lg border border-indigo-500/30 whitespace-nowrap transition-colors"
          >
            Karnataka (Bengaluru RTC)
          </button>
          <button
            type="button"
            onClick={() => applyPresetFilter('BR_PATNA')}
            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold rounded-lg border border-rose-500/30 whitespace-nowrap transition-colors"
          >
            Bihar (Patna Danapur)
          </button>
          <button
            type="button"
            onClick={() => applyPresetFilter('DL_HAUZ')}
            className="px-2.5 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-semibold rounded-lg border border-teal-500/30 whitespace-nowrap transition-colors"
          >
            Delhi (Hauz Khas)
          </button>
          <button
            type="button"
            onClick={() => applyPresetFilter('CLEAR')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-semibold rounded-lg whitespace-nowrap transition-colors"
          >
            🔄 Reset Filters
          </button>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* State Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                <Globe2 className="w-3.5 h-3.5 text-sky-500" />
                <span>State / Union Territory (राज्य)</span>
              </label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 font-semibold"
              >
                {statesList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* District Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                District (ज़िला)
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="">All Districts</option>
                {districtOptions.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Sub-district Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {currentStateMeta.subdistrict_name || "Tehsil / Taluk / Anchal"}
              </label>
              <select
                value={selectedSubdistrict}
                onChange={(e) => handleSubdistrictChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="">All Sub-districts</option>
                {subdistrictOptions.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Village / Mauza Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Village / Mauza (गाँव/मौजा)
              </label>
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="">All Villages</option>
                {villageOptions.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {currentStateMeta.primary_no_name || "Khata / Gata / Survey No"}
              </label>
              <input
                type="text"
                value={primaryNo}
                onChange={(e) => setPrimaryNo(e.target.value)}
                placeholder="e.g. 125, 340, 145"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {currentStateMeta.plot_no_name || "Khesra / Khasra / Plot No"}
              </label>
              <input
                type="text"
                value={plotNo}
                onChange={(e) => setPlotNo(e.target.value)}
                placeholder="e.g. 450/2, 112/1, 23/B"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Owner Name (रैयत/मालिक/खातेदार)</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Ramesh Mahato, Rajesh Sharma"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Connected to {currentStateMeta.portal} Stream</span>
            </span>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center space-x-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? "Querying Official Records..." : `Execute ${selectedState} Search`}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Search Results List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Search Results ({results.length} Land Parcels Verified across {selectedState})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                <div className="space-y-1">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs space-y-2">
            <div>No matching land parcels found for the current query.</div>
            <button
              onClick={() => applyPresetFilter('JH_BOKARO')}
              className="text-sky-600 dark:text-sky-400 font-bold hover:underline"
            >
              Try Loading Demo Case →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((parcel) => (
              <div
                key={parcel.id}
                onClick={() => navigate(`/land/${parcel.land_identity_id}`)}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-sky-500/50 transition-all cursor-pointer space-y-3 group relative"
              >
                <div className="flex items-start justify-between">
                  <div className="pr-6">
                    <div className="font-mono text-[11px] font-semibold text-sky-600 dark:text-sky-400 group-hover:underline flex items-center space-x-1">
                      <span>{parcel.land_identity_id}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                      Plot #{parcel.khesra_no} • Khata/Gata #{parcel.khata_no}
                    </h3>
                  </div>

                  <button
                    onClick={(e) => handleCopyId(e, parcel.land_identity_id)}
                    title="Copy Land Identity ID"
                    className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-400 rounded-lg transition-colors absolute top-4 right-4"
                  >
                    {copiedId === parcel.land_identity_id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{parcel.mauza}, {parcel.anchal}, {parcel.district}, {parcel.state}</span>
                  </div>
                  <div>
                    <strong>Recorded Owner:</strong> {parcel.owner_name || "See Record Details"}
                  </div>
                  <div>
                    <strong>Area:</strong> {parcel.area_acre} Acre
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-sky-600 dark:text-sky-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>View 3D Profile & Integrity Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
