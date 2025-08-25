import React, { useState } from "react";

const API = import.meta.env.VITE_API_URL || "https://api-5fuw4avxea-uc.a.run.app";

// Cargar CSS + SDK Payphone
const loadPayphoneAssets = () => {
  if (window.PPaymentButtonBox) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (!document.querySelector('link[href*="payphone-payment-box.css"]')) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css";
      document.head.appendChild(css);
    }
    if (!document.querySelector('script[src*="payphone-payment-box.js"]')) {
      const s = document.createElement("script");
      s.type = "module";
      s.src = "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js";
      s.onload = () => setTimeout(resolve, 200);
      s.onerror = (e) => reject(e);
      document.body.appendChild(s);
    } else {
      setTimeout(resolve, 100);
    }
  });
};

const Checkout = ({ cart = [] }) => {
  const [metodo, setMetodo] = useState("hospedaje");
  const [form, setForm] = useState({
    hospedaje: "", fecha: "", hora: "", notas: "", whatsapp: "", email: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const total = cart.reduce((acc, i) => acc + Number(i.precioVenta) * Number(i.cantidad), 0);

  const enviarPedido = async () => {
    setError(null);
    if (!cart.length) return setError("Carrito vacío");
    setLoading(true);
    try {
      const res = await fetch(`${API}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, form, metodo })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error creando orden");

      await loadPayphoneAssets();
const cfg = {
  token: json.token,
  clientTransactionId: json.clientTransactionId,
  amount: json.amount,
  amountWithTax: json.amountWithoutTax,
  tax: json.tax,
  currency: json.currency,
  storeId: json.storeId,
  reference: json.reference,
};

const container = document.getElementById("pp-button");
container.innerHTML = "";
window.ppbInstance = new window.PPaymentButtonBox(cfg).render("pp-button");

   
    } catch (err) {
      console.error(err);
      console.log(await res.json());

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout">
      <h2>🛒 Finalizar Pedido</h2>

      <div className={`checkout-resumen ${cart.length>0?"show":""}`}>
        {cart.length===0 ? <p>Tu carrito está vacío</p> : (
          <ul>
            {cart.map((i, idx) => (
              <li key={idx}>{i.nombre} x{i.cantidad} = ${(i.precioVenta*i.cantidad).toFixed(2)}</li>
            ))}
          </ul>
        )}
        <strong>Total: ${total.toFixed(2)}</strong>
      </div>

      <div className="checkout-form">
        <label>Método de entrega</label>
        <select value={metodo} onChange={e=>setMetodo(e.target.value)}>
          <option value="hospedaje">Entregar en hospedaje</option>
          <option value="local">Recoger en el local</option>
        </select>

        {metodo==="hospedaje" && (
          <input type="text" name="hospedaje" placeholder="Nombre del hospedaje" value={form.hospedaje} onChange={handleChange}/>
        )}
        <input type="date" name="fecha" value={form.fecha} onChange={handleChange}/>
        <input type="time" name="hora" value={form.hora} onChange={handleChange}/>
        <textarea name="notas" placeholder="Notas adicionales" value={form.notas} onChange={handleChange}/>
        <input type="text" name="whatsapp" placeholder="WhatsApp sin +593" value={form.whatsapp} onChange={handleChange}/>
        <input type="email" name="email" placeholder="Email opcional" value={form.email} onChange={handleChange}/>

        {error && <p style={{color:"crimson"}}>{error}</p>}

        <button onClick={enviarPedido} disabled={loading}>
          {loading?"Procesando...":"Confirmar wPedido ✅"}
        </button>

        <div id="pp-button" style={{marginTop:16}}></div>
      </div>
    </div>
  );
};

export default Checkout;
