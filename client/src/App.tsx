import Writer from "./components/Writer";
import AiChat from "./components/AiChat";
import { useState, useEffect, useCallback } from "react";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

type FileMeta = {
  id: number;
  title: string;
  created_at: string;
};

function App() {
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [selectedFilename, setSelectedFilename] = useState<string>("untitled");
  const [loadingFileContent, setLoadingFileContent] = useState(false);
  const [writerContent, setWriterContent] = useState<string>("");

  const fetchAllFiles = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8787/files");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error("Failed to fetch files:", error);
      // TODO: Display an error message to the user (e.g., using a toast)
    }
  }, []);

  // Effect to fetch all files when the component mounts
  useEffect(() => {
    fetchAllFiles();
  }, [fetchAllFiles]);

  // Effect to fetch the content of the selected file when selectedFileId changes
  useEffect(() => {
    const fetchSelectedFileContent = async () => {
      if (selectedFileId === null) {
        setWriterContent("write here..."); // Reset to default placeholder
        setSelectedFilename("untitled");
        return;
      }

      setLoadingFileContent(true); // Start loading indicator
      try {
        const selectedFile = files.find((file) => file.id === selectedFileId);

        if (selectedFile) {
          const res = await fetch(
            `http://localhost:8787/file/${encodeURIComponent(
              selectedFile.title
            )}`
          );
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          setWriterContent(data.file.content || "");
          setSelectedFilename(data.file.title || "untitled");
        } else {
          setWriterContent("File not found. Start a new document.");
          setSelectedFilename("untitled");
          console.warn(`File with ID ${selectedFileId} not found.`);
        }
      } catch (error) {
        console.error("Failed to fetch file content:", error);
        setWriterContent("Error loading file. Please try again.");
        setSelectedFilename("untitled");
      } finally {
        setLoadingFileContent(false); // End loading indicator
      }
    };

    fetchSelectedFileContent();
  }, [selectedFileId, files]);
  const handleSelectFile = (id: number) => {
    setSelectedFileId(id);
  };

  const handleWriterContentChange = (content: string) => {
    setWriterContent(content);
  };

  const handleFilenameChange = (name: string) => {
    setSelectedFilename(name);
  };

  const handleSaveComplete = () => {
    fetchAllFiles();
  };

  return (
    <SidebarProvider className="flex flex-1 w-full gap-6 flex-col md:flex-row justify-evenly">
      <AppSidebar files={files} onSelectFile={handleSelectFile} />
      <SidebarTrigger />
      <div className="flex-1 flex min-h-0">
        <Writer
          content={writerContent} // Pass the content to display
          onContentChange={handleWriterContentChange} // Pass callback for content changes
          filename={selectedFilename} // Pass the current filename
          onFilenameChange={handleFilenameChange} // Pass callback for filename changes
          onSaveComplete={handleSaveComplete} // Pass callback for save completion
          loading={loadingFileContent} // Pass loading state
          selectedFileId={selectedFileId} // Pass selected file ID for potential new file handling
        />
      </div>
      <div className="flex-1 flex min-h-0">
        <AiChat context={writerContent} />
      </div>
    </SidebarProvider>
  );
}

export default App;
