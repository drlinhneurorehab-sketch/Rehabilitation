/* =========================================================================
 * PHCN-METRICS · store.js
 * Lưu trữ cục bộ (localStorage) + bộ máy tính điểm + xuất dữ liệu
 * ========================================================================= */
(function (g) {
  'use strict';

  var KEY = 'phcn_metrics_db_v1';
  var DB = null;

  /* Một số trình duyệt / chế độ riêng tư chặn localStorage khi mở file trực tiếp.
     Khi đó chuyển sang bộ nhớ tạm để phần mềm vẫn chạy, kèm cảnh báo rõ ràng. */
  var MEM = {};
  var STORAGE_OK = true;
  var LS = (function () {
    try {
      var t = '__phcn_test__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
      return window.localStorage;
    } catch (e) {
      STORAGE_OK = false;
      return {
        getItem: function (k) { return Object.prototype.hasOwnProperty.call(MEM, k) ? MEM[k] : null; },
        setItem: function (k, v) { MEM[k] = String(v); },
        removeItem: function (k) { delete MEM[k]; }
      };
    }
  })();

  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  /* =====================================================================
   *  PHIÊN BẢN CẤU TRÚC DỮ LIỆU VÀ NÂNG CẤP
   *
   *  Mỗi lần đổi cấu trúc dữ liệu phải tăng SCHEMA_VERSION và viết thêm một
   *  bước trong MIGRATIONS. Không có khung này thì máy đang chạy bản cũ sẽ
   *  hỏng dữ liệu khi cập nhật phần mềm.
   *
   *  Quy ước: MIGRATIONS[n] nhận dữ liệu phiên bản n, trả về phiên bản n+1.
   * =================================================================== */
  var SCHEMA_VERSION = 2;

  var MIGRATIONS = {
    /* v1 → v2: thêm hai bộ dữ liệu phẳng.
       - notes: ghi chú bàn giao giữa các thành viên, gắn vào hồ sơ hoặc lượt
         đánh giá.
       - attachments: SIÊU DỮ LIỆU của ảnh và phiếu giấy. Tệp thật nằm ở kho
         ngoài (S3 / Drive / NAS / OneDrive); ở đây chỉ giữ đường dẫn, vì
         localStorage chỉ khoảng 5 MB, vài tấm ảnh là đầy.
       Để phẳng chứ không lồng vào patient/assessment để đồng bộ nhiều máy
       gộp được theo id, giống cách đang làm với patients và assessments. */
    1: function (db) {
      if (!Array.isArray(db.notes)) db.notes = [];
      if (!Array.isArray(db.attachments)) db.attachments = [];
      return db;
    }
  };

  function blank() {
    return {
      version: SCHEMA_VERSION, createdAt: new Date().toISOString(),
      patients: [], assessments: [], notes: [], attachments: [],
      settings: { site: '', researcher: '' }
    };
  }

  /** Bổ sung các trường còn thiếu, dùng cho cả dữ liệu mới lẫn dữ liệu nhập vào. */
  function normalize(db) {
    if (!Array.isArray(db.patients)) db.patients = [];
    if (!Array.isArray(db.assessments)) db.assessments = [];
    if (!Array.isArray(db.notes)) db.notes = [];
    if (!Array.isArray(db.attachments)) db.attachments = [];
    if (!db.settings) db.settings = { site: '', researcher: '' };
    return db;
  }

  /**
   * Nâng dữ liệu lên SCHEMA_VERSION. Sao lưu nguyên trạng trước khi nâng,
   * để còn đường lùi nếu bước nâng cấp có sai sót.
   * Ném lỗi nếu dữ liệu thuộc phiên bản mới hơn phần mềm — thà dừng lại còn
   * hơn hạ cấp và làm mất các trường chưa biết.
   */
  function migrate(db) {
    var v = Number(db.version) || 1;
    if (v > SCHEMA_VERSION) {
      throw new Error('Dữ liệu thuộc phiên bản ' + v + ', mới hơn phần mềm đang chạy (' +
        SCHEMA_VERSION + '). Hãy cập nhật phần mềm trước khi mở, nếu không sẽ mất dữ liệu.');
    }
    if (v === SCHEMA_VERSION) return normalize(db);

    try { LS.setItem(KEY + '__backup_v' + v, JSON.stringify(db)); }
    catch (e) { console.warn('Không sao lưu được trước khi nâng cấp:', e); }

    while (v < SCHEMA_VERSION) {
      var buoc = MIGRATIONS[v];
      if (typeof buoc !== 'function') {
        throw new Error('Thiếu bước nâng cấp dữ liệu từ phiên bản ' + v + ' lên ' + (v + 1) + '.');
      }
      db = buoc(db);
      v += 1;
      db.version = v;
    }
    console.info('Đã nâng cấp dữ liệu lên phiên bản ' + SCHEMA_VERSION + '.');
    return normalize(db);
  }

  /* Khi true: không được ghi đè localStorage, vì dữ liệu cũ chưa đọc được
     và ghi đè sẽ xoá mất bản gốc của người dùng. */
  var LOAD_FAILED = false;
  var LOAD_MESSAGE = '';

  function load() {
    if (DB) return DB;
    var raw = null;
    try { raw = LS.getItem(KEY); } catch (e) { raw = null; }
    if (!raw) { DB = blank(); return DB; }

    var parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      /* Dữ liệu hỏng: TUYỆT ĐỐI không ghi đè. Giữ nguyên bản gốc sang một
         khoá khác để còn cứu được, rồi chặn mọi lần ghi sau đó. */
      var khoaHong = KEY + '__corrupt_' + Date.now();
      try { LS.setItem(khoaHong, raw); } catch (e2) {}
      LOAD_FAILED = true;
      LOAD_MESSAGE = 'Không đọc được dữ liệu đã lưu (tệp hỏng). Bản gốc vẫn nằm ' +
        'trong trình duyệt ở khoá "' + khoaHong + '". Phần mềm tạm thời không ghi ' +
        'đè để tránh mất dữ liệu — hãy báo kỹ thuật trước khi nhập tiếp.';
      console.error(LOAD_MESSAGE, e);
      DB = blank();
      return DB;
    }

    try {
      DB = migrate(parsed);
    } catch (e) {
      LOAD_FAILED = true;
      LOAD_MESSAGE = e.message;
      console.error('Nâng cấp dữ liệu thất bại:', e);
      DB = normalize(parsed);   /* giữ nguyên dữ liệu, chỉ chặn ghi */
    }
    return DB;
  }

  function loadError() { return LOAD_FAILED ? LOAD_MESSAGE : ''; }

  function save() {
    if (LOAD_FAILED) {
      alert('KHÔNG GHI DỮ LIỆU để tránh xoá mất bản gốc.\n\n' + LOAD_MESSAGE);
      return false;
    }
    try {
      LS.setItem(KEY, JSON.stringify(load()));
      return true;
    } catch (e) {
      alert('KHÔNG LƯU ĐƯỢC DỮ LIỆU: ' + e.message + '\nDung lượng trình duyệt có thể đã đầy. Hãy xuất dữ liệu ra file JSON để sao lưu.');
      return false;
    }
  }

  /* ---------------- Bệnh nhân ---------------- */
  function patients() { return load().patients; }
  function getPatient(id) {
    var list = patients();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  /**
   * Tìm bệnh nhân theo mã hồ sơ (không phân biệt hoa thường, bỏ khoảng trắng thừa).
   * exceptId: bỏ qua chính hồ sơ đang sửa, để sửa mà không tự báo trùng với mình.
   * Mã hồ sơ là định danh dùng trong file xuất ra, nên trùng mã là hai người
   * bệnh khác nhau bị gộp làm một khi phân tích số liệu.
   */
  function findByCode(code, exceptId) {
    var c = String(code || '').trim().toLowerCase();
    if (!c) return null;
    var list = patients();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === exceptId) continue;
      if (String(list[i].code || '').trim().toLowerCase() === c) return list[i];
    }
    return null;
  }

  function upsertPatient(p) {
    var db = load();
    if (!p.id) {
      p.id = uid('bn');
      p.createdAt = new Date().toISOString();
      db.patients.push(p);
    } else {
      var old = getPatient(p.id);
      if (old) { for (var k in p) old[k] = p[k]; p = old; }
      else db.patients.push(p);
    }
    p.updatedAt = new Date().toISOString();
    save();
    return p;
  }
  function deletePatient(id) {
    var db = load();
    db.patients = db.patients.filter(function (p) { return p.id !== id; });
    db.assessments = db.assessments.filter(function (a) { return a.patientId !== id; });
    save();
  }

  /* ---------------- Lượt đánh giá ---------------- */
  function assessments() { return load().assessments; }
  function getAssessment(id) {
    var list = assessments();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function assessmentsOf(patientId) {
    return assessments().filter(function (a) { return a.patientId === patientId; })
      .sort(function (x, y) { return (x.date || '').localeCompare(y.date || ''); });
  }
  function upsertAssessment(a) {
    var db = load();
    if (!a.id) {
      a.id = uid('dg');
      a.createdAt = new Date().toISOString();
      db.assessments.push(a);
    } else {
      var old = getAssessment(a.id);
      if (old) { for (var k in a) old[k] = a[k]; a = old; }
      else db.assessments.push(a);
    }
    a.updatedAt = new Date().toISOString();
    save();
    return a;
  }
  function deleteAssessment(id) {
    var db = load();
    db.assessments = db.assessments.filter(function (a) { return a.id !== id; });
    save();
  }

  /* =======================================================================
   *  BỘ MÁY TÍNH ĐIỂM
   * ===================================================================== */

  /* Duyệt toàn bộ item của một thang: trả về [{key, item, section}] */
  function itemsOf(scale) {
    var out = [];
    (scale.sections || []).forEach(function (s) {
      (s.items || []).forEach(function (i) {
        out.push({ key: s.id + '.' + i.id, item: i, section: s });
      });
    });
    return out;
  }

  /* Item có tham gia cộng tổng không? */
  function isScorable(item) {
    if (item.text) return false;
    if (item.type === 'text' || item.type === 'textarea' || item.type === 'bodymap') return false;
    if (item.sum === false) return false;
    if (item.type === 'number') return item.sum === true;
    return true;   /* select mặc định có cộng */
  }

  function num(x) {
    if (x === undefined || x === null || x === '') return null;
    var n = Number(x);
    return isNaN(n) ? null : n;
  }

  /* Tính điểm một thang. values = { 'section.item': value } */
  function score(scale, values) {
    values = values || {};
    var list = itemsOf(scale);
    var answered = 0, scorables = 0, scorableAnswered = 0, sum = 0, hasAny = false;

    list.forEach(function (r) {
      var v = values[r.key];
      if (isScorable(r.item)) {
        scorables++;
        var n = num(v);
        if (n !== null) { sum += n; answered++; scorableAnswered++; hasAny = true; }
      } else if (v !== undefined && v !== '' && v !== null) {
        answered++;
      }
    });

    /* Đã có đủ dữ liệu để tính tổng chưa? Thang chỉ gồm ô nhập số
       (ví dụ WAB-AQ) thì căn cứ vào số mục đã nhập bất kỳ. */
    var enough = scorables > 0 ? scorableAnswered > 0 : answered > 0;

    var res = { total: null, max: scale.max || null, extra: {}, subs: [], answered: answered, scorables: scorables, itemCount: list.length };

    if (scale.noTotal) {
      res.total = null;
    } else if (typeof scale.compute === 'function') {
      /* compute nhận đối tượng values đã lọc bỏ mục text */
      var clean = {};
      list.forEach(function (r) { if (isScorable(r.item)) { var n = num(values[r.key]); if (n !== null) clean[r.key] = n; } });
      var raw = {};
      list.forEach(function (r) { var n = num(values[r.key]); if (n !== null) raw[r.key] = n; });
      var c = scale.compute(clean, raw, values);
      res.total = enough ? ((c && c.total !== undefined) ? c.total : sum) : null;
      if (c && c.extra && enough) res.extra = c.extra;
    } else {
      res.total = (hasAny && enough) ? Math.round(sum * 100) / 100 : null;
    }

    /* Tiểu thang */
    (scale.subscales || []).forEach(function (sub) {
      var s = 0, any = false;
      sub.items.forEach(function (k) {
        var n = num(values[k]);
        if (n !== null) { s += n; any = true; }
      });
      res.subs.push({ id: sub.id, name: sub.name, value: any ? Math.round(s * 100) / 100 : null, max: sub.max });
    });

    if (res.total !== null && typeof scale.interpret === 'function') {
      res.interp = scale.interpret(res.total);
    }
    res.completion = res.itemCount ? Math.round(answered / res.itemCount * 100) : 0;
    return res;
  }

  /* Tính lại toàn bộ kết quả của một lượt đánh giá */
  function scoreAssessment(a) {
    var R = g.PHCN.reg.REGISTRY, out = {};
    (a.scaleIds || []).forEach(function (sid) {
      var sc = R[sid];
      if (!sc) return;
      out[sid] = score(sc, (a.values || {})[sid] || {});
    });
    return out;
  }

  /* =======================================================================
   *  XUẤT DỮ LIỆU
   * ===================================================================== */

  function csvCell(v) {
    if (v === null || v === undefined) return '';
    var s = String(v);
    if (/[",\n;]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  var PATIENT_COLS = [
    ['code', 'ma_bn'], ['name', 'ho_ten'], ['sex', 'gioi'], ['age', 'tuoi'], ['dob', 'ngay_sinh'],
    ['groups', 'nhom_benh_ly'], ['dx', 'chan_doan'], ['side', 'ben_ton_thuong'],
    ['etiology', 'nguyen_nhan'], ['onset', 'ngay_khoi_phat'], ['admit', 'ngay_vao_vien'],
    ['edu', 'so_nam_hoc_van'], ['occupation', 'nghe_nghiep'], ['phone', 'dien_thoai'],
    ['studyArm', 'nhom_nghien_cuu'], ['studyId', 'ma_nghien_cuu'], ['notes', 'ghi_chu_bn']
  ];

  /* Xuất CSV dạng rộng: 1 dòng = 1 lượt đánh giá */
  function exportCSV(opts) {
    opts = opts || {};
    var R = g.PHCN.reg.REGISTRY;
    var rows = assessments().slice();
    if (opts.group) {
      rows = rows.filter(function (a) {
        var p = getPatient(a.patientId);
        return p && (p.groups || []).indexOf(opts.group) >= 0;
      });
    }
    if (opts.from) rows = rows.filter(function (a) { return (a.date || '') >= opts.from; });
    if (opts.to) rows = rows.filter(function (a) { return (a.date || '') <= opts.to; });

    /* Xác định tập cột */
    var scaleIds = [];
    rows.forEach(function (a) {
      (a.scaleIds || []).forEach(function (s) { if (scaleIds.indexOf(s) < 0) scaleIds.push(s); });
    });
    scaleIds.sort(function (x, y) { return g.PHCN.reg.ORDER.indexOf(x) - g.PHCN.reg.ORDER.indexOf(y); });

    var header = ['ma_luot_dg', 'ma_bn_he_thong'];
    PATIENT_COLS.forEach(function (c) { header.push(c[1]); });
    header.push('thoi_diem', 'ngay_danh_gia', 'nguoi_danh_gia', 'ngay_thu_tu_khoi_phat');

    var colMeta = [];   /* dùng cho codebook */
    scaleIds.forEach(function (sid) {
      var sc = R[sid]; if (!sc) return;
      if (!sc.noTotal) { header.push(sid + '_total'); colMeta.push([sid + '_total', sc.short + ' – tổng điểm', sc.name]); }
      (sc.subscales || []).forEach(function (sub) {
        header.push(sid + '_' + sub.id); colMeta.push([sid + '_' + sub.id, sc.short + ' – ' + sub.name, sc.name]);
      });
      if (opts.items !== false) {
        itemsOf(sc).forEach(function (r) {
          var col = sid + '_' + r.key.replace(/\./g, '_');
          header.push(col);
          colMeta.push([col, sc.short + ' – ' + r.item.label, sc.name]);
        });
      }
    });

    var lines = [header.map(csvCell).join(',')];

    rows.sort(function (x, y) { return (x.date || '').localeCompare(y.date || ''); }).forEach(function (a) {
      var p = getPatient(a.patientId) || {};
      var res = scoreAssessment(a);
      var line = [a.id, a.patientId];
      PATIENT_COLS.forEach(function (c) {
        var v = p[c[0]];
        if (c[0] === 'groups' && Array.isArray(v)) v = v.join('|');
        line.push(v === undefined ? '' : v);
      });
      var days = '';
      if (p.onset && a.date) {
        var d = (new Date(a.date) - new Date(p.onset)) / 86400000;
        if (!isNaN(d)) days = Math.round(d);
      }
      line.push(a.timepoint || '', a.date || '', a.assessor || '', days);

      scaleIds.forEach(function (sid) {
        var sc = R[sid]; if (!sc) return;
        var r = res[sid];
        var vals = (a.values || {})[sid] || {};
        if (!sc.noTotal) line.push(r ? (r.total === null ? '' : r.total) : '');
        (sc.subscales || []).forEach(function (sub) {
          var f = null;
          if (r) r.subs.forEach(function (s) { if (s.id === sub.id) f = s.value; });
          line.push(f === null || f === undefined ? '' : f);
        });
        if (opts.items !== false) {
          itemsOf(sc).forEach(function (it) {
            var v = vals[it.key];
            line.push(v === undefined || v === null ? '' : v);
          });
        }
      });
      lines.push(line.map(csvCell).join(','));
    });

    return { csv: '﻿' + lines.join('\r\n'), rows: rows.length, cols: header.length, colMeta: colMeta };
  }

  /* Bảng tổng kết của MỘT người bệnh: mỗi dòng là một thang điểm,
     mỗi cột là một lượt đánh giá — dạng dễ dán thẳng vào báo cáo. */
  function exportPatientSummaryCSV(pid) {
    var R = g.PHCN.reg.REGISTRY;
    var p = getPatient(pid);
    if (!p) return '';
    var as = assessmentsOf(pid);
    var results = as.map(function (a) { return scoreAssessment(a); });

    var lines = [];
    lines.push(['BANG TONG KET LUONG GIA CHUC NANG'].map(csvCell).join(','));
    lines.push(['Ma nguoi benh', p.code || '', 'Ho ten', p.name || ''].map(csvCell).join(','));
    lines.push(['Chan doan', p.dx || '', 'Ngay khoi phat', p.onset || ''].map(csvCell).join(','));
    lines.push(['Nhom benh ly', (p.groups || []).join(' | '), 'So lan danh gia', as.length].map(csvCell).join(','));
    lines.push('');

    var head = ['Thang diem', 'Ten day du', 'Thang do'];
    as.forEach(function (a) {
      head.push(String(a.timepoint || '').split(' – ')[0] + ' (' + (a.date || '') + ')');
    });
    head.push('Thay doi cuoi - dau', 'Nguong MCID', 'Dat MCID');
    lines.push(head.map(csvCell).join(','));

    /* Số ngày kể từ khởi phát cho từng cột */
    var dayRow = ['Ngay thu ke tu khoi phat', '', ''];
    as.forEach(function (a) {
      var d = (p.onset && a.date) ? Math.round((new Date(a.date) - new Date(p.onset)) / 86400000) : '';
      dayRow.push(isNaN(d) ? '' : d);
    });
    dayRow.push('', '', '');
    lines.push(dayRow.map(csvCell).join(','));

    var scaleIds = [];
    as.forEach(function (a) { (a.scaleIds || []).forEach(function (s) { if (scaleIds.indexOf(s) < 0) scaleIds.push(s); }); });
    scaleIds.sort(function (x, y) { return g.PHCN.reg.ORDER.indexOf(x) - g.PHCN.reg.ORDER.indexOf(y); });

    scaleIds.forEach(function (sid) {
      var sc = R[sid];
      if (!sc || sc.noTotal) return;
      var vals = results.map(function (r) { return r[sid] ? r[sid].total : null; });
      var f = null, l = null;
      vals.forEach(function (v) { if (v !== null) { if (f === null) f = v; l = v; } });
      var d = (f !== null && l !== null) ? Math.round((l - f) * 100) / 100 : '';
      var hit = '';
      if (sc.mcidVal && d !== '') {
        hit = sc.reverse ? (d <= -sc.mcidVal ? 'Dat' : 'Chua dat')
                         : (d >= sc.mcidVal ? 'Dat' : 'Chua dat');
      }
      var row = [sc.short, sc.name, (sc.min || 0) + '-' + sc.max];
      vals.forEach(function (v) { row.push(v === null ? '' : v); });
      row.push(d, sc.mcidVal || '', hit);
      lines.push(row.map(csvCell).join(','));

      (sc.subscales || []).forEach(function (sub) {
        var srow = ['  ' + sc.short + ' / ' + sub.name, '', '0-' + sub.max];
        var sf = null, sl = null;
        results.forEach(function (r) {
          var v = null;
          if (r[sid]) r[sid].subs.forEach(function (x) { if (x.id === sub.id) v = x.value; });
          if (v !== null) { if (sf === null) sf = v; sl = v; }
          srow.push(v === null ? '' : v);
        });
        srow.push((sf !== null && sl !== null) ? Math.round((sl - sf) * 100) / 100 : '', '', '');
        lines.push(srow.map(csvCell).join(','));
      });
    });

    /* Các đo lường khách quan */
    scaleIds.forEach(function (sid) {
      var sc = R[sid];
      if (!sc || !sc.noTotal) return;
      itemsOf(sc).forEach(function (r) {
        var vv = as.map(function (a) {
          var v = ((a.values || {})[sid] || {})[r.key];
          return (v === undefined || v === '' || v === null) ? '' : v;
        });
        if (!vv.filter(function (x) { return x !== ''; }).length) return;
        var row = [sc.short + ' / ' + r.item.label, '', r.item.unit || ''];
        vv.forEach(function (v) { row.push(v); });
        if (r.item.type === 'number') {
          var nums = vv.filter(function (x) { return x !== ''; });
          row.push(nums.length >= 2 ? Math.round((Number(nums[nums.length - 1]) - Number(nums[0])) * 100) / 100 : '', '', '');
        } else {
          row.push('', '', '');
        }
        lines.push(row.map(csvCell).join(','));
      });
    });

    return '﻿' + lines.join('\r\n');
  }

  /* Từ điển biến số (codebook) */
  function exportCodebook() {
    var R = g.PHCN.reg.REGISTRY, lines = [['ten_bien', 'nhan_bien', 'thang_diem', 'loai', 'gia_tri_hop_le'].join(',')];
    PATIENT_COLS.forEach(function (c) {
      lines.push([c[1], 'Thông tin bệnh nhân: ' + c[0], 'Hành chính', 'văn bản/số', ''].map(csvCell).join(','));
    });
    ['thoi_diem', 'ngay_danh_gia', 'nguoi_danh_gia', 'ngay_thu_tu_khoi_phat'].forEach(function (c) {
      lines.push([c, 'Thông tin lượt đánh giá', 'Hành chính', 'văn bản/số', ''].map(csvCell).join(','));
    });
    g.PHCN.reg.ORDER.forEach(function (sid) {
      var sc = R[sid];
      if (!sc.noTotal) {
        lines.push([sid + '_total', sc.short + ' – tổng điểm', sc.name, 'số', '0–' + (sc.max || '')].map(csvCell).join(','));
      }
      (sc.subscales || []).forEach(function (sub) {
        lines.push([sid + '_' + sub.id, sc.short + ' – ' + sub.name, sc.name, 'số', '0–' + sub.max].map(csvCell).join(','));
      });
      itemsOf(sc).forEach(function (r) {
        var valid = '';
        if (r.item.options) valid = r.item.options.map(function (o) { return o.v; }).filter(function (v, i, arr) { return arr.indexOf(v) === i; }).join('; ');
        else if (r.item.type === 'number') valid = (r.item.min !== undefined ? r.item.min : '') + '–' + (r.item.max !== undefined ? r.item.max : '');
        lines.push([sid + '_' + r.key.replace(/\./g, '_'), r.item.label, sc.name, r.item.type === 'number' ? 'số' : 'phân loại', valid].map(csvCell).join(','));
      });
    });
    return '﻿' + lines.join('\r\n');
  }

  function exportJSON() { return JSON.stringify(load(), null, 2); }

  function importJSON(text, mode) {
    var data = JSON.parse(text);
    if (!data || !Array.isArray(data.patients)) throw new Error('File không đúng định dạng dữ liệu PHCN-METRICS.');
    var db = load();
    if (mode === 'replace') {
      /* File sao lưu có thể thuộc phiên bản cũ hơn — phải nâng cấp, nếu không
         sẽ ghi đè dữ liệu hiện tại bằng cấu trúc cũ thiếu trường. */
      DB = migrate(data);
      save();
      return { patients: DB.patients.length, assessments: DB.assessments.length };
    }
    data = migrate(data);
    var pAdd = 0, aAdd = 0;
    var pIds = {}; db.patients.forEach(function (p) { pIds[p.id] = true; });
    data.patients.forEach(function (p) { if (!pIds[p.id]) { db.patients.push(p); pAdd++; } });
    var aIds = {}; db.assessments.forEach(function (a) { aIds[a.id] = true; });
    (data.assessments || []).forEach(function (a) { if (!aIds[a.id]) { db.assessments.push(a); aAdd++; } });
    /* Gộp cả ghi chú bàn giao và siêu dữ liệu tệp đính kèm, nếu không thì
       nhập từ máy khác sẽ mất hai phần này. */
    var nAdd = 0, tAdd = 0;
    var nIds = {}; db.notes.forEach(function (n) { nIds[n.id] = true; });
    (data.notes || []).forEach(function (n) { if (!nIds[n.id]) { db.notes.push(n); nAdd++; } });
    var tIds = {}; db.attachments.forEach(function (t) { tIds[t.id] = true; });
    (data.attachments || []).forEach(function (t) { if (!tIds[t.id]) { db.attachments.push(t); tAdd++; } });
    save();
    return { patients: pAdd, assessments: aAdd, notes: nAdd, attachments: tAdd };
  }

  function download(filename, content, mime) {
    var blob = new Blob([content], { type: (mime || 'text/plain') + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
  }

  function clearAll() {
    DB = blank();
    save();
  }

  g.PHCN = g.PHCN || {};
  g.PHCN.store = {
    storageOK: function () { return STORAGE_OK; },
    uid: uid, load: load, save: save,
    SCHEMA_VERSION: SCHEMA_VERSION, migrate: migrate, loadError: loadError,
    patients: patients, getPatient: getPatient, findByCode: findByCode,
    upsertPatient: upsertPatient, deletePatient: deletePatient,
    assessments: assessments, getAssessment: getAssessment, assessmentsOf: assessmentsOf,
    upsertAssessment: upsertAssessment, deleteAssessment: deleteAssessment,
    itemsOf: itemsOf, isScorable: isScorable, score: score, scoreAssessment: scoreAssessment,
    exportCSV: exportCSV, exportCodebook: exportCodebook, exportJSON: exportJSON, importJSON: importJSON,
    exportPatientSummaryCSV: exportPatientSummaryCSV,
    download: download, clearAll: clearAll
  };

})(window);
