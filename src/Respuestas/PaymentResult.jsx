// src/pages/PaymentResult.jsx
import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "https://api-5fuw4avxea-uc.a.run.app";

function getQueryParams() {
  const q = new URLSearchParams(window.location.search);
  return {
    id: q.get("id"),
    clientTransactionId: q.get("clientTransactionId") || q.get("clientTxId") || q.get("client_tx_id")
  };
}

const PaymentResult = () => {
  const [status, setStatus] = useState("Procesando transacción...");
  const [debug, setDebug] = useState(null);

  useEffect(() => {
    const { id, clientTransactionId } = getQueryParams();
    if (!id || !clientTransactionId) {
      setStatus("Parámetros inválidos en la URL.");
      return;
    }

    (async () => {
      try {
        setStatus("Confirmando pago con el servidor...");
        const res = await fetch(`${API}/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // El backend que definimos espera { id, clientTxId }.
          body: JSON.stringify({ id: Number(id), clientTxId: clientTransactionId })
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || JSON.stringify(json));
        }

        // Actualiza UI según la respuesta (json.data contiene info de Payphone)
        setStatus("Pago confirmado ✅");
        setDebug(json);
      } catch (err) {
        console.error(err);
        setStatus("Error al confirmar el pago: " + (err.message || err));
      }
    })();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Resultado del pago</h2>
      <p>{status}</p>
      {debug && (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 12, background: "#f6f6f6", padding: 8 }}>
          {JSON.stringify(debug, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default PaymentResult;
