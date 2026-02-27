// utils/deviceId.js
export const getDeviceId = () => {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = crypto.randomUUID(); // Genera un ID único
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
};
