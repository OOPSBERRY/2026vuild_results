// ---------- 책상 위 물건 그림 (실사 느낌의 SVG) ----------
const SHADOW = '<ellipse cx="100" cy="{y}" rx="{rx}" ry="9" fill="rgba(0,0,0,.65)" filter="url(#blur5)"/>';
const shadow = (y, rx) => SHADOW.replace("{y}", y).replace("{rx}", rx);

const ART = {
  // 책 두 권 (가죽 표지)
  book: () => `
  <svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
    ${shadow(136, 84)}
    <rect x="20" y="92" width="160" height="40" rx="3" fill="url(#gLeather)"/>
    <rect x="22" y="89" width="156" height="4" fill="url(#gPages)"/>
    <rect x="20" y="92" width="160" height="40" rx="3" fill="url(#gRoundV)"/>
    <rect x="38" y="92" width="3" height="40" fill="url(#gGold)"/><rect x="44" y="92" width="3" height="40" fill="url(#gGold)"/>
    <rect x="153" y="92" width="3" height="40" fill="url(#gGold)"/><rect x="159" y="92" width="3" height="40" fill="url(#gGold)"/>
    <rect x="70" y="106" width="60" height="5" rx="2" fill="url(#gGold)" opacity=".9"/>
    <g transform="rotate(-3 100 80)">
      <rect x="32" y="56" width="136" height="34" rx="3" fill="url(#gGreenBook)"/>
      <rect x="34" y="53" width="132" height="4" fill="url(#gPages)"/>
      <rect x="32" y="56" width="136" height="34" rx="3" fill="url(#gRoundV)"/>
      <rect x="50" y="56" width="3" height="34" fill="url(#gGold)"/><rect x="56" y="56" width="3" height="34" fill="url(#gGold)"/>
      <rect x="82" y="68" width="52" height="5" rx="2" fill="url(#gGold)" opacity=".9"/>
    </g>
  </svg>`,

  // 돔 모양 스탠드 (아래로 따뜻한 빛)
  lamp: () => `
  <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="95" r="105" fill="url(#gGlow)"/>
    ${shadow(206, 56)}
    <ellipse cx="100" cy="198" rx="50" ry="11" fill="#17100b"/>
    <rect x="50" y="186" width="100" height="12" fill="url(#gWoodV)"/>
    <ellipse cx="100" cy="186" rx="50" ry="11" fill="#3a2515"/>
    <ellipse cx="100" cy="185" rx="46" ry="8.5" fill="#2a190e"/>
    <rect x="96" y="104" width="8" height="82" fill="url(#gBrass)"/>
    <path d="M38 96 Q38 36 100 36 Q162 36 162 96 Z" fill="#1d1712"/>
    <path d="M38 96 Q38 36 100 36 Q162 36 162 96 Z" fill="url(#gShade)"/>
    <path d="M52 60 Q70 42 100 40" stroke="rgba(255,235,200,.35)" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="100" cy="96" rx="62" ry="8" fill="url(#gShadeLamp)"/>
    <ellipse cx="100" cy="97" rx="40" ry="4" fill="#fff1c9"/>
    <rect x="97" y="26" width="6" height="12" rx="2" fill="url(#gBrass)"/>
  </svg>`,

  // 도자기 머그컵 + 받침 + 김
  mug: () => `
  <svg viewBox="0 0 200 170" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="mugBody"><path d="M56 56 L144 56 L138 128 Q100 142 62 128 Z"/></clipPath>
    </defs>
    ${shadow(148, 66)}
    <ellipse cx="100" cy="142" rx="64" ry="13" fill="#1f1209"/>
    <ellipse cx="100" cy="139" rx="64" ry="13" fill="#4a2c18"/>
    <ellipse cx="100" cy="137" rx="58" ry="10" fill="#5a381f"/>
    <path d="M143 70 C184 64 182 114 138 112" stroke="#6b5c47" stroke-width="13" fill="none" stroke-linecap="round"/>
    <path d="M143 70 C181 66 179 111 138 110" stroke="url(#gCream)" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M56 56 L144 56 L138 128 Q100 142 62 128 Z" fill="url(#gCream)"/>
    <g clip-path="url(#mugBody)">
      <path d="M40 100 Q70 92 100 100 T160 98 L160 160 L40 160 Z" fill="url(#gGlaze)"/>
    </g>
    <path d="M56 56 L144 56 L138 128 Q100 142 62 128 Z" fill="url(#gShade)"/>
    <ellipse cx="100" cy="56" rx="44" ry="10" fill="#e6d8bd"/>
    <ellipse cx="100" cy="57" rx="39" ry="7.6" fill="url(#gTea)"/>
    <ellipse cx="92" cy="55" rx="14" ry="2.2" fill="rgba(255,225,170,.35)"/>
    <g fill="none" stroke="rgba(255,240,215,.55)" stroke-width="4" stroke-linecap="round" filter="url(#blur5)">
      <path class="steam s1" d="M86 46 C78 34 96 28 88 14"/>
      <path class="steam s2" d="M104 46 C96 32 116 26 106 10"/>
      <path class="steam s3" d="M120 46 C114 36 128 30 122 18"/>
    </g>
  </svg>`,

  // 짙은 화분 + 풀잎 식물
  plant: () => {
    let blades = "";
    for (let i = 0; i < 17; i++) {
      const a = -62 + i * (124 / 16);
      const len = 52 + ((i * 37) % 28);
      const shade = ["#7fae4e", "#5f9140", "#9bc15f", "#4a7c35"][i % 4];
      blades += `<path d="M100 108 Q${100 + a * 0.35} ${108 - len * 0.6} ${100 + a * 0.95} ${108 - len}" stroke="${shade}" stroke-width="${4.5 - (i % 3) * 0.7}" fill="none" stroke-linecap="round"/>`;
    }
    return `
  <svg viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg">
    ${shadow(176, 54)}
    <g>${blades}</g>
    <path d="M52 108 L148 108 L138 170 Q100 180 62 170 Z" fill="#3b3a3a"/>
    <path d="M52 108 L148 108 L138 170 Q100 180 62 170 Z" fill="url(#gShade)"/>
    <path d="M52 108 L148 108 L138 170 Q100 180 62 170 Z" fill="url(#gRoundV)" opacity=".6"/>
    <ellipse cx="100" cy="108" rx="48" ry="9" fill="#555353"/>
    <ellipse cx="100" cy="109" rx="42" ry="6.5" fill="#2a1b10"/>
  </svg>`;
  }
};

// ---------- 책장 (뒤쪽 벽) 만들기 ----------
function buildShelves() {
  const box = document.getElementById("shelves");
  const colors = ["#5a2f1d", "#2f3d52", "#3d2a1f", "#6b4a2a", "#22303a", "#4a1f1f", "#7a6a4a", "#26322a", "#5c3b28"];
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let r = 0; r < 3; r++) {
    const shelf = document.createElement("div");
    shelf.className = "shelf";
    for (let i = 0; i < 34; i++) {
      const b = document.createElement("div");
      b.className = "spine";
      b.style.width = 7 + Math.floor(rnd() * 9) + "px";
      b.style.height = 62 + Math.floor(rnd() * 34) + "%";
      b.style.background = colors[Math.floor(rnd() * colors.length)];
      shelf.appendChild(b);
    }
    box.appendChild(shelf);
  }
}

// ---------- 물건 버튼 + 공책 내용 ----------
const links = window.DESK_LINKS || [];
const objectsBox = document.getElementById("objects");
const pageLeft = document.getElementById("pageLeft");
const pageRight = document.getElementById("pageRight");

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

function showHome() {
  pageLeft.replaceChildren(
    el("span", "tag", "오늘의 나에게"),
    el("h2", "", "오늘은 어떤 마음인가요?"),
    el("p", "", "책상 위 물건을 하나 눌러 보세요.")
  );
  pageRight.replaceChildren(
    el("p", "note", "천천히 둘러보세요."),
    el("p", "note", "서두르지 않아도 괜찮아요. 🌙")
  );
}

function showLink(item) {
  pageLeft.replaceChildren(
    el("span", "tag", "만든 선생님 · " + item.teacher),
    el("h2", "", item.name),
    el("p", "", item.desc)
  );
  let btn;
  if (item.url) {
    btn = el("a", "open-btn", "열어 보기 →");
    btn.href = item.url;
    btn.target = "_blank";
    btn.rel = "noopener";
  } else {
    btn = el("span", "open-btn soon", "곧 열려요 🌙");
  }
  pageRight.replaceChildren(el("p", "note", "준비됐나요?"), btn);
}

function buildObjects() {
  links.forEach((item) => {
    const b = el("button", "obj");
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label", item.name);
    b.innerHTML = (ART[item.object] || ART.book)();
    b.appendChild(el("span", "obj-label", item.name));
    b.addEventListener("click", () => {
      objectsBox.querySelectorAll(".obj").forEach((o) => {
        o.classList.remove("on");
        o.setAttribute("aria-pressed", "false");
      });
      b.classList.add("on");
      b.setAttribute("aria-pressed", "true");
      showLink(item);
    });
    objectsBox.appendChild(b);
  });
}

// ---------- 의자에 앉기 ----------
document.getElementById("sitBtn").addEventListener("click", () => {
  document.body.classList.remove("intro");
  document.body.classList.add("seated");
  setTimeout(() => {
    const first = objectsBox.querySelector(".obj");
    if (first) first.focus({ preventScroll: true });
  }, 2400);
});

buildShelves();
buildObjects();
showHome();
