
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, AlertTriangle, CheckCircle, List, EyeOff, LogOut, User, Clock, AlertCircle, ChevronRight, Sparkles, Check, XCircle, Key, Loader2, ChevronLeft, HelpCircle, Maximize } from 'lucide-react';
import { Question, SubQuestion, User as UserType, Student } from '../types';
import { MathRenderer, SmartTextRenderer, loadExternalLibs } from '../utils/common';
import { callGeminiAPI } from '../services/geminiService';

// --- CUSTOM STYLES FOR FLASHCARD THEME ---
const FLASHCARD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

  * { font-family: 'Poppins', sans-serif; }
  body, .font-poppins { font-family: 'Poppins', sans-serif; }
  
  /* Reset Headers to Poppins as requested */
  .font-mustica {
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
  }
  
  /* 1. CẤU TRÚC NỀN & LAYOUT */
  .quiz-background {
    background-color: #e0f7fa !important;
    background-image: 
      radial-gradient(at 0% 0%, rgba(255,255,255,0.8) 0px, transparent 50%),
      radial-gradient(at 90% 90%, rgba(175,238,238,0.5) 0px, transparent 60%) !important;
    background-attachment: fixed;
    min-height: 100vh;
    width: 100%;
    font-family: 'Poppins', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* 2. TEXT STYLES */
  h2.question-text { 
    color: #008080; 
    margin: 0 0 20px 0; 
    font-size: 24px; 
    font-weight: 600;
    line-height: 1.5;
    text-align: justify;
  }

  /* 3. THIẾT KẾ FLASHCARD 3D */
  .card-3d {
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 
      0 1px 2px rgba(0,0,0,0.07), 
      0 2px 4px rgba(0,0,0,0.07), 
      0 4px 8px rgba(0,0,0,0.07), 
      0 8px 16px rgba(0,0,0,0.07),
      0 16px 32px rgba(0,0,0,0.07), 
      0 32px 64px rgba(0,0,0,0.07);
    border: 1px solid rgba(0,0,0,0.05);
    transition: transform 0.3s ease;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .card-3d:hover {
    transform: translateY(-5px);
  }

  .card-header {
    background: #f8fbfb;
    padding: 15px 24px;
    border-bottom: 2px solid #e0f2f1;
    font-weight: 700;
    color: #00695c;
    font-size: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-body {
    flex: 1;
    padding: 30px;
    color: #333;
    position: relative;
  }

  /* 4. FORM ELEMENTS */
  /* Style cho input text dạng Flashcard - giống như viết lên thẻ */
  textarea.flashcard-input {
    width: 100%;
    min-height: 150px;
    border: none;
    border-top: 2px dashed #e0f2f1;
    padding: 20px 0;
    font-family: 'Poppins', sans-serif; /* Keep Poppins as requested */
    font-size: 16px;
    resize: none;
    outline: none;
    box-sizing: border-box;
    background: transparent;
    color: #333;
    transition: all 0.3s ease;
  }

  textarea.flashcard-input:focus {
    background: #faffff;
  }
  
  textarea.flashcard-input::placeholder { color: #aaa; font-style: italic; }
`;

// Helper to enter fullscreen safely
const requestFullscreen = async () => {
    try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) { /* Safari */
            await (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).msRequestFullscreen) { /* IE11 */
            await (elem as any).msRequestFullscreen();
        }
    } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
    }
};

export const ResultScreen = ({ score, total, violations, onRetry, questions = [], answers = {}, allowReview, counts }: any) => {
  // State for AI Hints in Result Screen
  const [activeHint, setActiveHint] = useState<{id: number, content: string} | null>(null);
  const [loadingHintId, setLoadingHintId] = useState<number | null>(null);

  // Ensure answers is always an object to prevent crashes
  const safeAnswers = answers || {};
  // Ensure questions is always an array
  const safeQuestions = Array.isArray(questions) ? questions : [];

  const handleGetReviewHint = async (q: Question) => {
    if (loadingHintId === q.id || activeHint?.id === q.id) return;
    setLoadingHintId(q.id);
    
    const userAns = safeAnswers[q.id];
    let prompt = "";
    if (q.type === 'choice') {
        prompt = `Câu hỏi: "${q.question}". Đáp án đúng là "${q.answer}". Người học chọn "${userAns || 'không chọn'}". Hãy giải thích chi tiết tại sao đáp án "${q.answer}" là đúng và phân tích lỗi sai nếu có. Định dạng câu trả lời rõ ràng, dùng gạch đầu dòng nếu cần.`;
    } else if (q.type === 'group') {
        prompt = `Câu hỏi mệnh đề: "${q.question}". Hãy giải thích từng ý đúng/sai trong câu hỏi này một cách ngắn gọn, rõ ràng.`;
    } else {
        prompt = `Câu hỏi tự luận: "${q.question}". Đáp án gợi ý: "${q.answer}". Hãy giải thích chi tiết cách làm.`;
    }

    const res = await callGeminiAPI(prompt);
    setActiveHint({ id: q.id, content: res });
    setLoadingHintId(null);
  };

  return (
    <div className="quiz-background w-full p-6">
       <style>{FLASHCARD_STYLES}</style>
       <div className="w-full max-w-4xl bg-white p-8 rounded-[30px] shadow-2xl animate-fade-in border-t-8 border-teal-600">
       
          {/* HEADLINE & SCORE */}
          <div className="text-center mb-8">
              <div className="inline-block bg-yellow-50 p-4 rounded-full mb-4 shadow-sm border border-yellow-100">
                <Trophy className="w-16 h-16 text-yellow-600" />
              </div>
              <h2 className="text-6xl font-black text-teal-800 mb-2 tracking-tight">{typeof score === 'number' ? score.toFixed(2) : 0} <span className="text-3xl text-gray-400 font-medium">/ {total}</span></h2>
              <p className="text-gray-500 font-medium uppercase tracking-widest text-sm">Điểm số tổng kết</p>
              
              {violations > 0 ? (
                <div className="mt-6 inline-flex items-center bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold border border-red-100 animate-pulse">
                    <AlertTriangle className="w-5 h-5 mr-2"/> Phát hiện {violations} lần vi phạm quy chế
                </div>
              ) : (
                <div className="mt-6 inline-flex items-center bg-teal-50 text-teal-700 px-6 py-3 rounded-xl font-bold border border-teal-100">
                    <CheckCircle className="w-5 h-5 mr-2"/> Bài làm hợp lệ
                </div>
              )}
          </div>

          {/* STATS SUMMARY */}
          <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-teal-50 p-4 rounded-2xl text-center border border-teal-100 shadow-sm">
                    <p className="text-3xl font-black text-teal-700 mb-1">{counts?.correct || 0}</p>
                    <p className="text-xs text-teal-600 uppercase font-bold tracking-wider">Câu Đúng</p>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl text-center border border-red-100 shadow-sm">
                    <p className="text-3xl font-black text-red-600 mb-1">{counts?.wrong || 0}</p>
                    <p className="text-xs text-red-600 uppercase font-bold tracking-wider">Câu Sai</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-200 shadow-sm">
                    <p className="text-3xl font-black text-gray-600 mb-1">{counts?.empty || 0}</p>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Chưa làm</p>
                </div>
          </div>

          {/* REVIEW DETAIL */}
          <div className="border-t border-gray-100 pt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <List className="w-6 h-6 text-teal-600"/> Chi tiết bài làm
                </h3>
                {!allowReview && (
                    <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full flex items-center">
                      <EyeOff className="w-3 h-3 mr-1"/> Chế độ ẩn đáp án
                    </span>
                )}
              </div>

              {allowReview ? (
                <div className="space-y-6">
                    {safeQuestions.map((q: Question, idx: number) => {
                      if (!q) return null; // Safe check for question existence
                      const userAns = safeAnswers[q.id];
                      return (
                          <div key={q.id} className="card-3d border-none shadow-md">
                             <div className="card-body p-6">
                                <div className="flex items-start gap-3 mb-3">
                                    <span className="bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm mt-0.5">Câu {idx+1}</span>
                                    <div className="font-bold text-gray-800 flex-1"><MathRenderer text={q.question} allowMarkdown={true} /></div>
                                </div>

                                {q.type === 'choice' && (
                                    <div className="ml-10 space-y-2">
                                    {q.options?.map((opt, i) => {
                                        const isSelected = userAns === opt;
                                        const isAnswer = opt === q.answer;
                                        let style = "bg-white border-gray-200 text-gray-500";
                                        let icon = null;
                                        if (isSelected && isAnswer) { style = "bg-teal-50 border-teal-500 text-teal-800 font-bold ring-1 ring-teal-500"; icon = <CheckCircle className="w-5 h-5 text-teal-600 ml-auto"/>; }
                                        else if (isSelected && !isAnswer) { style = "bg-red-50 border-red-400 text-red-800 font-medium ring-1 ring-red-400"; icon = <XCircle className="w-5 h-5 text-red-500 ml-auto"/>; }
                                        else if (!isSelected && isAnswer) { style = "bg-blue-50 border-blue-300 text-blue-800 font-medium border-dashed"; icon = <span className="ml-auto text-xs font-bold bg-blue-200 text-blue-700 px-2 py-0.5 rounded">Đáp án đúng</span>; }
                                        return (<div key={i} className={`p-3 rounded-lg border flex items-center ${style}`}><span className="w-6 font-bold">{String.fromCharCode(65+i)}.</span><span className="flex-1"><MathRenderer text={opt} allowMarkdown={true} /></span>{icon}</div>);
                                    })}
                                    </div>
                                )}

                                {q.type === 'group' && (
                                    <div className="ml-0 md:ml-10 overflow-hidden rounded-xl border border-gray-300">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-100 text-gray-600 font-bold"><tr><th className="p-3">Nội dung ý</th><th className="p-3 text-center w-24">Bạn chọn</th><th className="p-3 text-center w-24">Đáp án</th></tr></thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {q.subQuestions?.map((sub, i) => {
                                                const userChoice = userAns?.[sub.id];
                                                const correctChoice = sub.correctAnswer;
                                                
                                                const renderBool = (val: any) => { if (val === true) return <span className="text-green-600 font-bold">Đúng</span>; if (val === false) return <span className="text-red-600 font-bold">Sai</span>; return <span className="text-gray-400 italic">--</span>; };
                                                return (<tr key={i} className="hover:bg-gray-50 transition-colors"><td className="p-3 font-medium text-gray-700"><MathRenderer text={sub.content} allowMarkdown={true} /></td><td className="p-3 text-center border-l border-gray-100">{renderBool(userChoice)}</td><td className="p-3 text-center border-l border-gray-100">{renderBool(correctChoice)}</td></tr>);
                                            })}
                                        </tbody>
                                    </table>
                                    </div>
                                )}
                                
                                {q.type === 'text' && (
                                    <div className="ml-10 mt-2">
                                    <div className="mb-2">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Câu trả lời của bạn:</p>
                                        <div className="p-3 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium min-h-[40px] font-mono text-sm">
                                        {typeof userAns === 'string' ? userAns : <span className="text-gray-400 italic">(Bỏ trống)</span>}
                                        </div>
                                    </div>
                                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200"><p className="text-xs font-bold text-yellow-700 uppercase mb-1 flex items-center"><Key className="w-3 h-3 mr-1"/> Đáp án gợi ý:</p><p className="text-yellow-900 text-sm">{q.answer}</p></div>
                                    </div>
                                )}

                                {/* AI HINT BUTTON IN REVIEW */}
                                <div className="mt-4 flex flex-col items-start ml-10">
                                    <button 
                                    onClick={() => handleGetReviewHint(q)} 
                                    disabled={loadingHintId === q.id}
                                    className="text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg flex items-center transition-colors"
                                    >
                                        {loadingHintId === q.id ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : <Sparkles className="w-3 h-3 mr-1"/>}
                                        {activeHint?.id === q.id ? 'Tắt gợi ý' : 'Giải thích chi tiết (AI)'}
                                    </button>
                                    {activeHint?.id === q.id && (
                                        <div className="mt-2 p-4 bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl text-sm w-full animate-fade-in shadow-sm">
                                            <div className="flex items-center gap-2 mb-2 font-bold text-purple-700 border-b border-purple-100 pb-2"><Sparkles className="w-4 h-4"/> Phân tích của AI:</div>
                                            <SmartTextRenderer text={activeHint.content} />
                                        </div>
                                    )}
                                </div>
                             </div>
                          </div>
                      );
                    })}
                </div>
              ) : (
                <div className="bg-gray-100 p-10 rounded-3xl text-center flex flex-col items-center justify-center text-gray-500">
                    <div className="bg-gray-200 p-4 rounded-full mb-4"><EyeOff className="w-8 h-8 text-gray-400"/></div>
                    <p className="font-bold text-lg">Chi tiết bài làm đã bị ẩn</p>
                    <p className="text-sm">Giáo viên không cho phép xem lại đáp án của đề thi này.</p>
                </div>
              )}
          </div>

          <div className="mt-10 flex justify-center w-full">
              <button type="button" onClick={onRetry} className="w-full py-4 bg-[#00897B] text-white rounded-xl font-bold shadow-lg uppercase flex items-center justify-center gap-2 hover:bg-[#00796B] transition-all transform hover:-translate-y-1">
                <LogOut className="w-5 h-5"/> Thoát
              </button>
          </div>
       </div>
    </div>
  );
};

export const StartScreen = ({ exam, onStart, initialCode, initialName, initialClass, user, studentsList = [] }: any) => {
   const [name, setName] = useState(initialName || '');
   const [code, setCode] = useState(initialCode || '');
   const [inputClass, setInputClass] = useState(initialClass || '');
   const [error, setError] = useState('');
   const [isMatched, setIsMatched] = useState(false);
   
   // Logic tự động điền thông tin dựa trên email khi user đăng nhập
   useEffect(() => {
       if (user) {
           // Nếu đã đăng nhập
           if (user.email && studentsList.length > 0) {
               // Tìm học sinh trong danh sách có email trùng khớp
               const matchedStudent = studentsList.find((s: Student) => 
                   s.email && s.email.trim().toLowerCase() === user.email.trim().toLowerCase()
               );

               if (matchedStudent) {
                   setName(matchedStudent.name);
                   setInputClass(matchedStudent.className);
                   setIsMatched(true);
               } else {
                   // Fallback nếu không tìm thấy trong danh sách import
                   setName(user.name);
                   setInputClass(user.className || '');
                   setIsMatched(false);
               }
           } else {
               // Fallback cơ bản
               setName(user.name);
               setInputClass(user.className || '');
           }
       } else {
           // Nếu chưa đăng nhập, dùng giá trị initial (từ URL)
           if (initialName) setName(initialName);
           if (initialClass) setInputClass(initialClass);
       }
   }, [user, studentsList, initialName, initialClass]);
   
   // Cập nhật code từ URL
   useEffect(() => { if(initialCode) setCode(initialCode); }, [initialCode]);

   const handleLogin = async () => { 
      // 1. Check Security Code
      if (code.toUpperCase() !== exam.securityCode) { 
          setError('Mã bảo mật sai!'); 
          return; 
      } 
      
      // 2. Check Max Attempts
      if (exam.maxAttempts && exam.maxAttempts > 0) {
          const prevAttempts = (exam.results || []).filter((r: any) => 
              r.name.trim().toLowerCase() === name.trim().toLowerCase() && 
              r.className.trim().toLowerCase() === inputClass.trim().toLowerCase()
          ).length;

          if (prevAttempts >= exam.maxAttempts) {
              setError(`Bạn đã làm bài ${prevAttempts}/${exam.maxAttempts} lần. Không thể làm tiếp.`);
              return;
          }
      }
      
      // 3. Request Fullscreen before starting
      await requestFullscreen();
      
      onStart(name, inputClass); 
   };

   // Check if form is filled to enable button visually
   const isFormFilled = name && code && inputClass;
   
   return (
      <div className="quiz-background w-full p-4 justify-center items-center flex min-h-screen font-poppins">
         <div className="bg-white w-full max-w-[380px] rounded-[30px] shadow-2xl overflow-hidden relative border border-gray-100">
            {/* Header Line */}
            <div className="bg-white p-5 border-b border-gray-100 text-center">
                <h2 className="text-teal-700 font-bold text-lg uppercase tracking-wide">THÔNG TIN DỰ THI</h2>
            </div>

            <div className="p-8 flex flex-col items-center">
               {/* Avatar Section */}
               <div className="relative mb-3">
                   <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 border-4 border-white shadow-lg">
                       <User className="w-10 h-10" />
                   </div>
                   {/* Status Dot */}
                   <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white"></div>
               </div>

               {/* Name Display (Large) */}
               <h3 className="text-xl font-black text-gray-800 mb-2 text-center">
                   {name || "Khách"}
               </h3>

               {/* Exam Info Pill */}
               <div className="bg-gray-100 px-4 py-1.5 rounded-full text-xs font-bold text-gray-500 mb-8 flex items-center gap-2">
                   <Clock className="w-3.5 h-3.5" /> {exam.duration} phút • {exam.questions?.length || 0} câu
               </div>

               {/* Error Message */}
               {error && (
                   <div className="w-full bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 font-bold flex items-center gap-2 animate-pulse">
                       <AlertCircle className="w-4 h-4" /> {error}
                   </div>
               )}

               {/* Form Inputs */}
               <div className="w-full space-y-4">
                   {/* Name Input */}
                   <div>
                       <label className="block text-[10px] font-bold text-teal-600 uppercase mb-1.5 tracking-wider">HỌ TÊN HỌC SINH</label>
                       <input
                           type="text"
                           className={`w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm font-bold text-gray-700 focus:bg-white focus:border-teal-500 focus:ring-2 ring-teal-100 transition-all ${user ? 'bg-gray-100 opacity-80 cursor-not-allowed' : ''}`}
                           placeholder="Nhập họ và tên..."
                           value={name}
                           onChange={e => !user && setName(e.target.value)}
                           readOnly={!!user}
                       />
                   </div>

                   {/* Class Input */}
                   <div>
                       <label className="block text-[10px] font-bold text-teal-600 uppercase mb-1.5 tracking-wider">LỚP</label>
                       <input
                           type="text"
                           className={`w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm font-bold text-gray-700 focus:bg-white focus:border-teal-500 focus:ring-2 ring-teal-100 transition-all ${user ? 'bg-gray-100 opacity-80 cursor-not-allowed' : ''}`}
                           placeholder="Nhập tên lớp..."
                           value={inputClass}
                           onChange={e => !user && setInputClass(e.target.value)}
                           readOnly={!!user}
                       />
                   </div>

                   {/* Security Code Input */}
                   <div>
                       <label className="block text-[10px] font-bold text-teal-600 uppercase mb-1.5 tracking-wider">MÃ BẢO MẬT</label>
                       <input
                           type="text"
                           className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm font-black text-gray-700 text-center tracking-[0.3em] uppercase focus:bg-white focus:border-teal-500 focus:ring-2 ring-teal-100 transition-all placeholder:font-normal placeholder:tracking-normal"
                           placeholder="******"
                           value={code}
                           onChange={e => setCode(e.target.value)}
                           maxLength={6}
                       />
                   </div>

                   {/* Submit Button */}
                   <button
                       onClick={handleLogin}
                       disabled={!isFormFilled}
                       className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wide mt-4 transition-all transform active:scale-95
                           ${isFormFilled
                               ? 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-600 hover:from-teal-500 hover:to-teal-600 hover:text-white shadow-lg hover:shadow-teal-200'
                               : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                   >
                       VÀO THI NGAY
                   </button>
               </div>
            </div>
            
            {/* Top Decorative Line */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-teal-600"></div>
         </div>
      </div>
   );
};

export const QuizScreen = ({ questions = [], duration, allowHints, onFinish, studentName, className }: any) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [timeLeft, setTimeLeft] = useState(duration * 60); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(true);

  // Load KaTeX libraries for math rendering
  useEffect(() => {
     loadExternalLibs();
  }, []);

  // Anti-cheat mechanisms
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', prevent);
    document.addEventListener('copy', prevent);
    document.addEventListener('paste', prevent);

    const handleViolation = () => {
        if (!isSubmitting) {
            setViolations(v => v + 1);
            setShowWarning(true);
        }
    };

    const handleVisibility = () => { 
        if (document.hidden) {
            handleViolation();
        }
    };
    
    const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
            setIsFullscreen(false);
            // Only penalize if we were previously in fullscreen and it wasn't a submit action
            if (!isSubmitting) {
                handleViolation();
            }
        } else {
            setIsFullscreen(true);
        }
    };

    // Detect switching windows/tabs or Alt+Tab
    const handleWindowBlur = () => {
        handleViolation();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('blur', handleWindowBlur);
    
    // Initial check
    if (!document.fullscreenElement) {
        setIsFullscreen(false);
    }

    return () => {
        document.removeEventListener('contextmenu', prevent);
        document.removeEventListener('copy', prevent);
        document.removeEventListener('paste', prevent);
        document.removeEventListener('visibilitychange', handleVisibility);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isSubmitting]);

  // Fix Timer Logic to prevent stale answers closure
  useEffect(() => {
    const timer = setInterval(() => {
        setTimeLeft((prev) => {
            if (prev <= 0) return 0;
            return prev - 1;
        });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitor timeLeft to trigger finish
  useEffect(() => {
    if (timeLeft === 0 && !isSubmitting) {
        // Automatically submit when time is up
        setIsSubmitting(true);
        onFinish(answers, duration * 60, violations);
    }
  }, [timeLeft, isSubmitting, answers, violations, duration, onFinish]);


  const currentQ = questions[currentIdx];
  if(!currentQ) return <div className="min-h-screen flex items-center justify-center text-teal-600 font-bold">Đang tải dữ liệu câu hỏi...</div>;

  const handleChoice = (val: string) => setAnswers({...answers, [currentQ.id]: val});
  const handleGroupChoice = (subId: string, val: boolean) => {
     const prevGroup = answers[currentQ.id] || {};
     setAnswers({...answers, [currentQ.id]: { ...prevGroup, [subId]: val }});
  };

  const checkSubmit = () => {
     let unanswered = 0;
     questions.forEach((q: any) => {
         if (q.type === 'group') { if (Object.keys(answers[q.id] || {}).length < q.subQuestions.length) unanswered++; } 
         else if (!answers[q.id] && q.type !== 'text') unanswered++;
         else if (q.type === 'text' && (!answers[q.id] || !answers[q.id].trim())) unanswered++;
     });
     setUnansweredCount(unanswered);
     setShowConfirm(true); 
  };

  const doSubmit = () => {
     setIsSubmitting(true);
     setTimeout(() => onFinish(answers, duration*60 - timeLeft, violations), 1000);
  };
  
  const handleReturnToExam = async () => {
      await requestFullscreen();
      setShowWarning(false);
  };

  if (isSubmitting) return <div className="min-h-screen w-full flex flex-col items-center justify-center quiz-background"><style>{FLASHCARD_STYLES}</style><div className="card-3d p-10 flex flex-col items-center h-auto"><Loader2 className="w-12 h-12 animate-spin text-teal-600 mb-4"/><p className="font-bold text-gray-600">Đang nộp bài...</p></div></div>;

  return (
    <div className="quiz-background w-full p-6 pt-10 relative">
       <style>{FLASHCARD_STYLES}</style>
       
       {/* FORCE FULLSCREEN OVERLAY */}
       {!isFullscreen && !showWarning && !isSubmitting && (
         <div className="fixed inset-0 bg-teal-900/95 z-[100] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl border-4 border-teal-500">
                <div className="bg-teal-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><Maximize className="w-10 h-10 text-teal-600" /></div>
                <h2 className="text-2xl font-black text-teal-800 mb-4 uppercase">Chế độ toàn màn hình</h2>
                <p className="text-gray-600 mb-8 font-medium">Để đảm bảo tính công bằng, bạn bắt buộc phải làm bài ở chế độ toàn màn hình.</p>
                <button onClick={handleReturnToExam} className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg uppercase tracking-wide">Bật Fullscreen và Làm bài</button>
            </div>
         </div>
       )}

       {/* PROGRESS BAR */}
       <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-200 z-50">
          <div 
             className="h-full bg-teal-500 transition-all duration-300 ease-out" 
             style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
       </div>
       
       {showWarning && (
        <div className="fixed inset-0 bg-red-900/95 z-[100] flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl">
              <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle className="w-10 h-10 text-red-600 animate-pulse" /></div>
              <h2 className="text-2xl font-black text-red-600 mb-2 uppercase">Cảnh báo gian lận!</h2>
              <p className="text-gray-700 mb-4 font-medium">Hệ thống phát hiện bạn đã chuyển cửa sổ hoặc thoát chế độ toàn màn hình.</p>
              <div className="bg-gray-100 p-3 rounded-xl mb-6"><p className="text-xs font-bold text-gray-500 uppercase">Số lần vi phạm</p><p className="text-4xl font-black text-red-600">{violations}</p></div>
              <button onClick={handleReturnToExam} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg uppercase">Quay lại làm bài (Fullscreen)</button>
           </div>
        </div>
       )}

       {showConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
           <div className="card-3d w-full max-w-sm h-auto">
              <div className="card-header bg-[#00897B] text-white justify-center">
                  <span className="flex items-center gap-2 text-lg font-bold uppercase"><CheckCircle className="w-6 h-6"/> Nộp bài</span>
              </div>
              <div className="card-body text-center p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Bạn có chắc chắn muốn nộp?</h3>
                  {unansweredCount > 0 ? (
                      <p className="text-gray-600 mb-6 text-sm">
                          Bạn còn <span className="text-red-600 font-black text-lg">{unansweredCount}</span> câu hỏi chưa làm.
                      </p>
                  ) : (
                      <p className="text-green-600 mb-6 text-sm font-bold">Bạn đã hoàn thành tất cả câu hỏi.</p>
                  )}
                  <p className="text-gray-500 mb-8 text-xs italic">Hãy kiểm tra kỹ lại các câu trả lời trước khi kết thúc.</p>
                  <button onClick={doSubmit} className="w-full py-3 bg-[#00897B] hover:bg-[#00796B] text-white font-bold rounded-xl shadow-lg uppercase mb-3">Nộp bài</button>
                  <button onClick={() => setShowConfirm(false)} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl uppercase">Quay lại</button>
              </div>
           </div>
        </div>
       )}

       <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 select-none h-full items-start">
          {/* MAIN QUESTION CARD - LEFT SIDE */}
          <div className="lg:col-span-9 flex flex-col">
             
             {/* HEADER FOR QUESTION SECTION */}
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl text-teal-700 uppercase tracking-wide font-mustica">{currentQ.section || 'PHẦN THI CHUNG'}</h2>
                 <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold border border-teal-200">{currentIdx + 1} / {questions.length}</span>
             </div>

             <div className="card-3d h-full min-h-[600px] border-none shadow-xl">
                <div className="card-body flex flex-col p-8">
                   <div className="flex items-start gap-4 mb-6">
                      <div className="bg-[#00897B] text-white font-bold text-base px-3 py-1.5 rounded-lg h-fit shadow-md whitespace-nowrap min-w-[80px] text-center">Câu {currentIdx + 1}:</div>
                      <h2 className="question-text flex-1 whitespace-pre-line text-lg text-[#004D40]"><MathRenderer text={currentQ.question} allowMarkdown={true} /></h2>
                   </div>
                   
                   <div className="flex-grow pl-2 overflow-y-auto">
                      {currentQ.type === 'choice' && (
                         <div className="space-y-4">
                            {currentQ.options?.map((opt: string, i: number) => (
                               <label key={i} className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all group ${answers[currentQ.id] === opt ? 'border-teal-500 bg-teal-50/50' : 'border-gray-100 hover:border-teal-200 hover:bg-gray-50'}`}>
                                  <input type="radio" name={`q_${currentQ.id}`} className="hidden" checked={answers[currentQ.id] === opt} onChange={() => handleChoice(opt)} />
                                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${answers[currentQ.id] === opt ? 'border-teal-600 bg-teal-600' : 'border-gray-300 group-hover:border-teal-400'}`}>{answers[currentQ.id] === opt && <Check className="w-5 h-5 text-white" />}</div>
                                  <span className="font-bold text-gray-400 w-8 text-lg">{String.fromCharCode(65+i)}.</span>
                                  {/* Changed span to div to allow block elements (code blocks) */}
                                  <div className={`text-lg flex-1 ${answers[currentQ.id] === opt ? 'text-teal-900 font-medium' : 'text-gray-600'}`}><MathRenderer text={opt} allowMarkdown={true} /></div>
                               </label>
                            ))}
                         </div>
                      )}

                      {currentQ.type === 'group' && (
                         <div className="border border-gray-200 rounded-2xl overflow-hidden">
                            <div className="bg-gray-50 p-4 flex items-center font-bold text-gray-500 text-xs uppercase tracking-wider gap-4">
                               <div className="flex-1">Nội dung mệnh đề</div>
                               <div className="w-14 text-center">Đúng</div>
                               <div className="w-14 text-center">Sai</div>
                            </div>
                            <div className="divide-y divide-gray-100">
                               {currentQ.subQuestions?.map((sub: SubQuestion, i: number) => {
                                  const userChoice = answers[currentQ.id]?.[sub.id];
                                  return (
                                    <div key={i} className="flex items-center p-4 hover:bg-teal-50/30 transition-colors gap-4">
                                       <div className="flex-1 text-gray-800 font-medium"><span className="font-bold mr-2 text-gray-400">{String.fromCharCode(97+i)})</span> <MathRenderer text={sub.content} allowMarkdown={true} /></div>
                                       <div className="w-14 text-center"><input type="radio" name={`sub_${sub.id}`} className="w-6 h-6 text-green-600 cursor-pointer accent-green-600" checked={userChoice === true} onChange={() => handleGroupChoice(sub.id, true)} /></div>
                                       <div className="w-14 text-center"><input type="radio" name={`sub_${sub.id}`} className="w-6 h-6 text-red-600 cursor-pointer accent-red-600" checked={userChoice === false} onChange={() => handleGroupChoice(sub.id, false)} /></div>
                                    </div>
                                  );
                               })}
                            </div>
                         </div>
                      )}

                      {currentQ.type === 'text' && (
                         <textarea className="flashcard-input" placeholder="Nhập câu trả lời của bạn tại đây..." value={answers[currentQ.id] || ''} onChange={e => handleChoice(e.target.value)} />
                      )}
                   </div>

                   <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                      <div className="flex gap-3">
                         <button onClick={() => setCurrentIdx(p => Math.max(0, p-1))} disabled={currentIdx===0} className="px-5 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition-colors flex items-center"><ChevronLeft className="w-5 h-5 mr-1"/> Trước</button>
                      </div>
                      <button onClick={() => setCurrentIdx(p => Math.min(questions.length-1, p+1))} disabled={currentIdx===questions.length-1} className="px-8 py-3 bg-[#00897B] text-white rounded-xl font-bold disabled:opacity-50 hover:bg-[#00796B] shadow-lg transition-all flex items-center">Tiếp theo <ChevronRight className="w-5 h-5 ml-1"/></button>
                   </div>
                </div>
             </div>
          </div>

          {/* SIDEBAR - RIGHT SIDE */}
          <div className="lg:col-span-3 flex flex-col gap-6">
             
             {/* 1. STUDENT INFO CARD (TOP) */}
             <div className="card-3d h-auto">
                <div className="card-header text-[#00695C] bg-white justify-center border-b border-gray-100 py-4">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase"><User className="w-3.5 h-3.5"/> Thông tin thí sinh</span>
                </div>
                <div className="card-body p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">HỌ VÀ TÊN</p>
                            <p className="text-sm font-black text-gray-800 truncate" title={studentName}>{studentName || "Thí sinh tự do"}</p>
                        </div>
                        <div className="shrink-0 text-right pl-3 border-l border-gray-100">
                             <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">LỚP</p>
                             <div className="px-2 py-1 bg-teal-50 rounded text-center min-w-[40px]">
                                <p className="text-sm font-bold text-teal-600">{className || "N/A"}</p>
                             </div>
                        </div>
                    </div>
                </div>
             </div>

             {/* 2. TIMER CARD */}
             <div className="card-3d h-auto">
                <div className="card-header text-[#00695C] bg-white justify-center border-b border-gray-100 py-4">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase"><Clock className="w-3.5 h-3.5"/> THỜI GIAN</span>
                </div>
                <div className="card-body p-6 text-center">
                    <div className={`text-4xl font-mono font-black tracking-widest ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-[#00897B]'}`}>
                        {Math.floor(timeLeft/60)} : {String(timeLeft%60).padStart(2,'0')}
                    </div>
                    {violations > 0 && <div className="mt-4 p-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 flex items-center justify-center gap-1 animate-pulse"><AlertTriangle className="w-3 h-3"/> {violations} vi phạm</div>}
                </div>
             </div>

             {/* 3. QUESTION NAV */}
             <div className="card-3d flex-1 min-h-[200px]">
                <div className="card-header text-[#00695C] bg-white justify-center border-b border-gray-100 py-4">
                    <span className="text-xs font-bold uppercase">DANH SÁCH CÂU HỎI</span>
                </div>
                <div className="card-body p-4 overflow-y-auto">
                    <div className="grid grid-cols-5 gap-2">
                        {questions.map((q: Question, i: number) => {
                            const isDone = q.type === 'group' ? (answers[q.id] && Object.keys(answers[q.id]).length === (q.subQuestions?.length || 0)) : (q.type === 'text' ? !!answers[q.id]?.trim() : !!answers[q.id]);
                            const isCurrent = currentIdx === i;
                            let btnClass = "aspect-square rounded-lg font-bold text-xs border transition-all flex items-center justify-center ";
                            if (isCurrent) btnClass += "bg-[#00897B] text-white border-[#00897B] shadow-md ";
                            else if (isDone) btnClass += "bg-[#436EEE] text-white border-[#436EEE] font-bold shadow-sm ";
                            else btnClass += "bg-white text-gray-400 border-gray-100 hover:bg-gray-50 ";
                            return <button key={q.id} onClick={() => setCurrentIdx(i)} className={btnClass}>{i+1}</button>
                        })}
                    </div>
                </div>
             </div>

             {/* 4. SUBMIT BUTTON */}
             <button onClick={checkSubmit} className="w-full py-4 bg-[#00897B] hover:bg-[#00796B] text-white rounded-xl font-bold shadow-lg uppercase flex justify-center items-center group transition-colors">
                <CheckCircle className="w-5 h-5 mr-2"/> NỘP BÀI
             </button>

          </div>
       </div>
    </div>
  );
};