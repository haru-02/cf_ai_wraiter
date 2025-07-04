import Writer from "./components/Writer";
import AiChat from "./components/AiChat";
import { useState } from "react";

function App() {
  const [writerContent, setWriterContent] = useState("");
  return (
    <div className="flex flex-1 w-full gap-6 flex-col md:flex-row justify-evenly">
      <div className="flex-1 flex min-h-0">
        <Writer onContentChange={setWriterContent} />
      </div>
      <div className="flex-1 flex min-h-0">
        <AiChat context={writerContent} />
      </div>
    </div>
  );
}

export default App;
