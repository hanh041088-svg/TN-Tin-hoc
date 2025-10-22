import React, { useState, useMemo, useCallback } from 'react';
import { generateQuizQuestions } from './services/geminiService';
import { Question, QuizState } from './types';
import Quiz from './components/Quiz';
import Results from './components/Results';
import LoadingSpinner from './components/LoadingSpinner';

const quizChapters = [
  {
    title: "Chủ đề 1. MÁY TÍNH VÀ XÃ HỘI TRI THỨC",
    icon: "fas fa-brain",
    lessons: [
      "Bài 1. Hệ điều hành",
      "Bài 2. Thực hành sử dụng hệ điều hành",
      "Bài 3. Phần mềm nguồn mở và phần mềm chạy trên Internet",
      "Bài 4. Bên trong máy tính",
      "Bài 5. Kết nối máy tính với các thiết bị số",
    ]
  },
  {
    title: "Chủ đề 2. TỔ CHỨC LƯU TRỮ, TÌM KIẾM VÀ TRAO ĐỔI THÔNG TIN",
    icon: "fas fa-folder-tree",
    lessons: [
      "Bài 6. Lưu trữ và chia sẻ tệp tin trên Internet",
      "Bài 7. Thực hành tìm kiếm thông tin trên Internet",
      "Bài 8. Thực hành nâng cao sử dụng thư điện tử và mạng xã hội",
    ]
  },
  {
    title: "Chủ đề 3. ĐẠO ĐỨC, PHÁP LUẬT VÀ VĂN HOÁ TRONG MÔI TRƯỜNG SỐ",
    icon: "fas fa-shield-alt",
    lessons: [
      "Bài 9. Giao tiếp an toàn trên Internet",
    ]
  },
  {
    title: "Chủ đề 4. GIỚI THIỆU CÁC HỆ CƠ SỞ DỮ LIỆU",
    icon: "fas fa-database",
    lessons: [
      "Bài 10. Lưu trữ dữ liệu và khai thác thông tin phục vụ quản lí",
      "Bài 11. Cơ sở dữ liệu",
      "Bài 12. Hệ quản trị cơ sở dữ liệu và hệ cơ sở dữ liệu",
      "Bài 13. Cơ sở dữ liệu quan hệ",
      "Bài 14. SQL – Ngôn ngữ truy vấn có cấu trúc",
      "Bài 15. Bảo mật và an toàn hệ cơ sở dữ liệu",
    ]
  },
  {
    title: "Chủ đề 5. HƯỚNG NGHIỆP VỚI TIN HỌC",
    icon: "fas fa-briefcase",
    lessons: [
      "Bài 16. Công việc quản trị cơ sở dữ liệu",
    ]
  },
  {
    title: "Chủ đề 6. THỰC HÀNH TẠO VÀ KHAI THÁC CƠ SỞ DỮ LIỆU",
    icon: "fas fa-table-list",
    lessons: [
      "Bài 17. Quản trị cơ sở dữ liệu trên máy tính",
      "Bài 18. Thực hành xác định cấu trúc bảng và các trường khoá",
      "Bài 19. Thực hành tạo lập cơ sở dữ liệu và các bảng",
      "Bài 20. Thực hành tạo lập các bảng có khoá ngoại",
      "Bài 21. Thực hành cập nhật và truy xuất dữ liệu các bảng",
      "Bài 22. Thực hành cập nhật bảng dữ liệu có tham chiếu",
      "Bài 23. Thực hành truy xuất dữ liệu qua liên kết các bảng",
      "Bài 24. Thực hành sao lưu dữ liệu",
    ]
  },
  {
    title: "Chủ đề 7. PHẦN MỀM CHỈNH SỬA ẢNH VÀ LÀM VIDEO",
    icon: "fas fa-photo-film",
    lessons: [
      "Bài 25. Phần mềm chỉnh sửa ảnh",
      "Bài 26. Công cụ tinh chỉnh màu sắc và công cụ chọn",
      "Bài 27. Công cụ vẽ và một số ứng dụng",
      "Bài 28. Tạo ảnh động",
      "Bài 29. Khám phá phần mềm làm phim",
      "Bài 30. Biên tập phim",
      "Bài 31. Thực hành tạo phim hoạt hình",
    ]
  },
];

const App: React.FC = () => {
  const [studentName, setStudentName] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [quizState, setQuizState] = useState<QuizState>(QuizState.IDLE);
  const [error, setError] = useState<string | null>(null);

  const availableLessons = useMemo(() => {
    if (!selectedChapter) return [];
    const chapter = quizChapters.find(c => c.title === selectedChapter);
    return chapter ? chapter.lessons : [];
  }, [selectedChapter]);
  
  const selectedChapterIcon = useMemo(() => {
      const chapter = quizChapters.find(c => c.title === selectedChapter);
      return chapter ? chapter.icon : null;
  }, [selectedChapter]);

  const startQuiz = useCallback(async () => {
    if (!selectedLesson || !studentName.trim() || !studentClass.trim()) {
      setError('Vui lòng điền đầy đủ thông tin và chọn bài học.');
      return;
    }
    setError(null);
    setQuizState(QuizState.LOADING);
    try {
      const fetchedQuestions = await generateQuizQuestions(selectedLesson, numberOfQuestions);
      if (fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
        setScore(0);
        setCurrentQuestionIndex(0);
        setQuizState(QuizState.ACTIVE);
      } else {
        throw new Error("Không thể tạo câu hỏi. Vui lòng thử lại.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
      setError(`Lỗi: ${errorMessage}`);
      setQuizState(QuizState.ERROR);
    }
  }, [selectedLesson, numberOfQuestions, studentName, studentClass]);

  const handleAnswer = (answer: string, isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      setQuizState(QuizState.FINISHED);
    }
  };

  const restartQuiz = () => {
    setQuizState(QuizState.IDLE);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setError(null);
    setSelectedChapter('');
    setSelectedLesson('');
    // Do not reset student name and class to allow for sequential tests
  };

  const renderContent = () => {
    switch (quizState) {
      case QuizState.LOADING:
        return <LoadingSpinner />;
      case QuizState.ACTIVE:
        return (
          <Quiz
            question={questions[currentQuestionIndex]}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            chapterTitle={selectedChapter}
            topic={selectedLesson}
            onAnswer={handleAnswer}
          />
        );
      case QuizState.FINISHED:
        return <Results 
                  score={score} 
                  totalQuestions={questions.length} 
                  onRestart={restartQuiz} 
                  chapterTitle={selectedChapter} 
                  topic={selectedLesson}
                  studentName={studentName}
                  studentClass={studentClass}
                />;
      case QuizState.ERROR:
        return (
           <div className="w-full max-w-lg mx-auto text-center p-8 bg-red-100/70 border border-red-400 text-red-700 rounded-2xl backdrop-blur-md">
             <h2 className="text-2xl font-bold mb-4">Ối, có lỗi xảy ra!</h2>
             <p className="mb-4">{error}</p>
             <button onClick={restartQuiz} className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-md">
               Thử lại
             </button>
           </div>
        );
      case QuizState.IDLE:
      default:
        return (
          <div className="w-full max-w-xl mx-auto p-6 md:p-8 bg-white/70 rounded-2xl shadow-2xl shadow-cyan-500/10 border border-slate-200 backdrop-blur-md">
            <div className="text-center mb-6">
              <i className="fas fa-laptop-code text-5xl text-cyan-500"></i>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-4">Trắc nghiệm Tin học 11</h1>
              <p className="text-slate-500 mt-2">Điền thông tin và chọn bài học để bắt đầu!</p>
            </div>
            
            <div className="space-y-6">
               <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                 <div>
                    <label htmlFor="studentName" className="block mb-2 font-medium text-slate-700">
                        <i className="fas fa-user mr-2 text-cyan-500"></i>Họ và tên
                    </label>
                    <input
                      type="text"
                      id="studentName"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white"
                    />
                 </div>
                  <div>
                    <label htmlFor="studentClass" className="block mb-2 font-medium text-slate-700">
                        <i className="fas fa-chalkboard-teacher mr-2 text-cyan-500"></i>Lớp
                    </label>
                    <input
                      type="text"
                      id="studentClass"
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      placeholder="11A1"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white"
                    />
                 </div>
               </div>
               <div>
                <label htmlFor="chapter" className="block mb-2 font-medium text-slate-700">
                  <i className="fas fa-folder-open mr-2 text-cyan-500"></i>
                  Chọn chủ đề
                </label>
                <select
                  id="chapter"
                  value={selectedChapter}
                  onChange={(e) => {
                    setSelectedChapter(e.target.value);
                    setSelectedLesson(''); 
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white"
                >
                  <option value="" disabled>-- Vui lòng chọn một chủ đề --</option>
                  {quizChapters.map(chapter => (
                    <option key={chapter.title} value={chapter.title}>{chapter.title}</option>
                  ))}
                </select>
              </div>

              {selectedChapter && (
                <div className="fade-in">
                  <label htmlFor="lesson" className="block mb-2 font-medium text-slate-700">
                    <i className="fas fa-book-open mr-2 text-cyan-500"></i>
                    Chọn bài học
                  </label>
                  <select
                    id="lesson"
                    value={selectedLesson}
                    onChange={(e) => setSelectedLesson(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white"
                  >
                    <option value="" disabled>-- Vui lòng chọn một bài học --</option>
                    {availableLessons.map(lesson => (
                      <option key={lesson} value={lesson}>{lesson}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedLesson && (
                 <div className="fade-in">
                    <label htmlFor="numQuestions" className="block mb-2 font-medium text-slate-700">
                        <i className="fas fa-list-ol mr-2 text-cyan-500"></i>
                        Số lượng câu hỏi
                    </label>
                    <select
                        id="numQuestions"
                        value={numberOfQuestions}
                        onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white"
                    >
                        <option value={5}>5 câu</option>
                        <option value={10}>10 câu</option>
                        <option value={15}>15 câu</option>
                        <option value={20}>20 câu</option>
                    </select>
                 </div>
              )}

            </div>
            
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            
            <button
              onClick={startQuiz}
              disabled={!selectedLesson || !studentName.trim() || !studentClass.trim()}
              className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-bold rounded-lg shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              Bắt đầu
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-sans">
      <main className="flex-grow flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div key={quizState} className="z-10 w-full fade-in">
              {renderContent()}
          </div>
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        Create by Phạm Thị Hạnh - Trường Tiểu học, THCS và THPT Hồng Đức
      </footer>
    </div>
  );
};

export default App;