// utils/encryption.js
import CryptoJS from "crypto-js";

const SECRET_KEY = "fairhire-encryption-key-123"; // 🔐 store securely later

export function encryptMessage(message) {
  return CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
}

export function decryptMessage(cipherText) {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
