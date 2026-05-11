import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import { Obtemenu } from "./fitbase/Obtemenu";
import { useLocation, useNavigate } from "react-router-dom";
import Pedidos from "./components/Pedidos";
import Tarjetadefidelida from "./Tarjetasdeifelida/Tarjetadefidelida";

const estaAbierto = () => {
  const ahora = new Date();
  const h = ahora.getHours();
  const m = ahora.getMinutes();
  const minutos = h * 60 + m;
  return minutos >= 7 * 60 + 30 && minutos < 11 * 60 + 30;
};

const Hom = () => {
  const [cart, setCart] = useState([]);
  const [activeView, setActiveView] = useState("menu"); // nuevo estado
  const [Menuac, setMenuac] = useState([]);
  const [abierto, setAbierto] = useState(estaAbierto);

  const addToCart = (item) => {
    const exist = cart.find(
      (x) =>
        x.nombre === item.nombre &&
        JSON.stringify(x.opciones) === JSON.stringify(item.opciones),
    );

    if (exist) {
      setCart(
        cart.map((x) =>
          x.nombre === item.nombre &&
          JSON.stringify(x.opciones) === JSON.stringify(item.opciones)
            ? { ...x, cantidad: x.cantidad + 1 }
            : x,
        ),
      );
    } else {
      setCart([...cart, { ...item, cantidad: 1 }]);
    }
  };

  const removeFromCart = (item) => {
    const exist = cart.find((x) => x.id === item.id);
    if (exist.cantidad === 1) {
      setCart(cart.filter((x) => x.id !== item.id));
    } else {
      setCart(
        cart.map((x) =>
          x.id === item.id ? { ...x, cantidad: x.cantidad - 1 } : x,
        ),
      );
    }
  };

  const clearCart = () => setCart([]);

  useEffect(() => {
    const cargarPlatos = async () => {
      try {
        const data = await Obtemenu("principamorasadmi@moritas.com");
        setMenuac(data || {});
      } catch (e) {
        console.error("Error cargando platos complejos:", e);
      }
    };
    cargarPlatos();
  }, []);

  // Recheck open/closed every minute
  useEffect(() => {
    const intervalo = setInterval(() => setAbierto(estaAbierto()), 60000);
    return () => clearInterval(intervalo);
  }, []);

  const navigate = useNavigate();

  const irADashboard = () => {
    navigate("/pgos"); // Redirige a la ruta /dashboard
  };

  const location = useLocation();
  const from = location.state?.from;

  // 👉 Si "from" existe, actualizar activeView automáticamente
  useEffect(() => {
    if (from) {
      setActiveView(from);
    }
  }, [from]);

  return (
    <div className="app">
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        cartCount={cart.reduce((s, i) => s + (i.cantidad || 1), 0)}
      />

      {!abierto ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 1.5rem",
            textAlign: "center",
            gap: "1.2rem",
            background: "var(--bg)",
          }}
        >
          <div
            style={{
              fontSize: "3.5rem",
              lineHeight: 1,
            }}
          >
            🌙
          </div>
          <h2
            style={{
              fontFamily: "TanHarmonie, serif",
              fontSize: "2rem",
              color: "var(--primary)",
              lineHeight: 1.2,
            }}
          >
            Estamos cerrados
          </h2>
          <p
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "1rem",
              color: "var(--text-secondary)",
              maxWidth: "320px",
            }}
          >
            Nuestro horario de pedidos es de <strong>7:30 a 11:30</strong>.
            <br />
            ¡Te esperamos mañana con mucho cariño! 💜
          </p>
          <button
            onClick={() => {
              const mensaje = encodeURIComponent(
                "Hola Moritas 🌸, ¿podrían abrir en la tarde? ¡Me encantaría hacer un pedido! 💜",
              );
              const numero = "593963200325";
              window.open(`https://wa.me/${numero}?text=${mensaje}`, "_blank");
            }}
            style={{
              marginTop: "0.5rem",
              padding: "0.75rem 2rem",
              background: "var(--primary-gradient)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-full)",
              fontSize: "0.95rem",
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "var(--shadow-primary)",
            }}
          >
            ¿Abren en la tarde? 💬
          </button>
        </div>
      ) : (
        <>
          {activeView === "menu" && (
            <Menu
              onAdd={addToCart}
              Menuac={Menuac}
              setActiveView={setActiveView}
            />
          )}
          {activeView === "cart" && (
            <Cart
              cart={cart}
              onAdd={addToCart}
              onRemove={removeFromCart}
              onClear={clearCart}
              activeView={activeView}
              setActiveView={setActiveView}
            />
          )}
          {activeView === "checkout" && (
            <Checkout cart={cart} setCart={setCart} />
          )}
          {activeView === "Pedidos" && <Pedidos />}
          {activeView === "Lealtad" && <Tarjetadefidelida />}
        </>
      )}

      <div className="foo">
        <p className="fimar1"> designed by TRISKEL</p>
        <p className="fimar1">Obten tu propia web </p>

        <button
          className="fimar1bt2"
          onClick={() => {
            const mensaje = encodeURIComponent(
              "Hola, quiero más información sobre la web",
            );
            const numero = "593963200325"; // Reemplaza con tu número de WhatsApp (con código de país)
            window.open(`https://wa.me/${numero}?text=${mensaje}`, "_blank");
          }}
        >
          Más info
        </button>
      </div>
    </div>
  );
};

export default Hom;
