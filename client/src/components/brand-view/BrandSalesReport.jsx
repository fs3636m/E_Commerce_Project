import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrandSalesReport,
  setGranularity,
} from "@/store/brand/brandSales_slice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
    case "year":
      return format(d, "yyyy");
    case "month":
      return format(d, "MMM yyyy");
    case "week":
      return format(d, "II 'wk' yyyy");
    case "day":
    default:
      return format(d, "dd MMM");
  }
}

// ✅ GBP formatter
const formatGBP = (amount) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    amount || 0
  );

// ---------- component ----------
export default function BrandSalesReport() {
  const dispatch = useDispatch();
  const { loading, series, granularity } = useSelector((s) => s.brandReports);

  const safeSeries = Array.isArray(series) ? series : [];
  const [range, setRange] = useState({ start: "", end: "" });

  useEffect(() => {
    dispatch(
      fetchBrandSalesReport({
        granularity: granularity || "day",
        start: range.start || undefined,
        end: range.end || undefined,
      })
    );
  }, [dispatch, granularity, range.start, range.end]);

  const memo = useMemo(() => {
    const points = safeSeries
      .flatMap((s) =>
        (s?.data || []).map((p) => ({
          date: toDateSafe(p._id),
          qty: Number(p?.qty ?? 0),
          revenue: Number(p?.revenue ?? 0),
        }))
      )
      .filter((p) => p.date);

    const bucketSet = new Set(points.map((p) => +p.date));
    const bucketList = Array.from(bucketSet).sort((a, b) => a - b);

    const byBucketTotals = new Map();
    for (const p of points) {
      const ms = +p.date;
      const tPrev = byBucketTotals.get(ms) || { revenue: 0, qty: 0 };
      byBucketTotals.set(ms, {
        revenue: tPrev.revenue + p.revenue,
        qty: tPrev.qty + p.qty,
      });
    }

    const lineRows = bucketList.map((ms) => {
      const totals = byBucketTotals.get(ms) || { revenue: 0, qty: 0 };
      return {
        label: formatDateLabel(new Date(ms), granularity || "day"),
        revenue: Number((totals.revenue || 0).toFixed(2)),
      };
    });

    return {
      lineData: Array.isArray(lineRows) ? lineRows : [],
    };
  }, [safeSeries, granularity]);

  const { lineData } = memo;
  const hasLine = Array.isArray(lineData) && lineData.length > 0;
  const showLine = !loading && hasLine;

  return (
    <div className="space-y-6">
      {/* Controls */}
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
        <h3 className="font-semibold mb-3">
          My Revenue ({granularity || "day"})
        </h3>
        <div className="w-full h-72">
          {!showLine ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-500">
              {loading ? "Loading…" : "No data for selected range"}
            </div>
          ) : (
            <ResponsiveContainer>
              <LineChart data={lineData}>
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(v) => formatGBP(v)} />
                <Tooltip formatter={(v) => formatGBP(v)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
