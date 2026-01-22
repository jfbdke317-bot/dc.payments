import { pgTable, text, serial, timestamp, varchar, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  paymentId: varchar("payment_id").notNull(),
  paymentStatus: varchar("payment_status").notNull(),
  payAddress: varchar("pay_address"),
  payAmount: numeric("pay_amount"),
  payCurrency: varchar("pay_currency"),
  orderDescription: text("order_description"),
  userId: varchar("user_id").notNull(), // Discord User ID
  productId: varchar("product_id").notNull(),
  paymentMethod: varchar("payment_method").default("default"), // 'default' or 'moneymotion'
  moneymotionId: varchar("moneymotion_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
