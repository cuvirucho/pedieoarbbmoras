import React, { useState } from "react";

const Navbar = ({ activeView, setActiveView }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (view) => {
    setActiveView(view);
    setIsOpen(false);
  };

  return (
    <>
      {/* Fondo oscuro detrás del menú */}
      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}

      <nav className="navbar">
        <div className="navbar-container">
          <img
            src="https://res.cloudinary.com/db8e98ggo/image/upload/v1731124196/Que_esperas_._dqfhgg.png"
            alt="Logo"
            className="logo"
          />

          {/* Botón hamburguesa */}
          <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
            ☰
          </button>

          {/* Enlaces del menú */}
          <div className={`nav-links ${isOpen ? "open" : ""}`}>
            <button
              className={activeView === "menu" ? "active" : ""}
              onClick={() => handleNavClick("menu")}
            >
              Menu
            </button>
            <button
              className={activeView === "cart" ? "active" : ""}
              onClick={() => handleNavClick("cart")}
            >
              Carrito
            </button>
            <button
              className={activeView === "Pedidos" ? "active" : ""}
              onClick={() => handleNavClick("Pedidos")}
            >
              Pedidos
            </button>
            <button
              className={activeView === "Lealtad" ? "active" : ""}
              onClick={() => handleNavClick("Lealtad")}
            >
              Premios
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
