"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold py-3.5 rounded-xl transition-all text-sm w-full"
    >
      <span className="material-symbols-outlined text-lg">print</span>
      Print / Download
    </button>
  );
}
