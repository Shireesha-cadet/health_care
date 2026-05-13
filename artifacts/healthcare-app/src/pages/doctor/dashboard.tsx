import { useAuth } from "@/hooks/use-auth";
import { useGetDashboardData } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle, Calendar, Activity, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useGetDashboardData({ userId: user?.id, role: "doctor" });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Doctor Portal</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Dr. {user?.name}. Here's your practice overview.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate transition-all border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold">{data?.totalPatients || 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="hover-elevate transition-all border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold text-destructive">{data?.criticalAlerts || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-l-4 border-l-chart-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Appointments Today</CardTitle>
            <Calendar className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold">{data?.todayAppointments || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-l-4 border-l-chart-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Monitored</CardTitle>
            <Activity className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold">{data?.activeAlerts || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Patient Alerts</CardTitle>
              <CardDescription>Attention required</CardDescription>
            </div>
            <Link href="/doctor/alerts"><Button variant="ghost" size="sm">View All <ArrowRight className="ml-2 h-4 w-4"/></Button></Link>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
              ) : data?.recentAlerts?.length ? (
                data.recentAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="p-3 rounded-lg border flex justify-between items-center bg-card">
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-2">
                        {alert.type.replace('_', ' ').toUpperCase()}
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'default'} className="text-[10px] px-1 py-0 h-4">
                          {alert.severity}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px] mt-1">{alert.message}</div>
                    </div>
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No recent alerts.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Patient Population Health</CardTitle>
              <CardDescription>Status breakdown</CardDescription>
            </div>
            <Link href="/doctor/patients"><Button variant="ghost" size="sm">Patients <ArrowRight className="ml-2 h-4 w-4"/></Button></Link>
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="h-64 w-full" /> : (
               <div className="space-y-6 pt-4">
                 <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span className="font-medium text-emerald-600">Normal</span>
                     <span>{data?.statusBreakdown?.normal || 0} patients</span>
                   </div>
                   <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500" style={{width: `${Math.max(5, ((data?.statusBreakdown?.normal || 0) / Math.max(1, data?.totalPatients || 1)) * 100)}%`}}></div>
                   </div>
                 </div>

                 <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span className="font-medium text-amber-500">At Risk</span>
                     <span>{data?.statusBreakdown?.risk || 0} patients</span>
                   </div>
                   <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                     <div className="h-full bg-amber-500" style={{width: `${Math.max(5, ((data?.statusBreakdown?.risk || 0) / Math.max(1, data?.totalPatients || 1)) * 100)}%`}}></div>
                   </div>
                 </div>

                 <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span className="font-medium text-destructive">Critical</span>
                     <span>{data?.statusBreakdown?.critical || 0} patients</span>
                   </div>
                   <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                     <div className="h-full bg-destructive animate-pulse" style={{width: `${Math.max(5, ((data?.statusBreakdown?.critical || 0) / Math.max(1, data?.totalPatients || 1)) * 100)}%`}}></div>
                   </div>
                 </div>
               </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
