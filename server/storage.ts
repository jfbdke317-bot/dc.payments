import { type Invoice, type InsertInvoice } from "@shared/schema";

export interface IStorage {
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoiceByPaymentId(paymentId: string): Promise<Invoice | undefined>;
  updateInvoiceStatus(paymentId: string, status: string): Promise<Invoice | undefined>;
  getAllInvoices(): Promise<Invoice[]>;
}

export class MemStorage implements IStorage {
  private invoices: Map<number, Invoice>;
  private currentId: number;

  constructor() {
    this.invoices = new Map();
    this.currentId = 1;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentId++;
    const invoice: Invoice = {
      ...insertInvoice,
      id,
      paymentMethod: insertInvoice.paymentMethod ?? "default",
      moneymotionId: insertInvoice.moneymotionId ?? null,
      payAddress: insertInvoice.payAddress ?? null,
      payAmount: insertInvoice.payAmount ?? null,
      payCurrency: insertInvoice.payCurrency ?? null,
      orderDescription: insertInvoice.orderDescription ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async getInvoiceByPaymentId(paymentId: string): Promise<Invoice | undefined> {
    return Array.from(this.invoices.values()).find(
      (invoice) => invoice.paymentId === paymentId,
    );
  }

  async updateInvoiceStatus(paymentId: string, status: string): Promise<Invoice | undefined> {
    const invoice = await this.getInvoiceByPaymentId(paymentId);
    if (invoice) {
      const updatedInvoice = { ...invoice, paymentStatus: status, updatedAt: new Date() };
      this.invoices.set(invoice.id, updatedInvoice);
      return updatedInvoice;
    }
    return undefined;
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).sort((a, b) => 
      (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0)
    );
  }
}

export const storage = new MemStorage();
