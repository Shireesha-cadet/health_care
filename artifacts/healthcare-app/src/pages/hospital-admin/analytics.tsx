import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetVitalTrends, useGetDashboardData } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";

type Period = "daily" | "weekly" | "monthly";

const STATUS_COLORS = { normal: "#22c55e", risk: "#f59e0b", critical: "#ef4444" };

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("weekly");

  const { data: trends, isLoading: trendsLoading } = useGetVitalTrends({ period });
  const { data: dashboard, isLoading: dashLoading } = useGetDashboardData({ userId: user?.id, role: "hospital_admin" });

  const chartData = trends?.labels?.map((label, i) => ({
    label,
    heartRate: trends.heartRate[i],
    systolicBp: trends.systolicBp[i],
    diastolicBp: trends.diastolicBp[i],
    spo2: trends.spo2[i],
    glucose: trends.glucose[i],
    temperature: trends.temperature[i],
  })) ?? [];

  const pieData = dashboard?.statusBreakdown
    ? [
        { name: "Normal", value: dashboard.statusBreakdown.normal },
        { name: "Risk", value: dashboard.statusBreakdown.risk },
        { name: "Critical", value: dashboard.statusBreakdown.critical },
      ].filter(d => d.value > 0)
    : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">System Analytics</h1>
          <p className="text-muted-foreground mt-1">Macro-level health trends and platform performance.</p>
        </div>
        <div className="flex gap-2 bg-muted p-1 rounded-lg">
          {(["daily", "weekly", "monthly"] as Period[]).map(p => (
            <Button
              key={p}
              variant={period === p ? "default" : "ghost"}
              size="sm"
              className="capitalize"
              onClick={() => setPeriod(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover-elevate">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Patients</p>
            {dashLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-3xl font-bold mt-1">{dashboard?.totalPatients ?? 0}</p>}
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active Alerts</p>
            {dashLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-3xl font-bold mt-1 text-amber-600">{dashboard?.activeAlerts ?? 0}</p>}
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Critical Alerts</p>
            {dashLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-3xl font-bold mt-1 text-destructive">{dashboard?.criticalAlerts ?? 0}</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Heart Rate & Blood Pressure Trends</CardTitle>
            <CardDescription>Platform-wide vitals averaged across all patients</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {trendsLoading ? <Skeleton className="h-full w-full rounded-lg" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="heartRate" name="Heart Rate" stroke="hsl(var(--chart-1))" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="systolicBp" name="Systolic BP" stroke="hsl(var(--chart-2))" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="diastolicBp" name="Diastolic BP" stroke="hsl(var(--chart-3))" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Status Distribution</CardTitle>
            <CardDescription>Current status breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {dashLoading ? <Skeleton className="h-full w-full rounded-lg" /> : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name.toLowerCase() as keyof typeof STATUS_COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SpO2 & Glucose Trends</CardTitle>
          <CardDescription>Blood oxygen saturation and glucose levels over time</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          {trendsLoading ? <Skeleton className="h-full w-full rounded-lg" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="spo2" name="SpO2 (%)" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3) / 0.15)" strokeWidth={2} />
                <Area type="monotone" dataKey="glucose" name="Glucose (mg/dL)" stroke="hsl(var(--chart-5))" fill="hsl(var(--chart-5) / 0.15)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
