import React, { useState } from 'react';
import { ChevronDown, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { 
  getNextStages, 
  getStageConfig, 
  getStageColorClasses,
  getDaysInStage,
  PIPELINE_STAGES 
} from './pipelineConfig';

const QuickActions = ({ currentStage, stageChangedDate, onStageChange, onDropdownToggle, className = '' }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const nextStages = getNextStages(currentStage);
  const daysInStage = getDaysInStage(stageChangedDate);
  
  // Determine if stage is taking too long
  const isStale = daysInStage > 14;
  const isVeryStale = daysInStage > 30;

  const handleQuickAction = (newStage) => {
    onStageChange(newStage);
    setShowDropdown(false);
    if (onDropdownToggle) onDropdownToggle(false);
  };

  const toggleDropdown = () => {
    const newState = !showDropdown;
    setShowDropdown(newState);
    if (onDropdownToggle) onDropdownToggle(newState);
  };

  if (nextStages.length === 0) {
    return (
      <div className={`quick-actions ${className}`}>
        <div className="text-xs text-gray-500 italic">Process Complete</div>
      </div>
    );
  }

  // Get the most likely next stage (first in list for quick action)
  const quickNextStage = nextStages[0];
  const quickStageConfig = getStageConfig(quickNextStage);
  const quickColors = getStageColorClasses(quickNextStage);

  return (
    <div className={`quick-actions ${className}`}>
      {/* Days in Stage Indicator */}
      <div className="flex items-center gap-2 mb-2 text-xs">
        <Clock className="w-3 h-3 text-gray-400" />
        <span className={`${isVeryStale ? 'text-red-600 font-medium' : isStale ? 'text-amber-600' : 'text-gray-500'}`}>
          {daysInStage} days in stage
        </span>
        {isStale && (
          <AlertCircle className={`w-3 h-3 ${isVeryStale ? 'text-red-500' : 'text-amber-500'}`} />
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Action Button - Most Likely Next Stage */}
        <button
          onClick={() => handleQuickAction(quickNextStage)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 ${quickColors.bg} ${quickColors.text} border ${quickColors.border} hover:shadow-md`}
          title={`Move to ${quickStageConfig.label}`}
        >
          <ArrowRight className="w-3 h-3" />
          <span>{quickStageConfig.label}</span>
        </button>

        {/* Dropdown for All Options */}
        {nextStages.length > 1 && (
          <div className={`relative ${showDropdown ? 'dropdown-active' : ''}`} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all border border-gray-200"
              title="More options"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] min-w-48">
                <div className="p-1">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                    Move to Stage:
                  </div>
                  {nextStages.map((stage) => {
                    const config = getStageConfig(stage);
                    const colors = getStageColorClasses(stage);
                    
                    return (
                      <button
                        key={stage}
                        onClick={() => handleQuickAction(stage)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-gray-50 rounded transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full ${colors.bg.replace('bg-', 'bg-').replace('-100', '-400')}`} />
                        <div>
                          <div className="font-medium text-gray-900">{config.label}</div>
                          <div className="text-gray-500">{config.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const StageSelector = ({ 
  currentStage, 
  onStageChange, 
  showAllStages = false,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const availableStages = showAllStages 
    ? Object.keys(PIPELINE_STAGES)
    : getNextStages(currentStage);

  const currentConfig = getStageConfig(currentStage);
  const currentColors = getStageColorClasses(currentStage);

  const handleStageSelect = (stage) => {
    onStageChange(stage);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${currentColors.bg} ${currentColors.text} ${currentColors.border} hover:shadow-md`}
      >
        <span>{currentConfig.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-64 overflow-y-auto">
          <div className="p-1">
            {availableStages.map((stage) => {
              const config = getStageConfig(stage);
              const colors = getStageColorClasses(stage);
              const isSelected = stage === currentStage;
              
              return (
                <button
                  key={stage}
                  onClick={() => handleStageSelect(stage)}
                  disabled={isSelected}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded transition-colors ${
                    isSelected 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${colors.bg.replace('bg-', 'bg-').replace('-100', '-400')}`} />
                  <div className="flex-1">
                    <div className="font-medium">{config.label}</div>
                    <div className="text-xs text-gray-500">{config.description}</div>
                  </div>
                  {isSelected && (
                    <div className="text-xs text-gray-400">Current</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
