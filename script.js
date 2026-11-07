// 사진 크기 (desk.jpg)
const IMG_W = 1586, IMG_H = 992;

// 사진 속 누르는 영역 [왼쪽, 위, 오른쪽, 아래] (사진 픽셀 기준) — links.js 순서와 같아요
const SPOTS = [
  { label: "책",       box: [60, 445, 400, 665] },
  { label: "펼친 공책", box: [620, 455, 1000, 675] },
  { label: "찻잔",     box: [1095, 455, 1265, 655] },
  { label: "화분",     box: [1300, 300, 1580, 630] }
];

const links = window.DESK_LINKS || [];
const $ = (id) => document.getElementById(id);
const world = $("world"), spotsBox = $("spots"), card = $("card");

function place(el, box) {
  el.style.left = (box[0] / IMG_W) * 100 + "%";
  el.style.top = (box[1] / IMG_H) * 100 + "%";
  el.style.width = ((box[2] - box[0]) / IMG_W) * 100 + "%";
  el.style.height = ((box[3] - box[1]) / IMG_H) * 100 + "%";
}
place($("sitBtn"), [627, 866, 957, 938]);
place($("helpBtn"), [1360, 12, 1480, 52]);

// ---------- 문 열고 들어가기 ----------
const entry = $("entry");
world.inert = true;
let entered = false;
function openDoor() {
  if (entered) return;
  entered = true;
  entry.classList.add("opening");                       // 문이 열려요
  setTimeout(() => entry.classList.add("entering"), 1100);   // 문 안으로 다가가요
  setTimeout(() => {                                   // 방이 나타나요
    entry.classList.add("gone");
    document.body.classList.remove("door");
    world.inert = false;
  }, 2500);
  setTimeout(() => {
    entry.hidden = true;
    $("sitBtn").focus({ preventScroll: true });
  }, 3700);
}
$("doorBtn").addEventListener("click", openDoor);
$("openBtn").addEventListener("click", openDoor);

// ---------- 의자에 앉기 ----------
let seated = false;
function sit() {
  if (seated) return;
  seated = true;
  document.body.classList.remove("intro");
  document.body.classList.add("seated");
}
$("sitBtn").addEventListener("click", sit);

// ---------- 물건 누르기 → 카드 ----------
let current = -1;
const spotEls = [];
SPOTS.forEach((s, i) => {
  const item = links[i];
  if (!item) return;
  const b = document.createElement("button");
  b.type = "button";
  b.className = "spot";
  b.setAttribute("aria-label", item.name + " (" + s.label + ")");
  place(b, s.box);
  b.addEventListener("click", () => {
    const wait = seated ? 0 : 900;
    sit();
    setTimeout(() => openCard(i), wait);
  });
  spotsBox.appendChild(b);
  spotEls.push(b);
});

function openCard(i) {
  const item = links[i];
  current = i;
  spotEls.forEach((e, k) => e.classList.toggle("on", k === i));
  $("cardTag").textContent = "만든 선생님 · " + item.teacher;
  $("cardTitle").textContent = item.name;
  $("cardDesc").textContent = item.desc;
  const go = $("cardGo"), soon = $("cardSoon");
  if (item.url) { go.href = item.url; go.hidden = false; soon.hidden = true; }
  else { go.hidden = true; soon.hidden = false; }
  card.hidden = false;
  document.body.classList.add("card-open");
  requestAnimationFrame(() => card.classList.add("show"));
}
function closeCard() {
  card.classList.remove("show");
  document.body.classList.remove("card-open");
  spotEls.forEach((e) => e.classList.remove("on"));
  current = -1;
  setTimeout(() => { if (current < 0) card.hidden = true; }, 350);
}
$("cardX").addEventListener("click", closeCard);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !card.hidden) closeCard(); });

// ---------- QR 코드 ----------
let qrMade = false;
$("qrBtn").addEventListener("click", () => {
  const url = window.DESK_QR_URL || window.location.href;
  if (!qrMade || $("qrUrl").textContent !== url) {
    try {
      const qr = qrcode(0, "M");
      qr.addData(url);
      qr.make();
      $("qrBox").innerHTML = qr.createSvgTag({ cellSize: 8, margin: 3, scalable: true });
    } catch (err) {
      $("qrBox").textContent = "QR을 만들지 못했어요.";
    }
    $("qrUrl").textContent = url;
    qrMade = true;
  }
  $("qrDlg").showModal();
});
$("qrClose").addEventListener("click", () => $("qrDlg").close());

// ---------- 사용 안내 ----------
$("helpBtn").addEventListener("click", () => $("helpDlg").showModal());
$("helpClose").addEventListener("click", () => $("helpDlg").close());

// 창 바깥(어두운 곳)을 누르면 닫기
["qrDlg", "helpDlg"].forEach((id) => {
  const d = $(id);
  d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
});
