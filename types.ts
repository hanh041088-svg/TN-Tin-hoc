
export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export enum QuizState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR',
}
