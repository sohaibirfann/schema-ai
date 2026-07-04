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
    <div ref={containerRef} className="relative border border-[#e5e5e5] bg-white rounded-lg p-6 shadow-sm">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {connectors.map((c) => {
          const midX = (c.x1 + c.x2) / 2;
          return (
            <g key={c.key}>
              <path
                d={`M ${c.x1} ${c.y1} C ${midX} ${c.y1}, ${midX} ${c.y2}, ${c.x2} ${c.y2}`}
                fill="none"
                stroke="#5E6AD2"
                strokeWidth={1.5}
                strokeOpacity={0.5}
              />
              <circle cx={c.x1} cy={c.y1} r={3} fill="#5E6AD2" fillOpacity={0.6} />
              <circle cx={c.x2} cy={c.y2} r={3} fill="#5E6AD2" fillOpacity={0.6} />
            </g>
          );
        })}
      </svg>

      <div className="grid gap-5 relative" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {tables.map((table) => (
          <div key={table.table_name} className="border border-[#e5e5e5] rounded-md bg-[#fafbfb] overflow-hidden">
            <div className="px-3 py-2 bg-[#F4F5F6] border-b border-[#e5e5e5] font-display text-xs font-semibold text-[#111111] uppercase tracking-wide">
              {table.table_name}
            </div>
            <div className="divide-y divide-[#e5e5e5]/80">
              {table.columns.map((col) => (
                <div
                  key={col.name}
                  ref={(el) => setAnchorRef(`${table.table_name}.${col.name}`, el)}
                  className="px-3 py-1.5 flex items-center justify-between gap-2 text-[11px] font-mono"
                >
                  <span className="text-neutral-700 font-semibold">{col.name}</span>
                  <span className="text-indigo-600">{col.type}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
