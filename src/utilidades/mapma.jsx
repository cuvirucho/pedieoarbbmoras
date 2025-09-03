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

  const geocoderRef = useRef(null);

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

  // Obtener ubicación del usuario al abrir modal
  useEffect(() => {
    if (!modalOpen) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setSelectedLat(latitude);
          setSelectedLon(longitude);
          if (map) map.panTo({ lat: latitude, lng: longitude });
          fetchAddress(latitude, longitude);
        },
        () => alert("No se pudo obtener tu ubicación")
      );
    } else {
      alert("Geolocalización no soportada por tu navegador");
    }
  }, [modalOpen, map]);

  // Convertir coordenadas a dirección
  const fetchAddress = useCallback((lat, lng) => {
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        setAddress(results[0].formatted_address);
      } else {
        setAddress("Dirección no encontrada");
      }
    });
  }, []);

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

    setModalOpen(false);
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
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={16}
                center={{ lat: selectedLat || 0, lng: selectedLon || 0 }}
                onLoad={(m) => setMap(m)}
                onDragEnd={onMapDragEnd}
                options={{
                  streetViewControl: false,
                  gestureHandling: "greedy",
                }}
              />
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
    fill="blueviolet"   // 👉 morado
    width="32px"
    height="32px"
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 
             9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 
             2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
              </div>
            </div>

            {/* Dirección y coordenadas */}
            <div style={{ marginTop: "10px" }}>
              <span>📌 {address || "Arrastra el mapa para seleccionar ubicación"}</span>
              {selectedLat && selectedLon && (
                <div>
                 
                </div>
              )}
            </div>

            {/* Botones */}
            <div
              style={{
                marginTop: "15px",
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={confirmAddress}
               className="btnconfirm"
              >
                Confirmar
              </button>
              <button
                onClick={() => setModalOpen(false)}
                  className="btnclose"
              >
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
