import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import starterKit from "@tiptap/starter-kit";
import { shadow } from "@/styles/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Writer({
  onContentChange,
}: {
  onContentChange: (content: string) => void;
}) {
  const editor = useEditor({
    extensions: [starterKit],
    content: "write here...",
    editorProps: {
      attributes: {
        class:
          "prose prose-blue dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-2",
      },
    },
    onUpdate: ({ editor }) => {
      onContentChange(editor.getText());
    },
  });

  // not really sure if this is needed, but ill keep it here for now,
  // mickey mouse voice : "it is a suprise tool that will help us later !"
  //   const handleGetContent = () => {
  //     if (!editor) return;

  //     // this content is taken as a html string, should this be markdown instead?
  //     const htmlContent = editor.getHTML();
  //     console.log("HTML content", htmlContent);

  //     // ideally, this would be passed to a backend service for ai processing.
  //     // for now, this is just a log.
  //     // if you need this as markdown, use the turndown library to convert it. not included rn.
  //   };
  const [filename, setFilename] = useState("untitled");
  // gonna be used to set the filename of the document

  return (
    <div
      className="mx-auto h-[calc(85vh-2rem)] flex flex-col w-full bg-popover text-foreground p-6 rounded-lg mb-6"
      style={{ boxShadow: shadow }}
    >
      <div className="flex gap-2">
        <Input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          className="font-bold mb-4 bg-transparent border-none outline-none w-full"
          placeholder="Untitled"
        />
        <Button
          variant="default"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow"
        >
          Save
        </Button>
      </div>

      {/* Basic toolbar for common actions */}
      {editor && (
        <div className="mb-4 p-2 bg-popover flex flex-wrap gap-2">
          <Button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className="px-3 py-1 text-sm font-medium transition-colors duration-200"
          >
            Bold
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className="px-3 py-1 text-sm font-medium transition-colors duration-200"
          >
            Italic
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className="px-3 py-1 text-sm font-medium transition-colors duration-200"
          >
            Strike
          </Button>
          <Button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className="px-3 py-1 text-sm font-medium transition-colors duration-200"
          >
            Paragraph
          </Button>
          <Button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className="px-3 py-1 text-sm font-medium transition-colors duration-200"
          >
            H1
          </Button>
          <Button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className="px-3 py-1 text-sm font-medium transition-colors duration-200"
          >
            H2
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className="px-3 py-1 text-sm font-medium transition-colors duration-200"
          >
            Bullet List
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className="px-3 py-1 text-sm font-medium transition-colors duration-200"
          >
            Ordered List
          </Button>
        </div>
      )}

      {/* The Tiptap editor itself */}
      <div className="tiptap-editor-wrapper flex-1 min-h-0 overflow-y-auto border border-border rounded-md shadow-inner bg-muted">
        <EditorContent
          editor={editor}
          className="flex-1 min-h-0 overflow-auto"
        />
      </div>
    </div>
  );
}

export default Writer;
