import { projects } from "./projects.js";

const query = new URLSearchParams(location.search);
const key = Object.hasOwn(projects, query.get("project"))
  ? query.get("project")
  : "chavos";
const p = projects[key];
const option = query.get("option") === "b" ? "b" : "a";
const scale = query.get("scale") === "2" ? 2 : 1;
const e = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const sheet = document.querySelector("#sheet");
document.title = `${p.name} — ${option === "a" ? "Specimen" : "Component catalog"}`;
sheet.classList.add(`option-${option}`, key);
sheet.style.cssText = `--project-display:'${p.display}';--project-body:'${p.body}';--display-weight:${p.displayWeight};--body-weight:${p.bodyWeight};--surface:${p.surface};--ink:${p.ink};--accent:${p.accent};--on-accent:${p.onAccent};--project-border:${p.border};--hover:${p.hover ?? p.accent};--radius:${p.radius}px;--control-font:'${p.controlFont}';--control-weight:${p.controlWeight};--control-size:${p.controlSize}px;--tracking:${p.tracking}`;
document.body.style.setProperty("--render-scale", scale);
const heading = (n, label) =>
  `<h2 class="section-label"><span>${n}</span>${label}</h2>`;
const palette = () =>
  `<div class="swatches" style="--swatch-count:${p.colors.length}">${p.colors.map((c) => `<div class="swatch"><div class="color" style="background:${c.value}"></div><div class="swatch-caption"><span>${e(c.name)}</span><span>${e(c.value)}</span></div></div>`).join("")}</div>`;
const type = () =>
  `<div class="type-specimens"><div class="display-sample">${e(p.displaySample)}</div><p class="type-meta">${e(p.display)} / ${p.displayWeight}</p><div class="body-sample">${e(p.bodySample)}</div><p class="type-meta">${e(p.body)} / ${p.bodyWeight}</p></div>`;
const table = () =>
  `<table class="type-table"><caption class="sr-only">Website type sizes in pixels</caption><thead><tr><th>role</th><th>desktop</th><th>mobile</th></tr></thead><tbody>${p.scale.map((row) => `<tr>${row.map((cell, i) => `<${i ? "td" : "th"}>${e(cell)}${i && cell !== "—" ? " px" : ""}</${i ? "td" : "th"}>`).join("")}</tr>`).join("")}</tbody></table>`;
const controls = () =>
  `<div class="component-surface"><div class="buttons"><span class="project-button primary">${e(p.primary)}</span><span class="project-button secondary">${e(p.secondary)}</span></div></div>`;
const navigation = () =>
  `<div class="nav-specimen">${p.nav.map((item, i) => `<span${i === 0 ? ' class="current"' : ""}>${e(item)}</span>`).join("")}</div>`;
const footer = `<footer class="sheet-footer"><span>design & development / kenneth rathbun</span><span>${option === "a" ? "01" : "02"}</span></footer>`;

if (option === "a") {
  sheet.innerHTML = `<header class="index-header"><h1>${e(p.name)}</h1><p>design system</p></header>
  <div class="a-content">
    <section class="palette-section">${heading("01", "color")}${palette()}</section>
    <section class="type-section">${heading("02", "typography")}${type()}${table()}</section>
    <section class="controls-section">${heading("03", "interface")}${controls()}<div class="geometry-line">${p.geometry.map(([label, value]) => `<span>${e(label.toLowerCase())} / ${e(value)}</span>`).join("")}</div></section>
  </div>${footer}`;
} else {
  sheet.innerHTML = `<header class="catalog-header"><div><p class="catalog-title">design system</p><h1>${e(p.name)}</h1></div><p>${e(p.date)}<br>${e(p.location)}</p></header>
  <div class="b-top">
    <section class="catalog-type">${heading("01", "type")}${type()}${table()}</section>
    <section class="catalog-palette">${heading("02", "color")}<div class="color-list">${p.colors.map((c) => `<div class="color-row"><div class="color" style="background:${c.value}"></div><div><h3>${e(c.name)}</h3><p>${e(c.value)}</p><p class="role">${e(c.role.toLowerCase())}</p></div></div>`).join("")}</div></section>
  </div>
  <section class="catalog-components">${heading("03", "components")}<div class="catalog-stage"><div class="stage-heading">${e(p.displaySample)}</div>${navigation()}<div class="stage-rule"></div><div class="buttons"><span class="project-button primary">${e(p.primary)}</span><span class="project-button secondary">${e(p.secondary)}</span></div></div>${p.hover ? `<div class="state-row"><span>default above</span><span class="project-button hover-sample">${e(p.primary)}</span><span>hover fill</span></div>` : `<p class="reference-note">current page / bold label</p>`}</section>
  <section class="catalog-details">${p.geometry.map(([label, value]) => `<div><h2>${e(label.toLowerCase())}</h2><p>${e(value)}</p></div>`).join("")}</section>${footer}`;
}

// Fonts are self-hosted; exports wait for these exact files to finish loading.
await document.fonts.ready;
document.documentElement.dataset.ready = "true";
