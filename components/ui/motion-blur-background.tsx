export function MotionBlurBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 opacity-90 transition-colors duration-300" />
      <div className="absolute top-10 right-0 -translate-y-16 translate-x-16">
        <div className="w-96 h-96 bg-blue-500/40 rounded-full blur-[100px] animate-blob mix-blend-multiply" />
      </div>
      <div className="absolute bottom-1/4 left-0 translate-y-16 -translate-x-16">
        <div className="w-80 h-80 bg-blue-600/30 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply" />
      </div>
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2">
        <div className="w-72 h-72 bg-emerald-400/20 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply" />
      </div>
    </div>
  );
}
