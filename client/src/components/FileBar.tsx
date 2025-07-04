import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
// Define the type for file metadata
type FileMeta = {
  id: number;
  title: string;
  created_at: string;
};

// SideBar now receives files and onSelect as props, and only renders the scrollable part
function FileBar({
  files,
  onSelect,
}: {
  files: FileMeta[];
  onSelect: (id: number) => void;
}) {
  return (
    <ScrollArea className="flex-1 p-2">
      {/* Check if files array is empty */}
      {files.length === 0 ? (
        <span className="text-muted-foreground p-2">No files saved.</span>
      ) : (
        <div className="flex flex-col gap-1">
          {files.map((file) => (
            <Button
              key={file.id}
              variant="ghost"
              className="justify-start w-full text-left truncate"
              onClick={() => onSelect(file.id)}
            >
              {file.title}
            </Button>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}

export default FileBar;
