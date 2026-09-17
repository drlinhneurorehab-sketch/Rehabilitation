/* =========================================================================
 * PHCN-METRICS · sync.js
 * ĐỒNG BỘ DỮ LIỆU VỀ MỘT NGUỒN TẬP TRUNG QUA INTERNET
 *
 * Phần mềm không gắn cứng với nhà cung cấp nào: người dùng tự nhập một
 * ĐỊA CHỈ NHẬN DỮ LIỆU (endpoint). Địa chỉ đó có thể là:
 *   · Google Apps Script Web App gắn với Google Sheet  (xem server/google-apps-script.gs)
 *   · Hàm edge của Supabase / Cloudflare Worker
 *   · Máy chủ riêng chạy server/test_server.py
 *
 * KHI CHƯA NHẬP ĐỊA CHỈ, PHẦN MỀM KHÔNG GỬI BẤT KỲ DỮ LIỆU NÀO RA NGOÀI.
 *
 * Giao thức: POST một đối tượng JSON, Content-Type là text/plain để tránh
 * yêu cầu kiểm tra CORS trước (preflight) — đây là cách Google Apps Script
 * chấp nhận dữ liệu từ trình duyệt.
 *
 *   Gửi đi:  { secret, action:'sync', site, since, patients:[…], assessments:[…] }
 *   Nhận về: { ok, serverTime, savedPatients, savedAssessments,
 *              patients:[…], assessments:[…] }
 *
 * Quy tắc gộp: khóa theo id, bản ghi nào có updatedAt mới hơn thì thắng.
 * ========================================================================= */
(function (g) {
  'use strict';

  var ST = null;                       /* gán khi khởi động */
  function store() { return g.PHCN.store; }

  /* ---------------- Cấu hình ---------------- */
  function cfg() {
    var db = store().load();
    if (!db.settings.sync) {
      db.settings.sync = { url: '', secret: '', site: '', since: '', lastSync: '', lastResult: '', auto: false };
    }
    return db.settings.sync;
  }
  function saveCfg(patch) {
    var c = cfg();
    for (var k in patch) c[k] = patch[k];
    store().save();
    return c;
  }
  function isConfigured() {
    var c = cfg();
    return !!(c.url && /^https?:\/\//i.test(c.url));
  }

  /* ---------------- Gộp dữ liệu ---------------- */
  function stamp(r) {
    return r && (r.updatedAt || r.createdAt) ? String(r.updatedAt || r.createdAt) : '';
  }
  /* Ghi các bản ghi từ máy chủ vào cơ sở dữ liệu tại chỗ.
     Trả về { added, updated, skipped } */
  function mergeInto(listName, incoming) {
    var db = store().load();
    var local = db[listName] || [];
    var index = {}, i;
    for (i = 0; i < local.length; i++) index[local[i].id] = i;

    var added = 0, updated = 0, skipped = 0;
    (incoming || []).forEach(function (rec) {
      if (!rec || !rec.id) { skipped++; return; }
      var at = index[rec.id];
      if (at === undefined) {
        local.push(rec); index[rec.id] = local.length - 1; added++;
      } else if (stamp(rec) > stamp(local[at])) {
        local[at] = rec; updated++;
      } else {
        skipped++;
      }
    });
    db[listName] = local;
    return { added: added, updated: updated, skipped: skipped };
  }

  /* Những bản ghi đã thay đổi kể từ mốc "since" của máy chủ */
  function changedSince(listName, since) {
    var list = store().load()[listName] || [];
    if (!since) return list.slice();
    return list.filter(function (r) { return stamp(r) > since; });
  }

  /* ---------------- Gọi máy chủ ---------------- */
  function request(payload, timeoutMs) {
    var c = cfg();
    return new Promise(function (resolve, reject) {
      if (!isConfigured()) { reject(new Error('Chưa nhập địa chỉ đồng bộ.')); return; }
      var done = false;
      var timer = setTimeout(function () {
        if (!done) { done = true; reject(new Error('Máy chủ không phản hồi sau ' + Math.round((timeoutMs || 30000) / 1000) + ' giây.')); }
      }, timeoutMs || 30000);

      fetch(c.url, {
        method: 'POST',
        /* text/plain để trình duyệt gửi thẳng, không cần bước kiểm tra CORS trước */
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        redirect: 'follow'
      }).then(function (res) {
        return res.text().then(function (t) { return { status: res.status, text: t }; });
      }).then(function (r) {
        if (done) return;
        done = true; clearTimeout(timer);
        var looksHtml = /^\s*(<!doctype|<html)/i.test(String(r.text));
        if (r.status < 200 || r.status >= 300) {
          reject(new Error(looksHtml
            ? 'Địa chỉ này trả về một trang web chứ không phải điểm nhận dữ liệu (mã ' + r.status + '). ' +
              'Kiểm tra lại URL — địa chỉ Google Apps Script phải kết thúc bằng /exec.'
            : 'Máy chủ trả về mã ' + r.status + '. ' + String(r.text).slice(0, 140)));
          return;
        }
        var data;
        try { data = JSON.parse(r.text); }
        catch (e) {
          reject(new Error(looksHtml
            ? 'Địa chỉ này trả về một trang web chứ không phải dữ liệu. Nếu dùng Google Apps Script, ' +
              'hãy chắc chắn đã Triển khai dạng "Ứng dụng web", quyền truy cập "Bất kỳ ai", ' +
              'và URL kết thúc bằng /exec.'
            : 'Máy chủ trả về dữ liệu không đọc được: ' + String(r.text).slice(0, 140)));
          return;
        }
        if (!data || data.ok === false) {
          reject(new Error(data && data.error ? data.error : 'Máy chủ từ chối yêu cầu.'));
          return;
        }
        resolve(data);
      })['catch'](function (e) {
        if (done) return;
        done = true; clearTimeout(timer);
        reject(new Error('Không kết nối được tới máy chủ. ' +
          'Kiểm tra mạng, địa chỉ đồng bộ và quyền truy cập của máy chủ. (' + e.message + ')'));
      });
    });
  }

  /* Kiểm tra kết nối: không gửi dữ liệu người bệnh */
  function test() {
    var c = cfg();
    return request({ secret: c.secret || '', action: 'ping', site: c.site || '' }, 20000)
      .then(function (data) {
        return {
          ok: true,
          message: 'Kết nối thành công' + (data.serverTime ? ' · giờ máy chủ ' + data.serverTime : '') +
            (data.totalPatients !== undefined ? ' · đang lưu ' + data.totalPatients + ' người bệnh, ' +
              (data.totalAssessments || 0) + ' lượt đánh giá' : '')
        };
      });
  }

  /* Đồng bộ hai chiều: gửi phần đã thay đổi, nhận phần mới từ máy chủ */
  function sync(opts) {
    opts = opts || {};
    var c = cfg();
    var since = opts.full ? '' : (c.since || '');
    var outP = changedSince('patients', since);
    var outA = changedSince('assessments', since);

    return request({
      secret: c.secret || '',
      action: 'sync',
      site: c.site || '',
      since: since,
      patients: outP,
      assessments: outA
    }, 60000).then(function (data) {
      var mp = mergeInto('patients', data.patients);
      var ma = mergeInto('assessments', data.assessments);
      store().save();
      var result = {
        sentPatients: outP.length,
        sentAssessments: outA.length,
        savedPatients: data.savedPatients === undefined ? outP.length : data.savedPatients,
        savedAssessments: data.savedAssessments === undefined ? outA.length : data.savedAssessments,
        newPatients: mp.added, updatedPatients: mp.updated,
        newAssessments: ma.added, updatedAssessments: ma.updated,
        serverTime: data.serverTime || ''
      };
      saveCfg({
        since: data.serverTime || c.since || '',
        lastSync: new Date().toISOString(),
        lastResult: 'Gửi ' + result.sentPatients + ' người bệnh / ' + result.sentAssessments +
          ' lượt · Nhận ' + (result.newPatients + result.updatedPatients) + ' người bệnh / ' +
          (result.newAssessments + result.updatedAssessments) + ' lượt'
      });
      return result;
    });
  }

  /* Gửi lại TOÀN BỘ dữ liệu (dùng khi nghi ngờ máy chủ thiếu bản ghi) */
  function pushAll() { return sync({ full: true }); }

  g.PHCN = g.PHCN || {};
  g.PHCN.sync = {
    cfg: cfg, saveCfg: saveCfg, isConfigured: isConfigured,
    test: test, sync: sync, pushAll: pushAll, mergeInto: mergeInto, changedSince: changedSince
  };

})(window);
