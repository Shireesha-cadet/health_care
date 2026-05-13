import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; // Let AppLayout handle loading state

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard if they try to access another role's page
    if (user.role === "patient") return <Redirect to="/patient" />;
    if (user.role === "doctor") return <Redirect to="/doctor" />;
    if (user.role === "hospital_admin") return <Redirect to="/hospital-admin" />;
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
