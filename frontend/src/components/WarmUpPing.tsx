"use client";

import { useEffect } from "react";

export function WarmUpPing() {
  useEffect(() => {
    fetch("/api/health").catch(() => {});
  }, []);
  return null;
}
