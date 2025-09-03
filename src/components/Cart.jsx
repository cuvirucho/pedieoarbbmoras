import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const Cart = ({ cart, onAdd, onRemove, onClear, setActiveView, activeView }) => {
  const total = cart.reduce((sum, i) => sum + i.precioVenta * i.cantidad, 0);



const iva = total * 0.18;
 const totalConIva = total + iva;
  return (
    
    
    <article className="concarful"   >

    

    <div className="cart-container">
      
      
      
      {cart.length === 0 && (
        <>
          <p className="empty">🛒 Tu carrito está vacío</p>
          <button className="btn-primary" onClick={() => setActiveView("menu")}>
            Ver el menú
          </button>
        </>
      )}

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
              <p className="item-name">{item.nombre}</p>
              {item.opciones && Object.keys(item.opciones).length > 0 && (
                <ul className="item-options">
                  {Object.entries(item.opciones).map(([key, value]) => (
                    <li className="caroption"    key={key}>
                      <strong  className="iremelc"  >{key}</strong>
                      <p>

                       {value}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="cart-item-controls">
           <p    >Cantidad </p>
       
       
       
           <div className="cart-item-controls2"   >

           
              <button     onClick={() => onRemove(item)} className="iconminus">
                -
              </button>
              <motion.span
                key={item.cantidad}
                className="quantity"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {item.cantidad}
              </motion.span>
              <button onClick={() => onAdd(item)} className="btn-icon">
                +
              </button>
           
           
</div>


           
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

   
    </div>





   {cart.length > 0 && (
 <div className="cart-footer">

 <div className="cart-total">
    <div className="row">
      <span className="label">Sub total:</span>
      <span className="amount">${total.toFixed(2)}</span>
    </div>
    <div className="row">
      <span className="label">IVA:</span>
      <span className="amount">${iva.toFixed(2)}</span>
    </div>
    <div className="row total-row">
      <span className="label">Total:</span>
      <span className="amount">${totalConIva.toFixed(2)}</span>
    </div>
</div>

     
     <div  className="cotebtcgop" >

     
      
          <button className="btn-primary" onClick={() => setActiveView("menu")}>
            Agregar más items
          </button>
            <button className="btn-primary" onClick={() => setActiveView("checkout")}>
            Continuar
          </button>
        </div>
      
      
      
        </div>
      )}




</article>
  );
};

export default Cart;
