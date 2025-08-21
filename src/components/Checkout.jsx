import React, { useState } from "react";

const Checkout = ({ cart }) => {
  const [metodo, setMetodo] = useState("hospedaje");
  const [form, setForm] = useState({
    hospedaje: "",
    fecha: "",
    hora: "",
    notas: "",
    whatsapp: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const enviarPedido = () => {
    if (cart.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    const pedido = {
      items: cart,
      metodo,
      ...form,
    };

    console.log("Pedido realizado:", pedido);
    alert("Pedido enviado con éxito ✅");
  };

  const total = cart.reduce((acc, item) => acc + (item.precioVenta * item.cantidad), 0);

  return (
    <div className="checkout">
      <h2 className="checkout-title">🛒 Finalizar Pedido</h2>

      {/* Resumen del pedido */}
      <div className={`checkout-resumen ${cart.length > 0 ? "show" : ""}`}>
        <h3>Resumen de tu pedido</h3>
        {cart.length === 0 ? (
          <p className="vacio">Tu carrito está vacío</p>
        ) : (
          <ul>
            {cart.map((item, i) => (
              <li key={i}>
                <span>{item.nombre} x{item.cantidad}</span>
                <span>${(item.precioVenta * item.cantidad).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="total">
          <strong>Total:</strong> ${total.toFixed(2)}
        </div>
      </div>

      {/* Formulario */}
      <div className="checkout-form">
        <label>Método de entrega:</label>
        <select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
          <option value="hospedaje">Entregar en hospedaje</option>
          <option value="local">Recoger en el local</option>
        </select>

        {metodo === "hospedaje" && (
          <input
            type="text"
            name="hospedaje"
            placeholder="Nombre del hospedaje o dirección"
            value={form.hospedaje}
            onChange={handleChange}
          />
        )}

        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
        />
        <input
          type="time"
          name="hora"
          value={form.hora}
          onChange={handleChange}
        />

        <textarea
          name="notas"
          placeholder="Notas adicionales"
          value={form.notas}
          onChange={handleChange}
        />

        <input
          type="text"
          name="whatsapp"
          placeholder="Número de WhatsApp"
          value={form.whatsapp}
          onChange={handleChange}
        />

        <button className="btn-enviar" onClick={enviarPedido}>
          Confirmar Pedido ✅
        </button>
      </div>
    </div>
  );
};

export default Checkout;
