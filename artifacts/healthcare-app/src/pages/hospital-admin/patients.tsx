import { useState } from "react";
import { useGetPatients } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, Activity, HeartPulse, Droplets, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const getStatusColor = (status: string) => {
  switch (status) {
    case "normal": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "risk": return "bg-amber-100 text-amber-800 border-amber-200";
    case "critical": return "bg-red-100 text-red-800 border-red-200 animate-pulse";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function AdminPatients() {
  const { data: patients, isLoading } = useGetPatients();
  const [search, setSearch] = useState("");

  const filtered = patients?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Patient Registry</h1>
          <p className="text-muted-foreground mt-1">All registered patients and their current health status.</p>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && (
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              {patients?.length ?? 0} patients
            </Badge>
          )}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              className="pl-9 bg-card"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : filtered.length > 0 ? (
          filtered.map((patient) => (
            <Card
              key={patient.id}
              className={cn("hover-elevate transition-all overflow-hidden border-l-4",
                patient.overallStatus === "critical" ? "border-l-destructive" :
                patient.overallStatus === "risk" ? "border-l-amber-500" :
                patient.overallStatus === "unknown" ? "border-l-muted-foreground/30" :
                "border-l-emerald-500"
              )}
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center p-4 gap-6">
                  <div className="flex items-center gap-4 w-full md:w-1/4 shrink-0">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">{patient.name}</h3>
                      <p className="text-xs text-muted-foreground">{patient.email}</p>
                      {patient.lastVitalAt && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Last: {format(new Date(patient.lastVitalAt), "MMM d, h:mm a")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-3 gap-4 w-full border-y md:border-y-0 md:border-x py-4 md:py-0 md:px-6">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-1">
                        <Activity className="h-3 w-3 text-chart-1" /> HR
                      </div>
                      <div className="font-semibold">{patient.latestHeartRate ?? "--"} <span className="text-[10px] text-muted-foreground font-normal">bpm</span></div>
                    </div>
                    <div className="text-center border-x">
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-1">
                        <HeartPulse className="h-3 w-3 text-chart-2" /> BP
                      </div>
                      <div className="font-semibold">{patient.latestBp ?? "--"}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-1">
                        <Droplets className="h-3 w-3 text-chart-3" /> SpO2
                      </div>
                      <div className="font-semibold">{patient.latestSpo2 ?? "--"} <span className="text-[10px] text-muted-foreground font-normal">%</span></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">Status</div>
                      <Badge variant="outline" className={cn("uppercase text-[10px]", getStatusColor(patient.overallStatus))}>
                        {patient.overallStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 bg-card rounded-xl border border-dashed text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">No patients found</p>
            <p className="text-sm">Try adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
