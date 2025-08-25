const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

admin.initializeApp();
const db = admin.firestore();

const app = express();

const PAYPHONE_TOKEN = process.env.PAYPHONE_TOKEN;
const STORE_ID = process.env.STORE_ID;
const TAX_RATE = parseFloat(process.env.TAX_RATE || "0.12"); // IVA 12%
const toCents = (n) => Math.round(Number(n) * 100);

// CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://tu-app.netlify.app" // cambia por tu dominio
  ],
  methods: ["GET","POST","OPTIONS"],
  credentials: true
}));
app.use(express.json());

/**
 * Crear orden
 */
app.post("/create-order", async (req, res) => {
  try {
    const { cart, form, metodo } = req.body;
    if (!cart || cart.length === 0) return res.status(400).json({ error: "Carrito vacío" });

    let amountWithoutTax = 0;
    let tax = 0;
    const service = 0;
    const tip = 0;

    cart.forEach(item => {
      const priceUSD = Number(item.precioVenta) || 0;
      const qty = Number(item.cantidad) || 1;
      const totalItemCents = Math.round(priceUSD * qty * 100);
      const itemTax = Math.round(totalItemCents * 0.18); // 18% impuesto
      const itemWithoutTax = totalItemCents - itemTax;

      amountWithoutTax += itemWithoutTax;
      tax += itemTax;
    });

    const amount = amountWithoutTax + tax + service + tip;

    const clientTransactionId = `order_${uuidv4()}`;
    const docRef = await db.collection("orders").add({
      clientTransactionId,
      cart,
      form,
      metodo,
      amount,
      amountWithoutTax,
      tax,
      service,
      tip,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
console.log(amount,"catida");
console.log(tax,"impuesto");
console.log(amountWithoutTax,"valor sin impuestos");

    res.json({
      clientTransactionId,
      amount,
      amountWithoutTax,
      tax,
      service,
      tip,
      currency: "USD",
      storeId: STORE_ID,
      token: PAYPHONE_TOKEN,
      reference: `Pedido-${clientTransactionId}`,
      orderId: docRef.id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Confirmar pago
 */
app.post("/confirm", async (req, res) => {
  try {
    const { id, clientTxId } = req.body;
    if (!id || !clientTxId) return res.status(400).json({ error: "id y clientTxId requeridos" });

    const fetch = require("node-fetch");
    const resp = await fetch("https://pay.payphonetodoesposible.com/api/button/V2/Confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `bearer ${PAYPHONE_TOKEN}`
      },
      body: JSON.stringify({ id: Number(id), clientTxId })
    });
    const data = await resp.json();

    // Actualizar Firestore
    const q = await db.collection("orders").where("clientTransactionId","==",clientTxId).limit(1).get();
    if (!q.empty) {
      const doc = q.docs[0];
      await doc.ref.update({
        status: data?.status || "unknown",
        payphoneResponse: data,
        confirmedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.json({ ok: true, data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

exports.api = functions.https.onRequest(app);
