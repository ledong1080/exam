
export type QuestionType = 'choice' | 'text' | 'group';

export interface SubQuestion {
  id: string;
  content: string;
  correctAnswer: boolean;
}

export interface Question {
  id: number;
  type: QuestionType;
  section?: string;
  question: string;
  options?: string[];
  answer?: string;
  subQuestions?: SubQuestion[];
}

export interface StudentResult {
  id: string;
  name: string;
  className: string;
  score: number;
  total: number;
  date?: string;
  timeSpent?: number;
  violations: number;
  counts: {
    correct: number;
    wrong: number;
    empty: number;
  };
  answers?: any; // Lưu danh sách đáp án đã chọn
}

export interface GradingConfig {
  part1Total: number; // Tổng điểm phần Trắc nghiệm (choice)
  part2Total: number; // Tổng điểm phần Đúng/Sai (group)
  part3Total: number; // Tổng điểm phần Trả lời ngắn (text)
  part4Total: number; // Tổng điểm phần Tự luận (dự phòng)
  groupGradingMethod: 'progressive' | 'equal'; // 'progressive': Lũy tiến, 'equal': Đồng đều
}

export interface ExamConfig {
  id: string;
  code: string;
  securityCode: string;
  title: string;
  className: string;
  duration: number;
  maxAttempts?: number; // Số lần làm bài tối đa (0 = không giới hạn)
  gradingConfig?: GradingConfig; // Cấu hình thang điểm
  allowHints: boolean;
  allowReview: boolean;
  questions: Question[];
  results: StudentResult[];
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  className: string;
  email?: string; // Optional: để giả lập gửi mail
}

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 1,
    type: 'choice',
    question: "Góc có số đo $300^\\circ$ đổi sang radian là:",
    options: ["$\\frac{5\\pi}{3}$", "$\\frac{4\\pi}{3}$", "$\\frac{7\\pi}{6}$", "$\\frac{10\\pi}{3}$"],
    answer: "$\\frac{5\\pi}{3}$"
  },
];
