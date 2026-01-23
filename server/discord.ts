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

// Map product codes to clean, human-readable names
const PRODUCT_NAMES: Record<string, string> = {
  "fivem_ready": "FiveM Ready Account",
  "discord_ready_fa": "Discord Full Access",
  "discord_token_ready": "Discord Token",
  "steam_ready": "Steam Account",
  "vpn_3m": "Cyberghost VPN (3 Months)",
  "vpn_6m": "Cyberghost VPN (6 Months)",
  "vpn_1y": "Cyberghost VPN (1 Year)"
};

// Optional: Add image URLs for your products here
const PRODUCT_IMAGES: Record<string, string> = {
  "fivem_ready": "https://imgur.com/example1.png", 
  "vpn_3m": "https://imgur.com/example2.png"
  // Add more as needed...
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

  console.log("BOT_INIT: Attempting to create Discord Client (PRODUCTION MODE)...");

  try {
    client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers,   
        GatewayIntentBits.GuildPresences  
      ],
      partials: [Partials.Channel, Partials.GuildMember, Partials.User],
      failIfNotExists: false,
      rest: { timeout: 60000 }
    });

    client.on("debug", (info) => console.log(`[DISCORD DEBUG] ${info}`));
    client.on("warn", (info) => console.warn(`[DISCORD WARN] ${info}`));
    client.on("error", (error) => console.error(`[DISCORD ERROR] ${error.message}`));
    
    client.once("ready", () => {
      console.log(`LOGGED_IN_SUCCESSFULLY: ${client.user?.tag}`);
      registerCommands().catch(err => console.error("Error registering commands:", err));
    });

    client.on("channelCreate", async (channel) => {
      const channelName = channel.name.toLowerCase();
      if (channel.isTextBased() && channelName.includes("buy-product")) {
        setTimeout(async () => {
          try {
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder().setCustomId("lang_en").setLabel("🇺🇸").setStyle(ButtonStyle.Primary),
              new ButtonBuilder().setCustomId("lang_de").setLabel("🇩🇪").setStyle(ButtonStyle.Primary),
              new ButtonBuilder().setCustomId("lang_fr").setLabel("🇫🇷").setStyle(ButtonStyle.Primary)
            );
            await channel.send({ content: "Select your language / Wähle deine Sprache / Choisis ta langue:", components: [row] });
          } catch (error) { console.error(error); }
        }, 2000);
      }
    });

    client.on("interactionCreate", async (interaction) => {
      try {
        if (interaction.isChatInputCommand() && interaction.commandName === "order") {
          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId("lang_en").setLabel("🇺🇸").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("lang_de").setLabel("🇩🇪").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("lang_fr").setLabel("🇫🇷").setStyle(ButtonStyle.Primary)
          );
          await interaction.reply({ content: "Select language:", components: [row], ephemeral: true });
        } else if (interaction.isButton()) {
          if (interaction.customId.startsWith("lang_")) {
            const lang = interaction.customId.replace("lang_", "");
            const locale = LOCALES[lang];
            const select = new StringSelectMenuBuilder()
              .setCustomId(`select_product_${lang}`)
              .setPlaceholder(locale.select_product)
              .addOptions(locale.products.map((p: any) => new StringSelectMenuOptionBuilder().setLabel(p.label).setValue(p.value).setDescription(p.description)));
            await interaction.update({ content: locale.please_select, components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)] });
          } else if (interaction.customId.startsWith("pay_")) {
            const parts = interaction.customId.split("_");
            const type = parts[1], lang = parts[parts.length - 1], quantity = parseInt(parts[parts.length - 2]), product = parts.slice(2, parts.length - 2).join("_");
            const locale = LOCALES[lang] || LOCALES.en;
            await interaction.deferReply({ ephemeral: true });
            try {
              let pricePerUnit = PRODUCT_PRICES[product] || 10;
              const currency = lang === "en" ? "USD" : "EUR";
              if (currency === "USD") pricePerUnit *= 1.09;
              const amount = quantity * pricePerUnit;
              let invoiceUrl = "", paymentId = "";
  
              if (type === "crypto") {
                const invoice = await createNOWPaymentsInvoice(amount, currency, product, interaction.user.id);
                paymentId = (invoice.payment_id || invoice.id).toString();
                invoiceUrl = invoice.invoice_url;
                await storage.createInvoice({ paymentId, paymentStatus: invoice.payment_status || "waiting", payAddress: invoice.pay_address || null, payAmount: invoice.pay_amount ? invoice.pay_amount.toString() : amount.toFixed(2), payCurrency: invoice.pay_currency || "BTC", orderDescription: `Order: ${product} x${quantity}`, userId: interaction.user.id, productId: product, paymentMethod: "crypto" });
                await interaction.editReply({ content: locale.invoice_created(invoiceUrl) });
              } else {
                paymentId = `MM-${Date.now()}-${interaction.user.id}`;
                const baseUrl = process.env.APP_URL || "https://dcpayments-production.up.railway.app";
                
                // Use the nice clean name if available, otherwise fallback to the code
                const cleanProductName = PRODUCT_NAMES[product] || product;
                const imageUrl = PRODUCT_IMAGES[product] || undefined;

                // --- TRPC MONEYMOTION IMPLEMENTATION ---
                console.log(`[MONEYMOTION] Creating Session (TRPC Style)...`);
                
                if (!process.env.MONEYMOTION_API_KEY) {
                    throw new Error("Missing MONEYMOTION_API_KEY in environment variables");
                }

                const priceInCents = Math.round(amount * 100);

                const response = await axios.post("https://api.moneymotion.io/checkoutSessions.createCheckoutSession", { 
                    json: {
                        description: `Order: ${cleanProductName} x${quantity}`,
                        urls: {
                            success: `${baseUrl}/success?payment_id=${paymentId}`,
                            cancel: `${baseUrl}/cancel`,
                            failure: `${baseUrl}/cancel`
                        },
                        userInfo: {
                            email: `${interaction.user.username}@discord.user` 
                        },
                        lineItems: [
                            {
                                name: cleanProductName,
                                description: `${quantity}x ${cleanProductName}`,
                                pricePerItemInCents: Math.round(priceInCents / quantity),
                                quantity: quantity,
                                imageUrl: imageUrl // Optional: Add this if Moneymotion supports it in this object
                            }
                        ]
                    }
                }, { 
                    headers: { 
                        "X-API-Key": process.env.MONEYMOTION_API_KEY, 
                        "Content-Type": "application/json",
                        "X-Currency": currency
                    } 
                });

                const sessionId = response.data?.result?.data?.json?.checkoutSessionId;
                
                if (sessionId) {
                    // Try to construct URL from session ID
                    invoiceUrl = `https://moneymotion.io/checkout/${sessionId}`; 
                } else {
                    console.error("[MONEYMOTION] Could not parse Session ID:", JSON.stringify(response.data));
                    throw new Error("Invalid API Response");
                }

                await storage.createInvoice({ paymentId, paymentStatus: "pending", payAddress: null, payAmount: amount.toFixed(2), payCurrency: currency, orderDescription: `Order: ${cleanProductName} x${quantity}`, userId: interaction.user.id, productId: product, paymentMethod: "moneymotion", moneymotionId: sessionId });
                await interaction.editReply({ content: locale.invoice_created(invoiceUrl) });
              }
            } catch (e: any) { 
                const errorMessage = e.response?.data ? JSON.stringify(e.response.data) : e.message;
                console.error("[PAYMENT ERROR]", errorMessage);
                // DEBUG: Show specific error to user
                await interaction.editReply({ content: `⚠️ **System Error**: ${errorMessage}\n\nBackup Link: https://coconuds.store` }); 
            }
          }
        } else if (interaction.isStringSelectMenu() && interaction.customId.startsWith("select_product_")) {
          const lang = interaction.customId.replace("select_product_", ""), locale = LOCALES[lang], selected = interaction.values[0];
          const modal = new ModalBuilder().setCustomId(`modal_quantity_${selected}_${lang}`).setTitle(locale.enter_quantity);
          const quantityInput = new TextInputBuilder().setCustomId("quantity").setLabel(locale.quantity_label(MINIMUM_AMOUNTS[selected])).setStyle(TextInputStyle.Short).setRequired(true);
          modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(quantityInput));
          await interaction.showModal(modal);
        } else if (interaction.isModalSubmit() && interaction.customId.startsWith("modal_quantity_")) {
          const parts = interaction.customId.split("_"), lang = parts[parts.length - 1], product = parts.slice(2, parts.length - 1).join("_"), locale = LOCALES[lang];
          const quantity = parseInt(interaction.fields.getTextInputValue("quantity"));
          if (isNaN(quantity) || quantity < MINIMUM_AMOUNTS[product]) return await interaction.reply({ content: locale.invalid_quantity(MINIMUM_AMOUNTS[product]), ephemeral: true });
          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(`pay_crypto_${product}_${quantity}_${lang}`).setLabel(locale.crypto).setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`pay_card_${product}_${quantity}_${lang}`).setLabel(locale.credit_card).setStyle(ButtonStyle.Primary)
          );
          await interaction.reply({ content: locale.please_select_payment, components: [row], ephemeral: true });
        }
      } catch (err) { console.error(err); }
    });

    console.log("BOT_INIT: Calling client.login()...");
    client.login(token)
      .then(() => console.log("BOT_LOGIN: Login promise resolved."))
      .catch(err => {
        console.error("FATAL: Discord Login Failed!");
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
    ipn_callback_url: `${process.env.APP_URL || "https://dcpayments-production.up.railway.app"}/nowpayments`,
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
      const embed = new EmbedBuilder()
        .setTitle(`💰 ${statusText}`)
        .setColor(statusText.includes("confirmed") ? 0x00FF00 : 0xFFA500)
        .addFields(
          { name: "User", value: `<@${invoice.userId}>`, inline: true },
          { name: "Product", value: invoice.orderDescription || "Unknown Product", inline: true },
          { name: "Amount", value: `${invoice.payAmount} ${invoice.payCurrency}`, inline: true },
          { name: "Payment ID", value: `\`${paymentId}\``, inline: false },
          { name: "Status", value: invoice.paymentStatus, inline: true }
        )
        .setTimestamp();

      await (channel as any).send({ embeds: [embed] });
    }
  } catch (error) { 
    console.error(`[DISCORD ERROR] Failed to send admin notification to channel ${adminChannelId}:`, error); 
  }
}
