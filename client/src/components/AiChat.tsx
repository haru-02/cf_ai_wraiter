import React, { useState } from "react";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import Message from "./ui/Message";
import { shadow } from "@/styles/utils";

function AiChat() {
  interface MessageType {
    role: "ai" | "user";
    content: string;
    isLoading?: boolean;
  }

  const [messages, setMessages] = useState<MessageType[]>([
    { role: "ai", content: "Hello! How can I assist you today?" },
  ]);

  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", content: inputMessage.trim() },
        { role: "ai", content: "", isLoading: true },
      ]);
      const currentPrompt = inputMessage.trim();
      setInputMessage(""); // Clear input

      try {
        const res = await fetch("http://localhost:8787/aichat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: currentPrompt }),
        });
        const data = await res.json();
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          {
            role: "ai",
            content: data.result ?? data.response ?? JSON.stringify(data),
          },
        ]);
      } catch (error) {
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          {
            role: "ai",
            content: "Sorry, there was an error contacting the AI.",
          },
        ]);
      }
    }
  };

  interface MessageType {
    role: "ai" | "user";
    content: string;
    isLoading?: boolean;
  }

  interface KeyPressEvent extends React.KeyboardEvent<HTMLInputElement> {}

  const handleKeyPress = (event: KeyPressEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      // Send on Enter, allow Shift+Enter for new line
      event.preventDefault(); // Prevent default Enter behavior (e.g., new line in textarea)
      handleSendMessage();
    }
  };

  return (
    // Main container, occupying full height and centered horizontally
    <div
      className="mx-auto h-[calc(85vh-2rem)] flex flex-col w-full bg-popover text-foreground p-6 rounded-lg mb-6"
      style={{ boxShadow: shadow }}
    >
      {/* Header */}
      <div className="pb-4 border-b border-border bg-card">
        <h1 className="text-xl font-semibold">Chat</h1>
      </div>
      {/* Chat Messages Area */}
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <Message
            key={index}
            role={msg.role}
            content={msg.content}
            isLoading={msg.isLoading ?? false}
          />
        ))}
      </ScrollArea>
      <Separator className="my-2" /> {/* Visual separator */}
      {/* Message Input Area */}
      <div className="flex items-center p-4 pt-0 gap-2">
        <Input
          placeholder="Type your message here..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 resize-none min-h-[40px] text-base" // Ensure it grows for longer input
        />
        <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}

export default AiChat;
