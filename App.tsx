import React, { useState, useEffect } from 'react';
import { ExamConfig, StudentResult, Student, User } from './types';
import { DashboardLayout, ExamList, PublishView, ExamEditor, ScoreManager, StudentManager, DashboardOverview } from './components/Dashboard';
import { CreateExamModal, AssignExamModal, PublishExamModal } from './components/Modals';
import { StartScreen, QuizScreen, ResultScreen } from './components/Player';
import { INITIAL_QUESTIONS } from './types';
import { authService } from './services/mockAuth';
import { LoginModal } from './components/AuthModals';
import { LogOut, RotateCcw, AlertTriangle } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'editor' | 'exam' | 'student_entry'>('dashboard');
  const [dashTab, setDashTab] = useState<'overview' | 'list' | 'publish' | 'scores' | 'students' | 'attendance' | 'violations' | 'rewards'>('overview');
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Modal State
  const [showPostExamModal, setShowPostExamModal] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const [showPublish, setShowPublish] = useState(false); // State cho modal xuất bản từ list

  // Load exams from localStorage with error handling
  const [exams, setExams] = useState<ExamConfig[]>(() => {
    try {
      const saved = localStorage.getItem('quiz_master_data');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to load exams:", e);
      return [];
    }
  });

  // Load students from localStorage with error handling
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('quiz_master_students');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to load students:", e);
      return [];
    }
  });

  const [currentExam, setCurrentExam] = useState<ExamConfig | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [examState, setExamState] = useState<'start' | 'playing' | 'finished'>('start');
  const [examResult, setExamResult] = useState<any>(null);
  
  // Track current student info
  const [studentInfo, setStudentInfo] = useState<{name: string, className: string}>({ name: '', className: '' });
  
  // Auto-fill data from URL if present
  const [urlCode, setUrlCode] = useState('');
  const [urlName, setUrlName] = useState('');
  const [urlClass, setUrlClass] = useState('');

  // Check Auth on Mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
        setCurrentUser(user);
        // Khi load trang, nếu là học sinh thì vào thẳng Dashboard và tab Publish
        if (user.role === 'student') {
             setView('dashboard');
             setDashTab('publish');
        }
    }
    setLoadingAuth(false);
  }, []);

  const handleLoginSuccess = (user: User) => {
      setCurrentUser(user);
      // Logic mới: Cả giáo viên và học sinh đều vào Dashboard
      setView('dashboard');
      if (user.role === 'student') {
          setDashTab('publish'); // Mặc định vào tab Xuất bản cho học sinh
      }
      setShowLoginModal(false);
  };

  const handleLogout = () => {
      authService.logout();
      // Logic reload is inside authService.logout()
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('quiz_master_data', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('quiz_master_students', JSON.stringify(students));
  }, [students]);

  // Handle URL Routing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const examId = params.get('examId');
    const code = params.get('code');
    const name = params.get('name');
    const className = params.get('class');

    if (examId) {
      const foundExam = exams.find(e => e.id === examId);
      if (foundExam) {
        // Fix: Prevent resetting state if we are already viewing this exam (e.g. after submission updates)
        if (view === 'exam' && currentExam?.id === examId) {
            // Only update currentExam if data has changed (like new results), don't reset view
            const needsUpdate = JSON.stringify(foundExam.results) !== JSON.stringify(currentExam.results);
            if (needsUpdate) setCurrentExam(foundExam);
            return;
        }

        setCurrentExam(foundExam);
        
        // Nếu có URL examId, ưu tiên vào mode thi
        setView('exam');
        setExamState('start');
        
        if (code) setUrlCode(code);
        if (name) setUrlName(name);
        if (className) setUrlClass(className);
        
        // Nếu có đầy đủ thông tin, set luôn student info để sẵn sàng
        if (name && className) {
           setStudentInfo({ name, className });
        }
      } else {
        console.warn("Exam ID from URL not found in local storage");
      }
    }
  }, [exams]);

  // Student Management Handlers
  const handleAddStudent = (s: Student) => setStudents(prev => [s, ...prev]);
  const handleEditStudent = (s: Student) => setStudents(prev => prev.map(st => st.id === s.id ? s : st));
  
  // Fix: Use functional updates to avoid stale state
  const handleDeleteStudent = (id: string) => { 
    setStudents(prev => prev.filter(s => s.id !== id)); 
  };
  
  const handleBatchDeleteStudents = (ids: string[]) => {
      setStudents(prev => prev.filter(s => !ids.includes(s.id)));
  };
  
  const handleImportStudents = (newStudents: Student[]) => setStudents(prev => [...newStudents, ...prev]);

  const handleStartExam = (name: string, className: string) => {
     setStudentInfo({ name, className });
     setExamState('playing');
  };
  
  const handlePlayExam = (exam: ExamConfig) => {
      setCurrentExam(exam);
      
      // LOGIC MỚI: Nếu đã đăng nhập (Teacher/Student) => Bỏ qua màn hình Start, vào thi ngay
      if (currentUser) {
          setStudentInfo({ 
              name: currentUser.name, 
              className: currentUser.className || (currentUser.role === 'teacher' ? 'Giáo Viên' : '') 
          });
          setExamState('playing');
      } else {
          // Nếu chưa đăng nhập (Guest/Link ngoài) => Vào màn hình nhập thông tin
          setExamState('start');
          setUrlCode(''); 
          setUrlName('');
          setUrlClass('');
      }
      
      setView('exam');
  };

  const handleAssignExamClick = (exam: ExamConfig) => {
      setCurrentExam(exam);
      setShowAssign(true);
  };

  const handlePublishClick = (exam: ExamConfig) => {
      setCurrentExam(exam);
      setShowPublish(true);
  };

  const handlePublishConfirm = (settings: any) => {
      if (!currentExam) return;
      const updatedExam = { ...currentExam, ...settings };
      setExams(prev => prev.map(e => e.id === updatedExam.id ? updatedExam : e));
      setCurrentExam(updatedExam);
      // Note: Modal will handle step change to success, no need to close here immediately
  };

  const handleCreateAnotherExam = () => {
    setView('dashboard');
    setDashTab('list');
    setShowCreate(true);
  };

  const handleFinishExam = (answers: any, time: number, viol: number) => {
    let score = 0;
    
    let correctCount = 0;
    let wrongCount = 0;
    let emptyCount = 0;

    const grading = currentExam?.gradingConfig || { 
      part1Total: 5, 
      part2Total: 2, 
      part3Total: 2, 
      part4Total: 1, 
      groupGradingMethod: 'progressive' 
    };

    const choiceQs = currentExam?.questions.filter(q => q.type === 'choice') || [];
    const groupQs = currentExam?.questions.filter(q => q.type === 'group') || [];
    const textQs = currentExam?.questions.filter(q => q.type === 'text') || [];

    const scorePerChoice = choiceQs.length > 0 ? grading.part1Total / choiceQs.length : 0;
    const scorePerGroup = groupQs.length > 0 ? grading.part2Total / groupQs.length : 0;
    const scorePerText = textQs.length > 0 ? grading.part3Total / textQs.length : 0;

    const maxScore = 
      (choiceQs.length > 0 ? grading.part1Total : 0) + 
      (groupQs.length > 0 ? grading.part2Total : 0) + 
      (textQs.length > 0 ? grading.part3Total : 0);

    currentExam?.questions.forEach(q => {
       let isQuestionCorrect = false;
       let isQuestionEmpty = false;

       if (q.type === 'choice') {
          if (!answers[q.id]) {
             isQuestionEmpty = true;
          } else if (answers[q.id] === q.answer) {
             score += scorePerChoice;
             isQuestionCorrect = true;
          }
       } else if (q.type === 'group') {
          let subCorrect = 0;
          let subAnswered = 0;
          const totalSub = q.subQuestions?.length || 0;
          
          q.subQuestions?.forEach(sub => {
             if (answers[q.id]?.[sub.id] !== undefined) {
                subAnswered++;
                if (answers[q.id]?.[sub.id] === sub.correctAnswer) {
                   subCorrect++;
                }
             }
          });

          if (subAnswered === 0) isQuestionEmpty = true;
          
          if (grading.groupGradingMethod === 'equal') {
             if (totalSub > 0) {
                score += (scorePerGroup / totalSub) * subCorrect;
             }
          } else {
             if (subCorrect === 1) score += scorePerGroup * 0.1;
             else if (subCorrect === 2) score += scorePerGroup * 0.25;
             else if (subCorrect === 3) score += scorePerGroup * 0.50;
             else if (subCorrect === totalSub && totalSub > 0) score += scorePerGroup * 1.0;
          }

          if (subCorrect === totalSub && totalSub > 0) isQuestionCorrect = true;

       } else if (q.type === 'text') {
           if (!answers[q.id]) {
             isQuestionEmpty = true;
          } else if (q.answer && answers[q.id]?.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
              score += scorePerText;
              isQuestionCorrect = true;
          }
       }

       if (isQuestionEmpty) emptyCount++;
       else if (isQuestionCorrect) correctCount++;
       else if (!isQuestionEmpty && !isQuestionCorrect) wrongCount++; 
    });

    const resultData: StudentResult = {
      id: Date.now().toString(),
      name: studentInfo.name,
      className: studentInfo.className,
      score: score,
      total: maxScore > 0 ? maxScore : 10,
      date: new Date().toLocaleString(),
      timeSpent: time,
      violations: viol,
      counts: { correct: correctCount, wrong: wrongCount, empty: emptyCount },
      answers: answers
    };

    setExamResult({ ...resultData, answers });
    setExamState('finished');

    if (currentExam) {
       setExams(prevExams => prevExams.map(e => {
          if (e.id === currentExam.id) {
             const updatedExam = { ...e, results: [resultData, ...(e.results || [])] };
             setCurrentExam(updatedExam);
             return updatedExam;
          }
          return e;
       }));
    }
  };

  // Logic to handle "Thoát" button click on ResultScreen
  const handleRequestExit = () => {
      // 1. Calculate how many attempts this student has used for THIS exam
      const attemptsUsed = (currentExam?.results || []).filter(r => 
          r.name.trim().toLowerCase() === studentInfo.name.trim().toLowerCase() && 
          r.className.trim().toLowerCase() === studentInfo.className.trim().toLowerCase()
      ).length;

      // 2. Check against maxAttempts
      const max = currentExam?.maxAttempts || 0;
      const available = max === 0 || attemptsUsed < max;

      setCanRetry(available);
      setShowPostExamModal(true);
  };

  // Logic to confirm "Vào thi" (Retry)
  const handleConfirmRetry = () => {
      setShowPostExamModal(false);
      
      // Nếu là User đã đăng nhập, khi Retry thì vào thẳng Playing, không qua Start
      if (currentUser) {
          setExamState('playing');
      } else {
          setExamState('start');
      }
  };

  // Logic to confirm "Thoát" (Return to Dashboard)
  const handleConfirmExit = () => {
      setShowPostExamModal(false);
      
      // Nếu là mode học sinh (URL có examId hoặc user role là student)
      if (window.location.search.includes('examId') || currentUser?.role === 'student') {
          // Reset states
          setExamResult(null);
          setCurrentExam(null);
          setExamState('start');
          
          // Quay về Dashboard
          setView('dashboard');
          setDashTab('publish'); // Mặc định về tab Publish
      } else {
          // Mode giáo viên
          window.history.replaceState(null, "", window.location.pathname);
          setExamResult(null);
          setCurrentExam(null); 
          setExamState('start');
          setView('dashboard');
          setDashTab('list');
      }
  };

  if (loadingAuth) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-teal-600 font-bold">Đang tải...</div>;

  return (
    <>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onLoginSuccess={handleLoginSuccess} />}

      {/* PUBLISH EXAM MODAL (Moved to Global Scope) */}
      {showPublish && currentExam && (
          <PublishExamModal 
              exam={currentExam} 
              onClose={() => setShowPublish(false)} 
              onConfirm={handlePublishConfirm}
              onCreateNew={handleCreateAnotherExam}
              onPlay={() => { setShowPublish(false); handlePlayExam(currentExam); }} 
          />
      )}

      {/* POST EXAM MODAL (Confirm Retry or Exit) */}
      {showPostExamModal && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-poppins">
              <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden transform transition-all scale-100">
                  <div className="p-6 text-center">
                      {canRetry ? (
                          <div className="mb-2">
                              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                  <RotateCcw className="w-8 h-8" />
                              </div>
                              <h3 className="text-xl font-black text-gray-800 mb-2">Bạn có muốn thi lại không?</h3>
                              <p className="text-sm text-gray-500">Bạn vẫn còn lượt làm bài cho đề thi này.</p>
                          </div>
                      ) : (
                          <div className="mb-2">
                              <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
                                  <AlertTriangle className="w-8 h-8" />
                              </div>
                              <h3 className="text-xl font-black text-gray-800 mb-2">Thông báo</h3>
                              <p className="text-sm text-gray-500">Bạn đã hết lượt thi cho đề này.</p>
                          </div>
                      )}
                  </div>
                  
                  <div className="bg-gray-50 p-4 flex gap-3">
                      {canRetry ? (
                          <>
                              <button 
                                  onClick={handleConfirmExit}
                                  className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                              >
                                  Thoát
                              </button>
                              <button 
                                  onClick={handleConfirmRetry}
                                  className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all"
                              >
                                  Vào thi
                              </button>
                          </>
                      ) : (
                          <button 
                              onClick={handleConfirmExit}
                              className="w-full py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-900 transition-colors"
                          >
                              Thoát về trang chủ
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}

      {view === 'dashboard' && (
         <DashboardLayout 
             activeTab={dashTab} 
             onTabChange={setDashTab} 
             onCreateClick={() => setShowCreate(true)}
             user={currentUser}
             // Fix logic quan trọng: isGuest = true chỉ khi không có user. 
             // Nếu user tồn tại (dù là teacher hay student), họ KHÔNG phải là Guest.
             isGuest={!currentUser} 
             onLoginClick={() => setShowLoginModal(true)}
             onLogoutClick={handleLogout}
         >
            {/* Logic: Nếu là guest thì chỉ show overview. Học sinh xem được overview và publish. */}
            {dashTab === 'overview' && <DashboardOverview students={students} exams={exams} />}
            {(!currentUser || currentUser.role === 'teacher') && dashTab === 'list' && <ExamList 
                exams={exams} 
                onSelectExam={(e: any) => { setCurrentExam(e); setView('editor'); }} 
                onDeleteExam={(id: string) => setExams(prev => prev.filter(e => e.id !== id))} 
                onPlayExam={handlePlayExam}
                onAssignExam={handleAssignExamClick}
                onPublish={handlePublishClick}
                onCreate={() => setShowCreate(true)}
            />}
            {/* Tab PublishView: Hiển thị cho cả Giáo viên và Học sinh. Pass handlePlayExam và user. */}
            {dashTab === 'publish' && <PublishView exams={exams} onPlayExam={handlePlayExam} user={currentUser} />}
            
            {(!currentUser || currentUser.role === 'teacher') && dashTab === 'scores' && <ScoreManager exams={exams} />}
            {(!currentUser || currentUser.role === 'teacher') && dashTab === 'students' && <StudentManager 
                students={students} 
                exams={exams}
                onAddStudent={handleAddStudent} 
                onEditStudent={handleEditStudent}
                onDeleteStudent={handleDeleteStudent}
                onDeleteStudents={handleBatchDeleteStudents}
                onImportStudents={handleImportStudents}
            />}
            
            {showCreate && <CreateExamModal onClose={() => setShowCreate(false)} onCreate={(e: any) => { setExams(prev => [e, ...prev]); setCurrentExam(e); setView('editor'); setShowCreate(false); }} />}
            {showAssign && currentExam && <AssignExamModal exam={currentExam} students={students} onClose={() => setShowAssign(false)} />}
            {/* PublishExamModal was moved out */}
         </DashboardLayout>
      )}

      {/* STUDENT ENTRY VIEW - Chỉ dùng khi chưa đăng nhập hoặc vào qua link trực tiếp */}
      {view === 'student_entry' && currentUser?.role === 'student' && (
           <>
               {/* Logic fallback nếu cần, nhưng giờ default là Dashboard */}
           </>
      )}

      {view === 'editor' && currentExam && currentUser?.role === 'teacher' && <ExamEditor exam={currentExam} onUpdate={(upd: any) => { setExams(prev => prev.map(e => e.id === upd.id ? upd : e)); setCurrentExam(upd); }} onBack={() => setView('dashboard')} onPublish={() => setShowPublish(true)} onCreateNew={handleCreateAnotherExam} />}
      
      {view === 'exam' && currentExam && (
         <>
            {examState === 'start' && <StartScreen 
                exam={currentExam} 
                initialCode={urlCode} 
                initialName={urlName}
                initialClass={urlClass}
                user={currentUser} // Pass user to pre-fill info
                studentsList={students} // Truyền danh sách học sinh vào để đối chiếu Email
                onStart={handleStartExam} 
            />}
            {examState === 'playing' && <QuizScreen 
                questions={currentExam.questions} 
                duration={currentExam.duration} 
                allowHints={currentExam.allowHints} 
                studentName={studentInfo.name}
                className={studentInfo.className}
                onFinish={handleFinishExam} 
            />}
            {examState === 'finished' && <ResultScreen {...examResult} questions={currentExam.questions} allowReview={currentExam.allowReview} onRetry={handleRequestExit} />}
         </>
      )}
    </>
  );
}