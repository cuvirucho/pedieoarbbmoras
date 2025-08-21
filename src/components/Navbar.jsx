import React from "react";

const Navbar = ({ activeView, setActiveView }) => {
  return (
    <nav className="navbar">
      <img
        src="https://res.cloudinary.com/db8e98ggo/image/upload/v1731124196/Que_esperas_._dqfhgg.png"
        alt="Logo"
        className="logo"
      />
    

      <div className="nav-links"   >
        <button
          className={activeView === "menu" ? "active" : ""}
          onClick={() => setActiveView("menu")}
        >
          Menu
        </button>
        <button
          className={activeView === "cart" ? "active" : ""}
          onClick={() => setActiveView("cart")}
        >
          Carrito
        </button>
        <button
          className={activeView === "Pedidos" ? "active" : ""}
          onClick={() => setActiveView("Pedidos")}
        >
          Pedidos
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
