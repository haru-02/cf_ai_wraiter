import React, { useState, useRef, useEffect } from "react";
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
  const scrollAreaRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

  const [messages, setMessages] = useState<MessageType[]>([
    {
      role: "ai",
      content:
        'Hi, happy to assist your work today! If you want me to take the text on writer as context, just include "@writer" in your prompt!',
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");

  // Effect to scroll to the bottom whenever messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage: MessageType = {
        role: "user",
        content: inputMessage.trim(),
      };
      const aiLoadingMessage: MessageType = {
        role: "ai",
        content: "",
        isLoading: true,
      };

      // Add user message and a placeholder for AI response with loading state
      setMessages((prevMessages) => [
        ...prevMessages,
        userMessage,
        aiLoadingMessage,
      ]);
      const currentPrompt = inputMessage.trim();
      setInputMessage(""); // Clear input immediately

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

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Network response was not ok");
        }

        const reader = res.body?.getReader();
        if (!reader) {
          throw new Error("Failed to get readable stream from response.");
        }

        const decoder = new TextDecoder("utf-8");
        let accumulatedContent = "";
        let buffer = ""; // Buffer to handle partial lines from the stream

        // Immediately update the last AI message to start streaming (remove isLoading)
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastAiMessageIndex = newMessages.length - 1;
          if (newMessages[lastAiMessageIndex]?.isLoading) {
            newMessages[lastAiMessageIndex] = {
              ...newMessages[lastAiMessageIndex],
              isLoading: false,
              content: "", // Start with an empty string to append to
            };
          }
          return newMessages;
        });

        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk; // Add the new chunk to the buffer

          // Process complete lines from the buffer
          let newlineIndex;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            const line = buffer.substring(0, newlineIndex).trim();
            buffer = buffer.substring(newlineIndex + 1);

            if (line.startsWith("data:")) {
              const jsonString = line.substring(5).trim();
              if (jsonString === "[DONE]") {
                done = true; // Signal completion if [DONE] is received
                break; // Exit the inner while loop
              }
              try {
                const parsedData = JSON.parse(jsonString);
                // Check if 'response' field exists and is not null/undefined
                if (
                  parsedData.response !== null &&
                  parsedData.response !== undefined
                ) {
                  accumulatedContent += parsedData.response;

                  // Update React state with the new content
                  setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    const lastAiMessageIndex = updatedMessages.length - 1;
                    if (updatedMessages[lastAiMessageIndex]?.role === "ai") {
                      updatedMessages[lastAiMessageIndex].content =
                        accumulatedContent;
                    }
                    return updatedMessages;
                  });
                }
                // Handle usage data if needed, though for streaming, it's typically just text
                // if (parsedData.usage) { /* process usage info */ }
              } catch (parseError) {
                console.warn(
                  "Failed to parse JSON from stream line:",
                  jsonString,
                  parseError
                );
                // This might happen for empty lines, or non-JSON messages, safe to ignore often.
              }
            }
          }
        }
        // After the streaming loop finishes (either naturally or by [DONE])
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastAiMessageIndex = updatedMessages.length - 1;
          if (updatedMessages[lastAiMessageIndex]?.role === "ai") {
            // Ensure isLoading is false and content is finalized
            updatedMessages[lastAiMessageIndex].isLoading = false;
          }
          return updatedMessages;
        });
      } catch (error: any) {
        // Type as 'any' for simpler error handling
        console.error("Error fetching streamed AI response:", error);
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastAiMessageIndex = updatedMessages.length - 1;
          // If no content was streamed or it was still loading, show a full error message
          if (
            updatedMessages[lastAiMessageIndex]?.isLoading ||
            updatedMessages[lastAiMessageIndex]?.content === ""
          ) {
            updatedMessages[lastAiMessageIndex] = {
              role: "ai",
              content: `Sorry, there was an error contacting the AI: ${
                error.message || String(error)
              }.`,
              isLoading: false,
            };
          } else {
            // If some content was already streamed, append an error message
            updatedMessages[lastAiMessageIndex].content += `\n\n[Error: ${
              error.message || String(error)
            }]`;
            updatedMessages[lastAiMessageIndex].isLoading = false; // Ensure loading is off
          }
          return updatedMessages;
        });
      }
    }
  };

  interface KeyPressEvent extends React.KeyboardEvent<HTMLInputElement> {}

  const handleKeyPress = (event: KeyPressEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent default Enter behavior (e.g., new line in textarea)
      handleSendMessage();
    }
  };

  return (
    <div
      className="mx-auto h-[calc(85vh-2rem)] flex flex-col w-full bg-popover text-foreground p-6 rounded-lg mb-6"
      style={{ boxShadow: shadow }}
    >
      <div className="pb-4 border-b border-border bg-card">
        <h1 className="text-xl font-semibold">Chat</h1>
      </div>
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <Message
            key={index}
            role={msg.role}
            content={msg.content}
            isLoading={msg.isLoading ?? false}
          />
        ))}
      </ScrollArea>
      <Separator className="my-2" />
      <div className="flex items-center p-4 pt-0 gap-2">
        <Input
          placeholder="Type your message here..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 resize-none min-h-[40px] text-base"
        />
        <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}

export default AiChat;
