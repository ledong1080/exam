
import React, { useState, useEffect, useRef } from 'react';
import { Edit, X, Check, FileUp, UploadCloud, Loader2, CheckSquare, FolderPlus, XCircle, Share2, Clock, Copy, Sparkles, Eye, Send, RotateCcw, CheckCircle, ArrowLeft, RefreshCw, UserPlus, Users, Link, FileSpreadsheet, Download, PlayCircle, BookOpen } from 'lucide-react';
import { Question, SubQuestion, GradingConfig, Student, ExamConfig } from '../types';
import { MathRenderer, loadExternalLibs, copyToClipboard, parseWordSmart, generateSecurityCode, parseStudentImport } from '../utils/common';

// --- EDIT QUESTION MODAL ---
export const EditQuestionModal = ({ question, onSave, onClose }: { question: Question, onSave: (q: Question) => void, onClose: () => void }) => {
  const [editedQ, setEditedQ] = useState<Question>(JSON.parse(JSON.stringify(question)));
  
  const handleOptionTextChange = (idx: number, newVal: string) => {
     const newOpts = [...(editedQ.options || [])];
     if (editedQ.answer === newOpts[idx]) setEditedQ({ ...editedQ, options: newOpts.map((o, i) => i === idx ? newVal : o), answer: newVal });
     else { newOpts[idx] = newVal; setEditedQ({ ...editedQ, options: newOpts }); }
  };

  const handleSubQChange = (idx: number, field: keyof SubQuestion, val: any) => {
     const newSubs = [...(editedQ.subQuestions || [])];
     newSubs[idx] = { ...newSubs[idx], [field]: val };
     setEditedQ({...editedQ, subQuestions: newSubs});
  };

  return (
    <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in font-poppins">
      <div className="bg-white rounded-[24px] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-teal-100">
        <div className="p-6 border-b border-teal-50 flex justify-between items-center bg-teal-50/50 rounded-t-[24px]">
           <h3 className="text-xl font-bold text-teal-800 flex items-center"><Edit className="w-5 h-5 mr-2 text-teal-600"/> Chỉnh sửa câu hỏi</h3>
           <button onClick={onClose} className="p-2 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors text-gray-400"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
           <div><label className="block text-xs font-bold text-teal-600 uppercase mb-1">Phần thi</label><input type="text" value={editedQ.section || ''} onChange={e => setEditedQ({...editedQ, section: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white outline-none focus:border-teal-500 transition-colors" /></div>
           <div><label className="block text-xs font-bold text-teal-600 uppercase mb-1">Nội dung (Dùng $...$ cho công thức Toán)</label><textarea value={editedQ.question} onChange={e => setEditedQ({...editedQ, question: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl outline-none h-24 font-mono text-sm focus:border-teal-500 transition-colors" /></div>
           <div className="bg-teal-50 p-4 rounded-xl text-sm text-teal-800 border border-teal-100"><span className="font-bold text-teal-600 block mb-1">Preview:</span> <MathRenderer text={editedQ.question} /></div>
           {editedQ.type === 'choice' && (
             <div><label className="block text-xs font-bold text-teal-600 uppercase mb-2">Lựa chọn</label><div className="space-y-2">{editedQ.options?.map((opt, i) => (
               <div key={i} className="flex items-center gap-2">
                  <div onClick={() => setEditedQ({...editedQ, answer: opt})} className="cursor-pointer p-2 hover:bg-teal-50 rounded-full transition-colors">{editedQ.answer === opt ? <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center shadow-sm"><Check className="w-4 h-4 text-white"/></div> : <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>}</div>
                  <input type="text" value={opt} onChange={e => handleOptionTextChange(i, e.target.value)} className="flex-1 p-3 border border-gray-200 rounded-xl outline-none font-mono text-sm focus:border-teal-500 transition-colors" />
                  <div className="text-xs text-gray-500 min-w-[50px]"><MathRenderer text={opt} /></div>
               </div>
             ))}</div></div>
           )}
           {editedQ.type === 'group' && (
             <div><label className="block text-xs font-bold text-teal-600 uppercase mb-2">Ý Đúng/Sai</label><div className="space-y-3">{editedQ.subQuestions?.map((sub, i) => (
               <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200"><span className="font-bold text-gray-500 mt-2">{String.fromCharCode(97+i)})</span><textarea value={sub.content} onChange={e => handleSubQChange(i, 'content', e.target.value)} className="flex-1 p-2 border rounded-lg text-sm outline-none focus:border-teal-500" rows={2} /><div className="flex flex-col gap-2 ml-2 min-w-[80px]"><label className="flex items-center text-xs font-bold text-green-700"><input type="radio" checked={sub.correctAnswer === true} onChange={() => handleSubQChange(i, 'correctAnswer', true)} className="mr-1 accent-green-600" /> Đúng</label><label className="flex items-center text-xs font-bold text-red-700"><input type="radio" checked={sub.correctAnswer === false} onChange={() => handleSubQChange(i, 'correctAnswer', false)} className="mr-1 accent-red-600" /> Sai</label></div></div>
             ))}</div></div>
           )}
           {editedQ.type === 'text' && (
              <div><label className="block text-xs font-bold text-teal-600 uppercase mb-1">Đáp án gợi ý</label><textarea value={editedQ.answer || ''} onChange={e => setEditedQ({...editedQ, answer: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-teal-500 transition-colors" rows={3} /></div>
           )}
        </div>
        <div className="p-5 border-t border-teal-50 bg-teal-50/30 flex justify-end gap-3 rounded-b-[24px]">
           <button onClick={onClose} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors">Hủy</button>
           <button onClick={() => onSave(editedQ)} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all">Lưu Thay Đổi</button>
        </div>
      </div>
    </div>
  );
};

// --- IMPORT EXAM MODAL ---
export const ImportModal = ({ onClose, onImport }: { onClose: () => void, onImport: (q: Question[]) => void }) => {
  const [content, setContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => { loadExternalLibs(); }, []);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (!file) return;

    // Sử dụng FileReader để đọc file arrayBuffer
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const mammoth = (window as any).mammoth; 
            if (!mammoth) { 
                alert("Thư viện đọc file chưa tải xong. Vui lòng đợi và thử lại."); 
                loadExternalLibs();
                return; 
            }
            const res = await mammoth.extractRawText({ arrayBuffer: arrayBuffer }); 
            setContent(res.value); 
        } catch (err) { 
            console.error(err);
            alert("Lỗi đọc file! Vui lòng kiểm tra lại file Word."); 
        }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // Reset input
  };

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => { 
        const res = parseWordSmart(content); 
        if (res.length > 0) { 
            onImport(res); 
            onClose(); 
        } else { 
            alert("Không tìm thấy dữ liệu câu hỏi hợp lệ! Vui lòng kiểm tra định dạng nội dung."); 
        } 
        setIsProcessing(false); 
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in font-poppins">
      <div className="bg-white rounded-[24px] p-8 w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl border border-teal-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-teal-800 border-b border-teal-50 pb-4"><div className="bg-teal-100 p-2 rounded-xl mr-3"><FileUp className="w-6 h-6 text-teal-600"/></div> Import Đề Thi</h2>
        <div className="mb-4 p-8 border-2 border-dashed border-teal-200 rounded-[24px] bg-teal-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 hover:border-teal-300 transition-all group" onClick={() => fileInputRef.current?.click()}>
             <input type="file" accept=".docx" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
             <UploadCloud className="w-12 h-12 text-teal-400 group-hover:text-teal-600 mb-2 transition-colors"/>
             <p className="font-bold text-teal-700 text-lg">Chọn file Word (.docx)</p>
             <p className="text-xs text-teal-500 mt-2">Hỗ trợ đọc công thức Toán học</p>
        </div>
        <textarea className="flex-1 p-5 border border-gray-200 rounded-2xl font-mono text-sm resize-none outline-none focus:border-teal-500 transition-colors" value={content} onChange={e => setContent(e.target.value)} placeholder="Dán nội dung có chứa công thức LaTeX (VD: $\frac{a}{b}$)..." />
        <div className="flex justify-end gap-3 mt-6 border-t border-teal-50 pt-4">
          <button onClick={onClose} className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-bold">Hủy</button>
          <button onClick={handleProcess} disabled={!content || isProcessing} className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200 flex items-center disabled:opacity-50 transition-all">{isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <CheckSquare className="w-5 h-5 mr-2"/>} Xử lý & Nhập</button>
        </div>
      </div>
    </div>
  );
};

// --- CREATE EXAM MODAL ---
export const CreateExamModal = ({ onClose, onCreate }: any) => {
  const [form, setForm] = useState({ code: '', title: '', className: '' });
  return (
    <div className="fixed inset-0 bg-teal-900/50 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in font-poppins">
      <div className="bg-white rounded-[24px] p-8 w-full max-w-lg shadow-2xl border border-teal-100">
        <div className="flex items-center justify-between mb-6 border-b border-teal-50 pb-4"><h2 className="text-2xl font-bold text-teal-800 flex items-center"><FolderPlus className="mr-3 text-teal-600" /> Tạo Đề Thi Mới</h2><button onClick={onClose}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors"/></button></div>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-xs font-bold text-teal-600 uppercase mb-1">Mã đề</label><input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full p-3 border border-teal-100 rounded-xl outline-none bg-teal-50/30 focus:bg-white transition-colors focus:ring-2 ring-teal-500" placeholder="VD: GK1" /></div>
             <div><label className="block text-xs font-bold text-teal-600 uppercase mb-1">Lớp</label><input type="text" value={form.className} onChange={e => setForm({...form, className: e.target.value})} className="w-full p-3 border border-teal-100 rounded-xl outline-none bg-teal-50/30 focus:bg-white transition-colors focus:ring-2 ring-teal-500" placeholder="VD: 12A1" /></div>
          </div>
          <div><label className="block text-xs font-bold text-teal-600 uppercase mb-1">Tên đề thi</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full p-3 border border-teal-100 rounded-xl outline-none bg-teal-50/30 focus:bg-white transition-colors focus:ring-2 ring-teal-500" placeholder="VD: Kiểm tra 1 tiết..." /></div>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-all">Hủy bỏ</button>
          <button onClick={() => onCreate({...form, id: Date.now().toString(), questions: [], results: [], createdAt: new Date().toLocaleString(), duration: 45, maxAttempts: 0, securityCode: '', allowHints: false, allowReview: true})} className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-200 font-bold transition-all transform hover:-translate-y-0.5">Tạo Ngay</button>
        </div>
      </div>
    </div>
  );
};

// --- PUBLISH EXAM MODAL ---
export const PublishExamModal = ({ exam, onClose, onConfirm, onCreateNew, onPlay }: any) => {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState({ 
    securityCode: exam.securityCode || generateSecurityCode(), 
    allowHints: exam.allowHints || false, 
    allowReview: exam.allowReview !== undefined ? exam.allowReview : true, 
    duration: exam.duration || 45, 
    maxAttempts: exam.maxAttempts || 0,
    gradingConfig: exam.gradingConfig || { part1Total: 5, part2Total: 2, part3Total: 2, part4Total: 1, groupGradingMethod: 'progressive' }
  });

  const updateGrading = (field: keyof GradingConfig, value: any) => {
    setSettings({...settings, gradingConfig: { ...settings.gradingConfig, [field]: value }});
  };

  const handlePublish = () => {
    onConfirm(settings);
    setStep(2);
  };

  const fakeLink = `http://thaydong.site/?examId=${exam.id}&code=${settings.securityCode}`;

  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-teal-900/50 backdrop-blur-sm flex items-center justify-center z-[70] animate-fade-in font-poppins">
        <div className="bg-white rounded-[24px] p-8 w-full max-w-lg shadow-2xl border border-teal-100 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-emerald-400"></div>
           <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><CheckCircle className="w-10 h-10 text-green-500"/></div>
           <h2 className="text-2xl font-black text-gray-800 mb-2">Xuất bản thành công!</h2>
           <p className="text-gray-500 mb-8 text-sm">Hãy sao chép và gửi link cùng mã đề dưới đây cho học sinh.</p>
           
           <div className="space-y-4 mb-8 text-left">
              <div><label className="text-xs font-bold text-gray-600 mb-1 block">Link bài tập cho học sinh:</label><div className="flex gap-2"><input type="text" readOnly value={fakeLink} className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-teal-700 font-medium outline-none" /><button onClick={() => copyToClipboard(fakeLink)} className="px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-xs text-gray-600 transition-colors">Copy</button></div></div>
              <div><label className="text-xs font-bold text-gray-600 mb-1 block">Mã đề cho học sinh:</label><div className="flex gap-2"><div className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg font-black text-gray-800 tracking-widest">{settings.securityCode}</div><button onClick={() => copyToClipboard(settings.securityCode)} className="px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-xs text-gray-600 transition-colors">Copy</button></div></div>
           </div>

           <div className="bg-yellow-50 p-4 rounded-xl text-xs text-yellow-800 border border-yellow-100 mb-8 text-left">
              <span className="font-bold">Lưu ý quan trọng:</span> Link bài tập có thể cần vài phút để hoạt động sau khi tạo. Vui lòng kiểm tra link trước khi gửi cho học sinh.
           </div>

           <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors">Quay về trang chủ</button>
              {onPlay && <button onClick={onPlay} className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all flex items-center justify-center"><PlayCircle className="w-4 h-4 mr-2"/> Thi thử ngay</button>}
              {onCreateNew && <button onClick={onCreateNew} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Tạo đề khác</button>}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-teal-900/50 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in font-poppins">
      <div className="bg-white rounded-[24px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-teal-100">
         <div className="p-6 border-b border-teal-50 flex justify-between items-center bg-teal-50/50 rounded-t-[24px]">
            <h1 className="text-3xl font-black text-teal-800 flex items-center tracking-tight">Cấu hình trước khi phát hành</h1>
            <button onClick={onClose}><X className="w-6 h-6 text-gray-400 hover:text-red-500"/></button>
         </div>
         <div className="p-8 overflow-y-auto space-y-8">
            {/* Security Code */}
            <div><label className="block text-sm font-bold text-teal-700 uppercase mb-2">Mã Bảo Mật (6 ký tự)</label><div className="flex gap-2"><input type="text" value={settings.securityCode} onChange={e => setSettings({...settings, securityCode: e.target.value.toUpperCase()})} className="flex-1 p-4 border border-teal-100 rounded-xl text-center text-2xl font-black tracking-[0.2em] text-teal-600 outline-none focus:border-teal-500 bg-teal-50/30 uppercase" maxLength={6} /><button onClick={() => setSettings({...settings, securityCode: generateSecurityCode()})} className="p-4 bg-teal-100 text-teal-600 rounded-xl hover:bg-teal-200 transition-colors"><RefreshCw className="w-6 h-6"/></button></div></div>

            <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm font-bold text-teal-700 uppercase mb-2">Thời gian làm bài (Phút)</label><input type="number" value={settings.duration} onChange={e => setSettings({...settings, duration: Number(e.target.value)})} className="w-full p-4 border border-teal-100 rounded-xl outline-none font-bold text-lg text-gray-700 focus:border-teal-500 transition-colors" /></div>
                <div><label className="block text-sm font-bold text-teal-700 uppercase mb-2">Số lần làm bài tối đa (0 = Vô hạn)</label><input type="number" value={settings.maxAttempts} onChange={e => setSettings({...settings, maxAttempts: Number(e.target.value)})} className="w-full p-4 border border-teal-100 rounded-xl outline-none font-bold text-lg text-gray-700 focus:border-teal-500 transition-colors" /></div>
            </div>

            {/* Grading Config */}
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
               <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><CheckSquare className="w-4 h-4"/> Cài đặt thang điểm (Tổng mặc định là 10)</h4>
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Tổng điểm P.I (TN)</label><input type="number" value={settings.gradingConfig.part1Total} onChange={e => updateGrading('part1Total', Number(e.target.value))} className="w-full p-2 border rounded-lg font-bold" /></div>
                  <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Tổng điểm P.II (Đúng/Sai)</label><input type="number" value={settings.gradingConfig.part2Total} onChange={e => updateGrading('part2Total', Number(e.target.value))} className="w-full p-2 border rounded-lg font-bold" /></div>
                  <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Tổng điểm P.III (TL Ngắn)</label><input type="number" value={settings.gradingConfig.part3Total} onChange={e => updateGrading('part3Total', Number(e.target.value))} className="w-full p-2 border rounded-lg font-bold" /></div>
                  <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Tổng điểm P.IV (Tự luận)</label><input type="number" value={settings.gradingConfig.part4Total} onChange={e => updateGrading('part4Total', Number(e.target.value))} className="w-full p-2 border rounded-lg font-bold" /></div>
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1">Cách tính điểm cho mỗi câu P.II (Đúng/Sai)</label>
                  <select value={settings.gradingConfig.groupGradingMethod} onChange={e => updateGrading('groupGradingMethod', e.target.value)} className="w-full p-3 border rounded-xl bg-white outline-none font-medium text-sm">
                      <option value="progressive">Lũy tiến (1ý=10%, 2ý=25%, 3ý=50%, 4ý=100% điểm câu)</option>
                      <option value="equal">Đồng đều (Chia đều điểm cho số ý)</option>
                  </select>
               </div>
            </div>

            <div className="space-y-3">
               <label className="flex items-center justify-between p-4 border border-teal-100 rounded-xl cursor-pointer hover:bg-teal-50 transition-colors">
                  <span className="font-bold text-teal-800 flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500"/> Hỗ trợ AI Gợi ý</span>
                  <input type="checkbox" checked={settings.allowHints} onChange={e => setSettings({...settings, allowHints: e.target.checked})} className="w-6 h-6 accent-teal-600" />
               </label>
               <label className="flex items-center justify-between p-4 border border-teal-100 rounded-xl cursor-pointer hover:bg-teal-50 transition-colors">
                  <span className="font-bold text-teal-800 flex items-center gap-2"><Eye className="w-5 h-5 text-blue-500"/> Cho phép xem kết quả</span>
                  <input type="checkbox" checked={settings.allowReview} onChange={e => setSettings({...settings, allowReview: e.target.checked})} className="w-6 h-6 accent-teal-600" />
               </label>
            </div>
         </div>
         <div className="p-6 border-t border-teal-50 flex justify-between items-center bg-teal-50/30 rounded-b-[24px]">
             <button onClick={onClose} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">Quay lại</button>
             <button onClick={handlePublish} className="px-8 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all transform hover:-translate-y-0.5 flex items-center"><Send className="w-4 h-4 mr-2"/> Xuất Bản Ngay</button>
         </div>
      </div>
    </div>
  );
};

// --- STUDENT MODAL ---
export const StudentModal = ({ student, onClose, onSave }: { student?: Student, onClose: () => void, onSave: (s: Student) => void }) => {
  const [form, setForm] = useState<Student>(student || { id: '', name: '', className: '', email: '' });
  const isEdit = !!student;

  const handleSubmit = () => {
     if (!form.name || !form.className) return alert("Vui lòng nhập tên và lớp!");
     onSave({ ...form, id: form.id || Date.now().toString() });
  };

  return (
    <div className="fixed inset-0 bg-teal-900/50 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in font-poppins">
       <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl border border-teal-100">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-teal-50">
             <h2 className="text-2xl font-bold text-teal-800 flex items-center">{isEdit ? <Edit className="w-6 h-6 mr-2 text-teal-600"/> : <UserPlus className="w-6 h-6 mr-2 text-teal-600"/>} {isEdit ? 'Sửa thông tin' : 'Thêm học sinh'}</h2>
             <button onClick={onClose}><X className="w-6 h-6 text-gray-400 hover:text-red-500"/></button>
          </div>
          <div className="space-y-4">
             <div><label className="block text-xs font-bold text-teal-600 uppercase mb-1">Họ và tên</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-teal-500 outline-none font-bold text-gray-800 transition-colors" placeholder="Nguyễn Văn A" /></div>
             <div><label className="block text-xs font-bold text-teal-600 uppercase mb-1">Lớp</label><input type="text" value={form.className} onChange={e => setForm({...form, className: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-teal-500 outline-none font-bold text-gray-800 transition-colors" placeholder="12A1" /></div>
             <div><label className="block text-xs font-bold text-teal-600 uppercase mb-1">Email (Không bắt buộc)</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-teal-500 outline-none font-medium text-gray-600 transition-colors" placeholder="email@example.com" /></div>
          </div>
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-teal-50">
             <button onClick={onClose} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Hủy</button>
             <button onClick={handleSubmit} className="px-6 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-md shadow-teal-200 transition-all">Lưu thông tin</button>
          </div>
       </div>
    </div>
  );
};

// --- IMPORT STUDENT MODAL ---
export const ImportStudentModal = ({ onClose, onImport }: { onClose: () => void, onImport: (students: Student[]) => void }) => {
   const [text, setText] = useState('');
   const [fileInputKey, setFileInputKey] = useState(Date.now()); 
   const fileInputRef = useRef<HTMLInputElement>(null);
   useEffect(() => { loadExternalLibs(); }, []);

   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
         try {
            const data = evt.target?.result;
            const XLSX = (window as any).XLSX;
            if (!XLSX) { alert("Thư viện Excel chưa tải xong. Vui lòng thử lại."); return; }
            
            // Sử dụng type: 'array' để đảm bảo đọc được file chính xác
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

            if (!jsonData || jsonData.length === 0) { alert("File trống!"); return; }

            // Smart Header Detection
            let headerRowIndex = -1;
            let nameColIdx = -1;
            let classColIdx = -1;
            let emailColIdx = -1;

            // Quét 10 dòng đầu để tìm header
            for (let i = 0; i < Math.min(10, jsonData.length); i++) {
               const row = jsonData[i] as any[];
               row.forEach((cell: any, idx: number) => {
                  const cellText = String(cell).toLowerCase().trim();
                  if (cellText.includes('họ tên') || cellText.includes('name') || cellText.includes('họ và tên')) nameColIdx = idx;
                  if (cellText.includes('lớp') || cellText.includes('class')) classColIdx = idx;
                  if (cellText.includes('email') || cellText.includes('mail')) emailColIdx = idx;
               });
               if (nameColIdx !== -1) { headerRowIndex = i; break; }
            }

            // Nếu không tìm thấy header, fallback về cột A, B, C mặc định
            if (nameColIdx === -1) { nameColIdx = 0; classColIdx = 1; emailColIdx = 2; headerRowIndex = -1; }

            let resultText = "";
            for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
               const row = jsonData[i] as any[];
               if (!row || row.length === 0) continue;
               
               const name = row[nameColIdx] ? String(row[nameColIdx]).trim() : "";
               const className = (classColIdx !== -1 && row[classColIdx]) ? String(row[classColIdx]).trim() : "";
               const email = (emailColIdx !== -1 && row[emailColIdx]) ? String(row[emailColIdx]).trim() : "";

               if (name) {
                  resultText += `${name}\t${className}\t${email}\n`;
               }
            }
            
            setText(resultText);
            alert(`Đã đọc ${resultText.split('\n').filter(l=>l.trim()).length} dòng dữ liệu.`);
         } catch (err) {
            console.error(err);
            alert("Lỗi đọc file Excel!");
         }
      };
      // Đọc dưới dạng ArrayBuffer để hỗ trợ tốt nhất cho SheetJS
      reader.readAsArrayBuffer(file);
      setFileInputKey(Date.now()); // Reset input
   };

   const handleSave = () => {
      const students = parseStudentImport(text);
      if (students.length > 0) {
         onImport(students);
         onClose();
      } else {
         alert("Không có dữ liệu hợp lệ để nhập!");
      }
   };

   const downloadTemplate = () => {
      const XLSX = (window as any).XLSX;
      if (!XLSX) return;
      const ws = XLSX.utils.aoa_to_sheet([["Họ và tên", "Lớp", "Email"], ["Nguyễn Văn A", "12A1", "a@email.com"]]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Students");
      XLSX.writeFile(wb, "Mau_Danh_Sach_Hoc_Sinh.xlsx");
   };

   return (
      <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in font-poppins">
         <div className="bg-white rounded-[24px] p-8 w-full max-w-4xl shadow-2xl border border-teal-100 h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b border-teal-50 pb-4">
               <h2 className="text-2xl font-bold text-teal-800 flex items-center"><UploadCloud className="w-6 h-6 mr-2 text-teal-600"/> Import Danh sách Học sinh</h2>
               <button onClick={onClose}><X className="w-6 h-6 text-gray-400 hover:text-red-500"/></button>
            </div>
            
            <div className="flex justify-between items-center mb-2">
               <label className="text-xs font-bold text-teal-600 uppercase">CÁCH 1: UPLOAD FILE EXCEL (.XLSX, .XLS)</label>
               <button onClick={downloadTemplate} className="text-xs font-bold text-blue-600 hover:underline flex items-center"><Download className="w-3 h-3 mr-1"/> Tải file mẫu</button>
            </div>
            <div className="border-2 border-dashed border-teal-200 rounded-[20px] bg-teal-50/30 p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 transition-colors group mb-6" onClick={() => fileInputRef.current?.click()}>
               <FileSpreadsheet className="w-10 h-10 text-teal-400 group-hover:text-teal-600 mb-2 transition-colors"/>
               <span className="font-bold text-teal-700">Nhấn để chọn file Excel</span>
               <span className="text-xs text-teal-500 mt-1">Cột A: Họ tên | Cột B: Lớp | Cột C: Email</span>
               <input key={fileInputKey} type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFile} />
            </div>

            <div className="flex items-center gap-4 mb-4"><div className="h-px bg-gray-200 flex-1"></div><span className="text-xs font-bold text-gray-400 uppercase">HOẶC</span><div className="h-px bg-gray-200 flex-1"></div></div>

            <label className="text-xs font-bold text-teal-600 uppercase mb-2">CÁCH 2: COPY & PASTE TỪ EXCEL</label>
            <p className="text-xs text-gray-500 mb-2">Copy các cột (Họ tên, Lớp, Email) và dán vào bên dưới.</p>
            <textarea 
               value={text} 
               onChange={e => setText(e.target.value)} 
               className="flex-1 w-full p-4 border border-gray-200 rounded-2xl outline-none font-mono text-sm resize-none focus:border-teal-500 transition-colors bg-gray-50 focus:bg-white"
               placeholder={`Ví dụ:\nNguyen Van A    12A1    a@gmail.com\nTran Van B   12A2`}
            />

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-teal-50">
               <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">Hủy</button>
               <button onClick={handleSave} className="px-8 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all">Lưu danh sách</button>
            </div>
         </div>
      </div>
   );
};

// --- ASSIGN EXAM MODAL ---
export const AssignExamModal = ({ exam, students, onClose }: { exam: ExamConfig, students: Student[], onClose: () => void }) => {
   const [selectedClass, setSelectedClass] = useState('all');
   
   // Get unique classes from students
   const classes = Array.from(new Set(students.map(s => s.className))).sort();
   
   const filteredStudents = selectedClass === 'all' 
       ? students 
       : students.filter(s => s.className === selectedClass);

   const generateLink = (s: Student) => {
       // Tạo link tự động điền thông tin học sinh
       return `http://thaydong.site/?examId=${exam.id}&code=${exam.securityCode || ''}&name=${encodeURIComponent(s.name)}&class=${encodeURIComponent(s.className)}`;
   };

   return (
      <div className="fixed inset-0 bg-teal-900/50 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in font-poppins">
         <div className="bg-white rounded-[24px] p-8 w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl border border-teal-100">
            <div className="flex justify-between items-center mb-6 border-b border-teal-50 pb-4">
               <h2 className="text-2xl font-bold text-teal-800 flex items-center"><BookOpen className="w-6 h-6 mr-2 text-teal-600"/> Giao bài cho lớp</h2>
               <button onClick={onClose}><X className="w-6 h-6 text-gray-400 hover:text-red-500"/></button>
            </div>

            <div className="mb-6 flex gap-4 items-end">
               <div className="flex-1">
                  <label className="block text-xs font-bold text-teal-600 uppercase mb-2">Chọn lớp cần gửi link</label>
                  <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full p-3 border border-teal-200 rounded-xl outline-none font-bold text-gray-700 bg-gray-50 focus:bg-white focus:border-teal-500 transition-colors">
                     <option value="all">-- Chọn lớp --</option>
                     {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
               <div className="flex-1">
                   <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                       <p className="text-xs font-bold text-teal-600 uppercase mb-1">Mã đề thi</p>
                       <p className="text-lg font-black text-teal-800 tracking-widest">{exam.securityCode || 'CHƯA CÓ'}</p>
                   </div>
               </div>
            </div>

            <div className="flex-1 overflow-hidden border border-gray-200 rounded-2xl flex flex-col">
               <div className="bg-gray-100 p-3 grid grid-cols-12 gap-4 font-bold text-xs text-gray-500 uppercase border-b border-gray-200">
                  <div className="col-span-1 text-center">STT</div>
                  <div className="col-span-3">Họ Tên</div>
                  <div className="col-span-2">Lớp</div>
                  <div className="col-span-6">Link Cá Nhân Hóa (Auto-login)</div>
               </div>
               <div className="overflow-y-auto flex-1 bg-white p-2 space-y-2">
                  {selectedClass === 'all' ? (
                      <div className="text-center text-gray-400 mt-20">Vui lòng chọn lớp để xem danh sách link.</div>
                  ) : filteredStudents.length === 0 ? (
                      <div className="text-center text-gray-400 mt-20">Lớp này chưa có học sinh nào.</div>
                  ) : (
                      filteredStudents.map((s, i) => {
                         const link = generateLink(s);
                         return (
                            <div key={s.id} className="grid grid-cols-12 gap-4 items-center p-3 bg-gray-50 rounded-xl hover:bg-teal-50 transition-colors border border-transparent hover:border-teal-100 group">
                               <div className="col-span-1 text-center font-bold text-gray-400">{i+1}</div>
                               <div className="col-span-3 font-bold text-gray-800">{s.name}</div>
                               <div className="col-span-2 text-sm text-gray-600">{s.className}</div>
                               <div className="col-span-6 flex gap-2">
                                  <input type="text" readOnly value={link} className="flex-1 p-2 text-xs bg-white border border-gray-200 rounded-lg text-gray-500 outline-none select-all" />
                                  <button onClick={() => copyToClipboard(link)} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-colors text-gray-500" title="Copy Link"><Copy className="w-4 h-4"/></button>
                               </div>
                            </div>
                         )
                      })
                  )}
               </div>
            </div>
            
            <div className="flex justify-end mt-6 pt-4 border-t border-teal-50">
               <button onClick={onClose} className="px-6 py-2.5 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-600 transition-colors">Đóng</button>
            </div>
         </div>
      </div>
   );
};
