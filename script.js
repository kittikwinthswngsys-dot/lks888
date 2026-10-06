(() => {
  "use strict";

  const app = document.getElementById("app");
  const chat = document.getElementById("chat");
  const welcome = document.getElementById("welcome");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("input");
  const sendBtn = document.getElementById("send");

  const mobileQuery = window.matchMedia("(max-width: 768px)");

  const gradeTabs = document.querySelectorAll(".grade-tab");

  const savedGrade = sessionStorage.getItem("lks888_grade");
  let grade = savedGrade === "senior" ? "senior" : "junior";
  let isBusy = false;

  const updateTabs = () => {
    gradeTabs.forEach((tab) => {
      const on = tab.dataset.grade === grade;
      tab.classList.toggle("active", on);
      tab.setAttribute("aria-selected", on);
    });
  };

  const setGrade = (selectedGrade) => {
    grade = selectedGrade;
    sessionStorage.setItem("lks888_grade", selectedGrade);
    updateTabs();

    if (!isBusy) {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  };

  updateTabs();

  gradeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const selectedGrade = tab.dataset.grade;

      if (selectedGrade !== "junior" && selectedGrade !== "senior") {
        return;
      }

      setGrade(selectedGrade);
    });
  });

  const setSidebar = (open) => {
    app.classList.toggle("collapsed", !open);
  };

  document
    .getElementById("sidebarOpen")
    .addEventListener("click", () => setSidebar(true));

  document
    .getElementById("sidebarClose")
    .addEventListener("click", () => setSidebar(false));

  document
    .getElementById("backdrop")
    .addEventListener("click", () => setSidebar(false));

  setSidebar(!mobileQuery.matches);

  mobileQuery.addEventListener("change", (e) => {
    setSidebar(!e.matches);
  });

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

      document.querySelector(".topbar h1").textContent =
        btn.firstChild.textContent.trim();

      if (mobileQuery.matches) {
        setSidebar(false);
      }
    });
  });

  const scrollToBottom = () => {
    chat.scrollTop = chat.scrollHeight;
  };

  function addMessage(text, role, extraClass = "") {
    if (welcome) {
      welcome.remove();
    }

    const el = document.createElement("div");

    el.className = `msg ${role} ${extraClass}`.trim();
    el.textContent = text;

    chat.appendChild(el);
    scrollToBottom();

    return el;
  }

  function addTyping() {
    const el = addMessage("", "bot");

    el.innerHTML =
      '<span class="typing"><span></span><span></span><span></span></span>';

    return el;
  }

  function setBusy(busy) {
    isBusy = busy;
    sendBtn.disabled = busy;
    input.disabled = busy;

    if (!busy) {
      input.focus();
    }
  }

  async function sendMessage(text) {

    addMessage(text, "user");

    const typing = addTyping();

    setBusy(true);

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          grade: grade
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      typing.remove();

      addMessage(
        data.reply ?? "ไม่ได้รับคำตอบจากระบบ",
        "bot"
      );

    } catch (err) {
      typing.remove();

      addMessage(
        "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองส่งใหม่อีกครั้ง",
        "bot",
        "error"
      );

      console.error(err);

    } finally {
      setBusy(false);
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const text = input.value.trim();

    if (!text) return;

    input.value = "";

    autoResize();

    sendMessage(text);
  });

  input.addEventListener("keydown", (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.isComposing
    ) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  function autoResize() {
    input.style.height = "auto";

    input.style.height =
      Math.min(input.scrollHeight, 140) + "px";
  }

  input.addEventListener("input", autoResize);

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      sendMessage(chip.textContent.trim());
    });
  });
})();