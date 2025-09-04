import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import { Obtemenu } from './fitbase/Obtemenu';
import { useLocation, useNavigate } from 'react-router-dom';
import Pedidos from './components/Pedidos';

const Hom = () => {
  const [cart, setCart] = useState([]);
  const [activeView, setActiveView] = useState("menu"); // nuevo estado
const [Menuac, setMenuac] = useState([]);
  








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





const location = useLocation();
  const from = location.state?.from;


// 👉 Si "from" existe, actualizar activeView automáticamente
  useEffect(() => {
    if (from) {
      setActiveView(from);
    }
  }, [from])


  return (
    <div className="app">
    <Navbar activeView={activeView} setActiveView={setActiveView} />


      {activeView === "menu" && <Menu onAdd={addToCart} Menuac={Menuac}   setActiveView={setActiveView}      />}
      {activeView === "cart" && (
        <Cart cart={cart} onAdd={addToCart} onRemove={removeFromCart} onClear={clearCart} activeView={activeView} setActiveView={setActiveView}   />
      )}
      {activeView === "checkout" && <Checkout cart={cart} setCart={setCart} />}

      {activeView === "Pedidos" && <Pedidos />}




<div className="foo"   >
  <p  className='fimar1'  > designed by TRISKEL</p>
  <p  className='fimar1'    >Obten tu propia web </p>

   <button
    className='fimar1bt2'
    onClick={() => {
      const mensaje = encodeURIComponent("Hola, quiero más información sobre la web");
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
