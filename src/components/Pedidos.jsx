import { QRCodeCanvas } from "qrcode.react";
import React, { useEffect, useState } from "react";

import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../fitbase/Firebase";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [toast, setToast] = useState(null); // <- estado para la notificación
  const userEmail = "principamorasadmi@moritas.com";
useEffect(() => {
  const storedData = localStorage.getItem("paymentData");
  if (storedData) {
    try {
      const paymentData = JSON.parse(storedData);
      // Filtramos solo Approved o entregado
      const filteredData = (Array.isArray(paymentData) ? paymentData : [paymentData])
        .filter(
          (pedido) =>
            pedido.entregado || pedido?.payphoneResponse?.transactionStatus === "Approved"
        );
      setPedidos(filteredData);
    } catch (error) {
      console.error("Error al parsear datos:", error);
    }
  }

  const q = query(collection(db, "usuarios", userEmail, "orders"));

  let prevPedidos = [];

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const updatedPedidos = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      // Filtramos aquí también
      .filter(
        (pedido) =>
          pedido.entregado || pedido?.payphoneResponse?.transactionStatus === "Approved"
      );

    // Detectar cambios de estado a "entregado"
    updatedPedidos.forEach((pedido) => {
      const oldPedido = prevPedidos.find((p) => p.id === pedido.id);
      if (oldPedido && !oldPedido.entregado && pedido.entregado) {
        setToast(`Pedido ${pedido.transactionId} ha sido entregado ✅`);
        setTimeout(() => setToast(null), 4000);
      }
    });

    prevPedidos = updatedPedidos;
    setPedidos(updatedPedidos);
    localStorage.setItem("paymentData", JSON.stringify(updatedPedidos));
  });

  return () => unsubscribe();
}, []);


console.log(pedidos);


  return (
    <div className="pedidos-container">
      <h1 className="titulo">📦 Mis Pedidos</h1>

      {toast && (
        <div className="toast-notification">
          {toast}
        </div>
      )}

      {pedidos.length === 0 ? (
        <p className="sin-pedidos">Todavía no has realizado pedidos 🚫</p>
      ) : (
        <div className="pedidos-conte">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="pedido-card">
              <div className="pedido-header">
                <h2 className="idepdi">ID: {pedido?.payphoneResponse?.transactionId||null}</h2>
                <span
                  className={`estado ${
                    pedido.entregado ? "entregado" : pedido?.payphoneResponse?.transactionStatus === "Approved" ? "aprobado" : "pendiente"
                  }`}
                >
                  {pedido.entregado ? "✅ Entregado" : pedido?.payphoneResponse?.transactionStatus || "Pendiente"}
                </span>
              </div>

              <div className="pedido-info">
                <p className="igopditex"   ><strong>Pedido para:</strong> {pedido?.payphoneResponse?.optionalParameter4|| "N/A"}</p>
                         <p className="modal-contentp"   ><strong>Fecha:</strong> {new Date(pedido?.payphoneResponse?.date).toLocaleString()}</p>

              </div>

              <button className="btn-ver-mas" onClick={() => setSelectedPedido(pedido)}>
                Ver más
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedPedido && (
        <div className="modal-overlay" onClick={() => setSelectedPedido(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="titulo"   >Detalles del Pedido</h2>
            <p className="modal-contentp"   ><strong>Cliente:</strong> {selectedPedido?.payphoneResponse?.optionalParameter4}</p>
            <p className="modal-contentp"   ><strong>Email:</strong> {selectedPedido?.payphoneResponse?.email}</p>
            <p className="modal-contentp"   ><strong>Teléfono:</strong> {selectedPedido?.payphoneResponse?.phoneNumber}</p>
            <p className="modal-contentp"   ><strong>Retiro Code:</strong> {selectedPedido.retiroCode}</p>

            <div style={{ textAlign: "center", margin: "15px 0" }}>
              <QRCodeCanvas
                value={selectedPedido.retiroCode}
                size={150}
                bgColor="#ffffff"
                fgColor="blueviolet"
                level="H"
                includeMargin={true}
              />
              <p style={{ fontSize: "14px", marginTop: "8px", color: "rgb(172, 139, 202)" }}>
                Escanea este código para validar el retiro
              </p>
            </div>

            <p className="modal-contentp"   ><strong>Estado:</strong> {selectedPedido.entregado ? "✅ Entregado" : selectedPedido?.payphoneResponse?.transactionStatus}</p>
            <p className="modal-contentp"   ><strong>Monto:</strong> ${selectedPedido.amount / 100}</p>
            <p className="modal-contentp"   ><strong>Fecha:</strong> {new Date(selectedPedido?.payphoneResponse?.date).toLocaleString()}</p>

            <h3 className="modal-contenth3">🛒 Productos</h3>
            <ul className="modal-contentul"    >
              {selectedPedido.cart?.map((item, i) => (
                <li className="modal-contentli"    key={i}>{item.cantidad} x {item.nombre}</li>
              ))}
            </ul>

            <button className="btn-cerrar" onClick={() => setSelectedPedido(null)}>❌ Cerrar</button>
          </div>
        </div>
      )}

  
    </div>
  );
};

export default Pedidos;
