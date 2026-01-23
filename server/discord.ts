import { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, ButtonBuilder, ButtonStyle } from "discord.js";
import axios from "axios";
import { storage } from "./storage";
import "dotenv/config";

const MINIMUM_AMOUNTS: Record<string, number> = {
  "fivem_ready": 3, "discord_ready_fa": 4, "discord_token_ready": 5, "steam_ready": 4, "vpn_3m": 1, "vpn_6m": 1, "vpn_1y": 1
};

const PRODUCT_PRICES: Record<string, number> = {
  "fivem_ready": 0.25, "discord_ready_fa": 0.20, "discord_token_ready": 0.05, "steam_ready": 0.20, "vpn_3m": 5, "vpn_6m": 10, "vpn_1y": 20
};

const LOCALES: Record<string, any> = {
  en: {
    welcome: "Welcome to your ticket! Please select your language:",
    select_product: "Select a product",
    please_select: "Please select a product:",
    enter_quantity: "Enter Quantity",
    select_payment: "Select Payment Method",
    please_select_payment: "Please select how you want to pay:",
    crypto: "Crypto (NOWPayments)",
    credit_card: "Credit Card (Moneymotion)",
    quantity_label: (min: number) => `Quantity (Min: ${min})`,
    invalid_quantity: (min: number) => `Invalid quantity! The minimum is ${min}.`,
    invoice_created: (url: string) => `Invoice created! Please pay here: ${url}`,
    error_invoice: "Error creating invoice. Please try again later.",
    payment_confirmed: (user: string, desc: string) => `Payment confirmed! User <@${user}> paid for ${desc}.`,
    products: [
      { label: "FiveM Ready ($0.25, min 3)", value: "fivem_ready", description: "FiveM accounts" },
      { label: "Discord Ready (FA) ($0.20, min 4)", value: "discord_ready_fa", description: "Full Access Discord accounts" },
      { label: "Discord Token Ready ($0.05, min 5)", value: "discord_token_ready", description: "Token ready accounts" },
      { label: "Steam Ready ($0.20, min 4)", value: "steam_ready", description: "Steam accounts" },
      { label: "VPN Cyberghost 3 Months ($5)", value: "vpn_3m", description: "3 Months VPN" },
      { label: "VPN Cyberghost 6 Months ($10)", value: "vpn_6m", description: "6 Months VPN" },
      { label: "VPN Cyberghost 1 Year ($20)", value: "vpn_1y", description: "1 Year VPN" },
    ]
  },
  de: {
    welcome: "Willkommen in deinem Ticket! Bitte wähle deine Sprache:",
    select_product: "Produkt auswählen",
    please_select: "Bitte wähle ein Produkt aus:",
    enter_quantity: "Menge eingeben",
    select_payment: "Zahlungsmethode auswählen",
    please_select_payment: "Bitte wähle aus, wie du bezahlen möchtest:",
    crypto: "Kryptowährung (NOWPayments)",
    credit_card: "Kreditkarte (Moneymotion)",
    quantity_label: (min: number) => `Menge (Min: ${min})`,
    invalid_quantity: (min: number) => `Ungültige Menge! Das Minimum ist ${min}.`,
    invoice_created: (url: string) => `Rechnung erstellt! Bitte hier bezahlen: ${url}`,
    error_invoice: "Fehler beim Erstellen der Rechnung. Bitte versuche es später erneut.",
    payment_confirmed: (user: string, desc: string) => `Zahlung bestätigt! Nutzer <@${user}> hat für ${desc} bezahlt.`,
    products: [
      { label: "FiveM Ready (€0.25, min 3)", value: "fivem_ready", description: "FiveM Accounts" },
      { label: "Discord Ready (FA) (€0.20, min 4)", value: "discord_ready_fa", description: "Full Access Discord Accounts" },
      { label: "Discord Token Ready (€0.05, min 5)", value: "discord_token_ready", description: "Token Ready Accounts" },
      { label: "Steam Ready (€0.20, min 4)", value: "steam_ready", description: "Steam Accounts" },
      { label: "VPN Cyberghost 3 Monate (€5)", value: "vpn_3m", description: "3 Monate VPN" },
      { label: "VPN Cyberghost 6 Monate (€10)", value: "vpn_6m", description: "6 Monate VPN" },
      { label: "VPN Cyberghost 1 Jahr (€20)", value: "vpn_1y", description: "1 Jahr VPN" },
    ]
  },
  fr: {
    welcome: "Bienvenue dans votre ticket ! Veuillez choisir votre langue :",
    select_product: "Sélectionner un produit",
    please_select: "Veuillez sélectionner un produit :",
    enter_quantity: "Entrez la quantité",
    select_payment: "Sélectionner le mode de paiement",
    please_select_payment: "Veuillez sélectionner comment vous souhaitez payer :",
    crypto: "Crypto (NOWPayments)",
    credit_card: "Carte de crédit (Moneymotion)",
    quantity_label: (min: number) => `Quantité (Min: ${min})`,
    invalid_quantity: (min: number) => `Quantité invalide ! Le minimum est ${min}.`,
    invoice_created: (url: string) => `Facture créée ! Veuillez payer ici : ${url}`,
    error_invoice: "Erreur lors de la création de la facture. Veuillez réessayer plus tard.",
    payment_confirmed: (user: string, desc: string) => `Paiement confirmé ! L'utilisateur <@${user}> a payé pour ${desc}.`,
    products: [
      { label: "FiveM Ready (0.25€, min 3)", value: "fivem_ready", description: "Comptes FiveM" },
      { label: "Discord Ready (FA) (0.20€, min 4)", value: "discord_ready_fa", description: "Comptes Discord Accès Total" },
      { label: "Discord Token Ready (0.05€, min 5)", value: "discord_token_ready", description: "Comptes Token Ready" },
      { label: "Steam Ready (0.20€, min 4)", value: "steam_ready", description: "Comptes Steam" },
      { label: "VPN Cyberghost 3 Mois (5€)", value: "vpn_3m", description: "3 Mois de VPN" },
      { label: "VPN Cyberghost 6 Mois (10€)", value: "vpn_6m", description: "6 Mois de VPN" },
      { label: "VPN Cyberghost 1 An (20€)", value: "vpn_1y", description: "1 An de VPN" },
    ]
  }
};

let client: Client;

export function setupDiscordBot() {
  let token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error("CRITICAL ERROR: DISCORD_TOKEN is missing in environment variables.");
    return;
  }

  // Clean the token
  token = token.trim().replace(/^["']|["']$/g, '');

  console.log("BOT_INIT: Attempting to create Discord Client (DIAGNOSTIC MODE)...");

  try {
    client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        // GatewayIntentBits.MessageContent, // TEMPORARILY DISABLED FOR TESTING
        // GatewayIntentBits.GuildMembers,   // TEMPORARILY DISABLED FOR TESTING
        // GatewayIntentBits.GuildPresences  // TEMPORARILY DISABLED FOR TESTING
      ],
      partials: [Partials.Channel, Partials.GuildMember, Partials.User],
    });

    // Detailed Debug Logging
    client.on("debug", (info) => console.log(`[DISCORD DEBUG] ${info}`));
    client.on("warn", (info) => console.warn(`[DISCORD WARN] ${info}`));
    client.on("error", (error) => console.error(`[DISCORD ERROR] ${error.message}`));
    
    client.once("ready", () => {
      console.log(`LOGGED_IN_SUCCESSFULLY: ${client.user?.tag}`);
      registerCommands().catch(err => console.error("Error registering commands:", err));
    });

    console.log("BOT_INIT: Calling client.login()...");
    
    // Add a timeout race to detect hangs
    const loginPromise = client.login(token);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("LOGIN_TIMEOUT: Discord login took longer than 15 seconds")), 15000)
    );

    Promise.race([loginPromise, timeoutPromise])
      .then(() => console.log("BOT_LOGIN: Login success."))
      .catch(err => {
        console.error("FATAL: Discord Login Failed or Timed Out!");
        console.error(err);
      });

  } catch (err) {
    console.error("FATAL: Error initializing Discord Client constructor");
    console.error(err);
  }
}

async function registerCommands() {
  const token = process.env.DISCORD_TOKEN;
  if (!token || !client.user) return;
  const commands = [{ name: "order", description: "Start a new order" }];
  try {
    const { REST, Routes } = await import("discord.js");
    const rest = new REST({ version: "10" }).setToken(token);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log("Commands registered!");
  } catch (error) { console.error(error); }
}

async function createNOWPaymentsInvoice(amount: number, currency: string, product: string, userId: string) {
  const response = await axios.post("https://api.nowpayments.io/v1/invoice", {
    price_amount: amount, price_currency: currency, order_id: `ORDER-${Date.now()}-${userId}`, order_description: product,
    ipn_callback_url: `${process.env.APP_URL || `https://dc-payments.onrender.com`}/nowpayments`,
    success_url: "https://discord.com", cancel_url: "https://discord.com"
  }, { headers: { "x-api-key": process.env.NOWPAYMENTS_API_KEY!, "Content-Type": "application/json" } });
  return response.data;
}

export async function handlePaymentConfirmed(paymentId: string) {
  if (!client) return;
  const invoice = await storage.getInvoiceByPaymentId(paymentId);
  if (!invoice) return;
  const adminChannelId = process.env.ADMIN_CHANNEL_ID_2 || "1400259496668041296";
  try {
    const channel = await client.channels.fetch(adminChannelId);
    if (channel && "send" in channel) {
      const statusText = ["confirmed", "finished", "paid", "completed"].includes(invoice.paymentStatus) ? "Payment confirmed!" : `Update: ${invoice.paymentStatus}`;
      await (channel as any).send(`${statusText} User <@${invoice.userId}> paid for ${invoice.orderDescription}.`);
    }
  } catch (error) { console.error(error); }
}
