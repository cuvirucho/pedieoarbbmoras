// src/pages/PaymentResult.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PaymentResult = () => {
  const q = useQuery();
  const [status, setStatus] = useState("Procesando...");
  useEffect(() => {
    const id = q.get("id");
    const clientTransactionId = q.get("clientTransactionId");
    if (!id || !clientTransactionId) { setStatus("Parámetros inválidos"); return; }
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: Number(id), clientTxId: clientTransactionId })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Error confirmando");
        // json.data contiene info de Payphone
        setStatus("Pago confirmado ✅");
      } catch (err) {
        console.error(err);
        setStatus("Error confirmando pago: " + (err.message || err));
      }
    })();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Resultado del pago</h2>
      <p>{status}</p>
    </div>
  );
};

export default PaymentResult;
