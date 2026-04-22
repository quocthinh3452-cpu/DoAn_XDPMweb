import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboardData } from "../services/adminService";
import { formatPrice } from "../../utils/helpers";
import { StatCard, StatusBadge, MiniBarChart, DonutChart } from "../components/ui/AdminUI";

export default function AdminDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getDashboardData()
      .then((r) => setData(r))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ["var(--color-accent)", "var(--color-green)", "var(--color-accent2)", "var(--color-yellow)"];

  const revTrend   = data?.revenueChart.map((d) => d.revenue) ?? [];
  const orderTrend = data?.revenueChart.map((d) => d.orders)  ?? [];
  const trendByIdx = [revTrend, orderTrend, revTrend, orderTrend];

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <p className="text-3xl mb-3">⚠️</p>
        <p className="text-sm text-muted">{error}</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight mb-1">Dashboard</h1>
          <p className="text-sm text-muted font-medium">Welcome back — here's your store at a glance.</p>
        </div>
        <span className="text-sm font-medium text-muted bg-surface border border-border px-4 py-2 rounded-xl whitespace-nowrap shadow-sm">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[160px] rounded-[22px]" />)
          : data?.stats.map((stat, i) => (
              <StatCard key={stat.id} {...stat} color={COLORS[i]} trend={trendByIdx[i]} />
            ))
        }
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5 mb-5">
        {/* Revenue / Orders bar chart */}
        <div className="bg-surface border border-border rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="font-display text-lg font-bold">Overview</h2>
              <p className="text-xs text-muted mt-0.5 font-medium">Last 7 months — toggle metric above</p>
            </div>
            {!loading && data && (
              <div className="text-right shrink-0">
                <p className="font-display font-extrabold text-lg text-text">
                  {formatPrice(data.revenueChart.at(-1)?.revenue ?? 0)}
                </p>
                <p className="text-xs text-green flex items-center justify-end gap-0.5 font-medium">
                  <span>↑</span><span>Latest month</span>
                </p>
              </div>
            )}
          </div>

          {loading
            ? <div className="skeleton h-32 rounded-xl mt-5" />
            : <MiniBarChart
                data={data?.revenueChart ?? []}
                valueKey="revenue"
                labelKey="month"
                secondaryKey="orders"
                secondaryColor="var(--color-green)"
                color="var(--color-accent)"
              />
          }

          {!loading && data && (
            <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-border">
              {data.revenueChart.slice(-3).map((d) => (
                <div key={d.month} className="text-center bg-surface2 rounded-xl py-3 px-2">
                  <p className="text-xs font-bold text-muted font-display mb-1">{d.month}</p>
                  <p className="font-display font-extrabold text-base tabular-nums">{formatPrice(d.revenue)}</p>
                  <p className="text-xs text-muted mt-0.5">{d.orders.toLocaleString()} orders</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Donut */}
        <div className="bg-surface border border-border rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-6">
            <h2 className="font-display text-lg font-bold">By Category</h2>
            <p className="text-xs text-muted mt-0.5 font-medium">Revenue split — hover to inspect</p>
          </div>
          {loading
            ? <div className="skeleton h-[130px] rounded-xl" />
            : <DonutChart data={data?.categoryStats ?? []} />
          }
          {!loading && data && (
            <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted font-medium">Total tracked</span>
              <span className="font-display font-bold text-sm">
                {formatPrice(data.categoryStats.reduce((s, c) => s + c.revenue, 0))}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
        {/* Recent Orders */}
        <div className="bg-surface border border-border rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-lg font-bold">Recent Orders</h2>
              <p className="text-xs text-muted mt-0.5 font-medium">Latest activity</p>
            </div>
            <Link to="/admin/orders"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:opacity-75 transition-opacity px-3.5 py-2 bg-accent/8 border border-accent/15 rounded-xl">
              View all
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[60px] rounded-xl" />)
              : data?.recentOrders.map((order) => (
                  <div key={order.id}
                    className="flex items-center gap-4 px-4 py-3.5 bg-surface2 rounded-xl hover:bg-border transition-colors cursor-default group">
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-xs font-bold text-accent">#{order.id}</p>
                      <p className="text-sm font-semibold text-text truncate">{order.customerName}</p>
                    </div>
                    <StatusBadge status={order.status} />
                    <span className="font-display font-bold text-sm shrink-0 tabular-nums">{formatPrice(order.total)}</span>
                  </div>
                ))
            }
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-surface border border-border rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-lg font-bold">Top Products</h2>
              <p className="text-xs text-muted mt-0.5 font-medium">By revenue</p>
            </div>
            <Link to="/admin/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:opacity-75 transition-opacity px-3.5 py-2 bg-accent/8 border border-accent/15 rounded-xl">
              View all
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)
              : data?.topProducts.map((p, i) => {
                  const rankColor   = i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7f32" : "var(--color-muted)";
                  const rankOpacity = i >= 3 ? "opacity-40" : "";
                  return (
                    <div key={p.id} className="flex items-center gap-3.5 group hover:bg-surface2 rounded-xl px-2 py-1.5 -mx-2 transition-colors">
                      <span className={`font-display text-sm font-extrabold w-6 shrink-0 tabular-nums ${rankOpacity}`}
                        style={{ color: rankColor }}>#{i + 1}</span>
                      <img src={p.image} alt={p.name}
                        className="w-11 h-11 object-cover rounded-xl border border-border shrink-0 group-hover:border-accent/40 transition-colors" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{p.name}</p>
                        <p className="text-xs text-muted">{p.sold} sold</p>
                      </div>
                      <span className="font-display font-bold text-sm shrink-0 tabular-nums">{formatPrice(p.revenue)}</span>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </div>
    </div>
  );
}
