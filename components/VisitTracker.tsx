"use client";

import { useEffect } from "react";
import { recordVisit } from "@/lib/progress";

/** Logs today as a visit for the streak counter. Renders nothing. */
export default function VisitTracker() {
  useEffect(() => {
    recordVisit();
  }, []);
  return null;
}
