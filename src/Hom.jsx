import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import { Obtemenu } from './fitbase/Obtemenu';
import { useNavigate } from 'react-router-dom';

const Hom = () => {
  const [cart, setCart] = useState([]);
  const [activeView, setActiveView] = useState("menu"); // nuevo estado
const [Menuac, setMenuac] = useState([]);
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);






const addToCart = (item) => {
  const exist = cart.find(
    (x) =>
      x.nombre === item.nombre &&
      JSON.stringify(x.opciones) === JSON.stringify(item.opciones)
  );

  if (exist) {
    setCart(
      cart.map((x) =>
        x.nombre === item.nombre &&
        JSON.stringify(x.opciones) === JSON.stringify(item.opciones)
          ? { ...x, cantidad: x.cantidad + 1 }
          : x
      )
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
      setCart(cart.map((x) =>
        x.id === item.id ? { ...x, cantidad: x.cantidad - 1 } : x
      ));
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







  const navigate = useNavigate();

  const irADashboard = () => {
    navigate("/pgos"); // Redirige a la ruta /dashboard
  };




  return (
    <div className="app">
    <Navbar activeView={activeView} setActiveView={setActiveView} />
<button onClick={irADashboard}>Ir a Checkout</button>


      {activeView === "menu" && <Menu onAdd={addToCart} Menuac={Menuac} />}
      {activeView === "cart" && (
        <Cart cart={cart} onAdd={addToCart} onRemove={removeFromCart} onClear={clearCart} activeView={activeView} setActiveView={setActiveView}   />
      )}
      {activeView === "checkout" && <Checkout cart={cart} />}





    </div>
  );
};

export default Hom;
