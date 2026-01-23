import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { setupDiscordBot, handlePaymentConfirmed } from "./discord";
import { api } from "@shared/routes";
import { z } from "zod";
import crypto from "crypto";
import axios from "axios";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  console.log("ROUTES_INIT: Registering routes and starting bot...");
  // Initialize Discord Bot
  try {
    setupDiscordBot();
    console.log("BOT_SETUP_CALLED: Initialized successfully.");
  } catch (err) {
    console.error("Error during setupDiscordBot:", err);
  }

  // Webhook for Moneymotion
  app.post("/moneymotion-webhook", async (req, res) => {
    const { order_id, status } = req.body;
    const sig = req.headers["x-moneymotion-sig"];
    
    console.log(`Moneymotion webhook received: ${order_id} - ${status}`);

    if (process.env.MONEYMOTION_WEBHOOK_SECRET && sig) {
      const hmac = crypto.createHmac("sha256", process.env.MONEYMOTION_WEBHOOK_SECRET);
      hmac.update(JSON.stringify(req.body));
      const expectedSignature = hmac.digest("hex");
      
      if (sig !== expectedSignature) {
        console.warn("Invalid signature from Moneymotion");
      }
    }

    if (status === "paid" || status === "completed") {
      await storage.updateInvoiceStatus(order_id, "confirmed");
      await handlePaymentConfirmed(order_id);
    } else {
      await storage.updateInvoiceStatus(order_id, status);
      await handlePaymentConfirmed(order_id);
    }

    res.sendStatus(200);
  });

  // Webhook for NOWPayments
  app.post("/nowpayments", async (req, res) => {
    const sig = req.headers["x-nowpayments-sig"];
    const body = JSON.stringify(req.body, Object.keys(req.body).sort());
    
    if (!process.env.NOWPAYMENTS_IPN_SECRET) {
      console.error("IPN Secret missing");
      return res.sendStatus(500);
    }

    const hmac = crypto.createHmac("sha512", process.env.NOWPAYMENTS_IPN_SECRET);
    hmac.update(body);
    const signature = hmac.digest("hex");

    if (signature !== sig) {
      console.warn("Invalid signature from NOWPayments");
    }

    const { payment_status, payment_id } = req.body;

    if (payment_status === "confirmed" || payment_status === "finished") {
      await storage.updateInvoiceStatus(payment_id, payment_status);
      await handlePaymentConfirmed(payment_id);
    } else if (payment_id) {
      await storage.updateInvoiceStatus(payment_id, payment_status);
    }

    res.sendStatus(200);
  });

  app.get("/api/health", (req, res) => {
    res.send("✅ Webhook server is running!");
  });

  // API Routes
  app.get(api.invoices.list.path, async (req, res) => {
    const invoices = await storage.getAllInvoices();
    res.json(invoices);
  });

  app.post(api.invoices.create.path, async (req, res) => {
    try {
      const input = api.invoices.create.input.parse(req.body);
      const invoice = await storage.createInvoice(input);
      
      if (req.body.paymentMethod === "moneymotion") {
        if (!process.env.MONEYMOTION_API_KEY) {
          return res.status(500).json({ message: "Moneymotion API key not configured" });
        }

        try {
          const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
          
          const priceInCents = Math.round(Number(input.payAmount) * 100);

          const response = await axios.post("https://api.moneymotion.io/checkoutSessions.createCheckoutSession", {
            json: {
              description: input.orderDescription,
              urls: {
                success: `${baseUrl}/success?payment_id=${invoice.paymentId}`,
                cancel: `${baseUrl}/cancel`,
                failure: `${baseUrl}/cancel`
              },
              userInfo: {
                email: "customer@web.user"
              },
              lineItems: [
                {
                  name: input.orderDescription || "Product",
                  description: input.orderDescription || "Product Description",
                  pricePerItemInCents: priceInCents,
                  quantity: 1
                }
              ]
            }
          }, {
            headers: {
              "X-API-Key": process.env.MONEYMOTION_API_KEY,
              "Content-Type": "application/json"
            }
          });

          const sessionId = response.data?.result?.data?.json?.checkoutSessionId;
          const paymentUrl = sessionId ? `https://moneymotion.io/checkout/${sessionId}` : null;

          if (!paymentUrl) {
             throw new Error("Invalid API Response from Moneymotion");
          }

          await storage.updateInvoiceStatus(invoice.paymentId, "pending");
          return res.status(201).json({ ...invoice, payment_url: paymentUrl });
        } catch (apiErr: any) {
          console.error("Moneymotion API Error:", apiErr.response?.data || apiErr.message);
          return res.status(500).json({ message: "Failed to create Moneymotion order" });
        }
      }

      res.status(201).json(invoice);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json(err);
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  return httpServer;
}
