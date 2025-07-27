// src/components/ChatConversation.jsx
import {
    Channel,
    MessageList,
    MessageInput,
    Window,
    ChannelHeader,
    Thread,
  } from 'stream-chat-react';
  
  export default function ChatConversation({ channel }) {
    if (!channel) return <div>Loading...</div>;
  
    return (
      <Channel channel={channel}>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    );
  }
  