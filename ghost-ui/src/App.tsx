import CommandPalette from "./components/CommandPalette";

function App() {
  return (
    <div className="h-screen w-screen bg-gray-100 dark:bg-zinc-950 transition-colors">
      <CommandPalette />
      <div className="flex items-center justify-center h-full">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Ghost UI Running
        </h1>
      </div>
    </div>
  );
}

export default App;
