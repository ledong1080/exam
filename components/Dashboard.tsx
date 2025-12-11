
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PenTool, Share2, LogOut, FolderPlus, Trash2, Clock, List, Users, FileUp, Plus, PlayCircle, Edit, ArrowLeft, Copy, BarChart3, Search, Download, Filter, Eye, X, UserPlus, Upload, BookOpen, CheckSquare, GraduationCap, Calendar, AlertTriangle, Trophy, FileText, Bell, UserX, Check, LogIn } from 'lucide-react';
import { ExamConfig, Question, StudentResult, Student } from '../types';
import { copyToClipboard, MathRenderer } from '../utils/common';
import { EditQuestionModal, ImportModal, PublishExamModal, StudentModal, ImportStudentModal, AssignExamModal } from './Modals';
import { ResultScreen } from './Player';

// ------------------------------------------------
// STYLES & THEME
// ------------------------------------------------
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

// ------------------------------------------------
// COMPONENT: DASHBOARD OVERVIEW (STATS)
// ------------------------------------------------
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


// ------------------------------------------------
// COMPONENT: DASHBOARD LAYOUT
// ------------------------------------------------
export const DashboardLayout = ({ children, activeTab, onTabChange, onCreateClick }: any) => {
  
  // Navigation Config
  const sidebarGroups: {
    title: string;
    items: {
      id: string;
      label: string;
      icon: any;
      activeColor: string;
      bgColor: string;
      hoverColor: string;
      hoverBg: string;
      action?: () => void;
    }[];
  }[] = [
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
      <div className="w-64 bg-gradient-to-b from-[#0D9488] to-[#0D9488] border-2 border-gray-100 flex flex-col z-20 shadow-xl m-4 rounded-[20px] text-white shrink-0">
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
         
         <div className="flex-1 py-6 px-4 overflow-y-auto custom-scrollbar-light">
            <nav className="space-y-3">
               {sidebarGroups.map((group, gIdx) => (
                  <div key={gIdx}>
                     {group.title && <p className="px-4 text-[10px] font-black text-teal-200 uppercase mb-3 tracking-wider">{group.title}</p>}
                     <div className="space-y-1">
                        {group.items.map((item) => {
                           const isActive = activeTab === item.id;
                           return (
                              <button 
                                 key={item.id}
                                 onClick={item.action ? item.action : () => onTabChange(item.id)} 
                                 className={`sidebar-btn group transition-all duration-300 ease-in-out border
                                    ${isActive 
                                        ? `bg-white text-[#0D9488] font-bold shadow-lg border-white translate-x-2` 
                                        : `text-teal-50 hover:bg-white/10 hover:text-white border-transparent hover:shadow-sm hover:translate-x-1`
                                    }`}
                              >
                                 <div className={`mr-3 transition-colors ${isActive ? 'text-[#0D9488]' : 'text-teal-200 group-hover:text-white'}`}>
                                    <item.icon className="w-5 h-5" />
                                 </div>
                                 <span className="flex-1 text-left">{item.label}</span>
                                 {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#0D9488] ml-2"></div>}
                              </button>
                           );
                        })}
                     </div>
                  </div>
               ))}
            </nav>
         </div>
         
         <div className="p-4 border-t border-white/20">
             <button className="w-full flex items-center justify-center gap-2 text-white/90 font-bold text-sm p-3 hover:bg-white/10 rounded-xl transition-colors border border-transparent hover:border-white/20 shadow-sm">
                 <LogOut className="w-4 h-4" /> Đăng xuất
             </button>
         </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden h-screen relative">
         {/* TOP HEADER - REPLACED WITH NEW DESIGN */}
         <header className="bg-gradient-to-r from-[#0D9488] to-[#0D9488] text-white shadow-xl m-4 rounded-[20px] border-2 border-gray-100 relative z-30 shrink-0">
             <div className="container mx-auto px-6 py-4 md:py-6">
                <div className="flex flex-col items-center justify-center gap-4">
                    {/* Title & Teacher Name */}
                    <div className="text-center">
                        <h1 className="text-2xl md:text-4xl font-bold [text-shadow:1px_1px_3px_rgba(0,0,0,0.8)] leading-tight font-poppins">
                            HỆ THỐNG THI TRẮC NGHIỆM ONLINE
                        </h1>
                        <h3 className="text-base md:text-xl mt-2 opacity-90 font-light [text-shadow:1px_1px_3px_rgba(0,0,0,0.8)] font-poppins">
                            Thầy Lê Văn Đông - Chuyên Lê Thánh Tông
                        </h3>
                    </div>
                </div>
             </div>
             <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block">
                 <button className="bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg backdrop-blur-sm border border-white/30 flex items-center gap-2 transition-all">
                    <LogIn className="w-4 h-4"/> Đăng nhập
                 </button>
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


// ------------------------------------------------
// EXISTING COMPONENTS (Minor Style Tweaks)
// ------------------------------------------------

export const StudentManager = ({ students, exams, onAddStudent, onEditStudent, onDeleteStudent, onDeleteStudents, onImportStudents }: any) => {
   const [filterClass, setFilterClass] = useState('all');
   const [searchName, setSearchName] = useState('');
   const [editingStudent, setEditingStudent] = useState<Student | null>(null);
   const [showAdd, setShowAdd] = useState(false);
   const [showImport, setShowImport] = useState(false);
   
   const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
   const classes = Array.from(new Set(students.map((s: Student) => s.className))).sort() as string[];

   const filteredStudents = students.filter((s: Student) => {
      const matchClass = filterClass === 'all' || s.className === filterClass;
      const matchName = s.name.toLowerCase().includes(searchName.toLowerCase());
      return matchClass && matchName;
   });

   const isAllSelected = filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length;
   
   const handleSelectAll = () => {
       if (isAllSelected) setSelectedStudents([]);
       else setSelectedStudents(filteredStudents.map((s: Student) => s.id));
   };

   const handleSelectStudent = (id: string) => {
       if (selectedStudents.includes(id)) setSelectedStudents(selectedStudents.filter(sid => sid !== id));
       else setSelectedStudents([...selectedStudents, id]);
   };

   const handleDeleteSelected = () => {
       if (selectedStudents.length === 0) return;
       if (confirm(`Bạn có chắc muốn xóa ${selectedStudents.length} học sinh đã chọn?`)) {
           if (onDeleteStudents) {
               onDeleteStudents(selectedStudents);
           } else {
               selectedStudents.forEach(id => onDeleteStudent(id));
           }
           setSelectedStudents([]);
       }
   };

   const getExamCount = (student: Student) => {
      if (!exams) return 0;
      let count = 0;
      exams.forEach((exam: ExamConfig) => {
         if (exam.results) {
            const matches = exam.results.filter(r => 
               r.name.trim().toLowerCase() === student.name.trim().toLowerCase() && 
               r.className.trim().toLowerCase() === student.className.trim().toLowerCase()
            );
            count += matches.length;
         }
      });
      return count;
   };

   return (
      <div className="animate-fade-in font-poppins">
         {showAdd && <StudentModal onClose={() => setShowAdd(false)} onSave={(s: Student) => { onAddStudent(s); setShowAdd(false); }} />}
         {editingStudent && <StudentModal student={editingStudent} onClose={() => setEditingStudent(null)} onSave={(s: Student) => { onEditStudent(s); setEditingStudent(null); }} />}
         {showImport && <ImportStudentModal onClose={() => setShowImport(false)} onImport={onImportStudents} />}

         <div className="mb-8 flex justify-between items-end">
            <div>
               <h2 className="text-2xl font-black text-gray-800 mb-2 font-bookman">Quản Lý Học Sinh</h2>
               <p className="text-gray-500">Quản lý danh sách, lớp học và thông tin học sinh.</p>
            </div>
            <div className="flex gap-2">
               {selectedStudents.length > 0 && (
                   <button onClick={handleDeleteSelected} className="flex items-center px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 border border-red-200 transition-all">
                      <Trash2 className="w-5 h-5 mr-2"/> Xóa ({selectedStudents.length})
                   </button>
               )}
               <button onClick={() => setShowImport(true)} className="flex items-center px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 border border-indigo-200 shadow-sm transition-all">
                  <Upload className="w-5 h-5 mr-2"/> Import Excel
               </button>
               <button onClick={() => setShowAdd(true)} className="flex items-center px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all">
                  <UserPlus className="w-5 h-5 mr-2"/> Thêm Học Sinh
               </button>
            </div>
         </div>

         <div className="bg-[#DDDDDD] p-6 rounded-3xl shadow-sm border border-[#0D9488] mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="block text-xs font-bold text-[#0D9488] uppercase mb-2">Lọc theo Lớp</label>
               <div className="relative">
                  <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-full p-3 pl-10 border border-gray-200 rounded-xl appearance-none outline-none bg-gray-50 font-bold text-gray-700 focus:border-teal-500 transition-colors">
                     <option value="all">Tất cả các lớp</option>
                     {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <Filter className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none"/>
               </div>
            </div>
            <div>
               <label className="block text-xs font-bold text-[#0D9488] uppercase mb-2">Tìm kiếm Học sinh</label>
               <div className="relative">
                  <input type="text" value={searchName} onChange={e => setSearchName(e.target.value)} placeholder="Nhập tên học sinh..." className="w-full p-3 pl-10 border border-gray-200 rounded-xl outline-none bg-gray-50 font-medium focus:border-teal-500 transition-colors" />
                  <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none"/>
               </div>
            </div>
         </div>

         <div className="bg-[#DDDDDD] rounded-3xl shadow-sm border border-[#0D9488] overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                     <th className="p-5 w-10 text-center">
                        <button onClick={handleSelectAll} className="flex items-center justify-center text-teal-600 hover:text-teal-800">
                            {isAllSelected ? <CheckSquare className="w-5 h-5"/> : <div className="w-5 h-5 border-2 border-gray-300 rounded mx-auto"></div>}
                        </button>
                     </th>
                    <th className="p-5 text-xs font-black text-[#0D9488] uppercase tracking-wider w-16">STT</th>
                     <th className="p-5 text-xs font-black text-[#0D9488] uppercase tracking-wider">Họ Tên</th>
                     <th className="p-5 text-xs font-black text-[#0D9488] uppercase tracking-wider">Lớp</th>
                     <th className="p-5 text-xs font-black text-[#0D9488] uppercase tracking-wider">Email</th>
                     <th className="p-5 text-xs font-black text-[#0D9488] uppercase tracking-wider text-center">Số lần thi</th>
                     <th className="p-5 text-xs font-black text-[#0D9488] uppercase tracking-wider text-right">Hành động</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {filteredStudents.length > 0 ? filteredStudents.map((s: Student, i: number) => {
                     const examCount = getExamCount(s);
                     return (
                        <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${selectedStudents.includes(s.id) ? 'bg-blue-50/30' : ''}`}>
                           <td className="p-5 text-center">
                              <input 
                                 type="checkbox" 
                                 className="w-4 h-4 accent-teal-600 cursor-pointer"
                                 checked={selectedStudents.includes(s.id)}
                                 onChange={() => handleSelectStudent(s.id)}
                              />
                           </td>
                           <td className="p-5 font-bold text-gray-400">{i + 1}</td>
                           <td className="p-5 font-bold text-gray-800">{s.name}</td>
                           <td className="p-5 font-medium text-gray-600">{s.className}</td>
                           <td className="p-5 text-gray-500">{s.email || '-'}</td>
                           <td className="p-5 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${examCount > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                 {examCount}
                              </span>
                           </td>
                           <td className="p-5 text-right flex justify-end gap-2">
                              <button onClick={() => setEditingStudent(s)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 border border-transparent transition-colors"><Edit className="w-4 h-4"/></button>
                              <button onClick={() => { if(confirm("Xóa học sinh này?")) onDeleteStudent(s.id); }} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-transparent transition-colors"><Trash2 className="w-4 h-4"/></button>
                           </td>
                        </tr>
                     );
                  }) : (
                     <tr><td colSpan={7} className="p-10 text-center text-gray-400">Không tìm thấy học sinh nào.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
   );
};

export const ScoreManager = ({ exams }: { exams: ExamConfig[] }) => {
   const [filterCode, setFilterCode] = useState('all');
   const [filterClass, setFilterClass] = useState('');
   const [filterName, setFilterName] = useState('');
   const [previewData, setPreviewData] = useState<{ result: StudentResult, questions: Question[] } | null>(null);

   const allResults = exams.flatMap(exam => 
      (exam.results || []).map(result => ({
         ...result,
         examCode: exam.code,
         examTitle: exam.title,
         questions: exam.questions
      }))
   );

   const filteredResults = allResults.filter(r => {
      const matchCode = filterCode === 'all' || r.examCode === filterCode;
      const matchClass = !filterClass || r.className.toLowerCase().includes(filterClass.toLowerCase());
      const matchName = !filterName || r.name.toLowerCase().includes(filterName.toLowerCase());
      return matchCode && matchClass && matchName;
   });

   const exportToCSV = () => {
      const BOM = "\uFEFF";
      const headers = ["STT", "Mã Đề", "Họ Tên", "Lớp", "Câu Đúng", "Câu Sai", "Điểm Số", "Thời Gian Nộp"];
      const rows = filteredResults.map((r, i) => [
         i + 1,
         r.examCode,
         r.name,
         r.className,
         r.counts.correct,
         r.counts.wrong,
         r.score.toFixed(2),
         r.date || ''
      ]);
      
      const csvContent = BOM + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ket_qua_thi_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   return (
      <div className="animate-fade-in font-poppins">
         <div className="mb-8 flex justify-between items-end">
            <div>
               <h2 className="text-2xl font-black text-gray-800 mb-2 font-bookman">Báo Cáo Điểm Số</h2>
               <p className="text-gray-500">Theo dõi kết quả làm bài của học sinh.</p>
            </div>
            <button onClick={exportToCSV} className="flex items-center px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
               <Download className="w-5 h-5 mr-2" /> Xuất Excel
            </button>
         </div>

         {/* FILTERS */}
         <div className="bg-[#DDDDDD] p-6 rounded-3xl shadow-sm border border-[#0D9488] mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
               <label className="block text-xs font-bold text-[#0D9488] uppercase mb-2">Chọn Mã Đề</label>
               <div className="relative">
                  <select value={filterCode} onChange={e => setFilterCode(e.target.value)} className="w-full p-3 pl-10 border border-gray-200 rounded-xl appearance-none outline-none bg-gray-50 font-bold text-gray-700 focus:border-teal-500 transition-colors">
                     <option value="all">Tất cả đề thi</option>
                     {exams.map(e => <option key={e.id} value={e.code}>{e.code} - {e.title}</option>)}
                  </select>
                  <Filter className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none"/>
               </div>
            </div>
            <div>
               <label className="block text-xs font-bold text-[#0D9488] uppercase mb-2">Lọc theo Lớp</label>
               <div className="relative">
                  <input type="text" value={filterClass} onChange={e => setFilterClass(e.target.value)} placeholder="Nhập tên lớp..." className="w-full p-3 pl-10 border border-gray-200 rounded-xl outline-none bg-gray-50 font-medium focus:border-teal-500 transition-colors" />
                  <Users className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none"/>
               </div>
            </div>
            <div>
               <label className="block text-xs font-bold text-[#0D9488] uppercase mb-2">Tìm kiếm Học sinh</label>
               <div className="relative">
                  <input type="text" value={filterName} onChange={e => setFilterName(e.target.value)} placeholder="Nhập tên học sinh..." className="w-full p-3 pl-10 border border-gray-200 rounded-xl outline-none bg-gray-50 font-medium focus:border-teal-500 transition-colors" />
                  <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none"/>
               </div>
            </div>
         </div>

         {/* TABLE */}
         <div className="bg-[#DDDDDD] rounded-3xl shadow-sm border border-[#0D9488] overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                     <th className="p-5 text-xs font-black text-[#0D9488] uppercase tracking-wider w-16">STT</th>
                     <th className="p-5 text-xs font-black text-[#0D9488] uppercase tracking-wider">Họ Tên</th>
                     <th className="p-5 text-xs font-black text-[#0D9488] uppercase tracking-wider">Lớp</th>
                     <th className="p-5 text-xs font-black text-[#0D9488] uppercase tracking-wider text-center">Câu Đúng</th>
                     <th className="p-5 text-xs font-black text-[#0D9488] uppercase tracking-wider text-center">Câu Sai</th>
                     <th className="p-5 text-xs font-black text-[#0D9488] uppercase tracking-wider text-right">Điểm Số</th>
                     <th className="p-5 text-xs font-black text-[#0D9488] uppercase tracking-wider text-right">Thời Gian Nộp</th>
                     <th className="p-5 text-xs font-black text-[#0D9488] uppercase tracking-wider text-center">Chi Tiết</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {filteredResults.length > 0 ? filteredResults.map((r, i) => (
                     <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="p-5 font-bold text-gray-400">{i + 1}</td>
                        <td className="p-5 font-bold text-gray-800">
                           {r.name}
                           <div className="text-xs font-normal text-gray-400 mt-0.5">{r.examCode} - {r.examTitle}</div>
                        </td>
                        <td className="p-5 font-medium text-gray-600">{r.className}</td>
                        <td className="p-5 text-center font-bold text-emerald-600 bg-emerald-50 rounded-lg">{r.counts.correct}</td>
                        <td className="p-5 text-center font-bold text-red-500 bg-red-50 rounded-lg">{r.counts.wrong}</td>
                        <td className="p-5 text-right font-black text-teal-600 text-lg">{r.score.toFixed(2)}</td>
                        <td className="p-5 text-right text-gray-500 text-sm font-mono">{r.date}</td>
                        <td className="p-5 text-center">
                           <button 
                              onClick={() => setPreviewData({ result: r, questions: r.questions })}
                              className="bg-gray-100 text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors shadow-sm"
                              title="Xem chi tiết bài làm"
                           >
                              <Eye className="w-5 h-5"/>
                           </button>
                        </td>
                     </tr>
                  )) : (
                     <tr><td colSpan={8} className="p-10 text-center text-gray-400">Không tìm thấy dữ liệu kết quả nào.</td></tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* REVIEW MODAL */}
         {previewData && (
            <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="w-full max-w-5xl h-[90vh] bg-white rounded-[30px] shadow-2xl flex flex-col overflow-hidden animate-fade-in border-4 border-teal-600">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                     <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <List className="w-6 h-6 text-teal-600"/> 
                        Chi tiết bài làm: <span className="text-teal-600 bg-white px-3 py-1 rounded-lg border border-teal-200">{previewData.result.name}</span>
                     </h3>
                     <button onClick={() => setPreviewData(null)} className="p-2 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors text-gray-400">
                        <X className="w-6 h-6"/>
                     </button>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-[#e0f7fa] p-0">
                     <ResultScreen 
                        score={previewData.result.score}
                        total={previewData.result.total}
                        violations={previewData.result.violations}
                        counts={previewData.result.counts}
                        questions={previewData.questions || []}
                        answers={previewData.result.answers || {}}
                        allowReview={true} 
                        onRetry={() => setPreviewData(null)}
                     />
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export const ExamList = ({ exams, onSelectExam, onDeleteExam, onPlayExam, onAssignExam, onCreate }: any) => (
   <div className="animate-fade-in font-poppins">
      <div className="flex justify-between items-end mb-8">
         <div>
            <h2 className="text-2xl font-black text-gray-800 mb-2 font-bookman">Ngân hàng đề thi</h2>
            <p className="text-gray-500">Quản lý và chỉnh sửa ngân hàng câu hỏi của bạn.</p>
         </div>
         <div className="flex items-center gap-3">
             <button onClick={onCreate} className="flex items-center px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all">
                <FolderPlus className="w-5 h-5 mr-2"/> Tạo Đề Thi
             </button>
             <div className="text-sm font-bold text-teal-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">Total: {exams.length}</div>
         </div>
      </div>
      {exams.length === 0 ? <div className="flex flex-col items-center justify-center h-96 bg-white rounded-[30px] border-2 border-dashed border-gray-200"><div className="bg-gray-50 p-6 rounded-full mb-4"><FolderPlus className="w-12 h-12 text-gray-300"/></div><p className="text-gray-400 font-medium">Chưa có đề thi nào được tạo.</p></div> : (
         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {exams.map((e: any) => (
               <div key={e.id} onClick={() => onSelectExam(e)} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-teal-500 group-hover:bg-cyan-500 transition-colors"></div>
                  <div className="flex justify-between items-start mb-4 pl-4">
                     <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-lg text-xs font-black tracking-wide border border-teal-100">{e.code}</span>
                     <div className="flex gap-2">
                        {onAssignExam && (
                           <button onClick={(ev) => { ev.stopPropagation(); onAssignExam(e); }} className="text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-colors" title="Giao bài cho lớp">
                              <BookOpen className="w-4 h-4"/>
                           </button>
                        )}
                        {onPlayExam && <button onClick={(ev) => { ev.stopPropagation(); onPlayExam(e); }} className="text-gray-300 hover:text-teal-600 hover:bg-teal-50 p-2 rounded-full transition-colors" title="Thi thử"><PlayCircle className="w-4 h-4"/></button>}
                        <button onClick={(ev) => { ev.stopPropagation(); onDeleteExam(e.id); }} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"><Trash2 className="w-4 h-4"/></button>
                     </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 pl-4 line-clamp-2 group-hover:text-teal-600 transition-colors">{e.title}</h3>
                  <div className="pl-4 flex items-center gap-4 text-xs font-medium text-gray-500 mb-6">
                     <span className="flex items-center"><Clock className="w-3 h-3 mr-1 text-gray-400"/> {e.duration}p</span>
                     <span className="flex items-center"><List className="w-3 h-3 mr-1 text-gray-400"/> {e.questions?.length || 0} câu</span>
                     <span className="flex items-center"><Users className="w-3 h-3 mr-1 text-gray-400"/> {e.className}</span>
                  </div>
                  <div className="pl-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                     <span className="text-xs text-gray-400 font-mono">{e.createdAt}</span>
                     <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded border border-cyan-100">Code: {e.securityCode || 'N/A'}</span>
                  </div>
               </div>
            ))}
         </div>
      )}
   </div>
);

export const PublishView = ({ exams }: any) => (
   <div className="animate-fade-in font-poppins">
      <div className="mb-8"><h2 className="text-2xl font-black text-gray-800 mb-2 font-bookman">Xuất bản & Chia sẻ</h2><p className="text-gray-500">Lấy mã bảo mật hoặc link để gửi cho học sinh.</p></div>
      <div className="bg-[#DDDDDD] rounded-3xl shadow-sm border border-[#0D9488] overflow-hidden">
         <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100"><tr><th className="p-6 text-xs font-black text-[#0D9488] uppercase tracking-wider">Mã Đề</th><th className="p-6 text-xs font-black text-[#0D9488] uppercase tracking-wider">Tên Đề Thi</th><th className="p-6 text-xs font-black text-[#0D9488] uppercase tracking-wider">Lớp</th><th className="p-6 text-xs font-black text-[#0D9488] uppercase tracking-wider">Mã Bảo Mật</th><th className="p-6 text-xs font-black text-[#0D9488] uppercase tracking-wider text-right">Hành Động</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
               {exams.map((e: any) => {
                  const fakeLink = `http://thaydong.site/?examId=${e.id}&code=${e.securityCode}`;
                  return (
                     <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-6 font-bold text-teal-600">{e.code}</td>
                        <td className="p-6 font-medium text-gray-800">{e.title}</td>
                        <td className="p-6 text-gray-500">{e.className}</td>
                        <td className="p-6"><span className="font-mono font-bold bg-gray-100 px-3 py-1 rounded text-gray-700 border border-gray-200">{e.securityCode || 'Chưa tạo'}</span></td>
                        <td className="p-6 text-right flex justify-end gap-2">
                            <button onClick={() => e.securityCode && copyToClipboard(fakeLink)} className="text-cyan-600 hover:text-cyan-800 font-bold text-sm bg-cyan-50 hover:bg-cyan-100 px-4 py-2 rounded-lg transition-all border border-cyan-200">Copy Link</button>
                            <button onClick={() => e.securityCode && copyToClipboard(e.securityCode)} className="text-teal-600 hover:text-teal-800 font-bold text-sm bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-lg transition-all border border-teal-200">Copy Code</button>
                        </td>
                     </tr>
                  );
               })}
               {exams.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">Chưa có dữ liệu.</td></tr>}
            </tbody>
         </table>
      </div>
   </div>
);

export const ExamEditor = ({ exam, onUpdate, onBack, onPublish, onCreateNew }: any) => {
   const [questions, setQuestions] = useState<Question[]>(exam.questions || []);
   const [showImport, setShowImport] = useState(false);
   const [showPublishModal, setShowPublishModal] = useState(false); 
   const [editingQ, setEditingQ] = useState<Question | null>(null);
   useEffect(() => { onUpdate({ ...exam, questions }); }, [questions]);
   const handleDeleteQ = (id: number) => { if(confirm('Xóa câu này?')) setQuestions(qs => qs.filter(q => q.id !== id)); };
   const handleAddEmpty = () => { const newQ = { id: Date.now(), section: 'Phần mới', type: 'choice', question: 'Câu hỏi mới...', options: ['A', 'B', 'C', 'D'], answer: 'A' } as Question; setQuestions(prevQs => [...prevQs, newQ]); };
   const handleImport = (newQs: Question[]) => { setQuestions(prevQs => [...prevQs, ...newQs]); };
   const handleSaveQ = (updatedQ: Question) => { setQuestions(prevQs => prevQs.map(q => q.id === updatedQ.id ? updatedQ : q)); setEditingQ(null); };
   const handleUpdateDuration = () => { const newDur = prompt("Nhập thời gian (phút):", exam.duration); if (newDur && !isNaN(Number(newDur))) onUpdate({ ...exam, duration: Number(newDur) }); };
   
   // Handle Saving settings ONLY, not closing or redirecting
   const handleSavePublishSettings = (settings: any) => { 
       onUpdate({ ...exam, ...settings }); 
   };

   return (
      <div className="h-screen flex flex-col bg-[#F3F4F6] font-poppins">
         <style>{DASHBOARD_STYLES}</style>
         {showImport && <ImportModal onClose={() => setShowImport(false)} onImport={handleImport} />}
         {editingQ && <EditQuestionModal question={editingQ} onClose={() => setEditingQ(null)} onSave={handleSaveQ} />}
         {showPublishModal && <PublishExamModal exam={exam} onClose={() => setShowPublishModal(false)} onConfirm={handleSavePublishSettings} onCreateNew={onCreateNew} onPlay={onPublish} />} 
         
         {/* HEADER */}
         <div className="bg-white px-8 py-5 border-b border-gray-200 flex justify-between items-center shadow-sm z-20">
            <div className="flex items-center gap-4">
               <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-teal-600"><ArrowLeft className="w-6 h-6"/></button>
               <div>
                  <h1 className="text-xl font-black text-gray-800 flex items-center gap-2 font-bookman">{exam.title} <span className="text-xs font-normal bg-teal-50 px-2 py-1 rounded text-teal-600 border border-teal-100 font-poppins">{exam.code}</span></h1>
                  <button onClick={handleUpdateDuration} className="text-xs font-bold text-teal-500 hover:underline flex items-center mt-1"><Clock className="w-3 h-3 mr-1"/> {exam.duration} phút (Sửa)</button>
               </div>
            </div>
            <div className="flex gap-3">
               <button onClick={() => setShowImport(true)} className="flex items-center px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 transition-all border border-emerald-200"><FileUp className="w-4 h-4 mr-2"/> Import</button>
               <button onClick={handleAddEmpty} className="flex items-center px-5 py-2.5 bg-teal-50 text-teal-700 rounded-xl font-bold hover:bg-teal-100 transition-all border border-teal-200"><Plus className="w-4 h-4 mr-2"/> Thêm câu</button>
               <button onClick={() => setShowPublishModal(true)} className="flex items-center px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-teal-200 hover:shadow-xl transition-all"><PlayCircle className="w-5 h-5 mr-2"/> XUẤT BẢN</button>
            </div>
         </div>
         
         {/* EDITOR CONTENT */}
         <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full space-y-6">
            {questions.length === 0 ? <div className="text-center text-gray-400 mt-32"><p>Đề thi trống. Hãy thêm câu hỏi mới.</p></div> : questions.map((q: any, idx: number) => (
               <div key={q.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 group">
                  {q.section && (idx === 0 || q.section !== questions[idx-1].section) && <div className="text-xs font-black text-teal-600 uppercase mb-4 tracking-wider bg-teal-50 p-2 rounded-lg w-fit border border-teal-100 font-bookman">{q.section}</div>}
                  <div className="flex gap-4">
                     <div className="flex flex-col items-center min-w-[60px]"><span className="bg-teal-600 text-white font-black text-sm px-3 py-1 rounded-lg shadow-md shadow-teal-200">Câu {idx+1}</span></div>
                     <div className="flex-1">
                        <div className="font-bold text-gray-800 mb-3 whitespace-pre-line text-lg"><MathRenderer text={q.question} /></div>
                        {q.type === 'choice' && <div className="grid grid-cols-2 gap-3">{q.options.map((o:any, i:any) => <div key={i} className={`text-sm p-4 rounded-xl border ${o===q.answer?'bg-teal-50 border-teal-200 text-teal-800 font-bold ring-1 ring-teal-200':'bg-white border-gray-100 text-gray-600'}`}>{String.fromCharCode(65+i)}. <MathRenderer text={o} /></div>)}</div>}
                        {q.type === 'group' && <div className="space-y-2 mt-2">{q.subQuestions.map((s:any, i:any) => <div key={i} className="text-sm bg-gray-50 p-3 rounded-xl flex justify-between border border-gray-100"><span><MathRenderer text={s.content} /></span><span className={`text-xs px-2 py-1 rounded font-bold ${s.correctAnswer?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{s.correctAnswer?'ĐÚNG':'SAI'}</span></div>)}</div>}
                        {q.type === 'text' && <div className="bg-yellow-50 p-4 rounded-xl text-sm text-yellow-800 border border-yellow-200 mt-2 font-mono"><span className="font-bold">Gợi ý:</span> {q.answer}</div>}
                     </div>
                     <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingQ(q)} className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-teal-50 hover:text-teal-600 border border-transparent transition-colors"><Edit className="w-4 h-4"/></button>
                        <button onClick={() => handleDeleteQ(q.id)} className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 border border-transparent transition-colors"><Trash2 className="w-4 h-4"/></button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};
