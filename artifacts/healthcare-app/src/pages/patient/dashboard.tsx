import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/language-context";
import { useGetDashboardData, useGetLatestVitals } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, HeartPulse, Droplets, Thermometer, Flame, Siren } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmergencyAlertDialog } from "@/components/emergency-alert-dialog";

export default function PatientDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  const { data: dashboardData, isLoading: isLoadingDash } = useGetDashboardData({ userId: user?.id, role: "patient" });
  const { data: latestVitals, isLoading: isLoadingVitals } = useGetLatestVitals({ userId: user?.id });

  const isLoading = isLoadingDash || isLoadingVitals;

  const emergencyContact = (() => {
    try {
      const raw = localStorage.getItem("vitalcare_emergency_contact");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  const StatusBadge = ({ status }: { status?: string }) => {
    if (!status) return null;
    return (
      <Badge variant="outline" className={cn(
        "font-semibold uppercase tracking-wider",
        status === "normal" && "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50",
        status === "risk" && "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50",
        status === "critical" && "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50 animate-pulse"
      )}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("welcomeBack")}, {user?.name}</h1>
          <p className="text-muted-foreground mt-1">{t("healthSummary")}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
            onClick={() => setEmergencyOpen(true)}
          >
            <Siren className="h-4 w-4" />
            {t("emergency")}
          </Button>
          <div className="flex items-center gap-3 bg-card p-3 rounded-lg border shadow-sm">
            <span className="text-sm font-medium text-muted-foreground">{t("overallStatus")}:</span>
            {isLoading ? <Skeleton className="h-6 w-20" /> : <StatusBadge status={latestVitals?.overallStatus || "normal"} />}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate transition-all border-l-4 border-l-chart-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("heartRate")}</CardTitle>
            <Activity className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{latestVitals?.heartRate || "--"}</span>
                <span className="text-sm text-muted-foreground">bpm</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-l-4 border-l-chart-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("bloodPressure")}</CardTitle>
            <HeartPulse className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{latestVitals?.systolicBp || "--"}/{latestVitals?.diastolicBp || "--"}</span>
                <span className="text-sm text-muted-foreground">mmHg</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-l-4 border-l-chart-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">SpO2</CardTitle>
            <Droplets className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{latestVitals?.spo2 || "--"}</span>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-l-4 border-l-chart-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("temperature")}</CardTitle>
            <Thermometer className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{latestVitals?.temperature || "--"}</span>
                <span className="text-sm text-muted-foreground">°C</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>{t("recentActivity")}</CardTitle>
            <CardDescription>Your latest recorded vitals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingDash ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
              ) : dashboardData?.recentVitals?.length ? (
                dashboardData.recentVitals.slice(0, 3).map((vital) => (
                  <div key={vital.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Vitals Recorded</p>
                        <p className="text-xs text-muted-foreground">{new Date(vital.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <StatusBadge status={vital.status} />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No recent vitals found.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-destructive" />
              {t("recentAlerts")}
            </CardTitle>
            <CardDescription>Notifications requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingDash ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
              ) : dashboardData?.recentAlerts?.length ? (
                dashboardData.recentAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="p-4 rounded-lg border border-l-4 border-l-destructive bg-destructive/5 text-sm">
                    <div className="font-semibold text-destructive mb-1">{alert.type.replace('_', ' ').toUpperCase()}</div>
                    <div className="text-foreground">{alert.message}</div>
                    <div className="text-xs text-muted-foreground mt-2">{new Date(alert.createdAt).toLocaleString()}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No recent alerts.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <EmergencyAlertDialog
        open={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
        contactName={emergencyContact?.name}
        contactNumber={emergencyContact?.phone}
      />
    </div>
  );
}
