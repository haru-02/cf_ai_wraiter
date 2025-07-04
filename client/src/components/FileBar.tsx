import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// Define the type for file metadata
type FileMeta = {
  id: number;
  title: string;
  created_at: string;
};

// Add a new prop for the delete action
interface SideBarProps {
  files: FileMeta[];
  onSelect: (id: number) => void;
  onDeleteFile: (title: string) => void; // New callback for deleting
}

function FileBar({ files, onSelect, onDeleteFile }: SideBarProps) {
  // You would typically have a confirmation dialog here before calling onDeleteFile
  const handleDeleteClick = (event: React.MouseEvent, title: string) => {
    event.stopPropagation();
    onDeleteFile(title);
  };

  return (
    <ScrollArea className="flex-1 p-2">
      {files.length === 0 ? (
        <span className="text-muted-foreground p-2">No files saved.</span>
      ) : (
        <div className="flex flex-col gap-1">
          {files.map((file) => (
            <div key={file.id} className="relative group w-full">
              {" "}
              <Button
                variant="ghost"
                className="justify-start w-full text-left truncate pr-10"
                onClick={() => onSelect(file.id)}
              >
                {file.title}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:bg-red-100"
                onClick={(e) => handleDeleteClick(e, file.title)} // Pass event and title
                aria-label={`Delete ${file.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}

export default FileBar;
