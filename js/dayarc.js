// Day arc: today's zmanim for New York (the app's preset: 40.7306, -73.9352),
// GRA hours from sunrise to sunset and dawn 72 minutes before sunrise, as in the app.
(function () {
  var LAT = 40.730610, LNG = -73.935242, ZONE = "America/New_York", MIN = 60000;
  // NOAA solar position, re-evaluated at the event itself (as KosherJava does), for sunrise and
  // sunset (sun 0.833° below the horizon) on a civil date.
  var rad = Math.PI / 180;
  function solar(ms) {
    var T = (ms / 864e5 + 2440587.5 - 2451545) / 36525;
    var L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360;
    var M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
    var ecc = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
    var C = Math.sin(M * rad) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
      Math.sin(2 * M * rad) * (0.019993 - 0.000101 * T) + Math.sin(3 * M * rad) * 0.000289;
    var omega = 125.04 - 1934.136 * T;
    var lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega * rad);
    var eps = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60 + 0.00256 * Math.cos(omega * rad);
    var yy = Math.pow(Math.tan(eps * rad / 2), 2);
    return {
      dec: Math.asin(Math.sin(eps * rad) * Math.sin(lambda * rad)),
      eot: 4 / rad * (yy * Math.sin(2 * L0 * rad) - 2 * ecc * Math.sin(M * rad) +
        4 * ecc * yy * Math.sin(M * rad) * Math.cos(2 * L0 * rad) - 0.5 * yy * yy * Math.sin(4 * L0 * rad) -
        1.25 * ecc * ecc * Math.sin(2 * M * rad))
    };
  }
  function sunEvent(y, m, d, sign) {
    var midnight = Date.UTC(y, m - 1, d), t = Date.UTC(y, m - 1, d, 12);
    for (var i = 0; i < 3; i++) {
      var s = solar(t);
      var ha = Math.acos(Math.cos(90.833 * rad) / (Math.cos(LAT * rad) * Math.cos(s.dec)) - Math.tan(LAT * rad) * Math.tan(s.dec)) / rad;
      t = midnight + (720 - 4 * LNG - s.eot + sign * 4 * ha) * MIN;
    }
    return t;
  }
  // Seconds are dropped, as the app's clock format does.
  function round(ms) { return Math.floor(ms / MIN) * MIN; }
  var clock = new Intl.DateTimeFormat("en-US", { timeZone: ZONE, hour: "numeric", minute: "2-digit" });
  function hm(ms) { return clock.format(new Date(round(ms))).replace(/\s?[AP]M$/, ""); }

  // Today's date in New York, at midday there.
  var parts = {};
  new Intl.DateTimeFormat("en-US", { timeZone: ZONE, year: "numeric", month: "numeric", day: "numeric" })
    .formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
  var today = Date.UTC(+parts.year, +parts.month - 1, +parts.day, 17);
  var rise = sunEvent(+parts.year, +parts.month, +parts.day, -1), set = sunEvent(+parts.year, +parts.month, +parts.day, 1);
  var hour = (set - rise) / 12;
  var z = [
    { n: "Dawn", t: rise - 72 * MIN },
    { n: "Sunrise", t: rise },
    { n: "Shema", t: rise + 3 * hour },
    { n: "Midday", t: rise + 6 * hour },
    { n: "Mincha", t: rise + 9.5 * hour },
    { n: "Plag", t: rise + 10.75 * hour },
    { n: "Sunset", t: set }
  ];
  var alarmT = set - 18 * MIN;

  // Header: civil date, Hebrew date, Rosh Chodesh.
  var NAMES = { Tishri: "Tishrei", Heshvan: "Cheshvan", Tamuz: "Tammuz" };
  function hebrew(ms) {
    var hp = {};
    new Intl.DateTimeFormat("en-u-ca-hebrew", { timeZone: ZONE, year: "numeric", month: "long", day: "numeric" })
      .formatToParts(new Date(ms)).forEach(function (p) { hp[p.type] = p.value; });
    return { day: +hp.day, month: NAMES[hp.month] || hp.month, year: hp.year };
  }
  var HEB = { Tishrei: "תשרי", Cheshvan: "חשוון", Kislev: "כסלו", Tevet: "טבת", Shevat: "שבט", Adar: "אדר",
    "Adar I": "אדר א׳", "Adar II": "אדר ב׳", Nisan: "ניסן", Iyar: "אייר", Sivan: "סיוון", Tammuz: "תמוז", Av: "אב", Elul: "אלול" };
  function gematria(n) {
    var out = "", vals = [[400, "ת"], [300, "ש"], [200, "ר"], [100, "ק"], [90, "צ"], [80, "פ"], [70, "ע"], [60, "ס"],
      [50, "נ"], [40, "מ"], [30, "ל"], [20, "כ"], [10, "י"], [9, "ט"], [8, "ח"], [7, "ז"], [6, "ו"], [5, "ה"], [4, "ד"], [3, "ג"], [2, "ב"], [1, "א"]];
    while (n > 0) {
      if (n === 15) { out += "טו"; break; }
      if (n === 16) { out += "טז"; break; }
      for (var i = 0; i < vals.length; i++) if (vals[i][0] <= n) { out += vals[i][1]; n -= vals[i][0]; break; }
    }
    return out.length === 1 ? out + "׳" : out.slice(0, -1) + "״" + out.slice(-1);
  }
  try {
    document.getElementById("arc-date").textContent = new Intl.DateTimeFormat("en-US",
      { timeZone: ZONE, weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(new Date(today));
    var hd = hebrew(today), line = hd.day + " " + hd.month + " " + hd.year;
    if (hd.day === 30) line += " · Rosh Chodesh " + hebrew(today + 864e5).month;
    else if (hd.day === 1 && hd.month !== "Tishrei") line += " · Rosh Chodesh " + hd.month;
    else if (hd.day === 1 || hd.day === 2) line += hd.month === "Tishrei" ? " · Rosh Hashanah" : "";
    document.getElementById("arc-heb-en").textContent = line;
    document.getElementById("arc-heb").textContent = gematria(hd.day) + " " + (HEB[hd.month] || "") + " " + gematria(+hd.year % 1000);
  } catch (err) { /* keep the date written in the page */ }
  document.getElementById("arc-alarm").textContent = hm(alarmT);

  var ns = "http://www.w3.org/2000/svg", svg = document.getElementById("arc");
  svg.setAttribute("aria-label", "Today's zmanim in New York, from dawn at " + hm(z[0].t) + " to sunset at " +
    hm(set) + ", with an alarm 18 minutes before sunset at " + hm(alarmT) + ".");
  // The sun sits where it is now while it is up in New York, and at midday otherwise.
  var now = Date.now(), sunT = now > rise && now < set ? now : z[3].t;
  // Wide screens get the labeled arc; phones get a smaller arc without labels and the list below it.
  function draw(narrow) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var W = narrow ? 400 : 800, T0 = z[0].t - 20 * MIN, T1 = set + 25 * MIN;
    var X0 = narrow ? 16 : 44, X1 = W - X0, BASE = narrow ? 120 : 186, H = narrow ? 90 : 128, TOP = narrow ? 14 : 26;
    svg.setAttribute("viewBox", "0 0 " + W + " " + (narrow ? 132 : 256));
    function x(t) { return X0 + (t - T0) / (T1 - T0) * (X1 - X0); }
    function y(t) {
      if (t <= rise || t >= set) return BASE;
      return BASE - H * Math.sin(Math.PI * (t - rise) / (set - rise));
    }
    function el(name, attrs, text, parent) {
      var e = document.createElementNS(ns, name);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      if (text) e.textContent = text;
      (parent || svg).appendChild(e);
      return e;
    }
    // Gradients: the light under the arc, the arc itself (brightest at midday), dawn on the horizon, the sun's glow.
    var defs = el("defs", {});
    function grad(id, kind, attrs, stops) {
      var g = el(kind, Object.assign({ id: id }, attrs), null, defs);
      stops.forEach(function (s) { el("stop", { offset: s[0], "stop-color": s[1], "stop-opacity": s[2] }, null, g); });
    }
    grad("arc-fill", "linearGradient", { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, "#F2B544", 0.32], [1, "#F2B544", 0]]);
    grad("arc-line", "linearGradient", { x1: 0, y1: 0, x2: 1, y2: 0 }, [[0, "#F2B544", 0.45], [0.5, "#F6C870", 1], [1, "#F2B544", 0.45]]);
    grad("arc-dawn", "linearGradient", { x1: 0, y1: 0, x2: 1, y2: 0 }, [[0, "#F2B544", 0], [1, "#F2B544", 0.7]]);
    grad("arc-glow", "radialGradient", {}, [[0, "#F6C870", 0.55], [0.45, "#F2B544", 0.18], [1, "#F2B544", 0]]);

    el("line", { x1: X0 - 14, x2: X1 + 14, y1: BASE, y2: BASE, stroke: "var(--arc-line)", "stroke-width": 1 });
    el("rect", { x: x(z[0].t), y: BASE - 1, width: x(rise) - x(z[0].t), height: 2, fill: "url(#arc-dawn)" });
    var d = "", step = (set - rise) / 160;
    for (var t = rise; t <= set; t += step) d += (d ? " L" : "M") + x(t).toFixed(1) + " " + y(t).toFixed(1);
    d += " L" + x(set).toFixed(1) + " " + BASE;
    el("path", { d: d + " Z", fill: "url(#arc-fill)" });
    el("path", { d: d, fill: "none", stroke: "url(#arc-line)", "stroke-width": 3, "stroke-linecap": "round" });

    // The sun, with its glow.
    var sx = x(sunT), sy = y(sunT);
    el("circle", { cx: sx, cy: sy, r: narrow ? 26 : 38, fill: "url(#arc-glow)" });
    el("circle", { cx: sx, cy: sy, r: narrow ? 8 : 10.5, fill: "#F6C870" });

    z.forEach(function (p) {
      var px = x(p.t), py = y(p.t);
      if (py < BASE - 1) el("line", { x1: px, x2: px, y1: py + 6, y2: BASE, stroke: "var(--arc-line)", "stroke-width": 1, "stroke-dasharray": "2 4" });
      el("line", { x1: px, x2: px, y1: BASE - 4, y2: BASE + 4, stroke: "var(--arc-muted)", "stroke-width": 1 });
      el("circle", { cx: px, cy: py, r: 4, fill: "var(--arc-bg)", stroke: "#F2B544", "stroke-width": 2 });
      if (narrow) return;
      el("text", { x: px, y: BASE + 30, "text-anchor": "middle", class: "t-name" }, p.n);
      el("text", { x: px, y: BASE + 50, "text-anchor": "middle", class: "t-time" }, hm(p.t));
    });

    // The alarm, 18 minutes before sunset: a ring on the arc and a gold label above it.
    var ax = x(alarmT), ay = y(alarmT), labelY = TOP + (narrow ? 0 : 2);
    el("line", { x1: ax, x2: ax, y1: ay - 8, y2: labelY + (narrow ? 10 : 14), stroke: "var(--accent)", "stroke-width": 1.25, "stroke-dasharray": "3 3" });
    el("circle", { cx: ax, cy: ay, r: 9, fill: "none", stroke: "var(--accent)", "stroke-width": 1.5, opacity: 0.55 });
    el("circle", { cx: ax, cy: ay, r: 4.5, fill: "var(--accent)" });
    if (narrow) {
      el("circle", { cx: ax, cy: labelY + 4, r: 4, fill: "var(--accent)" });
      return;
    }
    var pill = el("g", { class: "t-pill" });
    var bg = el("rect", { y: labelY - 13, height: 28, rx: 14, fill: "var(--accent)" }, null, pill);
    var label = el("text", { y: labelY + 5.5, class: "t-alarm" }, null, pill);
    el("tspan", { "font-weight": 700 }, "Alarm " + hm(alarmT), label);
    el("tspan", {}, "  ·  18 min before sunset", label);
    var w = (label.getComputedTextLength ? label.getComputedTextLength() : 220) + 28;
    var left = Math.min(Math.max(ax - w / 2, X0), X1 + 14 - w);
    bg.setAttribute("x", left); bg.setAttribute("width", w);
    label.setAttribute("x", left + 14);
  }
  var narrowMq = window.matchMedia("(max-width: 640px)");
  function fit() { draw(narrowMq.matches); }
  fit();
  if (narrowMq.addEventListener) narrowMq.addEventListener("change", fit); else narrowMq.addListener(fit);

  // The same zmanim as a list, in time order with the alarm in its place (shown on phones).
  var list = document.getElementById("arc-list");
  z.concat([{ n: "Alarm · 18 min before sunset", t: alarmT, alarm: true }])
    .sort(function (a, b) { return a.t - b.t; })
    .forEach(function (p) {
      var li = document.createElement("li"), name = document.createElement("span"), time = document.createElement("span");
      if (p.alarm) li.className = "alarm";
      name.textContent = p.n; time.className = "t"; time.textContent = hm(p.t);
      li.appendChild(name); li.appendChild(time); list.appendChild(li);
    });
})();
