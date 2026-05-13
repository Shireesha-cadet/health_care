import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/language-context";
import type { Language } from "@/contexts/language-context";
import {
  Activity,
  AlertTriangle,
  Calendar,
  Building2,
  Settings,
  MessageSquare,
  Users,
  LogOut,
  LayoutDashboard,
  BarChart3,
  History,
  HeartPulse,
  Brain,
  Landmark,
  Ambulance,
  Droplets,
  Bed,
  Globe,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NavItem {
  titleKey: string;
  href: string;
  icon: React.ElementType;
}

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  if (!user) return null;

  const patientNav: NavItem[] = [
    { titleKey: "dashboard", href: "/patient", icon: LayoutDashboard },
    { titleKey: "recordVitals", href: "/patient/vitals", icon: HeartPulse },
    { titleKey: "history", href: "/patient/history", icon: History },
    { titleKey: "analytics", href: "/patient/analytics", icon: BarChart3 },
    { titleKey: "aiInsights", href: "/patient/insights", icon: Brain },
    { titleKey: "aiAssistant", href: "/patient/ai-assistant", icon: MessageSquare },
    { titleKey: "alerts", href: "/patient/alerts", icon: AlertTriangle },
    { titleKey: "appointments", href: "/patient/appointments", icon: Calendar },
    { titleKey: "hospitals", href: "/patient/hospitals", icon: Building2 },
    { titleKey: "ambulance", href: "/patient/ambulance", icon: Ambulance },
    { titleKey: "bloodDonation", href: "/patient/blood-donation", icon: Droplets },
    { titleKey: "govtSchemes", href: "/patient/schemes", icon: Landmark },
    { titleKey: "settings", href: "/patient/settings", icon: Settings },
  ];

  const doctorNav: NavItem[] = [
    { titleKey: "dashboard", href: "/doctor", icon: LayoutDashboard },
    { titleKey: "patients", href: "/doctor/patients", icon: Users },
    { titleKey: "appointments", href: "/doctor/appointments", icon: Calendar },
    { titleKey: "alerts", href: "/doctor/alerts", icon: AlertTriangle },
    { titleKey: "hospitals", href: "/doctor/hospitals", icon: Building2 },
    { titleKey: "settings", href: "/doctor/settings", icon: Settings },
  ];

  const adminNav: NavItem[] = [
    { titleKey: "dashboard", href: "/hospital-admin", icon: LayoutDashboard },
    { titleKey: "doctors", href: "/hospital-admin/doctors", icon: Users },
    { titleKey: "patients", href: "/hospital-admin/patients", icon: Activity },
    { titleKey: "appointments", href: "/hospital-admin/appointments", icon: Calendar },
    { titleKey: "bedManagement", href: "/hospital-admin/bed-management", icon: Bed },
    { titleKey: "analytics", href: "/hospital-admin/analytics", icon: BarChart3 },
    { titleKey: "hospitals", href: "/hospital-admin/hospitals", icon: Building2 },
    { titleKey: "settings", href: "/hospital-admin/settings", icon: Settings },
  ];

  let navItems: NavItem[] = [];
  if (user.role === "patient") navItems = patientNav;
  if (user.role === "doctor") navItems = doctorNav;
  if (user.role === "hospital_admin") navItems = adminNav;

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-14 items-center border-b border-sidebar-border px-6">
        <Activity className="h-6 w-6 text-sidebar-primary mr-2" />
        <span className="font-semibold text-lg tracking-tight text-white">VitalCare</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/patient" && item.href !== "/doctor" && item.href !== "/hospital-admin");
            const isExactMatch = location === item.href;
            const isReallyActive = (item.href === "/patient" || item.href === "/doctor" || item.href === "/hospital-admin") ? isExactMatch : isActive;

            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                    isReallyActive
                      ? "bg-sidebar-primary/10 text-sidebar-primary shadow-[0_0_10px_rgba(var(--sidebar-primary),0.2)]"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isReallyActive ? "text-sidebar-primary" : "text-sidebar-foreground/50"
                    )}
                    aria-hidden="true"
                  />
                  {t(item.titleKey as Parameters<typeof t>[0])}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-sidebar-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-sidebar-foreground/50 shrink-0" />
          <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
            <SelectTrigger className="h-8 text-xs bg-sidebar-accent/30 border-sidebar-border text-sidebar-foreground/80 flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="te">తెలుగు</SelectItem>
              <SelectItem value="hi">हिंदी</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary/20 text-sidebar-primary">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3 flex flex-col">
            <span className="text-sm font-medium text-white">{user.name}</span>
            <span className="text-xs text-sidebar-foreground/70 capitalize">{user.role.replace('_', ' ')}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-destructive"
        >
          <LogOut className="mr-3 h-4 w-4" />
          {t("signOut")}
        </button>
      </div>
    </div>
  );
}
