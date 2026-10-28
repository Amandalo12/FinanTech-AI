import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const COLORS = { purple: 0x8b5cf6, violet: 0xa855f7, blue: 0x3b82f6, cyan: 0x22d3ee };
const PALETTE = [COLORS.purple, COLORS.violet, COLORS.blue, COLORS.cyan];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Gráfico de candles neon com linha de tendência. */
function makeChart(count: number, seed: number): THREE.Group {
  const rnd = mulberry32(seed);
  const group = new THREE.Group();
  const spacing = 0.42;
  const closes: THREE.Vector3[] = [];
  let price = 0;

  for (let i = 0; i < count; i++) {
    const open = price;
    const close = open + (rnd() - 0.4) * 0.7;
    price = close;
    const high = Math.max(open, close) + rnd() * 0.35;
    const low = Math.min(open, close) - rnd() * 0.35;
    const color = close >= open ? COLORS.cyan : COLORS.violet;
    const x = (i - count / 2) * spacing;
    const bodyHeight = Math.max(Math.abs(close - open), 0.06);

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, bodyHeight, 0.22),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, depthWrite: false }),
    );
    body.position.set(x, (open + close) / 2, 0);
    body.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(body.geometry),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 }),
      ),
    );

    const wick = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, high - low, 0.03),
      new THREE.MeshBasicMaterial({ color }),
    );
    wick.position.set(x, (high + low) / 2, 0);

    group.add(body, wick);
    closes.push(new THREE.Vector3(x, close, 0.3));
  }

  group.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(closes),
      new THREE.LineBasicMaterial({ color: COLORS.blue, transparent: true, opacity: 0.85 }),
    ),
  );
  return group;
}

function glowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.25)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function createRenderer(lite: boolean): THREE.WebGLRenderer | null {
  try {
    return new THREE.WebGLRenderer({ antialias: !lite, alpha: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
}

interface Floater {
  object: THREE.Object3D;
  base: THREE.Vector3;
  phase: number;
  amp: number;
  speed: number;
  spin: number;
}

/**
 * Fundo 3D: piso em grid, gráficos de candles flutuantes, partículas, esferas ligadas por linhas,
 * formas de vidro e brilhos volumétricos. Fica atrás da interface e ignora cliques.
 * Usa versão reduzida em aparelhos modestos e um único quadro com "movimento reduzido".
 */
export default function Background3D() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lite =
      window.innerWidth < 768 ||
      (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
      (navigator.hardwareConcurrency || 8) <= 4;

    const renderer = createRenderer(lite);
    if (!renderer) {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1 : 1.5));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080a12, 0.022);
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 140);
    camera.position.set(0, 2, 9);

    // Luzes
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const purpleLight = new THREE.PointLight(COLORS.purple, 180, 0, 2);
    purpleLight.position.set(-8, 6, 2);
    const blueLight = new THREE.PointLight(COLORS.blue, 180, 0, 2);
    blueLight.position.set(8, 4, -4);
    scene.add(purpleLight, blueLight);

    // Piso em perspectiva
    const grid = new THREE.GridHelper(90, 90, COLORS.purple, COLORS.blue);
    grid.position.y = -2.5;
    const gridMaterial = grid.material as THREE.LineBasicMaterial;
    gridMaterial.transparent = true;
    gridMaterial.opacity = 0.38;
    scene.add(grid);

    // Brilhos volumétricos
    const glow = glowTexture();
    const glowSprites: THREE.Sprite[] = [];
    ([
      [COLORS.purple, -10, 6, -26, 46, 0.32],
      [COLORS.blue, 12, 2, -30, 52, 0.26],
    ] as const).forEach(([color, x, y, z, scale, opacity]) => {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glow,
          color,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          fog: false,
        }),
      );
      sprite.position.set(x, y, z);
      sprite.scale.set(scale, scale, 1);
      glowSprites.push(sprite);
      scene.add(sprite);
    });

    // Gráficos financeiros flutuantes
    const floaters: Floater[] = [];
    const addFloater = (
      object: THREE.Object3D,
      pos: [number, number, number],
      amp: number,
      speed: number,
      spin: number,
    ) => {
      object.position.set(...pos);
      scene.add(object);
      floaters.push({
        object,
        base: new THREE.Vector3(...pos),
        phase: floaters.length * 1.7,
        amp,
        speed,
        spin,
      });
    };

    const chartLeft = makeChart(lite ? 12 : 16, 11);
    chartLeft.rotation.y = 0.5;
    addFloater(chartLeft, [-10, 0.8, -9], 0.25, 0.6, 0.12);

    const chartHero = makeChart(lite ? 14 : 20, 29);
    chartHero.scale.setScalar(1.5);
    chartHero.rotation.y = -0.45;
    addFloater(chartHero, [7.5, 2.4, -11], 0.3, 0.5, 0.1);

    if (!lite) {
      const chartFar = makeChart(26, 47);
      chartFar.scale.setScalar(2.6);
      addFloater(chartFar, [-1, 4.5, -26], 0.4, 0.35, 0.05);
    }

    // Formas de vidro translúcidas
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x7c6cf6,
      transparent: true,
      opacity: 0.14,
      roughness: 0.15,
      metalness: 0.6,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const shapes: [THREE.BufferGeometry, [number, number, number]][] = [
      [new THREE.IcosahedronGeometry(1.1), [-11, 3.5, -14]],
      [new THREE.OctahedronGeometry(1.3), [11, -0.2, -8]],
      [new THREE.TorusGeometry(0.9, 0.28, 12, 32), [-5, 6, -20]],
      [new THREE.BoxGeometry(1.5, 1.5, 1.5), [13, 5.5, -18]],
    ];
    shapes.slice(0, lite ? 2 : 4).forEach(([geometry, pos], i) => {
      const mesh = new THREE.Mesh(geometry, glassMaterial);
      mesh.add(
        new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry),
          new THREE.LineBasicMaterial({ color: COLORS.cyan, transparent: true, opacity: 0.45 }),
        ),
      );
      addFloater(mesh, pos, 0.35, 0.5 + i * 0.1, 0.25 + i * 0.05);
    });

    // Partículas luminosas
    const rnd = mulberry32(7);
    const particleCount = lite ? 250 : 700;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const tmp = new THREE.Color();
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (rnd() - 0.5) * 46;
      positions[i * 3 + 1] = rnd() * 14 - 2.5;
      positions[i * 3 + 2] = -32 + rnd() * 38;
      tmp.setHex(PALETTE[Math.floor(rnd() * PALETTE.length)]);
      colors.set([tmp.r, tmp.g, tmp.b], i * 3);
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        size: 0.07,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    scene.add(particles);

    // Esferas em várias profundidades, conectadas por linhas de dados
    const sphereCount = lite ? 8 : 16;
    const spheres: Floater[] = [];
    for (let i = 0; i < sphereCount; i++) {
      const radius = 0.07 + rnd() * 0.16;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 16, 12),
        new THREE.MeshBasicMaterial({
          color: PALETTE[i % PALETTE.length],
          transparent: true,
          opacity: 0.9,
        }),
      );
      const pos = new THREE.Vector3((rnd() - 0.5) * 24, rnd() * 8 - 1.5, -2 - rnd() * 22);
      mesh.position.copy(pos);
      scene.add(mesh);
      spheres.push({
        object: mesh,
        base: pos,
        phase: rnd() * 6.28,
        amp: 0.2 + rnd() * 0.4,
        speed: 0.4 + rnd() * 0.5,
        spin: 0,
      });
    }
    const pairs: [number, number][] = [];
    for (let i = 0; i < spheres.length && pairs.length < 24; i++) {
      for (let j = i + 1; j < spheres.length && pairs.length < 24; j++) {
        if (spheres[i].base.distanceTo(spheres[j].base) < 9) pairs.push([i, j]);
      }
    }
    const linkPositions = new Float32Array(pairs.length * 6);
    const linkGeometry = new THREE.BufferGeometry();
    const linkAttribute = new THREE.BufferAttribute(linkPositions, 3);
    linkGeometry.setAttribute("position", linkAttribute);
    scene.add(
      new THREE.LineSegments(
        linkGeometry,
        new THREE.LineBasicMaterial({ color: COLORS.blue, transparent: true, opacity: 0.28 }),
      ),
    );

    // Atualização por quadro
    const target = { x: 0, y: 0 };
    const clock = new THREE.Clock();

    const update = (t: number) => {
      grid.position.z = (t * 0.6) % 1;

      for (const f of floaters) {
        f.object.position.y = f.base.y + Math.sin(t * f.speed + f.phase) * f.amp;
        f.object.rotation.y += f.spin * 0.004;
        if (f.spin > 0.2) f.object.rotation.x += f.spin * 0.002;
      }
      for (const s of spheres) {
        s.object.position.y = s.base.y + Math.sin(t * s.speed + s.phase) * s.amp;
        s.object.position.x = s.base.x + Math.cos(t * s.speed * 0.7 + s.phase) * s.amp * 0.6;
      }
      pairs.forEach(([a, b], i) => {
        linkAttribute.setXYZ(i * 2, ...(spheres[a].object.position.toArray() as [number, number, number]));
        linkAttribute.setXYZ(i * 2 + 1, ...(spheres[b].object.position.toArray() as [number, number, number]));
      });
      linkAttribute.needsUpdate = true;

      particles.rotation.y = t * 0.012;
      particles.position.y = Math.sin(t * 0.2) * 0.3;
      glowSprites.forEach((sprite, i) => {
        sprite.material.opacity = (i === 0 ? 0.3 : 0.24) + Math.sin(t * 0.3 + i) * 0.04;
      });

      camera.position.x += (target.x - camera.position.x) * 0.04;
      camera.position.y += (2 + target.y - camera.position.y) * 0.04;
      camera.lookAt(0, 1.5, -8);
    };

    let raf = 0;
    const renderOnce = () => {
      update(clock.getElapsedTime());
      renderer.render(scene, camera);
    };
    const frame = () => {
      renderOnce();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const start = () => {
      if (raf || document.hidden || reduce.matches) return;
      raf = requestAnimationFrame(frame);
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.fov = w / h < 0.8 ? 70 : 55;
      camera.updateProjectionMatrix();
      if (!raf) renderOnce();
    };
    const onPointerMove = (e: PointerEvent) => {
      if (reduce.matches) return;
      target.x = (e.clientX / window.innerWidth - 0.5) * 1.6;
      target.y = -(e.clientY / window.innerHeight - 0.5) * 0.8;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else if (reduce.matches) renderOnce();
      else start();
    };
    const onMotionChange = () => {
      if (reduce.matches) {
        stop();
        target.x = target.y = 0;
        renderOnce();
      } else {
        start();
      }
    };
    const onContextLost = (e: Event) => {
      e.preventDefault();
      stop();
      setFailed(true);
    };

    resize();
    start();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", onMotionChange);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onMotionChange);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      scene.traverse((obj) => {
        const o = obj as THREE.Mesh;
        o.geometry?.dispose();
        const material = o.material as THREE.Material | THREE.Material[] | undefined;
        if (material) {
          (Array.isArray(material) ? material : [material]).forEach((m) => m.dispose());
        }
      });
      glow.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} className={`bg3d${failed ? " bg3d--fallback" : ""}`} aria-hidden="true" />;
}
