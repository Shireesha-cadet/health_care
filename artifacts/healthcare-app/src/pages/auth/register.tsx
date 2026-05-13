import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Loader2, AlertCircle, CheckCircle, ChevronRight, ChevronLeft, Phone, UserCheck, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Register() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("patient");
  const [phone, setPhone] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();

  const clearError = () => setError(null);

  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { label: "Too short (min 6 chars)", color: "text-red-500" };
    if (password.length < 8) return { label: "Weak", color: "text-amber-500" };
    return { label: "Good", color: "text-emerald-500" };
  };

  const passwordStrength = getPasswordStrength();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (emergencyName || emergencyPhone) {
        localStorage.setItem("vitalcare_emergency_contact", JSON.stringify({
          name: emergencyName,
          relation: emergencyRelation,
          phone: emergencyPhone,
        }));
      }
      await register({
        name,
        email,
        password,
        role: role as any,
        phone: phone || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-sidebar flex-col justify-center px-16 text-sidebar-foreground">
        <div className="max-w-md">
          <Activity className="h-12 w-12 text-sidebar-primary mb-8" />
          <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
            Join VitalCare today
          </h1>
          <p className="text-lg text-sidebar-foreground/80 leading-relaxed">
            Create an account to access premium health monitoring, expert care, and AI-driven insights.
          </p>
          <ul className="mt-8 space-y-3">
            {["AI-powered health insights", "Real-time vitals monitoring", "Instant anomaly alerts", "Doctor consultations", "Emergency contact alerts"].map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sidebar-foreground/80 text-sm">
                <CheckCircle className="h-4 w-4 text-sidebar-primary shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex gap-3">
            {[1, 2].map(s => (
              <div key={s} className={`flex items-center gap-2 text-sm ${step >= s ? "text-sidebar-primary" : "text-sidebar-foreground/40"}`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step >= s ? "border-sidebar-primary bg-sidebar-primary/20" : "border-sidebar-foreground/30"}`}>
                  {s}
                </div>
                <span>{s === 1 ? "Account Info" : "Emergency Contact"}</span>
                {s < 2 && <ChevronRight className="h-3 w-3 opacity-50" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-8">
          <div className="lg:hidden flex justify-center mb-8">
            <Activity className="h-10 w-10 text-primary" />
          </div>

          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
              {step === 1 ? (
                <>
                  <CardTitle className="text-3xl">Create account</CardTitle>
                  <CardDescription>Step 1 of 2 — Fill in your basic details</CardDescription>
                </>
              ) : (
                <>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <Shield className="h-7 w-7 text-red-500" />
                    Emergency Contact
                  </CardTitle>
                  <CardDescription>Step 2 of 2 — Add an emergency contact (optional but recommended)</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="px-0">
              {error && (
                <div className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-4">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {step === 1 && (
                <form onSubmit={handleNext} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => { setName(e.target.value); clearError(); }} placeholder="John Doe" required className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); clearError(); }} placeholder="name@example.com" required className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); clearError(); }} placeholder="Minimum 6 characters" required className="h-11" />
                    {passwordStrength && <p className={`text-xs ${passwordStrength.color}`}>{passwordStrength.label}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">I am a</Label>
                    <Select value={role} onValueChange={(v) => { setRole(v); clearError(); }}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="caretaker">Caretaker</SelectItem>
                        <SelectItem value="hospital_admin">Hospital Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="h-11" />
                  </div>
                  <Button type="submit" className="w-full h-11 text-base mt-2 gap-2">
                    Next: Emergency Contact <ChevronRight className="h-4 w-4" />
                  </Button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 rounded-xl text-sm text-red-700 dark:text-red-400">
                    <p className="font-semibold mb-1 flex items-center gap-1.5"><Shield className="h-4 w-4" /> Why add an emergency contact?</p>
                    <p>If a critical health event is detected, our system will instantly notify your emergency contact and nearby hospitals.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyName" className="flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      Contact Name <span className="text-muted-foreground font-normal">(Optional)</span>
                    </Label>
                    <Input id="emergencyName" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} placeholder="e.g. Ramesh Kumar" className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyRelation">Relationship <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                    <Select value={emergencyRelation} onValueChange={setEmergencyRelation}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="caretaker">Caretaker</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone" className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      Contact Phone Number <span className="text-muted-foreground font-normal">(Optional)</span>
                    </Label>
                    <Input id="emergencyPhone" type="tel" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} placeholder="+91 98765 43210" className="h-11" />
                  </div>

                  <div className="flex gap-3 mt-2">
                    <Button type="button" variant="outline" className="flex-1 h-11 gap-1.5" onClick={() => setStep(1)}>
                      <ChevronLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button type="submit" className="flex-1 h-11 text-base" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
                    </Button>
                  </div>

                  <button type="button" className="w-full text-sm text-muted-foreground hover:text-primary transition-colors text-center" onClick={handleSubmit}>
                    Skip and create account without emergency contact
                  </button>
                </form>
              )}

              <div className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
