/* =========================================================================
 * PHCN-METRICS · icons.js — Bộ biểu tượng SVG dạng nét (24×24)
 * ========================================================================= */
(function (g) {
  'use strict';

  var P = {
    activity: '<path d="M3 12h4l3 8 4-16 3 8h4"/>',
    heart: '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.7 8.8-8.7a5.5 5.5 0 0 0 0-7.8Z"/>',
    heartPulse: '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.7 8.8-8.7a5.5 5.5 0 0 0 0-7.8Z"/><path d="M3.5 13h4l2-3 2.5 6 2-3h6"/>',
    wind: '<path d="M4 8h9a3 3 0 1 0-3-3"/><path d="M4 12h13a3 3 0 1 1-3 3"/><path d="M4 16h7a2.5 2.5 0 1 1-2.5 2.5"/>',
    brain: '<path d="M12 3a6.5 6.5 0 0 0-6.5 6.5c0 2 .8 3.2 1.6 4.2.6.7.9 1.2.9 2.1V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-1.2c0-.9.3-1.4.9-2.1.8-1 1.6-2.2 1.6-4.2A6.5 6.5 0 0 0 12 3Z"/><path d="M9.5 22h5"/><path d="M12 9v6"/>',
    speech: '<path d="M21 14a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2Z"/><path d="M8 8h8"/><path d="M8 11.5h5"/>',
    bulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.1 14c.8-1 2.4-2.4 2.4-5a5.5 5.5 0 0 0-11 0c0 2.6 1.6 4 2.4 5"/>',
    spine: '<circle cx="12" cy="3.6" r="1.8"/><path d="M8.5 8h7"/><path d="M8.5 12h7"/><path d="M8.5 16h7"/><path d="M12 6v14"/>',
    bone: '<path d="M17.5 9.5c.7-.7 1.7 0 2.5 0a2.4 2.4 0 1 0 0-4.8.5.5 0 0 1-.5-.5 2.4 2.4 0 1 0-4.8 0c0 .8.7 1.8 0 2.5l-7.2 7.2c-.7.7-1.7 0-2.5 0a2.4 2.4 0 1 0 0 4.8c.3 0 .5.2.5.5a2.4 2.4 0 1 0 4.8 0c0-.8-.7-1.8 0-2.5Z"/>',
    joint: '<circle cx="7" cy="7" r="3"/><circle cx="17" cy="17" r="3"/><path d="M9.2 9.2 14.8 14.8"/>',
    arm: '<path d="M6 4v6a4 4 0 0 0 4 4h3"/><circle cx="6" cy="4" r="2"/><path d="M13 14a4 4 0 0 1 4 4v3"/>',
    clipboard: '<rect x="8" y="2.5" width="8" height="4" rx="1.2"/><path d="M16 4.5h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h2"/><path d="M8.5 11.5h7"/><path d="M8.5 15.5h4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
    trending: '<path d="M22 7 13.5 15.5l-5-5L2 17"/><path d="M16 7h6v6"/>',
    arrowUpRight: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
    search: '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.3-4.3"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5Z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>',
    help: '<circle cx="12" cy="12" r="9.5"/><path d="M9.2 9a2.9 2.9 0 0 1 5.6 1c0 2-2.8 2.6-2.8 4"/><path d="M12 17.5h.01"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3"/>',
    stethoscope: '<path d="M5 3v5a4 4 0 0 0 8 0V3"/><path d="M5 3H3.5M13 3h1.5"/><path d="M9 12v3a5 5 0 0 0 10 0v-1"/><circle cx="19" cy="12" r="2"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 15h12v6H6Z"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
    back: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>'
  };

  function icon(name, size) {
    var d = P[name] || P.activity;
    return '<svg viewBox="0 0 24 24" width="' + (size || 20) + '" height="' + (size || 20) +
      '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }

  /* Biểu tượng riêng cho từng nhóm bệnh lý */
  var GROUP_ICON = {
    stroke_motor: 'brain',
    stroke_lang: 'speech',
    stroke_cog: 'bulb',
    sci: 'spine',
    hip: 'bone',
    knee: 'joint',
    shoulder: 'arm',
    cardiac: 'heartPulse',
    pulmo: 'wind',
    general: 'clipboard'
  };

  g.PHCN = g.PHCN || {};
  g.PHCN.icon = icon;
  g.PHCN.GROUP_ICON = GROUP_ICON;

  /* Gắn biểu tượng cho mọi phần tử [data-ico] có sẵn trong HTML */
  function hydrate(root) {
    var list = (root || document).querySelectorAll('[data-ico]');
    for (var i = 0; i < list.length; i++) {
      list[i].innerHTML = icon(list[i].getAttribute('data-ico'), Number(list[i].getAttribute('data-size')) || 18);
    }
  }
  g.PHCN.hydrateIcons = hydrate;
  document.addEventListener('DOMContentLoaded', function () {
    hydrate(document);
    var bm = document.getElementById('brand-mark');
    if (bm) bm.innerHTML = icon('activity', 22);
  });

})(window);
