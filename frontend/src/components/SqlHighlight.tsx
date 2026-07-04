import type { ReactNode } from "react";

const KEYWORDS = new Set([
  "CREATE", "TABLE", "INSERT", "INTO", "VALUES", "PRIMARY", "KEY", "NOT", "NULL",
  "REFERENCES", "UNIQUE", "DEFAULT", "FOREIGN", "CONSTRAINT", "CHECK", "AND", "OR", "AS",
]);

const TYPES = new Set([
  "SERIAL", "AUTO_INCREMENT", "AUTOINCREMENT", "INTEGER", "INT", "BIGINT", "SMALLINT",
  "VARCHAR", "CHAR", "TEXT", "BOOLEAN", "BOOL", "TIMESTAMP", "DATETIME", "DATE", "TIME",
  "DECIMAL", "NUMERIC", "FLOAT", "DOUBLE", "REAL", "BLOB",
]);

const TOKEN_RE = /(--[^\n]*)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g;

export function SqlHighlight({ sql }: { sql: string }) {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;

  while ((m = TOKEN_RE.exec(sql)) !== null) {
    if (m.index > last) nodes.push(sql.slice(last, m.index));
    const [full, comment, str, num, word] = m;

    if (comment) nodes.push(<span key={i} className="text-neutral-400 italic">{full}</span>);
    else if (str) nodes.push(<span key={i} className="text-emerald-600">{full}</span>);
    else if (num) nodes.push(<span key={i} className="text-amber-600">{full}</span>);
    else if (word) {
      const up = word.toUpperCase();
      if (KEYWORDS.has(up)) nodes.push(<span key={i} className="text-violet-600 font-semibold">{full}</span>);
      else if (TYPES.has(up)) nodes.push(<span key={i} className="text-indigo-600">{full}</span>);
      else nodes.push(full);
    }

    last = m.index + full.length;
    i++;
  }
  if (last < sql.length) nodes.push(sql.slice(last));

  return <>{nodes}</>;
}
