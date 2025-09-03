import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentResult() {
  const [status, setStatus] = useState("Esperando pago...");
  const [dat, setDat] = useState(null);
  const [faloopafo, setfaloopafo] = useState(false);
  const API = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    const confirmPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      const clientTransactionId = params.get("clientTransactionId");

      if (!id || !clientTransactionId) return;

      setStatus("Confirmando pago...");

      try {
        const res = await fetch(`${API}/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, clientTxId: clientTransactionId }),
        });

        const data = await res.json();
        setDat(data);

        if (data?.data.transactionStatus === "Approved") {
          setStatus("✅ Pago confirmado");
        } else {
          setStatus("❌ Pago pendiente o fallido");
setfaloopafo(true)
        }
      } catch (err) {
        console.error(err);
        setStatus("❌ Error al confirmar el pago");
        setfaloopafo(true)
      }
    };

    confirmPayment();
  }, []);




///envia ajpmre 
const navigate = useNavigate();

 const ihome = () => {
  navigate("/", { state: { from: "Pedidos" } });
};









// Función para guardar en localStorage sin borrar lo anterior
const handleSave = () => {
  if (dat) {
    let stored = localStorage.getItem("paymentData");

    let dataArray;

    try {
      // Intentar parsear lo que ya está en localStorage
      dataArray = stored ? JSON.parse(stored) : [];
      
      // Si no es array, lo convierto en array
      if (!Array.isArray(dataArray)) {
        dataArray = [dataArray];
      }
    } catch (e) {
      // Si falla el parse, lo inicio vacío
      dataArray = [];
    }

    // Agregar el nuevo dato
    dataArray.push(dat);

    // Guardar otra vez
    localStorage.setItem("paymentData", JSON.stringify(dataArray));

    alert("Información agregada en localStorage ✅");
    ihome();
  } else {
    alert("No hay información para guardar ❌");
  }
};






console.log(dat);






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



const PAYPHONE_TOKEN = import.meta.env.PAYPHONE_TOKEN;
const STORE_ID = import.meta.env.STORE_ID;
const cart = dat?.cart || [];
const form = dat?.form || {};
const metodo = dat?.metodo || {};








  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
const [pagogo, setpagogo] = useState(false)





  const handleRetry = async () => {
    
    setfaloopafo(false)
    setpagogo(true)
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

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };







console.log(dat);









  return (
    <div className="ticket-container">
      <h1 className="status">{status}</h1>

      {dat?.data.transactionStatus === "Approved" && (
        <div className="ticket">
          <h2>Moritas cafe</h2>
          <p>Referencia: {dat.data.reference}</p>
          <p>Fecha: {new Date(dat.data.date).toLocaleString()}</p>
          <p>Cliente: {dat.data.optionalParameter4}</p>

          <hr />

          <h3>Carrito</h3>
          <ul>
            {dat.cart.map((item, i) => (
              <li key={i}>
                {item.cantidad}x {item.nombre} — ${item.precioVenta.toFixed(2)}
              </li>
            ))}
          </ul>

          <hr />

          <p>Monto total: <strong>${(dat.data.amount / 100).toFixed(2)}</strong></p>
          <p>Tarjeta: {dat.data.cardBrand} • ****{dat.data.lastDigits}</p>
          <p>Estado: {dat.data.transactionStatus}</p>
          <p>Email: {dat.data.email}</p>
          <p>Teléfono: {dat.data.phoneNumber}</p>


 <p className="cdrt"   >Código de Retiro: <strong>{dat.retiroCode}</strong></p>






          {/* Botón para guardar en localStorage */}
          <button 
            onClick={handleSave} 
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "blueviolet",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            Confirmar
          </button>
       
       
       
       
       
       
       

       
       
       
       
       
       
       
       
       
       
       
       
        </div>
      )}
    
    
       {dat?.data.transactionStatus === "Canceled" && (
  <button
    onClick={handleRetry}
    style={{
      marginTop: "20px",
      padding: "10px 20px",
      backgroundColor: "crimson",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "16px",
    }}
  >
    Reintentar pago
  </button>
)}




     <div id="pp-button" className="checkout-payphone"></div>
    
    
    
    </div>
  );
}
