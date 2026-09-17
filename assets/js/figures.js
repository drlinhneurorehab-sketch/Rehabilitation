/* =========================================================================
 * PHCN-METRICS · figures.js
 * Thư viện HÌNH MINH HỌA dựng bằng SVG (không dùng file ảnh ngoài,
 * nên phần mềm vẫn chạy offline và gói gọn trong một file khi cần).
 *
 *  - bandRuler : dải ngưỡng diễn giải + con trỏ vị trí điểm người bệnh
 *  - radar     : biểu đồ radar theo lĩnh vực ICF
 *  - goniometer: thước đo góc khớp, vẽ đúng góc đo được
 *  - mrc       : bậc thang sức cơ 0–5
 *  - ashworth  : mức tăng trương lực cơ
 *  - faces     : thang mặt biểu cảm đau 0–10
 *  - bodyMap   : sơ đồ cơ thể trước/sau, bấm chọn vùng đau
 *  - dermatome : sơ đồ điểm cảm giác chìa khóa ISNCSCI
 *  - levelStrip: dải hình người minh họa mức độ (FAC, mRS)
 * ========================================================================= */
(function (g) {
  'use strict';

  var CLS_COLOR = { good: '#0f9b6c', mild: '#7cb518', mod: '#e08700', severe: '#e0344b', '': '#94a3b8' };

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function svg(vb, body, cls) {
    return '<svg viewBox="' + vb + '" class="fig ' + (cls || '') + '" preserveAspectRatio="xMidYMid meet" role="img">' + body + '</svg>';
  }
  function n2(x) { return Math.round(x * 100) / 100; }

  /* ---------------------------------------------------------------
   * Trích các dải ngưỡng diễn giải của một thang
   * ------------------------------------------------------------- */
  function bands(sc) {
    if (!sc || !sc.interpret || !sc.max) return [];
    var lo = sc.min || 0, hi = sc.max;
    var step = (hi - lo) > 200 ? (hi - lo) / 200 : 1;
    var out = [], cur = null;
    for (var v = lo; v <= hi + 0.0001; v += step) {
      var ip = sc.interpret(v);
      if (!ip) continue;
      if (!cur || cur.label !== ip.label) {
        cur = { from: n2(v), to: n2(v), label: ip.label, cls: ip.cls };
        out.push(cur);
      } else { cur.to = n2(v); }
    }
    if (out.length) out[out.length - 1].to = hi;
    return out;
  }

  /* ---------------------------------------------------------------
   * Dải ngưỡng + con trỏ điểm
   * ------------------------------------------------------------- */
  function bandRuler(sc, total, opts) {
    opts = opts || {};
    var bs = bands(sc);
    if (!bs.length) return '';
    var W = 640, H = opts.compact ? 54 : 74, PL = 8, PR = 8;
    var lo = sc.min || 0, hi = sc.max, span = hi - lo || 1;
    var iw = W - PL - PR, barY = opts.compact ? 14 : 24, barH = opts.compact ? 15 : 18;
    function X(v) { return PL + (v - lo) / span * iw; }

    var b = '';
    bs.forEach(function (x, i) {
      var x0 = X(x.from - (i === 0 ? 0 : 0.5)), x1 = X(x.to + (i === bs.length - 1 ? 0 : 0.5));
      var w = Math.max(1, x1 - x0);
      b += '<rect x="' + n2(x0) + '" y="' + barY + '" width="' + n2(w) + '" height="' + barH + '" rx="3" ' +
        'fill="' + (CLS_COLOR[x.cls] || CLS_COLOR['']) + '" opacity="' + (opts.compact ? .9 : .82) + '">' +
        '<title>' + esc(x.label) + ': ' + x.from + '–' + x.to + '</title></rect>';
      if (w > 42) {
        b += '<text x="' + n2(x0 + w / 2) + '" y="' + (barY + barH - 4) + '" class="fig-band" text-anchor="middle">' +
          esc(x.from === x.to ? String(x.from) : x.from + '–' + x.to) + '</text>';
      }
    });

    /* Mốc đầu – cuối */
    b += '<text x="' + PL + '" y="' + (barY - 6) + '" class="fig-ax">' + lo + '</text>';
    b += '<text x="' + (W - PR) + '" y="' + (barY - 6) + '" class="fig-ax" text-anchor="end">' + hi + '</text>';
    if (sc.reverse) {
      b += '<text x="' + (W / 2) + '" y="' + (barY - 6) + '" class="fig-ax" text-anchor="middle">điểm càng cao càng nặng</text>';
    }

    /* Con trỏ vị trí điểm người bệnh */
    if (total !== null && total !== undefined && !isNaN(total)) {
      var px = X(Math.max(lo, Math.min(hi, total)));
      b += '<polygon points="' + n2(px) + ',' + (barY - 3) + ' ' + n2(px - 6) + ',' + (barY - 12) + ' ' + n2(px + 6) + ',' + (barY - 12) + '" fill="#0b1524"/>';
      b += '<rect x="' + n2(px - 1.5) + '" y="' + barY + '" width="3" height="' + barH + '" fill="#0b1524"/>';
      if (!opts.compact) {
        var lbx = Math.max(24, Math.min(W - 24, px));
        b += '<text x="' + n2(lbx) + '" y="' + (barY + barH + 17) + '" class="fig-val" text-anchor="middle">' +
          String(n2(total)).replace('.', ',') + ' điểm</text>';
      }
    }
    return svg('0 0 ' + W + ' ' + H, b, 'fig-ruler');
  }

  /* ---------------------------------------------------------------
   * Biểu đồ radar theo lĩnh vực
   * ------------------------------------------------------------- */
  function radar(axes, opts) {
    opts = opts || {};
    axes = (axes || []).filter(function (a) { return a && a.value !== null && a.value !== undefined; });
    if (axes.length < 3) return '';
    var W = 460, H = 330, cx = W / 2, cy = H / 2 + 6, R = 108;
    var nA = axes.length, b = '';

    function pt(i, r) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / nA;
      return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
    }
    /* Lưới */
    [0.25, 0.5, 0.75, 1].forEach(function (k) {
      var p = [];
      for (var i = 0; i < nA; i++) { var q = pt(i, R * k); p.push(n2(q[0]) + ',' + n2(q[1])); }
      b += '<polygon points="' + p.join(' ') + '" class="fig-grid-poly"/>';
    });
    for (var i = 0; i < nA; i++) {
      var e = pt(i, R);
      b += '<line x1="' + cx + '" y1="' + cy + '" x2="' + n2(e[0]) + '" y2="' + n2(e[1]) + '" class="fig-grid-line"/>';
    }
    b += '<text x="' + (cx + 3) + '" y="' + (cy - R + 12) + '" class="fig-ax">100</text>';
    b += '<text x="' + (cx + 3) + '" y="' + (cy - R / 2 + 12) + '" class="fig-ax">50</text>';

    /* Đa giác dữ liệu */
    var pp = [];
    axes.forEach(function (a, k) {
      var q = pt(k, R * Math.max(0, Math.min(100, a.value)) / 100);
      pp.push(n2(q[0]) + ',' + n2(q[1]));
    });
    b += '<polygon points="' + pp.join(' ') + '" class="fig-radar-area"/>';
    axes.forEach(function (a, k) {
      var q = pt(k, R * Math.max(0, Math.min(100, a.value)) / 100);
      b += '<circle cx="' + n2(q[0]) + '" cy="' + n2(q[1]) + '" r="4.5" class="fig-radar-dot"><title>' +
        esc(a.label) + ': ' + a.value + '/100</title></circle>';
    });

    /* Nhãn trục */
    axes.forEach(function (a, k) {
      var q = pt(k, R + 26);
      var anchor = 'middle';
      if (q[0] > cx + 12) anchor = 'start';
      else if (q[0] < cx - 12) anchor = 'end';
      var words = String(a.label).split(' ');
      var line1 = words.slice(0, 2).join(' '), line2 = words.slice(2).join(' ');
      b += '<text x="' + n2(q[0]) + '" y="' + n2(q[1]) + '" class="fig-lb" text-anchor="' + anchor + '">' + esc(line1) +
        (line2 ? '<tspan x="' + n2(q[0]) + '" dy="12">' + esc(line2) + '</tspan>' : '') +
        '<tspan x="' + n2(q[0]) + '" dy="13" class="fig-lb-v">' + a.value + '</tspan></text>';
    });
    return svg('0 0 ' + W + ' ' + H, b, 'fig-radar');
  }

  /* ---------------------------------------------------------------
   * Radar CHỒNG nhiều thời điểm
   *   labels  = ['Chức năng cơ thể', …]
   *   datasets = [{name, color, values:[…]}]
   * ------------------------------------------------------------- */
  function radarMulti(labels, datasets, opts) {
    opts = opts || {};
    labels = labels || [];
    datasets = (datasets || []).filter(function (d) { return d && d.values; });
    if (labels.length < 3 || !datasets.length) return '';
    var W = 470, H = 360, cx = W / 2, cy = H / 2 + 2, R = 112, nA = labels.length, b = '';

    function pt(i, r) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / nA;
      return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
    }
    [0.25, 0.5, 0.75, 1].forEach(function (k) {
      var p = [];
      for (var i = 0; i < nA; i++) { var q = pt(i, R * k); p.push(n2(q[0]) + ',' + n2(q[1])); }
      b += '<polygon points="' + p.join(' ') + '" class="fig-grid-poly"/>';
    });
    for (var i = 0; i < nA; i++) {
      var e = pt(i, R);
      b += '<line x1="' + cx + '" y1="' + cy + '" x2="' + n2(e[0]) + '" y2="' + n2(e[1]) + '" class="fig-grid-line"/>';
    }
    b += '<text x="' + (cx + 3) + '" y="' + (cy - R + 12) + '" class="fig-ax">100</text>';
    b += '<text x="' + (cx + 3) + '" y="' + (cy - R / 2 + 12) + '" class="fig-ax">50</text>';

    datasets.forEach(function (d) {
      var pp = [], ok = false;
      d.values.forEach(function (v, k) {
        var val = (v === null || v === undefined) ? 0 : Math.max(0, Math.min(100, v));
        if (v !== null && v !== undefined) ok = true;
        var q = pt(k, R * val / 100);
        pp.push(n2(q[0]) + ',' + n2(q[1]));
      });
      if (!ok) return;
      b += '<polygon points="' + pp.join(' ') + '" fill="' + d.color + '" fill-opacity="' +
        (datasets.length > 1 ? .16 : .22) + '" stroke="' + d.color + '" stroke-width="2.6" stroke-linejoin="round"' +
        (d.dash ? ' stroke-dasharray="7 5"' : '') + '/>';
      d.values.forEach(function (v, k) {
        if (v === null || v === undefined) return;
        var q = pt(k, R * Math.max(0, Math.min(100, v)) / 100);
        b += '<circle cx="' + n2(q[0]) + '" cy="' + n2(q[1]) + '" r="4.5" fill="#fff" stroke="' + d.color +
          '" stroke-width="2.6"><title>' + esc(d.name + ' · ' + labels[k]) + ': ' + v + '/100</title></circle>';
      });
    });

    labels.forEach(function (lb, k) {
      var q = pt(k, R + 26);
      var anchor = 'middle';
      if (q[0] > cx + 12) anchor = 'start';
      else if (q[0] < cx - 12) anchor = 'end';
      var words = String(lb).split(' ');
      var l1 = words.slice(0, 2).join(' '), l2 = words.slice(2).join(' ');
      b += '<text x="' + n2(q[0]) + '" y="' + n2(q[1]) + '" class="fig-lb" text-anchor="' + anchor + '">' + esc(l1) +
        (l2 ? '<tspan x="' + n2(q[0]) + '" dy="12">' + esc(l2) + '</tspan>' : '') + '</text>';
    });
    return svg('0 0 ' + W + ' ' + H, b, 'fig-radar');
  }

  /* ---------------------------------------------------------------
   * Đường xu hướng thu nhỏ (sparkline) cho từng dòng bảng
   * ------------------------------------------------------------- */
  function sparkline(values, opts) {
    opts = opts || {};
    var vals = (values || []).map(function (v) { return (v === null || v === undefined || isNaN(v)) ? null : Number(v); });
    var ok = vals.filter(function (v) { return v !== null; });
    if (ok.length < 2) return '<span class="spark-na">—</span>';
    var W = 104, H = 30, P = 4;
    var lo = opts.min !== undefined ? opts.min : Math.min.apply(null, ok);
    var hi = opts.max !== undefined ? opts.max : Math.max.apply(null, ok);
    if (hi === lo) { hi = lo + 1; lo = lo - 1; }
    var n = vals.length;
    function X(i) { return P + (n === 1 ? (W - 2 * P) / 2 : (W - 2 * P) * i / (n - 1)); }
    function Y(v) { return H - P - (v - lo) / (hi - lo) * (H - 2 * P); }
    var d = '', open = false, b = '';
    vals.forEach(function (v, i) {
      if (v === null) { open = false; return; }
      d += (open ? ' L' : (d ? ' M' : 'M')) + n2(X(i)) + ' ' + n2(Y(v));
      open = true;
    });
    var col = opts.color || '#0f9b8e';
    b += '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    var lastI = -1;
    vals.forEach(function (v, i) { if (v !== null) lastI = i; });
    if (lastI >= 0) b += '<circle cx="' + n2(X(lastI)) + '" cy="' + n2(Y(vals[lastI])) + '" r="3.2" fill="' + col + '"/>';
    return svg('0 0 ' + W + ' ' + H, b, 'fig-spark');
  }

  /* ---------------------------------------------------------------
   * Thước đo góc khớp
   * ------------------------------------------------------------- */
  function goniometer(o) {
    o = o || {};
    var val = (o.value === '' || o.value === null || o.value === undefined || isNaN(o.value)) ? null : Number(o.value);
    var normal = o.normal || 90;
    var W = 300, H = 176, cx = 74, cy = 128, L = 128;
    var dir = o.dir === 'cw' ? 1 : -1;          /* chiều quay khi tăng góc */
    var b = '';

    /* Quạt tầm bình thường */
    function P(a) {
      var r = (a * Math.PI / 180) * dir;
      return [cx + Math.cos(r) * L, cy + Math.sin(r) * L];
    }
    var pn = P(normal);
    var large = normal > 180 ? 1 : 0;
    b += '<path d="M' + cx + ' ' + cy + ' L' + (cx + L) + ' ' + cy + ' A' + L + ' ' + L + ' 0 ' + large + ' ' +
      (dir < 0 ? 0 : 1) + ' ' + n2(pn[0]) + ' ' + n2(pn[1]) + ' Z" class="fig-gonio-normal"/>';

    /* Cung góc đo được */
    if (val !== null) {
      var pv = P(val), lg = val > 180 ? 1 : 0;
      b += '<path d="M' + cx + ' ' + cy + ' L' + (cx + L * 0.62) + ' ' + cy + ' A' + (L * 0.62) + ' ' + (L * 0.62) +
        ' 0 ' + lg + ' ' + (dir < 0 ? 0 : 1) + ' ' + n2(cx + Math.cos(val * Math.PI / 180 * dir) * L * 0.62) + ' ' +
        n2(cy + Math.sin(val * Math.PI / 180 * dir) * L * 0.62) + ' Z" class="fig-gonio-arc"/>';
    }

    /* Cành cố định và cành di động */
    b += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + L) + '" y2="' + cy + '" class="fig-gonio-fixed"/>';
    if (val !== null) {
      var pm = P(val);
      b += '<line x1="' + cx + '" y1="' + cy + '" x2="' + n2(pm[0]) + '" y2="' + n2(pm[1]) + '" class="fig-gonio-move"/>';
      b += '<circle cx="' + n2(pm[0]) + '" cy="' + n2(pm[1]) + '" r="5" class="fig-gonio-tip"/>';
    }
    b += '<circle cx="' + cx + '" cy="' + cy + '" r="7" class="fig-gonio-pivot"/>';

    /* Nhãn */
    b += '<text x="' + (W - 8) + '" y="24" class="fig-val" text-anchor="end">' +
      (val === null ? '—' : val + '°') + '</text>';
    b += '<text x="' + (W - 8) + '" y="42" class="fig-ax" text-anchor="end">bình thường ' + (o.normalText || ('0–' + normal + '°')) + '</text>';
    if (o.label) b += '<text x="8" y="18" class="fig-lb">' + esc(o.label) + '</text>';
    if (val !== null) {
      var pctv = Math.round(Math.min(100, val / normal * 100));
      b += '<text x="' + (W - 8) + '" y="60" class="fig-ax" text-anchor="end">đạt ' + pctv + '% tầm bình thường</text>';
    }
    return svg('0 0 ' + W + ' ' + H, b, 'fig-gonio');
  }

  /* ---------------------------------------------------------------
   * Bậc thang sức cơ MRC 0–5
   * ------------------------------------------------------------- */
  var MRC_TXT = ['Không co cơ', 'Co cơ, không cử động', 'Hết tầm, bỏ trọng lực', 'Thắng trọng lực', 'Kháng lực vừa', 'Bình thường'];
  function mrc(value) {
    var v = (value === '' || value === null || value === undefined) ? null : Number(value);
    var W = 420, H = 114, b = '', bw = 56, gap = 12, x0 = 14, base = 72;
    for (var i = 0; i <= 5; i++) {
      var hh = 12 + i * 9;
      var x = x0 + i * (bw + gap);
      var on = (v !== null && Math.round(v) === i);
      b += '<rect x="' + x + '" y="' + (base - hh) + '" width="' + bw + '" height="' + hh + '" rx="4" class="fig-step' + (on ? ' on' : '') + '"/>';
      b += '<text x="' + (x + bw / 2) + '" y="' + (base + 15) + '" class="fig-ax' + (on ? ' on' : '') + '" text-anchor="middle">' + i + '</text>';
      if (on) b += '<text x="' + (x + bw / 2) + '" y="' + (base - hh - 6) + '" class="fig-val" text-anchor="middle">' + esc(MRC_TXT[i]) + '</text>';
    }
    b += '<text x="' + x0 + '" y="' + (base + 30) + '" class="fig-ax">Bậc sức cơ theo thang MRC (0 = liệt hoàn toàn → 5 = bình thường)</text>';
    return svg('0 0 ' + W + ' ' + H, b, 'fig-mrc');
  }

  /* ---------------------------------------------------------------
   * Mức tăng trương lực cơ (Ashworth sửa đổi)
   * ------------------------------------------------------------- */
  var ASH = [
    { v: 0, l: '0', t: 'Không tăng' },
    { v: 1, l: '1', t: 'Cản nhẹ cuối tầm' },
    { v: 1.5, l: '1+', t: 'Cản <50% tầm' },
    { v: 2, l: '2', t: 'Cản phần lớn tầm' },
    { v: 3, l: '3', t: 'Vận động thụ động khó' },
    { v: 4, l: '4', t: 'Cứng khớp' }
  ];
  function ashworth(value) {
    var v = (value === '' || value === null || value === undefined) ? null : Number(value);
    var W = 440, H = 108, b = '', x0 = 14, cw = 68, gap = 6, top = 18, hgt = 46;
    ASH.forEach(function (s, i) {
      var x = x0 + i * (cw + gap);
      var on = (v !== null && Number(v) === s.v);
      b += '<rect x="' + x + '" y="' + top + '" width="' + cw + '" height="' + hgt + '" rx="6" class="fig-step' + (on ? ' on' : '') + '"/>';
      /* Đường biểu diễn sức cản tăng dần */
      var amp = 3 + i * 5;
      var d = 'M' + (x + 8) + ' ' + (top + hgt - 10);
      for (var k = 1; k <= 8; k++) {
        var px = x + 8 + k * (cw - 16) / 8;
        var py = top + hgt - 10 - (k >= 8 - Math.min(7, i + 1) ? amp : 2);
        d += ' L' + n2(px) + ' ' + n2(py);
      }
      b += '<path d="' + d + '" class="fig-line' + (on ? ' on' : '') + '"/>';
      b += '<text x="' + (x + cw / 2) + '" y="' + (top + hgt + 16) + '" class="fig-ax' + (on ? ' on' : '') + '" text-anchor="middle">' + s.l + '</text>';
      if (on) b += '<text x="' + (x + cw / 2) + '" y="' + (top - 5) + '" class="fig-val" text-anchor="middle">' + esc(s.t) + '</text>';
    });
    b += '<text x="' + x0 + '" y="' + (H - 6) + '" class="fig-ax">Sức cản khi vận động thụ động nhanh — mức tăng dần từ trái sang phải</text>';
    return svg('0 0 ' + W + ' ' + H, b, 'fig-ash');
  }

  /* ---------------------------------------------------------------
   * Thang mặt biểu cảm đau 0–10
   * ------------------------------------------------------------- */
  function faces(value) {
    var v = (value === '' || value === null || value === undefined) ? null : Number(value);
    var W = 520, H = 108, b = '', r = 26, y = 40;
    var cols = ['#0f9b6c', '#7cb518', '#d6c700', '#e08700', '#e2662c', '#e0344b'];
    for (var i = 0; i < 6; i++) {
      var score = i * 2;
      var cx = 40 + i * 88;
      var on = (v !== null && Math.round(v / 2) === i);
      b += '<circle cx="' + cx + '" cy="' + y + '" r="' + r + '" fill="' + cols[i] + '" opacity="' + (on ? 1 : .32) + '"/>';
      if (on) b += '<circle cx="' + cx + '" cy="' + y + '" r="' + (r + 5) + '" class="fig-face-ring"/>';
      /* mắt */
      b += '<circle cx="' + (cx - 9) + '" cy="' + (y - 7) + '" r="3" fill="#fff"/>';
      b += '<circle cx="' + (cx + 9) + '" cy="' + (y - 7) + '" r="3" fill="#fff"/>';
      /* miệng: cong xuống dần khi đau tăng */
      var k = (i - 2.5) * 4.2;            /* +cười … −mếu */
      b += '<path d="M' + (cx - 12) + ' ' + (y + 9) + ' Q' + cx + ' ' + n2(y + 9 - k * 1.6) + ' ' + (cx + 12) + ' ' + (y + 9) + '" ' +
        'fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>';
      b += '<text x="' + cx + '" y="' + (y + r + 18) + '" class="fig-ax' + (on ? ' on' : '') + '" text-anchor="middle">' + score + '</text>';
    }
    b += '<text x="14" y="' + (H - 6) + '" class="fig-ax">0 = không đau</text>';
    b += '<text x="' + (W - 14) + '" y="' + (H - 6) + '" class="fig-ax" text-anchor="end">10 = đau không chịu nổi</text>';
    return svg('0 0 ' + W + ' ' + H, b, 'fig-faces');
  }

  /* ---------------------------------------------------------------
   * Hình người dạng nét (dùng cho sơ đồ cơ thể và dải mức độ)
   * ------------------------------------------------------------- */
  function personShape(x, y, s, cls) {
    /* s = hệ số tỉ lệ; hình cao ~ 100*s */
    function X(a) { return n2(x + a * s); }
    function Y(a) { return n2(y + a * s); }
    return '<g class="' + (cls || 'fig-person') + '">' +
      '<circle cx="' + X(0) + '" cy="' + Y(9) + '" r="' + n2(8 * s) + '"/>' +
      '<line x1="' + X(0) + '" y1="' + Y(17) + '" x2="' + X(0) + '" y2="' + Y(55) + '"/>' +
      '<line x1="' + X(0) + '" y1="' + Y(24) + '" x2="' + X(-15) + '" y2="' + Y(42) + '"/>' +
      '<line x1="' + X(0) + '" y1="' + Y(24) + '" x2="' + X(15) + '" y2="' + Y(42) + '"/>' +
      '<line x1="' + X(0) + '" y1="' + Y(55) + '" x2="' + X(-12) + '" y2="' + Y(88) + '"/>' +
      '<line x1="' + X(0) + '" y1="' + Y(55) + '" x2="' + X(12) + '" y2="' + Y(88) + '"/>' +
      '</g>';
  }

  /* ---------------------------------------------------------------
   * Sơ đồ cơ thể trước / sau — bấm chọn vùng đau
   * ------------------------------------------------------------- */
  var BODY_FRONT = [
    ['dau', 'Đầu – mặt', 96, 14, 34, 30], ['co', 'Cổ', 103, 46, 20, 14],
    ['vaiP', 'Vai (P)', 64, 60, 32, 22], ['vaiT', 'Vai (T)', 130, 60, 32, 22],
    ['nguc', 'Ngực', 96, 62, 34, 40], ['bung', 'Bụng', 96, 104, 34, 40],
    ['tayP', 'Cánh tay (P)', 56, 84, 26, 40], ['tayT', 'Cánh tay (T)', 144, 84, 26, 40],
    ['khuyuP', 'Khuỷu (P)', 52, 126, 26, 18], ['khuyuT', 'Khuỷu (T)', 148, 126, 26, 18],
    ['ctayP', 'Cẳng – bàn tay (P)', 46, 146, 28, 48], ['ctayT', 'Cẳng – bàn tay (T)', 152, 146, 28, 48],
    ['hangP', 'Háng (P)', 80, 146, 28, 24], ['hangT', 'Háng (T)', 118, 146, 28, 24],
    ['duiP', 'Đùi (P)', 82, 172, 28, 48], ['duiT', 'Đùi (T)', 116, 172, 28, 48],
    ['goiP', 'Gối (P)', 82, 222, 28, 20], ['goiT', 'Gối (T)', 116, 222, 28, 20],
    ['cchanP', 'Cẳng chân (P)', 82, 244, 28, 44], ['cchanT', 'Cẳng chân (T)', 116, 244, 28, 44],
    ['bchanP', 'Cổ – bàn chân (P)', 82, 290, 28, 22], ['bchanT', 'Cổ – bàn chân (T)', 116, 290, 28, 22]
  ];
  var BODY_BACK = [
    ['gay', 'Gáy', 103, 40, 20, 20], ['luongtren', 'Lưng trên', 96, 62, 36, 42],
    ['thatlung', 'Thắt lưng', 96, 106, 36, 32], ['mongP', 'Mông (P)', 80, 140, 28, 30],
    ['mongT', 'Mông (T)', 118, 140, 28, 30], ['sduiP', 'Mặt sau đùi (P)', 82, 172, 28, 48],
    ['sduiT', 'Mặt sau đùi (T)', 116, 172, 28, 48], ['khoeoP', 'Khoeo (P)', 82, 222, 28, 20],
    ['khoeoT', 'Khoeo (T)', 116, 222, 28, 20], ['bapP', 'Bắp chân (P)', 82, 244, 28, 44],
    ['bapT', 'Bắp chân (T)', 116, 244, 28, 44], ['gotP', 'Gót (P)', 82, 290, 28, 22],
    ['gotT', 'Gót (T)', 116, 290, 28, 22]
  ];

  function silhouette(ox) {
    /* Bóng người đơn giản, dùng làm nền cho các vùng bấm chọn */
    function x(a) { return n2(ox + a); }
    return '<g class="fig-body-fill">' +
      '<ellipse cx="' + x(113) + '" cy="30" rx="19" ry="23"/>' +
      '<rect x="' + x(104) + '" y="48" width="18" height="16" rx="6"/>' +
      '<path d="M' + x(80) + ' 66 Q' + x(113) + ' 56 ' + x(146) + ' 66 L' + x(150) + ' 140 Q' + x(113) + ' 152 ' + x(76) + ' 140 Z"/>' +
      '<path d="M' + x(80) + ' 66 L' + x(58) + ' 78 L' + x(48) + ' 190 L' + x(66) + ' 192 L' + x(76) + ' 96 Z"/>' +
      '<path d="M' + x(146) + ' 66 L' + x(168) + ' 78 L' + x(178) + ' 190 L' + x(160) + ' 192 L' + x(150) + ' 96 Z"/>' +
      '<path d="M' + x(80) + ' 140 L' + x(78) + ' 232 L' + x(84) + ' 312 L' + x(104) + ' 312 L' + x(108) + ' 232 L' + x(110) + ' 146 Z"/>' +
      '<path d="M' + x(146) + ' 140 L' + x(148) + ' 232 L' + x(142) + ' 312 L' + x(122) + ' 312 L' + x(118) + ' 232 L' + x(116) + ' 146 Z"/>' +
      '</g>';
  }

  function bodyMap(selected, idPrefix) {
    var sel = {};
    String(selected || '').split(';').forEach(function (t) { t = t.trim(); if (t) sel[t] = true; });
    var W = 470, H = 350, b = '';
    b += silhouette(0) + silhouette(235);
    b += '<text x="113" y="340" class="fig-ax" text-anchor="middle">MẶT TRƯỚC</text>';
    b += '<text x="348" y="340" class="fig-ax" text-anchor="middle">MẶT SAU</text>';

    function zone(list, ox) {
      list.forEach(function (z) {
        var id = z[0], label = z[1], cx = z[2] + ox, cy = z[3], w = z[4], hh = z[5];
        var on = !!sel[label];
        b += '<rect class="fig-zone' + (on ? ' on' : '') + '" data-zone="' + esc(label) + '" ' +
          'x="' + n2(cx - w / 2) + '" y="' + cy + '" width="' + w + '" height="' + hh + '" rx="5">' +
          '<title>' + esc(label) + '</title></rect>';
      });
    }
    zone(BODY_FRONT, 0);
    zone(BODY_BACK, 235);
    return '<div class="fig-bodymap" data-bm="' + esc(idPrefix || '') + '">' +
      svg('0 0 ' + W + ' ' + H, b, 'fig-body') + '</div>';
  }

  /* ---------------------------------------------------------------
   * Sơ đồ điểm cảm giác chìa khóa ISNCSCI
   * ------------------------------------------------------------- */
  var DERM_FRONT = [
    ['C2', 113, 16, 'Ụ chẩm ngoài'], ['C3', 113, 50, 'Hố trên đòn'], ['C4', 96, 66, 'Đỉnh khớp cùng đòn'],
    ['C5', 62, 96, 'Mặt ngoài hố khuỷu'], ['C6', 52, 176, 'Ngón cái'], ['C7', 58, 190, 'Ngón giữa'],
    ['C8', 66, 200, 'Ngón út'], ['T1', 74, 100, 'Mặt trong hố khuỷu'], ['T2', 84, 74, 'Đỉnh hố nách'],
    ['T4', 96, 92, 'Đường núm vú'], ['T6', 108, 108, 'Mũi ức'], ['T8', 108, 122, 'Giữa T6–T10'],
    ['T10', 113, 134, 'Rốn'], ['T12', 100, 148, 'Giữa dây chằng bẹn'],
    ['L2', 92, 178, 'Giữa mặt trước đùi'], ['L3', 88, 226, 'Lồi cầu trong đùi'],
    ['L4', 86, 288, 'Mắt cá trong'], ['L5', 92, 306, 'Mu bàn chân, khoang 3'], ['S1', 140, 306, 'Gót ngoài']
  ];
  var DERM_BACK = [
    ['T11', 348, 126, 'Giữa T10–T12'], ['L1', 336, 152, 'Nửa trên mông'],
    ['S2', 320, 232, 'Hố khoeo'], ['S3', 348, 152, 'Ụ ngồi'], ['S4-5', 348, 168, 'Quanh hậu môn']
  ];
  function dermatome() {
    var W = 470, H = 350, b = silhouette(0) + silhouette(235);
    function marks(list) {
      list.forEach(function (d) {
        b += '<circle cx="' + d[1] + '" cy="' + d[2] + '" r="4.5" class="fig-derm-dot"><title>' +
          esc(d[0] + ' – ' + d[3]) + '</title></circle>';
        b += '<text x="' + (d[1] + 7) + '" y="' + (d[2] + 3.5) + '" class="fig-derm-lb">' + esc(d[0]) + '</text>';
      });
    }
    marks(DERM_FRONT); marks(DERM_BACK);
    b += '<text x="113" y="340" class="fig-ax" text-anchor="middle">MẶT TRƯỚC</text>';
    b += '<text x="348" y="340" class="fig-ax" text-anchor="middle">MẶT SAU</text>';
    return svg('0 0 ' + W + ' ' + H, b, 'fig-derm');
  }

  /* ---------------------------------------------------------------
   * Dải hình người minh họa mức độ (FAC, mRS)
   * ------------------------------------------------------------- */
  var LEVELS = {
    fac: [
      { v: 0, t: 'Không đi được', aid: 'two' }, { v: 1, t: 'Trợ giúp nhiều', aid: 'two' },
      { v: 2, t: 'Trợ giúp nhẹ', aid: 'one' }, { v: 3, t: 'Giám sát bằng lời', aid: 'watch' },
      { v: 4, t: 'Độc lập mặt phẳng', aid: 'stick' }, { v: 5, t: 'Độc lập mọi địa hình', aid: 'none' }
    ],
    mrs: [
      { v: 0, t: 'Không triệu chứng', aid: 'none' }, { v: 1, t: 'Không tàn tật đáng kể', aid: 'none' },
      { v: 2, t: 'Tàn tật nhẹ', aid: 'none' }, { v: 3, t: 'Cần trợ giúp, tự đi', aid: 'stick' },
      { v: 4, t: 'Cần người dìu', aid: 'one' }, { v: 5, t: 'Nằm liệt giường', aid: 'bed' },
      { v: 6, t: 'Tử vong', aid: 'cross' }
    ]
  };
  function levelStrip(kind, value) {
    var list = LEVELS[kind];
    if (!list) return '';
    var v = (value === '' || value === null || value === undefined) ? null : Number(value);
    var cw = 92, W = list.length * cw + 8, H = 138, b = '';
    list.forEach(function (s, i) {
      var x = 4 + i * cw, on = (v !== null && Number(v) === s.v);
      b += '<rect x="' + x + '" y="6" width="' + (cw - 6) + '" height="' + (H - 30) + '" rx="9" class="fig-step' + (on ? ' on' : '') + '"/>';
      var px = x + (cw - 6) / 2;
      /* Người bệnh */
      b += personShape(px, 22, 0.62, 'fig-person' + (on ? ' on' : ''));
      /* Bối cảnh trợ giúp */
      if (s.aid === 'two' || s.aid === 'one') {
        b += personShape(px - 21, 30, 0.44, 'fig-helper');
        if (s.aid === 'two') b += personShape(px + 21, 30, 0.44, 'fig-helper');
      } else if (s.aid === 'stick') {
        b += '<line x1="' + (px + 15) + '" y1="' + 38 + '" x2="' + (px + 17) + '" y2="' + 80 + '" class="fig-aid"/>';
      } else if (s.aid === 'watch') {
        b += personShape(px + 22, 34, 0.4, 'fig-helper faded');
      } else if (s.aid === 'bed') {
        b += '<rect x="' + (px - 26) + '" y="70" width="52" height="9" rx="3" class="fig-aid-fill"/>';
      } else if (s.aid === 'cross') {
        b += '<line x1="' + (px - 13) + '" y1="30" x2="' + (px + 13) + '" y2="66" class="fig-aid"/>' +
          '<line x1="' + (px + 13) + '" y1="30" x2="' + (px - 13) + '" y2="66" class="fig-aid"/>';
      }
      b += '<text x="' + px + '" y="' + (H - 32) + '" class="fig-lvl' + (on ? ' on' : '') + '" text-anchor="middle">' + s.v + '</text>';
      b += '<text x="' + px + '" y="' + (H - 8) + '" class="fig-ax' + (on ? ' on' : '') + '" text-anchor="middle">' +
        esc(s.t.length > 16 ? s.t.slice(0, 15) + '…' : s.t) + '<title>' + esc(s.t) + '</title></text>';
    });
    return svg('0 0 ' + W + ' ' + H, b, 'fig-levels');
  }

  /* ---------------------------------------------------------------
   * Bàn tay — 6 bậc thang HMS
   * ------------------------------------------------------------- */
  /* cfg.digits = [trỏ, giữa, nhẫn, út] với 1 = duỗi, 0 = gấp
     cfg.thumb  = 'rest' | 'flex' | 'oppose1' | 'opposeAll' */
  function handShape(x, y, s, cfg, on) {
    function X(a) { return n2(x + a * s); }
    function Y(a) { return n2(y + a * s); }
    var cls = 'fig-hand' + (on ? ' on' : '') + (cfg.faded ? ' faded' : '');
    var b = '<g class="' + cls + '">';

    /* Gan bàn tay */
    b += '<rect x="' + X(-15) + '" y="' + Y(0) + '" width="' + n2(30 * s) + '" height="' + n2(34 * s) +
      '" rx="' + n2(9 * s) + '" class="fig-hand-palm"/>';
    /* Cổ tay */
    b += '<line x1="' + X(-7) + '" y1="' + Y(34) + '" x2="' + X(-7) + '" y2="' + Y(44) + '"/>';
    b += '<line x1="' + X(7) + '" y1="' + Y(34) + '" x2="' + X(7) + '" y2="' + Y(44) + '"/>';

    /* Bốn ngón dài: trỏ – giữa – nhẫn – út */
    var offs = [-10.5, -3.5, 3.5, 10.5];
    var lens = [26, 28, 26, 21];
    var tips = [];
    offs.forEach(function (o, i) {
      var ext = cfg.digits[i] === 1;
      var L = ext ? lens[i] : 10;
      var ty = -L;
      b += '<line x1="' + X(o) + '" y1="' + Y(1) + '" x2="' + X(o) + '" y2="' + Y(ty) + '"/>';
      if (!ext) {
        /* Ngón gấp: vẽ móc cong về phía gan tay */
        b += '<path d="M' + X(o) + ' ' + Y(ty) + ' q' + n2(5 * s) + ' ' + n2(-1 * s) + ' ' +
          n2(5 * s) + ' ' + n2(6 * s) + '" fill="none"/>';
      }
      tips.push([X(o), Y(ty)]);
    });

    /* Ngón cái */
    var th = cfg.thumb;
    if (th === 'flex') {
      b += '<line x1="' + X(-15) + '" y1="' + Y(10) + '" x2="' + X(-6) + '" y2="' + Y(4) + '"/>';
    } else if (th === 'oppose1' || th === 'opposeAll') {
      var t = tips[0];
      b += '<path d="M' + X(-15) + ' ' + Y(12) + ' Q' + X(-20) + ' ' + Y(-6) + ' ' + t[0] + ' ' + n2(Number(t[1]) + 2 * s) +
        '" fill="none"/>';
      b += '<circle cx="' + t[0] + '" cy="' + n2(Number(t[1]) + 2 * s) + '" r="' + n2(3 * s) + '" class="fig-hand-touch"/>';
      if (th === 'opposeAll') {
        for (var k = 1; k < tips.length; k++) {
          b += '<circle cx="' + tips[k][0] + '" cy="' + n2(Number(tips[k][1]) + 2 * s) + '" r="' + n2(2.6 * s) + '" class="fig-hand-touch"/>';
        }
        b += '<path d="M' + t[0] + ' ' + n2(Number(t[1]) + 2 * s) + ' L' + tips[3][0] + ' ' + n2(Number(tips[3][1]) + 2 * s) +
          '" class="fig-hand-link" fill="none"/>';
      }
    } else {
      b += '<line x1="' + X(-15) + '" y1="' + Y(12) + '" x2="' + X(-26) + '" y2="' + Y(2) + '"/>';
    }
    b += '</g>';
    return b;
  }

  var HMS = [
    { v: 1, t: 'Không cử động chủ động', digits: [0, 0, 0, 0], thumb: 'rest', faded: true },
    { v: 2, t: 'Chỉ gấp đồng vận', digits: [0, 0, 0, 0], thumb: 'flex', arrow: 'down' },
    { v: 3, t: 'Gấp và duỗi đồng vận', digits: [1, 1, 1, 1], thumb: 'rest', arrow: 'both' },
    { v: 4, t: 'Duỗi riêng ngón trỏ', digits: [1, 0, 0, 0], thumb: 'flex' },
    { v: 5, t: 'Đối chiếu cái – trỏ', digits: [1, 0, 0, 0], thumb: 'oppose1' },
    { v: 6, t: 'Đối chiếu đủ 5 ngón', digits: [1, 1, 1, 1], thumb: 'opposeAll' }
  ];
  function hand(value) {
    var v = (value === '' || value === null || value === undefined) ? null : Number(value);
    var cw = 112, W = HMS.length * cw + 8, H = 178, b = '';
    HMS.forEach(function (s, i) {
      var x = 4 + i * cw, on = (v !== null && Number(v) === s.v);
      b += '<rect x="' + x + '" y="6" width="' + (cw - 8) + '" height="' + (H - 34) + '" rx="10" class="fig-step' + (on ? ' on' : '') + '"/>';
      var px = x + (cw - 8) / 2;
      b += handShape(px, 74, 1.05, s, on);
      /* Mũi tên chỉ hướng cử động */
      if (s.arrow === 'down') {
        b += '<path d="M' + (px + 36) + ' 34 v22 m-4 -6 l4 6 4 -6" class="fig-aid" fill="none"/>';
      } else if (s.arrow === 'both') {
        b += '<path d="M' + (px + 36) + ' 32 v28 m-4 -24 l4 -4 4 4 m-8 20 l4 4 4 -4" class="fig-aid" fill="none"/>';
      }
      b += '<text x="' + px + '" y="' + (H - 30) + '" class="fig-lvl' + (on ? ' on' : '') + '" text-anchor="middle">Bậc ' + s.v + '</text>';
      b += '<text x="' + px + '" y="' + (H - 10) + '" class="fig-ax' + (on ? ' on' : '') + '" text-anchor="middle">' +
        esc(s.t) + '</text>';
    });
    return svg('0 0 ' + W + ' ' + H, b, 'fig-hand-strip');
  }

  g.PHCN = g.PHCN || {};
  g.PHCN.fig = {
    bands: bands, bandRuler: bandRuler, radar: radar, radarMulti: radarMulti,
    sparkline: sparkline, goniometer: goniometer,
    mrc: mrc, ashworth: ashworth, faces: faces, bodyMap: bodyMap,
    dermatome: dermatome, levelStrip: levelStrip, hand: hand
  };

})(window);
