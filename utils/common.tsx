import React from 'react';
import { Question } from '../types';

// --- LIBRARY: LATEX MATH GENERATOR CONFIG ---
export const LATEX_MATH_CONFIG = {
  "name": "latex_math_generator",
  "version": "1.0",
  "description": "Sinh ký hiệu toán học – hình học – công thức LaTeX cho hệ thống thi trắc nghiệm và trình hiển thị.",
  
  "output_rules": {
    "format": "latex_only",
    "inline": "\\( ... \\)",
    "display": "\\[ ... \\]",
    "no_explanation_if_not_requested": true
  },

  "symbols": {
    "angle": {
      "angle": "\\angle",
      "right_angle": "90^{\\circ}",
      "degree": "^{\\circ}",
      "angle_ABC": "\\angle ABC"
    },

    "geometry": {
      "triangle": "\\triangle ABC",
      "segment": "\\overline{AB}",
      "vector": "\\vec{AB}",
      "parallel": "\\parallel",
      "perpendicular": "\\perp",
      "congruent": "\\cong",
      "similar": "\\sim"
    },

    "algebra": {
      "fraction": "\\frac{a}{b}",
      "sqrt": "\\sqrt{a}",
      "nth_root": "\\sqrt[n]{a}",
      "power": "a^n",
      "sum": "\\sum_{i=1}^n a_i",
      "product": "\\prod_{i=1}^n"
    },

    "calculus": {
      "limit": "\\lim_{x \\to a}",
      "derivative": "\\frac{dy}{dx}",
      "integral": "\\int_a^b f(x) dx"
    },

    "logic_sets": {
      "forall": "\\forall",
      "exists": "\\exists",
      "in": "\\in",
      "not_in": "\\notin",
      "subset": "\\subset",
      "union": "\\cup",
      "intersection": "\\cap"
    }
  },

  "usage_instructions": {
    "inline_formula": "Dùng template inline: \\( SYMBOL \\)",
    "display_formula": "Dùng template display: \\[ SYMBOL \\]",
    "syntax_note": "Không được tự động thêm text ngoài công thức.",
    "response_examples": {
      "ask: gốc vuông ABC": "output: \\( \\angle ABC = 90^{\\circ} \\)",
      "ask: cho tôi ký hiệu AB song song CD": "output: \\( AB \\parallel CD \\)"
    }
  }
};

// --- External Lib Loading ---
export const loadExternalLibs = async () => {
  // Cấu hình MathJax trước khi load script
  if (!(window as any).MathJax) {
    (window as any).MathJax = {
      tex: {
        // Ưu tiên \( \) và \[ \] theo chuẩn mới, vẫn giữ $ để tương thích ngược
        inlineMath: [['\\(', '\\)'], ['$', '$']],
        displayMath: [['\\[', '\\]'], ['$$', '$$']],
        packages: {'[+]': ['mhchem', 'ams']} // Kích hoạt gói Hóa học và AMS cho Toán/Lý
      },
      loader: { load: ['[tex]/mhchem', '[tex]/ams'] },
      startup: {
        typeset: false // Chúng ta sẽ gọi typeset thủ công trong React component
      }
    };
  }

  const loadScript = (src: string) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  try {
    // Word parser
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
    // Excel parser
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    
    // MathJax v3 (Toán, Lý, Hóa)
    await loadScript('https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js');
    
    return true;
  } catch (e) {
    console.error("Lỗi tải thư viện:", e);
    return false;
  }
};

// --- Helper: Render Inline Markdown (Inline Code & Bold) ---
const renderInlineMarkdown = (text: string) => {
  if (typeof text !== 'string') return null;
  // 1. Inline Code `...`
  // Split text by backticks
  const parts = text.split(/(`[^`]+`)/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      const codeContent = part.slice(1, -1);
      return (
        <code key={i} className="font-mono text-sm text-red-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 mx-1 align-middle">
          {codeContent}
        </code>
      );
    }
    
    // 2. Bold **...** inside normal text parts
    const subParts = part.split(/(\*\*[^\*]+\*\*)/g);
    return (
      <span key={i}>
        {subParts.map((sp, j) => {
          if (sp.startsWith('**') && sp.endsWith('**')) {
            return <strong key={j} className="font-bold text-gray-900">{sp.slice(2, -2)}</strong>;
          }
          return <span key={j}>{sp}</span>;
        })}
      </span>
    );
  });
};

// --- Math Renderer with MathJax v3 and IDE-style Code Blocks ---
export const MathRenderer: React.FC<{ text: string, allowMarkdown?: boolean }> = ({ text, allowMarkdown = false }) => {
  const containerRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (typeof text !== 'string') return;
    
    // Gọi MathJax để render lại nội dung trong container khi text thay đổi
    if ((window as any).MathJax && (window as any).MathJax.typesetPromise && containerRef.current) {
        // Xóa style cũ nếu có (đôi khi MathJax để lại)
        (window as any).MathJax.typesetPromise([containerRef.current])
            .catch((err: any) => console.error('MathJax typeset error:', err));
    }
  }, [text]);

  if (typeof text !== 'string') return null;

  if (!allowMarkdown) {
      return <span ref={containerRef}>{text}</span>;
  }

  // 1. Split by Code Blocks (Triple backticks)
  // Non-greedy match for content between ``` and ```
  const codeBlockRegex = /(```(?:\w+)?\s*[\s\S]*?```)/g;
  const parts = text.split(codeBlockRegex);

  return (
     <span ref={containerRef} className="block w-full">
        {parts.map((part, i) => {
            // Check if it's a code block
            if (part.startsWith('```') && part.endsWith('```')) {
                const rawContent = part.slice(3, -3).trim();
                let language = 'CODE';
                let code = rawContent;
                
                // Cải thiện logic nhận diện ngôn ngữ
                // Trường hợp 1: Có xuống dòng sau tên ngôn ngữ (VD: ```python\n...)
                const firstLineBreak = rawContent.indexOf('\n');
                if (firstLineBreak > -1) {
                    const firstLine = rawContent.substring(0, firstLineBreak).trim();
                    if (firstLine && /^[a-zA-Z0-9+#]+$/.test(firstLine) && firstLine.length < 15) { 
                        language = firstLine.toUpperCase();
                        code = rawContent.substring(firstLineBreak + 1);
                    }
                } 
                // Trường hợp 2: Viết liền một dòng (VD: ```python i=0```)
                else {
                    const firstSpace = rawContent.indexOf(' ');
                    if (firstSpace > -1) {
                        const firstWord = rawContent.substring(0, firstSpace).trim();
                        if (firstWord && /^[a-zA-Z0-9+#]+$/.test(firstWord)) {
                            language = firstWord.toUpperCase();
                            code = rawContent.substring(firstSpace + 1);
                        }
                    }
                }
                
                return (
                    <div key={i} className="my-4 rounded-lg overflow-hidden border border-gray-700 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm shadow-md block w-full text-left relative z-0">
                        <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700 select-none">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                            </div>
                            <span className="text-xs font-bold text-gray-400">{language}</span>
                        </div>
                        <pre className="p-4 overflow-x-auto m-0">
                            <code>{code}</code> 
                        </pre>
                    </div>
                );
            }
            
            // Process Inline Code and Bold within non-code-block text
            return <React.Fragment key={i}>{renderInlineMarkdown(part)}</React.Fragment>;
        })}
     </span>
  );
};

// --- Smart Text Renderer (Handles Newlines, Lists, Bold, Headers, Math, Code Blocks) ---
export const SmartTextRenderer = ({ text }: { text: string }) => {
    if (typeof text !== 'string') return null;
    
    // First split by code blocks to preserve them from line splitting
    const codeBlockRegex = /(```(?:\w+)?\s*[\s\S]*?```)/g;
    const parts = text.split(codeBlockRegex);

    return (
        <div className="space-y-1.5 text-gray-700 leading-relaxed">
            {parts.map((part, pIdx) => {
                // If it is a code block, render directly using MathRenderer
                if (part.startsWith('```') && part.endsWith('```')) {
                    return <MathRenderer key={pIdx} text={part} allowMarkdown={true} />;
                }

                // If regular text, process line by line
                const lines = part.split('\n');
                return lines.map((line, idx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <div key={`${pIdx}-${idx}`} className="h-2"></div>; // Empty line spacing

                    // Check for Headers (###)
                    if (trimmed.startsWith('### ')) {
                        return <h3 key={`${pIdx}-${idx}`} className="text-md font-bold text-teal-800 mt-2 mb-1 border-b border-teal-50 pb-1">{trimmed.substring(4)}</h3>;
                    }
                    if (trimmed.startsWith('## ')) {
                        return <h2 key={`${pIdx}-${idx}`} className="text-lg font-black text-teal-900 mt-3 mb-2">{trimmed.substring(3)}</h2>;
                    }

                    // Check for list items
                    const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
                    const isNumber = /^\d+\.\s/.test(trimmed);
                    
                    let content = trimmed;
                    let className = "";

                    if (isBullet) {
                        content = trimmed.substring(2);
                        className = "pl-4 flex items-start gap-2";
                    } else if (isNumber) {
                        // Keep number but indent
                        className = "pl-4";
                    }

                    return (
                        <div key={`${pIdx}-${idx}`} className={className}>
                            {isBullet && <span className="text-purple-500 mt-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0 block"></span>}
                            <div className={isBullet ? "flex-1" : ""}>
                                <MathRenderer text={content} allowMarkdown={true} />
                            </div>
                        </div>
                    );
                });
            })}
        </div>
    );
};


// --- Utils ---
export const generateSecurityCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const copyToClipboard = (text: string) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try { document.execCommand('copy'); alert("Đã copy mã: " + text); } 
  catch (err) { prompt("Copy thủ công:", text); }
  document.body.removeChild(textArea);
};

export function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export const parseWordSmart = (content: string): Question[] => {
  if (typeof content !== 'string') return [];
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  const newQuestions: Question[] = [];
  let currentSection = "";
  let currentQ: Partial<Question> | null = null;
  let lastTarget: 'question' | 'option' | 'subQuestion' = 'question'; // Track where to append text

  const sectionRegex = /^(PHẦN\s+[IVX]+\.?|PART\s+\d+|PHẦN\s+\d+)/i;
  const qStartRegex = /^(Câu|Question)\s*\d+[:.]/i;
  const optRegex = /^(\*)?([A-D])\.(.*)/; 
  const subQRegex = /^(\*)?([a-d])\)(.*)/;

  lines.forEach(line => {
    // 1. Detect Section
    if (sectionRegex.test(line)) { 
        currentSection = line; 
        return; 
    }

    // 2. Detect New Question
    if (qStartRegex.test(line)) {
       if (currentQ) {
           if ((!currentQ.options || currentQ.options.length === 0) && (!currentQ.subQuestions || currentQ.subQuestions.length === 0)) {
                currentQ.type = 'text';
           }
           newQuestions.push(currentQ as Question);
       }
       const qText = line.replace(qStartRegex, "").trim();
       currentQ = { id: Date.now() + Math.random(), section: currentSection, question: qText, type: 'choice', options: [], subQuestions: [], answer: '' };
       lastTarget = 'question';
       return;
    }

    if (currentQ) {
       const optMatch = line.match(optRegex);
       const subMatch = line.match(subQRegex);

       // 3. Detect Option (A. B. C. D.)
       if (optMatch) {
          currentQ.type = 'choice';
          const isCorrect = !!optMatch[1];
          const text = optMatch[3].trim();
          currentQ.options?.push(text);
          if (isCorrect) currentQ.answer = text;
          lastTarget = 'option';
       } 
       // 4. Detect Sub Question (a) b) c))
       else if (subMatch) {
          currentQ.type = 'group';
          const isTrue = !!subMatch[1];
          const text = subMatch[3].trim();
          currentQ.subQuestions?.push({ id: Math.random().toString(36).substr(2, 9), content: text, correctAnswer: isTrue });
          lastTarget = 'subQuestion';
       } 
       // 5. Append text to previous target (Support Multiline content/code)
       else {
          if (lastTarget === 'question') {
              currentQ.question += "\n" + line;
          } else if (lastTarget === 'option' && currentQ.options && currentQ.options.length > 0) {
              const lastIdx = currentQ.options.length - 1;
              currentQ.options[lastIdx] += "\n" + line;
              // If this option was the correct answer, update the answer field too
              if (currentQ.answer && currentQ.options[lastIdx].startsWith(currentQ.answer)) {
                  currentQ.answer = currentQ.options[lastIdx];
              }
          } else if (lastTarget === 'subQuestion' && currentQ.subQuestions && currentQ.subQuestions.length > 0) {
              const lastIdx = currentQ.subQuestions.length - 1;
              currentQ.subQuestions[lastIdx].content += "\n" + line;
          }
       }
    }
  });

  if (currentQ) {
      if ((!currentQ.options || currentQ.options.length === 0) && (!currentQ.subQuestions || currentQ.subQuestions.length === 0)) currentQ.type = 'text';
      newQuestions.push(currentQ as Question);
  }
  return newQuestions;
};

// --- Student Import Utils ---
export const parseStudentImport = (text: string) => {
  if (typeof text !== 'string') return [];
  // Hỗ trợ cả CSV (dấu phẩy) và Copy từ Excel (Tab)
  const lines = text.split('\n').filter(l => l.trim());
  return lines.map(line => {
    // Tách theo tab hoặc phẩy
    const parts = line.split(/[\t,]/).map(p => p.trim());
    // Giả định định dạng: Tên, Lớp, Email(opt)
    if (parts.length >= 2) {
      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2,5),
        name: parts[0],
        className: parts[1],
        email: parts[2] || ''
      };
    }
    return null;
  }).filter(Boolean);
};