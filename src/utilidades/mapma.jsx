import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Solo mueve el mapa cuando panTarget cambia (GPS o busqueda),
// NO cuando el usuario arrastra (eso solo actualiza el pin/address)
function MapPanner({ panTarget, isMoveFromUser }) {
  const map = useMap();
  const prevTarget = useRef(null);
  useEffect(() => {
    if (!panTarget) return;
    if (
      prevTarget.current &&
      prevTarget.current.lat === panTarget.lat &&
      prevTarget.current.lng === panTarget.lng
    )
      return;
    prevTarget.current = panTarget;
    // Marcar como movimiento programatico para que handleMapMoveEnd lo ignore
    if (isMoveFromUser) isMoveFromUser.current = false;
    map.setView([panTarget.lat, panTarget.lng], 17, { animate: true });
  }, [panTarget, map]);
  return null;
}

// Escucha cuando el usuario termina de mover el mapa y actualiza pin + direccion
function MapDragListener({ onMoveEnd }) {
  const map = useMap();
  useEffect(() => {
    map.on("moveend", onMoveEnd);
    return () => map.off("moveend", onMoveEnd);
  }, [map, onMoveEnd]);
  return null;
}

const MapaPicker = ({ onLocationSelect }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [address, setAddress] = useState("");
  // pinPos: posicion del pin (se actualiza con GPS, busqueda Y arrastre)
  const [pinPos, setPinPos] = useState(null);
  // panTarget: SOLO cambia con GPS o busqueda (dispara MapPanner)
  const [panTarget, setPanTarget] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [pinAnim, setPinAnim] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const mapRef = useRef(null);
  const cachedPos = useRef(null);
  const searchTimer = useRef(null);
  const isMoveFromUser = useRef(false);

  // Pre-fetch GPS silencioso al montar
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        cachedPos.current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, []);

  // Geocodificacion inversa
  const fetchAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "es" } },
      );
      const data = await res.json();
      setAddress(data.display_name || "Direccion no encontrada");
    } catch {
      setAddress("No se pudo obtener la direccion");
    }
  };

  // Mueve el mapa programaticamente (GPS / busqueda)
  const programmaticMove = (lat, lng) => {
    const pos = { lat, lng };
    setPinPos(pos);
    setPanTarget(pos);
    fetchAddress(lat, lng);
    setPinAnim("drop");
    setTimeout(() => setPinAnim(""), 600);
  };

  // Cuando el usuario arrastra: solo pin + address, SIN mover el mapa
  const handleMapMoveEnd = () => {
    // Si fue un movimiento programatico (GPS/busqueda), ignorar
    if (!isMoveFromUser.current) {
      isMoveFromUser.current = true;
      return;
    }
    if (!mapRef.current) return;
    const c = mapRef.current.getCenter();
    const lat = Number(c.lat);
    const lng = Number(c.lng);
    setPinPos({ lat, lng });
    fetchAddress(lat, lng);
    setPinAnim("bounce");
    setTimeout(() => setPinAnim(""), 400);
  };

  const obtenerGPS = () => {
    if (!navigator.geolocation) {
      setGpsError("GPS no disponible en este dispositivo.");
      return;
    }
    setLoadingGPS(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        cachedPos.current = { lat: latitude, lng: longitude };
        programmaticMove(latitude, longitude);
        setLoadingGPS(false);
      },
      (err) => {
        let msg = "No se pudo obtener ubicacion.";
        if (err.code === 1) msg = "Permiso denegado. Activa la ubicacion.";
        else if (err.code === 2) msg = "GPS no disponible. Verifica tu senal.";
        else if (err.code === 3) msg = "Tiempo agotado. Intenta de nuevo.";
        setGpsError(msg);
        setLoadingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const openModal = () => {
    setModalOpen(true);
    setMapReady(false);
    if (cachedPos.current) {
      programmaticMove(cachedPos.current.lat, cachedPos.current.lng);
    } else {
      obtenerGPS();
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setPinPos(null);
    setPanTarget(null);
    setMapReady(false);
    setAddress("");
    setSearchQuery("");
    setSuggestions([]);
    setGpsError(null);
    mapRef.current = null;
  };

  const confirmAddress = () => {
    if (onLocationSelect && pinPos) {
      onLocationSelect({ address, lat: pinPos.lat, lng: pinPos.lng });
    }
    closeModal();
  };

  // Formatea sugerencia: Calle Numero, Barrio, Ciudad
  const formatSuggestion = (item) => {
    const a = item.address || {};
    const road =
      a.road ||
      a.pedestrian ||
      a.footway ||
      a.path ||
      a.cycleway ||
      a.highway ||
      "";
    const house = a.house_number ? ` ${a.house_number}` : "";
    // Usar namedetails.name si road esta vacio
    const streetName =
      road || (item.namedetails && item.namedetails["name"]) || "";
    const sub = a.suburb || a.neighbourhood || a.quarter || a.district || "";
    const city =
      a.city || a.town || a.village || a.municipality || a.county || "";
    const main = (streetName + house).trim();
    const secondary = [sub, city].filter(Boolean).join(", ");
    return { main: main || item.display_name.split(",")[0].trim(), secondary };
  };

  // Buscador con Nominatim — acotado a la ciudad del usuario, con fallback
  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    setSelectedIdx(-1);
    clearTimeout(searchTimer.current);
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const base = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8&addressdetails=1&namedetails=1`;
        const headers = { "Accept-Language": "es" };
        let data = [];
        if (cachedPos.current) {
          const { lat, lng } = cachedPos.current;
          const delta = 0.2;
          const box = `&viewbox=${lng - delta},${lat + delta},${lng + delta},${lat - delta}&bounded=1`;
          const res = await fetch(base + box, { headers });
          data = await res.json();
          // Fallback sin limite si no hay resultados en la ciudad
          if (data.length === 0) {
            const box2 = `&viewbox=${lng - delta},${lat + delta},${lng + delta},${lat - delta}&bounded=0`;
            const res2 = await fetch(base + box2, { headers });
            data = await res2.json();
          }
        } else {
          const res = await fetch(base, { headers });
          data = await res.json();
        }
        // Ordenar: calles primero, luego el resto
        const highways = data.filter((d) => d.class === "highway");
        const rest = data.filter((d) => d.class !== "highway");
        setSuggestions([...highways, ...rest]);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSearchKeyDown = (e) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const idx = selectedIdx >= 0 ? selectedIdx : 0;
      selectSuggestion(suggestions[idx]);
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setSelectedIdx(-1);
    }
  };

  const selectSuggestion = (item) => {
    const { main } = formatSuggestion(item);
    setSearchQuery(main);
    setSuggestions([]);
    setSelectedIdx(-1);
    programmaticMove(parseFloat(item.lat), parseFloat(item.lon));
  };

  return (
    <div>
      <button className="btn main-btn" onClick={openModal}>
        📍 Elegir mi ubicacion
      </button>

      {modalOpen && (
        <div className="modalmap">
          <div className="modal-content">
            {/* Buscador */}
            <div className="search-container">
              <p
                style={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "var(--primary)",
                  margin: "0 0 10px",
                }}
              >
                Donde te entregamos?
              </p>

              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar calle o direccion..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  autoComplete="off"
                  style={{ paddingRight: searchQuery ? "36px" : undefined }}
                />
                {/* Boton limpiar */}
                {searchQuery && !searching && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                      setSelectedIdx(-1);
                    }}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      color: "var(--text-muted)",
                      lineHeight: 1,
                      padding: 0,
                    }}
                    aria-label="Limpiar busqueda"
                  >
                    ×
                  </button>
                )}
                {searching && (
                  <span
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    Buscando...
                  </span>
                )}
                {suggestions.length > 0 && (
                  <ul
                    className="suggestions-list"
                    style={{ top: "46px", left: 0, right: 0 }}
                  >
                    {suggestions.map((s, i) => {
                      const { main, secondary } = formatSuggestion(s);
                      return (
                        <li
                          key={s.place_id}
                          className="suggestion-item"
                          onClick={() => selectSuggestion(s)}
                          style={
                            i === selectedIdx
                              ? {
                                  background: "var(--primary-light)",
                                  fontWeight: 600,
                                }
                              : undefined
                          }
                        >
                          <strong
                            style={{
                              display: "block",
                              fontSize: "0.88rem",
                              color: "var(--text)",
                            }}
                          >
                            {main}
                          </strong>
                          {secondary && (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              {secondary}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  margin: "6px 0 0",
                }}
              >
                Tambien puedes arrastrar el mapa para ajustar el pin
              </p>
            </div>

            {/* Mapa */}
            <div className="map mini-map">
              {/* Cargando GPS */}
              {loadingGPS && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255,255,255,0.88)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      border: "3px solid var(--primary-light)",
                      borderTop: "3px solid var(--primary)",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--primary)",
                      fontWeight: 600,
                    }}
                  >
                    Obteniendo ubicacion...
                  </p>
                </div>
              )}

              {/* Error GPS */}
              {!pinPos && !loadingGPS && gpsError && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "#fff8f8",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                    gap: 14,
                    zIndex: 1000,
                  }}
                >
                  <span style={{ fontSize: "2rem" }}>📍</span>
                  <p
                    style={{
                      color: "var(--danger)",
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      textAlign: "center",
                    }}
                  >
                    {gpsError}
                  </p>
                  <button className="btn confirm" onClick={obtenerGPS}>
                    Reintentar
                  </button>
                </div>
              )}

              {pinPos && (
                <MapContainer
                  center={[pinPos.lat, pinPos.lng]}
                  zoom={17}
                  zoomControl
                  style={{ width: "100%", height: "270px" }}
                  ref={mapRef}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <MapPanner
                    panTarget={panTarget}
                    isMoveFromUser={isMoveFromUser}
                  />
                  <MapDragListener onMoveEnd={handleMapMoveEnd} />
                </MapContainer>
              )}

              {/* Pin fijo centrado */}
              {pinPos && (
                <div className={`floating-pin ${pinAnim}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="var(--primary)"
                    width="40px"
                    height="40px"
                    style={{
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))",
                    }}
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Direccion detectada */}
            {pinPos && (
              <div className="address-display">
                <span>Direccion de entrega</span>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontWeight: 400,
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {address || "Calculando direccion..."}
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="modal-buttons">
              {pinPos && (
                <button
                  className="btn close"
                  style={{ flex: "unset", padding: "10px 14px" }}
                  onClick={obtenerGPS}
                  title="Volver a mi ubicacion"
                >
                  📍
                </button>
              )}
              <button className="btn close" onClick={closeModal}>
                Cancelar
              </button>
              <button
                className="btn confirm"
                onClick={confirmAddress}
                disabled={!pinPos}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapaPicker;
