// --- Booking widget: day / time selection + submit ---
(function () {
  "use strict";

  function wireGroup(selector) {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("is-selected"); });
        btn.classList.add("is-selected");
      });
    });
  }

  wireGroup(".day");
  wireGroup(".time");

  const form = document.getElementById("bookingForm");
  const note = document.getElementById("bookingNote");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const service = form.service.value;
      const day = (document.querySelector(".day.is-selected") || {}).dataset?.day || "";
      const time = (document.querySelector(".time.is-selected") || {}).dataset?.time || "";

      if (!name || !phone) {
        note.hidden = false;
        note.textContent = "Please add your name and phone so Roland can confirm.";
        note.style.color = "#b96f4d";
        return;
      }

      const billing = form.directbill.checked ? " We'll direct-bill your insurer." : "";
      note.hidden = false;
      note.style.color = "";
      note.textContent =
        "Thanks, " + name + " — request received for " + service +
        " on " + day + " at " + time + "." + billing +
        " Roland will text " + phone + " to confirm.";

      form.querySelectorAll("input[type=text], input[type=tel]").forEach(function (i) { i.value = ""; });
    });
  }

  // --- Subtle active-link highlight on scroll ---
  const links = Array.from(document.querySelectorAll('.nav__links a'));
  const sections = links
    .map(function (l) { return document.querySelector(l.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = "#" + entry.target.id;
          links.forEach(function (l) {
            l.style.color = l.getAttribute("href") === id ? "var(--green)" : "";
            l.style.opacity = l.getAttribute("href") === id ? "1" : "";
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { obs.observe(s); });
  }
})();
