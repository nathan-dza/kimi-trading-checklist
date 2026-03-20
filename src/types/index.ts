export interface Criterion {
  id: string;
  question: string;
  impact: 'positive' | 'negative';
  importance: 1 | 2 | 3 | 4 | 5;
  weight: number;
}

export interface Answer {
  criterionId: string;
  value: boolean;
}

export interface ScoreBreakdown {
  totalPossible: number;
  totalEarned: number;
  positiveMet: number;
  positiveTotal: number;
  negativeAvoided: number;
  negativeTotal: number;
  percentage: number;
}

export type LetterGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F';

export interface GradeResult {
  grade: LetterGrade;
  percentage: number;
  breakdown: ScoreBreakdown;
  recommendation: 'trade' | 'no-trade';
  explanation: string;
}

export const DEFAULT_CRITERIA: Criterion[] = [
  {
    id: '1',
    question: 'Is price approaching a key Daily/Weekly PD Array?',
    impact: 'positive',
    importance: 5,
    weight: 5,
  },
  {
    id: '2',
    question: 'Did you identify a recent Liquidity Sweep (BSL/SSL)?',
    impact: 'positive',
    importance: 5,
    weight: 5,
  },
  {
    id: '3',
    question: 'Is there an SMT Divergence confirming the direction?',
    impact: 'positive',
    importance: 3,
    weight: 3,
  },
  {
    id: '4',
    question: 'Did price leave a Fair Value Gap in the direction of the trade?',
    impact: 'positive',
    importance: 4,
    weight: 4,
  },
  {
    id: '5',
    question: 'Is the setup aligned with the higher timeframe bias?',
    impact: 'positive',
    importance: 5,
    weight: 5,
  },
  {
    id: '6',
    question: 'Is risk ≤ 1% of account and R:R ≥ 1:2?',
    impact: 'positive',
    importance: 5,
    weight: 5,
  },
  {
    id: '7',
    question: 'Any conflicting news event within the next 30 minutes?',
    impact: 'negative',
    importance: 4,
    weight: 4,
  },
  {
    id: '8',
    question: 'Is there an Inverse FVG acting as a rejection zone?',
    impact: 'positive',
    importance: 3,
    weight: 3,
  },
  {
    id: '9',
    question: 'Does Fibonacci confluence align with the entry zone?',
    impact: 'positive',
    importance: 2,
    weight: 2,
  },
];

export const IMPORTANCE_LABELS: Record<number, string> = {
  1: 'Minimal',
  2: 'Low',
  3: 'Medium',
  4: 'High',
  5: 'Critical',
};

export function getImportanceColor(importance: number): string {
  switch (importance) {
    case 1: return '#6b7280';
    case 2: return '#9ca3af';
    case 3: return '#7fa3ff';
    case 4: return '#fbbf24';
    case 5: return '#f87171';
    default: return '#7fa3ff';
  }
}

export function calculateGrade(answers: Answer[], criteria: Criterion[]): GradeResult {
  let totalPossible = 0;
  let totalEarned = 0;
  let positiveMet = 0;
  let positiveTotal = 0;
  let negativeAvoided = 0;
  let negativeTotal = 0;

  const answersMap = new Map(answers.map(a => [a.criterionId, a.value]));

  for (const criterion of criteria) {
    const answer = answersMap.get(criterion.id);
    if (answer === undefined) continue;

    const weight = criterion.weight;

    if (criterion.impact === 'positive') {
      positiveTotal++;
      totalPossible += weight;
      if (answer) {
        positiveMet++;
        totalEarned += weight;
      }
    } else {
      negativeTotal++;
      totalPossible += weight;
      if (!answer) {
        negativeAvoided++;
        totalEarned += weight;
      }
    }
  }

  const percentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

  let grade: LetterGrade;
  if (percentage >= 97) grade = 'A+';
  else if (percentage >= 93) grade = 'A';
  else if (percentage >= 90) grade = 'A-';
  else if (percentage >= 87) grade = 'B+';
  else if (percentage >= 83) grade = 'B';
  else if (percentage >= 80) grade = 'B-';
  else if (percentage >= 77) grade = 'C+';
  else if (percentage >= 73) grade = 'C';
  else if (percentage >= 70) grade = 'C-';
  else if (percentage >= 67) grade = 'D+';
  else if (percentage >= 63) grade = 'D';
  else if (percentage >= 60) grade = 'D-';
  else grade = 'F';

  const recommendation = percentage >= 75 && positiveMet >= positiveTotal * 0.6 ? 'trade' : 'no-trade';

  let explanation = '';
  if (recommendation === 'trade') {
    if (percentage >= 90) {
      explanation = 'Excellent setup with strong confluence across multiple criteria. High probability edge.';
    } else if (percentage >= 80) {
      explanation = 'Solid setup with good alignment. Proceed with proper risk management.';
    } else {
      explanation = 'Acceptable setup but monitor closely. Ensure strict stop loss discipline.';
    }
  } else {
    if (percentage < 60) {
      explanation = 'Weak setup with insufficient confluence. Recommend waiting for cleaner price action.';
    } else if (positiveMet < positiveTotal * 0.6) {
      explanation = 'Key positive criteria not met. Missing critical edge components.';
    } else {
      explanation = 'Some concerns present. Review negative criteria and consider waiting.';
    }
  }

  return {
    grade,
    percentage,
    breakdown: {
      totalPossible,
      totalEarned,
      positiveMet,
      positiveTotal,
      negativeAvoided,
      negativeTotal,
      percentage,
    },
    recommendation,
    explanation,
  };
}
