import { Loader2 } from "lucide-react";

interface MessageProps {
  role: "user" | "ai";
  content: string;
  isLoading: boolean;
}

const Message: React.FC<MessageProps> = ({
  role,
  content,
  isLoading,
}: MessageProps) => {
  const isUser = role === "user";
  return (
    // 'justify-end' for user, 'justify-start' for AI to align messages to sides
    <div
      className={`flex items-start gap-3 p-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 shadow-md ${
          isUser
            ? "bg-primary text-primary-foreground" // Shadcn primary button colors for user messages
            : "bg-muted text-muted-foreground" // Shadcn muted background for AI messages
        }`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        ) : (
          <p className="text-sm break-words">{content}</p>
        )}
      </div>
    </div>
  );
};

export default Message;
