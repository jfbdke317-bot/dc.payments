import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Invoice } from "@shared/schema";
import { motion } from "framer-motion";
import { ShoppingBag, User, Calendar, ExternalLink } from "lucide-react";

interface InvoicesTableProps {
  invoices: Invoice[];
  isLoading: boolean;
}

export function InvoicesTable({ invoices, isLoading }: InvoicesTableProps) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading invoices...</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center border-dashed border-2 border-border/50">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">No invoices yet</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Transactions will appear here once users start purchasing products through the Discord bot.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl overflow-hidden border border-border/50"
    >
      <div className="p-6 border-b border-border/50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground">Real-time overview of bot sales</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
          {invoices.length} Total
        </Badge>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="w-[100px] font-semibold text-muted-foreground">ID</TableHead>
              <TableHead className="font-semibold text-muted-foreground">User</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Product</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Amount</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="font-semibold text-muted-foreground text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice, i) => (
              <TableRow 
                key={invoice.id} 
                className="hover:bg-muted/30 transition-colors border-border/50 group"
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{invoice.paymentId?.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">{invoice.userId}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {invoice.orderDescription || "Unknown Product"}
                </TableCell>
                <TableCell>
                  <span className="font-bold text-foreground">
                    {invoice.payAmount} {invoice.payCurrency?.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={invoice.paymentStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-sm">
                      {invoice.createdAt ? format(new Date(invoice.createdAt), "MMM d, HH:mm") : "-"}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    finished: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    waiting: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    expired: "bg-rose-500/15 text-rose-400 border-rose-500/20",
    failed: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  };

  const variant = styles[status] || "bg-slate-500/15 text-slate-400 border-slate-500/20";
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${variant}`}>
      {status}
    </span>
  );
}
