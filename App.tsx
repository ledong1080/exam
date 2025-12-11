import React, { useState, useEffect } from 'react';
import { ExamConfig, StudentResult, Student } from './types';
import { DashboardLayout, ExamList, PublishView, ExamEditor, ScoreManager, StudentManager, DashboardOverview } from './components/Dashboard';
import { CreateExamModal, AssignExamModal } from './components/Modals';
import { StartScreen, QuizScreen, ResultScreen } from './components/Player';
import { INITIAL_QUESTIONS } from './types';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'editor' | 'exam'>('dashboard');
  const [dashTab, setDashTab] = useState<'overview' | 'list' | 'publish' | 'scores' | 'students' | 'attendance' | 'violations' | 'rewards'>('overview');
  
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
            setCurrentExam(foundExam); // Update local data to reflect new results
            return;
        }

        setCurrentExam(foundExam);
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
      setExamState('start');
      setView('exam');
      setUrlCode(''); 
      setUrlName('');
      setUrlClass('');
  };

  const handleAssignExamClick = (exam: ExamConfig) => {
      setCurrentExam(exam);
      setShowAssign(true);
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

  const handleExit = () => {
    // 1. Nếu là mode học sinh (URL có examId), cố gắng đóng cửa sổ/tab
    if (window.location.search.includes('examId')) {
        window.close();
        // Fallback nếu trình duyệt chặn
        if (!window.closed) {
            alert("Bạn đã hoàn thành bài thi. Vui lòng đóng tab trình duyệt này để thoát.");
        }
    } else {
        // 2. Nếu là mode Admin (preview), quay về Dashboard
        window.history.replaceState(null, "", window.location.pathname);
        setExamResult(null);
        setCurrentExam(null); 
        setExamState('start');
        setView('dashboard');
        setDashTab('list'); // Redirect to Exam List tab
    }
  };

  return (
    <>
      {view === 'dashboard' && (
         <DashboardLayout activeTab={dashTab} onTabChange={setDashTab} onCreateClick={() => setShowCreate(true)}>
            {dashTab === 'overview' && <DashboardOverview students={students} exams={exams} />}
            {dashTab === 'list' && <ExamList 
                exams={exams} 
                onSelectExam={(e: any) => { setCurrentExam(e); setView('editor'); }} 
                onDeleteExam={(id: string) => setExams(prev => prev.filter(e => e.id !== id))} 
                onPlayExam={handlePlayExam}
                onAssignExam={handleAssignExamClick}
                onCreate={() => setShowCreate(true)}
            />}
            {dashTab === 'publish' && <PublishView exams={exams} />}
            {dashTab === 'scores' && <ScoreManager exams={exams} />}
            {dashTab === 'students' && <StudentManager 
                students={students} 
                exams={exams}
                onAddStudent={handleAddStudent} 
                onEditStudent={handleEditStudent}
                onDeleteStudent={handleDeleteStudent}
                onDeleteStudents={handleBatchDeleteStudents}
                onImportStudents={handleImportStudents}
            />}
            
            {/* Placeholders for new tabs */}
            {dashTab === 'attendance' && <div className="p-10 text-center text-gray-500 font-poppins">Chức năng Điểm danh đang phát triển.</div>}
            {dashTab === 'violations' && <div className="p-10 text-center text-gray-500 font-poppins">Chức năng Quản lý vi phạm đang phát triển.</div>}
            {dashTab === 'rewards' && <div className="p-10 text-center text-gray-500 font-poppins">Chức năng Khen thưởng đang phát triển.</div>}

            {showCreate && <CreateExamModal onClose={() => setShowCreate(false)} onCreate={(e: any) => { setExams(prev => [e, ...prev]); setCurrentExam(e); setView('editor'); setShowCreate(false); }} />}
            {showAssign && currentExam && <AssignExamModal exam={currentExam} students={students} onClose={() => setShowAssign(false)} />}
         </DashboardLayout>
      )}
      {view === 'editor' && currentExam && <ExamEditor exam={currentExam} onUpdate={(upd: any) => { setExams(prev => prev.map(e => e.id === upd.id ? upd : e)); setCurrentExam(upd); }} onBack={() => setView('dashboard')} onPublish={() => { setView('exam'); setExamState('start'); }} onCreateNew={handleCreateAnotherExam} />}
      {view === 'exam' && currentExam && (
         <>
            {examState === 'start' && <StartScreen 
                exam={currentExam} 
                initialCode={urlCode} 
                initialName={urlName}
                initialClass={urlClass}
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
            {examState === 'finished' && <ResultScreen {...examResult} questions={currentExam.questions} allowReview={currentExam.allowReview} onRetry={handleExit} />}
         </>
      )}
    </>
  );
}