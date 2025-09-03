import React, { useState } from "react";
import { Hotel, ShoppingCart, Store } from "lucide-react"; // íconos

import UberEatsGooglePicker from "../utilidades/mapma";


const API = import.meta.env.VITE_API_URL || "";

// Cargar CSS + SDK Payphone
const loadPayphoneAssets = () => {
  if (window.PPaymentButtonBox) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (!document.querySelector('link[href*="payphone-payment-box.css"]')) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css";
      document.head.appendChild(css);
    }
    if (!document.querySelector('script[src*="payphone-payment-box.js"]')) {
      const s = document.createElement("script");
      s.type = "module";
      s.src = "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js";
      s.onload = () => setTimeout(resolve, 200);
      s.onerror = (e) => reject(e);
      document.body.appendChild(s);
    } else {
      setTimeout(resolve, 100);
    }
  });
};

const Checkout = ({ cart = [] }) => {
  const [metodo, setMetodo] = useState("hospedaje");
  const [form, setForm] = useState({
    fecha: "", hora: "", notas: "", whatsapp: "", nombrecliente: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


const [pagogo, setpagogo] = useState(false)


 
  
  
  
  
  const handleChange = (e) => {
  const { name, value } = e.target;

  // Limpiar error de ese campo al escribir
  if (errors[name]) {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }

  setForm({ ...form, [name]: value });
};

  
  
  
  
  
  
  const total = cart.reduce((acc, i) => acc + Number(i.precioVenta) * Number(i.cantidad), 0);

















  const enviarPedido = async () => {
    setpagogo(true)
    setError(null);
    if (!cart.length) return setError("Carrito vacío");
    setLoading(true);
    try {
      const res = await fetch(`${API}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, form, metodo })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error creando orden");

      await loadPayphoneAssets();
const cfg = {
  token: json.token,
  clientTransactionId: json.clientTransactionId,
  amount: json.amount,
  amountWithTax: json.amountWithoutTax,
  tax: json.tax,
  currency: json.currency,
  storeId: json.storeId,
  reference: json.reference,
};

const container = document.getElementById("pp-button");
container.innerHTML = "";
window.ppbInstance = new window.PPaymentButtonBox(cfg).render("pp-button");

   
    } catch (err) {
      console.error(err);
      console.log(await res.json());

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };









  const [coords, setCoords] = useState(null);

const handleLocationSelect = (location) => {
  console.log("Ubicación recibida del hijo:", location);
  setCoords(location); // location es { lat, lng, address }


  if (errors.coords) {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.coords;
      return newErrors;
    });
  }

};



const muvopuntogps =() =>{
setCoords(null);
  
}


const iva = total * 0.18;
 const totalConIva = total + iva;



  





const [errors, setErrors] = useState({});



const validarForm = () => {
  let newErrors = {};

  if (!form.nombrecliente.trim()) {
    newErrors.nombrecliente = "Ingresa tu nombre";
  }

  if (!form.whatsapp || form.whatsapp.length !== 10) {
    newErrors.whatsapp = "Número inválido (10 dígitos)";
  }

  if (metodo === "hospedaje" && !coords) {
    newErrors.coords = "Debes seleccionar una ubicación";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0; // ✅ true si no hay errores
};

const handleCheckout = () => {
  setError(null);
  if (!validarForm()) return; // ❌ no avanza si falla
  enviarPedido(); // ✅ si pasa
};









console.log(form);



  return (

<>


{pagogo?
 <div id="pp-button" className="checkout-payphone"></div>
:
<div className="checkout-container">



<p className="tilirei"   >Metodo de retiro</p>

  <div className="metodo-container">
      <button
        className={`opcion ${metodo === "hospedaje" ? "activo" : ""}`}
        onClick={() => setMetodo("hospedaje")}
      >
        <Hotel size={20} style={{ marginRight: "8px" }} />
        Entregar a domicilio
      </button>

      <button
        className={`opcion ${metodo === "local" ? "activo" : ""}`}
        onClick={() => setMetodo("local")}
      >
        <Store size={20} style={{ marginRight: "8px" }} />
        Recoger en el local
      </button>
    </div>








  <div className="checkout-form">
   
 

    {metodo==="hospedaje" && (
     
     <>
     
     
  
     {/* Nombre */}
<div className="input-group">
  <input
    type="text"
    name="nombrecliente"
    placeholder="Escriba su nombre"
    value={form.nombrecliente}
    onChange={handleChange}
    className={errors.nombrecliente ? "input-error" : ""}
  />
  {errors.nombrecliente && (
    <p className="error-msg">{errors.nombrecliente}</p>
  )}
</div>

{/* WhatsApp */}
<div className="input-group">
  <input
    type="tel"
    name="whatsapp"
    placeholder="Número de teléfono"
    value={form.whatsapp}
    onChange={(e) => {
      const soloNumeros = e.target.value.replace(/[^0-9]/g, "");
      
      
      // Limpiar error de este campo
  if (errors.whatsapp) {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.whatsapp;
      return newErrors;
    });
  }
      
      
      setForm({ ...form, whatsapp: soloNumeros });
  
  

    }}
    maxLength={10}
    className={errors.whatsapp ? "input-error" : ""}
  />
  {errors.whatsapp && (
    <p className="error-msg">{errors.whatsapp}</p>
  )}
</div>










<section  className={errors.coords ? "input-error2" : ""}   >

{coords?

<article className="contefulubu"   >



 <div  className="congtebucselc"  >
   <p>
    
    Ubicación seleccionada
    </p>
   

  <p className="direccion"   >
   {coords.address}
    </p> 
  
  
  </div>





<button className="cambiar-ubicacion-btn" onClick={muvopuntogps}>Cambiar ubicación</button>



</article>
:

<UberEatsGooglePicker onLocationSelect={handleLocationSelect}      />
    

}




{metodo === "hospedaje" && errors.coords && (
  <p className="error-msg">{errors.coords}</p>
)}



</section>

    <textarea name="notas" placeholder="Referencias" value={form.notas} onChange={handleChange}/>
    
 

   
     </>
    
    
    
    )}
    



{metodo==="local" && (
  <>
   
  
   {/* Nombre */}
<div className="input-group">
  <input
    type="text"
    name="nombrecliente"
    placeholder="Escriba su nombre"
    value={form.nombrecliente}
    onChange={handleChange}
    className={errors.nombrecliente ? "input-error" : ""}
  />
  {errors.nombrecliente && (
    <p className="error-msg">{errors.nombrecliente}</p>
  )}
</div>


  {/* WhatsApp */}
<div className="input-group">
  <input
    type="tel"
    name="whatsapp"
    placeholder="Número de teléfono"
    value={form.whatsapp}
    onChange={(e) => {
      const soloNumeros = e.target.value.replace(/[^0-9]/g, "");
      setForm({ ...form, whatsapp: soloNumeros });
    }}
    maxLength={10}
    className={errors.whatsapp ? "input-error" : ""}
  />
  {errors.whatsapp && (
    <p className="error-msg">{errors.whatsapp}</p>
  )}
</div>



  </>
)}





 
    {error && <p className="checkout-error">{error}</p>}

 
 
 
 
 
   <h2 className="checkout-title">Detalles Pedido  <ShoppingCart size={20} style={{ marginRight: "8px" }} />


    </h2>

  <div className={`checkout-card ${cart.length>0?"show":""}`}>
    {cart.length===0 ? (
      <p className="checkout-empty">Tu carrito está vacío</p>
    ) : (
      <ul className="checkout-list">
        {cart.map((i, idx) => (
          <li key={idx} className="checkout-item">
            <span>{i.nombre} x{i.cantidad}</span>
            <span className="checkout-price">${(i.precioVenta*i.cantidad).toFixed(2)}</span>
          </li>
        ))}
      </ul>
    )}
    
     
    
       {cart.length > 0 && (
 <div className="cart-footer2">
  <div className="cart-total2">
    <div className="row2">
      <span className="label2">Sub total: </span>
      <span className="amount2">${total.toFixed(2)}</span>
    </div>
    <div className="row2">
      <span className="label2">IVA:</span>
      <span className="amount2">${iva.toFixed(2)}</span>
    </div>
    <div className="row2">
      <span className="label2">Total:</span>
      <span className="amount2">${totalConIva.toFixed(2)}</span>
    </div>
</div>

     
     
        
        </div>
      )}

  
  
  </div>
 
 
 
 
<button onClick={handleCheckout} disabled={loading} className="checkout-btn">
  {loading ? "Procesando..." : "Siguiente"}
</button>

   
  </div>
</div>

}










{loading?
<p  className="cargado"   >
  Cargando...
</p>
:null }








</>
  );
};

export default Checkout;
 