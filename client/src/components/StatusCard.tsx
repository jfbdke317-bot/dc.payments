import { motion } from "framer-motion";
import { Activity, Server, ShieldCheck, CreditCard } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string;
  icon: "activity" | "server" | "shield" | "payment";
  status?: "active" | "inactive" | "warning";
  subtext?: string;
}

const icons = {
  activity: Activity,
  server: Server,
  shield: ShieldCheck,
  payment: CreditCard,
};

export function StatusCard({ title, value, icon, status = "active", subtext }: StatusCardProps) {
  const Icon = icons[icon];
  
  const statusColors = {
    active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    inactive: "text-rose-400 bg-rose-400/10 border-rose-400/20",
    warning: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/10" />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-muted-foreground font-medium text-sm mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-foreground tracking-tight">{value}</h3>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-2 font-medium">{subtext}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${statusColors[status]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}
