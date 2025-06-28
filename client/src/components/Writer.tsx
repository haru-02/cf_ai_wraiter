import { shadow } from "@/styles/utils";
import { useEditor, EditorContent } from "@tiptap/react";
import starterKit from "@tiptap/starter-kit";
import { Button } from "./ui/button";

function Writer() {
  const editor = useEditor({
    extensions: [starterKit],
    content: "<p> start writing...</p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-blue dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-2",
      },
    },
    // onUpdate: ({ editor }) => {
    //   // use this part to get instant updates on what the user is writing
    //   // this is useful when you wanna autosave or do ai stuff with it using cloudflare workers.
    // },
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

  return (
    <div
      className="w-1/2 max-w-4xl mx-auto h-[calc(85vh-2rem)] flex flex-col bg-popover text-foreground p-6 rounded-lg border-xl mb-6"
      style={{ boxShadow: shadow }}
    >
      <h2 className="text-2xl font-bold mb-4">filename</h2>

      {/* Basic toolbar for common actions */}
      {editor && (
        <div className="mb-4 p-2 bg-muted rounded-md border flex flex-wrap gap-2">
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
      <div className="tiptap-editor-wrapper flex-1 min-h-0 overflow-y-auto border border-border rounded-md shadow-inner bg-background-secondary">
        <EditorContent
          editor={editor}
          className="flex-1 min-h-0 overflow-auto"
        />
      </div>
    </div>
  );
}

export default Writer;
