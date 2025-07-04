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

export function AppSidebar({
  files,
  onSelectFile,
}: {
  files: FileMeta[];
  onSelectFile: (id: number) => void;
}) {
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
        <FileBar files={files} onSelect={onSelectFile} />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
