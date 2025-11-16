import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'red';
}

const colorClasses = {
  blue: {
    border: 'border-l-blue-500',
    gradient: 'from-blue-50 to-white dark:from-blue-950 dark:to-background',
    iconBg: 'bg-blue-100 dark:bg-blue-900',
    iconColor: 'text-blue-600 dark:text-blue-400',
    valueColor: 'text-blue-700 dark:text-blue-400',
  },
  purple: {
    border: 'border-l-purple-500',
    gradient: 'from-purple-50 to-white dark:from-purple-950 dark:to-background',
    iconBg: 'bg-purple-100 dark:bg-purple-900',
    iconColor: 'text-purple-600 dark:text-purple-400',
    valueColor: 'text-purple-700 dark:text-purple-400',
  },
  green: {
    border: 'border-l-green-500',
    gradient: 'from-green-50 to-white dark:from-green-950 dark:to-background',
    iconBg: 'bg-green-100 dark:bg-green-900',
    iconColor: 'text-green-600 dark:text-green-400',
    valueColor: 'text-green-700 dark:text-green-400',
  },
  orange: {
    border: 'border-l-orange-500',
    gradient: 'from-orange-50 to-white dark:from-orange-950 dark:to-background',
    iconBg: 'bg-orange-100 dark:bg-orange-900',
    iconColor: 'text-orange-600 dark:text-orange-400',
    valueColor: 'text-orange-700 dark:text-orange-400',
  },
  red: {
    border: 'border-l-red-500',
    gradient: 'from-red-50 to-white dark:from-red-950 dark:to-background',
    iconBg: 'bg-red-100 dark:bg-red-900',
    iconColor: 'text-red-600 dark:text-red-400',
    valueColor: 'text-red-700 dark:text-red-400',
  },
};

export function StatCard({ title, value, icon: Icon, description, color = 'blue' }: StatCardProps) {
  const colors = colorClasses[color];
  
  return (
    <Card className={`fade-in transition-all hover:shadow-xl border-l-4 ${colors.border} bg-gradient-to-br ${colors.gradient}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colors.iconBg}`}>
          <Icon className={`h-5 w-5 ${colors.iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${colors.valueColor}`}>{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}
