import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboardData } from "../services/adminService";
import { formatPrice } from "../../utils/helpers";
import { StatCard, StatusBadge, MiniBarChart, DonutChart } from "../components/ui/AdminUI";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getDashboardData().then((r) => setData(r.data)).finally(() => setLoading(false)); }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3 mb-7">
        <div>
          <h1 className="font-display text-2xl2 font-extrabold tracking-tight mb-0.5">Dashboard</h1>
          <p className="text-sm text-muted">Welcome back! Here's what's happening today.</p>
        </div>
        <span className="text-sm text-muted bg-surface border border-border px-4 py-1.5 rounded-full whitespace-nowrap">
          {new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}
        </span>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[130px] rounded-2xl" />)
          : data?.stats.map((stat, i) => (
              <StatCard key={stat.id} {...stat} color={["var(--color-accent)","var(--color-green)","var(--color-accent2)","var(--color-yellow)"][i]} />
            ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4 mb-4">
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-base font-bold">Revenue Overview</h2>
            <span className="text-xs text-muted">Last 7 months</span>
          </div>
          {loading ? <div className="skeleton h-24 rounded" />
            : <MiniBarChart data={data?.revenueChart ?? []} valueKey="revenue" labelKey="month" color="var(--color-accent)" />}
          {!loading && data && (
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
              {data.revenueChart.slice(-3).map((d) => (
                <div key={d.month} className="text-center">
                  <p className="text-sm2 font-bold text-muted font-display mb-0.5">{d.month}</p>
                  <p className="font-display font-extrabold text-base">{formatPrice(d.revenue)}</p>
                  <p className="text-xs text-muted">{d.orders.toLocaleString()} orders</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-base font-bold">By Category</h2>
            <span className="text-xs text-muted">Revenue split</span>
          </div>
          {loading ? <div className="skeleton h-[120px] rounded" /> : <DonutChart data={data?.categoryStats ?? []} />}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
        {/* Recent orders */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-base font-bold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-accent hover:opacity-75 transition-opacity">View all →</Link>
          </div>
          <div className="flex flex-col gap-1">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[52px] rounded-lg mb-1" />)
              : data?.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-3.5 px-3.5 py-3 bg-surface2 rounded-lg hover:bg-border transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-xs font-bold text-accent">#{order.id}</p>
                      <p className="text-sm font-medium text-text truncate">{order.customerName}</p>
                    </div>
                    <StatusBadge status={order.status} />
                    <span className="font-display font-bold text-sm shrink-0">{formatPrice(order.total)}</span>
                  </div>
                ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-base font-bold">Top Products</h2>
            <Link to="/admin/products" className="text-sm font-semibold text-accent hover:opacity-75 transition-opacity">View all →</Link>
          </div>
          <div className="flex flex-col gap-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-11 rounded-lg" />)
              : data?.topProducts.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="font-display text-sm font-extrabold text-muted w-6 shrink-0">#{i+1}</span>
                    <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted">{p.sold} sold</p>
                    </div>
                    <span className="font-display font-bold text-sm shrink-0">{formatPrice(p.revenue)}</span>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
