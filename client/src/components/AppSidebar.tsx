import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Header from "@/components/Header";
import FileBar from "@/components/FileBar";

type FileMeta = {
  id: number;
  title: string;
  created_at: string;
};

interface AppSidebarProps {
  files: FileMeta[];
  onSelectFile: (id: number) => void;
  onDeleteFile: (title: string) => void; // New prop
}

export function AppSidebar({
  files,
  onSelectFile,
  onDeleteFile,
}: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <Header />
        <h1 className="text-xl font-semibold leading-6 pt-4">
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
      <SidebarFooter />
    </Sidebar>
  );
}
