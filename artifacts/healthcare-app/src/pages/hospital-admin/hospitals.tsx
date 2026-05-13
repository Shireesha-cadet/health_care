import { useGetHospitals } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, MapPin, Phone, Bed } from "lucide-react";

export default function AdminHospitals() {
  const { data: hospitals, isLoading } = useGetHospitals();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Hospital Network</h1>
          <p className="text-muted-foreground mt-1">Manage all hospitals and facilities in the network.</p>
        </div>
        {!isLoading && (
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Building2 className="h-3.5 w-3.5 mr-1.5" />
            {hospitals?.length ?? 0} facilities
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
        ) : hospitals?.length ? (
          hospitals.map((hospital) => (
            <Card key={hospital.id} className="hover-elevate transition-all overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base leading-tight">{hospital.name}</h3>
                    <Badge variant="outline" className="text-[10px] mt-1 capitalize">
                      General Hospital
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {hospital.address && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>{hospital.address}</span>
                    </div>
                  )}
                  {hospital.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{hospital.phone}</span>
                    </div>
                  )}
                  {(hospital.bedsAvailable != null) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Bed className="h-3.5 w-3.5 shrink-0" />
                      <span>{hospital.bedsAvailable} beds available</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>ID #{hospital.id}</span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-16 bg-card rounded-xl border border-dashed text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">No hospitals found</p>
          </div>
        )}
      </div>
    </div>
  );
}
