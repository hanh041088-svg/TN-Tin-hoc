
import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface QuizProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  chapterTitle: string;
  topic: string;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}

const Quiz: React.FC<QuizProps> = ({ question, questionNumber, totalQuestions, chapterTitle, topic, onAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
  }, [question]);

  const handleAnswerClick = (option: string) => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    setSelectedAnswer(option);
    const isCorrect = option === question.correctAnswer;
    
    setTimeout(() => {
      onAnswer(option, isCorrect);
    }, 3000); 
  };

  const getButtonClass = (option: string) => {
    const baseClasses = 'w-full p-4 text-left rounded-lg text-lg transition-all duration-300 border flex justify-between items-center';

    if (!isAnswered) {
      return `${baseClasses} bg-white border-slate-300 hover:bg-slate-50 hover:border-cyan-500 transform hover:scale-105 cursor-pointer`;
    }

    const isCorrect = option === question.correctAnswer;
    const isSelected = option === selectedAnswer;

    if (isCorrect) {
      return `${baseClasses} bg-gradient-to-r from-green-500 to-teal-600 border-green-400 text-white scale-105 cursor-default`;
    }
    if (isSelected && !isCorrect) {
      return `${baseClasses} bg-gradient-to-r from-red-500 to-rose-600 border-red-400 text-white cursor-default`;
    }
    return `${baseClasses} bg-slate-200 border-slate-300 opacity-60 cursor-default text-slate-500`;
  };
  
  const getIcon = (option: string) => {
      if (!isAnswered) return null;
      if (option === question.correctAnswer) return <i className="fas fa-check-circle"></i>;
      if (option === selectedAnswer && option !== question.correctAnswer) return <i className="fas fa-times-circle"></i>;
      return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-white/60 rounded-2xl shadow-2xl shadow-cyan-500/10 border border-slate-200 backdrop-blur-sm">
      <div className="mb-6">
        <p className="text-center text-slate-500 mb-1 text-sm">{chapterTitle}</p>
        <p className="text-center text-slate-600 mb-4 text-lg">Bài học: <span className="font-semibold text-cyan-600">{topic}</span></p>
        <div className="flex justify-between items-center mb-2 text-slate-500">
          <span>Câu hỏi {questionNumber} / {totalQuestions}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-slate-800" dangerouslySetInnerHTML={{ __html: question.question }}></h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(option)}
            disabled={isAnswered}
            className={getButtonClass(option)}
          >
            <div className="flex items-center">
              <span className="font-mono mr-4 text-cyan-500">{String.fromCharCode(65 + index)}.</span>
              <span className="text-slate-800">{option}</span>
            </div>
            {getIcon(option)}
          </button>
        ))}
      </div>
      
      {isAnswered && (
        <div className="mt-6 p-4 bg-sky-50/70 border border-sky-200 rounded-lg fade-in backdrop-blur-sm">
            <h4 className="font-bold text-slate-700 mb-2 flex items-center">
                <i className="fas fa-lightbulb mr-2 text-yellow-400"></i>Giải thích
            </h4>
            <p className="text-slate-600">{question.explanation}</p>
        </div>
      )}

    </div>
  );
};

export default Quiz;
