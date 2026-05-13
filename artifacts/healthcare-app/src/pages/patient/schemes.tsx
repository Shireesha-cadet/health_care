import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Landmark, ExternalLink, CheckCircle, Users, Gift } from "lucide-react";

interface Scheme {
  id: number;
  title: string;
  ministry: string;
  tag: string;
  description: string;
  eligibility: string;
  benefits: string[];
  image: string;
  color: string;
  applyUrl: string;
}

const tagColors: Record<string, string> = {
  "Health Insurance": "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  "Accident Insurance": "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  "Primary Healthcare": "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  "Maternal Health": "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
  "Critical Illness": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  "Dialysis Support": "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
};

export default function GovtSchemes() {
  const { data: schemes, isLoading } = useQuery<Scheme[]>({
    queryKey: ["schemes"],
    queryFn: () => fetch("/api/schemes").then(r => r.json()),
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Landmark className="h-6 w-6" />
            </div>
            <Badge className="bg-white/20 text-white border-white/30 text-xs">Government of India</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">Health & Welfare Schemes</h1>
          <p className="text-blue-100 max-w-xl">Access government-funded healthcare programs, insurance schemes, and welfare benefits available to you.</p>
          <div className="flex gap-6 mt-6">
            <div className="text-center"><div className="text-2xl font-bold">6+</div><div className="text-xs text-blue-200">Active Schemes</div></div>
            <div className="text-center"><div className="text-2xl font-bold">50Cr+</div><div className="text-xs text-blue-200">Beneficiaries</div></div>
            <div className="text-center"><div className="text-2xl font-bold">₹5L</div><div className="text-xs text-blue-200">Max Coverage</div></div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-96 rounded-2xl" />)
        ) : schemes?.map((scheme) => (
          <Card key={scheme.id} className="group overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="relative h-44 overflow-hidden">
              <img
                src={scheme.image}
                alt={scheme.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-3 left-3">
                <Badge className={`text-xs font-semibold ${tagColors[scheme.tag] || "bg-gray-100 text-gray-800"}`}>
                  {scheme.tag}
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white font-bold text-lg leading-tight line-clamp-2">{scheme.title}</p>
              </div>
            </div>

            <CardContent className="p-5 flex-1 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Landmark className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground truncate">{scheme.ministry}</p>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{scheme.description}</p>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  <Users className="h-3.5 w-3.5" /> Eligibility
                </div>
                <p className="text-xs text-foreground bg-muted/50 rounded-lg p-2.5">{scheme.eligibility}</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  <Gift className="h-3.5 w-3.5" /> Key Benefits
                </div>
                <ul className="space-y-1.5">
                  {scheme.benefits.slice(0, 3).map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className="mt-auto w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20"
                onClick={() => window.open(scheme.applyUrl, "_blank")}
              >
                Apply Now
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
