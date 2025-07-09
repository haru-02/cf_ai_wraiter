import React, { useState } from "react";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import Message from "./ui/Message";
import { shadow } from "@/styles/utils";

function AiChat({ context }: { context?: string }) {
  interface MessageType {
    role: "ai" | "user";
    content: string;
    isLoading?: boolean;
  }

  const API_URL = import.meta.env.VITE_API_URL;

  const [messages, setMessages] = useState<MessageType[]>([
    {
      role: "ai",
      content:
        'Hi, happy to assist your work today! If you want me to take the text on writer as context, just include "@writer" in your prompt!',
    },
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

      // pass the writer content as context only if the user specifies it with @writer in prompt.
      const shouldIncludeContext = currentPrompt.includes("@writer");
      const payload = shouldIncludeContext
        ? { prompt: currentPrompt, context }
        : { prompt: currentPrompt, context: "" };

      try {
        const res = await fetch(`${API_URL}/aichat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          {
            role: "ai",
            content:
              data.result ??
              data.response ??
              JSON.stringify(data).replace(/\n(?=\d+\.)/g, "\n\n"),
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
