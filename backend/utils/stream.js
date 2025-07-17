// backend/utils/stream.js
import { StreamChat } from "stream-chat";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;
if (!apiKey || !apiSecret) {
    throw new Error("Stream API keys are missing from environment variables.");
  }
  
const serverClient = StreamChat.getInstance(apiKey, apiSecret);

export default serverClient;
