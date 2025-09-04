import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Carousel from "../utilidades/Carousel";
import { useNavigate } from "react-router-dom";

const Menu = ({ onAdd, Menuac,setActiveView }) => {
  const [busqueda, setBusqueda] = useState("");
  const [tipoSeleccionado, setTipoSeleccionado] = useState("todos");
  const [modalPlato, setModalPlato] = useState(null);
  const [selecciones, setSelecciones] = useState({});
  const [modalOriginPos, setModalOriginPos] = useState({ top: 0, left: 0 });
const [toast, setToast] = useState({ visible: false, top: 0, left: 0 });

  const platos = Object.entries(Menuac).map(([nombre, info]) => ({
    nombre,
    ...info
  }));

  const platosFiltrados = platos.filter((item) => {
    const nombreLower = item.nombre.toLowerCase();
    const busquedaLower = busqueda.toLowerCase();
    const coincideBusqueda = nombreLower.includes(busquedaLower);
    const coincideTipo = tipoSeleccionado === "todos" || item.tipo === tipoSeleccionado;
    return coincideBusqueda && coincideTipo;
  });

  const tiposUnicos = ["todos", ...new Set(platos.map(p => p.tipo))];


  const handleSeleccion = (item, opcion) => {
  setSelecciones((prev) => ({
    ...prev,
    [item]: opcion,
  }));
};



const handleAdd = (e) => {
  if (modalPlato) {
    const itemParaCarrito = {
      id: crypto.randomUUID(), 
      nombre: modalPlato.nombre,
      ingredientes: modalPlato.ingredientes,
      precioVenta: modalPlato.precioVenta, 
      opciones: selecciones,
    };

    onAdd(itemParaCarrito);
    setModalPlato(null);
    setSelecciones({});

    // Obtener posición del click para el toast
    const rect = e.currentTarget.getBoundingClientRect();
    setToast({ visible: true, top: rect.top, left: rect.left });

    setTimeout(() => setToast({ ...toast, visible: false }), 1500); // 1.5s
  setActiveView("cart")
  
  }
};




const openModal = (plato, e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  setModalOriginPos({ top: rect.top, left: rect.left });

  // Si el plato no tiene items, se agrega directo al carrito
  if (!plato.items || plato.items.length === 0) {
    const itemParaCarrito = {
     id: crypto.randomUUID(), 
      nombre: plato.nombre,
      ingredientes: plato.ingredientes,
      precioVenta: plato.precioVenta,
      opciones: {}, // no hay opciones
    };

    onAdd(itemParaCarrito);

    // Mostrar toast en la misma posición
    setToast({ visible: true, top: rect.top, left: rect.left });
    setTimeout(() => setToast({ visible: false, top: 0, left: 0 }), 1500);
    return;
  }

  // Si tiene items, abrir modal normalmente
  setModalPlato(plato);
  setSelecciones({});
};




// 🔹 Diccionario global de preguntas/opciones (100% definido por ti)
const preguntasOpciones = {
  "huevos": {
    pregunta: "¿Cómo quieres tus huevos?",
    opciones: ["Revueltos", "Fritos", "Tibios"],
  },
  "bebida caliente": {
    pregunta: "¿Qué tipo de bebida caliente prefieres?",
    opciones: ["Cafe", "Café con leche", "Té"],
  },
  "bebida fría": {
    pregunta: "¿Qué bebida fría prefieres?",
    opciones: ["Jugo", "batido", "Agua"],
  },
  Pancakes: {
    pregunta: "¿Prefieres Pancakes o Waffles?",
    opciones: ["Pancakes", "Waffles"],
  },
};




// 👉 arrastrar con el mouse SOLO en desktop


const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0)



const handleMouseDown = (e) => {
    if (window.innerWidth <= 468) return; // móvil usa scroll normal
    isDown.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // velocidad
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

///envia ajpmre 
const navigate = useNavigate();

 const gopog = () => {
  navigate("/pgos");
};






  return (
    <div className="menu">
    
    <section>

<img className="imgbibe" src="https://res.cloudinary.com/db8e98ggo/image/upload/v1757026062/hermano_Miguel_y_calle_larga_1_a9yogc.png" alt="" />


    </section>
   
<p  className="titulo"  >Nuesto menu</p>


      <input
        type="text"
        placeholder="Buscar plato..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="menu-busqueda"
      />

      <div className="menu-tipos">
        {tiposUnicos.map(tipo => (
          <button
            key={tipo}
            onClick={() => setTipoSeleccionado(tipo)}
            className={`tipo-btn ${tipoSeleccionado === tipo ? "activo" : ""}`}
          >
            {tipo}
          </button>
        ))}
      </div>

        <div
        className="menuconte"
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}

      >
        {platosFiltrados.length > 0 ? (
          <AnimatePresence>
            {platosFiltrados.map((plato, index) => (
              <motion.div
                key={plato.nombre}
                className="menu-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 20px rgba(103, 27, 224, 0.87)",
                }}
                style={{ minWidth: "250px", flexShrink: 0 }} // 👈 ancho fijo para que se vea en horizontal
              >
                {/* tu card tal cual */}
                <div>
                  <Carousel
                    images={plato.IMAGENES || []}
                    autoPlay
                    interval={8000}
                    showArrows
                    showDots
                    loop
                    aspectRatio="0 / 0"
                  />
                </div>

                <div className="dtospato1">
                  <h3 className="nombre-plato">{plato.nombre}</h3>
                  <p className="precio">{plato.precioVenta.toFixed(2)}</p>
                </div>
                <p className="decrolpt">{plato.descripcion}</p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => openModal(plato, e)}
                  className="menu-cardbutt"
                >
                  Seleccionar
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <p>No se encontraron platos</p>
        )}
      </div>

      <AnimatePresence>
        {modalPlato && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalPlato(null)}
          >
            <motion.div
              className="modal"
              initial={{
                scale: 0.5,
                x: modalOriginPos.left,
                y: modalOriginPos.top,
                opacity: 0
              }}
              animate={{ scale: 1, x: 0, y: 0, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
            
            
            
            

            
            
              <h2 className="modal-titulo">{modalPlato.nombre}</h2>
           










{modalPlato.items?.map((itemName) => {
  const config = preguntasOpciones[itemName]; // buscamos configuración
  if (!config) return null; // ⛔ si no existe, no se muestra nada

  return (
    <div key={itemName} className="modal-item">
      <label>{config.pregunta}</label>
      <div className="opciones-botones">
        {config.opciones.map((opt) => (
          <motion.button
            key={opt}
            className={`opcion-btn ${selecciones[itemName] === opt ? "activo" : ""}`}
            onClick={() => handleSeleccion(itemName, opt)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
})}


           
           
           
           
           
           
           
           
           
           
           
              <div className="modal-buttons">
<motion.button
  className="add-btn"
  onClick={(e) => handleAdd(e)}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Añadir al carrito
</motion.button>

            
            
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

   





<AnimatePresence>
  {toast.visible && (
    <motion.div
      className="toast-popup"
      initial={{ opacity: 0, y: 400, scale: 0.8 }}
      animate={{ opacity: 1, y: -10, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.8 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed",
        top: toast.top,
        left: toast.left,
        background: "blueviolet",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        zIndex: 9999,
      }}
    >
      ¡Tu producto fue agregado!
    </motion.div>
  )}
</AnimatePresence>










    </div>
  );
};

export default Menu;
