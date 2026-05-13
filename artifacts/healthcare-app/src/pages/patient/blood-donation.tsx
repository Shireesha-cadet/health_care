import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Droplets, Search, MapPin, Phone, Heart, CheckCircle, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Donor {
  id: number;
  name: string;
  bloodGroup: string;
  city: string;
  lastDonated: string;
  units: number;
  phone: string;
  available: boolean;
  age: number;
  donations: number;
}

function authFetch(url: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("healthcare_token");
  return fetch(url, { ...opts, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(opts.headers || {}) } });
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const bloodColors: Record<string, string> = {
  "A+": "bg-red-100 text-red-700 border-red-200", "A-": "bg-red-50 text-red-600 border-red-100",
  "B+": "bg-orange-100 text-orange-700 border-orange-200", "B-": "bg-orange-50 text-orange-600 border-orange-100",
  "O+": "bg-blue-100 text-blue-700 border-blue-200", "O-": "bg-blue-50 text-blue-600 border-blue-100",
  "AB+": "bg-purple-100 text-purple-700 border-purple-200", "AB-": "bg-purple-50 text-purple-600 border-purple-100",
};

export default function BloodDonation() {
  const { toast } = useToast();
  const [city, setCity] = useState("");
  const [bloodGroup, setBloodGroup] = useState<string>("all");
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestBg, setRequestBg] = useState("O+");
  const [requestCity, setRequestCity] = useState("");
  const [units, setUnits] = useState("1");

  const { data: donors, isLoading } = useQuery<Donor[]>({
    queryKey: ["blood-donors", bloodGroup, city],
    queryFn: () => {
      const params = new URLSearchParams();
      if (bloodGroup && bloodGroup !== "all") params.set("bloodGroup", bloodGroup);
      if (city) params.set("city", city);
      return authFetch(`/api/blood-donors?${params}`).then(r => r.json());
    },
  });

  const requestMutation = useMutation({
    mutationFn: () => authFetch("/api/blood-donors/request", { method: "POST", body: JSON.stringify({ bloodGroup: requestBg, city: requestCity, unitsNeeded: parseInt(units) }) }).then(r => r.json()),
    onSuccess: (data) => {
      setRequestOpen(false);
      toast({ title: "Request Submitted!", description: data.message });
    },
  });

  const stats = {
    total: donors?.length ?? 0,
    available: donors?.filter(d => d.available).length ?? 0,
    cities: donors ? [...new Set(donors.map(d => d.city))].length : 0,
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Droplets className="h-8 w-8 text-red-500" />
            Blood Donation
          </h1>
          <p className="text-muted-foreground mt-1">Find blood donors and request emergency blood supply.</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-md shadow-red-500/20" onClick={() => setRequestOpen(true)}>
          <Heart className="h-4 w-4" />
          Request Blood
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Donors", value: stats.total, icon: "👥", color: "blue" },
          { label: "Available Now", value: stats.available, icon: "✅", color: "green" },
          { label: "Cities", value: stats.cities, icon: "🏙️", color: "purple" },
          { label: "Blood Groups", value: BLOOD_GROUPS.length, icon: "🩸", color: "red" },
        ].map(s => (
          <Card key={s.label} className={cn("border-0 shadow-sm", s.color === "blue" ? "bg-blue-50 dark:bg-blue-950/20" : s.color === "green" ? "bg-emerald-50 dark:bg-emerald-950/20" : s.color === "purple" ? "bg-purple-50 dark:bg-purple-950/20" : "bg-red-50 dark:bg-red-950/20")}>
            <CardContent className="p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className="text-2xl font-bold">{isLoading ? "–" : s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by city..." className="pl-9 h-10" value={city} onChange={e => setCity(e.target.value)} />
        </div>
        <Select value={bloodGroup} onValueChange={setBloodGroup}>
          <SelectTrigger className="w-36 h-10">
            <SelectValue placeholder="Blood Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {BLOOD_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)
        ) : donors?.map((donor) => (
          <Card key={donor.id} className={cn("group border hover:shadow-lg transition-all duration-200", !donor.available && "opacity-60")}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-red-400 to-red-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-red-400/30">
                    {donor.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{donor.name}</p>
                    <p className="text-xs text-muted-foreground">Age {donor.age}</p>
                  </div>
                </div>
                <div className={cn("text-lg font-black px-3 py-1 rounded-xl border-2 min-w-[52px] text-center", bloodColors[donor.bloodGroup] ?? "bg-gray-100 text-gray-700 border-gray-200")}>
                  {donor.bloodGroup}
                </div>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>{donor.city}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                  <span>{donor.donations} donations • Last: {new Date(donor.lastDonated).toLocaleDateString("en-IN")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-[10px] gap-1", donor.available ? "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30" : "border-gray-200 text-gray-500")}>
                    {donor.available ? <CheckCircle className="h-3 w-3" /> : null}
                    {donor.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </div>

              {donor.available && (
                <Button variant="outline" size="sm" className="w-full mt-4 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  onClick={() => window.open(`tel:${donor.phone}`)}>
                  <Phone className="h-3.5 w-3.5" />
                  Contact Donor
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {!isLoading && !donors?.length && (
          <div className="col-span-full text-center py-16 bg-card rounded-xl border border-dashed text-muted-foreground">
            <Droplets className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium text-foreground">No donors found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Request Blood
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Blood Group Required</label>
              <Select value={requestBg} onValueChange={setRequestBg}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">City</label>
              <Input placeholder="Enter your city" value={requestCity} onChange={e => setRequestCity(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Units Needed</label>
              <Input type="number" min="1" max="10" value={units} onChange={e => setUnits(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => requestMutation.mutate()} disabled={!requestCity || requestMutation.isPending}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
