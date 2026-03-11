import React, { useRef, useEffect } from "react";

// ── Color palette (RGB tuples for fast rgba construction) ────────
const PALETTE = [
  [255, 230, 110],  // bright gold flash
  [255, 185, 55],   // amber
  [251, 146, 60],   // orange-400
  [249, 115, 22],   // orange-500
  [234,  88, 12],   // orange-600
  [255, 120, 70],   // red-orange
  [255, 248, 170],  // near-white gold
];

// Normalized spawn zones [xFrac, yFrac]
const ORIGINS = [
  [0.50, 0.38], [0.30, 0.43], [0.70, 0.43],
  [0.50, 0.27], [0.38, 0.53], [0.62, 0.53],
  [0.22, 0.36], [0.78, 0.36],
];

// ── Particle class ───────────────────────────────────────────────
class Particle {
  constructor() { this.active = false; }

  reset(x, y, angle, speed, ci, size, lifetime, drag) {
    this.active   = true;
    this.x = this.px = x;
    this.y = this.py = y;
    this.vx       = Math.cos(angle) * speed;
    this.vy       = Math.sin(angle) * speed;
    this.drag     = drag;
    this.ci       = ci;
    this.size     = this.initSize = size;
    this.age      = 0;
    this.lifetime = lifetime;
    this.alpha    = 0;
  }

  update() {
    this.px  = this.x;
    this.py  = this.y;
    this.vx *= this.drag;
    this.vy  = this.vy * this.drag + 0.038; // drag + gravity
    this.x  += this.vx;
    this.y  += this.vy;
    this.age++;
    const t    = this.age / this.lifetime;
    // fast fade-in, smooth fade-out
    this.alpha = t < 0.1 ? t / 0.1 : Math.pow(1 - t, 1.7);
    this.size  = this.initSize * Math.max(0.05, 1 - t * 0.82);
    if (this.age >= this.lifetime) this.active = false;
  }
}

// ── Component ────────────────────────────────────────────────────
export default function FireworkCanvas() {
  const canvasRef = useRef(null);
  // Particle pool — reused each burst to avoid GC pressure
  const poolRef   = useRef(Array.from({ length: 320 }, () => new Particle()));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext("2d");
    const pool = poolRef.current;

    let w = 0, h = 0, raf = null, frame = 0, countdown = 8;
    const pending = []; // deferred secondary sparks

    // ── Resize ────────────────────────────────────────────────────
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width  = w * dpr; canvas.height = h * dpr;
      canvas.style.width  = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Pool helpers ──────────────────────────────────────────────
    const acquire = () => {
      for (let i = 0; i < pool.length; i++) {
        if (!pool[i].active) return pool[i];
      }
      return null;
    };

    const activeCount = () => {
      let n = 0;
      for (let i = 0; i < pool.length; i++) if (pool[i].active) n++;
      return n;
    };

    // ── Spawn a burst ─────────────────────────────────────────────
    const spawnBurst = (bx, by) => {
      const scale = Math.min(w, h) / 480;
      const r  = Math.random();
      // three burst sizes: small / medium / large
      const n  = r < 0.30 ? 28 + (Math.random() * 12 | 0)
               : r < 0.70 ? 40 + (Math.random() * 16 | 0)
               :             52 + (Math.random() * 18 | 0);
      const sp = (r < 0.30 ? 2.8 : r < 0.70 ? 3.8 : 5.1)
                  * scale * (0.85 + Math.random() * 0.4);
      const lt = ((r < 0.30 ? 60 : r < 0.70 ? 78 : 96)
                  * (0.82 + Math.random() * 0.36)) | 0;
      const dr = 0.905 + Math.random() * 0.025;
      const sz = (1.5 + Math.random() * 1.2) * scale;

      // dominant color pair for this burst
      const c1 = Math.floor(Math.random() * PALETTE.length);
      const c2 = Math.floor(Math.random() * PALETTE.length);

      for (let i = 0; i < n; i++) {
        const pt = acquire();
        if (!pt) continue;
        const angle = (Math.PI * 2 * i / n) + (Math.random() - 0.5) * 0.32;
        const spd   = sp * (0.65 + Math.random() * 0.72);
        const plt   = (lt * (0.78 + Math.random() * 0.44)) | 0;
        const ci    = Math.random() < 0.72 ? c1 : c2;
        const psz   = sz * (0.62 + Math.random() * 0.76);
        pt.reset(bx, by, angle, spd, ci, psz, plt, dr);

        // 12% chance: queue a secondary spark
        if (Math.random() < 0.12) {
          pending.push({ atFrame: frame + ((plt * 0.30) | 0), parent: pt, ci });
        }
      }
    };

    // ── Countdown rhythm ──────────────────────────────────────────
    const nextCD = () => {
      const r = Math.random();
      if (r < 0.20) return 18 + (Math.random() * 20 | 0);   // quick 0.3–0.6s
      if (r < 0.62) return 52 + (Math.random() * 42 | 0);   // normal 0.9–1.6s
      return              98 + (Math.random() * 48 | 0);    // pause  1.6–2.4s
    };

    const triggerSpawn = () => {
      if (activeCount() > 200) { countdown = 28; return; }
      const o  = ORIGINS[Math.floor(Math.random() * ORIGINS.length)];
      const bx = o[0] * w + (Math.random() - 0.5) * w * 0.10;
      const by = o[1] * h + (Math.random() - 0.5) * h * 0.10;
      spawnBurst(bx, by);
      countdown = nextCD();
    };

    // Staggered first bursts
    triggerSpawn();
    setTimeout(triggerSpawn, 1100);
    setTimeout(triggerSpawn, 2350);

    // ── Render loop ───────────────────────────────────────────────
    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      // Fire pending secondary sparks
      for (let i = pending.length - 1; i >= 0; i--) {
        const s = pending[i];
        if (frame >= s.atFrame) {
          const sp2 = acquire();
          if (sp2 && s.parent.active) {
            const baseA = Math.atan2(s.parent.vy, s.parent.vx);
            const spd2  = Math.hypot(s.parent.vx, s.parent.vy) * 0.55;
            const ang2  = baseA + (Math.random() - 0.5) * 0.9;
            sp2.reset(
              s.parent.x, s.parent.y, ang2, spd2, s.ci,
              s.parent.initSize * 0.45,
              (s.parent.lifetime * 0.32) | 0,
              0.895
            );
          }
          pending.splice(i, 1);
        }
      }

      if (--countdown <= 0) triggerSpawn();

      ctx.lineCap = "round";

      for (let i = 0; i < pool.length; i++) {
        const pt = pool[i];
        if (!pt.active) continue;
        pt.update();
        if (!pt.active || pt.alpha < 0.015) continue;

        const [r, g, b] = PALETTE[pt.ci];
        const a = pt.alpha;

        // Extended streak tail — longer early in life, shorter as particle slows
        const tAge = pt.age / pt.lifetime;
        const trailMult = 2.5 + (1 - tAge) * 4.0;
        const tailX = pt.x - pt.vx * trailMult;
        const tailY = pt.y - pt.vy * trailMult;

        // ── Wide soft glow ──
        ctx.strokeStyle = `rgba(${r},${g},${b},${a * 0.22})`;
        ctx.lineWidth   = pt.size * 6;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();

        // ── Mid glow ──
        ctx.strokeStyle = `rgba(${r},${g},${b},${a * 0.55})`;
        ctx.lineWidth   = pt.size * 2.5;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();

        // ── Bright core streak ──
        ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
        ctx.lineWidth   = pt.size * 1.0;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      }

      frame++;
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
      pool.forEach(pt => { pt.active = false; });
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.88 }}
    />
  );
}
