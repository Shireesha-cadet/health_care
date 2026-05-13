import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/language-context";
import { useGetAppointments, useCreateAppointment, useUpdateAppointment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar as CalendarIcon, Clock, User, Plus, Loader2, XCircle, RefreshCw,
  Star, Stethoscope, MapPin, DollarSign, Award, Building2, CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

function authFetch(url: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("healthcare_token");
  return fetch(url, { ...opts, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(opts.headers || {}) } });
}

const nearbyDoctors = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    specialization: "Cardiologist",
    rating: 4.9,
    experience: 14,
    fee: 800,
    timing: "Mon–Sat, 9 AM – 1 PM",
    hospital: "Apollo Hospitals, Hyderabad",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&q=80",
    distance: "1.2 km",
    available: true,
  },
  {
    id: 2,
    name: "Dr. Rakesh Verma",
    specialization: "General Physician",
    rating: 4.7,
    experience: 10,
    fee: 500,
    timing: "Mon–Sun, 8 AM – 8 PM",
    hospital: "Care Hospitals, HITEC City",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80",
    distance: "0.8 km",
    available: true,
  },
  {
    id: 3,
    name: "Dr. Anitha Reddy",
    specialization: "Diabetologist",
    rating: 4.8,
    experience: 12,
    fee: 700,
    timing: "Tue–Sun, 10 AM – 4 PM",
    hospital: "Yashoda Hospitals, Somajiguda",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80",
    distance: "2.1 km",
    available: true,
  },
  {
    id: 4,
    name: "Dr. Suresh Nair",
    specialization: "Neurologist",
    rating: 4.6,
    experience: 18,
    fee: 1000,
    timing: "Mon–Fri, 11 AM – 5 PM",
    hospital: "KIMS Hospitals, Secunderabad",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&q=80",
    distance: "3.4 km",
    available: false,
  },
  {
    id: 5,
    name: "Dr. Meera Iyer",
    specialization: "Pulmonologist",
    rating: 4.8,
    experience: 9,
    fee: 650,
    timing: "Mon–Sat, 9 AM – 6 PM",
    hospital: "Medicover Hospitals, Madhapur",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=200&q=80",
    distance: "1.7 km",
    available: true,
  },
  {
    id: 6,
    name: "Dr. Arun Kumar",
    specialization: "Orthopedic Surgeon",
    rating: 4.5,
    experience: 16,
    fee: 900,
    timing: "Mon–Sat, 8 AM – 2 PM",
    hospital: "Sunshine Hospitals, PG Road",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&q=80",
    distance: "4.0 km",
    available: true,
  },
];

export default function PatientAppointments() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: appointments, isLoading } = useGetAppointments({ userId: user?.id, role: "patient" });
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const [isOpen, setIsOpen] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<typeof nearbyDoctors[0] | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const [formData, setFormData] = useState({
    doctorId: "2",
    date: "",
    time: "",
    reason: "",
    notes: ""
  });

  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const scheduledAt = new Date(`${formData.date}T${formData.time}`).toISOString();
      await createAppointment.mutateAsync({
        data: {
          doctorId: parseInt(formData.doctorId),
          scheduledAt,
          reason: formData.reason,
          notes: formData.notes
        }
      });
      toast({ title: "Appointment booked", description: "Your appointment has been scheduled." });
      setIsOpen(false);
      setFormData({ doctorId: "2", date: "", time: "", reason: "", notes: "" });
      invalidate();
    } catch {
      toast({ title: "Error", description: "Failed to book appointment", variant: "destructive" });
    }
  };

  const handleCancel = async (appointmentId: number) => {
    try {
      await updateAppointment.mutateAsync({ appointmentId, data: { status: "cancelled" } });
      toast({ title: "Appointment cancelled", description: "Your appointment has been cancelled." });
      invalidate();
    } catch {
      toast({ title: "Error", description: "Failed to cancel appointment", variant: "destructive" });
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleId) return;
    setIsRescheduling(true);
    try {
      const scheduledAt = new Date(`${rescheduleData.date}T${rescheduleData.time}`).toISOString();
      const res = await authFetch(`/api/appointments/${rescheduleId}`, {
        method: "PATCH",
        body: JSON.stringify({ scheduledAt }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Appointment rescheduled", description: "Your appointment has been updated." });
      setRescheduleId(null);
      invalidate();
    } catch {
      toast({ title: "Error", description: "Failed to reschedule appointment", variant: "destructive" });
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleBookDoctor = (doctor: typeof nearbyDoctors[0]) => {
    setSelectedDoctor(doctor);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor) return;
    setBookingConfirmed(true);
    setTimeout(() => {
      setBookingConfirmed(false);
      setSelectedDoctor(null);
      toast({ title: "Appointment Request Sent", description: `Your appointment with ${selectedDoctor.name} has been requested.` });
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pending": return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
      case "cancelled": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">

      {/* Nearby Doctors Section */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("nearbyDoctors")}</h1>
            <p className="text-muted-foreground mt-1">Top-rated specialists available near you — book instantly.</p>
          </div>
          <Badge variant="secondary" className="w-fit gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            {nearbyDoctors.filter(d => d.available).length} Available Now
          </Badge>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {nearbyDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="group overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="relative p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b">
                  <div className="flex gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="h-16 w-16 rounded-xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=2563eb&color=fff&size=128`;
                        }}
                      />
                      <span className={cn(
                        "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white",
                        doctor.available ? "bg-emerald-500" : "bg-gray-400"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground leading-tight truncate">{doctor.name}</h3>
                      <p className="text-sm text-primary font-medium">{doctor.specialization}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn("h-3 w-3", i < Math.floor(doctor.rating) ? "text-amber-400 fill-amber-400" : "text-gray-300 fill-gray-300")}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">{doctor.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Award className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{doctor.experience} yrs exp.</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>₹{doctor.fee} consult</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{doctor.timing}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      <span>{doctor.distance}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                    <span className="line-clamp-1">{doctor.hospital}</span>
                  </div>

                  <Button
                    className={cn(
                      "mt-auto w-full gap-2 text-sm font-semibold",
                      doctor.available
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                        : ""
                    )}
                    variant={doctor.available ? "default" : "outline"}
                    disabled={!doctor.available}
                    onClick={() => handleBookDoctor(doctor)}
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {doctor.available ? t("bookAppointment") : "Unavailable"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* My Appointments */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("appointments")}</h2>
            <p className="text-muted-foreground mt-1">Manage your upcoming and past doctor visits.</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0"><Plus className="mr-2 h-4 w-4" /> {t("bookAppointment")}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Book an Appointment</DialogTitle>
                <DialogDescription>Schedule a visit with your preferred doctor.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for visit</Label>
                  <Input id="reason" required placeholder="e.g. Annual checkup" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional notes</Label>
                  <Textarea id="notes" placeholder="Any specific symptoms?" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createAppointment.isPending}>
                    {createAppointment.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Confirm Booking
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Reschedule Dialog */}
        <Dialog open={rescheduleId !== null} onOpenChange={open => !open && setRescheduleId(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
              <DialogDescription>Choose a new date and time.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleReschedule} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>New Date</Label>
                  <Input type="date" required value={rescheduleData.date} onChange={e => setRescheduleData(d => ({...d, date: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label>New Time</Label>
                  <Input type="time" required value={rescheduleData.time} onChange={e => setRescheduleData(d => ({...d, time: e.target.value}))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setRescheduleId(null)}>Cancel</Button>
                <Button type="submit" disabled={isRescheduling}>
                  {isRescheduling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4 md:grid-cols-2">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
          ) : appointments?.length ? (
            appointments.map((apt) => (
              <Card key={apt.id} className="hover-elevate transition-all">
                <CardContent className="p-6 flex flex-col h-full justify-between gap-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className={cn("uppercase text-xs font-semibold tracking-wider", getStatusColor(apt.status))}>
                        {apt.status}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{apt.reason}</h3>
                      <div className="flex items-center text-muted-foreground text-sm gap-2">
                        <User className="h-4 w-4" />
                        <span>{apt.doctorName || "Dr. Unassigned"}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 bg-muted/50 p-3 rounded-lg text-sm border">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        <span className="font-medium">{format(new Date(apt.scheduledAt), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium">{format(new Date(apt.scheduledAt), "h:mm a")}</span>
                      </div>
                    </div>
                  </div>

                  {apt.status === "pending" && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        className="w-full gap-1.5"
                        size="sm"
                        onClick={() => {
                          setRescheduleData({ date: "", time: "" });
                          setRescheduleId(apt.id);
                        }}
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Reschedule
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 gap-1.5" size="sm">
                            <XCircle className="h-3.5 w-3.5" /> Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will cancel your appointment for "{apt.reason}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep It</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleCancel(apt.id)}
                            >
                              Yes, Cancel
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2 text-center py-16 bg-card rounded-xl border border-dashed text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium text-foreground">No appointments found</p>
              <p>You have no upcoming or past appointments.</p>
            </div>
          )}
        </div>
      </div>

      {/* Doctor Booking Modal */}
      <Dialog open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("bookAppointment")}</DialogTitle>
            <DialogDescription>Confirm your appointment with the selected doctor.</DialogDescription>
          </DialogHeader>

          {selectedDoctor && !bookingConfirmed && (
            <div className="space-y-4">
              <div className="flex gap-4 items-center p-4 bg-muted/40 rounded-xl border">
                <img
                  src={selectedDoctor.image}
                  alt={selectedDoctor.name}
                  className="h-14 w-14 rounded-xl object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.name)}&background=2563eb&color=fff&size=128`;
                  }}
                />
                <div>
                  <p className="font-bold">{selectedDoctor.name}</p>
                  <p className="text-sm text-primary">{selectedDoctor.specialization}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedDoctor.hospital}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900">
                  <p className="font-bold text-blue-700 dark:text-blue-400">{selectedDoctor.experience} yrs</p>
                  <p className="text-xs text-muted-foreground">Experience</p>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900">
                  <p className="font-bold text-amber-700 dark:text-amber-400">{selectedDoctor.rating} ★</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900">
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">₹{selectedDoctor.fee}</p>
                  <p className="text-xs text-muted-foreground">Fee</p>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg text-sm border flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span>{selectedDoctor.timing}</span>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedDoctor(null)}>Cancel</Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  onClick={handleConfirmBooking}
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
          )}

          {bookingConfirmed && (
            <div className="py-8 flex flex-col items-center gap-4 text-center">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-xl">Appointment Confirmed!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your appointment with {selectedDoctor?.name} has been booked.
                </p>
              </div>
              <div className="flex gap-1.5">
                {[0,1,2].map(i => <div key={i} className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
