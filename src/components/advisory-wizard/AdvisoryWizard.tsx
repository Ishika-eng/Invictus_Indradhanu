import React, { useState } from 'react';
import { 
  User, 
  Sprout, 
  Sparkles, 
  Layers, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { StepFarmer } from './StepFarmer';
import { StepCrop } from './StepCrop';
import { StepGenerating } from './StepGenerating';
import { WorkflowProgress } from '../layout/WorkflowProgress';

export const AdvisoryWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const steps = [
    { num: 1, title: 'Farmer Profile & Location', icon: User },
    { num: 2, title: 'Crop Context & Soil Physics', icon: Sprout },
    { num: 3, title: 'AI Climate Synthesis', icon: Sparkles },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Visual Smallholder Journey Pipe */}
      <WorkflowProgress currentStage={currentStep === 1 ? 'input' : currentStep === 2 ? 'climate' : 'analysis'} />

      {/* Main Wizard Card */}
      <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-6 sm:p-8">
        
        {/* Step Indicator Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-agri-700 bg-agri-50 px-2.5 py-1 rounded-lg border border-agri-200">
                Advisory Formulation Engine
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-moss-900 tracking-tight mt-1.5">
                Generate Hyperlocal Farm Advisory
              </h2>
              <p className="text-xs sm:text-sm text-moss-500 mt-1">
                Guided workflow converting live weather telemetry and field conditions into actionable regional advice.
              </p>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 bg-canvas-100 px-3 py-1.5 rounded-xl border border-canvas-300 text-xs font-bold text-moss-700">
              <span>Step {currentStep} of 3</span>
            </div>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6">
            {steps.map((s) => {
              const Icon = s.icon;
              const isPassed = currentStep > s.num;
              const isCurrent = currentStep === s.num;

              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setCurrentStep(s.num as 1 | 2 | 3)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-2.5 ${
                    isCurrent
                      ? 'bg-agri-700 text-white border-agri-700 shadow-soft font-bold'
                      : isPassed
                      ? 'bg-agri-50/80 text-agri-950 border-agri-300 hover:bg-agri-100'
                      : 'bg-canvas-100/60 text-moss-400 border-canvas-300 hover:bg-canvas-200'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                    isCurrent ? 'bg-white text-agri-900 font-extrabold' : isPassed ? 'bg-agri-200 text-agri-800 font-bold' : 'bg-canvas-200 text-moss-500'
                  }`}>
                    {isPassed ? <CheckCircle2 className="w-4 h-4 text-agri-700" /> : s.num}
                  </div>
                  <div className="hidden md:block truncate">
                    <p className={`text-xs font-bold truncate ${isCurrent ? 'text-white' : 'text-moss-900'}`}>{s.title}</p>
                    <p className={`text-[10px] truncate ${isCurrent ? 'text-agri-200' : 'text-moss-500'}`}>
                      {s.num === 1 ? 'Location & dialect' : s.num === 2 ? 'Stage & moisture' : 'LLM reasoning'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Body */}
        {currentStep === 1 && (
          <StepFarmer onNext={() => setCurrentStep(2)} />
        )}

        {currentStep === 2 && (
          <StepCrop 
            onBack={() => setCurrentStep(1)} 
            onNext={() => setCurrentStep(3)} 
          />
        )}

        {currentStep === 3 && (
          <StepGenerating onBack={() => setCurrentStep(2)} />
        )}
      </div>
    </div>
  );
};
