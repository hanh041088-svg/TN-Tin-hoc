import React, { useState } from 'react';

interface ResultsProps {
  score: number;
  totalQuestions: number;
  chapterTitle: string;
  topic: string;
  studentName: string;
  studentClass: string;
  onRestart: () => void;
}

const Results: React.FC<ResultsProps> = ({ score, totalQuestions, chapterTitle, topic, studentName, studentClass, onRestart }) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const percentage = Math.round((score / totalQuestions) * 100);

  const getFeedback = () => {
    if (percentage >= 90) return { message: 'Tuyệt vời! Em đã nắm rất vững bài học!', icon: '🏆', color: 'text-amber-500' };
    if (percentage >= 80) return { message: 'Xuất sắc! Một kết quả rất ấn tượng!', icon: '🎉', color: 'text-green-500' };
    if (percentage >= 50) return { message: 'Khá tốt! Cố gắng thêm chút nữa nhé.', icon: '👍', color: 'text-blue-500' };
    return { message: 'Đừng nản lòng! Hãy ôn tập và thử lại nhé.', icon: '💪', color: 'text-rose-500' };
  };

  const { message, icon, color } = getFeedback();

  // --- LƯU Ý QUAN TRỌNG DÀNH CHO GIÁO VIÊN ---
  // Để tính năng lưu kết quả hoạt động, file Google Sheets của bạn PHẢI CÓ các cột
  // với tên (tiêu đề ở dòng đầu tiên) khớp chính xác 100% như sau:
  //
  // timestamp
  // name
  // class
  // chapter
  // lesson
  // score
  // percentage
  //
  // Việc đặt tên cột sai (ví dụ: "Họ và tên" thay vì "name") là nguyên nhân phổ biến nhất
  // khiến dữ liệu không được ghi vào bảng tính mặc dù ứng dụng báo "gửi thành công".
  const handleSendResult = async () => {
    // --- DÀNH CHO GIÁO VIÊN ---
    // URL API được lấy từ tài khoản SheetDB của bạn.
    const SPREADSHEET_API_ENDPOINT = 'https://sheetdb.io/api/v1/cvh7o5fdwcpjx';

    setIsSubmitting(true);
    setSubmitStatus('idle');

    const data = {
      timestamp: new Date().toLocaleString('vi-VN'),
      name: studentName,
      class: studentClass,
      chapter: chapterTitle,
      lesson: topic,
      score: `${score}/${totalQuestions}`,
      percentage: `${percentage}%`,
    };

    try {
      const response = await fetch(SPREADSHEET_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Tinh chỉnh: Gửi trực tiếp đối tượng dữ liệu
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      await response.json();
      setSubmitStatus('success');
    } catch (error) {
      console.error('Failed to send results:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSubmitButton = () => {
    if (submitStatus === 'success') {
      return (
        <button
          disabled
          className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-md cursor-not-allowed"
        >
          <i className="fas fa-check-circle mr-2"></i> Đã gửi thành công!
        </button>
      );
    }

    let buttonText = 'Gửi kết quả';
    let buttonIcon = 'fas fa-paper-plane';
    let isError = submitStatus === 'error';

    if (isSubmitting) {
      buttonText = 'Đang gửi...';
      buttonIcon = 'fas fa-spinner fa-spin';
    } else if (isError) {
      buttonText = 'Gửi lỗi, thử lại?';
      buttonIcon = 'fas fa-exclamation-triangle';
    }
    
    return (
      <>
        <button
          onClick={handleSendResult}
          disabled={isSubmitting}
          className={`w-full px-6 py-3 text-white font-semibold rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 whitespace-nowrap ${isError ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-rose-500/50' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-emerald-500/50'}`}
        >
          <i className={`${buttonIcon} mr-2`}></i> {buttonText}
        </button>
        {isError && <p className="text-red-500 text-sm mt-2">Không thể gửi. Vui lòng kiểm tra kết nối mạng và thử lại.</p>}
      </>
    );
  };


  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-white/70 rounded-2xl shadow-2xl shadow-cyan-500/10 border border-slate-200 backdrop-blur-md text-center">
      <div className={`text-6xl mb-4 ${color}`}>{icon}</div>
      <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Hoàn thành!</h2>
      <p className="text-lg text-slate-600 mb-6">{message}</p>
      
      <div className="bg-slate-100 p-6 rounded-xl mb-6">
        <p className="text-slate-500 text-sm">Điểm số của bạn</p>
        <p className="text-6xl font-bold text-cyan-600 my-2">
          {score} / {totalQuestions}
        </p>
        <div className="w-full bg-slate-200 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-4 rounded-full" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        <p className="text-2xl font-semibold text-slate-700 mt-3">{percentage}%</p>
      </div>

       <div className="bg-slate-100 p-6 rounded-xl mb-8 text-left">
          <h3 className="text-lg font-semibold text-slate-700 mb-3">Lưu kết quả trực tuyến</h3>
          <div className="space-y-2 mb-4 text-slate-600">
            <p><strong>Học sinh:</strong> {studentName}</p>
            <p><strong>Lớp:</strong> {studentClass}</p>
          </div>
          {renderSubmitButton()}
       </div>

      <button
        onClick={onRestart}
        className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-semibold rounded-lg shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300"
      >
        Làm lại bài khác
      </button>
    </div>
  );
};

export default Results;