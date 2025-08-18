// Pipeline configuration and utility functions
export const PIPELINE_STAGES = {
  // Application Phase
  'Applied': {
    phase: 'application',
    label: 'Applied',
    description: 'Just submitted application',
    color: 'blue',
    icon: 'Send',
    order: 1
  },
  'Application Under Review': {
    phase: 'application',
    label: 'Under Review',
    description: 'Application confirmed received, being reviewed',
    color: 'blue',
    icon: 'Eye',
    order: 2
  },
  'Application Rejected': {
    phase: 'application',
    label: 'App Rejected',
    description: 'Rejected at application stage',
    color: 'red',
    icon: 'X',
    order: 3
  },

  // Interview Phase
  'Phone Screen Scheduled': {
    phase: 'interview',
    label: 'Phone Scheduled',
    description: 'Initial recruiter call scheduled',
    color: 'yellow',
    icon: 'Phone',
    order: 4
  },
  'Phone Screen Completed': {
    phase: 'interview',
    label: 'Phone Completed',
    description: 'Passed phone screen',
    color: 'yellow',
    icon: 'PhoneCall',
    order: 5
  },
  'Technical Interview Scheduled': {
    phase: 'interview',
    label: 'Tech Scheduled',
    description: 'Technical round scheduled',
    color: 'orange',
    icon: 'Code',
    order: 6
  },
  'Technical Interview Completed': {
    phase: 'interview',
    label: 'Tech Completed',
    description: 'Passed technical round',
    color: 'orange',
    icon: 'CheckCircle',
    order: 7
  },
  'Onsite/Final Interview Scheduled': {
    phase: 'interview',
    label: 'Final Scheduled',
    description: 'Final interviews scheduled',
    color: 'amber',
    icon: 'Users',
    order: 8
  },
  'Final Interview Completed': {
    phase: 'interview',
    label: 'Final Completed',
    description: 'Completed all interviews',
    color: 'amber',
    icon: 'Award',
    order: 9
  },

  // Decision Phase
  'Reference Check': {
    phase: 'decision',
    label: 'References',
    description: 'Checking references',
    color: 'purple',
    icon: 'UserCheck',
    order: 10
  },
  'Offer Negotiation': {
    phase: 'decision',
    label: 'Negotiating',
    description: 'Negotiating offer terms',
    color: 'green',
    icon: 'DollarSign',
    order: 11
  },
  'Offer Accepted': {
    phase: 'decision',
    label: 'Accepted',
    description: 'Accepted the offer',
    color: 'emerald',
    icon: 'CheckCircle2',
    order: 12
  },
  'Offer Declined': {
    phase: 'decision',
    label: 'Declined',
    description: 'Declined the offer',
    color: 'orange',
    icon: 'XCircle',
    order: 13
  },
  'Rejected After Interview': {
    phase: 'decision',
    label: 'Rejected',
    description: 'Rejected after interview process',
    color: 'red',
    icon: 'X',
    order: 14
  },

  // Other
  'On Hold': {
    phase: 'other',
    label: 'On Hold',
    description: 'Process paused',
    color: 'gray',
    icon: 'Pause',
    order: 15
  },
  'Withdrawn by Candidate': {
    phase: 'other',
    label: 'Withdrawn',
    description: 'I withdrew from process',
    color: 'gray',
    icon: 'ArrowLeft',
    order: 16
  }
};

export const PIPELINE_PHASES = {
  application: {
    label: 'Application',
    color: 'blue',
    description: 'Application submission and review'
  },
  interview: {
    label: 'Interviews',
    color: 'yellow',
    description: 'Interview process stages'
  },
  decision: {
    label: 'Decision',
    color: 'green',
    description: 'Final decision and offer stage'
  },
  other: {
    label: 'Other',
    color: 'gray',
    description: 'Paused or withdrawn'
  }
};

// Get stages for a specific phase
export const getStagesByPhase = (phase) => {
  return Object.entries(PIPELINE_STAGES)
    .filter(([_, config]) => config.phase === phase)
    .sort(([_, a], [__, b]) => a.order - b.order);
};

// Get all stages in order
export const getAllStagesInOrder = () => {
  return Object.entries(PIPELINE_STAGES)
    .sort(([_, a], [__, b]) => a.order - b.order);
};

// Get possible next stages for current stage
export const getNextStages = (currentStage) => {
  const current = PIPELINE_STAGES[currentStage];
  if (!current) return [];

  const currentOrder = current.order;
  
  // Define possible transitions
  const transitions = {
    'Applied': ['Application Under Review', 'Application Rejected', 'Phone Screen Scheduled', 'Withdrawn by Candidate'],
    'Application Under Review': ['Phone Screen Scheduled', 'Application Rejected', 'On Hold'],
    'Application Rejected': [], // Terminal state
    'Phone Screen Scheduled': ['Phone Screen Completed', 'Rejected After Interview', 'On Hold', 'Withdrawn by Candidate'],
    'Phone Screen Completed': ['Technical Interview Scheduled', 'Onsite/Final Interview Scheduled', 'Offer Negotiation', 'Rejected After Interview'],
    'Technical Interview Scheduled': ['Technical Interview Completed', 'Rejected After Interview', 'On Hold', 'Withdrawn by Candidate'],
    'Technical Interview Completed': ['Onsite/Final Interview Scheduled', 'Reference Check', 'Offer Negotiation', 'Rejected After Interview'],
    'Onsite/Final Interview Scheduled': ['Final Interview Completed', 'Rejected After Interview', 'On Hold', 'Withdrawn by Candidate'],
    'Final Interview Completed': ['Reference Check', 'Offer Negotiation', 'Rejected After Interview'],
    'Reference Check': ['Offer Negotiation', 'Rejected After Interview'],
    'Offer Negotiation': ['Offer Accepted', 'Offer Declined', 'Rejected After Interview'],
    'Offer Accepted': [], // Terminal state
    'Offer Declined': [], // Terminal state
    'Rejected After Interview': [], // Terminal state
    'On Hold': ['Phone Screen Scheduled', 'Technical Interview Scheduled', 'Onsite/Final Interview Scheduled', 'Withdrawn by Candidate'],
    'Withdrawn by Candidate': [] // Terminal state
  };

  return transitions[currentStage] || [];
};

// Get stage configuration
export const getStageConfig = (stage) => {
  return PIPELINE_STAGES[stage] || PIPELINE_STAGES['Applied'];
};

// Get phase configuration
export const getPhaseConfig = (phase) => {
  return PIPELINE_PHASES[phase] || PIPELINE_PHASES['other'];
};

// Calculate days in current stage
export const getDaysInStage = (stageChangedDate) => {
  if (!stageChangedDate) return 0;
  const now = new Date();
  const stageDate = new Date(stageChangedDate);
  const diffTime = Math.abs(now - stageDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Calculate pipeline progress percentage
export const calculateProgress = (currentStage) => {
  const config = getStageConfig(currentStage);
  const maxOrder = Math.max(...Object.values(PIPELINE_STAGES).map(s => s.order));
  
  // Terminal negative states should show as "complete" but failed
  const terminalNegative = ['Application Rejected', 'Rejected After Interview', 'Offer Declined', 'Withdrawn by Candidate'];
  if (terminalNegative.includes(currentStage)) {
    return { percentage: 100, isSuccess: false };
  }
  
  // Terminal positive states
  if (currentStage === 'Offer Accepted') {
    return { percentage: 100, isSuccess: true };
  }
  
  // Calculate based on order
  const percentage = Math.round((config.order / maxOrder) * 100);
  return { percentage, isSuccess: null }; // null means in progress
};

// Get color classes for Tailwind CSS
export const getStageColorClasses = (stage) => {
  const config = getStageConfig(stage);
  const colorMap = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: 'text-blue-500'
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      icon: 'text-yellow-500'
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-200',
      icon: 'text-orange-500'
    },
    amber: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: 'text-amber-500'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      icon: 'text-green-500'
    },
    emerald: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: 'text-emerald-500'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      border: 'border-purple-200',
      icon: 'text-purple-500'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      icon: 'text-red-500'
    },
    gray: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
      icon: 'text-gray-500'
    }
  };
  
  return colorMap[config.color] || colorMap.gray;
};
