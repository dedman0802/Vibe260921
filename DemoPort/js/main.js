(() => {
  const root = document.documentElement;

  // ----- 푸터 연도 -----
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ----- 테마 전환 (F-07) -----
  const themeBtn = document.getElementById("theme-toggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    const isLight = theme === "light";
    themeBtn.setAttribute("aria-pressed", String(isLight));
    themeBtn.setAttribute("aria-label", isLight ? "다크 테마로 전환" : "라이트 테마로 전환");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isLight ? "#ffffff" : "#0d1117");
  }

  applyTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark");

  themeBtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    applyTheme(next);
    try { localStorage.setItem("demoport-theme", next); } catch (e) { /* 저장 실패는 무시 */ }
  });

  // ----- 프로젝트 카드 렌더링 (F-04) -----
  const grid = document.getElementById("project-grid");
  const projects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function linkEl(link) {
    const a = el("a", "", `${link.label} →`);
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  }

  if (grid) {
    grid.querySelector("noscript")?.remove();
    for (const p of projects) {
      const card = el("article", "card reveal");
      card.append(el("h3", "", p.title));
      card.append(el("p", "card-desc", p.description));

      const tags = el("ul", "tag-list");
      for (const t of p.tech || []) tags.append(el("li", "", t));
      card.append(tags);

      const links = el("div", "card-links");
      if (p.demo) links.append(linkEl(p.demo));
      if (p.source) links.append(linkEl(p.source));
      // 링크를 카드 아래쪽에 고정
      const spacer = el("div", "grow");
      card.append(spacer, links);

      grid.append(card);
    }
  }

  // ----- 이메일 복사 (F-06) -----
  const copyBtn = document.getElementById("copy-email");
  const status = document.getElementById("copy-status");

  function fallbackCopy(text) {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { /* 아래에서 실패 처리 */ }
    area.remove();
    return ok;
  }

  if (copyBtn) {
    let timer;
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.dataset.email;
      let ok = false;
      try {
        await navigator.clipboard.writeText(email);
        ok = true;
      } catch (e) {
        ok = fallbackCopy(email);
      }
      status.textContent = ok ? "이메일 주소를 복사했습니다." : "복사하지 못했습니다. 주소를 직접 선택해 복사해 주세요.";
      clearTimeout(timer);
      timer = setTimeout(() => { status.textContent = ""; }, 3000);
    });
  }

  // ----- 스크롤 등장 애니메이션 (F-08) -----
  const targets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12 });
    targets.forEach((t) => io.observe(t));
  } else {
    targets.forEach((t) => t.classList.add("visible"));
  }
})();
