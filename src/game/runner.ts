import { blip, fanfare } from "../audio";

export interface RunnerOptions {
  canvas: HTMLCanvasElement;
  signs: string[];
  nome: string;
  idade: number;
  onStar: (total: number) => void;
  onFinish: () => void;
  spriteUrl?: string;
}

interface Star {
  x: number;
  lift: number;
}

const BASE_SPEED = 120; // unidades de mundo por segundo
const SIGN_START = 380;
const SIGN_GAP = 430;
const FONT = '7px "Press Start 2P", monospace';

const mod = (a: number, n: number) => ((a % n) + n) % n;
const smooth = (t: number) => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

function wrap(text: string, max = 15): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export function startRunner(opts: RunnerOptions): () => void {
  const { canvas } = opts;
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let W = 0;
  let H = 0;
  let scale = 1;
  let groundY = 0;
  let charX = 0;

  const signXs = opts.signs.map((_, i) => SIGN_START + i * SIGN_GAP);
  const finishX = SIGN_START + opts.signs.length * SIGN_GAP;
  const wrapped = opts.signs.map((s) => wrap(s));

  const nearSign = (x: number, r: number) => signXs.some((s) => Math.abs(s - x) < r);

  const stars: Star[] = [];
  for (let x = 120, i = 0; x < finishX - 100; x += 46, i++) {
    if (nearSign(x, 70)) continue;
    stars.push({ x, lift: 14 + 10 * Math.sin(i * 0.9) });
  }
  const rocks: number[] = [];
  for (let x = 250; x < finishX - 120; x += 210) {
    if (nearSign(x, 100)) continue;
    rocks.push(x);
  }

  let sprite: HTMLImageElement | null = null;
  if (opts.spriteUrl) {
    const img = new Image();
    img.onload = () => {
      sprite = img;
    };
    img.src = opts.spriteUrl;
  }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    scale = Math.min(canvas.height / 180, canvas.width / 200);
    W = canvas.width / scale;
    H = canvas.height / scale;
    groundY = Math.round(H * 0.74);
    charX = Math.round(W * 0.26);
  };
  resize();
  window.addEventListener("resize", resize);

  // ---------- desenho ----------
  const sky = () => {
    const g = ctx.createLinearGradient(0, 0, 0, groundY);
    g.addColorStop(0, "#2f8fff");
    g.addColorStop(1, "#c6ecff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff4a8";
    ctx.beginPath();
    ctx.arc(W * 0.82, groundY * 0.22, 14, 0, Math.PI * 2);
    ctx.fill();
  };

  const clouds = (wx: number) => {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    for (let i = 0; i < 6; i++) {
      const x = mod(i * 80 - wx * 0.08, W + 120) - 60;
      const y = groundY * 0.12 + (i % 3) * groundY * 0.1;
      ctx.fillRect(x, y + 4, 34, 8);
      ctx.fillRect(x + 6, y, 20, 8);
      ctx.fillRect(x + 20, y + 2, 18, 8);
    }
  };

  const mountains = (wx: number) => {
    ctx.fillStyle = "#6fa8dc";
    const off = mod(wx * 0.2, 160);
    for (let k = -1; k < W / 160 + 2; k++) {
      const x0 = k * 160 - off;
      ctx.beginPath();
      ctx.moveTo(x0, groundY);
      ctx.lineTo(x0 + 80, groundY - 70);
      ctx.lineTo(x0 + 160, groundY);
      ctx.fill();
    }
  };

  const hills = (wx: number, factor: number, color: string, base: number) => {
    ctx.fillStyle = color;
    const o = wx * factor;
    for (let x = 0; x < W; x += 4) {
      const y =
        groundY - base - 14 * Math.sin((x + o) / 38) - 8 * Math.sin((x + o) / 17);
      ctx.fillRect(x, y, 4, groundY - y);
    }
  };

  const palms = (wx: number) => {
    const off = mod(wx * 0.8, 190);
    for (let k = -1; k < W / 190 + 2; k++) {
      const x = k * 190 + 60 - off;
      ctx.fillStyle = "#7a4a24";
      ctx.fillRect(x, groundY - 34, 3, 34);
      ctx.fillStyle = "#2f9e3a";
      ctx.fillRect(x - 10, groundY - 38, 12, 3);
      ctx.fillRect(x + 1, groundY - 38, 12, 3);
      ctx.fillRect(x - 6, groundY - 42, 7, 3);
      ctx.fillRect(x + 2, groundY - 42, 7, 3);
    }
  };

  const ground = (wx: number) => {
    ctx.fillStyle = "#3ecf4a";
    ctx.fillRect(0, groundY, W, 5);
    ctx.fillStyle = "#2a9b36";
    ctx.fillRect(0, groundY + 4, W, 1);
    const off = mod(wx, 32);
    let r = 0;
    for (let y = groundY + 5; y < H; y += 16, r++) {
      for (let c = -1; c < W / 16 + 2; c++) {
        ctx.fillStyle = (c + r) % 2 === 0 ? "#8a5a2b" : "#6b431f";
        ctx.fillRect(c * 16 - off, y, 16, 16);
      }
    }
  };

  const star = (x: number, y: number, t: number) => {
    const spin = 0.8 + 0.2 * Math.sin(t * 6 + x);
    ctx.fillStyle = "#ffd60a";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? 5 * spin : 2.2 * spin;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const px = x + Math.cos(a) * rad;
      const py = y + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  };

  const rock = (x: number) => {
    ctx.fillStyle = "#8d99ae";
    ctx.beginPath();
    ctx.moveTo(x - 9, groundY);
    ctx.lineTo(x - 6, groundY - 8);
    ctx.lineTo(x, groundY - 11);
    ctx.lineTo(x + 7, groundY - 7);
    ctx.lineTo(x + 10, groundY);
    ctx.fill();
    ctx.fillStyle = "#b8c0cc";
    ctx.fillRect(x - 4, groundY - 8, 4, 2);
  };

  const signBoard = (x: number, lines: string[]) => {
    ctx.font = FONT;
    const maxLen = Math.max(...lines.map((l) => l.length));
    const w = maxLen * 7 + 14;
    const h = lines.length * 11 + 8;
    const top = groundY - 38 - h;
    ctx.fillStyle = "#6b3e12";
    ctx.fillRect(x - w / 4 - 1, top + h, 4, groundY - top - h);
    ctx.fillRect(x + w / 4 - 2, top + h, 4, groundY - top - h);
    ctx.fillRect(x - w / 2 - 2, top - 2, w + 4, h + 4);
    ctx.fillStyle = "#c97a2b";
    ctx.fillRect(x - w / 2, top, w, h);
    ctx.fillStyle = "#e3a05a";
    ctx.fillRect(x - w / 2, top, w, 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    lines.forEach((l, i) => {
      ctx.fillStyle = "#4a2606";
      ctx.fillText(l, x + 1, top + 6 + i * 11);
      ctx.fillStyle = "#fff8dc";
      ctx.fillText(l, x, top + 5 + i * 11);
    });
  };

  const goal = (x: number, spin: number) => {
    ctx.fillStyle = "#555";
    ctx.fillRect(x - 15, groundY - 60, 3, 60);
    ctx.fillRect(x + 12, groundY - 60, 3, 60);
    const c = Math.cos(spin);
    ctx.save();
    ctx.translate(x, groundY - 66);
    ctx.scale(c, 1);
    ctx.fillStyle = c >= 0 ? "#ffd60a" : "#e63946";
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.restore();
    if (Math.abs(c) > 0.45) {
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = c >= 0 ? "#7a4a00" : "#fff";
      ctx.fillText(c >= 0 ? "★" : String(opts.idade), x, groundY - 65);
    }
  };

  const hero = (jump: number, phase: number) => {
    const y = groundY - jump;
    if (sprite) {
      const h = 30;
      const w = (sprite.width / sprite.height) * h;
      ctx.drawImage(sprite, charX - w / 2, y - h, w, h);
      return;
    }
    ctx.save();
    ctx.translate(charX, y);
    if (jump > 2) {
      ctx.translate(0, -10);
      ctx.rotate(phase * 3);
      ctx.fillStyle = "#ffb703";
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillRect(-1, -7, 3, 14);
    } else {
      const bob = Math.abs(Math.sin(phase)) * 1.5;
      // rabo em raio
      ctx.fillStyle = "#ffd60a";
      ctx.beginPath();
      ctx.moveTo(-7, -16 - bob);
      ctx.lineTo(-20, -22 - bob);
      ctx.lineTo(-14, -15 - bob);
      ctx.lineTo(-23, -10 - bob);
      ctx.lineTo(-8, -11 - bob);
      ctx.fill();
      // corpo
      ctx.fillStyle = "#ffb703";
      ctx.beginPath();
      ctx.arc(0, -13 - bob, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffe8a3";
      ctx.beginPath();
      ctx.arc(2, -11 - bob, 5, 0, Math.PI * 2);
      ctx.fill();
      // olho
      ctx.fillStyle = "#fff";
      ctx.fillRect(3, -18 - bob, 5, 6);
      ctx.fillStyle = "#111";
      ctx.fillRect(5, -17 - bob, 2, 4);
      // pés
      const s = Math.sin(phase) * 5;
      ctx.fillStyle = "#fff";
      ctx.fillRect(3 + s - 3, -4, 7, 4);
      ctx.fillRect(-3 - s - 3, -4, 7, 4);
      ctx.fillStyle = "#e63946";
      ctx.fillRect(3 + s - 3, -2, 7, 2);
      ctx.fillRect(-3 - s - 3, -2, 7, 2);
    }
    ctx.restore();
  };

  const speedLines = (t: number, factor: number) => {
    if (factor < 0.6) return;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    for (let i = 0; i < 6; i++) {
      const y = groundY - 6 - i * 9;
      const x = mod(i * 53 - t * 400, W + 60) - 30;
      ctx.fillRect(x, y, 22 + (i % 3) * 8, 1);
    }
  };

  // ---------- loop ----------
  let worldX = 0;
  let time = 0;
  let last = performance.now();
  let raf = 0;
  let state: "run" | "finish" = "run";
  let finishT = 0;
  let starIdx = 0;
  let collected = 0;
  let done = false;

  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;

    let factor = 1;
    if (state === "run") {
      for (const sx of signXs) {
        const d = Math.abs(sx - worldX);
        if (d < 150) factor = Math.min(factor, 1 - 0.75 * smooth(1 - d / 150));
      }
      factor *= Math.min(1, 0.3 + time * 0.7);
      worldX += BASE_SPEED * factor * dt;
      if (worldX >= finishX - 70) {
        state = "finish";
        fanfare();
      }
    } else {
      finishT += dt;
      factor = Math.max(0, 1 - finishT * 1.5) * 0.3;
      worldX += BASE_SPEED * factor * dt;
      if (finishT > 3 && !done) {
        done = true;
        opts.onFinish();
      }
    }

    while (starIdx < stars.length && stars[starIdx].x < worldX) {
      collected++;
      starIdx++;
      opts.onStar(collected);
      blip();
    }

    let jump = 0;
    for (const rx of rocks) {
      const dx = rx - worldX;
      if (Math.abs(dx) < 28) {
        jump = Math.max(jump, Math.sin(Math.PI * (1 - (dx + 28) / 56)) * 30);
      }
    }

    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    sky();
    clouds(worldX);
    mountains(worldX);
    hills(worldX, 0.4, "#46b04b", 22);
    hills(worldX, 0.6, "#2f8f3a", 8);
    palms(worldX);
    ground(worldX);

    const sx = (x: number) => charX + (x - worldX);
    signXs.forEach((x, i) => {
      const px = sx(x);
      if (px > -80 && px < W + 80) signBoard(px, wrapped[i]);
    });
    rocks.forEach((x) => {
      const px = sx(x);
      if (px > -20 && px < W + 20) rock(px);
    });
    for (let i = starIdx; i < stars.length; i++) {
      const px = sx(stars[i].x);
      if (px > W + 10) break;
      star(px, groundY - stars[i].lift, time);
    }
    goal(sx(finishX), time * (state === "finish" ? 14 : 4));

    speedLines(time, factor);
    hero(jump, worldX * 0.18);

    if (state === "finish") {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillStyle = "#0b1d6b";
      ctx.fillText("FASE COMPLETA!", W / 2 + 1, H * 0.2 + 1);
      ctx.fillStyle = "#fff";
      ctx.fillText("FASE COMPLETA!", W / 2, H * 0.2);
    }

    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
  };
}
