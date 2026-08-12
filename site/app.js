// CNS Field Manual — shared interactivity for index + unit pages.
// ponytail: no build step / no framework — markdown is embedded raw in each
// page's <script type="text/markdown">, rendered client-side via marked (CDN).

const PROGRESS_KEY = "cns-progress";

function getProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; }
  catch { return {}; }
}
function setProgress(unit, done) {
  const p = getProgress();
  p[unit] = done;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  return p;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/* ---------------- Index page ---------------- */
function initIndexPage() {
  const cards = document.querySelectorAll(".file-card[data-unit]");
  if (!cards.length) return;
  const progress = getProgress();
  let reviewedCount = 0;
  cards.forEach((card) => {
    const unit = card.dataset.unit;
    if (progress[unit]) { card.classList.add("reviewed"); reviewedCount++; }
  });
  const pill = document.getElementById("progressPill");
  if (pill) pill.textContent = `${reviewedCount}/5 UNITS REVIEWED`;
}

/* ---------------- Unit page ---------------- */
function renderMarkdown() {
  const source = document.getElementById("md-source");
  const target = document.getElementById("content");
  if (!source || !target) return false;
  const raw = source.textContent;
  if (typeof marked !== "undefined") {
    target.innerHTML = marked.parse(raw);
  } else {
    // ponytail: offline fallback, no parser — show raw text, still readable
    const pre = document.createElement("pre");
    pre.textContent = raw;
    target.appendChild(pre);
  }
  return true;
}

function wrapIntoSections(content) {
  const nodes = Array.from(content.childNodes);
  let section = null;
  const sections = [];
  nodes.forEach((node) => {
    if (node.nodeType === 1 && node.tagName === "H1") return; // keep title outside sections
    if (node.nodeType === 1 && node.tagName === "H2") {
      section = document.createElement("section");
      section.className = "unit-section";
      sections.push(section);
      section.appendChild(node);
    } else if (section) {
      section.appendChild(node);
    }
  });
  sections.forEach((s) => content.appendChild(s));
  return sections;
}

function buildSidebar(sections) {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;
  const list = document.createElement("ul");
  sections.forEach((section) => {
    const h2 = section.querySelector("h2");
    if (!h2) return;
    const id = slugify(h2.textContent);
    h2.id = id;
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = h2.textContent.replace(/^\d+\.\s*/, "");
    a.dataset.target = id;
    li.appendChild(a);
    list.appendChild(li);

    section.querySelectorAll("h3").forEach((h3) => {
      const subId = slugify(h3.textContent);
      h3.id = subId;
      const subLi = document.createElement("li");
      const subA = document.createElement("a");
      subA.href = `#${subId}`;
      subA.className = "level-3";
      subA.textContent = h3.textContent;
      subA.dataset.target = subId;
      subLi.appendChild(subA);
      list.appendChild(subLi);
    });
  });

  const heading = document.createElement("h2");
  heading.textContent = "On this page";
  sidebar.appendChild(heading);
  sidebar.appendChild(list);

  const btn = document.createElement("button");
  btn.className = "reviewed-btn";
  btn.id = "reviewedBtn";
  sidebar.appendChild(btn);
  wireReviewedButton(btn);

  wireScrollSpy(sidebar);
}

function wireReviewedButton(btn) {
  const unit = document.body.dataset.unit;
  if (!unit) return;
  const paint = () => {
    const done = !!getProgress()[unit];
    btn.textContent = done ? "✓ Reviewed" : "Mark unit reviewed";
    btn.classList.toggle("on", done);
  };
  btn.addEventListener("click", () => {
    const done = !getProgress()[unit];
    setProgress(unit, done);
    paint();
  });
  paint();
}

function wireScrollSpy(sidebar) {
  const links = sidebar.querySelectorAll("a[data-target]");
  if (!links.length || !("IntersectionObserver" in window)) return;
  const map = new Map();
  links.forEach((a) => map.set(a.dataset.target, a));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = map.get(entry.target.id);
        if (!link) return;
        link.classList.toggle("current", entry.isIntersecting);
      });
    },
    { rootMargin: "-20% 0px -70% 0px" }
  );
  document.querySelectorAll("h2[id], h3[id]").forEach((h) => observer.observe(h));
}

function tagWeightageCells() {
  document.querySelectorAll(".paper td").forEach((td) => {
    const t = td.textContent;
    if (/must-study/i.test(t)) td.style.background = "rgba(76,122,107,0.18)";
    else if (/low-yield/i.test(t)) td.style.background = "rgba(178,58,46,0.14)";
    else if (/moderate/i.test(t)) td.style.background = "rgba(217,164,65,0.16)";
  });
}

function redactModelAnswers(sections) {
  sections.forEach((section) => {
    const paras = section.querySelectorAll("p, h4");
    paras.forEach((p) => {
      if (!/model[- ]answer/i.test(p.textContent)) return;
      const next = p.nextElementSibling;
      if (!next || next.tagName !== "UL") return;
      const details = document.createElement("details");
      details.className = "redact";
      const summary = document.createElement("summary");
      const setLabel = () => {
        summary.textContent = details.open
          ? "🔓 MODEL ANSWER"
          : "🔒 REDACTED — click to reveal model answer";
      };
      setLabel();
      details.addEventListener("toggle", setLabel);
      details.appendChild(summary);
      p.replaceWith(details);
      details.appendChild(p);
      details.appendChild(next);
    });
  });
}

function wireSearch(sections) {
  const box = document.getElementById("searchBox");
  if (!box) return;
  box.addEventListener("input", () => {
    const q = box.value.trim().toLowerCase();
    let anyVisible = false;
    sections.forEach((s) => {
      const match = !q || s.textContent.toLowerCase().includes(q);
      s.classList.toggle("is-hidden", !match);
      if (match) anyVisible = true;
    });
    let msg = document.getElementById("noResults");
    if (!anyVisible) {
      if (!msg) {
        msg = document.createElement("p");
        msg.id = "noResults";
        msg.className = "no-results";
        msg.textContent = "No sections match that search.";
        document.getElementById("content").appendChild(msg);
      }
    } else if (msg) {
      msg.remove();
    }
  });
}

function addCopyCodeButtons() {
  document.querySelectorAll(".paper pre").forEach((pre) => {
    pre.style.position = "relative";
    const btn = document.createElement("button");
    btn.className = "copy-code-btn";
    btn.textContent = "Copy";
    btn.style.cssText = `
      position: absolute; top: 8px; right: 8px;
      font-family: var(--font-mono); font-size: 0.7rem;
      padding: 0.2rem 0.5rem; background: var(--navy-2);
      color: var(--amber); border: 1px solid var(--navy-3);
      border-radius: 3px; cursor: pointer; opacity: 0.8;
    `;
    btn.addEventListener("click", () => {
      const code = pre.querySelector("code") ? pre.querySelector("code").textContent : pre.textContent;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = "Copied!";
        setTimeout(() => { btn.textContent = "Copy"; }, 2000);
      });
    });
    pre.appendChild(btn);
  });
}

function wireKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    if ((e.key === "/" || (e.ctrlKey && e.key === "k")) && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      e.preventDefault();
      const box = document.getElementById("searchBox");
      if (box) box.focus();
    }
  });
}

function initUnitPage() {
  if (!renderMarkdown()) return;
  const content = document.getElementById("content");
  const sections = wrapIntoSections(content);
  buildSidebar(sections);
  redactModelAnswers(sections);
  tagWeightageCells();
  wireSearch(sections);
  addCopyCodeButtons();
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise([content]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initIndexPage();
  initUnitPage();
  wireKeyboardShortcuts();
});

