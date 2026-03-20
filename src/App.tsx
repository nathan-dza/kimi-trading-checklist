import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  RotateCcw, 
  Plus, 
  Trash2, 
  X, 
  Check, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Target,
  BarChart3,
  Layers,
  Zap,
  Shield,
  ChevronUp,
  ChevronDown,
  Edit2,
  Play,
  ListChecks,
  Award,
  BookOpen,
  GripVertical
} from 'lucide-react';
import type { 
  Criterion, 
  Answer, 
  LetterGrade
} from './types';
import { 
  DEFAULT_CRITERIA, 
  calculateGrade,
  IMPORTANCE_LABELS,
  getImportanceColor
} from './types';
import './App.css';

// Storage key
const STORAGE_KEY = 'trading-edge-evaluator-criteria';

// Letter grade colors
const gradeColors: Record<LetterGrade, string> = {
  'A+': '#4ade80',
  'A': '#4ade80',
  'A-': '#4ade80',
  'B+': '#7fa3ff',
  'B': '#7fa3ff',
  'B-': '#7fa3ff',
  'C+': '#fbbf24',
  'C': '#fbbf24',
  'C-': '#fbbf24',
  'D+': '#fb923c',
  'D': '#fb923c',
  'D-': '#fb923c',
  'F': '#f87171',
};

function App() {
  // State
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load criteria from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCriteria(parsed);
      } catch {
        setCriteria(DEFAULT_CRITERIA);
      }
    } else {
      setCriteria(DEFAULT_CRITERIA);
    }
  }, []);

  // Save criteria to localStorage
  useEffect(() => {
    if (criteria.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(criteria));
    }
  }, [criteria]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEvaluating || showReport || showManageModal) return;
      
      if (e.key === 'y' || e.key === 'Y') {
        handleAnswer(true);
      } else if (e.key === 'n' || e.key === 'N') {
        handleAnswer(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEvaluating, currentStep, showReport, showManageModal]);

  const handleStartEvaluation = () => {
    setIsEvaluating(true);
    setCurrentStep(0);
    setAnswers([]);
    setShowReport(false);
  };

  const handleAnswer = (value: boolean) => {
    const newAnswer: Answer = {
      criterionId: criteria[currentStep].id,
      value,
    };
    
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentStep < criteria.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowReport(true);
    }
  };

  const handleRestart = () => {
    setIsEvaluating(false);
    setShowReport(false);
    setCurrentStep(0);
    setAnswers([]);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setAnswers(prev => prev.slice(0, -1));
    }
  };

  const addCriterion = (question: string, impact: 'positive' | 'negative', importance: number) => {
    const newCriterion: Criterion = {
      id: Date.now().toString(),
      question,
      impact,
      importance: importance as 1 | 2 | 3 | 4 | 5,
      weight: importance,
    };
    setCriteria(prev => [...prev, newCriterion]);
  };

  const updateCriterion = (id: string, updates: Partial<Criterion>) => {
    setCriteria(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const removeCriterion = (id: string) => {
    setCriteria(prev => prev.filter(c => c.id !== id));
  };

  const moveCriterion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === criteria.length - 1) return;
    
    const newCriteria = [...criteria];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newCriteria[index], newCriteria[newIndex]] = [newCriteria[newIndex], newCriteria[index]];
    setCriteria(newCriteria);
  };

  const gradeResult = showReport ? calculateGrade(answers, criteria) : null;

  // Calculate stats for dashboard
  const positiveCriteria = criteria.filter(c => c.impact === 'positive').length;
  const negativeCriteria = criteria.filter(c => c.impact === 'negative').length;
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const avgImportance = criteria.length > 0 ? (totalWeight / criteria.length).toFixed(1) : '0';

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#f2f5f8] overflow-x-hidden">
      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b border-[rgba(242,245,248,0.06)]">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#7fa3ff]/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#7fa3ff]" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block">Trading Edge Evaluator</span>
              <span className="text-xs text-[#a6afb8]">ICT Strategy Dashboard</span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {!isEvaluating && !showReport && (
              <button
                onClick={() => setShowManageModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[rgba(242,245,248,0.05)] hover:bg-[rgba(242,245,248,0.1)] rounded-lg text-sm font-medium transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Manage Strategy</span>
              </button>
            )}
            {(isEvaluating || showReport) && (
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 px-4 py-2.5 bg-[rgba(242,245,248,0.05)] hover:bg-[rgba(242,245,248,0.1)] rounded-lg text-sm font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Restart</span>
              </button>
            )}
          </motion.div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative pt-24 pb-12">
        
        {/* Dashboard Overview */}
        {!isEvaluating && !showReport && (
          <div className="px-6">
            <div className="max-w-7xl mx-auto">
              
              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              >
                <StatCard 
                  icon={ListChecks} 
                  label="Total Criteria" 
                  value={criteria.length.toString()} 
                  color="#7fa3ff"
                />
                <StatCard 
                  icon={TrendingUp} 
                  label="Positive" 
                  value={positiveCriteria.toString()} 
                  color="#4ade80"
                />
                <StatCard 
                  icon={TrendingDown} 
                  label="Negative" 
                  value={negativeCriteria.toString()} 
                  color="#f87171"
                />
                <StatCard 
                  icon={Award} 
                  label="Avg Weight" 
                  value={avgImportance} 
                  color="#fbbf24"
                />
              </motion.div>

              {/* Main Dashboard Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Left Column - Start Evaluation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="lg:col-span-2"
                >
                  <div className="glass-card p-8 h-full flex flex-col justify-center">
                    <div className="flex items-start gap-6 mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7fa3ff]/20 to-[#7fa3ff]/5 flex items-center justify-center flex-shrink-0">
                        <Play className="w-8 h-8 text-[#7fa3ff]" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold mb-2">Ready to Evaluate?</h2>
                        <p className="text-[#a6afb8] text-lg">
                          Run through your {criteria.length} criteria and get an instant grade on your setup.
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleStartEvaluation}
                      className="btn-primary text-lg px-10 py-5 w-full sm:w-auto self-start flex items-center justify-center gap-3"
                    >
                      <Play className="w-5 h-5" />
                      Start Evaluation
                    </button>

                    <div className="mt-8 pt-6 border-t border-[rgba(242,245,248,0.08)] flex items-center gap-6 text-sm text-[#a6afb8]">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        ~{criteria.length * 8}s to complete
                      </span>
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        Keyboard shortcuts (Y/N)
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Right Column - Quick Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Importance Distribution */}
                  <div className="glass-card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#7fa3ff]" />
                      Importance Distribution
                    </h3>
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map(level => {
                        const count = criteria.filter(c => c.importance === level).length;
                        const percentage = criteria.length > 0 ? (count / criteria.length) * 100 : 0;
                        return (
                          <div key={level} className="flex items-center gap-3">
                            <span className="text-xs text-[#a6afb8] w-16">{IMPORTANCE_LABELS[level]}</span>
                            <div className="flex-1 h-2 bg-[rgba(242,245,248,0.08)] rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: getImportanceColor(level)
                                }}
                              />
                            </div>
                            <span className="text-xs text-[#a6afb8] w-6 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Activity Placeholder */}
                  <div className="glass-card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#fbbf24]" />
                      Quick Tips
                    </h3>
                    <ul className="space-y-3 text-sm text-[#a6afb8]">
                      <li className="flex items-start gap-2">
                        <ChevronUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Higher importance criteria have more impact on your grade
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Negative criteria count when you answer "No"
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        A+ setups need 97%+ score with strong confluence
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </div>

              {/* Criteria Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-[#7fa3ff]" />
                    Your Criteria
                  </h3>
                  <button
                    onClick={() => setShowManageModal(true)}
                    className="text-sm text-[#7fa3ff] hover:underline"
                  >
                    Edit All
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {criteria.slice(0, 6).map((criterion, index) => (
                    <motion.div
                      key={criterion.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="glass-card p-4 hover:bg-[rgba(242,245,248,0.05)] transition-colors cursor-pointer"
                      onClick={() => setShowManageModal(true)}
                    >
                      <div className="flex items-start gap-3">
                        <span 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ 
                            backgroundColor: `${getImportanceColor(criterion.importance)}20`,
                            color: getImportanceColor(criterion.importance)
                          }}
                        >
                          {criterion.importance}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{criterion.question}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              criterion.impact === 'positive' 
                                ? 'bg-green-500/10 text-green-400' 
                                : 'bg-red-500/10 text-red-400'
                            }`}>
                              {criterion.impact}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {criteria.length > 6 && (
                    <div 
                      className="glass-card p-4 flex items-center justify-center cursor-pointer hover:bg-[rgba(242,245,248,0.05)] transition-colors"
                      onClick={() => setShowManageModal(true)}
                    >
                      <span className="text-[#a6afb8] text-sm">+{criteria.length - 6} more criteria</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Principles Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-12"
              >
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="w-5 h-5 text-[#7fa3ff]" />
                  <h3 className="text-xl font-bold">ICT Principles</h3>
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: Target, title: 'PD Arrays', desc: 'Premium/discount zones where institutional orders may rest.' },
                    { icon: TrendingUp, title: 'Liquidity Sweeps', desc: 'A run above highs or below lows that quickly reverses.' },
                    { icon: Layers, title: 'SMT Divergence', desc: 'Smart Money Technique: correlated pairs diverge at key levels.' },
                    { icon: Zap, title: 'Fair Value Gaps', desc: 'Imbalance zones created by aggressive displacement; often revisited.' },
                    { icon: AlertCircle, title: 'Inverse FVG', desc: 'A gap that forms against your direction; acts as a rejection zone.' },
                    { icon: BarChart3, title: 'Fibonacci Confluence', desc: 'Key retracements aligning with PD arrays for tighter entries.' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="glass-card p-5 hover:bg-[rgba(242,245,248,0.05)] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#7fa3ff]/10 flex items-center justify-center mb-3">
                        <item.icon className="w-5 h-5 text-[#7fa3ff]" />
                      </div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-[#a6afb8] text-sm">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Checklist Stepper */}
        {isEvaluating && !showReport && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-6 pt-8"
          >
            <div className="max-w-3xl mx-auto">
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-[#a6afb8] mb-2">
                  <span>Question {currentStep + 1} of {criteria.length}</span>
                  <span>{Math.round(((currentStep + 1) / criteria.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-[rgba(242,245,248,0.1)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#7fa3ff] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / criteria.length) * 100}%` }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              {/* Question card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="glass-card p-8 sm:p-12">
                    {/* Question metadata */}
                    <div className="flex items-center gap-3 mb-6">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${getImportanceColor(criteria[currentStep].importance)}20`,
                          color: getImportanceColor(criteria[currentStep].importance)
                        }}
                      >
                        {IMPORTANCE_LABELS[criteria[currentStep].importance]} ({criteria[currentStep].weight} pts)
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        criteria[currentStep].impact === 'positive'
                          ? 'bg-green-500/10 text-green-400' 
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {criteria[currentStep].impact === 'positive' ? 'Positive' : 'Negative'}
                      </span>
                    </div>

                    {/* Question text */}
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 leading-tight">
                      {criteria[currentStep].question}
                    </h2>

                    {/* Answer buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => handleAnswer(true)}
                        className="flex-1 btn-primary flex items-center justify-center gap-3"
                      >
                        <Check className="w-5 h-5" />
                        Yes
                      </button>
                      <button
                        onClick={() => handleAnswer(false)}
                        className="flex-1 btn-secondary flex items-center justify-center gap-3"
                      >
                        <X className="w-5 h-5" />
                        No
                      </button>
                    </div>

                    {/* Previous button */}
                    {currentStep > 0 && (
                      <button
                        onClick={handlePrevious}
                        className="mt-6 text-[#a6afb8] hover:text-[#f2f5f8] text-sm transition-colors"
                      >
                        ← Previous question
                      </button>
                    )}

                    {/* Keyboard hint */}
                    <div className="mt-8 pt-6 border-t border-[rgba(242,245,248,0.08)] text-center">
                      <p className="text-[#a6afb8] text-sm">
                        Press <kbd className="px-2 py-1 bg-[rgba(242,245,248,0.08)] rounded text-xs mx-1">Y</kbd> for Yes or <kbd className="px-2 py-1 bg-[rgba(242,245,248,0.08)] rounded text-xs mx-1">N</kbd> for No
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.section>
        )}

        {/* Setup Report */}
        {showReport && gradeResult && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-6 pt-8"
          >
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="glass-card p-8 sm:p-12"
              >
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  {/* Left: Grade circle */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                      {/* SVG Ring */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="50%"
                          cy="50%"
                          r="45%"
                          fill="none"
                          stroke="rgba(242,245,248,0.08)"
                          strokeWidth="8"
                        />
                        <motion.circle
                          cx="50%"
                          cy="50%"
                          r="45%"
                          fill="none"
                          stroke={gradeColors[gradeResult.grade]}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          initial={{ strokeDashoffset: `${2 * Math.PI * 45}` }}
                          animate={{ strokeDashoffset: `${2 * Math.PI * 45 * (1 - gradeResult.percentage / 100)}` }}
                          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                        />
                      </svg>
                      {/* Grade text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                          className="text-6xl sm:text-7xl font-bold tabular-nums"
                          style={{ color: gradeColors[gradeResult.grade] }}
                        >
                          {gradeResult.grade}
                        </motion.span>
                        <span className="text-[#a6afb8] text-sm mt-1">Grade</span>
                      </div>
                    </div>

                    {/* Verdict badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="mt-6"
                    >
                      <span className={`px-6 py-3 rounded-full text-lg font-semibold ${
                        gradeResult.recommendation === 'trade'
                          ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}>
                        {gradeResult.recommendation === 'trade' ? '✓ TRADE' : '✗ NO TRADE'}
                      </span>
                    </motion.div>
                  </div>

                  {/* Right: Score breakdown */}
                  <div>
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="text-2xl font-bold mb-2">Your Setup Report</h3>
                      <p className="text-[#a6afb8] mb-6">
                        This setup scores <span className="text-[#f2f5f8] font-semibold">{gradeResult.percentage}%</span>
                      </p>

                      {/* Breakdown list */}
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between p-4 bg-[rgba(242,245,248,0.03)] rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                              <Check className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-[#a6afb8]">Positive criteria met</span>
                          </div>
                          <span className="font-semibold">
                            {gradeResult.breakdown.positiveMet} / {gradeResult.breakdown.positiveTotal}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-[rgba(242,245,248,0.03)] rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                              <Shield className="w-4 h-4 text-red-400" />
                            </div>
                            <span className="text-[#a6afb8]">Negative criteria avoided</span>
                          </div>
                          <span className="font-semibold">
                            {gradeResult.breakdown.negativeAvoided} / {gradeResult.breakdown.negativeTotal}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-[rgba(242,245,248,0.03)] rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#7fa3ff]/10 flex items-center justify-center">
                              <Target className="w-4 h-4 text-[#7fa3ff]" />
                            </div>
                            <span className="text-[#a6afb8]">Weighted alignment</span>
                          </div>
                          <span className="font-semibold">
                            {gradeResult.percentage >= 80 ? 'Strong' : gradeResult.percentage >= 60 ? 'Moderate' : 'Weak'}
                          </span>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="p-4 bg-[rgba(242,245,248,0.05)] rounded-xl mb-6">
                        <p className="text-sm text-[#a6afb8]">{gradeResult.explanation}</p>
                      </div>

                      {/* CTA */}
                      <button
                        onClick={handleRestart}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-5 h-5" />
                        Restart Evaluation
                      </button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}
      </main>

      {/* Manage Strategy Modal */}
      <AnimatePresence>
        {showManageModal && (
          <ManageStrategyModal
            criteria={criteria}
            onClose={() => setShowManageModal(false)}
            onAdd={addCriterion}
            onUpdate={updateCriterion}
            onRemove={removeCriterion}
            onMove={moveCriterion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-[#a6afb8]">{label}</div>
    </div>
  );
}

// Manage Strategy Modal Component
interface ManageStrategyModalProps {
  criteria: Criterion[];
  onClose: () => void;
  onAdd: (question: string, impact: 'positive' | 'negative', importance: number) => void;
  onUpdate: (id: string, updates: Partial<Criterion>) => void;
  onRemove: (id: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}

function ManageStrategyModal({ criteria, onClose, onAdd, onUpdate, onRemove, onMove }: ManageStrategyModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newImpact, setNewImpact] = useState<'positive' | 'negative'>('positive');
  const [newImportance, setNewImportance] = useState<number>(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestion.trim()) {
      onAdd(newQuestion.trim(), newImpact, newImportance);
      setNewQuestion('');
      setShowAddForm(false);
    }
  };

  const handleEdit = (criterion: Criterion) => {
    setEditingId(criterion.id);
    setNewQuestion(criterion.question);
    setNewImpact(criterion.impact);
    setNewImportance(criterion.importance);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && newQuestion.trim()) {
      onUpdate(editingId, {
        question: newQuestion.trim(),
        impact: newImpact,
        importance: newImportance as 1 | 2 | 3 | 4 | 5,
        weight: newImportance,
      });
      setEditingId(null);
      setNewQuestion('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewQuestion('');
    setShowAddForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0b0e11]/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden glass-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(242,245,248,0.08)]">
          <div>
            <h2 className="text-2xl font-bold">Manage Strategy</h2>
            <p className="text-[#a6afb8] text-sm mt-1">Reorder, edit, or customize your criteria</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[rgba(242,245,248,0.05)] flex items-center justify-center hover:bg-[rgba(242,245,248,0.1)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Add button */}
          {!showAddForm && !editingId && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-4 border-2 border-dashed border-[rgba(242,245,248,0.15)] rounded-xl text-[#a6afb8] hover:text-[#f2f5f8] hover:border-[rgba(242,245,248,0.25)] transition-colors flex items-center justify-center gap-2 mb-6"
            >
              <Plus className="w-5 h-5" />
              Add New Criterion
            </button>
          )}

          {/* Add/Edit form */}
          <AnimatePresence>
            {(showAddForm || editingId) && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={editingId ? handleUpdate : handleSubmit}
                className="mb-6 p-5 bg-[rgba(242,245,248,0.05)] rounded-xl border border-[rgba(242,245,248,0.1)]"
              >
                <h4 className="font-semibold mb-4">
                  {editingId ? 'Edit Criterion' : 'Add New Criterion'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#a6afb8] mb-2">Question</label>
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="e.g., Is there a clear market structure break?"
                      className="w-full px-4 py-3 bg-[rgba(242,245,248,0.05)] border border-[rgba(242,245,248,0.1)] rounded-lg text-[#f2f5f8] placeholder:text-[#a6afb8]/50 focus:outline-none focus:border-[#7fa3ff] transition-colors"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#a6afb8] mb-2">Impact</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewImpact('positive')}
                          className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                            newImpact === 'positive'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-[rgba(242,245,248,0.05)] text-[#a6afb8] border border-transparent'
                          }`}
                        >
                          <TrendingUp className="w-4 h-4 inline mr-1" />
                          Positive
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewImpact('negative')}
                          className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                            newImpact === 'negative'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-[rgba(242,245,248,0.05)] text-[#a6afb8] border border-transparent'
                          }`}
                        >
                          <TrendingDown className="w-4 h-4 inline mr-1" />
                          Negative
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-[#a6afb8] mb-2">Importance (1-5)</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setNewImportance(level)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                              newImportance === level
                                ? 'bg-[#7fa3ff]/20 text-[#7fa3ff] border border-[#7fa3ff]/40'
                                : 'bg-[rgba(242,245,248,0.05)] text-[#a6afb8] hover:bg-[rgba(242,245,248,0.1)]'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-[#a6afb8] mt-1.5">
                        {IMPORTANCE_LABELS[newImportance]} — {newImportance} points
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 py-2.5 px-4 bg-[rgba(242,245,248,0.05)] text-[#a6afb8] rounded-lg hover:bg-[rgba(242,245,248,0.1)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 bg-[#7fa3ff] text-[#0b0e11] font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                      {editingId ? 'Save Changes' : 'Add Criterion'}
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Criteria list */}
          <div className="space-y-2">
            {criteria.length === 0 ? (
              <div className="text-center py-12 text-[#a6afb8]">
                <ListChecks className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No criteria yet. Add your first question above.</p>
              </div>
            ) : (
              criteria.map((criterion, index) => (
                <motion.div
                  key={criterion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 bg-[rgba(242,245,248,0.03)] rounded-xl flex items-center gap-3 group hover:bg-[rgba(242,245,248,0.06)] transition-colors"
                >
                  {/* Drag handle */}
                  <div className="text-[#a6afb8] opacity-30">
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Order number */}
                  <span className="text-xs text-[#a6afb8] w-6">{index + 1}</span>

                  {/* Importance badge */}
                  <span 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ 
                      backgroundColor: `${getImportanceColor(criterion.importance)}20`,
                      color: getImportanceColor(criterion.importance)
                    }}
                  >
                    {criterion.importance}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{criterion.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        criterion.impact === 'positive'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {criterion.impact}
                      </span>
                      <span className="text-xs text-[#a6afb8]">
                        {criterion.weight} pts
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Move up */}
                    <button
                      onClick={() => onMove(index, 'up')}
                      disabled={index === 0}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#a6afb8] hover:bg-[rgba(242,245,248,0.1)] hover:text-[#f2f5f8] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    {/* Move down */}
                    <button
                      onClick={() => onMove(index, 'down')}
                      disabled={index === criteria.length - 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#a6afb8] hover:bg-[rgba(242,245,248,0.1)] hover:text-[#f2f5f8] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => handleEdit(criterion)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#a6afb8] hover:bg-[#7fa3ff]/10 hover:text-[#7fa3ff] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => onRemove(criterion.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#a6afb8] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default App;
