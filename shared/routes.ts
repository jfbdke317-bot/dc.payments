import { z } from "zod";
import { insertInvoiceSchema, invoices } from "./schema";

export const api = {
  invoices: {
    list: {
      method: "GET",
      path: "/api/invoices",
      responses: {
        200: z.array(z.custom<typeof invoices.$inferSelect>()),
      },
    },
    create: {
      method: "POST",
      path: "/api/invoices",
      input: insertInvoiceSchema,
      responses: {
        201: z.custom<typeof invoices.$inferSelect>(),
      },
    },
  },
};
