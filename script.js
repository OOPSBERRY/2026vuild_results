// ---------- 책상 위 물건 버튼 (3D 위에 얹는 큰 버튼) ----------
// 물건을 누르면 책상 위 공책(3D)에 글이 써져요. 공책 글은 scene.js가 그려요.
const links = window.DESK_LINKS || [];
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
    [objectsBox, document.querySelector(".stage"), document.getElementById("introUi")].forEach((node) => { node.inert = false; });
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

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

function buildObjects() {
  links.forEach((item, i) => {
    const b = el("button", "obj");
    b.type = "button";
    b.dataset.index = i;
    b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label", item.name);
    b.appendChild(el("span", "obj-label", item.name));
    b.addEventListener("mouseenter", () => window.Desk && Desk.hover(i, true));
    b.addEventListener("mouseleave", () => window.Desk && Desk.hover(i, false));
    b.addEventListener("focus", () => window.Desk && Desk.hover(i, true));
    b.addEventListener("blur", () => window.Desk && Desk.hover(i, false));
    b.addEventListener("click", () => {
      objectsBox.querySelectorAll(".obj").forEach((o) => {
        o.classList.remove("on");
        o.setAttribute("aria-pressed", "false");
      });
      b.classList.add("on");
      b.setAttribute("aria-pressed", "true");
      if (window.Desk) { Desk.select(i); Desk.setPage(item); }
      if (window.DeskPanel) DeskPanel.open(i, b);
    });
    objectsBox.appendChild(b);
  });
}

// ---------- 의자에 앉기 ----------
document.getElementById("sitBtn").addEventListener("click", () => {
  document.body.classList.remove("intro");
  document.body.classList.add("seated");
  window.Desk && Desk.sit();
  setTimeout(() => {
    const first = objectsBox.querySelector(".obj");
    if (first) first.focus({ preventScroll: true });
  }, 2900);
});

buildObjects();

// ---------- 도구 패널: 실제 물건의 상세 활동 메뉴 ----------
(() => {
  const panel = document.getElementById("toolPanel");
  const hero = document.getElementById("toolHero");
  const content = document.getElementById("toolContent");
  const close = panel.querySelector(".tool-panel__close");
  const objects = document.getElementById("objects");
  const stage = document.querySelector(".stage");
  const intro = document.getElementById("introUi");
  let selected = -1;
  let lastTrigger = null;
  let timerId = 0;
  let seconds = 60;

  const toolMeta = [
    { kicker: "CLASSIC READING", title: "고전 읽기", lead: "한 권의 고전과 나의 오늘을 조용히 연결해 봐요.", image: "assets/book-little-prince-hero.png" },
    { kicker: "TODAY'S FEELING", title: "오늘의 마음", lead: "지금의 마음을 하나 고르고, 잠시 그 감정 곁에 있어 봐요.", image: "assets/tool-mood.png" },
    { kicker: "A SMALL PAUSE", title: "쉬어가기", lead: "눈과 어깨를 쉬게 하는 짧은 1분을 시작해요.", image: "assets/tool-rest.png" },
    { kicker: "ONE LINE JOURNAL", title: "한 줄 쓰기", lead: "오늘의 나를 한 줄로 남기면, 작은 생각도 자랄 자리를 얻어요.", image: "assets/tool-journal.png" }
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
      <p class="tool-kicker">${toolMeta[0].kicker}</p>
      <h2 class="tool-title" id="toolTitle">${toolMeta[0].title}</h2>
      <p class="tool-lead">${toolMeta[0].lead}</p>
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
  function render(index) {
    clearInterval(timerId); timerId = 0; seconds = 60;
    const meta = toolMeta[index];
    hero.style.backgroundImage = `url('${meta.image}')`;
    if (index === 0) return renderBookList();
    if (index === 1) return renderMood();
    if (index === 2) return renderRest();
    renderJournal();
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
    if (url) { link.href = url; link.hidden = false; soon.hidden = true; }
    else { link.hidden = true; soon.hidden = false; }
    if (!bm.open) bm.showModal();
  }
  window.openBookmark = openBookmark;
  const showResult = () => { bm.close(); if (!rec.open) rec.showModal(); };

  document.getElementById("bmResult").addEventListener("click", showResult);
  document.getElementById("bmLater").addEventListener("click", () => bm.close());
  document.getElementById("recClose").addEventListener("click", () => rec.close());
  document.getElementById("bmBtn").addEventListener("click", openBookmark);
  // 어두운 바깥을 누르면 닫기
  [bm].forEach((d) => d.addEventListener("click", (e) => { if (e.target === d) d.close(); }));
})();
