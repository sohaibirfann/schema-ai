import type { HistoryEntry } from "@/types/schema";

function relativeTime(id: number) {
  const mins = Math.floor((Date.now() - id) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function HistoryDrawer({ open, history, activeId, onLoad, onDelete, onClear, onClose }: {
  open: boolean;
  history: HistoryEntry[];
  activeId: number | null;
  onLoad: (e: HistoryEntry) => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className={`absolute right-0 top-0 bottom-0 w-[330px] bg-surface border-l border-[rgba(16,20,19,0.1)] shadow-[-16px_0_40px_-18px_rgba(16,20,19,0.25)] z-40 flex flex-col transition-transform duration-200 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(16,20,19,0.08)]">
          <span className="text-[15px] font-semibold">Schema history</span>
          {history.length > 0 && (
            <button onClick={onClear} className="font-mono text-[11px] text-ink-muted hover:text-error transition-colors cursor-pointer">clear all</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {history.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center px-6">
              <p className="font-mono text-[11px] text-ink-muted">Generated schemas will appear here.</p>
            </div>
          ) : (
            history.map((entry) => {
              const active = activeId === entry.id;
              const count = entry.response.tables.length;
              return (
                <div
                  key={entry.id}
                  onClick={() => onLoad(entry)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && onLoad(entry)}
                  className={`group rounded-[9px] border px-[14px] py-3 cursor-pointer transition-colors ${active ? "border-accent/35 bg-accent/[0.05]" : "border-[rgba(16,20,19,0.09)] hover:bg-[rgba(16,20,19,0.02)]"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[13px] font-medium leading-[1.4] line-clamp-2">{entry.prompt}</span>
                    <button
                      onClick={(e) => onDelete(entry.id, e)}
                      aria-label="Delete"
                      className="opacity-0 group-hover:opacity-100 text-ink-muted hover:text-error transition-all shrink-0 mt-0.5 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                  <div className="flex gap-2.5 font-mono text-[10.5px] text-ink-muted mt-[7px]">
                    {active && <span className="text-accent">loaded</span>}
                    <span>{relativeTime(entry.id)}</span>
                    <span>{count} table{count !== 1 ? "s" : ""}</span>
                    <span>{entry.dialect}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {open && <div className="absolute inset-0 z-30" onClick={onClose} />}
    </>
  );
}
