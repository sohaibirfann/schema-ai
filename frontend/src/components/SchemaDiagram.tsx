"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { TableSchema } from "@/types/schema";

interface Connector {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function SchemaDiagram({ tables }: { tables: TableSchema[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRefs = useRef(new Map<string, HTMLElement>());
  const [connectors, setConnectors] = useState<Connector[]>([]);

  function setAnchorRef(key: string, el: HTMLElement | null) {
    if (el) anchorRefs.current.set(key, el);
    else anchorRefs.current.delete(key);
  }

  useLayoutEffect(() => {
    function measure() {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const next: Connector[] = [];

      for (const table of tables) {
        for (const col of table.columns) {
          if (!col.references) continue;
          const fromEl = anchorRefs.current.get(`${table.table_name}.${col.name}`);
          const toEl = anchorRefs.current.get(`${col.references.table}.${col.references.column}`);
          if (!fromEl || !toEl) continue;

          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();

          next.push({
            key: `${table.table_name}.${col.name}->${col.references.table}.${col.references.column}`,
            x1: fromRect.left - containerRect.left,
            y1: fromRect.top - containerRect.top + fromRect.height / 2,
            x2: toRect.left - containerRect.left,
            y2: toRect.top - containerRect.top + toRect.height / 2,
          });
        }
      }
      setConnectors(next);
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [tables]);

  return (
    <div
      ref={containerRef}
      className="relative border border-[rgba(16,20,19,0.1)] bg-surface rounded-[12px] p-6 min-h-[540px]"
      style={{ backgroundImage: "radial-gradient(rgba(16,20,19,.09) 1px,transparent 1px)", backgroundSize: "22px 22px" }}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {connectors.map((c) => {
          const midX = (c.x1 + c.x2) / 2;
          return (
            <g key={c.key}>
              <path
                d={`M ${c.x1} ${c.y1} C ${midX} ${c.y1}, ${midX} ${c.y2}, ${c.x2} ${c.y2}`}
                fill="none"
                stroke="#0e8f7e"
                strokeWidth={1.8}
              />
              <circle cx={c.x1} cy={c.y1} r={3.5} fill="#0e8f7e" />
              <circle cx={c.x2} cy={c.y2} r={3.5} fill="#0e8f7e" />
            </g>
          );
        })}
      </svg>

      <div className="grid gap-5 relative" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
        {tables.map((table) => (
          <div key={table.table_name} className="border border-[rgba(16,20,19,0.14)] rounded-[10px] bg-surface overflow-hidden shadow-[0_6px_18px_-8px_rgba(16,20,19,0.18)]">
            <div className="font-mono text-[12.5px] font-medium px-[13px] py-[9px] bg-accent/[0.08] border-b border-[rgba(16,20,19,0.08)]">
              {table.table_name}
            </div>
            {table.columns.map((col) => {
              const isPk = col.constraints.includes("PRIMARY KEY");
              const isFk = !!col.references;
              return (
                <div
                  key={col.name}
                  ref={(el) => setAnchorRef(`${table.table_name}.${col.name}`, el)}
                  className={`px-[13px] py-[7px] flex items-center justify-between gap-2 font-mono text-[11px] ${isPk ? "bg-accent/[0.04]" : isFk ? "bg-amber/[0.07]" : ""}`}
                >
                  <span className="text-ink">
                    {col.name}
                    {isPk && <span className="text-accent"> PK</span>}
                    {isFk && <span className="text-amber"> FK</span>}
                  </span>
                  <span className="text-ink-muted">{col.type}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="absolute bottom-3 right-4 font-mono text-[10.5px] text-ink-muted pointer-events-none">
        FK lines drawn column → referenced column
      </div>
    </div>
  );
}
