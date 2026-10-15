"use client";

import { useEffect } from "react";
import type { OrderFilters } from "@/lib/admin/order-filters";
import { pendo } from "@/lib/pendo";

const DAY = 864e5;

/** The last filters reported. Module scope, so coming back to the same view doesn't repeat it. */
let reportedFilters = "";

/** Days a `YYYY-MM-DD` range covers, both ends included; undefined while either end is open. */
function rangeDays(from?: string, to?: string): number | undefined {
  if (!from || !to) return undefined;
  const days = Math.round((Date.parse(to) - Date.parse(from)) / DAY) + 1;
  return Number.isFinite(days) ? Math.max(0, days) : undefined;
}

/**
 * Reports each distinct status and date range the orders list is narrowed to. The filters are
 * applied on the server, so the page passes in how many orders matched.
 */
export function ReportOrderFilters({
  storeId,
  status,
  from,
  to,
  resultsCount,
}: OrderFilters & { storeId: string; resultsCount: number }) {
  useEffect(() => {
    const hasRange = Boolean(from || to);
    if (!status && !hasRange) {
      reportedFilters = "";
      return;
    }
    const key = [storeId, status, from, to].join(":");
    if (key === reportedFilters) return;
    reportedFilters = key;
    pendo.track("Orders Filtered", {
      filterType: status && hasRange ? "status_and_date_range" : status ? "status" : "date_range",
      status: status ?? "all",
      from,
      to,
      rangeDays: rangeDays(from, to),
      resultsCount,
      storeId,
    });
  }, [storeId, status, from, to, resultsCount]);

  return null;
}
