import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";

const libraries = [];
const mapContainerStyle = { width: "100%", height: "400px" };

const UberEatsGooglePicker = ({ onLocationSelect }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [selectedLat, setSelectedLat] = useState(null);
  const [selectedLon, setSelectedLon] = useState(null);
  const [map, setMap] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const geocoderRef = useRef(null);
  const locationObtained = useRef(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyB7n9keZCvkdWs_rcvMMjZd-BlXqHpf0pk",
    libraries,
  });

  // Inicializar geocoder
  useEffect(() => {
    if (isLoaded && !geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, [isLoaded]);

  // Convertir coordenadas a dirección
  const fetchAddress = useCallback((lat, lng) => {
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === "OK" && results[0]) {
          setAddress(results[0].formatted_address);
        } else {
          setAddress("Dirección no encontrada");
        }
      },
    );
  }, []);

  // Función para obtener ubicación del dispositivo
  const obtenerUbicacionActual = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError(
        "Geolocalización no soportada por tu navegador. Activa la ubicación.",
      );
      setLoadingLocation(false);
      return;
    }

    setLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedLat(latitude);
        setSelectedLon(longitude);
        if (map) {
          map.panTo({ lat: latitude, lng: longitude });
        }
        fetchAddress(latitude, longitude);
        setLoadingLocation(false);
        locationObtained.current = true;
      },
      (error) => {
        console.error("Error obteniendo ubicación:", error);
        let errorMsg = "No se pudo obtener tu ubicación";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg =
              "Permiso de ubicación denegado. Activa la ubicación en tu dispositivo.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Ubicación no disponible. Verifica tu GPS.";
            break;
          case error.TIMEOUT:
            errorMsg = "Tiempo de espera agotado. Intenta de nuevo.";
            break;
        }
        setLocationError(errorMsg);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }, [map, fetchAddress]);

  // Obtener ubicación del usuario al abrir modal
  useEffect(() => {
    if (!modalOpen || !isLoaded) return;

    // Siempre obtener ubicación fresca al abrir el modal
    obtenerUbicacionActual();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, isLoaded]);

  // Centrar el mapa cuando tengamos nuevas coordenadas
  useEffect(() => {
    if (map && selectedLat && selectedLon) {
      map.panTo({ lat: selectedLat, lng: selectedLon });
    }
  }, [map, selectedLat, selectedLon]);

  // Actualizar ubicación al arrastrar el mapa
  const onMapDragEnd = () => {
    if (!map) return;
    const center = map.getCenter();
    const lat = Number(center.lat());
    const lng = Number(center.lng());
    setSelectedLat(lat);
    setSelectedLon(lng);
    fetchAddress(lat, lng);
  };

  const confirmAddress = () => {
    const locationData = {
      address,
      lat: selectedLat,
      lng: selectedLon,
    };

    // Enviamos la ubicación al componente padre
    if (onLocationSelect) {
      onLocationSelect(locationData);
    }

    closeModal();
  };

  const closeModal = () => {
    setModalOpen(false);
    // Resetear estado para obtener ubicación fresca la próxima vez
    setSelectedLat(null);
    setSelectedLon(null);
    setAddress("");
    setMap(null);
    setLocationError(null);
  };

  // Función para volver a centrar en ubicación actual
  const recentrarEnMiUbicacion = () => {
    obtenerUbicacionActual();
  };

  if (loadError) return <p>Error cargando Google Maps</p>;
  if (!isLoaded) return <p>Cargando Google Maps...</p>;

  return (
    <div>
      <button
        onClick={() => setModalOpen(true)}
        style={{
          padding: "12px 24px",
          background: "blueviolet",
          color: "white",
          borderRadius: "10px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Elegir tu ubicación
      </button>

      {modalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "10px",
              padding: "20px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            {/* Mapa con marcador fijo */}
            <div style={{ position: "relative" }}>
              {loadingLocation && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(255,255,255,0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                    borderRadius: "10px",
                  }}
                >
                  <p>📍 Obteniendo tu ubicación...</p>
                </div>
              )}

              {/* Mostrar error y botón para reintentar si no hay coordenadas */}
              {!selectedLat && !loadingLocation && locationError && (
                <div
                  style={{
                    width: "100%",
                    height: "400px",
                    background: "#f5f5f5",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "10px",
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  <p style={{ color: "#e53935", marginBottom: "15px" }}>
                    ⚠️ {locationError}
                  </p>
                  <button
                    onClick={obtenerUbicacionActual}
                    style={{
                      padding: "12px 24px",
                      background: "blueviolet",
                      color: "white",
                      borderRadius: "10px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    🔄 Reintentar obtener ubicación
                  </button>
                </div>
              )}

              {/* Solo mostrar el mapa cuando hay coordenadas */}
              {selectedLat && selectedLon && (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  zoom={16}
                  center={{
                    lat: selectedLat,
                    lng: selectedLon,
                  }}
                  onLoad={(m) => {
                    setMap(m);
                    // Centrar inmediatamente cuando el mapa carga
                    if (selectedLat && selectedLon) {
                      m.panTo({ lat: selectedLat, lng: selectedLon });
                    }
                  }}
                  onDragEnd={onMapDragEnd}
                  options={{
                    streetViewControl: false,
                    gestureHandling: "greedy",
                  }}
                />
              )}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -100%)",
                  fontSize: "32px",
                  pointerEvents: "none",
                  color: "blueviolet", // 👉 morado
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="blueviolet" // 👉 morado
                  width="32px"
                  height="32px"
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 
             9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 
             2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  />
                </svg>
              </div>
            </div>

            {/* Dirección y coordenadas - solo mostrar cuando hay coordenadas */}
            {selectedLat && selectedLon && (
              <div style={{ marginTop: "10px" }}>
                <span>
                  📌 {address || "Arrastra el mapa para seleccionar ubicación"}
                </span>
              </div>
            )}

            {/* Botones */}
            <div
              style={{
                marginTop: "15px",
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              {/* Botón para volver a mi ubicación */}
              {selectedLat && selectedLon && (
                <button
                  onClick={recentrarEnMiUbicacion}
                  style={{
                    padding: "10px 16px",
                    background: "#4CAF50",
                    color: "white",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    border: "none",
                    marginRight: "auto",
                  }}
                >
                  📍 Mi ubicación
                </button>
              )}
              <button onClick={confirmAddress} className="btnconfirm">
                Confirmar
              </button>
              <button onClick={closeModal} className="btnclose">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UberEatsGooglePicker;
