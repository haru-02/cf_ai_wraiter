// src/components/Writer.tsx
import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import starterKit from "@tiptap/starter-kit";
import { shadow } from "@/styles/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Define the props for the Writer component
interface WriterProps {
  content: string; // The HTML content to load into the editor
  onContentChange: (content: string) => void; // Callback for editor content changes
  filename: string; // The current filename (for the input field)
  onFilenameChange: (name: string) => void; // Callback for filename input changes
  onSaveComplete: () => void; // Callback to notify parent after a successful save
  loading: boolean; // Boolean to indicate if content is being loaded
  selectedFileId: number | null; // The ID of the currently selected file (useful for distinguishing new vs. existing saves)
}

function Writer({
  content,
  onContentChange,
  filename,
  onFilenameChange,
  onSaveComplete,
  loading,
  selectedFileId,
}: WriterProps) {
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [starterKit],
    content: content,
    editorProps: {
      attributes: {
        class:
          "prose prose-blue dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-2",
      },
    },
    onUpdate: ({ editor }) => {
      // Notify parent when editor content changes
      onContentChange(editor.getHTML()); // Pass HTML content back to App
    },
  });

  // Effect to update the editor's content when the 'content' prop changes
  // This happens when a new file is selected in the sidebar
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Only set content if it's different to avoid infinite loops
      editor.commands.setContent(content, false); // `false` prevents setting selection to the end
    }
  }, [content, editor]);

  // Effect to reset editor content when no file is selected, or for new document
  useEffect(() => {
    if (editor && selectedFileId === null && content === "write here...") {
      editor.commands.setContent("write here...", false);
    }
  }, [selectedFileId, content, editor]);

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    const editorContent = editor.getHTML(); // Get HTML content from the editor

    // Basic validation
    if (!filename.trim()) {
      toast.error("Filename cannot be empty!");
      setSaving(false);
      return;
    }
    if (!editorContent.trim()) {
      toast.error("Document content cannot be empty!");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8787/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: filename, // Use the filename from the input
          content: editorContent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("File saved successfully!");
        onSaveComplete(); // Notify App.tsx to re-fetch files
      } else {
        toast.error(data.error || "Failed to save file.");
      }
    } catch (e) {
      console.error("Error saving file:", e);
      toast.error("Failed to save file. Network error or server issue.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="mx-auto h-[calc(85vh-2rem)] flex flex-col w-full bg-popover text-foreground p-6 rounded-lg mb-6"
      style={{ boxShadow: shadow }}
    >
      <div className="flex gap-2 items-center mb-4">
        <Input
          type="text"
          value={filename}
          onChange={(e) => onFilenameChange(e.target.value)} // Notify parent of filename changes
          className="font-bold bg-transparent border-none outline-none w-full text-lg"
          placeholder="Untitled"
          disabled={loading || saving} // Disable input while loading/saving
        />
        <Button
          variant="default"
          onClick={handleSave}
          disabled={saving || loading} // Disable save button while saving or loading content
          className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {editor && (
        <div className="mb-4 p-2 bg-popover flex flex-wrap gap-2 rounded-md shadow-sm">
          <Button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={
              !editor.can().chain().focus().toggleBold().run() || loading
            }
            className="px-3 py-1 text-sm font-medium transition-colors duration-200"
          >
            Bold
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={
              !editor.can().chain().focus().toggleItalic().run() || loading
            }
            className="px-3 py-1 text-sm font-medium transition-colors duration-200"
          >
            Italic
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={
              !editor.can().chain().focus().toggleStrike().run() || loading
            }
            className="px-3 py-1 text-sm font-medium transition-colors duration-200"
          >
            Strike
          </Button>
          <Button
            onClick={() => editor.chain().focus().setParagraph().run()}
            disabled={loading}
            className="px-3 py-1 text-sm font-medium transition-colors duration-200"
          >
            Paragraph
          </Button>
          <Button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            disabled={loading}
            className="px-3 py-1 text-sm font-medium transition-colors duration-200"
          >
            H1
          </Button>
          <Button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            disabled={loading}
            className="px-3 py-1 text-sm font-medium transition-colors duration-200"
          >
            H2
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={loading}
            className="px-3 py-1 text-sm font-medium transition-colors duration-200"
          >
            Bullet List
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={loading}
            className="px-3 py-1 text-sm font-medium transition-colors duration-200"
          >
            Ordered List
          </Button>
        </div>
      )}

      <div className="tiptap-editor-wrapper flex-1 min-h-0 overflow-y-auto border border-border rounded-md shadow-inner bg-muted relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-lg">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}
        <EditorContent
          editor={editor}
          className="flex-1 min-h-0 overflow-auto"
        />
      </div>
    </div>
  );
}

export default Writer;
