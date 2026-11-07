// ---------- 사진 방: 사진 위에 얹은 누르는 영역 → 활동 패널 ----------
const links = window.DESK_LINKS || [];
const IMG_W = 1586, IMG_H = 992;   // 사진 크기 (assets/desk.jpg)
// 사진 속 물건 위치 [왼쪽, 위, 오른쪽, 아래] — links.js 순서와 같아요 (책, 펼친 공책, 찻잔, 화분)
const SPOTS = [
  { label: "책",       box: [60, 445, 400, 665] },
  { label: "펼친 공책", box: [620, 455, 1000, 675] },
  { label: "찻잔",     box: [1095, 455, 1265, 655] },
  { label: "화분",     box: [1300, 300, 1580, 630] }
];
const world = document.getElementById("world");
const objectsBox = document.getElementById("objects");
const entryGate = document.getElementById("entryGate");
const enterButton = document.getElementById("enterBtn");
const skipEntryButton = document.getElementById("skipEntryBtn");
let entryRevealing = false;

function revealStudy(skipMotion = false) {
  if (entryRevealing || entryGate.getAttribute("aria-hidden") === "true") return;
  entryRevealing = true;
  enterButton.disabled = true;
  skipEntryButton.disabled = true;
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finish = () => {
    entryGate.setAttribute("aria-hidden", "true");
    entryGate.inert = true;
    world.inert = false;
    document.getElementById("sitBtn").focus({ preventScroll: true });
    window.setTimeout(() => window.openBookmark && window.openBookmark(), 700);   // 들어오면 책갈피 알림창
  };
  document.body.classList.add("doors-open");
  if (skipMotion || reduced) finish();
  else window.setTimeout(finish, 1420);
}
enterButton.addEventListener("click", () => revealStudy(false));
skipEntryButton.addEventListener("click", () => revealStudy(true));
requestAnimationFrame(() => enterButton.focus({ preventScroll: true }));
entryGate.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const controls = [enterButton, skipEntryButton];
  const first = controls[0], last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

function place(el, box) {
  el.style.left = (box[0] / IMG_W) * 100 + "%";
  el.style.top = (box[1] / IMG_H) * 100 + "%";
  el.style.width = ((box[2] - box[0]) / IMG_W) * 100 + "%";
  el.style.height = ((box[3] - box[1]) / IMG_H) * 100 + "%";
}
place(document.getElementById("sitBtn"), [627, 866, 957, 938]);   // 사진 속 "의자에 앉기" 버튼 자리
place(document.getElementById("helpBtn"), [1360, 12, 1480, 52]);  // 사진 속 "사용 안내" 자리

// ---------- 의자에 앉기 (사진이 천천히 확대돼요) ----------
let seated = false;
function sit() {
  if (seated) return;
  seated = true;
  document.body.classList.remove("intro");
  document.body.classList.add("seated");
}
document.getElementById("sitBtn").addEventListener("click", sit);
document.getElementById("helpBtn").addEventListener("click", () => document.getElementById("helpDlg").showModal());
document.getElementById("helpClose").addEventListener("click", () => document.getElementById("helpDlg").close());

// ---------- 물건 누르기 → 활동 패널 ----------
function buildObjects() {
  SPOTS.forEach((s, i) => {
    const item = links[i];
    if (!item) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "spot";
    b.dataset.index = i;
    b.setAttribute("aria-label", item.name + " (" + s.label + ")");
    place(b, s.box);
    b.addEventListener("click", () => {
      if (i === 0) { window.openBookmark && window.openBookmark(); return; }   // 책갈피 찾기
      if (i === 2) { window.openExperience && window.openExperience(); return; }   // 색다른 경험 → 안내창
      if (i === 1) { window.openReading && window.openReading(b); return; }      // 독서하러 가자 → 공책 가까이
      const wait = seated ? 0 : 900;   // 안 앉았으면 먼저 앉고 열어요
      sit();
      setTimeout(() => { if (window.DeskPanel) DeskPanel.open(i, b); }, wait);
    });
    objectsBox.appendChild(b);
  });
}
buildObjects();

// 사진에 글자로 박힌 옛 이름 위에, links.js의 이름을 이름표로 덮어요 [가운데 x, 가운데 y] (사진 기준)
const LABEL_POS = [[247, 465], [798, 472], [1148, 470], [1367, 470]];
LABEL_POS.forEach((pos, i) => {
  if (!links[i]) return;
  const t = document.createElement("span");
  t.className = "spot-label";
  t.textContent = links[i].name;
  t.style.left = (pos[0] / IMG_W) * 100 + "%";
  t.style.top = (pos[1] / IMG_H) * 100 + "%";
  objectsBox.appendChild(t);
});

// ---------- 도구 패널: 실제 물건의 상세 활동 메뉴 ----------
(() => {
  const panel = document.getElementById("toolPanel");
  const hero = document.getElementById("toolHero");
  const content = document.getElementById("toolContent");
  const close = panel.querySelector(".tool-panel__close");
  const objects = document.getElementById("objects");
  const stage = document.querySelector(".stage");
  const intro = document.getElementById("world");
  let selected = -1;
  let lastTrigger = null;
  let timerId = 0;
  let seconds = 60;

  const toolMeta = [
    { kicker: "BOOKMARK", title: "책갈피 찾기", lead: "나에게 어울리는 책갈피를 찾아봐요.", image: "assets/tool-book.png" },
    { kicker: "LET'S READ", title: "독서하러 가자", lead: "한 권의 책과 오늘의 나를 조용히 연결해 봐요.", image: "assets/book-little-prince-hero.png" },
    { kicker: "A DIFFERENT EXPERIENCE", title: "색다른 경험", lead: "책 밖으로 나가는 색다른 경험을 해 봐요.", image: "assets/tool-rest.png" },
    { kicker: "CLASSIC CHAT", title: "고전 단톡방", lead: "고전 이야기를 함께 나누는 단톡방이에요.", image: "assets/tool-journal.png" }
  ];

  const escapeHtml = (value) => String(value).replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char]);
  const current = () => (window.DESK_LINKS || [])[selected] || {};
  const action = () => {
    const item = current();
    return item.url
      ? `<a class="tool-primary" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">활동 열어 보기 <span aria-hidden="true">↗</span></a>`
      : `<button class="tool-primary tool-disabled" type="button" disabled>외부 활동은 곧 열려요</button>`;
  };
  const deskButton = () => `<button class="tool-secondary" type="button" data-close-tool>책상으로 돌아가기</button>`;

  function setInert(on) {
    [objects, stage, intro].forEach((node) => { if (node) node.inert = on; });
  }
  function closePanel() {
    clearInterval(timerId); timerId = 0;
    panel.setAttribute("aria-hidden", "true");
    panel.inert = true;
    document.body.classList.remove("tool-open");
    setInert(false);
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  }
  function bindCommon() {
    content.querySelectorAll("[data-close-tool]").forEach((button) => button.addEventListener("click", closePanel));
  }
  function focusPanelHeading() {
    const heading = content.querySelector("#toolTitle");
    if (!heading) return;
    heading.tabIndex = -1;
    requestAnimationFrame(() => heading.focus({ preventScroll: true }));
  }
  function renderBookList() {
    panel.dataset.view = "book-list";
    content.innerHTML = `
      <p class="tool-kicker">${toolMeta[1].kicker}</p>
      <h2 class="tool-title" id="toolTitle">${toolMeta[1].title}</h2>
      <p class="tool-lead">${toolMeta[1].lead}</p>
      <button class="book-choice" type="button" id="littlePrinceChoice">
        <img src="assets/book-little-prince-cover.png" alt="어린 왕자 표지">
        <span><strong>어린 왕자</strong><span>앙투안 드 생텍쥐페리<br>관계와 책임을 천천히 읽는 시간</span></span>
      </button>
      <div class="tool-actions">${action()}${deskButton()}</div>`;
    document.getElementById("littlePrinceChoice").addEventListener("click", renderBookDetail);
    bindCommon();
    focusPanelHeading();
  }
  function renderBookDetail() {
    panel.dataset.view = "book-detail";
    hero.style.backgroundImage = "url('assets/book-little-prince-hero.png')";
    content.innerHTML = `
      <p class="tool-kicker">CLASSIC READING · SELECTED BOOK</p>
      <h2 class="tool-title" id="toolTitle">어린 왕자</h2>
      <p class="tool-lead">앙투안 드 생텍쥐페리의 이야기를 따라, ‘길들인다’는 말에 담긴 관계의 책임을 생각해 봐요.</p>
      <section class="tool-card" aria-label="오늘의 읽기 주제"><h3>오늘의 질문</h3><p>내가 시간을 들여 돌보고 싶은 관계는 무엇인가요? 그 관계를 위해 오늘 할 수 있는 작은 일은 무엇일까요?</p></section>
      <div class="tool-actions"><button class="tool-secondary" type="button" id="backToBooks">책 선택으로 돌아가기</button>${action()}${deskButton()}</div>`;
    document.getElementById("backToBooks").addEventListener("click", renderBookList);
    bindCommon();
    focusPanelHeading();
  }
  function renderMood() {
    panel.dataset.view = "mood";
    const saved = localStorage.getItem("quiet-desk-mood") || "";
    content.innerHTML = `
      <p class="tool-kicker">${toolMeta[1].kicker}</p><h2 class="tool-title" id="toolTitle">${toolMeta[1].title}</h2><p class="tool-lead">${toolMeta[1].lead}</p>
      <section class="tool-card"><h3>지금 가장 가까운 마음</h3><div class="mood-grid" role="group" aria-label="오늘의 마음 선택">
        ${["차분해요", "조금 복잡해요", "힘을 내고 싶어요"].map((mood) => `<button class="mood-choice" type="button" data-mood="${mood}" aria-pressed="${saved === mood}">${mood}</button>`).join("")}
      </div><p class="tool-feedback" id="moodFeedback">${saved ? `오늘은 ‘${saved}’에 가까워요.` : "고른 마음은 이 기기에만 잠시 남아요."}</p></section>
      <div class="tool-actions">${action()}${deskButton()}</div>`;
    content.querySelectorAll("[data-mood]").forEach((button) => button.addEventListener("click", () => {
      const mood = button.dataset.mood;
      localStorage.setItem("quiet-desk-mood", mood);
      content.querySelectorAll("[data-mood]").forEach((choice) => choice.setAttribute("aria-pressed", String(choice === button)));
      document.getElementById("moodFeedback").textContent = `오늘은 ‘${mood}’에 가까워요.`;
    }));
    bindCommon();
    focusPanelHeading();
  }
  function renderRest() {
    panel.dataset.view = "rest";
    content.innerHTML = `
      <p class="tool-kicker">${toolMeta[2].kicker}</p><h2 class="tool-title" id="toolTitle">${toolMeta[2].title}</h2><p class="tool-lead">${toolMeta[2].lead}</p>
      <section class="tool-card"><h3>1분 숨 고르기</h3><p class="rest-clock" id="restClock" aria-live="polite">01:00</p><p id="restGuide">어깨를 내리고, 천천히 네 번 숨을 쉬어 보세요.</p>
      <div class="tool-actions"><button class="tool-primary" type="button" id="startRest">1분 시작</button><button class="tool-secondary" type="button" id="resetRest">다시 하기</button></div></section>
      <div class="tool-actions">${action()}${deskButton()}</div>`;
    const clock = document.getElementById("restClock");
    const renderTime = () => { clock.textContent = `00:${String(seconds).padStart(2, "0")}`; };
    document.getElementById("startRest").addEventListener("click", () => {
      if (timerId) return;
      document.getElementById("startRest").disabled = true;
      timerId = window.setInterval(() => {
        seconds -= 1; renderTime();
        if (seconds <= 0) { clearInterval(timerId); timerId = 0; clock.textContent = "완료"; document.getElementById("restGuide").textContent = "잠깐 멈춘 것만으로도 충분해요."; }
      }, 1000);
    });
    document.getElementById("resetRest").addEventListener("click", () => { clearInterval(timerId); timerId = 0; seconds = 60; renderTime(); document.getElementById("startRest").disabled = false; document.getElementById("restGuide").textContent = "어깨를 내리고, 천천히 네 번 숨을 쉬어 보세요."; });
    bindCommon();
    focusPanelHeading();
  }
  function renderJournal() {
    panel.dataset.view = "journal";
    const saved = localStorage.getItem("quiet-desk-journal") || "";
    content.innerHTML = `
      <p class="tool-kicker">${toolMeta[3].kicker}</p><h2 class="tool-title" id="toolTitle">${toolMeta[3].title}</h2><p class="tool-lead">${toolMeta[3].lead}</p>
      <section class="tool-card"><h3>오늘의 한 줄</h3><textarea class="journal-entry" id="journalEntry" maxlength="180" placeholder="오늘의 나는…" aria-label="오늘의 한 줄 쓰기">${escapeHtml(saved)}</textarea><p class="tool-feedback" id="journalFeedback">이 기록은 이 기기에만 저장됩니다.</p>
      <div class="tool-actions"><button class="tool-primary" type="button" id="saveJournal">책상에 남기기</button></div></section>
      <div class="tool-actions">${action()}${deskButton()}</div>`;
    document.getElementById("saveJournal").addEventListener("click", () => {
      localStorage.setItem("quiet-desk-journal", document.getElementById("journalEntry").value.trim());
      document.getElementById("journalFeedback").textContent = "한 줄을 이 기기에 남겼어요.";
    });
    bindCommon();
    focusPanelHeading();
  }
  function renderLink(index) {
    panel.dataset.view = "link";
    const m = toolMeta[index];
    content.innerHTML = `
      <p class="tool-kicker">${m.kicker}</p><h2 class="tool-title" id="toolTitle">${m.title}</h2><p class="tool-lead">${escapeHtml(current().desc || m.lead)}</p>
      <div class="tool-actions">${action()}${deskButton()}</div>`;
    bindCommon();
    focusPanelHeading();
  }
  function renderCredits() {
    panel.dataset.view = "credits";
    const m = toolMeta[3];
    const rows = (window.DESK_CREDITS || []).map((c) => `<li><span>${escapeHtml(c.role)}</span><strong>${escapeHtml(c.name)}</strong></li>`).join("");
    content.innerHTML = `
      <p class="tool-kicker">${m.kicker}</p><h2 class="tool-title" id="toolTitle">${m.title}</h2><p class="tool-lead">${m.lead}</p>
      <section class="tool-card"><h3>함께 만든 사람들</h3><ul class="credits">${rows}</ul></section>
      <div class="tool-actions">${deskButton()}</div>`;
    bindCommon();
    focusPanelHeading();
  }
  function render(index) {
    clearInterval(timerId); timerId = 0; seconds = 60;
    const meta = toolMeta[index];
    hero.style.backgroundImage = `url('${meta.image}')`;
    if (index === 1) return renderBookList();
    renderLink(index);   // 고전 단톡방 등: 설명 + 링크 카드
  }
  window.DeskPanel = {
    open(index, trigger) {
      selected = index; lastTrigger = trigger; render(index);
      panel.inert = false; panel.setAttribute("aria-hidden", "false"); document.body.classList.add("tool-open"); setInert(true);
      requestAnimationFrame(() => close.focus({ preventScroll: true }));
    },
    close: closePanel
  };
  panel.querySelectorAll("[data-close-tool]").forEach((node) => node.addEventListener("click", closePanel));
  document.addEventListener("keydown", (event) => {
    if (panel.getAttribute("aria-hidden") !== "false") return;
    if (event.key === "Escape") { closePanel(); return; }
    if (event.key !== "Tab") return;
    const focusable = [...panel.querySelectorAll("button:not([disabled]), a[href], textarea")].filter((node) => !node.hidden);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
})();

// ---------- QR 코드: 휴대폰으로 이 책상 열기 ----------
(() => {
  const dlg = document.getElementById("qrDlg");
  const box = document.getElementById("qrBox");
  const urlEl = document.getElementById("qrUrl");
  let madeFor = "";
  document.getElementById("qrBtn").addEventListener("click", () => {
    const url = window.DESK_QR_URL || window.location.href;   // 비워두면 지금 열린 주소
    if (madeFor !== url) {
      try {
        const qr = qrcode(0, "M");
        qr.addData(url);
        qr.make();
        box.innerHTML = qr.createSvgTag({ cellSize: 8, margin: 3, scalable: true });
      } catch (err) {
        box.textContent = "QR을 만들지 못했어요.";
      }
      urlEl.textContent = url;
      madeFor = url;
    }
    dlg.showModal();
  });
  document.getElementById("qrClose").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });   // 바깥을 누르면 닫기
})();

// ---------- 책갈피 알림창 → 추천 도서(항상 어린 왕자) ----------
(() => {
  const bm = document.getElementById("bmDlg"), rec = document.getElementById("recDlg");
  const link = document.getElementById("bmLink"), soon = document.getElementById("bmSoon");
  const R = window.BOOK_RESULT || {};
  if (R.image) document.getElementById("recImg").src = R.image;
  if (R.title) document.getElementById("recTitle").textContent = R.title;
  if (R.author) document.getElementById("recAuthor").textContent = R.author;

  function openBookmark() {
    if (rec.open) return;
    const url = window.BOOKMARK_URL;
    if (url) {
      link.href = url;
      link.target = window.BOOKMARK_SAME_TAB === false ? "_blank" : "_self";   // 기본: 같은 창에서 열어요
      link.hidden = false; soon.hidden = true;
    }
    else { link.hidden = true; soon.hidden = false; }
    if (!bm.open) bm.showModal();
  }
  window.openBookmark = openBookmark;
  const showResult = () => { bm.close(); if (!rec.open) rec.showModal(); };

  document.getElementById("bmResult").addEventListener("click", showResult);
  document.getElementById("bmLater").addEventListener("click", () => bm.close());
  document.getElementById("recClose").addEventListener("click", () => rec.close());
  document.getElementById("bmBtn").addEventListener("click", openBookmark);
  // 설문이 끝나고 주소 뒤에 ?result=1 이 붙어 돌아오면: 문과 알림창을 건너뛰고 바로 추천 화면
  if (new URLSearchParams(window.location.search).has("result")) {
    window.openBookmark = () => {};
    revealStudy(true);
    setTimeout(() => { if (!rec.open) rec.showModal(); }, 300);
  }

  // 어두운 바깥을 누르면 닫기
  [bm].forEach((d) => d.addEventListener("click", (e) => { if (e.target === d) d.close(); }));
})();


// ---------- 독서하러 가자: 공책에 더 가까이 다가가서, 손글씨로 쓰인 활동 3가지 ----------
(() => {
  const view = document.getElementById("nbView");
  const left = document.getElementById("nbLeft");
  const right = document.getElementById("nbRight");
  const back = document.getElementById("nbBack");
  let trigger = null;
  let timers = [];

  function entry(a, n) {
    const wrap = document.createElement("div");
    wrap.className = "hw-item";
    wrap.style.setProperty("--n", n);
    const num = document.createElement("span");
    num.className = "hw-num";
    num.textContent = n + ".";
    const title = document.createElement(a.url ? "a" : "span");
    title.className = "hw-title" + (a.url ? "" : " hw-nolink");
    title.textContent = a.title;
    if (a.url) { title.href = a.url; title.target = "_blank"; title.rel = "noopener"; }
    else { title.tabIndex = 0; }
    const head = document.createElement("div");
    head.className = "hw-line";
    head.append(num, title);
    if (!a.url) {
      const soon = document.createElement("small");
      soon.className = "hw-soon";
      soon.textContent = "곧 열려요";
      head.append(soon);
    }
    wrap.append(head);
    if (a.desc) {
      const d = document.createElement("p");
      d.className = "hw-desc";
      d.textContent = "(" + a.desc + ")";
      wrap.append(d);
    }
    return wrap;
  }

  function render() {
    const list = window.READING_ACTIVITIES || [];
    left.replaceChildren();
    right.replaceChildren();
    const head = document.createElement("h2");
    head.className = "hw-head";
    head.textContent = "독서하러 가자";
    const sub = document.createElement("p");
    sub.className = "hw-sub";
    sub.textContent = "오늘 해 볼 활동을 골라 봐요";
    left.append(head, sub);
    list.forEach((a, i) => (i === 0 ? left : right).append(entry(a, i + 1)));
  }

  function open(fromEl) {
    if (!view.hidden && view.classList.contains("show")) return;
    trigger = fromEl || null;
    sit();                                   // 아직 안 앉았으면 먼저 앉아요
    document.body.classList.add("reading");  // 사진이 공책 쪽으로 다가가요
    world.inert = true;
    render();
    view.hidden = false;
    timers.push(setTimeout(() => view.classList.add("show"), 1000));   // 다가간 뒤 필기가 써져요
    timers.push(setTimeout(() => back.focus({ preventScroll: true }), 1200));
  }
  function close() {
    timers.forEach(clearTimeout);
    timers = [];
    view.classList.remove("show");
    document.body.classList.remove("reading");
    timers.push(setTimeout(() => {
      view.hidden = true;
      world.inert = false;
      if (trigger) trigger.focus({ preventScroll: true });
    }, 600));
  }
  window.openReading = open;
  back.addEventListener("click", close);
  view.addEventListener("click", (e) => { if (e.target === view) close(); });   // 바깥을 누르면 돌아가요
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !view.hidden && !document.querySelector("dialog[open]")) close(); });
})();


// ---------- 색다른 경험: 두 가지 중 고르는 안내창 ----------
(() => {
  const dlg = document.getElementById("expDlg");
  const list = document.getElementById("expList");
  function open() {
    list.replaceChildren();
    (window.EXPERIENCE_CHOICES || []).forEach((c) => {
      const el = document.createElement(c.url ? "a" : "div");
      el.className = "exp-choice" + (c.url ? "" : " exp-choice--soon");
      if (c.url) { el.href = c.url; el.target = "_blank"; el.rel = "noopener"; }
      const t = document.createElement("strong");
      t.textContent = c.title;
      const d = document.createElement("span");
      d.textContent = c.desc;
      el.append(t, d);
      if (!c.url) {
        const soon = document.createElement("em");
        soon.textContent = "링크는 곧 열려요";
        el.append(soon);
      }
      list.append(el);
    });
    if (!dlg.open) dlg.showModal();
  }
  window.openExperience = open;
  document.getElementById("expClose").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
})();
