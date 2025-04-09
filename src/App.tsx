import { useRef } from "react";
import { IRefPhaserGame, PhaserGame } from "@game";
import { cons } from "@core";

function App() {
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  // Event emitted from the PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {
    cons.log("Current Scene", scene);
  };

  return (
    <div id="app">
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
    </div>
  );
}

export default App;
