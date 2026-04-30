import React, { useState } from "react";

const Navbar = ({ activeView, setActiveView, cartCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (view) => {
    setActiveView(view);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="overlay" onClick={() => setIsOpen(false)}></div>
      )}

      <nav className="navbar">
        <div className="navbar-container">
          <img
            src="https://res.cloudinary.com/db8e98ggo/image/upload/v1731124196/Que_esperas_._dqfhgg.png"
            alt="Logo"
            className="logo"
          />

          <button
            className="hamburger"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Abrir menú"
            style={{ color: "white" }}
          >
            {isOpen ? "✕" : "☰"}
          </button>

          <div className={`nav-links ${isOpen ? "open" : ""}`}>
            <button
              className={activeView === "menu" ? "active" : ""}
              onClick={() => handleNavClick("menu")}
            >
              🍽 Menú
            </button>
            <button
              className={activeView === "cart" ? "active" : ""}
              onClick={() => handleNavClick("cart")}
              style={{ position: "relative" }}
            >
              🛒 Carrito
              {cartCount > 0 && (
                <span className="nav-cart-badge">{cartCount}</span>
              )}
            </button>
            <button
              className={activeView === "Pedidos" ? "active" : ""}
              onClick={() => handleNavClick("Pedidos")}
            >
              📦 Pedidos
            </button>
            <button
              className={activeView === "Lealtad" ? "active" : ""}
              onClick={() => handleNavClick("Lealtad")}
            >
              🎁 Premios
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
