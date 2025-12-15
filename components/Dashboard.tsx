import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PenTool, Share2, LogOut, FolderPlus, Trash2, Clock, List, Users, FileUp, Plus, PlayCircle, Edit, ArrowLeft, Copy, BarChart3, Search, Download, Filter, Eye, X, UserPlus, Upload, BookOpen, CheckSquare, GraduationCap, Calendar, AlertTriangle, Trophy, FileText, Bell, UserX, Check, LogIn, Lock, Mail, MoreHorizontal, FileInput, ChevronRight, Settings, Globe } from 'lucide-react';
import { ExamConfig, Question, StudentResult, Student, User } from '../types';
import { copyToClipboard, MathRenderer, loadExternalLibs } from '../utils/common';
import { EditQuestionModal, ImportModal, PublishExamModal, StudentModal, ImportStudentModal, AssignExamModal } from './Modals';
import { ResultScreen } from './Player';

const DASHBOARD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

  body {
    background-color: #e0f7fa;
    background-image: 
      radial-gradient(at 0% 0%, rgba(255,255,255,0.8) 0px, transparent 50%),
      radial-gradient(at 90% 90%, rgba(175,238,238,0.5) 0px, transparent 60%);
    background-attachment: fixed;
  }

  /* Font overrides */
  .font-poppins { font-family: 'Poppins', sans-serif; }
  .font-bookman { font-family: 'Bookman Old Style', 'ITC Bookman', 'Georgia', serif; }
  
  /* Header Title Style */
  .app-title {
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    color: #10B981; /* Emerald-500 */
    text-transform: uppercase;
  }
  
  .app-subtitle {
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    color: #3B82F6; /* Blue-500 */
  }

  /* Sidebar Styles */
  .sidebar-btn {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 14px 18px;
    margin-bottom: 8px;
    border-radius: 16px;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    position: relative;
    overflow: hidden;
  }
  
  /* Scrollbar for sidebar - Light Theme for Teal Background */
  .custom-scrollbar-light::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar-light::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar-light::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.3);
    border-radius: 4px;
  }
  .custom-scrollbar-light:hover::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.5);
  }

  /* Card Styles - Updated with light gray border and bold teal shadow (#0D9488) */
  .stat-card {
    background: #ffffff;
    border-radius: 24px;
    padding: 32px;
    /* Light gray border */
    border: 2px solid #E5E7EB;
    /* Bold Shadow using #0D9488 */
    box-shadow: 6px 6px 0px 0px #0D9488;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    position: relative;
    overflow: hidden;
  }
  
  .stat-card:hover {
    transform: translateY(-4px) translateX(-2px);
    box-shadow: 10px 10px 0px 0px #0D9488;
  }

  .icon-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .info-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 24px;
    min-height: 250px;
    box-shadow: 
      0 1px 2px rgba(0,0,0,0.07), 
      0 2px 4px rgba(0,0,0,0.07), 
      0 4px 8px rgba(0,0,0,0.07);
    border: 1px solid rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
`;

export const DashboardOverview = ({ students, exams }: { students: Student[], exams: ExamConfig[] }) => {
  const dateStr = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  // Logic to calculate stats
  const activeStudentSet = new Set<string>();
  let totalViolations = 0;
  let publishedExams = 0;

  if (exams) {
      exams.forEach(exam => {
          if (exam.securityCode) {
              publishedExams++;
          }

          if (exam.results) {
              exam.results.forEach(result => {
                  // Create a unique key based on name and className to identify distinct students
                  const key = `${result.name.trim().toLowerCase()}|${result.className.trim().toLowerCase()}`;
                  activeStudentSet.add(key);
                  
                  // Count violations
                  totalViolations += (result.violations || 0);
              });
          }
      });
  }
  
  const totalActiveStudents = activeStudentSet.size;
  const totalCreatedExams = exams.length;

  const stats = [
    { label: 'Tổng số học sinh', value: totalActiveStudents, sub: 'Đã tham gia thi', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', iconBg: 'bg-blue-600' },
    { label: 'Số đề thi đã tạo', value: totalCreatedExams, sub: 'Tổng đề trong ngân hàng', icon: FileText, color: 'text-teal-600', bg: 'bg-teal-100', iconBg: 'bg-teal-600' },
    { label: 'Đề thi đã xuất bản', value: publishedExams, sub: 'Đang hoạt động', icon: Share2, color: 'text-purple-600', bg: 'bg-purple-100', iconBg: 'bg-purple-600' },
    { label: 'Số lượt vi phạm thi', value: totalViolations, sub: 'Phát hiện gian lận', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', iconBg: 'bg-red-600' },
  ];

  return (
    <div className="space-y-8 font-poppins animate-fade-in">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          Chào mừng trở lại! <span className="text-3xl">👋</span>
        </h2>
        <p className="text-gray-500 mt-1">{dateStr}</p>
      </div>

      {/* Stats Row - 2 Rows Layout (grid-cols-2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card h-full min-h-[180px]">
            <div className="flex flex-col justify-center gap-1">
              {/* Updated font to Bookman and color to darker gray */}
              <p className="text-xl font-bold text-gray-900 mb-2 font-bookman tracking-tight">{stat.label}</p>
              <p className={`text-5xl font-black ${stat.color} mb-2`}>{stat.value}</p>
              <p className="text-sm text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full w-fit">{stat.sub}</p>
            </div>
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${stat.iconBg} text-white shadow-xl shadow-gray-200 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-10 h-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export interface DashboardLayoutProps {
    children?: React.ReactNode; 
    activeTab: string; 
    onTabChange: (tab: any) => void; 
    onCreateClick: () => void;
    user: User | null;
    isGuest?: boolean;
    onLoginClick: () => void;
    onLogoutClick: () => void;
}

export const DashboardLayout = ({ 
    children, 
    activeTab, 
    onTabChange, 
    onCreateClick,
    user,
    isGuest = false,
    onLoginClick,
    onLogoutClick
}: DashboardLayoutProps) => {
  
  // Navigation Config
  const sidebarGroups = [
    {
      title: "",
      items: [
         { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, activeColor: 'text-purple-600', bgColor: 'bg-purple-50', hoverColor: 'hover:text-purple-600', hoverBg: 'hover:bg-purple-50' },
         { id: 'students', label: 'Quản lý học sinh', icon: Users, activeColor: 'text-blue-600', bgColor: 'bg-blue-50', hoverColor: 'hover:text-blue-600', hoverBg: 'hover:bg-blue-50' },
         { id: 'list', label: 'Quản lý đề thi', icon: FileText, activeColor: 'text-teal-600', bgColor: 'bg-teal-50', hoverColor: 'hover:text-teal-600', hoverBg: 'hover:bg-teal-50' },
         { id: 'scores', label: 'Báo cáo điểm', icon: BarChart3, activeColor: 'text-emerald-600', bgColor: 'bg-emerald-50', hoverColor: 'hover:text-emerald-600', hoverBg: 'hover:bg-emerald-50' },
         { id: 'publish', label: 'Xuất bản', icon: Share2, activeColor: 'text-cyan-600', bgColor: 'bg-cyan-50', hoverColor: 'hover:text-cyan-600', hoverBg: 'hover:bg-cyan-50' },
       
      ]
    },
    
  ];

  return (
    <div className="flex h-screen bg-transparent font-poppins overflow-hidden">
      <style>{DASHBOARD_STYLES}</style>
      
      {/* SIDEBAR */}
      <div className={`w-64 bg-gradient-to-b from-[#0D9488] to-[#0D9488] border-2 border-gray-100 flex flex-col z-20 shadow-xl m-4 rounded-[20px] text-white shrink-0 ${isGuest ? 'opacity-90' : ''}`}>
         <div className="p-6 border-b border-white/20">
             <div className="flex items-center gap-2">
                 <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                     <GraduationCap className="w-6 h-6 text-white"/>
                 </div>
                 <div>
                    <h1 className="text-sm font-black text-white tracking-wide">QUIZ MASTER</h1>
                    <p className="text-[10px] text-teal-100 font-bold opacity-80">EDUCATION V3.0</p>
                 </div>
             </div>
         </div>
         
         <div className="flex-1 py-6 px-4 overflow-y-auto custom-scrollbar-light relative">
            {isGuest && (
                 <div className="absolute inset-0 z-10 bg-teal-900/10 backdrop-blur-[1px] cursor-not-allowed flex items-center justify-center">
                 </div>
            )}
            <nav className="space-y-3">
               {sidebarGroups.map((group, gIdx) => (
                  <div key={gIdx}>
                     {group.title && <p className="px-4 text-[10px] font-black text-teal-200 uppercase mb-3 tracking-wider">{group.title}</p>}
                     <div className="space-y-1">
                        {group.items.map((item) => {
                           // Logic ẩn/hiện dựa trên Role
                           if (user?.role === 'student') {
                               // Học sinh chỉ được thấy 'overview' và 'publish'
                               if (item.id !== 'overview' && item.id !== 'publish') return null;
                           }

                           const isActive = activeTab === item.id;
                           return (
                              <button 
                                 key={item.id}
                                 onClick={() => !isGuest && onTabChange(item.id)}
                                 disabled={isGuest}
                                 className={`sidebar-btn group transition-all duration-300 ease-in-out border
                                    ${isActive && !isGuest
                                        ? `bg-white text-[#0D9488] font-bold shadow-lg border-white translate-x-2` 
                                        : `text-teal-50 hover:bg-white/10 hover:text-white border-transparent hover:shadow-sm hover:translate-x-1`
                                    } ${isGuest ? 'opacity-50' : ''}`}
                              >
                                 <div className={`mr-3 transition-colors ${isActive && !isGuest ? 'text-[#0D9488]' : 'text-teal-200 group-hover:text-white'}`}>
                                    {isGuest && item.id !== 'overview' ? <Lock className="w-4 h-4" /> : <item.icon className="w-5 h-5" />}
                                 </div>
                                 <span className="flex-1 text-left">{item.label}</span>
                                 {isActive && !isGuest && <div className="w-1.5 h-1.5 rounded-full bg-[#0D9488] ml-2"></div>}
                              </button>
                           );
                        })}
                     </div>
                  </div>
               ))}
            </nav>
         </div>
         
         <div className="p-4 border-t border-white/20">
             {isGuest ? (
                 <button onClick={onLoginClick} className="w-full flex items-center justify-center gap-2 bg-white text-teal-700 font-bold text-sm p-3 rounded-xl transition-all shadow-lg hover:bg-gray-100">
                     <LogIn className="w-4 h-4" /> Đăng nhập
                 </button>
             ) : (
                 <button onClick={onLogoutClick} className="w-full flex items-center justify-center gap-2 text-white/90 font-bold text-sm p-3 hover:bg-white/10 rounded-xl transition-colors border border-transparent hover:border-white/20 shadow-sm">
                     <LogOut className="w-4 h-4" /> Đăng xuất ({user?.name || 'Admin'})
                 </button>
             )}
         </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden h-screen relative">
         {/* TOP HEADER */}
         <header className="bg-gradient-to-r from-[#0D9488] to-[#0D9488] text-white shadow-xl m-4 rounded-[20px] border-2 border-gray-100 relative z-30 shrink-0">
             <div className="container mx-auto px-6 py-4 md:py-6">
                <div className="flex flex-col items-center justify-center gap-4">
                    {/* Title & Teacher Name */}
                    <div className="text-center">
                        <h1 className="text-2xl md:text-4xl font-bold [text-shadow:1px_1px_3px_rgba(0,0,0,0.8)] leading-tight font-poppins">
                            HỆ THỐNG THI TRẮC NGHIỆM ONLINE
                        </h1>
                        <h3 className="text-base md:text-xl mt-2 opacity-90 font-light [text-shadow:1px_1px_3px_rgba(0,0,0,0.8)] font-poppins">
                            {user?.school || "Thầy Lê Văn Đông - Chuyên Lê Thánh Tông"}
                        </h3>
                    </div>
                </div>
             </div>
             <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block">
                 {isGuest ? (
                    <button onClick={onLoginClick} className="bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg backdrop-blur-sm border border-white/30 flex items-center gap-2 transition-all">
                        <LogIn className="w-4 h-4"/> Đăng nhập
                    </button>
                 ) : (
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                             <p className="text-xs text-teal-200 font-bold uppercase">{user?.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}</p>
                             <p className="text-sm font-bold text-white">{user?.name}</p>
                        </div>
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                             <UserPlus className="w-5 h-5"/>
                        </div>
                    </div>
                 )}
             </div>
         </header>

         {/* CONTENT SCROLLABLE */}
         <div className="flex-1 overflow-y-auto p-8 pt-2 custom-scrollbar">
             {children}
         </div>
      </div>
    </div>
  );
};

export const ExamList = ({ exams, onSelectExam, onDeleteExam, onPlayExam, onAssignExam, onPublish, onCreate }: any) => {
   return (
      <div className="animate-fade-in font-poppins">
         <div className="mb-8 flex justify-between items-end">
            <div>
               <h2 className="text-2xl font-black text-gray-800 mb-2 font-bookman">Ngân hàng Đề thi</h2>
               <p className="text-gray-500">Quản lý tất cả các đề thi, chỉnh sửa và xuất bản.</p>
            </div>
            <button onClick={onCreate} className="px-5 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg hover:bg-teal-700 shadow-teal-200 transition-all transform hover:-translate-y-1 flex items-center">
               <Plus className="w-5 h-5 mr-2" /> Tạo Đề Mới
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam: ExamConfig) => {
               const isPublished = !!exam.securityCode;
               return (
                  <div key={exam.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-teal-200 transition-all group flex flex-col relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-2 h-full bg-teal-500"></div>
                     <div className="flex justify-between items-start mb-4 pl-4">
                        <div>
                           <div className="flex items-center gap-2 mb-2">
                               <span className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full border border-teal-100 inline-block uppercase tracking-wider">{exam.className || "Chưa phân lớp"}</span>
                               {isPublished ? (
                                   <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded border border-green-200 uppercase tracking-wider">Đã xuất bản</span>
                               ) : (
                                   <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded border border-gray-200 uppercase tracking-wider">Nháp</span>
                               )}
                           </div>
                           <h3 className="text-lg font-bold text-gray-800 line-clamp-1" title={exam.title}>{exam.title}</h3>
                           <p className="text-xs text-gray-400 mt-1 font-mono">{exam.createdAt}</p>
                        </div>
                        <div className="relative group/action">
                           <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><MoreHorizontal className="w-5 h-5"/></button>
                        </div>
                     </div>

                     <div className="pl-4 mb-6 space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                           <List className="w-4 h-4 mr-2 text-teal-500" />
                           <span className="font-bold">{exam.questions?.length || 0}</span> <span className="text-gray-400 ml-1">câu hỏi</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                           <Clock className="w-4 h-4 mr-2 text-teal-500" />
                           <span className="font-bold">{exam.duration}</span> <span className="text-gray-400 ml-1">phút</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                           <Users className="w-4 h-4 mr-2 text-teal-500" />
                           <span className="font-bold">{exam.results?.length || 0}</span> <span className="text-gray-400 ml-1">lượt thi</span>
                        </div>
                     </div>

                     <div className="mt-auto pl-4 grid grid-cols-2 gap-2">
                         <button onClick={() => onSelectExam(exam)} className="py-2.5 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center text-sm">
                             <Edit className="w-4 h-4 mr-1.5"/> Sửa
                         </button>
                         <button onClick={() => onPlayExam(exam)} className="py-2.5 bg-teal-50 text-teal-600 font-bold rounded-xl hover:bg-teal-100 transition-colors flex items-center justify-center text-sm">
                             <PlayCircle className="w-4 h-4 mr-1.5"/> Thi thử
                         </button>
                         {isPublished ? (
                             <button onClick={() => onAssignExam(exam)} className="col-span-2 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-md shadow-teal-200 transition-colors flex items-center justify-center text-sm">
                                 <Share2 className="w-4 h-4 mr-1.5"/> Giao bài & Lấy mã
                             </button>
                         ) : (
                             <button onClick={() => onPublish(exam)} className="col-span-2 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors flex items-center justify-center text-sm">
                                 <Globe className="w-4 h-4 mr-1.5"/> Xuất bản ngay
                             </button>
                         )}
                         <button onClick={() => { if(confirm("Bạn có chắc chắn muốn xóa đề thi này không?")) onDeleteExam(exam.id) }} className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                             <Trash2 className="w-4 h-4"/>
                         </button>
                     </div>
                  </div>
               );
            })}
            {/* Empty State Card for Add */}
            <button onClick={onCreate} className="rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-8 text-gray-400 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/30 transition-all min-h-[250px] group">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                    <Plus className="w-8 h-8" />
                </div>
                <span className="font-bold text-lg">Tạo đề thi mới</span>
            </button>
         </div>
      </div>
   );
};

export const PublishView = ({ exams, onPlayExam, user }: any) => {
  // Logic to show published exams.
  const publishedExams = exams.filter((e: ExamConfig) => e.securityCode);

  return (
     <div className="animate-fade-in font-poppins">
        <div className="mb-8">
           <h2 className="text-2xl font-black text-gray-800 mb-2 font-bookman">Đề thi công khai</h2>
           <p className="text-gray-500">Danh sách các đề thi đang mở cho học sinh.</p>
        </div>
        
        {publishedExams.length === 0 ? (
            <div className="text-center p-10 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 font-bold">Chưa có đề thi nào được xuất bản.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedExams.map((exam: ExamConfig) => (
                   <div key={exam.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-cyan-200 transition-all group flex flex-col relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500"></div>
                       <div className="pl-4 mb-4">
                           <span className="bg-cyan-50 text-cyan-700 text-xs font-bold px-3 py-1 rounded-full border border-cyan-100 inline-block uppercase tracking-wider mb-2">{exam.className || "Chung"}</span>
                           <h3 className="text-lg font-bold text-gray-800 line-clamp-2 min-h-[56px]">{exam.title}</h3>
                           <p className="text-xs text-gray-400 mt-1 font-mono">{exam.questions.length} câu • {exam.duration} phút</p>
                       </div>
                       <div className="mt-auto pl-4">
                           <button onClick={() => onPlayExam(exam)} className="w-full py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 shadow-md shadow-cyan-200 transition-all flex items-center justify-center">
                               <PlayCircle className="w-5 h-5 mr-2"/> Vào thi ngay
                           </button>
                       </div>
                   </div>
                ))}
            </div>
        )}
     </div>
  );
};

export const ExamEditor = ({ exam, onUpdate, onBack, onPublish }: any) => {
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    const handleSaveQuestion = (q: Question) => {
        let newQuestions;
        if (editingQuestion) {
             newQuestions = exam.questions.map((item: Question) => item.id === q.id ? q : item);
        } else {
             newQuestions = [...exam.questions, q];
        }
        onUpdate({ ...exam, questions: newQuestions });
        setShowQuestionModal(false);
        setEditingQuestion(null);
    };

    const handleDeleteQuestion = (id: number) => {
        if(confirm("Bạn có chắc chắn xóa câu hỏi này?")) {
            onUpdate({ ...exam, questions: exam.questions.filter((q: Question) => q.id !== id) });
        }
    };

    return (
        <div className="animate-fade-in font-poppins pb-20">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#e0f7fa] z-10 py-4 glass-effect">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white/50 rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-600"/></button>
                    <div>
                        <h2 className="text-2xl font-black text-gray-800">{exam.title}</h2>
                        <div className="flex gap-2 text-xs font-bold text-gray-500 uppercase mt-1">
                            <span className="bg-white px-2 py-0.5 rounded border border-gray-200">{exam.questions.length} câu hỏi</span>
                            <span className="bg-white px-2 py-0.5 rounded border border-gray-200">{exam.duration} phút</span>
                            {exam.securityCode && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200">Đã xuất bản: {exam.securityCode}</span>}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowImportModal(true)} className="px-4 py-2 bg-white text-teal-700 font-bold rounded-xl border border-teal-100 hover:bg-teal-50 transition-colors flex items-center"><FileUp className="w-4 h-4 mr-2"/> Import Word</button>
                    <button onClick={() => { setEditingQuestion(null); setShowQuestionModal(true); }} className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-md shadow-teal-200 transition-colors flex items-center"><Plus className="w-4 h-4 mr-2"/> Thêm câu hỏi</button>
                    <button onClick={onPublish} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors flex items-center"><Share2 className="w-4 h-4 mr-2"/> Xuất bản</button>
                </div>
            </div>

            <div className="space-y-4">
                {exam.questions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><FileText className="w-10 h-10 text-gray-300"/></div>
                        <p className="text-gray-400 font-bold text-lg">Chưa có câu hỏi nào.</p>
                        <p className="text-gray-400 text-sm">Hãy thêm câu hỏi thủ công hoặc Import từ Word.</p>
                    </div>
                ) : (
                    exam.questions.map((q: Question, idx: number) => (
                        <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all group relative">
                             <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => { setEditingQuestion(q); setShowQuestionModal(true); }} className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"><Edit className="w-4 h-4"/></button>
                                 <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                             </div>
                             <div className="flex gap-4">
                                 <span className="bg-gray-100 text-gray-600 font-bold text-sm px-2 py-1 rounded h-fit">Câu {idx+1}</span>
                                 <div className="flex-1">
                                     <div className="font-medium text-gray-800 mb-2"><MathRenderer text={q.question} allowMarkdown={true}/></div>
                                     {q.type === 'choice' && (
                                         <div className="grid grid-cols-2 gap-2 mt-2">
                                             {q.options?.map((opt: string, i: number) => (
                                                 <div key={i} className={`text-sm p-2 rounded border ${opt === q.answer ? 'bg-green-50 border-green-200 text-green-800 font-bold' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                                     <span className="mr-2">{String.fromCharCode(65+i)}.</span> <MathRenderer text={opt} allowMarkdown={true}/>
                                                 </div>
                                             ))}
                                         </div>
                                     )}
                                     {q.type === 'group' && (
                                         <div className="mt-2 text-sm bg-gray-50 p-3 rounded-xl border border-gray-200">
                                             {q.subQuestions?.map((sub, i) => (
                                                 <div key={i} className="flex justify-between border-b last:border-0 border-gray-200 py-1">
                                                     <span>{String.fromCharCode(97+i)}) {sub.content}</span>
                                                     <span className={sub.correctAnswer ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{sub.correctAnswer ? "Đúng" : "Sai"}</span>
                                                 </div>
                                             ))}
                                         </div>
                                     )}
                                      {q.type === 'text' && (
                                         <div className="mt-2 text-sm bg-yellow-50 p-3 rounded-xl border border-yellow-200 text-yellow-800">
                                             <span className="font-bold">Đáp án gợi ý:</span> {q.answer}
                                         </div>
                                     )}
                                 </div>
                             </div>
                        </div>
                    ))
                )}
            </div>

            {showQuestionModal && (
                 <EditQuestionModal 
                     question={editingQuestion || { id: Date.now(), type: 'choice', question: '', options: ['','','',''], answer: '' }}
                     onSave={handleSaveQuestion}
                     onClose={() => setShowQuestionModal(false)}
                 />
            )}
            {showImportModal && (
                 <ImportModal 
                     onImport={(qs) => { onUpdate({ ...exam, questions: [...exam.questions, ...qs] }); setShowImportModal(false); }}
                     onClose={() => setShowImportModal(false)}
                 />
            )}
        </div>
    );
};

export const ScoreManager = ({ exams }: any) => {
    const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
    const currentExam = exams.find((e: ExamConfig) => e.id === selectedExamId);

    // Ensure external libs are loaded for Excel export
    useEffect(() => { loadExternalLibs(); }, []);

    const downloadExcel = () => {
        const XLSX = (window as any).XLSX;
        if (!XLSX || !currentExam) {
            if (!XLSX) alert("Thư viện Excel đang tải, vui lòng thử lại sau vài giây.");
            return;
        }
        
        const data = currentExam.results?.map((r: any, i: number) => ({
            "STT": i + 1,
            "Họ và Tên": r.name,
            "Lớp": r.className,
            "Điểm số": r.score,
            "Số câu đúng": r.counts.correct,
            "Số câu sai": r.counts.wrong,
            "Thời gian làm": `${Math.floor(r.timeSpent/60)}p ${r.timeSpent%60}s`,
            "Ngày thi": r.date,
            "Vi phạm": r.violations
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "KetQua");
        XLSX.writeFile(wb, `KetQua_${currentExam.code || 'Exam'}.xlsx`);
    };

    return (
        <div className="animate-fade-in font-poppins h-full flex flex-col">
            <div className="flex justify-between items-end mb-6 shrink-0">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 mb-2 font-bookman">Báo cáo kết quả</h2>
                    <p className="text-gray-500">Xem điểm và thống kê bài làm của học sinh.</p>
                </div>
                <div className="flex gap-3">
                     <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:border-teal-500">
                         {exams.map((e: ExamConfig) => <option key={e.id} value={e.id}>{e.title}</option>)}
                     </select>
                     <button onClick={downloadExcel} disabled={!currentExam} className="px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-md shadow-green-200 transition-colors flex items-center disabled:opacity-50">
                         <Download className="w-4 h-4 mr-2"/> Xuất Excel
                     </button>
                </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
                 <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-12 gap-4 font-bold text-xs text-gray-500 uppercase tracking-wider">
                     <div className="col-span-1 text-center">Top</div>
                     <div className="col-span-3">Họ và Tên</div>
                     <div className="col-span-1">Lớp</div>
                     <div className="col-span-2 text-center">Điểm số</div>
                     <div className="col-span-3">Thời gian / Ngày</div>
                     <div className="col-span-2 text-center">Trạng thái</div>
                 </div>
                 <div className="overflow-y-auto flex-1 p-2">
                     {!currentExam || !currentExam.results || currentExam.results.length === 0 ? (
                         <div className="text-center py-20 text-gray-400">Chưa có dữ liệu kết quả nào.</div>
                     ) : (
                         currentExam.results.sort((a,b) => b.score - a.score).map((r: StudentResult, i: number) => (
                             <div key={i} className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-teal-50/30 rounded-xl transition-colors border-b border-gray-50 last:border-0">
                                 <div className="col-span-1 text-center font-black text-gray-400">
                                     {i < 3 ? <span className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-white ${i===0?'bg-yellow-400':i===1?'bg-gray-400':'bg-orange-400'}`}>{i+1}</span> : i+1}
                                 </div>
                                 <div className="col-span-3 font-bold text-gray-800">{r.name}</div>
                                 <div className="col-span-1 text-sm text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded text-center w-fit">{r.className}</div>
                                 <div className="col-span-2 text-center">
                                     <span className={`text-lg font-black ${r.score >= 8 ? 'text-green-600' : r.score >= 5 ? 'text-blue-600' : 'text-red-600'}`}>
                                         {r.score.toFixed(2)}
                                     </span>
                                     <span className="text-xs text-gray-400 font-medium ml-1">/ {r.total}</span>
                                 </div>
                                 <div className="col-span-3 text-xs text-gray-500">
                                     <div className="flex items-center gap-1"><Clock className="w-3 h-3"/> {Math.floor((r.timeSpent || 0)/60)}p {(r.timeSpent || 0)%60}s</div>
                                     <div className="flex items-center gap-1 mt-1"><Calendar className="w-3 h-3"/> {r.date}</div>
                                 </div>
                                 <div className="col-span-2 text-center">
                                     {r.violations > 0 ? (
                                         <span className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-[10px] font-bold border border-red-100 flex items-center justify-center gap-1"><AlertTriangle className="w-3 h-3"/> {r.violations} VP</span>
                                     ) : (
                                         <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-[10px] font-bold border border-green-100 flex items-center justify-center gap-1"><Check className="w-3 h-3"/> Hợp lệ</span>
                                     )}
                                 </div>
                             </div>
                         ))
                     )}
                 </div>
            </div>
        </div>
    );
};

export const StudentManager = ({ students, onAddStudent, onEditStudent, onDeleteStudent, onDeleteStudents, onImportStudents }: any) => {
    const [showModal, setShowModal] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [filterClass, setFilterClass] = useState('all');

    const uniqueClasses = Array.from(new Set(students.map((s: Student) => s.className))).sort() as string[];
    const filteredStudents = filterClass === 'all' ? students : students.filter((s: Student) => s.className === filterClass);

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredStudents.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filteredStudents.map((s: Student) => s.id)));
    };

    const handleDeleteSelected = () => {
        if (confirm(`Bạn có chắc chắn xóa ${selectedIds.size} học sinh đã chọn?`)) {
            onDeleteStudents(Array.from(selectedIds));
            setSelectedIds(new Set());
        }
    };

    return (
        <div className="animate-fade-in font-poppins h-full flex flex-col">
             <div className="flex justify-between items-end mb-6 shrink-0">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 mb-2 font-bookman">Quản lý học sinh</h2>
                    <p className="text-gray-500">Thêm, sửa, xóa và nhập danh sách học sinh.</p>
                </div>
                <div className="flex gap-3">
                     <button onClick={() => setShowImport(true)} className="px-4 py-3 bg-white text-teal-700 font-bold rounded-xl border border-teal-100 hover:bg-teal-50 transition-colors flex items-center shadow-sm">
                         <Upload className="w-4 h-4 mr-2"/> Import Excel
                     </button>
                     <button onClick={() => { setEditingStudent(undefined); setShowModal(true); }} className="px-4 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-md shadow-teal-200 transition-colors flex items-center">
                         <UserPlus className="w-4 h-4 mr-2"/> Thêm học sinh
                     </button>
                </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
                 <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                     <div className="flex items-center gap-4">
                         <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="p-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 outline-none bg-white">
                             <option value="all">Tất cả các lớp</option>
                             {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                         <span className="text-xs font-bold text-gray-400">{filteredStudents.length} học sinh</span>
                     </div>
                     {selectedIds.size > 0 && (
                         <button onClick={handleDeleteSelected} className="text-red-600 text-xs font-bold flex items-center hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                             <Trash2 className="w-3 h-3 mr-1"/> Xóa {selectedIds.size} đã chọn
                         </button>
                     )}
                 </div>

                 <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-12 gap-4 font-bold text-xs text-gray-500 uppercase tracking-wider items-center">
                     <div className="col-span-1 text-center"><input type="checkbox" checked={filteredStudents.length > 0 && selectedIds.size === filteredStudents.length} onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-300 accent-teal-600" /></div>
                     <div className="col-span-4">Họ và Tên</div>
                     <div className="col-span-2">Lớp</div>
                     <div className="col-span-3">Email</div>
                     <div className="col-span-2 text-right">Thao tác</div>
                 </div>

                 <div className="overflow-y-auto flex-1 p-2">
                     {filteredStudents.length === 0 ? (
                         <div className="text-center py-20 text-gray-400">Chưa có dữ liệu học sinh.</div>
                     ) : (
                         filteredStudents.map((s: Student) => (
                             <div key={s.id} className={`grid grid-cols-12 gap-4 items-center p-4 hover:bg-teal-50/30 rounded-xl transition-colors border-b border-gray-50 last:border-0 ${selectedIds.has(s.id) ? 'bg-teal-50/50' : ''}`}>
                                 <div className="col-span-1 text-center"><input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleSelect(s.id)} className="w-4 h-4 rounded border-gray-300 accent-teal-600" /></div>
                                 <div className="col-span-4 font-bold text-gray-800">{s.name}</div>
                                 <div className="col-span-2 text-sm text-gray-600">{s.className}</div>
                                 <div className="col-span-3 text-xs text-gray-400 font-mono truncate">{s.email || '--'}</div>
                                 <div className="col-span-2 flex justify-end gap-2">
                                     <button onClick={() => { setEditingStudent(s); setShowModal(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4"/></button>
                                     <button onClick={() => { if(confirm("Xóa học sinh này?")) onDeleteStudent(s.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                                 </div>
                             </div>
                         ))
                     )}
                 </div>
            </div>

            {showModal && (
                <StudentModal 
                    student={editingStudent}
                    onClose={() => setShowModal(false)}
                    onSave={(s) => {
                        if (editingStudent) onEditStudent(s);
                        else onAddStudent(s);
                        setShowModal(false);
                    }}
                />
            )}
            {showImport && (
                <ImportStudentModal 
                    onClose={() => setShowImport(false)}
                    onImport={(list) => { onImportStudents(list); setShowImport(false); }}
                />
            )}
        </div>
    );
};
