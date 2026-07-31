export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(229,231,237,0.86),_rgba(237,232,245,0.94))]">
      <div className="rounded-full border border-white/60 bg-white/70 px-6 py-3 text-sm text-slate-500 backdrop-blur-xl">
        Loading...
      </div>
    </div>
  );
}
