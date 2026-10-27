import { useState } from "react";
import StartScene from "./scenes/StartScene";
import RunScene from "./scenes/RunScene";
import VideoScene from "./scenes/VideoScene";
import DetailsScene from "./scenes/DetailsScene";
import { startMusic, unlockAudio, toggleMute, isMuted } from "./audio";
import { convite } from "./config/convite";

type Scene = "start" | "run" | "details";

// "video/convite.mp4" vira "<base>/video/convite.mp4" (funciona no GitHub Pages)
const assetUrl = (p: string) => (/^(https?:)?\/\//.test(p) ? p : import.meta.env.BASE_URL + p.replace(/^\.?\//, ""));

export default function App() {
  const [scene, setScene] = useState<Scene>("start");
  const [muted, setMuted] = useState(isMuted());
  const [videoFalhou, setVideoFalhou] = useState(false);

  const usarVideo = Boolean(convite.videoUrl) && !videoFalhou;

  const start = () => {
    unlockAudio();
    // se o vídeo tem som próprio, a música de fundo atrapalharia
    if (!usarVideo) startMusic(convite.musicUrl);
    setScene("run");
  };

  const finalizar = () => setScene("details");

  return (
    <div className="app">
      {scene === "start" && <StartScene onStart={start} />}
      {scene === "run" &&
        (usarVideo ? (
          <VideoScene
            src={assetUrl(convite.videoUrl)}
            poster={convite.videoPoster ? assetUrl(convite.videoPoster) : undefined}
            muted={muted}
            onFinish={finalizar}
            onError={() => setVideoFalhou(true)}
          />
        ) : (
          <RunScene onFinish={finalizar} />
        ))}
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
