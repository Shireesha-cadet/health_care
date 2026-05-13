import { useState } from "react";
import { useGetAppointments } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "pending": return "bg-amber-100 text-amber-800 border-amber-200";
    case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
    case "cancelled": return "bg-muted text-muted-foreground border-border";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function AdminAppointments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: appointments, isLoading } = useGetAppointments({});

  const filtered = appointments?.filter(apt => {
    const matchSearch =
      (apt.reason?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (apt.patientName?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (apt.doctorName?.toLowerCase() ?? "").includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || apt.status === statusFilter;
    return matchSearch && matchStatus;
  }) ?? [];

  const counts = {
    all: appointments?.length ?? 0,
    pending: appointments?.filter(a => a.status === "pending").length ?? 0,
    confirmed: appointments?.filter(a => a.status === "confirmed").length ?? 0,
    completed: appointments?.filter(a => a.status === "completed").length ?? 0,
    cancelled: appointments?.filter(a => a.status === "cancelled").length ?? 0,
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Appointments Overview</h1>
        <p className="text-muted-foreground mt-1">System-wide appointment tracking across all patients and doctors.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {(["pending", "confirmed", "completed", "cancelled"] as const).map(s => (
          <Card key={s} className={cn("cursor-pointer hover-elevate transition-all", statusFilter === s && "ring-2 ring-primary")} onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground capitalize mb-1">{s}</p>
              <p className="text-2xl font-bold">{isLoading ? "—" : counts[s]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <CardTitle>All Appointments</CardTitle>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by patient, doctor..." className="pl-9 bg-background" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 bg-background">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ({counts.all})</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
            ) : filtered.length > 0 ? (
              filtered.map((apt) => (
                <div key={apt.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg border bg-muted/30 gap-3">
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                      {apt.patientName?.charAt(0) ?? "P"}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{apt.reason}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {apt.patientName ?? "Patient"}</span>
                        <span>→</span>
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {apt.doctorName ?? "Doctor"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-13">
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(apt.scheduledAt), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {format(new Date(apt.scheduledAt), "h:mm a")}
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("capitalize text-xs shrink-0", getStatusColor(apt.status))}>
                      {apt.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium text-foreground">No appointments found</p>
                <p className="text-sm">Try adjusting your search or filter.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
