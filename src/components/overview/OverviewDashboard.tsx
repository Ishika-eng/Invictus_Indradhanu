import React from 'react';
import { Sparkles, Radio, ArrowRight, ShieldCheck } from 'lucide-react';
import { MetricCards } from './MetricCards';
import { ClimateHeroCard } from './ClimateHeroCard';
import { MicroRegionMap } from './MicroRegionMap';
import { QuickAdvisoryList } from './QuickAdvisoryList';
import { WorkflowProgress } from '../layout/WorkflowProgress';
import { useAdvisory } from '../../context/AdvisoryContext';

export const OverviewDashboard: React.FC = () => {
  const { setActiveTab } = useAdvisory();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* End-to-end Pipeline Stepper */}
      <WorkflowProgress currentStage="input" />

      {/* Top 4 Impact Metric Cards */}
      <MetricCards />

      {/* Primary Climate Hero Card */}
      <ClimateHeroCard />

      {/* Dual Grid: Regional Micro-Zone Map & Live Broadcast Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MicroRegionMap />
        <QuickAdvisoryList />
      </div>
    </div>
  );
};
