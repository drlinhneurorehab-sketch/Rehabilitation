/* =========================================================================
 * PHCN-METRICS · app.js — Giao diện, định tuyến, biểu mẫu, biểu đồ
 * ========================================================================= */
(function (g) {
  'use strict';

  var ST = g.PHCN.store, REG = g.PHCN.reg.REGISTRY, ORDER = g.PHCN.reg.ORDER,
      GROUPS = g.PHCN.GROUPS, DOMAINS = g.PHCN.DOMAINS;

  /* ---------------- Tiện ích ---------------- */
  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function groupById(id) { for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].id === id) return GROUPS[i]; return null; }
  /* Nhóm bệnh lý thực để gán cho người bệnh (loại các nhóm chỉ dùng làm bộ công cụ, ví dụ Tâm lý) */
  function realGroups() { return GROUPS.filter(function (x) { return !x.toolOnly; }); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function fmtDate(d) {
    if (!d) return '—';
    var p = String(d).slice(0, 10).split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : d;
  }
  function daysBetween(a, b) {
    if (!a || !b) return null;
    var d = (new Date(b) - new Date(a)) / 86400000;
    return isNaN(d) ? null : Math.round(d);
  }
  function toast(msg, type) {
    var t = document.createElement('div');
    t.className = 'toast ' + (type || 'ok');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 10);
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }, 3200);
  }
  function pct(v, max) { if (v === null || !max) return 0; return Math.max(0, Math.min(100, v / max * 100)); }

  /* Đặt tiêu đề và dòng phụ trên thanh header */
  function setHeader(title, sub) {
    var t = document.getElementById('hdr-title'), p = document.getElementById('hdr-sub');
    if (t) t.textContent = title;
    if (p) p.innerHTML = sub || '';
  }
  /* Mở / đóng sidebar trên màn hình nhỏ */
  function closeSidebar() {
    var sb = document.getElementById('sidebar'), bd = document.getElementById('sb-backdrop');
    if (sb) sb.className = 'sidebar';
    if (bd) bd.className = 'sb-backdrop';
  }

  /* Thang có "điểm cao = xấu"? Dùng để tô màu tiến triển */
  function isReverse(sc) { return !!sc.reverse; }

  /* ---------------- Định tuyến ---------------- */
  var routes = {};
  function route(path, fn) { routes[path] = fn; }
  function parseHash() {
    var h = location.hash.replace(/^#\/?/, '') || 'dashboard';
    var qi = h.indexOf('?');
    var query = {};
    if (qi >= 0) {
      h.slice(qi + 1).split('&').forEach(function (kv) {
        var p = kv.split('='); query[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
      });
      h = h.slice(0, qi);
    }
    return { parts: h.split('/').filter(Boolean), query: query };
  }
  function navigate(h) { location.hash = h; }
  function render() {
    var r = parseHash();
    var key = r.parts[0] || 'dashboard';
    var fn = routes[key] || routes.dashboard;
    var view = $('#view');
    view.innerHTML = '';
    window.scrollTo(0, 0);
    fn(view, r.parts.slice(1), r.query);
    $$('.nav-item').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-nav') === key);
    });
    closeSidebar();
    var av = document.getElementById('avatar');
    if (av) {
      var who = (ST.load().settings.researcher || '').trim();
      av.textContent = who ? who.split(/\s+/).slice(-2).map(function (w) { return w.charAt(0); }).join('').toUpperCase() : 'BS';
      av.setAttribute('title', who ? 'Người đánh giá: ' + who : 'Chưa ghi tên người đánh giá');
    }
  }

  /* =======================================================================
   *  BIỂU ĐỒ SVG
   * ===================================================================== */
  function lineChart(series, opts) {
    opts = opts || {};
    var W = opts.width || 640, H = opts.height || 220, P = { t: 18, r: 16, b: 34, l: 40 };
    var labels = opts.labels || [];
    var maxY = 100, minY = 0;
    var pts = [];
    var n = Math.max.apply(null, series.map(function (s) { return s.values.length; }).concat([1]));
    if (n < 2) { W = Math.max(260, W); }
    var iw = W - P.l - P.r, ih = H - P.t - P.b;
    function X(i) { return P.l + (n === 1 ? iw / 2 : iw * i / (n - 1)); }
    function Y(v) { return P.t + ih - (v - minY) / (maxY - minY) * ih; }

    var svg = ['<svg viewBox="0 0 ' + W + ' ' + H + '" class="chart" preserveAspectRatio="xMidYMid meet" role="img">'];
    [0, 25, 50, 75, 100].forEach(function (gy) {
      svg.push('<line x1="' + P.l + '" y1="' + Y(gy) + '" x2="' + (W - P.r) + '" y2="' + Y(gy) + '" class="grid"/>');
      svg.push('<text x="' + (P.l - 8) + '" y="' + (Y(gy) + 4) + '" class="axis" text-anchor="end">' + gy + '</text>');
    });
    labels.forEach(function (lb, i) {
      svg.push('<text x="' + X(i) + '" y="' + (H - 12) + '" class="axis" text-anchor="middle">' + esc(lb) + '</text>');
    });
    series.forEach(function (s) {
      var d = '', dots = '', open = false, firstX = null, lastX = null;
      s.values.forEach(function (v, i) {
        if (v === null || v === undefined) { open = false; return; }
        d += (open ? ' L' : (d ? ' M' : 'M')) + X(i) + ' ' + Y(v);
        open = true;
        if (firstX === null) firstX = X(i);
        lastX = X(i);
        dots += '<circle cx="' + X(i) + '" cy="' + Y(v) + '" r="4.5" fill="#fff" stroke="' + s.color +
          '" stroke-width="3"><title>' + esc(s.name) + ': ' +
          (s.raw && s.raw[i] !== undefined ? s.raw[i] : v) + '</title></circle>';
      });
      if (d && s.fill && firstX !== null) {
        svg.push('<path d="' + d + ' L' + lastX + ' ' + Y(minY) + ' L' + firstX + ' ' + Y(minY) +
          ' Z" fill="' + s.color + '" opacity=".12" stroke="none"/>');
      }
      if (d) {
        svg.push('<path d="' + d + '" fill="none" stroke="' + s.color +
          '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"' +
          (s.dash ? ' stroke-dasharray="7 6"' : '') + '/>');
      }
      svg.push(dots);
    });
    svg.push('</svg>');
    return svg.join('');
  }

  function barRow(label, value, max, cls) {
    return '<div class="bar-row"><div class="bar-label">' + esc(label) + '</div>' +
      '<div class="bar-track"><div class="bar-fill ' + (cls || '') + '" style="width:' + pct(value, max) + '%"></div></div>' +
      '<div class="bar-val">' + (value === null ? '—' : value) + (max ? '<span>/' + max + '</span>' : '') + '</div></div>';
  }

  /* =======================================================================
   *  TRANG: BẢNG ĐIỀU KHIỂN
   * ===================================================================== */
  /* Điểm chức năng tổng hợp 0–100 của một lượt đánh giá
     (trung bình các thang có tổng điểm, chuẩn hóa về 100 = chức năng tốt nhất) */
  function compositeScore(a) {
    var sum = 0, n = 0;
    (a.scaleIds || []).forEach(function (sid) {
      var sc = REG[sid];
      if (!sc || sc.noTotal || !sc.max) return;
      var r = ST.score(sc, (a.values || {})[sid] || {});
      if (r.total === null) return;
      var lo = sc.min || 0;
      var q = (r.total - lo) / (sc.max - lo) * 100;
      q = Math.max(0, Math.min(100, q));
      if (sc.reverse) q = 100 - q;
      sum += q; n++;
    });
    return n ? Math.round(sum / n) : null;
  }

  /* Điểm đầu vào / đầu ra của một bệnh nhân */
  function inOut(pid) {
    var as = ST.assessmentsOf(pid);
    if (!as.length) return { first: null, last: null, n: 0 };
    var f = compositeScore(as[0]);
    var l = as.length > 1 ? compositeScore(as[as.length - 1]) : null;
    return { first: f, last: l, n: as.length };
  }

  var DOMAIN_AXIS = [
    { id: 'body', label: 'Chức năng cơ thể' },
    { id: 'activity', label: 'Hoạt động' },
    { id: 'participation', label: 'Tham gia' },
    { id: 'psych', label: 'Tâm lý & giấc ngủ' },
    { id: 'global', label: 'Tổng thể' }
  ];
  /* Chuẩn hóa một kết quả về thang 0–100 (100 = chức năng tốt nhất) */
  function norm(sc, total) {
    if (total === null || total === undefined || !sc.max) return null;
    var lo = sc.min || 0;
    var q = (total - lo) / (sc.max - lo) * 100;
    q = Math.max(0, Math.min(100, q));
    return sc.reverse ? 100 - q : q;
  }
  /* rows = [{sc, r}] → các trục radar theo lĩnh vực */
  function domainAxes(rows) {
    var bag = {};
    rows.forEach(function (x) {
      if (x.sc.noTotal) return;
      var q = norm(x.sc, x.r.total);
      if (q === null) return;
      var key = (x.sc.home === 'psych') ? 'psych' : x.sc.domain;
      (bag[key] = bag[key] || []).push(q);
    });
    var out = [];
    DOMAIN_AXIS.forEach(function (d) {
      var v = bag[d.id];
      if (v && v.length) out.push({ label: d.label, value: avg(v) });
    });
    return out;
  }

  function avg(arr) {
    var v = arr.filter(function (x) { return x !== null && x !== undefined; });
    if (!v.length) return null;
    return Math.round(v.reduce(function (s, x) { return s + x; }, 0) / v.length);
  }

  function ico(name, size) { return '<span class="ico">' + g.PHCN.icon(name, size || 18) + '</span>'; }

  route('dashboard', function (view) {
    var dash = { group: '', kw: '', month: '' };
    setHeader('Theo dõi kết quả phục hồi chức năng',
      'Cập nhật: ' + fmtDate(today()) + ' · ' + ST.patients().length + ' người bệnh · ' +
      ST.assessments().length + ' lượt đánh giá · ' + ORDER.length + ' thang điểm');

    var months = {};
    ST.assessments().forEach(function (a) { if (a.date) months[String(a.date).slice(0, 7)] = true; });
    var monthList = Object.keys(months).sort().reverse();

    var html = '<section class="hero-wrap"><div class="hero-in">' +
      '<div class="hero-top"><div class="hero-tx">' +
      '<div class="eyebrow">' + ico('stethoscope', 15) + ' Clinical intelligence</div>' +
      '<h2>Đo lường tiến bộ, cá thể hóa phục hồi</h2>' +
      '<p class="lead">Tổng hợp đánh giá đầu vào – đầu ra theo từng mặt bệnh, giúp nhận diện hiệu quả can thiệp ' +
      'và tối ưu kế hoạch điều trị trên nền các thang điểm lượng hóa chuẩn.</p></div>' +
      '<div class="glass cycle-card" id="cycle-card"></div></div>' +

      '<div class="toolbar" style="margin-bottom:18px">' +
      '<div class="search-box">' + ico('search', 17) + '<input id="dash-kw" type="search" placeholder="Tìm mã BN, họ tên, chẩn đoán…"></div>' +
      '<div class="select-box">' + ico('calendar', 17) + '<select id="dash-month"><option value="">Tất cả thời gian</option>' +
      monthList.map(function (m) {
        var p = m.split('-');
        return '<option value="' + m + '">Tháng ' + p[1] + '/' + p[0] + '</option>';
      }).join('') + '</select></div>' +
      '<button class="btn" id="dash-export">' + ico('download', 17) + ' Xuất báo cáo</button>' +
      '<a class="btn" href="#/patients?new=1">' + ico('plus', 17) + ' Người bệnh mới</a>' +
      '</div>' +

      '<div id="dash-kpi" class="kpis"></div>' +
      '</div></section>';

    html += '<div class="res-row" id="dash-res"></div>';

    html += '<section style="margin-bottom:24px"><div class="panel-head" style="margin-bottom:16px">' +
      '<div><h3>Bản đồ nhóm bệnh lý</h3><p>Chọn nhóm bệnh để lọc toàn bộ số liệu bên trên theo mặt bệnh đó.</p></div>' +
      '<a class="link-more" href="#/library">Xem toàn bộ thư viện ' + ico('arrowUpRight', 15) + '</a></div>' +
      '<div id="dash-dz" class="dz-grid"></div></section>';

    html += '<div id="dash-progress"></div>';
    html += '<div id="dash-recent"></div>';

    html += '<section><div class="cta"><div>' +
      '<div class="eb">Bắt đầu quy trình lâm sàng</div>' +
      '<h3>Tạo đánh giá chức năng mới</h3>' +
      '<p>Chọn người bệnh, bộ thang điểm cốt lõi của nhóm bệnh lý sẽ tự nạp kèm toàn bộ trường chấm điểm; ' +
      'hệ thống tính tổng điểm, diễn giải mức độ và theo dõi tiến độ qua từng chu kỳ.</p></div>' +
      '<a class="btn" href="#/assess">' + ico('plus', 18) + ' Tạo phiếu đánh giá</a></div></section>';

    view.innerHTML = html;

    /* ---------- Lọc theo phạm vi ---------- */
    function scopePatients() {
      var kw = dash.kw.toLowerCase().trim();
      return ST.patients().filter(function (p) {
        if (dash.group && (p.groups || []).indexOf(dash.group) < 0) return false;
        if (kw && [p.code, p.name, p.dx, p.studyId].join(' ').toLowerCase().indexOf(kw) < 0) return false;
        if (dash.month) {
          var has = ST.assessmentsOf(p.id).some(function (a) { return String(a.date || '').slice(0, 7) === dash.month; });
          if (!has) return false;
        }
        return true;
      });
    }

    /* Người bệnh CẦN RÀ SOÁT khi có ít nhất một dấu hiệu cảnh báo ở lượt gần nhất:
       (1) điểm chức năng tổng hợp GIẢM so với lượt đầu;
       (2) từ 2 thang trở lên rơi vào mức NẶNG;
       (3) PHQ-9 câu 9 > 0 — có ý tưởng tự làm hại bản thân;
       (4) CAM dương tính — nghi ngờ sảng. */
    var REVIEW_RULE = 'Điểm chức năng giảm so với đầu vào, hoặc ≥2 thang ở mức nặng, ' +
      'hoặc PHQ-9 câu 9 > 0 (ý tưởng tự sát), hoặc CAM dương tính (sảng).';

    function reviewFlags(pid) {
      var as = ST.assessmentsOf(pid), flags = [];
      if (!as.length) return flags;
      var last = as[as.length - 1];
      var res = ST.scoreAssessment(last);
      var vals = last.values || {};

      var io = inOut(pid);
      if (io.first !== null && io.last !== null && io.last < io.first) flags.push('Điểm chức năng giảm so với đầu vào');

      var severe = [];
      Object.keys(res).forEach(function (sid) {
        if (res[sid].interp && res[sid].interp.cls === 'severe' && REG[sid]) severe.push(REG[sid].short);
      });
      if (severe.length >= 2) flags.push('Nặng ở ' + severe.length + ' thang: ' + severe.slice(0, 4).join(', '));

      var q9 = vals.phq9 ? vals.phq9['main.q9'] : null;
      if (q9 !== undefined && q9 !== null && q9 !== '' && Number(q9) > 0) flags.push('PHQ-9 câu 9 > 0 — ý tưởng tự làm hại bản thân');

      if (res.cam && res.cam.total === 1) flags.push('CAM dương tính — nghi ngờ sảng');
      return flags;
    }
    function needsReview(pid) { return reviewFlags(pid).length > 0; }

    function stats() {
      var ps = scopePatients();
      var ins = [], outs = [], deltas = [], done = 0, nAssess = 0, review = 0, goal = 0, newP = 0;
      var limit = new Date(); limit.setDate(limit.getDate() - 30);
      ps.forEach(function (p) {
        var io = inOut(p.id);
        nAssess += io.n;
        if (p.createdAt && new Date(p.createdAt) >= limit) newP++;
        if (io.first !== null) ins.push(io.first);
        if (io.last !== null) {
          outs.push(io.last); done++;
          if (io.first !== null) {
            deltas.push(io.last - io.first);
            if (io.last - io.first >= 10) goal++;
          }
        }
        if (needsReview(p.id)) review++;
      });
      return {
        ps: ps, n: ps.length, ins: ins, outs: outs, deltas: deltas, done: done,
        nAssess: nAssess, review: review, goal: goal, newP: newP,
        mIn: avg(ins), mOut: avg(outs), mD: avg(deltas)
      };
    }

    function kpiCard(label, value, unit, iconName, cls, footCls, foot) {
      return '<article class="kpi"><div class="kpi-top">' +
        '<div><p class="kpi-lb">' + esc(label) + '</p>' +
        '<p class="kpi-val">' + value + (unit ? '<span>' + unit + '</span>' : '') + '</p></div>' +
        '<span class="kpi-ic ' + cls + '">' + g.PHCN.icon(iconName, 20) + '</span></div>' +
        '<p class="kpi-foot ' + footCls + '">' + foot + '</p></article>';
    }

    function drawKpi() {
      var s = stats();
      var G = dash.group ? groupById(dash.group) : null;
      var donePct = s.n ? Math.round(s.done / s.n * 100) : 0;
      var revPct = s.n ? Math.round(s.review / s.n * 100) : 0;

      $('#cycle-card').innerHTML =
        '<p class="lb">Phạm vi báo cáo</p>' +
        '<b>' + esc(G ? G.name : 'Toàn bộ mặt bệnh') + '</b>' +
        '<div class="cycle-bar"><i style="width:' + donePct + '%"></i></div>' +
        '<p class="pct">' + donePct + '% hồ sơ đã có đủ đánh giá đầu vào – đầu ra</p>';

      $('#dash-kpi').innerHTML =
        kpiCard('Người bệnh đang quản lý', s.n, '', 'users', 'c1', s.newP ? 'up' : '',
          (s.newP ? '↑ ' + s.newP + ' hồ sơ mới ' : 'Chưa có hồ sơ mới ') + '<span>trong 30 ngày qua</span>') +
        kpiCard('Hoàn thành đánh giá', donePct, '%', 'check', 'c2', 'up',
          s.done + '/' + s.n + ' <span>hồ sơ đủ đầu vào – đầu ra</span>') +
        kpiCard('Cải thiện chức năng TB', (s.mD === null ? '—' : (s.mD > 0 ? '+' : '') + s.mD), '', 'trending', 'c3', 'idc',
          'Điểm chuẩn hóa / 100 <span>· n = ' + s.deltas.length + '</span>') +
        kpiCard('Cần rà soát', s.review, '', 'target', 'c4', 'warn',
          revPct + '% <span title="' + esc(REVIEW_RULE) + '">người bệnh có dấu hiệu cảnh báo ⓘ</span>');
    }

    /* ---------- Xu hướng theo tháng ---------- */
    function drawTrend() {
      var s = stats();
      var byMonth = {};
      s.ps.forEach(function (p) {
        var as = ST.assessmentsOf(p.id);
        as.forEach(function (a, i) {
          var m = String(a.date || '').slice(0, 7);
          if (!m) return;
          var c = compositeScore(a);
          if (c === null) return;
          byMonth[m] = byMonth[m] || { first: [], later: [] };
          (i === 0 ? byMonth[m].first : byMonth[m].later).push(c);
        });
      });
      var ms = Object.keys(byMonth).sort().slice(-6);
      var labels = ms.map(function (m) { var p = m.split('-'); return 'T' + Number(p[1]) + '/' + p[0].slice(2); });
      var series = [
        { name: 'Điểm đầu ra trung bình', color: '#0f9b8e', fill: true,
          values: ms.map(function (m) { return avg(byMonth[m].later); }) },
        { name: 'Điểm đầu vào trung bình', color: '#64748b', dash: true,
          values: ms.map(function (m) { return avg(byMonth[m].first); }) }
      ];
      var hasData = ms.length >= 1 && series.some(function (x) {
        return x.values.some(function (v) { return v !== null; });
      });

      var goalPct = s.done ? Math.round(s.goal / s.done * 100) : 0;
      var onlyIn = s.n - s.done;

      $('#dash-res').innerHTML =
        '<article class="panel"><div class="panel-head"><div>' +
        '<h3>Xu hướng cải thiện chức năng</h3>' +
        '<p>Điểm chức năng tổng hợp trung bình theo tháng đánh giá (0–100, càng cao càng tốt)</p></div></div>' +
        (hasData
          ? '<div class="legend">' + series.map(function (x) {
              return '<span><i style="background:' + x.color + '"></i>' + esc(x.name) + '</span>';
            }).join('') + '</div>' + lineChart(series, { labels: labels, width: 720, height: 280 })
          : '<p class="empty">Chưa đủ dữ liệu để vẽ xu hướng. Cần ít nhất một lượt đánh giá có ngày tháng.</p>') +
        '</article>' +

        '<article class="panel-dark">' +
        '<p class="pd-eyebrow">Chỉ số lâm sàng nổi bật</p>' +
        '<h3>' + goalPct + '% người bệnh đạt mục tiêu điều trị</h3>' +
        '<p class="pd-note">Mục tiêu được định nghĩa là <b>tăng ≥10 điểm</b> chức năng tổng hợp giữa lượt đầu ' +
        'và lượt gần nhất. Tính trên ' + s.done + ' hồ sơ đã có đủ hai lần đo.</p>' +
        '<div class="pd-prog"><div class="row"><span>Tiến độ mục tiêu</span><b>' + goalPct + '%</b></div>' +
        '<div class="track"><i style="width:' + goalPct + '%"></i></div></div>' +
        '<div class="pd-tiles">' +
        '<div><b>' + s.done + '</b><span>Đủ 2 lần đo</span></div>' +
        '<div><b>' + onlyIn + '</b><span>Mới có đầu vào</span></div>' +
        '<div><b>' + s.review + '</b><span>Cần rà soát</span></div>' +
        '</div></article>';
    }

    /* ---------- Bản đồ nhóm bệnh ---------- */
    function drawDz() {
      var all = ST.patients(), byGroup = {};
      all.forEach(function (p) { (p.groups || []).forEach(function (gid) { byGroup[gid] = (byGroup[gid] || 0) + 1; }); });
      var h = '<button class="dz' + (dash.group === '' ? ' on' : '') + '" data-g="" style="--gc:#0f172a">' +
        '<span class="dz-ic">' + g.PHCN.icon('activity', 20) + '</span>' +
        '<b>Tất cả mặt bệnh</b><span class="tools">Toàn bộ hồ sơ đang quản lý</span>' +
        '<span class="cnt">' + all.length + ' hồ sơ</span></button>';
      realGroups().forEach(function (grp) {
        var core = ORDER.filter(function (id) { return REG[id].coreFor.indexOf(grp.id) >= 0; })
          .slice(0, 4).map(function (id) { return REG[id].short; }).join(' · ');
        h += '<button class="dz' + (dash.group === grp.id ? ' on' : '') + '" data-g="' + grp.id + '" style="--gc:' + grp.color + '">' +
          '<span class="dz-ic">' + g.PHCN.icon(g.PHCN.GROUP_ICON[grp.id], 20) + '</span>' +
          '<b>' + esc(grp.short) + '</b><span class="tools">' + esc(core || '—') + '</span>' +
          '<span class="cnt">' + (byGroup[grp.id] || 0) + ' hồ sơ</span></button>';
      });
      h += '<a class="dz add" href="#/library"><span class="dz-ic">' + g.PHCN.icon('book', 20) + '</span>' +
        '<b>Thư viện thang điểm</b><span class="tools">' + ORDER.length + ' công cụ lượng hóa, tra cứu và in phiếu trắng</span>' +
        '<span class="cnt" style="background:rgba(255,255,255,.12);color:#5eead4">Mở thư viện</span></a>';
      $('#dash-dz').innerHTML = h;
      $$('#dash-dz button.dz').forEach(function (t) {
        t.addEventListener('click', function () { dash.group = t.getAttribute('data-g'); drawAll(); });
      });
    }

    /* ---------- Diễn biến theo nhóm ---------- */
    function drawProgress() {
      var ps = scopePatients(), rows = [];
      var scope = dash.group ? [groupById(dash.group)] : realGroups();
      scope.forEach(function (grp) {
        var sub = ps.filter(function (p) { return (p.groups || []).indexOf(grp.id) >= 0; });
        if (!sub.length) return;
        var ins = [], outs = [];
        sub.forEach(function (p) { var io = inOut(p.id); if (io.first !== null) ins.push(io.first); if (io.last !== null) outs.push(io.last); });
        var a = avg(ins), b = avg(outs);
        if (a === null && b === null) return;
        rows.push({ name: grp.name, n: sub.length, a: a, b: b });
      });

      if (!rows.length) {
        $('#dash-progress').innerHTML = '<section class="panel" style="margin-bottom:24px">' +
          '<div class="panel-head"><h3>Diễn biến điểm chức năng theo nhóm bệnh</h3></div>' +
          '<p class="empty">Chưa có dữ liệu trong phạm vi đang chọn. ' +
          '<a href="#/patients?new=1">Thêm người bệnh</a> rồi tạo lượt đánh giá đầu tiên.</p></section>';
        return;
      }
      var h = '<section class="panel" style="margin-bottom:24px"><div class="panel-head"><div>' +
        '<h3>Diễn biến điểm chức năng theo nhóm bệnh</h3>' +
        '<p>Điểm chuẩn hóa 0–100; 100 = chức năng tốt nhất</p></div>' +
        '<a class="link-more" href="#/patients">Chi tiết ' + ico('arrowUpRight', 15) + '</a></div><div class="prog-list">';
      rows.forEach(function (r) {
        h += '<div class="prog"><div class="prog-name">' + esc(r.name) + '<span>' + r.n + ' người bệnh</span></div>' +
          '<div class="prog-bars">' + progBar('Đầu vào', r.a, 'in') + progBar('Đầu ra', r.b, 'out') + '</div></div>';
      });
      h += '</div><div class="legend2"><span><i class="in"></i>Đầu vào</span><span><i class="out"></i>Đầu ra</span>' +
        '<span class="dim">Chênh lệch dương thể hiện cải thiện chức năng</span></div></section>';
      $('#dash-progress').innerHTML = h;
    }

    function progBar(label, v, cls) {
      return '<div class="pb"><span class="pb-lb">' + label + '</span>' +
        '<span class="pb-track"><i class="' + cls + '" style="width:' + (v === null ? 0 : v) + '%"></i></span>' +
        '<b class="pb-val">' + (v === null ? '—' : v) + '</b></div>';
    }

    /* ---------- Hồ sơ cần theo dõi ---------- */
    function drawRecent() {
      var ps = scopePatients(), ids = {};
      ps.forEach(function (p) { ids[p.id] = true; });
      var as = ST.assessments().filter(function (a) {
        if (!ids[a.patientId]) return false;
        if (dash.month && String(a.date || '').slice(0, 7) !== dash.month) return false;
        return true;
      }).sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); }).slice(0, 8);

      var h = '<section class="panel" style="margin-bottom:24px"><div class="panel-head"><div>' +
        '<h3>Hồ sơ cần theo dõi</h3><p>Tám lượt đánh giá gần nhất trong phạm vi đang chọn</p></div>' +
        '<a class="link-more" href="#/patients">Tất cả người bệnh ' + ico('arrowUpRight', 15) + '</a></div>';
      if (!as.length) {
        h += '<p class="empty">Chưa có lượt đánh giá nào trong phạm vi này.</p>';
      } else {
        h += '<div class="scroll-x"><table class="tbl"><thead><tr><th>Mã hồ sơ</th><th>Nhóm bệnh</th>' +
          '<th>Thời điểm</th><th>Điểm chức năng</th><th>Thay đổi</th><th>Trạng thái</th><th></th></tr></thead><tbody>';
        as.forEach(function (a) {
          var p = ST.getPatient(a.patientId) || {};
          var cs = compositeScore(a);
          var io = inOut(a.patientId);
          var d = (io.first !== null && io.last !== null) ? io.last - io.first : null;
          var status, scls;
          var fl = reviewFlags(a.patientId);
          if (fl.length) { status = 'Cần rà soát'; scls = 'mod'; }
          else if (d !== null && d >= 10) { status = 'Đạt mục tiêu'; scls = 'good'; }
          else if (io.n >= 2) { status = 'Đang tiến triển'; scls = 'mild'; }
          else { status = 'Mới có đầu vào'; scls = ''; }
          h += '<tr><td><a href="#/patient/' + a.patientId + '"><b>' + esc(p.code || '') + '</b><br>' +
            '<span class="dim">' + esc(p.name || '') + '</span></a></td>' +
            '<td>' + (p.groups || []).map(function (gid) {
              var G = groupById(gid);
              return G ? '<span class="chip dot" style="--c:' + G.color + '">' + esc(G.short) + '</span>' : '';
            }).join(' ') + '</td>' +
            '<td><span class="chip">' + esc(String(a.timepoint || '—').split(' – ')[0]) + '</span><br>' +
            '<span class="dim">' + fmtDate(a.date) + '</span></td>' +
            '<td>' + (cs === null ? '—' : '<span class="mini-bar"><i style="width:' + cs + '%"></i></span><b>' + cs + '</b>') + '</td>' +
            '<td>' + (d === null ? '<span class="dim">—</span>' : '<span class="delta ' + (d > 0 ? 'up' : (d < 0 ? 'down' : '')) + '">' +
              (d > 0 ? '+' : '') + d + ' điểm</span>') + '</td>' +
            '<td><span class="chip ' + scls + '"' + (fl.length ? ' title="' + esc(fl.join(' · ')) + '"' : '') + '>' + status + '</span></td>' +
            '<td class="right"><a class="btn xs" href="#/assess/' + a.id + '">Xem →</a></td></tr>';
        });
        h += '</tbody></table></div>';
      }
      h += '</section>';
      $('#dash-recent').innerHTML = h;
    }

    function drawAll() { drawKpi(); drawTrend(); drawDz(); drawProgress(); drawRecent(); }

    $('#dash-kw').addEventListener('input', function () {
      dash.kw = this.value; drawKpi(); drawTrend(); drawProgress(); drawRecent();
    });
    $('#dash-month').addEventListener('change', function () {
      dash.month = this.value; drawKpi(); drawTrend(); drawProgress(); drawRecent();
    });
    $('#dash-export').addEventListener('click', function () {
      var r = ST.exportCSV({ group: dash.group, items: true });
      if (!r.rows) { toast('Chưa có dữ liệu để xuất trong phạm vi này.', 'warn'); return; }
      ST.download('phcn_baocao_' + today() + '.csv', r.csv, 'text/csv');
      toast('Đã xuất ' + r.rows + ' lượt đánh giá.');
    });

    drawAll();
  });

  /* =======================================================================
   *  TRANG: DANH SÁCH BỆNH NHÂN
   * ===================================================================== */
  route('patients', function (view, parts, query) {
    setHeader('Hồ sơ người bệnh', ST.patients().length + ' người bệnh đang quản lý');
    if (query['new']) { return patientForm(view, null); }
    if (parts[0] === 'edit') { return patientForm(view, ST.getPatient(parts[1])); }

    var filterGroup = query.group || '';
    var kw = '';
    var html = '<div class="page-head"><div><h1>Danh sách người bệnh</h1><p class="sub">Quản lý hồ sơ và theo dõi tiến triển từng người bệnh.</p></div>' +
      '<div class="head-actions"><a class="btn primary" href="#/patients?new=1">' + ico('plus', 17) + ' Người bệnh mới</a></div></div>';

    html += '<div class="card"><div class="filters">' +
      '<input id="pt-search" class="inp" type="search" placeholder="Tìm theo mã, họ tên, chẩn đoán…">' +
      '<select id="pt-group" class="inp"><option value="">— Tất cả nhóm bệnh lý —</option>' +
      realGroups().map(function (x) { return '<option value="' + x.id + '"' + (x.id === filterGroup ? ' selected' : '') + '>' + x.icon + ' ' + esc(x.name) + '</option>'; }).join('') +
      '</select></div><div id="pt-list"></div></div>';
    view.innerHTML = html;

    function draw() {
      kw = ($('#pt-search').value || '').toLowerCase().trim();
      filterGroup = $('#pt-group').value;
      var list = ST.patients().filter(function (p) {
        if (filterGroup && (p.groups || []).indexOf(filterGroup) < 0) return false;
        if (!kw) return true;
        return [p.code, p.name, p.dx, p.studyId].join(' ').toLowerCase().indexOf(kw) >= 0;
      }).sort(function (a, b) { return (b.createdAt || '').localeCompare(a.createdAt || ''); });

      if (!list.length) { $('#pt-list').innerHTML = '<p class="empty">Không có bệnh nhân phù hợp.</p>'; return; }
      var h = '<table class="tbl"><thead><tr><th>Mã</th><th>Họ tên</th><th>Tuổi/Giới</th><th>Nhóm bệnh lý</th><th>Chẩn đoán</th><th>Số lần đo</th><th></th></tr></thead><tbody>';
      list.forEach(function (p) {
        var n = ST.assessmentsOf(p.id).length;
        h += '<tr><td><b>' + esc(p.code || '') + '</b></td><td><a href="#/patient/' + p.id + '">' + esc(p.name || '(không tên)') + '</a></td>' +
          '<td>' + esc(p.age || '—') + ' / ' + esc(p.sex || '—') + '</td>' +
          '<td>' + (p.groups || []).map(function (gid) { var G = groupById(gid); return G ? '<span class="chip dot" style="--c:' + G.color + '">' + esc(G.short) + '</span>' : ''; }).join(' ') + '</td>' +
          '<td class="dim">' + esc(p.dx || '—') + '</td><td>' + (n ? '<span class="chip ok">' + n + '</span>' : '<span class="chip">0</span>') + '</td>' +
          '<td class="right"><a class="btn xs" href="#/patient/' + p.id + '">Hồ sơ</a> ' +
          '<a class="btn xs primary" href="#/assess?p=' + p.id + '">Đánh giá</a></td></tr>';
      });
      h += '</tbody></table>';
      $('#pt-list').innerHTML = h;
    }
    $('#pt-search').addEventListener('input', draw);
    $('#pt-group').addEventListener('change', draw);
    draw();
  });

  /* ---------------- Biểu mẫu bệnh nhân ---------------- */
  function patientForm(view, p) {
    p = p || { groups: [] };
    var isNew = !p.id;
    var html = '<div class="page-head"><div><h1>' + (isNew ? 'Thêm bệnh nhân mới' : 'Sửa hồ sơ bệnh nhân') + '</h1>' +
      '<p class="sub">Thông tin hành chính và biến số nền phục vụ phân tích.</p></div>' +
      '<div class="head-actions"><a class="btn" href="#/patients">' + ico('back', 17) + ' Quay lại</a></div></div>';

    html += '<form id="pform" class="card form">';
    html += '<div class="grid-3">' +
      field('code', 'Mã bệnh nhân / mã hồ sơ', 'text', p.code, true) +
      field('name', 'Họ và tên', 'text', p.name, true) +
      field('studyId', 'Mã nghiên cứu (ẩn danh)', 'text', p.studyId) +
      '</div>';
    html += '<div class="grid-4">' +
      selField('sex', 'Giới tính', ['Nam', 'Nữ', 'Khác'], p.sex) +
      field('age', 'Tuổi', 'number', p.age) +
      field('dob', 'Ngày sinh', 'date', p.dob) +
      field('edu', 'Số năm học vấn', 'number', p.edu) +
      '</div>';

    html += '<div class="field"><label>Nhóm đối tượng bệnh lý <span class="req">*</span></label>' +
      '<p class="hint">Có thể chọn nhiều nhóm nếu bệnh nhân có nhiều vấn đề (ví dụ đột quỵ kèm rối loạn ngôn ngữ và nhận thức).</p>' +
      '<div class="check-grid">';
    realGroups().forEach(function (grp) {
      var on = (p.groups || []).indexOf(grp.id) >= 0;
      html += '<label class="check-card' + (on ? ' on' : '') + '" style="--gc:' + grp.color + '">' +
        '<input type="checkbox" name="groups" value="' + grp.id + '"' + (on ? ' checked' : '') + '>' +
        '<span class="cc-ic" style="color:' + grp.color + '">' + g.PHCN.icon(g.PHCN.GROUP_ICON[grp.id], 20) + '</span><span class="cc-tx"><b>' + esc(grp.name) + '</b><i>' + esc(grp.desc) + '</i></span></label>';
    });
    html += '</div></div>';

    html += '<div class="grid-3">' +
      field('dx', 'Chẩn đoán chi tiết', 'text', p.dx) +
      selField('etiology', 'Nguyên nhân / cơ chế', ['Nhồi máu não', 'Xuất huyết não', 'Chấn thương tủy sống', 'Bệnh lý tủy không do chấn thương', 'Thoái hóa khớp', 'Sau phẫu thuật thay khớp', 'Sau chấn thương thể thao', 'Rách chóp xoay', 'Nhồi máu cơ tim', 'Sau can thiệp mạch vành', 'Sau phẫu thuật tim', 'Suy tim mạn', 'COPD', 'Hậu COVID-19', 'Khác'], p.etiology) +
      selField('side', 'Bên tổn thương', ['Phải', 'Trái', 'Hai bên', 'Không áp dụng'], p.side) +
      '</div>';
    html += '<div class="grid-4">' +
      field('onset', 'Ngày khởi phát / phẫu thuật', 'date', p.onset) +
      field('admit', 'Ngày bắt đầu chương trình PHCN', 'date', p.admit) +
      field('occupation', 'Nghề nghiệp', 'text', p.occupation) +
      field('phone', 'Điện thoại liên hệ', 'text', p.phone) +
      '</div>';
    html += '<div class="grid-2">' +
      selField('studyArm', 'Nhóm nghiên cứu (nếu có)', ['Không tham gia nghiên cứu', 'Nhóm can thiệp', 'Nhóm chứng', 'Nhóm A', 'Nhóm B'], p.studyArm) +
      field('comorbid', 'Bệnh kèm theo', 'text', p.comorbid) +
      '</div>';
    html += '<div class="field"><label>Ghi chú</label><textarea name="notes" class="inp" rows="3">' + esc(p.notes || '') + '</textarea></div>';
    html += '<div class="form-actions"><button type="submit" class="btn primary lg">' + (isNew ? 'Lưu bệnh nhân' : 'Cập nhật') + '</button>' +
      (isNew ? '' : '<button type="button" id="del-pt" class="btn danger">Xóa bệnh nhân</button>') + '</div>';
    html += '</form>';
    view.innerHTML = html;

    $$('.check-card input').forEach(function (i) {
      i.addEventListener('change', function () { i.closest('.check-card').classList.toggle('on', i.checked); });
    });

    $('#pform').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      var obj = p.id ? { id: p.id } : {};
      ['code', 'name', 'studyId', 'sex', 'age', 'dob', 'edu', 'dx', 'etiology', 'side', 'onset', 'admit', 'occupation', 'phone', 'studyArm', 'comorbid', 'notes'].forEach(function (k) {
        obj[k] = f.get(k) || '';
      });
      obj.groups = f.getAll('groups');
      if (!obj.code) { toast('Vui lòng nhập mã bệnh nhân.', 'err'); return; }
      if (!obj.groups.length) { toast('Vui lòng chọn ít nhất một nhóm bệnh lý.', 'err'); return; }
      var saved = ST.upsertPatient(obj);
      toast('Đã lưu hồ sơ bệnh nhân.');
      navigate('/patient/' + saved.id);
    });
    var del = $('#del-pt');
    if (del) del.addEventListener('click', function () {
      if (confirm('Xóa bệnh nhân này và TOÀN BỘ lượt đánh giá của họ? Thao tác không thể hoàn tác.')) {
        ST.deletePatient(p.id); toast('Đã xóa.', 'warn'); navigate('/patients');
      }
    });
  }

  function field(name, label, type, val, req) {
    return '<div class="field"><label>' + esc(label) + (req ? ' <span class="req">*</span>' : '') + '</label>' +
      '<input class="inp" type="' + type + '" name="' + name + '" value="' + esc(val || '') + '"></div>';
  }
  function selField(name, label, opts, val) {
    return '<div class="field"><label>' + esc(label) + '</label><select class="inp" name="' + name + '">' +
      '<option value="">— Chọn —</option>' +
      opts.map(function (o) { return '<option' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') +
      '</select></div>';
  }

  /* =======================================================================
   *  TRANG: HỒ SƠ BỆNH NHÂN
   * ===================================================================== */
  route('patient', function (view, parts) {
    var p = ST.getPatient(parts[0]);
    if (!p) { view.innerHTML = '<p class="empty">Không tìm thấy bệnh nhân.</p>'; return; }
    var as = ST.assessmentsOf(p.id);
    setHeader(esc(p.name || '(không tên)') + ' · ' + esc(p.code || ''),
      as.length + ' lượt đánh giá' + (p.dx ? ' · ' + esc(p.dx) : ''));

    var html = '<div class="page-head"><div><h1>' + esc(p.name || '(không tên)') + ' <span class="code">' + esc(p.code || '') + '</span></h1>' +
      '<p class="sub">' + (p.groups || []).map(function (gid) { var G = groupById(gid); return G ? '<span class="chip dot" style="--c:' + G.color + '">' + esc(G.name) + '</span>' : ''; }).join(' ') + '</p></div>' +
      '<div class="head-actions"><a class="btn primary" href="#/assess?p=' + p.id + '">' + ico('plus', 17) + ' Đánh giá mới</a>' +
      '<a class="btn" href="#/patients/edit/' + p.id + '">' + ico('edit', 17) + ' Sửa hồ sơ</a>' +
      '<button class="btn" onclick="window.print()">' + ico('print', 17) + ' In hồ sơ</button></div></div>';

    html += '<div class="card info-card"><div class="info-grid">' +
      info('Tuổi / Giới', (p.age || '—') + ' / ' + (p.sex || '—')) +
      info('Chẩn đoán', p.dx || '—') +
      info('Nguyên nhân', p.etiology || '—') +
      info('Bên tổn thương', p.side || '—') +
      info('Ngày khởi phát', fmtDate(p.onset)) +
      info('Bắt đầu PHCN', fmtDate(p.admit)) +
      info('Học vấn', p.edu ? p.edu + ' năm' : '—') +
      info('Nhóm nghiên cứu', p.studyArm || '—') +
      info('Bệnh kèm theo', p.comorbid || '—') +
      info('Mã nghiên cứu', p.studyId || '—') +
      '</div>' + (p.notes ? '<div class="note-box">' + esc(p.notes) + '</div>' : '') + '</div>';

    if (!as.length) {
      html += '<div class="card"><p class="empty">Chưa có lượt đánh giá nào. <a href="#/assess?p=' + p.id + '">Tạo lượt đánh giá đầu tiên</a>.</p></div>';
      view.innerHTML = html;
      return;
    }

    /* Bảng tiến triển */
    var scaleIds = [];
    as.forEach(function (a) { (a.scaleIds || []).forEach(function (s) { if (scaleIds.indexOf(s) < 0) scaleIds.push(s); }); });
    scaleIds.sort(function (x, y) { return ORDER.indexOf(x) - ORDER.indexOf(y); });
    var results = as.map(function (a) { return ST.scoreAssessment(a); });

    html += '<section class="card"><h2>Bảng tiến triển chức năng</h2>' +
      '<div class="scroll-x"><table class="tbl matrix"><thead><tr><th>Thang điểm</th>' +
      as.map(function (a) {
        var tp = String(a.timepoint || '—');
        return '<th title="' + esc(tp) + '">' + esc(tp.split(' – ')[0]) + '<br><span class="dim">' + fmtDate(a.date) + '</span></th>';
      }).join('') + '<th>Thay đổi<br><span class="dim">lần cuối − lần đầu</span></th></tr></thead><tbody>';

    scaleIds.forEach(function (sid) {
      var sc = REG[sid]; if (!sc || sc.noTotal) return;
      var vals = results.map(function (r) { return r[sid] ? r[sid].total : null; });
      var first = null, last = null;
      vals.forEach(function (v) { if (v !== null && v !== undefined) { if (first === null) first = v; last = v; } });
      var delta = (first !== null && last !== null) ? Math.round((last - first) * 100) / 100 : null;
      var good = delta === null ? null : (isReverse(sc) ? delta < 0 : delta > 0);
      html += '<tr><td><b>' + esc(sc.short) + '</b><br><span class="dim">' + esc(sc.name.split('(')[0].trim()) + '</span></td>' +
        vals.map(function (v, i) {
          if (v === null || v === undefined) return '<td class="dim">—</td>';
          var ip = results[i][sid].interp;
          return '<td><span class="score ' + (ip ? ip.cls : '') + '">' + v + (sc.max ? '<i>/' + sc.max + '</i>' : '') + '</span></td>';
        }).join('') +
        '<td>' + (delta === null ? '—' : '<span class="delta ' + (delta === 0 ? '' : (good ? 'up' : 'down')) + '">' + (delta > 0 ? '+' : '') + delta + '</span>') + '</td></tr>';
    });
    html += '</tbody></table></div>';
    html += '<p class="hint">Với các thang có điểm cao = tình trạng nặng hơn (mRS, NIHSS, WOMAC, SPADI, PHQ-9, đau…), thay đổi âm được tô màu cải thiện.</p></section>';

    /* Biểu đồ */
    var labels = as.map(function (a) {
      return a.timepoint ? String(a.timepoint).split(' – ')[0] : fmtDate(a.date);
    });
    var palette = ['#2563eb', '#059669', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#db2777', '#65a30d'];
    var series = [];
    scaleIds.forEach(function (sid, idx) {
      var sc = REG[sid];
      if (!sc || sc.noTotal || !sc.max) return;
      var raw = results.map(function (r) { return r[sid] ? r[sid].total : null; });
      if (raw.filter(function (x) { return x !== null; }).length < 2) return;
      series.push({
        name: sc.short + (isReverse(sc) ? ' (đảo chiều)' : ''),
        color: palette[series.length % palette.length],
        values: raw.map(function (v) {
          if (v === null) return null;
          var q = pct(v, sc.max);
          return isReverse(sc) ? 100 - q : q;
        }),
        raw: raw
      });
    });
    if (series.length) {
      html += '<section class="card"><h2>Diễn tiến theo thời gian (chuẩn hóa 0–100%)</h2>' +
        '<div class="legend">' + series.map(function (s) { return '<span><i style="background:' + s.color + '"></i>' + esc(s.name) + '</span>'; }).join('') + '</div>' +
        lineChart(series, { labels: labels, width: 760, height: 260 }) +
        '<p class="hint">Mọi thang được quy về thang 0–100% với 100% = chức năng tốt nhất, để so sánh trực quan các công cụ khác nhau trên cùng một trục.</p></section>';
    }

    /* Danh sách lượt đánh giá */
    html += '<section class="card"><h2>Các lượt đánh giá</h2><table class="tbl"><thead><tr><th>Thời điểm</th><th>Ngày</th><th>Ngày thứ</th><th>Người đánh giá</th><th>Thang điểm</th><th></th></tr></thead><tbody>';
    as.forEach(function (a) {
      var d = daysBetween(p.onset, a.date);
      html += '<tr><td><span class="chip">' + esc(a.timepoint || '—') + '</span></td><td>' + fmtDate(a.date) + '</td>' +
        '<td>' + (d === null ? '—' : d) + '</td><td>' + esc(a.assessor || '—') + '</td>' +
        '<td>' + (a.scaleIds || []).map(function (s) { return REG[s] ? '<span class="tag">' + esc(REG[s].short) + '</span>' : ''; }).join('') + '</td>' +
        '<td class="right"><a class="btn xs" href="#/assess/' + a.id + '">Xem / sửa</a></td></tr>';
    });
    html += '</tbody></table></section>';

    view.innerHTML = html;
  });

  function info(k, v) { return '<div class="info"><span>' + esc(k) + '</span><b>' + esc(v) + '</b></div>'; }

  /* =======================================================================
   *  TRANG: LƯỢT ĐÁNH GIÁ
   * ===================================================================== */
  var TIMEPOINTS = ['T0 – Trước can thiệp / vào viện', 'T1 – Sau 2 tuần', 'T2 – Sau 4 tuần', 'T3 – Sau 8 tuần', 'T4 – Sau 12 tuần', 'T5 – Sau 6 tháng', 'T6 – Sau 12 tháng', 'Ra viện', 'Tái khám', 'Khác'];

  route('assess', function (view, parts, query) {
    setHeader('Phiếu lượng giá chức năng', 'Chấm điểm theo bộ công cụ của nhóm bệnh lý, tính tổng và diễn giải tự động');
    var a, p;
    if (parts[0]) {
      a = ST.getAssessment(parts[0]);
      if (!a) { view.innerHTML = '<p class="empty">Không tìm thấy lượt đánh giá.</p>'; return; }
      p = ST.getPatient(a.patientId);
    } else {
      a = { patientId: query.p || '', date: today(), timepoint: TIMEPOINTS[0], assessor: ST.load().settings.researcher || '', scaleIds: [], values: {}, notes: '' };
      p = query.p ? ST.getPatient(query.p) : null;
    }
    renderAssess(view, a, p);
  });

  function renderAssess(view, a, p) {
    var pts = ST.patients();
    if (!pts.length) {
      view.innerHTML = '<div class="page-head"><div><h1>Lượt đánh giá mới</h1>' +
        '<p class="sub">Chưa có người bệnh nào. Nhập nhanh thông tin tối thiểu dưới đây để bắt đầu chấm điểm ngay.</p></div></div>' +
        '<div class="card"><h2>Thêm nhanh người bệnh</h2><form id="quick-pt">' +
        '<div class="grid-3">' +
        '<div class="field"><label>Mã người bệnh <span class="req">*</span></label><input class="inp" name="code" required placeholder="VD: BN001"></div>' +
        '<div class="field"><label>Họ và tên <span class="req">*</span></label><input class="inp" name="name" required></div>' +
        '<div class="field"><label>Ngày khởi phát / phẫu thuật</label><input class="inp" type="date" name="onset"></div>' +
        '</div>' +
        '<div class="field"><label>Nhóm đối tượng bệnh lý <span class="req">*</span></label>' +
        '<div class="check-grid">' +
        realGroups().map(function (grp) {
          return '<label class="check-card" style="--gc:' + grp.color + '">' +
            '<input type="checkbox" name="groups" value="' + grp.id + '">' +
            '<span class="cc-ic" style="color:' + grp.color + '">' + g.PHCN.icon(g.PHCN.GROUP_ICON[grp.id], 20) + '</span>' +
            '<span class="cc-tx"><b>' + esc(grp.name) + '</b><i>' + esc(grp.desc) + '</i></span></label>';
        }).join('') +
        '</div></div>' +
        '<div class="form-actions"><button class="btn primary lg" type="submit">Tạo hồ sơ và bắt đầu chấm điểm</button>' +
        '<a class="btn" href="#/patients?new=1">Nhập hồ sơ đầy đủ</a></div></form></div>';

      $$('.check-card input').forEach(function (i) {
        i.addEventListener('change', function () { i.parentNode.classList.toggle('on', i.checked); });
      });
      $('#quick-pt').addEventListener('submit', function (e) {
        e.preventDefault();
        var f = new FormData(e.target);
        var groups = f.getAll('groups');
        if (!groups.length) { toast('Chọn ít nhất một nhóm bệnh lý.', 'err'); return; }
        var np = ST.upsertPatient({ code: f.get('code'), name: f.get('name'), onset: f.get('onset') || '', groups: groups });
        toast('Đã tạo hồ sơ ' + np.code + '.');
        navigate('/assess?p=' + np.id);
      });
      return;
    }

    var html = '<div class="page-head"><div><h1>' + (a.id ? 'Lượt đánh giá' : 'Lượt đánh giá mới') + '</h1>' +
      '<p class="sub">Chọn bộ công cụ theo nhóm bệnh lý, nhập điểm từng mục — tổng điểm và diễn giải được tính tự động.</p></div>' +
      '<div class="head-actions"><button class="btn" onclick="window.print()">' + ico('print', 17) + ' In phiếu</button>' +
      (a.id ? '<button class="btn danger" id="del-as">' + ico('trash', 17) + ' Xóa lượt này</button>' : '') + '</div></div>';

    /* Thông tin lượt */
    html += '<div class="card"><div class="grid-4">' +
      '<div class="field"><label>Bệnh nhân <span class="req">*</span></label><select class="inp" id="as-patient">' +
      '<option value="">— Chọn bệnh nhân —</option>' +
      pts.map(function (x) {
        return '<option value="' + x.id + '"' + (x.id === a.patientId ? ' selected' : '') + '>' + esc(x.code || '') + ' – ' + esc(x.name || '') + '</option>';
      }).join('') + '</select></div>' +
      '<div class="field"><label>Thời điểm đánh giá</label><select class="inp" id="as-tp">' +
      TIMEPOINTS.map(function (t) { return '<option' + (t === a.timepoint ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label>Ngày đánh giá</label><input class="inp" type="date" id="as-date" value="' + esc(a.date || today()) + '"></div>' +
      '<div class="field"><label>Người đánh giá</label><input class="inp" type="text" id="as-assessor" value="' + esc(a.assessor || '') + '"></div>' +
      '</div><div id="as-pinfo"></div></div>';

    /* Chọn thang điểm */
    html += '<div class="card" id="picker-card"><div class="card-head">' +
      '<div><h2>Bộ công cụ lượng hóa</h2><p class="card-sub" id="picker-count"></p></div>' +
      '<button class="btn xs" id="toggle-picker" type="button">Thêm / bớt thang điểm</button>' +
      '</div><div id="scale-picker"></div></div>';

    /* Biểu mẫu */
    html += '<div id="forms"></div>';

    html += '<div class="card summary-card" id="summary"></div>';
    html += '<div class="card"><div class="field"><label>Nhận xét chung / kế hoạch can thiệp</label>' +
      '<textarea class="inp" id="as-notes" rows="4">' + esc(a.notes || '') + '</textarea></div>' +
      '<div class="form-actions"><button class="btn primary lg" id="save-as">Lưu lượt đánh giá</button>' +
      '<span class="dim" id="save-hint"></span></div></div>';

    view.innerHTML = html;

    var state = {
      patientId: a.patientId, scaleIds: (a.scaleIds || []).slice(), values: JSON.parse(JSON.stringify(a.values || {}))
    };

    function currentGroups() {
      var pp = ST.getPatient(state.patientId);
      return pp ? (pp.groups || []) : [];
    }

    function drawPatientInfo() {
      var pp = ST.getPatient(state.patientId);
      var box = $('#as-pinfo');
      if (!pp) { box.innerHTML = ''; return; }
      var d = daysBetween(pp.onset, $('#as-date').value);
      box.innerHTML = '<div class="pinfo">' +
        (pp.groups || []).map(function (gid) { var G = groupById(gid); return G ? '<span class="chip dot" style="--c:' + G.color + '">' + esc(G.short) + '</span>' : ''; }).join('') +
        '<span class="dim">' + esc(pp.dx || '') + (pp.side ? ' · bên ' + esc(pp.side) : '') + '</span>' +
        (d !== null ? '<span class="dim">Ngày thứ <b>' + d + '</b> kể từ khởi phát</span>' : '') + '</div>';
    }

    function drawPicker() {
      var gs = currentGroups();
      var box = $('#scale-picker');
      if (!state.patientId) { box.innerHTML = '<p class="empty">Chọn bệnh nhân để hiển thị bộ công cụ khuyến nghị.</p>'; return; }

      var h = '<p class="hint">Các thang được đánh dấu <span class="tag core">CỐT LÕI</span> là bộ tối thiểu khuyến nghị cho nhóm bệnh lý của bệnh nhân. Có thể bổ sung bất kỳ thang nào khác.</p>';
      h += '<div class="picker-actions"><button class="btn xs" id="pick-core">Chọn bộ cốt lõi</button>' +
        '<button class="btn xs" id="pick-all-group">Chọn tất cả thang của nhóm</button>' +
        '<button class="btn xs" id="pick-none">Bỏ chọn tất cả</button>' +
        '<label class="switch"><input type="checkbox" id="show-all"> Hiện toàn bộ thư viện (' + ORDER.length + ' thang)</label></div>';
      h += '<div id="picker-body"></div>';
      box.innerHTML = h;

      function body() {
        var showAll = $('#show-all').checked;
        var listGroups = showAll ? GROUPS.slice()
          : GROUPS.filter(function (G) { return gs.indexOf(G.id) >= 0 || G.id === 'psych' || G.id === 'general'; });
        /* Thứ tự: nhóm bệnh lý của người bệnh → Tâm lý & giấc ngủ → Chung */
        function rank(G) { return G.id === 'general' ? 2 : (G.id === 'psych' ? 1 : 0); }
        listGroups = listGroups.slice().sort(function (x, y) { return rank(x) - rank(y); });
        var used = {}, out = '';
        listGroups.forEach(function (G) {
          /* Mỗi thang chỉ hiển thị MỘT lần; thang có "home" luôn nằm ở mục của nó */
          var ids = ORDER.filter(function (id) {
            if (used[id]) return false;
            var sc = REG[id];
            if (sc.home) return sc.home === G.id;
            return sc.groups.indexOf(G.id) >= 0;
          });
          ids.forEach(function (id) { used[id] = true; });
          if (!ids.length) return;
          out += '<div class="pick-group"><h3 style="--gc:' + G.color + '">' + esc(G.name) + '</h3><div class="pick-list">';
          ids.forEach(function (id) {
            var sc = REG[id], on = state.scaleIds.indexOf(id) >= 0, core = sc.coreFor.indexOf(G.id) >= 0;
            out += '<label class="pick' + (on ? ' on' : '') + '"><input type="checkbox" data-sid="' + id + '"' + (on ? ' checked' : '') + '>' +
              '<span class="pk-main"><b>' + esc(sc.short) + '</b> — ' + esc(sc.name) + '</span>' +
              '<span class="pk-meta">' + (core ? '<span class="tag core">CỐT LÕI</span>' : '') +
              '<span class="tag">' + esc(DOMAINS[sc.domain] || '') + '</span>' +
              (sc.minutes ? '<span class="tag">⏱ ' + esc(sc.minutes) + '</span>' : '') +
              (sc.noTotal ? '<span class="tag">đo lường</span>' : '<span class="tag">0–' + sc.max + '</span>') +
              '</span></label>';
          });
          out += '</div></div>';
        });
        $('#picker-body').innerHTML = out;
        $$('#picker-body input[type=checkbox]').forEach(function (cb) {
          cb.addEventListener('change', function () {
            var sid = cb.getAttribute('data-sid');
            if (cb.checked) { if (state.scaleIds.indexOf(sid) < 0) state.scaleIds.push(sid); }
            else state.scaleIds = state.scaleIds.filter(function (x) { return x !== sid; });
            drawPicker(); drawForms();
          });
        });
      }
      $('#show-all').addEventListener('change', body);
      $('#pick-core').addEventListener('click', function () {
        gs.concat(['general']).forEach(function (gid) {
          ORDER.forEach(function (id) { if (REG[id].coreFor.indexOf(gid) >= 0 && state.scaleIds.indexOf(id) < 0) state.scaleIds.push(id); });
        });
        drawPicker(); drawForms();
      });
      $('#pick-all-group').addEventListener('click', function () {
        gs.concat(['general']).forEach(function (gid) {
          ORDER.forEach(function (id) { if (REG[id].groups.indexOf(gid) >= 0 && state.scaleIds.indexOf(id) < 0) state.scaleIds.push(id); });
        });
        drawPicker(); drawForms();
      });
      $('#pick-none').addEventListener('click', function () { state.scaleIds = []; drawPicker(); drawForms(); });
      body();
    }

    function orderedIds() {
      return state.scaleIds.slice().sort(function (x, y) { return ORDER.indexOf(x) - ORDER.indexOf(y); });
    }

    /* Tự nạp bộ thang điểm cốt lõi theo nhóm bệnh lý của người bệnh */
    function autoCore(force) {
      if (a.id && !force) return;
      if (state.scaleIds.length && !state.autoFilled && !force) return;
      var gs = currentGroups();
      if (!gs.length) return;
      state.scaleIds = [];
      gs.concat(['general']).forEach(function (gid) {
        ORDER.forEach(function (id) {
          if (REG[id].coreFor.indexOf(gid) >= 0 && state.scaleIds.indexOf(id) < 0) state.scaleIds.push(id);
        });
      });
      state.autoFilled = true;
    }

    function setPickerCollapsed(v) {
      var c = $('#picker-card');
      if (c) c.className = 'card' + (v ? ' collapsed' : '');
    }

    function drawForms() {
      var box = $('#forms');
      var cnt = $('#picker-count');
      if (cnt) {
        cnt.innerHTML = state.scaleIds.length
          ? 'Đang dùng <b>' + state.scaleIds.length + '</b> thang điểm' +
            (state.autoFilled ? ' — bộ cốt lõi tự nạp theo nhóm bệnh lý' : '') + '. Có thể thêm hoặc bớt.'
          : 'Chưa chọn thang điểm nào.';
      }
      if (!state.scaleIds.length) {
        box.innerHTML = '<div class="card"><p class="empty">' +
          (state.patientId
            ? 'Chưa chọn thang điểm nào. Bấm <b>Thêm / bớt thang điểm</b> ở trên để chọn.'
            : 'Hãy chọn người bệnh ở trên — bộ thang điểm cốt lõi cùng toàn bộ trường chấm điểm sẽ tự hiện ra.') +
          '</p></div>';
        drawSummary(); return;
      }
      box.innerHTML = orderedIds().map(function (sid) { return scaleFormHTML(REG[sid], state.values[sid] || {}); }).join('');

      $$('#forms [data-key]').forEach(function (inp) {
        var onChange = function () {
          var sid = inp.getAttribute('data-sid'), key = inp.getAttribute('data-key');
          state.values[sid] = state.values[sid] || {};
          state.values[sid][key] = inp.value;
          refreshScale(sid);
          drawSummary();
        };
        inp.addEventListener('change', onChange);
        if (inp.tagName === 'INPUT') inp.addEventListener('input', onChange);
      });
      /* Sơ đồ cơ thể: bấm để chọn / bỏ chọn vùng đau */
      $$('#forms .fig-zone').forEach(function (z) {
        z.addEventListener('click', function () {
          var host = z.closest('[data-bmhost]');
          if (!host) return;
          var did = host.getAttribute('data-bmhost');
          var inp = $('#bm-' + did);
          if (!inp) return;
          var name = z.getAttribute('data-zone');
          var cur = String(inp.value || '').split(';').map(function (t) { return t.trim(); }).filter(Boolean);
          var i = cur.indexOf(name);
          /* Phần tử SVG không cho gán className — phải dùng setAttribute */
          if (i >= 0) { cur.splice(i, 1); z.setAttribute('class', 'fig-zone'); }
          else { cur.push(name); z.setAttribute('class', 'fig-zone on'); }
          inp.value = cur.join('; ');
          var ev = document.createEvent('HTMLEvents');
          ev.initEvent('change', true, false);
          inp.dispatchEvent(ev);
        });
      });

      $$('#forms .scale-head').forEach(function (hd) {
        hd.addEventListener('click', function (e) {
          if (e.target.closest('.btn')) return;
          hd.parentNode.classList.toggle('collapsed');
        });
      });
      $$('#forms .rm-scale').forEach(function (b) {
        b.addEventListener('click', function () {
          var sid = b.getAttribute('data-sid');
          state.scaleIds = state.scaleIds.filter(function (x) { return x !== sid; });
          state.autoFilled = false;
          drawPicker(); drawForms();
        });
      });
      orderedIds().forEach(refreshScale);
      drawSummary();
    }

    /* Cập nhật điểm từng đầu mục, tổng điểm từng phân mục và tổng điểm thang */
    function refreshScale(sid) {
      var sc = REG[sid], vals = state.values[sid] || {};
      var r = ST.score(sc, vals);

      (sc.sections || []).forEach(function (sec) {
        var sum = 0, has = false, done = 0, n = 0;
        (sec.items || []).forEach(function (item) {
          var key = sec.id + '.' + item.id;
          var v = vals[key];
          var filled = (v !== undefined && v !== null && v !== '');
          n++; if (filled) done++;
          var cell = $('#pt-' + domId(sid, key));
          var row = $('#row-' + domId(sid, key));
          if (row) row.className = 'item' + (filled ? ' filled' : '');
          if (item.fig) {
            var fbox = $('#ifig-' + domId(sid, key));
            if (fbox) fbox.innerHTML = itemFigureHTML(item, v);
          }
          if (item.type === 'bodymap') {
            var lst = $('#bmlist-' + domId(sid, key));
            if (lst) {
              var parts = String(v || '').split(';').filter(function (t) { return t.trim(); });
              lst.innerHTML = parts.length
                ? parts.map(function (t) { return '<span class="chip">' + esc(t.trim()) + '</span>'; }).join('')
                : '<span class="dim">Bấm vào sơ đồ để chọn vùng đau</span>';
            }
          }
          if (ST.isScorable(item)) {
            var val = filled ? Number(v) : null;
            if (val !== null && !isNaN(val)) { sum += val; has = true; }
            if (cell) cell.innerHTML = (val === null || isNaN(val))
              ? '<i>—</i>'
              : '<b>' + fmtNum(val) + '</b><i>/' + itemMax(item) + '</i>';
          } else if (cell) {
            cell.innerHTML = filled ? '<b class="ok">✓</b>' : '<i>—</i>';
          }
        });
        var box = $('#sum-' + domId(sid, sec.id));
        if (box) {
          var mx = sectionMax(sec);
          box.innerHTML = mx
            ? 'Điểm phần này: <b>' + (has ? fmtNum(sum) : '—') + '</b> / ' + mx + ' <span class="dim">· đã chấm ' + done + '/' + n + '</span>'
            : '<span class="dim">Đã nhập ' + done + '/' + n + ' mục</span>';
        }
      });

      var resBox = $('#res-' + sid);
      if (resBox) resBox.innerHTML = resultHTML(sc, r);
      var badge = $('#badge-' + sid);
      if (badge) {
        badge.innerHTML = (sc.noTotal
          ? '<span class="chip">' + r.answered + '/' + r.itemCount + ' mục</span>'
          : '<span class="chip big ' + (r.interp ? r.interp.cls : '') + '">' + (r.total === null ? '—' : fmtNum(r.total) + ' / ' + sc.max) + '</span>') +
          '<span class="chip">' + r.completion + '%</span>';
      }
    }

    /* ---------------- KẾT LUẬN LƯỢNG GIÁ ---------------- */
    function drawSummary() {
      var box = $('#summary');
      var ordered = orderedIds();
      if (!ordered.length) {
        box.innerHTML = '<div class="card-head"><h2>Kết luận lượng giá</h2></div><p class="empty">Chưa có dữ liệu để kết luận.</p>';
        return;
      }
      var rows = ordered.map(function (sid) {
        var sc = REG[sid];
        return { sc: sc, r: ST.score(sc, state.values[sid] || {}) };
      });
      var comp = compositeScore({ scaleIds: ordered, values: state.values });
      var scored = rows.filter(function (x) { return !x.sc.noTotal && x.r.total !== null; });
      var missing = rows.filter(function (x) { return x.r.completion < 100; });

      var h = '<div class="card-head"><div><h2>Kết luận lượng giá</h2>' +
        '<p class="card-sub">Tổng hợp toàn bộ thang điểm thu được trong lượt đánh giá này</p></div>' +
        '<button class="btn xs" type="button" onclick="window.print()">In kết luận</button></div>';

      h += '<div class="concl-top">' +
        '<div class="concl-score"><span class="cs-lb">Điểm chức năng tổng hợp</span>' +
        '<span class="cs-val">' + (comp === null ? '—' : comp) + '<i>/100</i></span>' +
        '<span class="kpi-bar"><i class="brand" style="width:' + (comp === null ? 0 : comp) + '%"></i></span>' +
        '<span class="cs-sub">Trung bình ' + scored.length + ' thang đã chấm, quy về 0–100 (100 = chức năng tốt nhất)</span></div>' +
        '<div class="concl-meta">' +
        '<div><span>Số thang điểm</span><b>' + rows.length + '</b></div>' +
        '<div><span>Chấm xong</span><b>' + (rows.length - missing.length) + '/' + rows.length + '</b></div>' +
        '<div><span>Tổng số mục</span><b>' + rows.reduce(function (t, x) { return t + x.r.itemCount; }, 0) + '</b></div>' +
        '<div><span>Mục đã chấm</span><b>' + rows.reduce(function (t, x) { return t + x.r.answered; }, 0) + '</b></div>' +
        '</div></div>';

      var rad = FIG ? FIG.radar(domainAxes(rows)) : '';
      if (rad) {
        h += '<div class="concl-radar"><div><h3 class="concl-h3">Hồ sơ chức năng theo lĩnh vực</h3>' + rad +
          '<p class="hint">Mỗi trục là trung bình các thang thuộc lĩnh vực đó, quy về 0–100 (100 = tốt nhất). ' +
          'Diện tích càng rộng, chức năng càng tốt.</p></div>' +
          '<div><h3 class="concl-h3">Biểu diễn các thang điểm thu được</h3><div class="bars concl-bars">';
      } else {
        h += '<h3 class="concl-h3">Biểu diễn các thang điểm thu được</h3><div class="bars concl-bars">';
      }
      rows.forEach(function (x) {
        if (x.sc.noTotal) return;
        var lo = x.sc.min || 0;
        var q = (x.r.total === null || !x.sc.max) ? null : Math.round((x.r.total - lo) / (x.sc.max - lo) * 100);
        var cls = x.r.interp ? x.r.interp.cls : '';
        h += '<div class="bar-row"><div class="bar-label" title="' + esc(x.sc.name) + '"><b>' + esc(x.sc.short) + '</b>' +
          (x.sc.reverse ? ' <span class="rev">điểm cao = nặng</span>' : '') + '</div>' +
          '<div class="bar-track"><div class="bar-fill ' + cls + '" style="width:' + (q === null ? 0 : q) + '%"></div></div>' +
          '<div class="bar-val">' + (x.r.total === null ? '—' : fmtNum(x.r.total)) + '<span>/' + x.sc.max + '</span></div></div>';
      });
      h += '</div>' + (rad ? '</div></div>' : '');

      h += '<div class="scroll-x"><table class="tbl concl-tbl"><thead><tr>' +
        '<th>Thang điểm</th><th>Điểm đạt</th><th>Thang đo</th><th>Tỷ lệ</th><th>Mức độ / diễn giải</th><th>Hoàn thành</th>' +
        '</tr></thead><tbody>';
      rows.forEach(function (x) {
        var sc = x.sc, r = x.r;
        var lo = sc.min || 0;
        var q = (sc.noTotal || r.total === null || !sc.max) ? null : Math.round((r.total - lo) / (sc.max - lo) * 100);
        h += '<tr><td><b>' + esc(sc.short) + '</b><br><span class="dim">' + esc(sc.name.split('(')[0].trim()) + '</span></td>' +
          '<td>' + (sc.noTotal ? '<span class="dim">đo lường</span>' : '<span class="score ' + (r.interp ? r.interp.cls : '') + '">' + (r.total === null ? '—' : fmtNum(r.total)) + '</span>') + '</td>' +
          '<td class="dim">' + (sc.noTotal ? '—' : (sc.min || 0) + '–' + sc.max) + '</td>' +
          '<td>' + (q === null ? '—' : q + '%') + '</td>' +
          '<td>' + (r.interp ? '<b>' + esc(r.interp.label) + '</b>' + (r.interp.text ? '<br><span class="dim">' + esc(r.interp.text) + '</span>' : '') : '<span class="dim">chưa đủ dữ liệu</span>') + '</td>' +
          '<td>' + r.completion + '%</td></tr>';
        var extras = [];
        (r.subs || []).forEach(function (sb) { if (sb.value !== null) extras.push(esc(sb.name) + ': <b>' + fmtNum(sb.value) + '/' + sb.max + '</b>'); });
        Object.keys(r.extra || {}).forEach(function (k) { extras.push(esc(k) + ': <b>' + esc(r.extra[k]) + '</b>'); });
        if (extras.length) h += '<tr class="sub-row"><td></td><td colspan="5">' + extras.join(' · ') + '</td></tr>';
      });
      h += '</tbody></table></div>';

      if (missing.length) {
        h += '<div class="warn-box">Còn <b>' + missing.length + '</b> thang chưa chấm đủ: ' +
          missing.map(function (x) { return esc(x.sc.short) + ' (' + x.r.completion + '%)'; }).join(', ') +
          '. Mục để trống sẽ là ô rỗng khi xuất file nghiên cứu.</div>';
      }
      box.innerHTML = h;
    }

    $('#as-patient').addEventListener('change', function () {
      state.patientId = this.value;
      autoCore();
      drawPatientInfo(); drawPicker(); drawForms();
      setPickerCollapsed(state.scaleIds.length > 0);
    });
    $('#as-date').addEventListener('change', drawPatientInfo);
    $('#toggle-picker').addEventListener('click', function () {
      var c = $('#picker-card');
      setPickerCollapsed(c.className.indexOf('collapsed') < 0);
    });

    $('#save-as').addEventListener('click', function () {
      if (!state.patientId) { toast('Vui lòng chọn bệnh nhân.', 'err'); return; }
      if (!state.scaleIds.length) { toast('Vui lòng chọn ít nhất một thang điểm.', 'err'); return; }
      var obj = a.id ? { id: a.id } : {};
      obj.patientId = state.patientId;
      obj.timepoint = $('#as-tp').value;
      obj.date = $('#as-date').value;
      obj.assessor = $('#as-assessor').value;
      obj.notes = $('#as-notes').value;
      obj.scaleIds = state.scaleIds;
      obj.values = state.values;
      var saved = ST.upsertAssessment(obj);
      var db = ST.load(); db.settings.researcher = obj.assessor; ST.save();
      toast('Đã lưu lượt đánh giá.');
      navigate('/patient/' + saved.patientId);
    });

    var del = $('#del-as');
    if (del) del.addEventListener('click', function () {
      if (confirm('Xóa lượt đánh giá này?')) { ST.deleteAssessment(a.id); toast('Đã xóa.', 'warn'); navigate('/patient/' + a.patientId); }
    });

    autoCore();
    drawPatientInfo(); drawPicker(); drawForms();
    setPickerCollapsed(state.scaleIds.length > 0);
  }

  /* ---------------- HÌNH MINH HỌA ---------------- */
  var FIG = g.PHCN.fig;

  /* Hình minh họa gắn với một đầu mục, vẽ theo giá trị đang chọn */
  function itemFigureHTML(item, val) {
    var f = item.fig;
    if (!f || !FIG) return '';
    var v = (val === undefined || val === null || val === '') ? null : Number(val);
    if (f === 'faces') return FIG.faces(v);
    if (f === 'mrc') return FIG.mrc(v);
    if (f === 'ashworth') return FIG.ashworth(v);
    if (f === 'hand') return FIG.hand(v);
    if (typeof f === 'string' && f.indexOf('level:') === 0) return FIG.levelStrip(f.slice(6), v);
    if (f && f.type === 'gonio') {
      return FIG.goniometer({ value: v, normal: f.normal, dir: f.dir, label: f.label, normalText: f.normalText });
    }
    return '';
  }

  /* Hình minh họa chung của cả thang (sơ đồ tham chiếu) */
  var FIG_CAPTION = {
    dermatome: 'Sơ đồ điểm cảm giác chìa khóa theo chuẩn ISNCSCI — di chuột lên chấm để xem mô tả vị trí.',
    ashworth: 'Sức cản khi vận động thụ động nhanh, tăng dần từ mức 0 đến mức 4.',
    mrc: 'Bậc sức cơ theo thang MRC dùng cho các cơ chìa khóa.'
  };
  function scaleFigureHTML(sc) {
    if (!sc.figure || !FIG) return '';
    var list = (typeof sc.figure === 'string') ? [sc.figure] : sc.figure;
    var out = '';
    list.forEach(function (name) {
      var html = '';
      if (name === 'dermatome') html = FIG.dermatome();
      else if (name === 'ashworth') html = FIG.ashworth(null);
      else if (name === 'mrc') html = FIG.mrc(null);
      if (html) {
        out += '<figure class="fig-box"><div class="fig-wrap">' + html + '</div>' +
          '<figcaption>' + esc(FIG_CAPTION[name] || '') + '</figcaption></figure>';
      }
    });
    return out ? '<div class="fig-row">' + out + '</div>' : '';
  }

  /* ---------------- Tiện ích chấm điểm ---------------- */
  /* Chuỗi id an toàn cho DOM (khóa mục có dấu chấm) */
  function domId(sid, key) { return (sid + '_' + key).replace(/[^A-Za-z0-9_]/g, '_'); }

  /* Hiển thị số gọn: bỏ số 0 thừa, dùng dấu phẩy thập phân kiểu Việt Nam */
  function fmtNum(n) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    var r = Math.round(n * 100) / 100;
    return String(r).replace('.', ',');
  }

  /* Điểm tối đa của một đầu mục */
  function itemMax(item) {
    if (item.type === 'number') return item.max !== undefined ? item.max : '';
    var mx = null;
    (item.options || []).forEach(function (o) { if (mx === null || o.v > mx) mx = o.v; });
    return mx === null ? '' : fmtNum(mx);
  }

  /* Điểm tối đa của một phân mục (chỉ tính các mục có cộng điểm) */
  function sectionMax(sec) {
    var m = 0, any = false;
    (sec.items || []).forEach(function (item) {
      if (!ST.isScorable(item)) return;
      any = true;
      if (item.type === 'number') { m += (item.max || 0); return; }
      var mx = null;
      (item.options || []).forEach(function (o) { if (mx === null || o.v > mx) mx = o.v; });
      m += (mx === null ? 0 : mx);
    });
    return any ? Math.round(m * 100) / 100 : 0;
  }

  /* ---------------- HTML biểu mẫu một thang ---------------- */
  function scaleFormHTML(sc, values) {
    var h = '<section class="card scale" id="sc-' + sc.id + '">';
    h += '<div class="scale-head"><div class="sh-title"><h2>' + esc(sc.short) + ' · ' + esc(sc.name) + '</h2>' +
      '<p class="sub">' + esc(sc.note || '') + '</p></div>' +
      '<div class="sh-right"><span class="badges" id="badge-' + sc.id + '"></span>' +
      '<button class="btn xs rm-scale" data-sid="' + sc.id + '">Bỏ</button>' +
      '<span class="caret">▾</span></div></div>';
    h += '<div class="scale-body">';
    h += '<div class="meta-line">' +
      (sc.ref ? '<span>' + g.PHCN.icon('book', 14) + ' ' + esc(sc.ref) + '</span>' : '') +
      (sc.minutes ? '<span>' + g.PHCN.icon('calendar', 14) + ' ' + esc(sc.minutes) + '</span>' : '') +
      (sc.mcid ? '<span>' + g.PHCN.icon('target', 14) + ' ' + esc(sc.mcid) + '</span>' : '') +
      (sc.noTotal ? '' : '<span>' + g.PHCN.icon('chart', 14) + ' Thang điểm ' + (sc.min || 0) + '–' + sc.max +
        (sc.reverse ? ' (điểm càng cao càng nặng)' : ' (điểm càng cao càng tốt)') + '</span>') +
      '</div>';
    h += scaleFigureHTML(sc);

    (sc.sections || []).forEach(function (sec) {
      var mx = sectionMax(sec);
      h += '<fieldset class="sect"><legend>' + esc(sec.title) + '</legend>';
      h += '<div class="sect-head"><span class="sect-cols"><i>Điểm</i></span>' +
        '<span class="sect-sum" id="sum-' + domId(sc.id, sec.id) + '">' +
        (mx ? 'Điểm phần này: <b>—</b> / ' + mx : '<span class="dim">Phần ghi nhận, không cộng điểm</span>') + '</span></div>';

      (sec.items || []).forEach(function (item) {
        var key = sec.id + '.' + item.id;
        var val = values[key];
        var filled = (val !== undefined && val !== null && val !== '');
        var did = domId(sc.id, key);
        h += '<div class="item' + (filled ? ' filled' : '') + '" id="row-' + did + '">';
        h += '<div class="item-label">' + esc(item.label) +
          (item.help ? '<span class="help" title="' + esc(item.help) + '">?</span>' : '') + '</div>';
        if (item.type === 'bodymap') {
          h += '<div class="item-input bm-input"><input type="hidden" data-sid="' + sc.id + '" data-key="' + key + '" ' +
            'id="bm-' + did + '" value="' + esc(val === undefined ? '' : val) + '">' +
            '<span class="bm-list" id="bmlist-' + did + '"></span></div>';
        } else if (item.type === 'number') {
          h += '<div class="item-input"><input class="inp num" type="number" data-sid="' + sc.id + '" data-key="' + key + '" ' +
            (item.min !== undefined ? 'min="' + item.min + '" ' : '') + (item.max !== undefined ? 'max="' + item.max + '" ' : '') +
            (item.step !== undefined ? 'step="' + item.step + '" ' : 'step="any" ') +
            'value="' + esc(val === undefined ? '' : val) + '">' +
            (item.unit ? '<span class="unit">' + esc(item.unit) + '</span>' : '') + '</div>';
        } else {
          h += '<div class="item-input"><select class="inp" data-sid="' + sc.id + '" data-key="' + key + '">' +
            '<option value="">— Chưa chấm —</option>' +
            item.options.map(function (o) {
              var ov = item.text ? o.l : o.v;
              return '<option value="' + esc(ov) + '"' + (String(val) === String(ov) ? ' selected' : '') + '>' + esc(o.l) + '</option>';
            }).join('') + '</select></div>';
        }
        h += '<div class="item-pts" id="pt-' + did + '"><i>—</i></div>';
        if (item.help) h += '<div class="item-help">' + esc(item.help) + '</div>';
        if (item.type === 'bodymap') {
          h += '<div class="item-fig wide" data-bmhost="' + did + '">' + FIG.bodyMap(val, did) + '</div>';
        } else if (item.fig) {
          h += '<div class="item-fig" id="ifig-' + did + '">' + itemFigureHTML(item, val) + '</div>';
        }
        h += '</div>';
      });
      h += '</fieldset>';
    });
    h += '<div class="scale-result" id="res-' + sc.id + '"></div>';
    h += '</div></section>';
    return h;
  }

  function resultHTML(sc, r) {
    if (sc.noTotal) {
      var ex = '';
      return '<div class="res-box"><div class="res-main"><span class="dim">Bộ đo lường khách quan — không tính tổng điểm.</span>' +
        '<span class="chip">Đã nhập ' + r.answered + '/' + r.itemCount + ' mục</span></div></div>';
    }
    var h = '<div class="res-box' + (r.interp ? ' ' + r.interp.cls : '') + '">';
    h += '<div class="res-main"><div class="res-score"><b>' + (r.total === null ? '—' : r.total) + '</b>' + (sc.max ? '<span>/' + sc.max + '</span>' : '') + '</div>';
    h += '<div class="res-text"><div class="res-label">' + (r.interp ? esc(r.interp.label) : 'Chưa đủ dữ liệu') + '</div>' +
      (r.interp && r.interp.text ? '<div class="res-note">' + esc(r.interp.text) + '</div>' : '') +
      '<div class="res-prog">Đã hoàn thành ' + r.answered + '/' + r.itemCount + ' mục (' + r.completion + '%)</div></div></div>';
    if (FIG && sc.interpret && sc.max) {
      h += '<div class="res-ruler">' + FIG.bandRuler(sc, r.total) + '</div>';
    }
    if (r.subs && r.subs.length) {
      h += '<div class="res-subs">' + r.subs.map(function (s) { return barRow(s.name, s.value, s.max); }).join('') + '</div>';
    }
    var keys = Object.keys(r.extra || {});
    if (keys.length) {
      h += '<div class="res-extra">' + keys.map(function (k) { return '<span><i>' + esc(k) + '</i> <b>' + esc(r.extra[k]) + '</b></span>'; }).join('') + '</div>';
    }
    h += '</div>';
    return h;
  }

  /* =======================================================================
   *  TRANG: THƯ VIỆN THANG ĐIỂM
   * ===================================================================== */
  route('library', function (view, parts, query) {
    setHeader('Thư viện thang điểm', ORDER.length + ' công cụ lượng hóa · tra cứu mục chấm điểm, ngưỡng diễn giải và tài liệu gốc');
    var gsel = query.group || '';
    var html = '<div class="page-head"><div><h1>Thư viện thang điểm</h1>' +
      '<p class="sub">' + ORDER.length + ' công cụ lượng hóa được tổ chức theo nhóm bệnh lý và theo phân loại ICF. Có thể in phiếu trắng để thu thập tại giường bệnh.</p></div>' +
      '<div class="head-actions"><button class="btn" onclick="window.print()">' + ico('print', 17) + ' In trang này</button></div></div>';

    html += '<div class="card"><div class="filters">' +
      '<select id="lib-group" class="inp"><option value="">— Tất cả nhóm bệnh lý —</option>' +
      GROUPS.map(function (x) { return '<option value="' + x.id + '"' + (x.id === gsel ? ' selected' : '') + '>' + x.icon + ' ' + esc(x.name) + '</option>'; }).join('') + '</select>' +
      '<input id="lib-search" class="inp" type="search" placeholder="Tìm tên thang điểm, viết tắt…">' +
      '</div><div id="lib-body"></div></div>';
    view.innerHTML = html;

    function draw() {
      var gid = $('#lib-group').value, kw = ($('#lib-search').value || '').toLowerCase().trim();
      var ids = ORDER.filter(function (id) {
        var sc = REG[id];
        if (gid && sc.groups.indexOf(gid) < 0) return false;
        if (kw && (sc.name + ' ' + sc.short + ' ' + (sc.note || '')).toLowerCase().indexOf(kw) < 0) return false;
        return true;
      });
      if (!ids.length) { $('#lib-body').innerHTML = '<p class="empty">Không tìm thấy thang điểm phù hợp.</p>'; return; }
      var h = '<div class="lib-list">';
      ids.forEach(function (id) {
        var sc = REG[id];
        var nItems = ST.itemsOf(sc).length;
        h += '<details class="lib-item"><summary><span class="li-short">' + esc(sc.short) + '</span>' +
          '<span class="li-name">' + esc(sc.name) + '</span>' +
          '<span class="li-meta">' + (sc.noTotal ? 'đo lường' : '0–' + sc.max + ' điểm') + ' · ' + nItems + ' mục · ' + esc(sc.minutes || '') + '</span></summary>' +
          '<div class="li-body"><p class="li-note">' + esc(sc.note || '') + '</p>' +
          '<div class="meta-line">' + (sc.ref ? '<span>📖 ' + esc(sc.ref) + '</span>' : '') +
          (sc.mcid ? '<span>🎯 ' + esc(sc.mcid) + '</span>' : '') +
          '<span>🏷 ' + esc(DOMAINS[sc.domain] || '') + '</span>' +
          '<span>👥 ' + sc.groups.map(function (x) { var G = groupById(x); return G ? G.short : x; }).join(', ') + '</span></div>';
        (sc.sections || []).forEach(function (s) {
          h += '<div class="li-sec"><h4>' + esc(s.title) + '</h4><ol class="li-items">';
          (s.items || []).forEach(function (i) {
            h += '<li><span>' + esc(i.label) + '</span>' +
              (i.options ? '<em>' + i.options.map(function (o) { return esc(o.l); }).join(' · ') + '</em>' :
                '<em>Nhập số' + (i.unit ? ' (' + esc(i.unit) + ')' : '') + '</em>') + '</li>';
          });
          h += '</ol></div>';
        });
        h += scaleFigureHTML(sc);
        if (sc.interpret && sc.max) {
          h += '<div class="li-sec"><h4>Dải ngưỡng diễn giải</h4>' +
            '<div class="fig-wrap">' + FIG.bandRuler(sc, null) + '</div>' +
            '<div class="interp-demo">' + interpDemo(sc) + '</div></div>';
        }
        h += '</div></details>';
      });
      h += '</div>';
      $('#lib-body').innerHTML = h;
    }
    $('#lib-group').addEventListener('change', draw);
    $('#lib-search').addEventListener('input', draw);
    draw();
  });

  function interpDemo(sc) {
    if (!sc.max || sc.noTotal) return '';
    var seen = {}, out = [];
    for (var v = (sc.min || 0); v <= sc.max; v++) {
      var ip = sc.interpret(v);
      if (!ip) continue;
      if (!seen[ip.label]) { seen[ip.label] = { from: v, to: v, cls: ip.cls, text: ip.text }; out.push(ip.label); }
      else seen[ip.label].to = v;
    }
    return out.map(function (lb) {
      var o = seen[lb];
      return '<span class="score ' + o.cls + '">' + o.from + (o.to !== o.from ? '–' + o.to : '') + ': ' + esc(lb) + '</span>';
    }).join('');
  }

  /* =======================================================================
   *  TRANG: XUẤT DỮ LIỆU
   * ===================================================================== */
  route('export', function (view) {
    setHeader('Dữ liệu nghiên cứu', 'Xuất CSV dạng rộng, từ điển biến số và sao lưu JSON');
    var ps = ST.patients(), as = ST.assessments();
    var html = '<div class="page-head"><div><h1>Xuất dữ liệu nghiên cứu</h1>' +
      '<p class="sub">Xuất bảng số liệu dạng rộng (mỗi dòng = một lượt đánh giá) để phân tích bằng SPSS, R, Stata hoặc Excel.</p></div></div>';

    html += '<div class="card"><h2>Bộ lọc</h2><div class="grid-3">' +
      '<div class="field"><label>Nhóm bệnh lý</label><select class="inp" id="ex-group"><option value="">— Tất cả —</option>' +
      realGroups().map(function (x) { return '<option value="' + x.id + '">' + x.icon + ' ' + esc(x.name) + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label>Từ ngày</label><input class="inp" type="date" id="ex-from"></div>' +
      '<div class="field"><label>Đến ngày</label><input class="inp" type="date" id="ex-to"></div></div>' +
      '<label class="switch"><input type="checkbox" id="ex-items" checked> Xuất chi tiết từng mục (item-level) — khuyến nghị cho nghiên cứu</label>' +
      '<div class="form-actions">' +
      '<button class="btn primary" id="ex-csv">' + ico('download', 17) + ' Tải CSV số liệu</button>' +
      '<button class="btn" id="ex-codebook">' + ico('book', 17) + ' Tải từ điển biến số (codebook)</button>' +
      '<button class="btn" id="ex-json">' + ico('download', 17) + ' Sao lưu toàn bộ (JSON)</button>' +
      '</div><p class="hint" id="ex-info"></p></div>';

    html += '<div class="card"><h2>Nhập / khôi phục dữ liệu</h2>' +
      '<p class="hint">Chọn file JSON đã sao lưu trước đó. Chế độ <b>gộp</b> chỉ thêm bản ghi chưa tồn tại; chế độ <b>thay thế</b> ghi đè toàn bộ dữ liệu hiện tại.</p>' +
      '<div class="filters"><input type="file" id="im-file" accept=".json" class="inp">' +
      '<select id="im-mode" class="inp"><option value="merge">Gộp dữ liệu</option><option value="replace">Thay thế toàn bộ</option></select>' +
      '<button class="btn" id="im-run">Nhập dữ liệu</button></div></div>';

    html += '<div class="card"><h2>Thống kê mô tả nhanh</h2><div id="desc"></div></div>';

    html += '<div class="card danger-zone"><h2>Vùng nguy hiểm</h2>' +
      '<p class="hint">Dữ liệu được lưu trong trình duyệt của máy này (localStorage). Xóa dữ liệu trình duyệt hoặc dùng chế độ ẩn danh sẽ làm mất dữ liệu. <b>Hãy sao lưu JSON định kỳ.</b></p>' +
      '<button class="btn danger" id="wipe">Xóa toàn bộ dữ liệu</button></div>';

    view.innerHTML = html;

    function opts() {
      return { group: $('#ex-group').value, from: $('#ex-from').value, to: $('#ex-to').value, items: $('#ex-items').checked };
    }
    function refresh() {
      var r = ST.exportCSV(opts());
      $('#ex-info').innerHTML = 'Kết quả bộ lọc: <b>' + r.rows + '</b> lượt đánh giá × <b>' + r.cols + '</b> biến số. Tổng cơ sở dữ liệu: ' + ps.length + ' bệnh nhân, ' + as.length + ' lượt đánh giá.';
    }
    ['ex-group', 'ex-from', 'ex-to', 'ex-items'].forEach(function (id) { $('#' + id).addEventListener('change', refresh); });
    refresh();

    $('#ex-csv').addEventListener('click', function () {
      var r = ST.exportCSV(opts());
      if (!r.rows) { toast('Không có dữ liệu phù hợp bộ lọc.', 'warn'); return; }
      ST.download('phcn_dulieu_' + today() + '.csv', r.csv, 'text/csv');
      toast('Đã tải xuống ' + r.rows + ' dòng dữ liệu.');
    });
    $('#ex-codebook').addEventListener('click', function () {
      ST.download('phcn_codebook_' + today() + '.csv', ST.exportCodebook(), 'text/csv');
      toast('Đã tải từ điển biến số.');
    });
    $('#ex-json').addEventListener('click', function () {
      ST.download('phcn_saoluu_' + today() + '.json', ST.exportJSON(), 'application/json');
      toast('Đã sao lưu toàn bộ dữ liệu.');
    });
    $('#im-run').addEventListener('click', function () {
      var f = $('#im-file').files[0];
      if (!f) { toast('Chọn file JSON trước.', 'err'); return; }
      var mode = $('#im-mode').value;
      if (mode === 'replace' && !confirm('Thay thế TOÀN BỘ dữ liệu hiện tại? Thao tác không thể hoàn tác.')) return;
      var rd = new FileReader();
      rd.onload = function () {
        try {
          var r = ST.importJSON(rd.result, mode);
          toast('Đã nhập ' + r.patients + ' bệnh nhân, ' + r.assessments + ' lượt đánh giá.');
          render();
        } catch (e) { toast('Lỗi: ' + e.message, 'err'); }
      };
      rd.readAsText(f);
    });
    $('#wipe').addEventListener('click', function () {
      if (!confirm('XÓA TOÀN BỘ dữ liệu bệnh nhân và đánh giá trên máy này?')) return;
      if (!confirm('Xác nhận lần cuối: dữ liệu sẽ mất vĩnh viễn nếu chưa sao lưu.')) return;
      ST.clearAll(); toast('Đã xóa toàn bộ dữ liệu.', 'warn'); render();
    });

    /* Thống kê mô tả */
    var box = $('#desc');
    var rows = [];
    ORDER.forEach(function (sid) {
      var sc = REG[sid]; if (sc.noTotal) return;
      var vals = [];
      as.forEach(function (a) {
        if ((a.scaleIds || []).indexOf(sid) < 0) return;
        var r = ST.score(sc, (a.values || {})[sid] || {});
        if (r.total !== null) vals.push(r.total);
      });
      if (!vals.length) return;
      vals.sort(function (x, y) { return x - y; });
      var mean = vals.reduce(function (s, x) { return s + x; }, 0) / vals.length;
      var sd = Math.sqrt(vals.reduce(function (s, x) { return s + Math.pow(x - mean, 2); }, 0) / (vals.length > 1 ? vals.length - 1 : 1));
      var med = vals.length % 2 ? vals[(vals.length - 1) / 2] : (vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2;
      rows.push('<tr><td><b>' + esc(sc.short) + '</b> <span class="dim">' + esc(sc.name.split('(')[0].trim()) + '</span></td>' +
        '<td>' + vals.length + '</td><td>' + mean.toFixed(2) + '</td><td>' + sd.toFixed(2) + '</td>' +
        '<td>' + med + '</td><td>' + vals[0] + ' – ' + vals[vals.length - 1] + '</td></tr>');
    });
    box.innerHTML = rows.length
      ? '<div class="scroll-x"><table class="tbl"><thead><tr><th>Thang điểm</th><th>n</th><th>Trung bình</th><th>Độ lệch chuẩn</th><th>Trung vị</th><th>Nhỏ nhất – Lớn nhất</th></tr></thead><tbody>' + rows.join('') + '</tbody></table></div>'
      : '<p class="empty">Chưa có dữ liệu để thống kê.</p>';
  });

  /* =======================================================================
   *  TRANG: HƯỚNG DẪN
   * ===================================================================== */
  route('guide', function (view) {
    setHeader('Hướng dẫn sử dụng', 'Quy trình lượng giá, triển khai trên iPad và tổ chức dữ liệu nghiên cứu');
    view.innerHTML = document.getElementById('guide-tpl').innerHTML;
  });

  /* ---------------- Khởi động ---------------- */
  function banner(msg) {
    var b = document.getElementById('sys-banner');
    if (b) b.innerHTML = '<div class="sys-banner">' + msg + '</div>';
  }

  /* Không bao giờ để trang trắng: mọi lỗi đều hiện thông báo có thể đọc được */
  window.onerror = function (msg, src, line) {
    banner('Đã xảy ra lỗi khi chạy phần mềm: ' + esc(String(msg)) +
      ' (dòng ' + line + '). Hãy thử tải lại trang, hoặc mở bằng Chrome / Edge / Firefox bản mới.');
  };

  function boot() {
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
    var bg = document.getElementById('burger'), bd = document.getElementById('sb-backdrop');
    if (bg) bg.addEventListener('click', function () {
      var sb = document.getElementById('sidebar');
      var open = sb.className.indexOf('open') < 0;
      sb.className = 'sidebar' + (open ? ' open' : '');
      if (bd) bd.className = 'sb-backdrop' + (open ? ' on' : '');
    });
    if (bd) bd.addEventListener('click', closeSidebar);
    if (!ST.storageOK()) {
      banner('Trình duyệt đang chặn lưu trữ cục bộ nên dữ liệu <b>sẽ mất khi đóng tab</b>. ' +
        'Hãy tắt chế độ ẩn danh, hoặc mở phần mềm qua máy chủ nội bộ (chạy file Chay-may-chu.bat). ' +
        'Trước khi đóng, vào mục Dữ liệu nghiên cứu để sao lưu JSON.');
    }
    try {
      render();
    } catch (e) {
      banner('Không hiển thị được giao diện: ' + esc(e.message));
    }
  }

  window.addEventListener('hashchange', function () {
    try { render(); } catch (e) { banner('Lỗi khi mở trang: ' + esc(e.message)); }
  });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  g.PHCN.app = { render: render, navigate: navigate, toast: toast };

})(window);
