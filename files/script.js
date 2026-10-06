(() => {
  "use strict";

  // ---------- Elements ----------
  const app = document.getElementById("app");
  const chat = document.getElementById("chat");
  const welcome = document.getElementById("welcome");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("input");
  const sendBtn = document.getElementById("send");
  const gradeOverlay = document.getElementById("gradeOverlay");
  const gradeButtons = document.querySelectorAll(".grade-btn");

  const mobileQuery = window.matchMedia("(max-width: 768px)");
  let grade = sessionStorage.getItem("lks888_grade");

  const setGrade = (selectedGrade) => {
    grade = selectedGrade;
    sessionStorage.setItem("lks888_grade", selectedGrade);
    gradeOverlay.hidden = true;
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  };

  const showGradeSelector = () => {
    gradeOverlay.hidden = false;
    input.disabled = true;
    sendBtn.disabled = true;
  };

  if (grade === "junior" || grade === "senior") {
    gradeOverlay.hidden = true;
  } else {
    showGradeSelector();
  }

  gradeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedGrade = button.dataset.grade;
      if (selectedGrade === "junior" || selectedGrade === "senior") {
        setGrade(selectedGrade);
      }
    });
  });

  // ---------- Sidebar ----------
  const setSidebar = (open) => app.classList.toggle("collapsed", !open);

  document.getElementById("sidebarOpen").addEventListener("click", () => setSidebar(true));
  document.getElementById("sidebarClose").addEventListener("click", () => setSidebar(false));
  document.getElementById("backdrop").addEventListener("click", () => setSidebar(false));

  // มือถือเริ่มต้นแบบซ่อน / คอมพิวเตอร์เริ่มต้นแบบเปิด
  setSidebar(!mobileQuery.matches);
  mobileQuery.addEventListener("change", (e) => setSidebar(!e.matches));

  // ---------- โหมด (เตรียมไว้สำหรับอนาคต) ----------
  // เพิ่ม <section class="view" data-view="ชื่อโหมด"> แล้วเอา disabled ออกจากปุ่มใน Sidebar
  document.querySelectorAll(".mode").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      document.querySelectorAll(".mode").forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.toggleAttribute("aria-current", b === btn);
      });
      document.querySelectorAll(".view").forEach((v) => {
        v.hidden = v.dataset.view !== btn.dataset.mode;
      });
      document.querySelector(".topbar h1").textContent = btn.firstChild.textContent.trim();
      if (mobileQuery.matches) setSidebar(false);
    });
  });

  // ---------- Chat helpers ----------
  const scrollToBottom = () => { chat.scrollTop = chat.scrollHeight; };

  function addMessage(text, role, extraClass = "") {
    if (welcome) welcome.remove();
    const el = document.createElement("div");
    el.className = `msg ${role} ${extraClass}`.trim();
    el.textContent = text; // textContent ป้องกัน XSS
    chat.appendChild(el);
    scrollToBottom();
    return el;
  }

  function addTyping() {
    const el = addMessage("", "bot");
    el.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
    return el;
  }

  function setBusy(busy) {
    sendBtn.disabled = busy;
    input.disabled = busy;
    if (!busy) input.focus();
  }

  // ---------- ส่งข้อความไป Flask: POST /chat ----------
  // ส่ง:  { "message": "..." }
  // รับ:  { "reply": "..." }
  async function sendMessage(text) {
    if (grade !== "junior" && grade !== "senior") {
      showGradeSelector();
      return;
    }

    addMessage(text, "user");
    const typing = addTyping();
    setBusy(true);

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, grade }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      typing.remove();
      addMessage(data.reply ?? "ไม่ได้รับคำตอบจากระบบ", "bot");
    } catch (err) {
      typing.remove();
      addMessage("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองส่งใหม่อีกครั้ง", "bot", "error");
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  // ---------- Events ----------
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (grade !== "junior" && grade !== "senior") {
      showGradeSelector();
      return;
    }

    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    autoResize();
    sendMessage(text);
  });

  // Enter ส่ง / Shift+Enter ขึ้นบรรทัดใหม่
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  function autoResize() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 140) + "px";
  }
  input.addEventListener("input", autoResize);

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => sendMessage(chip.textContent));
  });
})();