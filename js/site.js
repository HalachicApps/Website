// Shared page behavior: the phone menu, copy buttons and the "not on Android" download note.
(function () {
  var header = document.querySelector(".site-header"), menuBtn = document.getElementById("menu-btn");
  if (header && menuBtn) {
    var setMenu = function (open) {
      header.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Menu");
    };
    menuBtn.addEventListener("click", function () { setMenu(!header.classList.contains("open")); });
    document.getElementById("nav").addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("click", function (e) { if (!header.contains(e.target)) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  // <button class="copy" data-copy="id-of-element-to-copy">
  Array.prototype.forEach.call(document.querySelectorAll("[data-copy]"), function (btn) {
    var label = btn.textContent;
    btn.addEventListener("click", function () {
      var src = document.getElementById(btn.getAttribute("data-copy")), text = src.textContent.trim();
      function done() { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = label; }, 1800); }
      function fallback() {
        var r = document.createRange(); r.selectNodeContents(src);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        btn.textContent = "Selected";
      }
      try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
    });
  });

  // On the download page, tell computer and iPhone visitors to open the page on their Android phone.
  var note = document.getElementById("platform-note");
  if (note && !/Android/i.test(navigator.userAgent)) note.classList.add("show");
})();
