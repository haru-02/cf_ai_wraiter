import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Message from "@/components/ui/Message";
import { shadow } from "@/styles/utils";

function AiChat() {
  interface MessageType {
    role: "ai" | "user";
    content: string;
    isLoading?: boolean;
  }

  const CLOUDFLARE_ACCOUNT_ID = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
  const CLOUDFLARE_API_TOKEN = import.meta.env.VITE_CLOUDFLARE_API_TOKEN;

  const [messages, setMessages] = useState<MessageType[]>([
    { role: "ai", content: "Hello! How can I assist you today?" },
  ]);

  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = async () => {
    // Made the function async
    const userMessageContent = inputMessage.trim();
    if (userMessageContent) {
      // Add user message and a loading AI message immediately
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", content: userMessageContent },
        { role: "ai", content: "", isLoading: true }, // AI response with loading state
      ]);
      setInputMessage(""); // Clear input immediately
      try {
        const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`;
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:5173",
          },
          body: JSON.stringify({
            prompt: userMessageContent, // Send the user's message as the prompt
          }),
        });
        if (!response.ok) {
          // Attempt to parse error details from the response body
          let errorDetails = `HTTP error! Status: ${response.status}`;
          try {
            const errorData = await response.json();
            if (errorData && errorData.errors && errorData.errors.length > 0) {
              errorDetails = `Cloudflare API error: ${response.status} - ${errorData.errors[0].message}`;
            } else if (errorData && errorData.message) {
              errorDetails = `Cloudflare API error: ${response.status} - ${errorData.message}`;
            } else {
              errorDetails = `Cloudflare API error: ${response.status} - Unknown error format.`;
            }
          } catch (jsonError) {
            // If response is not JSON, or parsing fails
            errorDetails = `Cloudflare API error: ${response.status} - Could not parse error response.`;
          }
          throw new Error(errorDetails);
        }
        const data = await response.json();
        const aiResponseContent =
          data.result?.response || "No response from AI.";
        // Update the last message (which was the loading AI message) with the actual response
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastAiMessageIndex = newMessages.length - 1;
          if (newMessages[lastAiMessageIndex]?.isLoading) {
            newMessages[lastAiMessageIndex] = {
              role: "ai",
              content: aiResponseContent,
              isLoading: false,
            };
          }
          return newMessages;
        });
      } catch (error: any) {
        console.error("Error sending message to Cloudflare AI:", error);
        // Provide more user-friendly error messages
        let displayErrorMessage =
          "Failed to get AI response. Please check your network connection and API details.";
        if (error.message.includes("Failed to fetch")) {
          displayErrorMessage =
            "Network error or CORS issue. Please check your internet connection and browser console for CORS errors.";
        } else if (error.message.includes("Cloudflare API error")) {
          displayErrorMessage = error.message; // Use the more detailed error from the API
        } else {
          displayErrorMessage = `An unexpected error occurred: ${error.message}`;
        }
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastAiMessageIndex = newMessages.length - 1;
          if (newMessages[lastAiMessageIndex]?.isLoading) {
            newMessages[lastAiMessageIndex] = {
              role: "ai",
              content: displayErrorMessage,
              isLoading: false,
            };
          } else {
            // If for some reason the loading message wasn't the last, add a new error message
            newMessages.push({
              role: "ai",
              content: displayErrorMessage,
              isLoading: false,
            });
          }
          return newMessages;
        });
      }
    }
  };

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
