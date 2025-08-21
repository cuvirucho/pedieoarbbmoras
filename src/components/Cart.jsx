import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const Cart = ({ cart, onAdd, onRemove, onClear,setActiveView ,activeView}) => {
  const total = cart.reduce((sum, i) => sum + i.precioVenta * i.cantidad, 0);

  return (
    <div className="cart">

      {cart.length === 0 && 
      <>
      <p className="empty">Tu carrito está vacío</p>
          <button
          className= "gpedis" 
          onClick={() => setActiveView("menu")}
        >
          Ver el menú
        </button>
      </>
      }

      <AnimatePresence>
        {cart.map((item) => (
          <motion.div
            key={item.id}
            className="cart-item"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="cart-item-info">
              <span className="item-name">{item.nombre}</span>

              {item.opciones && Object.keys(item.opciones).length > 0 && (
                <ul className="item-options">
                  {Object.entries(item.opciones).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {value}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="cart-item-controls">
              <button onClick={() => onRemove(item)} className="btn btn-remove">
                -
              </button>
              <motion.span
                key={item.cantidad} 
                className="quantity"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
               cantidad: {item.cantidad}
              </motion.span>
              <button onClick={() => onAdd(item)} className="btn btn-add">
                +
              </button>
            </div>

       
          </motion.div>
        ))}
      </AnimatePresence>

     
     
      {cart.length > 0 && (
        <div className="cart-footer">
         
            <button
          className= "fipedibtrn"
          onClick={() => setActiveView("checkout")}
        >
          ir a pagar
        </button>
        </div>
      )}



    </div>
  );
};

export default Cart;
