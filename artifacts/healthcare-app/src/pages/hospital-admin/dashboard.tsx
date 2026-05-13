import { useAuth } from "@/hooks/use-auth";
import { useGetDashboardData } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, UserCog, Activity, AlertTriangle, CalendarCheck, TrendingUp, HeartPulse } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { format } from "date-fns";

const STATUS_COLORS = { normal: "#22c55e", risk: "#f59e0b", critical: "#ef4444" };

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useGetDashboardData({ userId: user?.id, role: "hospital_admin" });

  const pieData = data?.statusBreakdown
    ? [
        { name: "Normal", value: data.statusBreakdown.normal },
        { name: "Risk", value: data.statusBreakdown.risk },
        { name: "Critical", value: data.statusBreakdown.critical },
      ].filter(d => d.value > 0)
    : [];

  const alertBarData = data?.recentAlerts?.reduce((acc: Record<string, number>, a) => {
    const day = format(new Date(a.createdAt), "MMM d");
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  const barData = alertBarData
    ? Object.entries(alertBarData).map(([date, count]) => ({ date, count }))
    : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Hospital Administration</h1>
          <p className="text-muted-foreground mt-1">Platform overview and real-time system metrics.</p>
        </div>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1.5 text-sm">
          <Activity className="h-3.5 w-3.5 mr-1.5" /> System Online
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold">{data?.totalPatients ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Registered on platform</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold text-destructive">{data?.criticalAlerts ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Unread critical alerts</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
            <CalendarCheck className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold">{data?.todayAppointments ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Upcoming from today</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold">{data?.activeAlerts ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Platform-wide unread</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Health Status</CardTitle>
            <CardDescription>Distribution of vitals health statuses across all patients</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {isLoading ? <Skeleton className="h-full w-full rounded-lg" /> : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name.toLowerCase() as keyof typeof STATUS_COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No vitals data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alert Activity</CardTitle>
            <CardDescription>Alerts generated per day (last 10 records)</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {isLoading ? <Skeleton className="h-full w-full rounded-lg" /> : barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Alerts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No alert data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Latest health alerts across all patients</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {isLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 my-2 w-full" />) :
              data?.recentAlerts?.length ? data.recentAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(alert.createdAt), "MMM d, h:mm a")}</p>
                  </div>
                  <Badge variant="outline" className={
                    alert.severity === "critical" ? "bg-red-50 text-red-700 border-red-200" :
                    alert.severity === "warning" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-blue-50 text-blue-700 border-blue-200"
                  }>{alert.severity}</Badge>
                </div>
              )) : <p className="text-sm text-muted-foreground py-4 text-center">No recent alerts</p>
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Vitals Submissions</CardTitle>
            <CardDescription>Latest vitals recorded across all patients</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {isLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 my-2 w-full" />) :
              data?.recentVitals?.length ? data.recentVitals.slice(0, 5).map((v) => (
                <div key={v.id} className="flex items-center justify-between py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <HeartPulse className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">{v.heartRate} bpm · {v.systolicBp}/{v.diastolicBp} mmHg</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(v.createdAt), "MMM d, h:mm a")}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={
                    v.status === "normal" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    v.status === "risk" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-red-50 text-red-700 border-red-200"
                  }>{v.status}</Badge>
                </div>
              )) : <p className="text-sm text-muted-foreground py-4 text-center">No recent vitals</p>
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
