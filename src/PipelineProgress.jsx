import React from 'react';
import { 
  Send, Eye, X, Phone, PhoneCall, Code, CheckCircle, Users, Award, 
  UserCheck, DollarSign, CheckCircle2, XCircle, Pause, ArrowLeft 
} from 'lucide-react';
import { 
  getStageConfig, 
  getPhaseConfig, 
  calculateProgress, 
  getStageColorClasses,
  PIPELINE_PHASES 
} from './pipelineConfig';

// Icon mapping
const iconMap = {
  Send, Eye, X, Phone, PhoneCall, Code, CheckCircle, Users, Award,
  UserCheck, DollarSign, CheckCircle2, XCircle, Pause, ArrowLeft
};

const PipelineProgress = ({ currentStage, className = '' }) => {
  const stageConfig = getStageConfig(currentStage);
  const progress = calculateProgress(currentStage);
  const colors = getStageColorClasses(currentStage);
  const IconComponent = iconMap[stageConfig.icon] || Send;

  return (
    <div className={`pipeline-progress ${className}`}>
      {/* Stage Badge with Icon */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
        <IconComponent className={`w-3.5 h-3.5 ${colors.icon}`} />
        <span>{stageConfig.label}</span>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Pipeline Progress</span>
          <span>{progress.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out ${
              progress.isSuccess === true ? 'bg-emerald-500' :
              progress.isSuccess === false ? 'bg-red-500' :
              'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export const PipelinePhaseIndicator = ({ currentStage, compact = false }) => {
  const stageConfig = getStageConfig(currentStage);
  const phaseConfig = getPhaseConfig(stageConfig.phase);
  
  const phaseColors = {
    application: 'bg-blue-50 text-blue-700 border-blue-200',
    interview: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    decision: 'bg-green-50 text-green-700 border-green-200',
    other: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${phaseColors[stageConfig.phase]}`}>
        {phaseConfig.label}
      </div>
    );
  }

  return (
    <div className="pipeline-phases">
      <div className="flex gap-2 mb-3">
        {Object.entries(PIPELINE_PHASES).map(([phaseKey, phase]) => {
          const isActive = phaseKey === stageConfig.phase;
          const isPassed = Object.values(PIPELINE_PHASES).indexOf(phase) < 
                          Object.values(PIPELINE_PHASES).indexOf(phaseConfig);
          
          return (
            <div
              key={phaseKey}
              className={`flex-1 px-3 py-2 rounded-lg text-center text-xs font-medium border transition-all ${
                isActive 
                  ? phaseColors[phaseKey]
                  : isPassed 
                    ? 'bg-green-50 text-green-600 border-green-200'
                    : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}
            >
              {phase.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PipelineTimeline = ({ stageHistory = [] }) => {
  if (!stageHistory.length) return null;

  return (
    <div className="pipeline-timeline mt-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Stage History</h4>
      <div className="space-y-3">
        {stageHistory.map((entry, index) => {
          const stageConfig = getStageConfig(entry.stage);
          const colors = getStageColorClasses(entry.stage);
          const IconComponent = iconMap[stageConfig.icon] || Send;
          const isLatest = index === stageHistory.length - 1;

          return (
            <div key={index} className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colors.bg} ${isLatest ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
                <IconComponent className={`w-4 h-4 ${colors.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{stageConfig.label}</p>
                  {isLatest && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString()}
                </p>
                {entry.notes && (
                  <p className="text-xs text-gray-600 mt-1">{entry.notes}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineProgress;
