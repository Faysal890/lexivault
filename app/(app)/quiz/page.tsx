"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import clsx from "clsx";

interface QuizQuestion {
  wordId: string;
  word: string;
  meaning: string;
  questionType: "multiple_choice" | "fill_blank" | "reverse";
  question: string;
  options?: string[];
  correctAnswer: string;
}

type Phase = "idle" | "loading" | "active" | "result";

export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean; word: string }[]>([]);
  const [fillAnswer, setFillAnswer] = useState("");
  const [quizType, setQuizType] = useState<"mixed" | "multiple_choice" | "fill_blank" | "reverse">("mixed");
  const [quizSize, setQuizSize] = useState(10);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const startQuiz = async () => {
    setPhase("loading");
    try {
      const res = await fetch(`/api/quiz/generate?type=${quizType}&size=${quizSize}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to generate quiz");
      if (data.questions.length === 0) {
        toast.error("Add at least 4 words to start a quiz!");
        setPhase("idle");
        return;
      }
      setQuestions(data.questions);
      setCurrent(0);
      setAnswers([]);
      setScore(0);
      setSelected(null);
      setRevealed(false);
      setFillAnswer("");
      setPhase("active");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error starting quiz";
      toast.error(msg);
      setPhase("idle");
    }
  };

  const submitAnswer = useCallback(() => {
    if (revealed) return;
    const q = questions[current];
    const answer = q.questionType === "fill_blank" ? fillAnswer.trim() : selected ?? "";
    if (!answer) { toast.error("Please select or type an answer"); return; }

    const isCorrect = answer.toLowerCase() === q.correctAnswer.toLowerCase();
    setRevealed(true);
    if (isCorrect) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, { correct: isCorrect, word: q.word }]);
  }, [revealed, questions, current, fillAnswer, selected]);

  const nextQuestion = useCallback(async () => {
    if (current + 1 >= questions.length) {
      // Save quiz
      setSubmitting(true);
      try {
        await fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questions: questions.map((q, i) => ({
              wordId: q.wordId,
              questionType: q.questionType,
              userAnswer: answers[i]?.correct ? q.correctAnswer : "",
              correctAnswer: q.correctAnswer,
              isCorrect: answers[i]?.correct ?? false,
            })),
            score: answers.filter((a) => a.correct).length + (answers.length < questions.length ? (answers[answers.length - 1]?.correct ? 1 : 0) : 0),
            totalQuestions: questions.length,
            quizType,
          }),
        });
      } finally { setSubmitting(false); }
      setPhase("result");
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
    setRevealed(false);
    setFillAnswer("");
  }, [current, questions, answers, quizType]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase !== "active") return;
      const q = questions[current];
      if (e.key === "Enter") {
        if (!revealed) submitAnswer(); else nextQuestion();
      }
      if (q.questionType === "multiple_choice" && q.options && !revealed) {
        const idx = ["a", "b", "c", "d"].indexOf(e.key.toLowerCase());
        if (idx >= 0 && idx < q.options.length) setSelected(q.options[idx]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, questions, current, revealed, submitAnswer, nextQuestion]);

  if (phase === "idle") return <QuizSetup quizType={quizType} setQuizType={setQuizType} quizSize={quizSize} setQuizSize={setQuizSize} onStart={startQuiz} />;
  if (phase === "loading") return <div className="py-20 text-center"><span className="material-symbols-outlined text-5xl text-primary animate-spin block mb-4">refresh</span><p className="text-on-surface-variant">Generating quiz...</p></div>;
  if (phase === "result") return <QuizResult score={score} total={questions.length} answers={answers} quizType={quizType} onRetry={startQuiz} />;

  const q = questions[current];
  const progress = ((current) / questions.length) * 100;

  return (
    <div className="py-4 space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">Question {current + 1} of {questions.length}</span>
          <span className="text-sm font-bold text-on-surface-variant">{score} correct</span>
        </div>
        <div className="h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-secondary to-secondary-fixed-dim rounded-full shimmer-bar transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary-fixed/30 rounded-full blur-2xl" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded-xl">
            <span className="material-symbols-outlined text-primary text-sm">
              {q.questionType === "multiple_choice" ? "quiz" : q.questionType === "fill_blank" ? "edit" : "swap_horiz"}
            </span>
            <span className="text-xs font-bold text-on-surface-variant capitalize">{q.questionType.replace("_", " ")}</span>
          </div>
          <h2 className="font-headline text-2xl font-extrabold text-on-surface leading-tight">{q.question}</h2>
        </div>
      </div>

      {/* Answer Area */}
      {q.questionType === "fill_blank" ? (
        <div className="space-y-3">
          <input
            value={fillAnswer}
            onChange={(e) => setFillAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !revealed && submitAnswer()}
            placeholder="Type your answer..."
            className={clsx("input-field text-lg font-bold", revealed && (fillAnswer.toLowerCase() === q.correctAnswer.toLowerCase() ? "border-secondary bg-secondary-container/20" : "border-error bg-error-container/20"))}
            disabled={revealed}
            autoFocus
          />
          {revealed && (
            <div className={clsx("px-4 py-3 rounded-2xl text-sm font-bold", fillAnswer.toLowerCase() === q.correctAnswer.toLowerCase() ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container")}>
              {fillAnswer.toLowerCase() === q.correctAnswer.toLowerCase() ? "✓ Correct!" : `✗ Correct answer: "${q.correctAnswer}"`}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {q.options?.map((opt, i) => {
            const label = ["A", "B", "C", "D"][i];
            const isSelected = selected === opt;
            const isCorrect = opt.toLowerCase() === q.correctAnswer.toLowerCase();
            let cls = "quiz-option";
            if (revealed && isCorrect) cls = "quiz-option quiz-option-correct";
            else if (revealed && isSelected && !isCorrect) cls = "quiz-option quiz-option-wrong";
            else if (isSelected) cls = "quiz-option quiz-option-selected";
            return (
              <button key={opt} onClick={() => !revealed && setSelected(opt)} className={cls}>
                <div className="flex items-center gap-4">
                  <span className={clsx("w-9 h-9 flex items-center justify-center rounded-xl font-headline font-bold text-sm transition-colors",
                    revealed && isCorrect ? "bg-secondary text-on-secondary" :
                    revealed && isSelected && !isCorrect ? "bg-error text-on-error" :
                    isSelected ? "bg-primary text-on-primary" :
                    "bg-surface-container text-on-surface-variant"
                  )}>{label}</span>
                  <span className="font-semibold text-on-surface">{opt}</span>
                </div>
                {revealed && isCorrect && <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                {revealed && isSelected && !isCorrect && <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {!revealed ? (
          <button onClick={submitAnswer} className="btn-primary flex items-center justify-center gap-2">
            Check Answer <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        ) : (
          <button onClick={nextQuestion} disabled={submitting} className="btn-primary flex items-center justify-center gap-2">
            {submitting ? "Saving..." : current + 1 >= questions.length ? "See Results" : "Next Question"}
            <span className="material-symbols-outlined">{current + 1 >= questions.length ? "emoji_events" : "arrow_forward"}</span>
          </button>
        )}
        {!revealed && (
          <button onClick={() => { setSelected(null); setFillAnswer(""); nextQuestion(); }} className="text-on-surface-variant text-sm font-semibold text-center">
            Skip this question
          </button>
        )}
      </div>
    </div>
  );
}

function QuizSetup({ quizType, setQuizType, quizSize, setQuizSize, onStart }: {
  quizType: string; setQuizType: (t: "mixed" | "multiple_choice" | "fill_blank" | "reverse") => void;
  quizSize: number; setQuizSize: (n: number) => void; onStart: () => void;
}) {
  return (
    <div className="py-4 space-y-6">
      <header>
        <p className="text-secondary font-semibold text-xs tracking-wider uppercase mb-1">Test Your Knowledge</p>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Start a Quiz</h1>
      </header>
      <div className="bg-surface-container-lowest rounded-3xl p-5 space-y-4">
        <h2 className="font-headline font-bold text-sm uppercase tracking-wider text-outline">Quiz Type</h2>
        {[{ v: "mixed", l: "Mixed", d: "All question types", icon: "shuffle" },
          { v: "multiple_choice", l: "Multiple Choice", d: "Choose the right answer", icon: "checklist" },
          { v: "fill_blank", l: "Fill in the Blank", d: "Type the English word", icon: "edit" },
          { v: "reverse", l: "Reverse Meaning", d: "Meaning → English word", icon: "swap_horiz" },
        ].map(({ v, l, d, icon }) => (
          <button key={v} onClick={() => setQuizType(v as "mixed")} className={clsx("w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left", quizType === v ? "border-primary bg-primary-fixed/20" : "border-transparent bg-surface-container-high")}>
            <span className={clsx("material-symbols-outlined", quizType === v ? "text-primary" : "text-on-surface-variant")}>{icon}</span>
            <div>
              <div className="font-bold text-on-surface text-sm">{l}</div>
              <div className="text-xs text-on-surface-variant">{d}</div>
            </div>
            {quizType === v && <span className="material-symbols-outlined text-primary ml-auto" style={{ fontVariationSettings: "'FILL' 1" }}>radio_button_checked</span>}
          </button>
        ))}
      </div>
      <div className="bg-surface-container-lowest rounded-3xl p-5 space-y-3">
        <h2 className="font-headline font-bold text-sm uppercase tracking-wider text-outline">Number of Questions</h2>
        <div className="grid grid-cols-4 gap-2">
          {[5, 10, 15, 20].map((n) => (
            <button key={n} onClick={() => setQuizSize(n)} className={clsx("py-3 rounded-xl font-bold text-sm border-2 transition-all", quizSize === n ? "border-primary bg-primary-fixed/20 text-primary" : "border-transparent bg-surface-container-high text-on-surface-variant")}>
              {n}
            </button>
          ))}
        </div>
      </div>
      <button onClick={onStart} className="btn-primary flex items-center justify-center gap-2">
        <span className="material-symbols-outlined">play_arrow</span> Start Quiz
      </button>
    </div>
  );
}

function QuizResult({ score, total, answers, quizType, onRetry }: {
  score: number; total: number; answers: { correct: boolean; word: string }[]; quizType: string; onRetry: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const medal = pct >= 90 ? "🏆" : pct >= 70 ? "🥈" : pct >= 50 ? "🥉" : "📚";
  const msg = pct >= 90 ? "Outstanding!" : pct >= 70 ? "Great job!" : pct >= 50 ? "Good effort!" : "Keep practicing!";

  return (
    <div className="py-4 space-y-6">
      <div className="bg-surface-container-lowest rounded-3xl p-8 text-center space-y-4">
        <div className="text-6xl">{medal}</div>
        <div>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface">{msg}</h2>
          <p className="text-on-surface-variant mt-1">You scored {score} out of {total}</p>
        </div>
        <div className="relative w-32 h-32 mx-auto">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e1e3e4" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0058be" strokeWidth="3"
              strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-headline text-3xl font-extrabold text-primary">{pct}%</span>
          </div>
        </div>
      </div>

      {/* Word Results */}
      <div className="space-y-2">
        <h3 className="font-headline font-bold text-lg text-on-surface px-1">Results</h3>
        {answers.map((a, i) => (
          <div key={i} className={clsx("flex items-center gap-3 p-3 rounded-2xl", a.correct ? "bg-secondary-container/30" : "bg-error-container/20")}>
            <span className={clsx("material-symbols-outlined", a.correct ? "text-secondary" : "text-error")} style={{ fontVariationSettings: "'FILL' 1" }}>
              {a.correct ? "check_circle" : "cancel"}
            </span>
            <span className="font-semibold text-on-surface text-sm">{a.word}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onRetry} className="flex-1 py-4 bg-gradient-primary text-on-primary font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined">refresh</span> Try Again
        </button>
        <Link href="/stats" className="flex-1 py-4 bg-surface-container-high text-on-surface font-bold rounded-2xl flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">show_chart</span> Stats
        </Link>
      </div>
    </div>
  );
}
