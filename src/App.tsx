import { useState } from "react";
import StartScene from "./scenes/StartScene";
import RunScene from "./scenes/RunScene";
import DetailsScene from "./scenes/DetailsScene";
import { startMusic, unlockAudio, toggleMute, isMuted } from "./audio";
import { convite } from "./config/convite";

type Scene = "start" | "run" | "details";

export default function App() {
  const [scene, setScene] = useState<Scene>("start");
  const [muted, setMuted] = useState(isMuted());

  const start = () => {
    unlockAudio();
    startMusic(convite.musicUrl);
    setScene("run");
  };

  return (
    <div className="app">
      {scene === "start" && <StartScene onStart={start} />}
      {scene === "run" && <RunScene onFinish={() => setScene("details")} />}
      {scene === "details" && <DetailsScene onReplay={() => setScene("run")} />}
      <button
        className="mute"
        aria-label={muted ? "Ligar som" : "Desligar som"}
        onClick={() => setMuted(toggleMute())}
      >
        {muted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}
