import { useInvoices } from "@/hooks/use-invoices";
import { InvoicesTable } from "@/components/InvoicesTable";
import { StatusCard } from "@/components/StatusCard";
import { motion } from "framer-motion";
import { Bot, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: invoices, isLoading, refetch } = useInvoices();

  // Calculate some basic stats
  const totalRevenue = invoices?.reduce((acc, inv) => {
    if (inv.paymentStatus === 'confirmed' || inv.paymentStatus === 'finished') {
      return acc + Number(inv.payAmount || 0);
    }
    return acc;
  }, 0) || 0;

  const successfulOrders = invoices?.filter(
    inv => inv.paymentStatus === 'confirmed' || inv.paymentStatus === 'finished'
  ).length || 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[128px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary rounded-xl shadow-lg shadow-primary/25">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                Discord Payment Bot
              </h1>
            </div>
            <p className="text-muted-foreground text-lg ml-1">
              Manage your automated store and view real-time transactions.
            </p>
          </div>
          
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            className="group glass-panel hover:bg-secondary/50 border-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Refresh Data
          </Button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatusCard
            title="Bot Status"
            value="Online"
            status="active"
            icon="server"
            subtext="Last ping: Just now"
          />
          <StatusCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            status="active"
            icon="payment"
            subtext="Across all currencies"
          />
          <StatusCard
            title="Completed Orders"
            value={successfulOrders.toString()}
            status="active"
            icon="shield"
            subtext="Verified transactions"
          />
          <StatusCard
            title="Active Listings"
            value="4"
            status="active"
            icon="activity"
            subtext="Products available"
          />
        </div>

        {/* Recent Transactions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <InvoicesTable 
            invoices={invoices || []} 
            isLoading={isLoading} 
          />
        </motion.div>
      </div>
    </div>
  );
}
