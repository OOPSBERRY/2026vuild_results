// ---------- 책상 위 물건 버튼 (3D 위에 얹는 큰 버튼) ----------
// 물건을 누르면 책상 위 공책(3D)에 글이 써져요. 공책 글은 scene.js가 그려요.
const links = window.DESK_LINKS || [];
const objectsBox = document.getElementById("objects");

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
