// utils/sendNotification.js
import Notification from "../models/Notification.js";

export const sendNotification = async (userId, message, link = null) => {
  try {
    await Notification.create({ userId, message, link });
  } catch (err) {
    console.error("Notification error:", err);
  }
};
