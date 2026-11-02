import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import OverviewView from './components/OverviewView';
import LiveMapView from './components/LiveMapView';
import RoutePlannerView from './components/RoutePlannerView';
import HazardsView from './components/HazardsView';
import SheltersView from './components/SheltersView';
import NoticesView from './components/NoticesView';
import { fetchOverview, fetchState, planRoute } from './api';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewData, setOverviewData] = useState(null);
  const [stateData, setStateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Common routing & selection state
  const [startPoint, setStartPoint] = useState([30.7333, 76.7794]); // Default Sector 17 Plaza
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [routesData, setRoutesData] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [ov, st] = await Promise.all([fetchOverview(), fetchState()]);
      setOverviewData(ov);
      setStateData(st);
      setError(null);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000); // 8 second background refresh
    return () => clearInterval(interval);
  }, [loadData]);

  // Shortcut to route directly to a specific shelter
  const handleSelectShelterForRouting = async (shelter) => {
    setSelectedShelter(shelter);
    setActiveTab('planner');
    if (startPoint) {
      try {
        const res = await planRoute({
          start_lat: startPoint[0],
          start_lng: startPoint[1],
          shelter_id: shelter.id,
          auto_select_shelter: false,
        });
        setRoutesData(res);
      } catch (e) {
        console.warn('Failed auto-calculating route for selected shelter', e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-ops-bg text-ops-text flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Operations Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        overviewData={overviewData}
        onRefresh={loadData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && !overviewData ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-4 text-slate-400">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="font-mono text-sm tracking-wide">
              CONNECTING TO EVACUATION OPERATIONS COMMAND CENTER...
            </p>
          </div>
        ) : error && !overviewData ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center space-y-4 max-w-xl mx-auto my-12">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
            <h3 className="font-bold text-lg text-white">Connection to Emergency Server Failed</h3>
            <p className="text-sm text-slate-300">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewView
                overviewData={overviewData}
                stateData={stateData}
                onNavigateTab={setActiveTab}
                onSelectShelterForRouting={handleSelectShelterForRouting}
              />
            )}

            {activeTab === 'map' && (
              <LiveMapView
                stateData={stateData}
                onRefresh={loadData}
                onNavigateTab={setActiveTab}
                startPoint={startPoint}
                setStartPoint={setStartPoint}
                onSelectShelterForRouting={handleSelectShelterForRouting}
              />
            )}

            {activeTab === 'planner' && (
              <RoutePlannerView
                stateData={stateData}
                startPoint={startPoint}
                setStartPoint={setStartPoint}
                selectedShelter={selectedShelter}
                setSelectedShelter={setSelectedShelter}
                routesData={routesData}
                setRoutesData={setRoutesData}
              />
            )}

            {activeTab === 'hazards' && (
              <HazardsView
                stateData={stateData}
                onRefresh={loadData}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'shelters' && (
              <SheltersView
                stateData={stateData}
                onRefresh={loadData}
                onSelectShelterForRouting={handleSelectShelterForRouting}
              />
            )}

            {activeTab === 'notices' && (
              <NoticesView
                stateData={stateData}
                onRefresh={loadData}
              />
            )}
          </>
        )}
      </main>

      {/* Operations Footer */}
      <footer className="border-t border-ops-border/60 bg-ops-surface py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            EvacAI v2.0 • Tactical Evacuation Operations Management Platform
          </div>
          <div className="text-slate-400">
            SIMULATED DEMONSTRATION DATA • CONFIRM ALL INSTRUCTIONS WITH CIVIL DEFENSE AUTHORITIES
          </div>
        </div>
      </footer>
    </div>
  );
}

