/**
 * =========================================================================
 * PHCN-METRICS · Máy chủ nhận dữ liệu tập trung bằng Google Apps Script
 * =========================================================================
 *
 * Toàn bộ dữ liệu từ mọi máy tính / iPad sẽ dồn về MỘT Google Sheet của bạn.
 * Miễn phí, không cần thuê máy chủ, chạy qua internet thông thường.
 *
 * ------------------------- CÀI ĐẶT (khoảng 10 phút) -----------------------
 *
 * 1. Vào https://sheets.google.com → tạo bảng tính mới, đặt tên
 *    ví dụ "PHCN - Du lieu nghien cuu".
 *
 * 2. Trên thanh menu chọn:  Tiện ích mở rộng → Apps Script
 *    Xóa hết nội dung mẫu, dán TOÀN BỘ file này vào.
 *
 * 3. Sửa dòng SECRET bên dưới thành một chuỗi bí mật của riêng bạn
 *    (chữ và số, không dấu, càng dài càng tốt). Ghi nhớ chuỗi này.
 *
 * 4. Bấm biểu tượng đĩa mềm để lưu.
 *
 * 5. Bấm nút xanh "Triển khai" (Deploy) → "Tùy chọn triển khai mới"
 *    → chọn loại "Ứng dụng web" (Web app), rồi đặt:
 *         Thực thi với tư cách : Tôi (chính bạn)
 *         Ai có quyền truy cập : Bất kỳ ai   ← BẮT BUỘC chọn mục này
 *    → Triển khai → Cho phép quyền truy cập khi Google hỏi.
 *
 * 6. Sao chép "URL ứng dụng web" hiện ra (dạng
 *    https://script.google.com/macros/s/AKfy.../exec )
 *
 * 7. Mở phần mềm PHCN-METRICS trên từng máy → trang "Dữ liệu nghiên cứu"
 *    → mục "Đồng bộ về nguồn tập trung" → dán URL và chuỗi bí mật
 *    → bấm "Kiểm tra kết nối" rồi "Đồng bộ ngay".
 *
 * LƯU Ý: mỗi lần sửa mã ở đây, phải "Triển khai → Quản lý các bản triển khai
 * → sửa (bút chì) → Phiên bản: Phiên bản mới → Triển khai" thì thay đổi mới
 * có hiệu lực. URL giữ nguyên.
 *
 * ------------------------------ BẢO MẬT ----------------------------------
 * Bất kỳ ai biết URL VÀ chuỗi bí mật đều gửi/nhận được dữ liệu. Vì vậy:
 *   · Không đăng URL và chuỗi bí mật lên nơi công khai.
 *   · Chỉ nhập MÃ NGƯỜI BỆNH ẨN DANH, không nhập họ tên thật khi làm nghiên cứu.
 *   · Việc đưa dữ liệu người bệnh lên dịch vụ bên thứ ba thường phải nêu
 *     trong đề cương gửi Hội đồng đạo đức.
 * =========================================================================
 */

/** ĐỔI chuỗi này thành mật khẩu của riêng bạn rồi triển khai lại. */
var SECRET = 'doi-chuoi-nay-thanh-mat-khau-cua-ban';

var SHEET_PATIENTS = 'NguoiBenh';
var SHEET_ASSESS = 'LuotDanhGia';
var SHEET_LOG = 'NhatKy';

/* ------------------------------------------------------------------ */

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');

    if (String(body.secret || '') !== String(SECRET)) {
      return json({ ok: false, error: 'Sai chuỗi bí mật. Kiểm tra lại mục "Chuỗi bí mật" trong phần mềm.' });
    }

    var action = body.action || 'sync';
    var now = new Date().toISOString();

    if (action === 'ping') {
      return json({
        ok: true, serverTime: now,
        totalPatients: countRows(SHEET_PATIENTS),
        totalAssessments: countRows(SHEET_ASSESS)
      });
    }

    var lock = LockService.getScriptLock();
    lock.waitLock(30000);                 /* tránh hai máy ghi cùng lúc */
    try {
      var savedP = upsert(SHEET_PATIENTS, body.patients || []);
      var savedA = upsert(SHEET_ASSESS, body.assessments || []);
      writeLog(body.site, savedP, savedA);

      var since = body.since || '';
      return json({
        ok: true,
        serverTime: now,
        savedPatients: savedP,
        savedAssessments: savedA,
        patients: readSince(SHEET_PATIENTS, since),
        assessments: readSince(SHEET_ASSESS, since)
      });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return json({ ok: false, error: 'Lỗi máy chủ: ' + err.message });
  }
}

/** Mở bằng trình duyệt để kiểm tra nhanh máy chủ có sống không. */
function doGet() {
  return json({
    ok: true,
    service: 'PHCN-METRICS sync',
    serverTime: new Date().toISOString(),
    totalPatients: countRows(SHEET_PATIENTS),
    totalAssessments: countRows(SHEET_ASSESS),
    note: 'Máy chủ đang hoạt động. Hãy dán URL này vào mục Đồng bộ của phần mềm.'
  });
}

/* ------------------------- Hàm phụ trợ ---------------------------- */

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (name === SHEET_LOG) {
      sh.appendRow(['thoi_diem', 'may_gui', 'so_nguoi_benh', 'so_luot_danh_gia']);
    } else {
      /* Cột 1 = id, cột 2 = updatedAt, cột 3 = toàn bộ bản ghi dạng JSON,
         các cột sau là bản trải phẳng để xem nhanh bằng mắt. */
      sh.appendRow(['id', 'updatedAt', 'du_lieu_json', 'ma_bn', 'ho_ten', 'nhom_benh_ly', 'ngay', 'thoi_diem']);
      sh.setFrozenRows(1);
    }
  }
  return sh;
}

function countRows(name) {
  var sh = sheet(name);
  return Math.max(0, sh.getLastRow() - 1);
}

/** Ghi mới hoặc cập nhật theo id; chỉ ghi đè khi updatedAt mới hơn. */
function upsert(name, records) {
  if (!records || !records.length) return 0;
  var sh = sheet(name);
  var last = sh.getLastRow();
  var ids = last > 1 ? sh.getRange(2, 1, last - 1, 2).getValues() : [];
  var index = {};
  for (var i = 0; i < ids.length; i++) index[String(ids[i][0])] = { row: i + 2, at: String(ids[i][1] || '') };

  var appended = [], saved = 0;
  for (var k = 0; k < records.length; k++) {
    var r = records[k];
    if (!r || !r.id) continue;
    var at = String(r.updatedAt || r.createdAt || '');
    var row = [r.id, at, JSON.stringify(r),
               r.code || '', r.name || '',
               (r.groups || []).join(' | '),
               r.date || '', r.timepoint || ''];
    var hit = index[String(r.id)];
    if (hit) {
      if (at >= hit.at) { sh.getRange(hit.row, 1, 1, row.length).setValues([row]); saved++; }
    } else {
      appended.push(row); saved++;
      index[String(r.id)] = { row: -1, at: at };
    }
  }
  if (appended.length) {
    sh.getRange(sh.getLastRow() + 1, 1, appended.length, appended[0].length).setValues(appended);
  }
  return saved;
}

/** Đọc các bản ghi có updatedAt mới hơn mốc "since". */
function readSince(name, since) {
  var sh = sheet(name);
  var last = sh.getLastRow();
  if (last < 2) return [];
  var vals = sh.getRange(2, 1, last - 1, 3).getValues();
  var out = [];
  for (var i = 0; i < vals.length; i++) {
    var at = String(vals[i][1] || '');
    if (since && at <= since) continue;
    try { out.push(JSON.parse(vals[i][2])); } catch (e) { /* bỏ qua dòng hỏng */ }
  }
  return out;
}

function writeLog(site, nP, nA) {
  try {
    sheet(SHEET_LOG).appendRow([new Date().toISOString(), site || '(không rõ)', nP, nA]);
  } catch (e) { /* không để lỗi nhật ký làm hỏng việc đồng bộ */ }
}
