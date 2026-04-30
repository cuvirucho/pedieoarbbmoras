import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import React, { useState, useEffect, useRef } from "react";
import { db } from "../fitbase/Firebase";

function generarToken() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: 16 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

const PASOS = [
  { num: "1", texto: "Completa tus datos" },
  { num: "2", texto: "Recibe tu tarjeta gratis" },
  { num: "3", texto: "Acumula puntos por compra" },
  { num: "4", texto: "Canjea puntos por premios" },
];

function Tarjetadefidelida() {
  const [cliente, setCliente] = useState({
    nombre: "",
    telefono: "",
    puntos: 0,
    token: "",
    reclamados: [],
  });
  const [registrado, setRegistrado] = useState(false);
  const [premios, setPremios] = useState([]);
  const [mensajeInfo, setMensajeInfo] = useState("");
  const [cargando, setCargando] = useState(false);
  const sliderRef = useRef(null);

  const scrollPremios = (dir) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: dir * 110, behavior: "smooth" });
    }
  };

  const fotospormod = [
    "https://res.cloudinary.com/db8e98ggo/image/upload/v1753396321/3_v7ehbr.png",
    "https://res.cloudinary.com/db8e98ggo/image/upload/v1753396321/1_jhxl5l.png",
    "https://res.cloudinary.com/db8e98ggo/image/upload/v1753396321/5_rr09j9.png",
    "https://res.cloudinary.com/db8e98ggo/image/upload/v1753396321/2_wulqrl.png",
    "https://res.cloudinary.com/db8e98ggo/image/upload/v1753396321/4_zkyxzv.png",
  ];

  const cargarPremios = async () => {
    const snapshot = await getDocs(collection(db, "premios"));
    const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setPremios(lista);
  };

  useEffect(() => {
    cargarPremios();
    const telefonoGuardado = localStorage.getItem("clienteRegistrado");
    if (telefonoGuardado) {
      const unsubscribe = onSnapshot(
        doc(db, "clientes", telefonoGuardado),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCliente(data);
            setRegistrado(true);
            localStorage.setItem(telefonoGuardado, JSON.stringify(data));
          } else {
            setRegistrado(false);
          }
        },
      );
      return () => unsubscribe();
    }
  }, []);

  // Auto-ocultar mensaje después de 4s
  useEffect(() => {
    if (!mensajeInfo) return;
    const t = setTimeout(() => setMensajeInfo(""), 4000);
    return () => clearTimeout(t);
  }, [mensajeInfo]);

  const guardarCliente = async () => {
    const id = cliente.telefono.replace(/\s+/g, "");
    if (!id || !cliente.nombre.trim()) {
      setMensajeInfo("Por favor completa todos los campos.");
      return;
    }
    setCargando(true);
    try {
      const docRef = doc(db, "clientes", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCliente(data);
        setRegistrado(true);
        localStorage.setItem(id, JSON.stringify(data));
        localStorage.setItem("clienteRegistrado", id);
        setMensajeInfo(
          `¡Bienvenido de nuevo, ${data.nombre}! Hemos cargado tu tarjeta.`,
        );
      } else {
        const token = generarToken();
        const nuevoCliente = { ...cliente, puntos: 10, token, reclamados: [] };
        await setDoc(docRef, nuevoCliente);
        setCliente(nuevoCliente);
        setRegistrado(true);
        localStorage.setItem(id, JSON.stringify(nuevoCliente));
        localStorage.setItem("clienteRegistrado", id);
        setMensajeInfo("¡Tu tarjeta ha sido creada con éxito! 🎉");
      }
    } catch (error) {
      console.error("Error al verificar o guardar cliente:", error);
      setMensajeInfo("Hubo un error. Intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  const borrarDatosLocales = () => {
    localStorage.clear();
    setCliente({ nombre: "", telefono: "", puntos: 0, token: "" });
    setRegistrado(false);
  };

  return (
    <section className="loy-page">
      {/* ── HERO ── */}
      <div className="loy-hero">
        <img
          className="loy-hero-img"
          src="https://res.cloudinary.com/db8e98ggo/image/upload/v1761003448/hermano_Miguel_y_calle_larga_3_vdiwxn.png"
          alt="Logo del local"
        />
        <div className="loy-hero-overlay">
          <p className="loy-hero-tagline">
            Tu amor por lo delicioso merece premio.
          </p>
        </div>
      </div>

      {/* ── TOAST ── */}
      {mensajeInfo && (
        <div className="loy-toast">
          <span>{mensajeInfo}</span>
        </div>
      )}

      {/* ── BODY ── */}
      <div className="loy-body">
        {!registrado ? (
          <>
            {/* Pasos */}
            <div className="loy-card loy-steps-card">
              <p className="loy-section-title">¿Cómo funciona?</p>
              <div className="loy-steps">
                {PASOS.map((p) => (
                  <div key={p.num} className="loy-step">
                    <div className="loy-step-num">{p.num}</div>
                    <p className="loy-step-text">{p.texto}</p>
                  </div>
                ))}
              </div>
              {/* Preview de premios en modo no registrado */}
              {premios.length > 0 && (
                <div className="loy-preview-premios">
                  <div className="loy-preview-header">
                    <span className="loy-preview-icon">🎁</span>
                    <p className="loy-preview-title">
                      Premios que puedes ganar
                    </p>
                  </div>

                  <div className="loy-preview-scroll-wrapper">
                    <button
                      className="loy-scroll-btn loy-scroll-btn--left"
                      onClick={() => scrollPremios(-1)}
                      aria-label="Anterior"
                    >
                      ‹
                    </button>

                    <div className="loy-preview-cards" ref={sliderRef}>
                      {premios.map((premio) => (
                        <div key={premio.id} className="loy-preview-card">
                          <span className="loy-preview-card-emoji">🌟</span>
                          <span className="loy-preview-card-name">
                            {premio.nombre}
                          </span>
                          <span className="loy-preview-card-pts">
                            {premio.costo} pts
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      className="loy-scroll-btn loy-scroll-btn--right"
                      onClick={() => scrollPremios(1)}
                      aria-label="Siguiente"
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Formulario */}
            <div className="loy-form-card">
              {/* Preview animada de la tarjeta */}
              <div className="loy-card-preview">
                <div className="loy-card-preview-shine" />
                <div className="loy-card-preview-top">
                  <span className="loy-card-preview-label">
                    Tarjeta de Fidelidad
                  </span>
                  <span className="loy-card-preview-logo">★</span>
                </div>
                <p className="loy-card-preview-name">
                  {cliente.nombre || "Tu nombre aquí"}
                </p>
                <div className="loy-card-preview-bottom">
                  <span className="loy-card-preview-pts">0 puntos</span>
                  <div className="loy-card-preview-dots">
                    {[...Array(4)].map((_, i) => (
                      <span key={i} className="loy-card-preview-dot" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="loy-form-body">
                <p className="loy-form-title">Crea tu tarjeta gratis</p>
                <p className="loy-form-sub">
                  Acumula puntos y canjea premios en cada visita
                </p>

                <div className="loy-input-group">
                  <span className="loy-input-icon">👤</span>
                  <input
                    className="loy-input"
                    placeholder="Tu nombre"
                    value={cliente.nombre}
                    onChange={(e) =>
                      setCliente({ ...cliente, nombre: e.target.value })
                    }
                  />
                </div>
                <div className="loy-input-group">
                  <span className="loy-input-icon">📱</span>
                  <input
                    className="loy-input"
                    placeholder="Tu teléfono"
                    value={cliente.telefono}
                    onChange={(e) =>
                      setCliente({
                        ...cliente,
                        telefono: e.target.value.replace(/\s+/g, ""),
                      })
                    }
                  />
                </div>
                <button
                  className={`loy-btn loy-btn--full${
                    cargando ? " loy-btn--loading" : ""
                  }`}
                  onClick={guardarCliente}
                  disabled={cargando}
                >
                  {cargando ? (
                    <span className="loy-spinner" />
                  ) : (
                    <>
                      <span className="loy-btn-icon">✨</span> Crear mi tarjeta
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Tarjeta de fidelidad */}
            <div className="loy-fidelity-card">
              <div className="loy-fidelity-card-bg" />
              <div className="loy-fidelity-top">
                <p className="loy-fidelity-label">Tarjeta de Fidelidad</p>
                <p className="loy-fidelity-name">{cliente.nombre}</p>
                <p className="loy-fidelity-equiv">$1 = 5 puntos</p>
              </div>
              <div className="loy-fidelity-mid">
                <div className="loy-points-badge">
                  <span className="loy-points-num">{cliente.puntos}</span>
                  <span className="loy-points-label">puntos</span>
                </div>
                <div className="loy-qr-wrap">
                  <QRCodeSVG
                    size={130}
                    fgColor="#5b21b6"
                    bgColor="transparent"
                    value={`${cliente.telefono}|${cliente.token}`}
                  />
                </div>
              </div>
              <p className="loy-fidelity-hint">
                Muéstralo en caja para sumar puntos
              </p>
            </div>

            {/* Premios */}
            {premios.length > 0 && (
              <div className="loy-prizes-section">
                {/* Header con puntos totales */}
                <div className="loy-prizes-header">
                  <div className="loy-prizes-header-left">
                    <p className="loy-prizes-title">Tus Premios</p>
                    <p className="loy-prizes-sub">
                      Canjea tus puntos en el local
                    </p>
                  </div>
                  <div className="loy-prizes-pts-bubble">
                    <span className="loy-prizes-pts-num">{cliente.puntos}</span>
                    <span className="loy-prizes-pts-lbl">pts</span>
                  </div>
                </div>

                {/* Grid de tarjetas de premios */}
                <div className="loy-prizes-grid-new">
                  {premios.map((premio) => {
                    const yaReclamado = (cliente.reclamados || []).includes(
                      premio.nombre,
                    );
                    const progreso = Math.min(
                      (cliente.puntos / premio.costo) * 100,
                      100,
                    );
                    const puedeReclamar =
                      !yaReclamado && cliente.puntos >= premio.costo;
                    return (
                      <div
                        key={premio.id}
                        className={`loy-prize-card${
                          yaReclamado ? " loy-prize-card--claimed" : ""
                        }${puedeReclamar ? " loy-prize-card--ready" : ""}`}
                      >
                        {/* Sello de estado */}
                        {puedeReclamar && (
                          <div className="loy-prize-card-stamp loy-prize-card-stamp--ready">
                            ¡Listo para canjear!
                          </div>
                        )}
                        {yaReclamado && (
                          <div className="loy-prize-card-stamp loy-prize-card-stamp--done">
                            ✓ Reclamado
                          </div>
                        )}

                        {/* Icono */}
                        <div className="loy-prize-card-icon">
                          {yaReclamado ? "🎊" : puedeReclamar ? "🌟" : "🎁"}
                        </div>

                        {/* Info */}
                        <div className="loy-prize-card-info">
                          <p className="loy-prize-card-name">{premio.nombre}</p>
                          <span className="loy-prize-card-cost">
                            {premio.costo} puntos
                          </span>
                        </div>

                        {/* Progreso */}
                        {!yaReclamado && (
                          <div className="loy-prize-card-progress">
                            <div className="loy-prize-card-bar">
                              <div
                                className="loy-prize-card-fill"
                                style={{ width: `${progreso}%` }}
                              />
                            </div>
                            <p className="loy-prize-card-pts">
                              {Math.min(cliente.puntos, premio.costo)}{" "}
                              <span>/ {premio.costo} pts</span>
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button className="loy-logout" onClick={borrarDatosLocales}>
              Cerrar sesión
            </button>
          </>
        )}

        {/* Carrusel promociones */}
        <div className="loy-promo">
          <p className="loy-section-title">Nuestras promociones</p>
          <div className="loy-promo-slider">
            {fotospormod.map((foto, i) => (
              <img
                key={i}
                src={foto}
                alt={`promo-${i}`}
                className="loy-promo-img"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Tarjetadefidelida;
