// src/components/admin/BrandSalesReport.jsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrandSalesReport,
  setGranularity,
} from "@/store/admin/brandSales_slice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { parseISO, isValid, format } from "date-fns";

// ---------- helpers ----------
function toDateSafe(t) {
  if (!t) return null;
  if (t instanceof Date) return isValid(t) ? t : null;
  if (typeof t === "string") {
    const d = parseISO(t);
    return isValid(d) ? d : null;
  }
  const d = new Date(t);
  return isValid(d) ? d : null;
}

function formatDateLabel(t, granularity = "day") {
  const d = toDateSafe(t);
  if (!d) return "";
  switch (granularity) {
    case "year":  return format(d, "yyyy");
    case "month": return format(d, "MMM yyyy");
    case "week":  return format(d, "II 'wk' yyyy"); // ISO week
    case "day":
    default:      return format(d, "dd MMM");
  }
}

function prettyBrandName(b) {
  if (!b) return "Unknown";
  return /^[a-f0-9]{24}$/i.test(b) ? "Unknown Brand" : b;
}

// make a safe key for Recharts dataKey (no spaces/symbols, no leading digits)
function keyFromBrandName(name) {
  const safe = String(name || "Unknown")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "_");
  return /^[0-9]/.test(safe) ? `b_${safe}` : (safe || "Unknown");
}

// ---------- component ----------
export default function BrandSalesReport() {
  const dispatch = useDispatch();
  const { loading, series, granularity } = useSelector((s) => s.adminReports);

  const safeSeries = Array.isArray(series) ? series : [];
  const [range, setRange] = useState({ start: "", end: "" });

  // fetch on load / controls change
  useEffect(() => {
    dispatch(
      fetchBrandSalesReport({
        granularity: granularity || "day",
        start: range.start || undefined,
        end: range.end || undefined,
      })
    );
  }, [dispatch, granularity, range.start, range.end]);

  // Transform API -> chart data with strong guards
  const memo = useMemo(() => {
    // 1) Flatten and normalize
    const points = safeSeries.flatMap((s) =>
      (s?.data || []).map((p) => ({
        displayBrand: prettyBrandName(s.brand),
        brandKey: keyFromBrandName(prettyBrandName(s.brand)),
        date: toDateSafe(p.t),
        qty: Number(p?.qty ?? 0),
        revenue: Number(p?.revenue ?? 0),
      }))
    ).filter((p) => p.date);

    // 2) Unique sorted buckets (ms timestamps)
    const bucketSet = new Set(points.map((p) => +p.date));
    const bucketList = Array.from(bucketSet).sort((a, b) => a - b);

    // 3) Brands & legend map
    const brandKeys = new Set(points.map((p) => p.brandKey));
    const legendMap = {}; // brandKey -> displayBrand
    points.forEach((p) => { legendMap[p.brandKey] = p.displayBrand; });
    const brandKeyList = Array.from(brandKeys);

    // 4) Index points
    const byBucketBrand = new Map(); // `${ms}__${brandKey}` -> { revenue, qty }
    const byBucketTotals = new Map(); // ms -> { revenue, qty }
    for (const p of points) {
      const ms = +p.date;
      const k = `${ms}__${p.brandKey}`;
      const prev = byBucketBrand.get(k) || { revenue: 0, qty: 0 };
      byBucketBrand.set(k, { revenue: prev.revenue + p.revenue, qty: prev.qty + p.qty });

      const tPrev = byBucketTotals.get(ms) || { revenue: 0, qty: 0 };
      byBucketTotals.set(ms, { revenue: tPrev.revenue + p.revenue, qty: tPrev.qty + p.qty });
    }

    // 5) Line: Total Revenue
    const lineRows = bucketList.map((ms) => {
      const totals = byBucketTotals.get(ms) || { revenue: 0, qty: 0 };
      return {
        label: formatDateLabel(new Date(ms), granularity || "day"),
        totalRevenue: Number((totals.revenue || 0).toFixed(2)),
      };
    });

    // 6) Stacked bars: revenue by brand per bucket (always zero-fill)
    const stackedRows = bucketList.map((ms) => {
      const row = {
        label: formatDateLabel(new Date(ms), granularity || "day"),
      };
      // init each brand with 0
      brandKeyList.forEach((bk) => { row[bk] = 0; });
      // fill existing
      for (const bk of brandKeyList) {
        const entry = byBucketBrand.get(`${ms}__${bk}`);
        if (entry) row[bk] = Number((entry.revenue || 0).toFixed(2));
      }
      return row;
    });

    // sanity: ensure rows are arrays (no undefined during transitions)
    return {
      lineData: Array.isArray(lineRows) ? lineRows : [],
      stacked: {
        brandKeyList: Array.isArray(brandKeyList) ? brandKeyList : [],
        rows: Array.isArray(stackedRows) ? stackedRows : [],
      },
      legendMap,
    };
  }, [safeSeries, granularity]);

  const { lineData, stacked, legendMap } = memo;

  // colors palette
  const colors = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042",
    "#00C49F", "#FFBB28", "#8dd1e1", "#a4de6c",
    "#d0ed57", "#a28bff",
  ];

  // extra guards to avoid Recharts rendering with undefined
  const hasLine = Array.isArray(lineData) && lineData.length > 0;
  const hasBars =
    stacked &&
    Array.isArray(stacked.rows) &&
    stacked.rows.length > 0 &&
    Array.isArray(stacked.brandKeyList) &&
    stacked.brandKeyList.length > 0;

  // while loading, don’t render charts (prevents transient undefined -> crash)
  const showLine = !loading && hasLine;
  const showBars = !loading && hasBars;

  return (
    <div className="space-y-6">
      <Card className="p-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {["day", "week", "month", "year"].map((g) => (
            <Button
              key={g}
              variant={(granularity || "day") === g ? "default" : "outline"}
              onClick={() => dispatch(setGranularity(g))}
              disabled={loading}
            >
              {g.toUpperCase()}
            </Button>
          ))}
        </div>

        <div className="ml-auto flex gap-2 items-center">
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={range.start}
            onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))}
          />
          <span>to</span>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={range.end}
            onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
          />
          <Button
            variant="outline"
            onClick={() => setRange({ start: "", end: "" })}
            disabled={loading}
          >
            Clear
          </Button>
        </div>
      </Card>

      {/* Total Revenue line */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Total Revenue ({granularity || "day"})</h3>
        <div className="w-full h-72">
          {!showLine ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-500">
              {loading ? "Loading…" : "No data for selected range"}
            </div>
          ) : (
            <ResponsiveContainer>
              <LineChart data={lineData}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalRevenue" stroke="#8884d8" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Revenue by Brand stacked */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Revenue by Brand ({granularity || "day"})</h3>
        <div className="w-full h-96">
          {!showBars ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-500">
              {loading ? "Loading…" : "No brand data for selected range"}
            </div>
          ) : (
            <ResponsiveContainer>
              <BarChart data={stacked.rows}>
                <XAxis dataKey="label" />
                <YAxis type="number" domain={["auto", "auto"]} />
                <Tooltip
                  formatter={(value, dataKey) => [
                    value,
                    legendMap?.[dataKey] || dataKey,
                  ]}
                />
                <Legend formatter={(value) => legendMap?.[value] || value} />
                {stacked.brandKeyList.map((bk, idx) => (
                  <Bar
                    key={bk}
                    dataKey={bk}
                    stackId="revenue"
                    fill={colors[idx % colors.length]}
                    isAnimationActive={false}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
