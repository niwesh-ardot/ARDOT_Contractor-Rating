"use strict";

const tabList = document.querySelector("[data-tab-list]");
const tabs = [...tabList.querySelectorAll("button")];

function selectModel(tab, focus = false) {
  for (const candidate of tabs) {
    const selected = candidate === tab;
    candidate.tabIndex = selected ? 0 : -1;
    candidate.setAttribute("aria-selected", String(selected));
    document.getElementById(candidate.getAttribute("aria-controls")).hidden = !selected;
  }

  if (focus) tab.focus();
}

tabList.setAttribute("role", "tablist");
for (const tab of tabs) {
  tab.setAttribute("role", "tab");
  const panel = document.getElementById(tab.getAttribute("aria-controls"));
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", tab.id);
  panel.tabIndex = 0;
  tab.addEventListener("click", () => selectModel(tab));
}
selectModel(tabs[0]);

tabList.addEventListener("keydown", (event) => {
  const index = tabs.indexOf(event.target);
  if (index < 0) return;

  const targets = {
    ArrowLeft: (index + tabs.length - 1) % tabs.length,
    ArrowRight: (index + 1) % tabs.length,
    Home: 0,
    End: tabs.length - 1,
  };
  if (!Object.hasOwn(targets, event.key)) return;

  event.preventDefault();
  selectModel(tabs[targets[event.key]], true);
});

const chapters = [...document.querySelectorAll(".chapter")];
const presentButton = document.querySelector("[data-present]");
const controls = document.getElementById("present-controls");
const previous = controls.querySelector("[data-prev]");
const next = controls.querySelector("[data-next]");
const exit = controls.querySelector("[data-exit]");
const position = controls.querySelector("[data-position]");
let activeChapter = 0;

function showChapter(index) {
  if (index < 0 || index >= chapters.length) return;

  activeChapter = index;
  for (const [chapterIndex, chapter] of chapters.entries()) {
    chapter.hidden = chapterIndex !== index;
  }

  const current = chapters[index];
  position.textContent = (index + 1) + " of " + chapters.length;
  previous.disabled = index === 0;
  next.disabled = index === chapters.length - 1;
  current.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
}

function startPresentation() {
  document.body.classList.add("presentation");
  controls.hidden = false;
  const currentSection = chapters.findIndex((chapter) => "#" + chapter.id === location.hash);
  showChapter(Math.max(0, currentSection));
}

function exitPresentation() {
  document.body.classList.remove("presentation");
  for (const chapter of chapters) chapter.hidden = false;
  controls.hidden = true;
  const current = chapters[activeChapter];
  history.replaceState(null, "", "#" + current.id);
  current.scrollIntoView({ behavior: "instant" });
  current.focus({ preventScroll: true });
}

for (const chapter of chapters) chapter.tabIndex = -1;

presentButton.hidden = false;
presentButton.addEventListener("click", startPresentation);
previous.addEventListener("click", () => showChapter(activeChapter - 1));
next.addEventListener("click", () => showChapter(activeChapter + 1));
exit.addEventListener("click", exitPresentation);

document.addEventListener("keydown", (event) => {
  if (controls.hidden || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === "Escape") exitPresentation();
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showChapter(activeChapter - 1);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    showChapter(activeChapter + 1);
  }
});

const menuLinks = [...document.querySelectorAll("nav a")];
function updateMenu() {
  for (const link of menuLinks) {
    if (link.hash === location.hash) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}
window.addEventListener("hashchange", updateMenu);
updateMenu();
