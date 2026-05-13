import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Phone, Building2, CheckCircle2, Siren } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmergencyAlertDialogProps {
  open: boolean;
  onClose: () => void;
  contactName?: string;
  contactNumber?: string;
}

export function EmergencyAlertDialog({ open, onClose, contactName, contactNumber }: EmergencyAlertDialogProps) {
  const [stage, setStage] = useState<"confirm" | "sending" | "sent">("confirm");

  const handleSendAlert = () => {
    setStage("sending");
    setTimeout(() => setStage("sent"), 2000);
  };

  const handleClose = () => {
    setStage("confirm");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Siren className="h-5 w-5 animate-pulse" />
            Emergency Alert System
          </DialogTitle>
        </DialogHeader>

        {stage === "confirm" && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-300">Critical Health Condition Detected</p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    An emergency alert will be sent to your emergency contact and nearby hospitals will be notified immediately.
                  </p>
                </div>
              </div>
            </div>

            {(contactName || contactNumber) && (
              <div className="p-3 bg-muted/50 rounded-lg border text-sm space-y-1.5">
                <p className="font-medium text-foreground">Emergency Contact:</p>
                {contactName && <p className="text-muted-foreground">{contactName}</p>}
                {contactNumber && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {contactNumber}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
                onClick={handleSendAlert}
              >
                <Siren className="h-4 w-4" />
                Send Emergency Alert
              </Button>
            </div>
          </div>
        )}

        {stage === "sending" && (
          <div className="py-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto">
              <Siren className="h-8 w-8 text-red-600 animate-pulse" />
            </div>
            <div>
              <p className="font-semibold text-lg">Sending Emergency Alert...</p>
              <p className="text-sm text-muted-foreground mt-1">Contacting emergency services</p>
            </div>
            <div className="flex gap-1.5 justify-center">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-red-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {stage === "sent" && (
          <div className="py-6 space-y-4">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-xl text-emerald-700 dark:text-emerald-400">Alert Sent Successfully</p>
                <p className="text-sm text-muted-foreground mt-1">Help is on the way</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className={cn(
                "flex items-start gap-3 p-3.5 rounded-xl border",
                "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
              )}>
                <Phone className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-emerald-800 dark:text-emerald-300">Emergency contact notified</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Emergency alert sent to emergency contact number.
                  </p>
                </div>
              </div>

              <div className={cn(
                "flex items-start gap-3 p-3.5 rounded-xl border",
                "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              )}>
                <Building2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-blue-800 dark:text-blue-300">Hospitals notified</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                    Nearby hospitals have been notified.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center text-xs text-muted-foreground">
              Emergency ID: <span className="font-mono font-bold">EMG-{Date.now().toString().slice(-6)}</span>
            </div>

            <Button className="w-full" onClick={handleClose}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
