(() => {
  "use strict";

  // ===== ข้อมูลตัวอย่าง: แก้ตัวเลขตรงนี้ได้เลย (หรือเปลี่ยนเป็น fetch จากไฟล์/Flask ภายหลัง) =====
  const STATS_DATA = {
    junior: {                       // ม.ต้น: จำนวนนักเรียนที่เข้าแต่ละสาย
      tracks: [
        { name: "ห้องเรียนวิทย์-คณิต", count: 120 },
        { name: "ห้องเรียนภาษา",       count: 80 },
        { name: "ห้องเรียนทั่วไป",      count: 90 },
        { name: "ห้องเรียนดนตรี-ศิลปะ", count: 30 },
      ],
    },
    senior: {                       // ม.ปลาย: นักเรียนเก่า (old) และนักเรียนใหม่ (fresh) ต่อสาย
      tracks: [
        { name: "วิทย์-คณิต",   old: 85, fresh: 25 },
        { name: "ศิลป์-ภาษา",   old: 45, fresh: 15 },
        { name: "ศิลป์-คำนวณ",  old: 35, fresh: 10 },
        { name: "ศิลป์-สังคม",  old: 25, fresh: 10 },
      ],
    },
  };
  // ===========================================================================================

  const COLORS = ["#08195a", "#1237b8", "#2fa8ff", "#8cc9ff"];
  const body = document.getElementById("statsBody");
  const pct = (n, total) => (total ? Math.round((n / total) * 1000) / 10 : 0);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const sum = (arr, f) => arr.reduce((a, t) => a + f(t), 0);

  const bars = (items, total) => items.map((t) => {
    const p = pct(t.value, total);
    return `<div class="row"><div class="row-top"><span>${esc(t.name)}</span><b>${p}%</b></div>
      <div class="bar"><i style="width:${p}%"></i></div></div>`;
  }).join("");

  function donut(items) {
    const total = sum(items, (t) => t.value), R = 70, C = 2 * Math.PI * R;
    let offset = 0;
    const arcs = items.map((t, i) => {
      const len = (t.value / total) * C;
      const el = `<circle cx="95" cy="95" r="${R}" fill="none" stroke="${COLORS[i % COLORS.length]}" stroke-width="30"
        stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 95 95)"/>`;
      offset += len;
      return el;
    }).join("");
    const legend = items.map((t, i) => `<li><span class="dot" style="background:${COLORS[i % COLORS.length]}"></span>
      ${esc(t.name)}<b>${pct(t.value, total)}%</b></li>`).join("");
    return `<div class="donut-wrap">
      <svg class="donut" viewBox="0 0 190 190" role="img" aria-label="กราฟโดนัทความนิยมของสาย">${arcs}
        <text x="95" y="93" font-size="26" font-weight="600">${total}</text>
        <text x="95" y="113" font-size="12">คน</text></svg>
      <ul class="legend">${legend}</ul></div>`;
  }

  function renderJunior() {
    const tr = STATS_DATA.junior.tracks, total = sum(tr, (t) => t.count);
    return `<div class="card"><h3>จำนวนนักเรียนที่เข้า ม.ต้น</h3>
        <div class="big">${total}<small>คน</small></div></div>
      <div class="card"><h3>สัดส่วนแต่ละสาย</h3>
        ${bars(tr.map((t) => ({ name: t.name, value: t.count })), total)}</div>`;
  }

  function renderSenior() {
    const tr = STATS_DATA.senior.tracks;
    const old = sum(tr, (t) => t.old), all = old + sum(tr, (t) => t.fresh);
    return `<div class="card"><h3>นักเรียนเก่าที่เข้า ม.ปลาย</h3>
        <div class="big">${pct(old, all)}%<small>(${old} จาก ${all} คน)</small></div></div>
      <div class="card"><h3>นักเรียนเก่าเข้าสายอะไรบ้าง</h3>
        ${bars(tr.map((t) => ({ name: t.name, value: t.old })), old)}</div>
      <div class="card"><h3>ความนิยมของสาย (นักเรียนทั้งหมด)</h3>
        ${donut(tr.map((t) => ({ name: t.name, value: t.old + t.fresh })))}</div>`;
  }

  function show(level) {
    document.querySelectorAll(".tab").forEach((b) => {
      const on = b.dataset.level === level;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on);
    });
    body.innerHTML = level === "junior" ? renderJunior() : renderSenior();
  }

  document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => show(b.dataset.level)));
  show("junior");
})();
