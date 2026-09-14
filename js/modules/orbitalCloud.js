// =============================================================================
// Orbital Cloud - 3D electron-density particle trails on a 2D canvas
// Each electron shell becomes a swarm of particles orbiting the nucleus on
// randomly tilted planes. Radii follow a screened hydrogenic model (r ∝ n²/Zeff),
// compressed so outer shells stay on screen.
// =============================================================================

// Inner shells glow warm, outer shells cool (K → Q)
const SHELL_COLORS = [
  [255, 236, 150],
  [214, 240, 90],
  [60, 220, 170],
  [40, 185, 230],
  [70, 130, 245],
  [120, 100, 240],
  [170, 90, 230],
];

const PARTICLES_PER_ELECTRON = 40;
const MAX_PARTICLES = 3600;

function randomUnitVector() {
  const z = Math.random() * 2 - 1;
  const a = Math.random() * Math.PI * 2;
  const s = Math.sqrt(1 - z * z);
  return [s * Math.cos(a), s * Math.sin(a), z];
}

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function normalize(v) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

// Slater-style screening: electrons in inner shells shield the outer ones
function shellRadii(shellCounts, atomicNumber) {
  let inner = 0;
  const raw = shellCounts.map((count, i) => {
    const n = i + 1;
    const zEff = Math.max(1, atomicNumber - 0.85 * inner - 0.35 * Math.max(0, count - 1));
    inner += count;
    return (n * n) / zEff;
  });
  const outer = raw[raw.length - 1] || 1;
  // Compress the dynamic range so K is visible next to the valence shell
  return raw.map((r, i) => {
    const linear = r / outer;
    const layered = (i + 1) / raw.length;
    return 0.12 + 0.88 * (0.35 * Math.pow(linear, 0.5) + 0.65 * layered);
  });
}

export function createOrbitalCloud(canvas, shellCounts, atomicNumber) {
  const ctx = canvas.getContext("2d");
  const radii = shellRadii(shellCounts, atomicNumber);
  const totalElectrons = shellCounts.reduce((a, b) => a + b, 0) || 1;
  const perElectron = Math.min(PARTICLES_PER_ELECTRON, MAX_PARTICLES / totalElectrons);

  const particles = [];
  shellCounts.forEach((count, shell) => {
    const n = Math.max(8, Math.round(count * perElectron));
    for (let i = 0; i < n; i++) {
      const normal = randomUnitVector();
      const helper = Math.abs(normal[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
      const u = normalize(cross(normal, helper));
      const v = cross(normal, u);
      // Radial probability spread around the shell's most likely radius
      const spread = 1 + (Math.random() + Math.random() - 1) * 0.35;
      const r = radii[shell] * spread;
      particles.push({
        shell,
        u,
        v,
        r,
        angle: Math.random() * Math.PI * 2,
        speed: (0.35 + Math.random() * 0.5) / Math.pow(r + 0.15, 1.5),
        wobble: Math.random() * Math.PI * 2,
        prev: null,
      });
    }
  });

  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = 0;
  let lastTime = 0;
  let paused = false;
  let focusShell = null;
  let yaw = 0;
  let pitch = 0.35;
  let dragging = null;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#070b16";
    ctx.fillRect(0, 0, width, height);
    particles.forEach((p) => (p.prev = null));
  }

  function project(x, y, z, scale, cx, cy) {
    // rotate around Y (yaw) then X (pitch)
    const cyw = Math.cos(yaw);
    const syw = Math.sin(yaw);
    const x1 = x * cyw + z * syw;
    const z1 = -x * syw + z * cyw;
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const y2 = y * cp - z1 * sp;
    const z2 = y * sp + z1 * cp;
    const perspective = 2.6 / (2.6 + z2);
    return [cx + x1 * scale * perspective, cy + y2 * scale * perspective, z2];
  }

  function drawNucleus(cx, cy, scale) {
    const glowRadius = scale * 0.1;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
    glow.addColorStop(0, "rgba(255, 250, 220, 0.9)");
    glow.addColorStop(0.25, "rgba(255, 210, 90, 0.45)");
    glow.addColorStop(1, "rgba(255, 170, 40, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  function frame(time) {
    rafId = requestAnimationFrame(frame);
    const globalPaused = window._emmanuelLabAnimPaused === true;
    const speedMul = typeof window._emmanuelLabAnimSpeed === "number" ? window._emmanuelLabAnimSpeed : 1;
    const dt = Math.min(0.05, (time - (lastTime || time)) / 1000);
    lastTime = time;
    if (paused || globalPaused) return;

    const cx = width / 2;
    const cy = height / 2;
    const scale = Math.min(width, height) * 0.46;

    // Fade previous frame to leave trails
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(7, 11, 22, 0.07)";
    ctx.fillRect(0, 0, width, height);

    if (!dragging) yaw += dt * 0.08 * speedMul;

    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (const p of particles) {
      p.angle += p.speed * dt * 1.6 * speedMul;
      p.wobble += dt * 0.7;
      const r = p.r * (1 + Math.sin(p.wobble) * 0.04);
      const c = Math.cos(p.angle) * r;
      const s = Math.sin(p.angle) * r;
      const pt = project(
        p.u[0] * c + p.v[0] * s,
        p.u[1] * c + p.v[1] * s,
        p.u[2] * c + p.v[2] * s,
        scale, cx, cy,
      );
      if (p.prev) {
        const depth = (1.2 - pt[2]) / 2.2;
        const dim = focusShell === null || focusShell === p.shell ? 1 : 0.08;
        const [red, green, blue] = SHELL_COLORS[p.shell % SHELL_COLORS.length];
        ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${(0.18 + depth * 0.5) * dim})`;
        ctx.lineWidth = 0.6 + depth * 1.1;
        ctx.beginPath();
        ctx.moveTo(p.prev[0], p.prev[1]);
        ctx.lineTo(pt[0], pt[1]);
        ctx.stroke();
      }
      p.prev = pt;
    }
    drawNucleus(cx, cy, scale);
  }

  function onPointerDown(e) {
    dragging = { x: e.clientX, y: e.clientY, yaw, pitch };
    canvas.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragging) return;
    yaw = dragging.yaw + (e.clientX - dragging.x) * 0.008;
    pitch = Math.max(-1.4, Math.min(1.4, dragging.pitch + (e.clientY - dragging.y) * 0.008));
    particles.forEach((p) => (p.prev = null));
  }

  function onPointerUp() {
    dragging = null;
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  resize();
  rafId = requestAnimationFrame(frame);

  return {
    setFocusShell(shellIndex) {
      focusShell = shellIndex;
    },
    setPaused(value) {
      paused = value;
    },
    isPaused() {
      return paused;
    },
    destroy() {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    },
  };
}
