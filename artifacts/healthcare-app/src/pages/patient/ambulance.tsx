import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Ambulance, MapPin, Clock, Phone, Wifi, CheckCircle, AlertTriangle, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AmbulanceUnit {
  id: string;
  driver: string;
  phone: string;
  type: string;
  status: string;
  distanceKm: number;
  etaMinutes: number;
  lat: number;
  lng: number;
}

function authFetch(url: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("healthcare_token");
  return fetch(url, { ...opts, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(opts.headers || {}) } });
}

export default function AmbulanceTracking() {
  const { toast } = useToast();
  const [dispatched, setDispatched] = useState<{ ambulanceId: string; driver: string; phone: string; etaMinutes: number; trackingId: string } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const { data: units, isLoading, refetch } = useQuery<AmbulanceUnit[]>({
    queryKey: ["ambulance-status"],
    queryFn: () => authFetch("/api/ambulance/status").then(r => r.json()),
    refetchInterval: 8000,
  });

  const requestMutation = useMutation({
    mutationFn: () => authFetch("/api/ambulance/request", { method: "POST", body: JSON.stringify({}) }).then(r => r.json()),
    onSuccess: (data) => {
      setDispatched(data);
      setCountdown(data.etaMinutes * 60);
      toast({ title: "Ambulance Dispatched!", description: data.message });
      refetch();
    },
  });

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => (c !== null && c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const fmtCountdown = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const available = units?.filter(u => u.status === "available") ?? [];
  const nearest = available.length ? available.reduce((a, b) => a.distanceKm < b.distanceKm ? a : b) : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Ambulance className="h-8 w-8 text-red-500" />
            Ambulance Tracking
          </h1>
          <p className="text-muted-foreground mt-1">Live ambulance availability and emergency dispatch system.</p>
        </div>
        <Badge variant="outline" className="gap-1.5 text-xs shrink-0">
          <Wifi className="h-3 w-3 text-emerald-500" />
          Live • Updates every 8s
        </Badge>
      </div>

      {dispatched && countdown !== null && (
        <Card className="border-2 border-red-400 bg-red-50 dark:bg-red-950/30 shadow-lg shadow-red-500/10 animate-in fade-in">
          <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                <Ambulance className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-bold text-red-700 dark:text-red-400 text-lg">Ambulance En Route!</p>
              <p className="text-sm text-red-600 dark:text-red-300">Driver: {dispatched.driver} • {dispatched.phone}</p>
              <p className="text-xs text-muted-foreground mt-1">Tracking: {dispatched.trackingId}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-red-600">{fmtCountdown(countdown)}</div>
              <div className="text-xs text-muted-foreground mt-1">Estimated arrival</div>
            </div>
            <Button variant="outline" size="sm" className="border-red-300 text-red-600" onClick={() => window.open(`tel:${dispatched.phone}`)}>
              <Phone className="h-4 w-4 mr-1" /> Call Driver
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20">
          <CardContent className="p-5">
            <div className="text-3xl font-bold">{isLoading ? "–" : available.length}</div>
            <div className="text-emerald-100 text-sm mt-1">Available Units</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg shadow-blue-500/20">
          <CardContent className="p-5">
            <div className="text-3xl font-bold">{isLoading || !nearest ? "–" : `${nearest.distanceKm} km`}</div>
            <div className="text-blue-100 text-sm mt-1">Nearest Ambulance</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg shadow-amber-500/20">
          <CardContent className="p-5">
            <div className="text-3xl font-bold">{isLoading || !nearest ? "–" : `${nearest.etaMinutes} min`}</div>
            <div className="text-amber-100 text-sm mt-1">Fastest ETA</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold">Fleet Status</h2>
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          ) : units?.map((unit) => (
            <Card key={unit.id} className={cn("border transition-all hover:shadow-md", unit.status === "dispatched" && "border-red-300 bg-red-50/50 dark:bg-red-950/20")}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", unit.status === "available" ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-red-100 dark:bg-red-900/40 animate-pulse")}>
                  <Ambulance className={cn("h-6 w-6", unit.status === "available" ? "text-emerald-600" : "text-red-600")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{unit.id}</span>
                    <Badge variant="outline" className={cn("text-[10px]", unit.status === "available" ? "border-emerald-300 text-emerald-700 bg-emerald-50" : "border-red-300 text-red-700 bg-red-50")}>
                      {unit.status === "available" ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                      {unit.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{unit.type} • Driver: {unit.driver}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-sm font-semibold justify-end">
                    <Navigation className="h-3.5 w-3.5 text-primary" />
                    {unit.distanceKm} km
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end mt-0.5">
                    <Clock className="h-3 w-3" />
                    {unit.etaMinutes} min ETA
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Emergency Dispatch</h2>

          <Card className="border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
            <CardContent className="p-5 flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-red-500/10 border-2 border-red-300 flex items-center justify-center">
                <Ambulance className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-red-700 dark:text-red-400">Request Emergency Ambulance</p>
                <p className="text-xs text-muted-foreground mt-1">Nearest available unit will be dispatched to your location immediately.</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 font-bold text-base h-12">
                    🚑 Call Ambulance
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Emergency Request</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will dispatch an ambulance to your registered location immediately. Only use this for genuine medical emergencies.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => requestMutation.mutate()}>
                      Confirm Emergency
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold">Emergency Contacts</p>
              {[{ label: "National Ambulance", num: "108" }, { label: "Police", num: "100" }, { label: "Fire", num: "101" }, { label: "Disaster", num: "1070" }].map(c => (
                <div key={c.num} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{c.label}</span>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => window.open(`tel:${c.num}`)}>
                    <Phone className="h-3 w-3" /> {c.num}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Your Location</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Based on your registered address. Update in Settings.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
