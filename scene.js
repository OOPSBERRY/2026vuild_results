// ======== 3D 방 (Three.js) ========
// 실사 이미지를 쓰고 싶으면 links.js 맨 아래 DESK_IMAGES에 파일 경로만 넣으면 돼요.
(function () {
  const T = THREE;
  const canvas = document.getElementById("scene");
  const renderer = new T.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.14;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;

  const scene = new T.Scene();
  scene.background = new T.Color(0x100d0b);
  scene.fog = new T.FogExp2(0x100d0b, 0.105);
  const camera = new T.PerspectiveCamera(45, 1, 0.05, 30);

  const IMG = window.DESK_IMAGES || {};
  const loader = new T.TextureLoader();
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // ---------- 작은 도우미들 ----------
  const std = (color, rough = 0.7, metal = 0, extra = {}) =>
    new T.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal }, extra));

  function canvasTex(w, h, draw, srgb = true) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new T.CanvasTexture(c);
    if (srgb) t.encoding = T.sRGBEncoding;
    t.anisotropy = 8;
    return t;
  }
  function imageTex(path, fallback) {
    if (!path) return fallback;
    const t = loader.load(path);
    t.encoding = T.sRGBEncoding;
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.anisotropy = 8;
    return t;
  }
  function shadowed(obj, cast = true, receive = true) {
    obj.traverse((o) => { if (o.isMesh) { o.castShadow = cast; o.receiveShadow = receive; } });
    return obj;
  }
  function glowTex() {
    return canvasTex(128, 128, (g, w, h) => {
      const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.4, "rgba(255,255,255,.35)"); r.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = r; g.fillRect(0, 0, w, h);
    });
  }

  // ---------- 질감 (코드로 그린 나무결, 벽, 창밖) ----------
  const woodTex = imageTex(IMG.desk, canvasTex(2048, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#5c3a22"); gr.addColorStop(0.5, "#6c4528"); gr.addColorStop(1, "#4e301c");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.filter = "blur(1.2px)";
    for (let i = 0; i < 700; i++) {
      const y = rnd() * h, amp = rnd() * 5, f = rnd() * 0.006 + 0.0015, ph = rnd() * 6, a = rnd() * 0.14;
      g.strokeStyle = rnd() > 0.62 ? `rgba(205,145,90,${a * 0.8})` : `rgba(25,12,5,${a})`;
      g.lineWidth = 2 + rnd() * 5;
      g.beginPath();
      for (let x = 0; x <= w; x += 24) { const yy = y + Math.sin(x * f + ph) * amp; x ? g.lineTo(x, yy) : g.moveTo(x, yy); }
      g.stroke();
    }
    g.fillStyle = "rgba(0,0,0,.6)";
    [h * 0.33, h * 0.66].forEach((y) => g.fillRect(0, y, w, 3));
  }));
  woodTex.wrapS = woodTex.wrapT = T.RepeatWrapping;
  woodTex.repeat.set(1.15, 1);

  const wallTex = imageTex(IMG.wall, canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = "#2b1a10"; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 64) {
      g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(x, 0, 4, h);
      g.fillStyle = "rgba(255,200,140,.05)"; g.fillRect(x + 4, 0, 2, h);
    }
    for (let i = 0; i < 400; i++) { g.strokeStyle = `rgba(0,0,0,${rnd() * 0.18})`; const x = rnd() * w; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + rnd() * 8 - 4, h); g.stroke(); }
  }));

  const viewTex = imageTex(IMG.window, canvasTex(512, 512, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#f0c98e"); sky.addColorStop(0.55, "#b86738"); sky.addColorStop(1, "#4c2618");
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    g.filter = "blur(14px)";
    const cols = ["#43251a", "#6a3b20", "#a56732", "#7b4b23", "#d49a4a"];
    for (let i = 0; i < 70; i++) { g.fillStyle = cols[i % cols.length]; g.globalAlpha = 0.75; g.beginPath(); g.arc(rnd() * w, h * 0.25 + rnd() * h * 0.8, 20 + rnd() * 60, 0, 7); g.fill(); }
  }));

  // ---------- 방 ----------
  const room = new T.Group(); scene.add(room);

  const floor = new T.Mesh(new T.PlaneGeometry(12, 12), std(0x100d0b, 0.94));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; room.add(floor);

  const wall = new T.Mesh(new T.PlaneGeometry(10, 4), std(0xffffff, 0.9, 0, { map: wallTex }));
  wallTex.wrapS = wallTex.wrapT = T.RepeatWrapping; wallTex.repeat.set(4, 1);
  wall.position.set(0, 2, -0.66); wall.receiveShadow = true; room.add(wall);

  // 책상
  const deskTop = new T.Mesh(new T.BoxGeometry(3.6, 0.085, 1.25), std(0xf2dfc6, 0.46, 0, { map: woodTex }));
  deskTop.position.set(0, 0.725, 0); deskTop.castShadow = true; deskTop.receiveShadow = true; room.add(deskTop);
  const deskApron = new T.Mesh(new T.BoxGeometry(3.45, 0.13, 0.06), std(0xffffff, 0.5, 0, { map: woodTex }));
  deskApron.position.set(0, 0.64, 0.57); deskApron.castShadow = deskApron.receiveShadow = true; room.add(deskApron);
  [[-1.7, -0.55], [1.7, -0.55], [-1.7, 0.55], [1.7, 0.55]].forEach(([x, z]) => {
    const leg = new T.Mesh(new T.BoxGeometry(0.075, 0.7, 0.075), std(0xffffff, 0.52, 0, { map: woodTex }));
    leg.position.set(x, 0.35, z); leg.castShadow = true; room.add(leg);
  });

  // 책장 (왼쪽 뒤)
  const shelfMat = std(0x2a170b, 0.75);
  const palette = [0x5a2f1d, 0x4d291d, 0x3d2a1f, 0x6b4a2a, 0x51311e, 0x4a1f1f, 0x7a6a4a, 0x3d3521, 0x5c3b28, 0x6a2c22];
  const shelfSpine = (index) => {
    const map = loader.load("assets/shelf-spines-atlas.png");
    map.encoding = T.sRGBEncoding; map.wrapS = map.wrapT = T.ClampToEdgeWrapping;
    map.repeat.set(1 / 8, 1); map.offset.set((index % 8) / 8, 0); map.anisotropy = 8;
    return std(0xffffff, 0.48, 0, { map });
  };
  const bookMats = palette.map((_, index) => shelfSpine(index));
  const goldMat = std(0xd9b865, 0.4, 0.6);
  const shelfX0 = -1.75, shelfX1 = 0.35;
  [0.8, 1.17, 1.54, 1.91].forEach((y, row) => {
    const board = new T.Mesh(new T.BoxGeometry(shelfX1 - shelfX0, 0.03, 0.3), shelfMat);
    board.position.set((shelfX0 + shelfX1) / 2, y, -0.5); board.castShadow = board.receiveShadow = true; room.add(board);
    if (row === 3) return;
    let x = shelfX0 + 0.04;
    while (x < shelfX1 - 0.06) {
      const w = 0.025 + rnd() * 0.03, h = 0.22 + rnd() * 0.11;
      if (rnd() < 0.05) { x += 0.08; continue; }
      const m = new T.Mesh(new T.BoxGeometry(w, h, 0.2), bookMats[Math.floor(rnd() * bookMats.length)]);
      m.position.set(x + w / 2, y + 0.015 + h / 2, -0.49);
      m.castShadow = m.receiveShadow = true; room.add(m);
      const band = new T.Mesh(new T.BoxGeometry(w + 0.001, 0.006, 0.201), goldMat);
      band.position.set(m.position.x, m.position.y + h * 0.3, -0.49); room.add(band);
      x += w + 0.002;
    }
  });
  [shelfX0, shelfX1].forEach((x) => {
    const side = new T.Mesh(new T.BoxGeometry(0.05, 2.0, 0.3), shelfMat);
    side.position.set(x, 1.4, -0.5); side.castShadow = true; room.add(side);
  });

  // 창문 (오른쪽 뒤)
  const win = new T.Group(); win.position.set(0.92, 1.45, -0.64); room.add(win);
  const glass = new T.Mesh(new T.PlaneGeometry(0.8, 1.05), new T.MeshBasicMaterial({ map: viewTex, color: 0xcfd8b0 }));
  win.add(glass);
  const frameMat = std(0x5c3823, 0.52);
  [[0, 0.54, 0.86, 0.05], [0, -0.54, 0.86, 0.05], [-0.42, 0, 0.05, 1.12], [0.42, 0, 0.05, 1.12], [0, 0, 0.03, 1.05], [0, 0.0, 0.8, 0.03]].forEach(([x, y, w, h]) => {
    const f = new T.Mesh(new T.BoxGeometry(w, h, 0.06), frameMat); f.position.set(x, y, 0.02); f.castShadow = true; win.add(f);
  });
  const sill = new T.Mesh(new T.BoxGeometry(1.0, 0.04, 0.22), std(0x3d2417, 0.52));
  sill.position.set(0.92, 0.9, -0.55); sill.receiveShadow = true; room.add(sill);

  // ---------- 빛 ----------
  scene.add(new T.HemisphereLight(0xb8895b, 0x120c0a, 0.48));
  const windowLight = new T.SpotLight(0xffbd72, 0.72, 5, 0.9, 1, 1.5);
  windowLight.position.set(0.92, 1.5, -0.45); windowLight.target.position.set(0.3, 0.75, 0.2);
  scene.add(windowLight, windowLight.target);
  const floorFill = new T.PointLight(0x9b6137, 0.28, 3.6, 2);
  floorFill.position.set(0, 1.0, 1.45); scene.add(floorFill);

  // ---------- 물건 만들기 ----------
  const makers = {
    book() {
      const g = new T.Group();
      const spine = (c) => canvasTex(256, 64, (x, w, h) => {
        x.fillStyle = c; x.fillRect(0, 0, w, h);
        x.fillStyle = "#e3c479";
        [28, 36, w - 36, w - 28].forEach((p) => x.fillRect(p, 0, 4, h));
        x.fillRect(w * 0.32, h * 0.42, w * 0.36, 6);
      });
      const pages = std(0xe9ddc0, 0.9);
      const mk = (w, h, d, col, st) => {
        const cover = std(0xffffff, 0.6, 0, { map: spine(col) });
        const cov2 = std(col, 0.6);
        return new T.Mesh(new T.BoxGeometry(w, h, d), [pages, pages, cov2, cov2, cover, pages]);
      };
      const b1 = mk(0.3, 0.06, 0.21, "#5a3320"); b1.position.y = 0.03;
      const b2 = mk(0.27, 0.05, 0.19, "#2f4a3a"); b2.position.set(0.01, 0.085, 0); b2.rotation.y = 0.12;
      g.add(b1, b2);
      g.userData.anchor = new T.Vector3(0, 0.1, 0);
      return shadowed(g);
    },
    lamp() {
      const g = new T.Group();
      const base = new T.Mesh(new T.CylinderGeometry(0.075, 0.085, 0.025, 32), std(0x2a170b, 0.5));
      base.position.y = 0.0125;
      const stem = new T.Mesh(new T.CylinderGeometry(0.006, 0.006, 0.3, 12), std(0xc9a24a, 0.3, 0.9));
      stem.position.y = 0.17;
      const shade = new T.Mesh(new T.SphereGeometry(0.12, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), std(0x1a1512, 0.35, 0.7, { side: T.DoubleSide }));
      shade.position.y = 0.3; shade.castShadow = false;
      const disc = new T.Mesh(new T.CircleGeometry(0.118, 40), new T.MeshBasicMaterial({ color: 0xfff0c8 }));
      disc.rotation.x = Math.PI / 2; disc.position.y = 0.3; // 아래를 향해 빛나는 면
      disc.rotation.x = -Math.PI / 2; disc.position.y = 0.299;
      const knob = new T.Mesh(new T.CylinderGeometry(0.008, 0.008, 0.03, 10), std(0xc9a24a, 0.3, 0.9)); knob.position.y = 0.43;
      g.add(base, stem, shade, disc, knob);
      const light = new T.PointLight(0xffb468, 0.92, 2.8, 1.7);
      light.position.set(0, 0.27, 0.02); light.castShadow = true;
      light.shadow.mapSize.set(1024, 1024); light.shadow.bias = -0.003; light.shadow.radius = 4;
      g.add(light);
      const halo = new T.Sprite(new T.SpriteMaterial({ map: glowTex(), color: 0xffb860, transparent: true, opacity: 0.2, depthWrite: false, blending: T.AdditiveBlending }));
      halo.scale.set(0.38, 0.38, 1); halo.position.y = 0.25; g.add(halo);
      shadowed(g, true, false); shade.castShadow = false; stem.castShadow = false;
      g.userData.anchor = new T.Vector3(0, 0.25, 0);
      return g;
    },
    mug() {
      const g = new T.Group();
      const cream = std(0x211713, 0.25, 0.08), dark = std(0x0e0b0a, 0.32, 0.02);
      const outer = [[0.001, 0], [0.04, 0], [0.045, 0.02], [0.05, 0.06], [0.052, 0.1]];
      const rim = [[0.052, 0.1], [0.05, 0.102], [0.046, 0.1]];
      const inner = [[0.046, 0.1], [0.044, 0.06], [0.04, 0.02], [0.001, 0.015]];
      const lathe = (pts, m, seg = 40) => new T.Mesh(new T.LatheGeometry(pts.map((p) => new T.Vector2(p[0], p[1])), seg), Object.assign(m, { side: T.DoubleSide }));
      const lower = [[0.0011, 0.0005], [0.0405, 0.0005], [0.0455, 0.02], [0.0505, 0.0575]];
      g.add(lathe(outer, cream), lathe(rim, cream), lathe(inner, cream.clone()), lathe(lower.map((p) => [p[0] + 0.0008, p[1]]), dark));
      const tea = new T.Mesh(new T.CircleGeometry(0.043, 32), std(0x4c1f12, 0.22));
      tea.rotation.x = -Math.PI / 2; tea.position.y = 0.085; g.add(tea);
      const handle = new T.Mesh(new T.TorusGeometry(0.03, 0.007, 12, 24, Math.PI), cream);
      handle.position.set(0.048, 0.055, 0); handle.rotation.z = -Math.PI / 2; g.add(handle);
      const coaster = new T.Mesh(new T.CylinderGeometry(0.065, 0.065, 0.008, 40), std(0x1a1110, 0.44));
      coaster.position.y = -0.004; g.add(coaster);
      g.position.y = 0;
      // 김
      g.userData.steam = [0, 1, 2].map((i) => {
        const s = new T.Sprite(new T.SpriteMaterial({ map: glowTex(), color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
        s.scale.set(0.05, 0.05, 1); s.userData.phase = i / 3; g.add(s); return s;
      });
      g.scale.setScalar(1.25);
      g.userData.anchor = new T.Vector3(0, 0.07, 0).multiplyScalar(1.25);
      return shadowed(g);
    },
    plant() {
      const g = new T.Group();
      const pot = new T.Mesh(new T.CylinderGeometry(0.075, 0.055, 0.12, 36, 1, true), std(0x765033, 0.38, 0.48, { side: T.DoubleSide }));
      pot.position.y = 0.06;
      const bottom = new T.Mesh(new T.CircleGeometry(0.055, 24), std(0x2b1c14, 0.8)); bottom.rotation.x = -Math.PI / 2; bottom.position.y = 0.001;
      const soil = new T.Mesh(new T.CircleGeometry(0.072, 32), std(0x2a1b10, 1)); soil.rotation.x = -Math.PI / 2; soil.position.y = 0.105;
      const rim = new T.Mesh(new T.TorusGeometry(0.075, 0.006, 8, 36), std(0xb99a63, 0.34, 0.72)); rim.rotation.x = Math.PI / 2; rim.position.y = 0.12;
      g.add(pot, bottom, soil, rim);
      const greens = [0x7fae4e, 0x5f9140, 0x9bc15f, 0x4a7c35].map((c) => std(c, 0.55, 0, { side: T.DoubleSide }));
      for (let i = 0; i < 30; i++) {
        const len = 0.18 + rnd() * 0.16;
        const geo = new T.PlaneGeometry(0.014, len, 1, 8);
        const lean = 0.25 + rnd() * 0.7, bend = 0.5 + rnd() * 0.9;
        const pos = geo.attributes.position;
        for (let v = 0; v < pos.count; v++) {
          const t = (pos.getY(v) + len / 2) / len;
          pos.setZ(v, Math.pow(t, 2) * bend * 0.2);
          pos.setX(v, pos.getX(v) * (1 - t * 0.85));
        }
        geo.computeVertexNormals();
        const blade = new T.Mesh(geo, greens[i % 4]);
        blade.geometry.translate(0, len / 2, 0);
        blade.position.set((rnd() - 0.5) * 0.04, 0.11, (rnd() - 0.5) * 0.04);
        blade.rotation.set(0, rnd() * Math.PI * 2, 0);
        const holder = new T.Group(); holder.add(blade); holder.position.copy(blade.position); blade.position.set(0, 0, 0);
        holder.rotation.set(Math.sin(blade.rotation.y) * 0, blade.rotation.y, 0);
        blade.rotation.set(-lean * 0.7, 0, 0);
        g.add(holder);
      }
      g.userData.anchor = new T.Vector3(0, 0.15, 0);
      return shadowed(g);
    }
  };

  // ---------- 물건 놓기 (links.js 순서대로) ----------
  const links = window.DESK_LINKS || [];
  const items = [];
  const n = links.length;
  const gap = Math.min(0.52, 1.7 / Math.max(1, n - 1));
  links.forEach((lk, i) => {
    const g = (makers[lk.object] || makers.book)();
    const x = (i - (n - 1) / 2) * gap;
    g.position.set(x, 0.75, -0.22);
    const objectScale = { book: 1.55, lamp: 1.45, mug: 1.9, plant: 1.45 };
    g.scale.multiplyScalar(objectScale[lk.object] || 1.3);
    g.userData.baseY = 0.75; g.userData.hover = 0; g.userData.sel = 0;
    room.add(g);
    const mats = [];
    g.traverse((o) => { if (o.isMesh && o.material && o.material.emissive) mats.push(o.material); });
    g.userData.mats = mats;
    items.push(g);
  });

  // ---------- 노트 (책상 앞쪽에 놓인 펼친 공책) ----------
  // 책상 위 흰 공책: 물건을 누르면 이 공책 두 페이지에 글이 써져요
  const NB = { w: 0.62, d: 0.46 };
  const BTN = { x: 90, y: 500, w: 620, h: 150 };           // 오른쪽 페이지 안 버튼 자리 (캔버스 픽셀)
  const mkPage = () => {
    const c = document.createElement("canvas"); c.width = 1024; c.height = 756;
    const tex = new T.CanvasTexture(c); tex.encoding = T.sRGBEncoding; tex.anisotropy = 8;
    return { c, tex, g: c.getContext("2d") };
  };
  const PL = mkPage(), PR = mkPage();
  const nb = new T.Group();
  const leatherTex = canvasTex(320, 320, (g, w, h) => {
    g.fillStyle = "#1a1412"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { const a = rnd() * 0.09; g.fillStyle = `rgba(255,232,200,${a})`; g.fillRect(rnd() * w, rnd() * h, 1, 1); }
  });
  const deskPad = new T.Mesh(new T.BoxGeometry(NB.w * 2 + 0.28, 0.018, NB.d + 0.2), std(0xffffff, 0.35, 0, { map: leatherTex }));
  deskPad.position.y = -0.014; nb.add(deskPad);
  const edge = std(0xe7dcc2, 0.9);
  const pageGeo = new T.BoxGeometry(NB.w, 0.012, NB.d);
  const pl = new T.Mesh(pageGeo, [edge, edge, std(0xffffff, 0.85, 0, { map: PL.tex }), edge, edge, edge]);
  const pr = new T.Mesh(pageGeo, [edge, edge, std(0xffffff, 0.85, 0, { map: PR.tex }), edge, edge, edge]);
  pl.position.set(-NB.w / 2 - 0.003, 0.012, 0); pr.position.set(NB.w / 2 + 0.003, 0.012, 0);
  const cover = new T.Mesh(new T.BoxGeometry(NB.w * 2 + 0.05, 0.012, NB.d + 0.03), std(0x4a2a18, 0.6));
  cover.position.y = 0.002;
  nb.add(cover, pl, pr);
  const bookmark = new T.Mesh(new T.BoxGeometry(0.026, 0.008, 0.19), std(0x8a2f2a, 0.55));
  bookmark.position.set(0.11, 0.028, 0.19); nb.add(bookmark);
  for (let i = 0; i < 14; i++) {      // 가운데 스프링
    const ring = new T.Mesh(new T.TorusGeometry(0.012, 0.0025, 8, 16), std(0x9a9a9a, 0.3, 0.9));
    ring.position.set(0, 0.02, -NB.d / 2 + 0.02 + (i * (NB.d - 0.04)) / 13);
    ring.rotation.y = Math.PI / 2; nb.add(ring);
  }
  nb.position.set(0, 0.775, 0.28); nb.rotation.x = 0.08;
  nb.scale.setScalar(1.15);
  shadowed(nb); room.add(nb);

  function wrap(g, text, x, y, maxW, lh) {
    let line = "";
    for (const ch of text) {
      if (g.measureText(line + ch).width > maxW && line) { g.fillText(line, x, y); line = ch === " " ? "" : ch; y += lh; }
      else line += ch;
    }
    if (line) g.fillText(line, x, y);
    return y + lh;
  }
  function paper(P, spineSide) {
    const g = P.g, w = 1024, h = 756;
    const gr = g.createLinearGradient(0, 0, w, 0);
    gr.addColorStop(0, "#f3e9d0"); gr.addColorStop(1, "#e8dcbc");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(185,154,99,.18)"; g.lineWidth = 2;
    for (let y = 90; y < h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    const sh = g.createLinearGradient(spineSide === "right" ? w : 0, 0, spineSide === "right" ? w - 170 : 170, 0);
    sh.addColorStop(0, "rgba(70,45,20,.4)"); sh.addColorStop(1, "rgba(70,45,20,0)");
    g.fillStyle = sh; g.fillRect(0, 0, w, h);
  }
  let pageUrl = "";
  function setPage(c) {
    paper(PL, "right"); paper(PR, "left");
    const L = PL.g, R = PR.g;
    L.textBaseline = "alphabetic"; R.textBaseline = "alphabetic";
    if (!c) {
      L.fillStyle = "rgba(54,37,29,.55)"; L.font = "600 44px Pretendard, SUIT, sans-serif"; L.textAlign = "center";
      L.fillText("책상 위 물건을 눌러 보세요", 460, 390);
      L.textAlign = "left";
    } else {
      L.textAlign = "left";
      L.fillStyle = "#8a5a2b"; L.font = "600 42px Pretendard, SUIT, sans-serif";
      L.fillText("고요한 나의 책상", 80, 120);
      L.fillStyle = "#201713"; L.font = "700 82px Pretendard, SUIT, sans-serif";
      let y = wrap(L, c.name, 80, 235, 760, 104);
      L.font = "48px Pretendard, SUIT, sans-serif"; L.fillStyle = "#4a3320";
      wrap(L, c.desc, 80, y + 24, 760, 72);
      R.textAlign = "left"; R.fillStyle = "#5a3a1f"; R.font = "600 58px Pretendard, SUIT, sans-serif";
      R.fillText("준비됐나요?", 150, 190);
      const soon = !c.url;
      const gr = R.createLinearGradient(0, BTN.y, 0, BTN.y + BTN.h);
      gr.addColorStop(0, soon ? "#cdbf9f" : "#e9a64a"); gr.addColorStop(1, soon ? "#a99a78" : "#c47a22");
      R.fillStyle = soon ? "#6e6248" : "#7e4a12"; R.beginPath(); R.roundRect ? R.roundRect(BTN.x + 40, BTN.y + 10, BTN.w, BTN.h, 75) : R.rect(BTN.x + 40, BTN.y + 10, BTN.w, BTN.h); R.fill();
      R.fillStyle = gr; R.beginPath(); R.roundRect ? R.roundRect(BTN.x + 40, BTN.y, BTN.w, BTN.h, 75) : R.rect(BTN.x + 40, BTN.y, BTN.w, BTN.h); R.fill();
      R.fillStyle = "#2c1707"; R.font = "700 58px Pretendard, SUIT, sans-serif"; R.textAlign = "center";
      R.fillText(soon ? "곧 열려요" : "열어 보기 →", BTN.x + 40 + BTN.w / 2, BTN.y + 94);
    }
    PL.tex.needsUpdate = PR.tex.needsUpdate = true;
    pageUrl = c ? c.url || "" : "";
  }
  setPage(null);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setPage(null));

  // ---------- 의자 (뒤에서 본 모습) ----------
  const chair = new T.Group();
  const cw = std(0x211611, 0.42);
  const leather = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#181110"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1200; i++) { g.fillStyle = `rgba(230,205,175,${rnd() * 0.07})`; g.fillRect(rnd() * w, rnd() * h, 1, 1); }
  });
  const add = (geo, mat, x, y, z) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); chair.add(m); return m; };
  [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]].forEach(([x, z]) => add(new T.BoxGeometry(0.04, 0.46, 0.04), cw, x, 0.23, z));
  add(new T.BoxGeometry(0.5, 0.04, 0.5), cw, 0, 0.44, 0);
  const cushion = add(new T.BoxGeometry(0.46, 0.06, 0.46), std(0xffffff, 0.32, 0, { map: leather }), 0, 0.49, 0);
  [-0.22, 0.22].forEach((x) => add(new T.BoxGeometry(0.04, 0.52, 0.04), cw, x, 0.72, -0.03));
  add(new T.BoxGeometry(0.5, 0.08, 0.05), cw, 0, 0.98, -0.03);
  [-0.12, -0.04, 0.04, 0.12].forEach((x) => add(new T.BoxGeometry(0.035, 0.3, 0.025), cw, x, 0.76, -0.03));
  const backWidth = 0.58, backHeight = 0.46, backRadius = 0.065;
  const backShape = new T.Shape();
  backShape.moveTo(-backWidth / 2 + backRadius, -backHeight / 2);
  backShape.lineTo(backWidth / 2 - backRadius, -backHeight / 2);
  backShape.quadraticCurveTo(backWidth / 2, -backHeight / 2, backWidth / 2, -backHeight / 2 + backRadius);
  backShape.lineTo(backWidth / 2, backHeight / 2 - backRadius);
  backShape.quadraticCurveTo(backWidth / 2, backHeight / 2, backWidth / 2 - backRadius, backHeight / 2);
  backShape.lineTo(-backWidth / 2 + backRadius, backHeight / 2);
  backShape.quadraticCurveTo(-backWidth / 2, backHeight / 2, -backWidth / 2, backHeight / 2 - backRadius);
  backShape.lineTo(-backWidth / 2, -backHeight / 2 + backRadius);
  backShape.quadraticCurveTo(-backWidth / 2, -backHeight / 2, -backWidth / 2 + backRadius, -backHeight / 2);
  const paddedBack = add(new T.ExtrudeGeometry(backShape, { depth: 0.09, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.014, bevelThickness: 0.014, curveSegments: 16 }), std(0xffffff, 0.3, 0, { map: leather }), 0, 0.77, 0.3);
  shadowed(chair);
  chair.position.set(0, -0.12, 1.12);
  room.add(chair);
  const chairMats = []; chair.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; chairMats.push(o.material); } });

  // ---------- 카메라 ----------
  const camA = new T.Vector3(0, 1.48, 3.15), lookA = new T.Vector3(0, 0.98, -0.02);
  const camB = new T.Vector3(0, 1.5, 1.75), lookB = new T.Vector3(0, 0.72, -0.2);
  const cam = camA.clone(), look = lookA.clone();
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let seatP = 0, seating = false, seatT0 = 0, mx = 0, my = 0, ox = 0, oy = 0;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  window.addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const hfov = (72 * Math.PI) / 180;
    camera.fov = Math.min(100, Math.max(44, (2 * Math.atan(Math.tan(hfov / 2) / camera.aspect) * 180) / Math.PI));
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize); resize();

  // ---------- 매 프레임 ----------
  const clock = new T.Clock();
  const v = new T.Vector3(), v2 = new T.Vector3(), right = new T.Vector3();
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;

    if (seating && seatP < 1) { seatP = Math.min(1, (performance.now() - seatT0) / 2800); }
    const e = ease(seatP);
    cam.lerpVectors(camA, camB, e); look.lerpVectors(lookA, lookB, e);
    chair.position.z = 0.95 + 2.2 * e;
    const fade = 1 - Math.min(1, Math.max(0, (seatP - 0.1) / 0.45));
    chairMats.forEach((m) => (m.opacity = fade));
    chair.visible = fade > 0.01;

    ox += (mx * 0.1 - ox) * 0.04; oy += (my * 0.05 - oy) * 0.04;
    const sway = Math.sin(t * 0.4) * 0.006;
    camera.position.set(cam.x + ox + sway, cam.y - oy, cam.z);
    camera.lookAt(look.x + ox * 0.4, look.y - oy * 0.4, look.z);

    items.forEach((g) => {
      const u = g.userData;
      u.curLift = (u.curLift || 0) + (((u.sel ? 0.03 : 0) + (u.hover ? 0.015 : 0)) - (u.curLift || 0)) * 0.12;
      g.position.y = u.baseY + u.curLift;
      const glow = u.sel ? 0.4 : u.hover ? 0.22 : 0;
      u.curGlow = (u.curGlow || 0) + (glow - (u.curGlow || 0)) * 0.12;
      u.mats.forEach((m) => { m.emissive.setHex(0x5a3410); m.emissiveIntensity = u.curGlow; });
      if (u.steam) u.steam.forEach((s) => {
        const p = (t * 0.18 + s.userData.phase) % 1;
        s.position.set(Math.sin(p * 6 + s.userData.phase * 9) * 0.012, 0.11 + p * 0.16, 0);
        s.scale.setScalar(0.04 + p * 0.07);
        s.material.opacity = Math.sin(p * Math.PI) * 0.22;
      });
    });

    renderer.render(scene, camera);
    placeButtons();
    requestAnimationFrame(frame);
  }

  // 물건 위에 큰 버튼을 겹쳐 놓기
  const corner = new T.Vector3();
  function placeButtons() {
    camera.updateMatrixWorld();
    // 공책 안의 "열어 보기" 버튼 자리에 진짜 링크 올리기
    const open = document.getElementById("nbOpen");
    if (open) {
      if (!pageUrl || seatP < 1) { open.style.display = "none"; }
      else {
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        [[BTN.x + 40, BTN.y], [BTN.x + 40 + BTN.w, BTN.y], [BTN.x + 40, BTN.y + BTN.h], [BTN.x + 40 + BTN.w, BTN.y + BTN.h]].forEach(([px, py]) => {
          corner.set((px / 1024 - 0.5) * NB.w, 0.0065, (py / 756 - 0.5) * NB.d);
          pr.updateWorldMatrix(true, false); pr.localToWorld(corner); corner.project(camera);
          const sx = (corner.x * 0.5 + 0.5) * innerWidth, sy = (-corner.y * 0.5 + 0.5) * innerHeight;
          x0 = Math.min(x0, sx); y0 = Math.min(y0, sy); x1 = Math.max(x1, sx); y1 = Math.max(y1, sy);
        });
        Object.assign(open.style, { display: "block", left: x0 + "px", top: y0 + "px", width: x1 - x0 + "px", height: y1 - y0 + "px" });
        open.href = pageUrl;
      }
    }
    const btns = document.querySelectorAll(".obj[data-index]");
    if (!btns.length) return;
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    btns.forEach((b) => {
      const g = items[+b.dataset.index]; if (!g) return;
      v.copy(g.userData.anchor).applyMatrix4(g.matrixWorld);
      v2.copy(v).addScaledVector(right, 0.3);
      v.project(camera); v2.project(camera);
      const sx = (v.x * 0.5 + 0.5) * innerWidth, sy = (-v.y * 0.5 + 0.5) * innerHeight;
      const ppm = Math.abs((v2.x - v.x) * 0.5 * innerWidth) / 0.3;
      const w = Math.max(96, ppm * 0.36), h = Math.max(110, ppm * 0.5);
      b.style.left = sx + "px"; b.style.top = sy + "px";
      b.style.width = w + "px"; b.style.height = h + "px";
    });
  }
  requestAnimationFrame(frame);

  // ---------- 밖으로 내보내는 기능 ----------
  window.Desk = {
    sit() { if (!seating) { seating = true; seatP = reducedMotion ? 1 : 0; seatT0 = performance.now(); } },
    hover(i, on) { if (items[i]) items[i].userData.hover = on ? 1 : 0; },
    setPage,
    select(i) { items.forEach((g, k) => (g.userData.sel = k === i ? 1 : 0)); },
    // 테스트용: 앉은 장면으로 바로 가기
    _skip() { seating = true; seatP = 1; }
  };
})();
