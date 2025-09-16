import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient?: boolean;
}

export function StatsCard({ title, value, change, changeType = "neutral", icon: Icon, gradient }: StatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={`transition-all hover:shadow-lg ${gradient ? "gradient-card" : ""}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {change && (
              <p className={`text-sm ${getChangeColor()}`}>
                {change}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${gradient ? "bg-gradient-primary" : "bg-primary/10"}`}>
            <Icon className={`w-6 h-6 ${gradient ? "text-text-light" : "text-primary"}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}