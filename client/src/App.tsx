import Writer from "./components/Writer";
import AiChat from "./components/AiChat";

function App() {
  return (
    <div className="flex flex-1 w-full gap-6 flex-col md:flex-row justify-evenly">
      <div className="flex-1 flex min-h-0">
        <Writer />
      </div>
      <div className="flex-1 flex min-h-0">
        <AiChat />
      </div>
    </div>
  );
}

export default App;
