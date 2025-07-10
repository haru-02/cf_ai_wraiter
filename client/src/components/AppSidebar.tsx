import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Header from "@/components/Header";
import FileBar from "@/components/FileBar";
import { Button } from "./ui/button";

type FileMeta = {
  id: number;
  title: string;
  created_at: string;
};

interface AppSidebarProps {
  files: FileMeta[];
  onSelectFile: (id: number) => void;
  onDeleteFile: (title: string) => void;
  onNewFile: () => void;
}

export function AppSidebar({
  files,
  onSelectFile,
  onDeleteFile,
  onNewFile,
}: AppSidebarProps) {
  const handleNewFileButtonClick = () => {
    onNewFile();
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Header />
        <h1 className="text-xl font-semibold leading-6 pt-4 pl-2">
          Files
          <hr></hr>
        </h1>
      </SidebarHeader>
      <SidebarContent>
        <FileBar
          files={files}
          onSelect={onSelectFile}
          onDeleteFile={onDeleteFile}
        />
      </SidebarContent>
      <SidebarFooter>
        <Button onClick={handleNewFileButtonClick}>New File</Button>{" "}
        {/* Use the new combined handler */}
      </SidebarFooter>
    </Sidebar>
  );
}
