/* =========================================================================
 * PHCN TIM MẠCH — BA BIỂU MẪU PHỤ
 *   1. Biến cố bất lợi        (sheet BIEN_CO_BAT_LOI)
 *   2. Giờ-người tập luyện    (sheet GIO_NGUOI_TAP)
 *   3. Chỉ số chương trình    (sheet CHI_SO_CHUONG_TRINH)
 *
 * CÁCH DÙNG
 *   Tạo một dự án Apps Script mới (script.google.com), dán file này vào,
 *   rồi chạy hàm taoBaFormPhu. Xem Execution log để lấy 3 đường link.
 *
 * Ba biểu mẫu này ngắn nên chạy một lần là xong, không cần cơ chế chạy tiếp.
 * ======================================================================= */

function taoBaFormPhu() {
  var links = [];
  links.push(taoFormBienCo());
  links.push(taoFormGioNguoi());
  links.push(taoFormChiSo());
  Logger.log('HOÀN TẤT.\n' + links.join('\n'));
}

/* ------------------------------------------------------------------ */
/*  1. BIẾN CỐ BẤT LỢI — một biến cố = một lượt trả lời                */
/* ------------------------------------------------------------------ */
function taoFormBienCo() {
  var form = FormApp.create('Biến cố bất lợi — Nghiên cứu PHCN tim mạch');
  form.setDescription(
      'Ghi nhận từng biến cố bất lợi xảy ra trong chương trình phục hồi chức năng tim mạch.\n' +
      'MỘT BIẾN CỐ = MỘT LƯỢT TRẢ LỜI.\n\n' +
      'Biến cố nghiêm trọng (SAE) phải báo Hội đồng Đạo đức theo quy định của đề cương.')
      .setProgressBar(true)
      .setAllowResponseEdits(true);

  form.addTextItem().setTitle('Mã nghiên cứu')
      .setHelpText('Đúng mã đã dùng trong phiếu nhập liệu, ví dụ HF-CR-001.')
      .setRequired(true);

  form.addDateItem().setTitle('Ngày xảy ra').setRequired(true);
  form.addTimeItem().setTitle('Giờ xảy ra');

  form.addTextItem().setTitle('Buổi tập thứ')
      .setValidation(FormApp.createTextValidation()
        .setHelpText('Nhập số buổi tập, 0–36.')
        .requireNumberBetween(0, 36).build());

  form.addListItem().setTitle('Thời điểm').setChoiceValues([
    '1 – Trong buổi tập',
    '2 – ≤3 giờ sau tập',
    '3 – >3 giờ sau tập',
    '4 – Không liên quan'
  ]);

  form.addListItem().setTitle('Hoạt động').setChoiceValues([
    '1 – Khởi động', '2 – Sức bền', '3 – Kháng lực',
    '4 – Thả lỏng', '5 – Nghỉ sau tập', '6 – Nghiệm pháp gắng sức'
  ]);

  form.addListItem().setTitle('Loại biến cố').setRequired(true).setChoiceValues([
    '1 – Tử vong', '2 – Ngừng tuần hoàn', '3 – NMCT', '4 – Đau ngực không ổn định',
    '5 – Suy tim nặng lên', '6 – Rối loạn nhịp nặng', '7 – Sốc ICD',
    '8 – Đột quỵ/TIA', '9 – Tụt HA có triệu chứng', '10 – Ngất',
    '11 – Gãy xương hông/khung chậu', '12 – Ngã khác',
    '13 – Hạ đường huyết', '14 – Khác'
  ]);

  form.addListItem().setTitle('Mức độ nặng').setRequired(true).setChoiceValues([
    '1 – Nhẹ', '2 – Trung bình', '3 – Nặng',
    '4 – Đe doạ tính mạng', '5 – Tử vong'
  ]);

  form.addListItem().setTitle('SAE (biến cố nghiêm trọng)').setRequired(true)
      .setHelpText('Tử vong, đe doạ tính mạng, phải nhập viện hoặc kéo dài nằm viện, ' +
                   'tàn tật vĩnh viễn — đều tính là SAE.')
      .setChoiceValues(['0 – Không', '1 – Có']);

  form.addListItem().setTitle('Liên quan tập luyện').setChoiceValues([
    '1 – Chắc chắn', '2 – Nhiều khả năng', '3 – Có thể',
    '4 – Ít khả năng', '5 – Không'
  ]);

  form.addParagraphTextItem().setTitle('Xử trí');

  form.addListItem().setTitle('Kết cục').setChoiceValues([
    '1 – Hồi phục hoàn toàn', '2 – Hồi phục có di chứng',
    '3 – Đang tiếp diễn', '4 – Tử vong'
  ]);

  form.addListItem().setTitle('Quyết định').setChoiceValues([
    '1 – Tiếp tục', '2 – Điều chỉnh đơn tập',
    '3 – Tạm ngừng', '4 – Rút khỏi chương trình'
  ]);

  form.addListItem().setTitle('Đã báo Hội đồng Đạo đức')
      .setChoiceValues(['0 – Không / KAD', '1 – Có']);

  form.addParagraphTextItem().setTitle('Mô tả diễn biến').setRequired(true);
  form.addTextItem().setTitle('Người ghi nhận');

  Logger.log('Biến cố bất lợi: ' + form.getPublishedUrl());
  return 'Biến cố bất lợi: ' + form.getPublishedUrl();
}

/* ------------------------------------------------------------------ */
/*  2. GIỜ-NGƯỜI TẬP LUYỆN — một tháng = một lượt trả lời              */
/* ------------------------------------------------------------------ */
function taoFormGioNguoi() {
  var form = FormApp.create('Giờ-người tập luyện — Nghiên cứu PHCN tim mạch');
  form.setDescription(
      'Mẫu số để tính tần suất biến cố bất lợi trên 1.000 giờ-người, theo chuẩn ' +
      'báo cáo quốc tế. MỘT THÁNG = MỘT LƯỢT TRẢ LỜI.\n\n' +
      'Mốc so sánh: Nhật Bản 1 biến cố đe doạ tính mạng / 383.096 giờ-người ' +
      '(Saito và cs., 2014); Pháp ~1,3 biến cố nặng / 1.000.000 giờ-người ' +
      '(Pavy và cs., 2006).')
      .setAllowResponseEdits(true);

  form.addTextItem().setTitle('Tháng (mm/yyyy)').setRequired(true)
      .setValidation(FormApp.createTextValidation()
        .setHelpText('Nhập đúng dạng mm/yyyy, ví dụ 09/2026.')
        .requireTextMatchesPattern('^(0[1-9]|1[0-2])/20[0-9]{2}$').build());

  soNguyen(form, 'Số người bệnh đang tập', 0, 500, true);
  soNguyen(form, 'Tổng số buổi tập trong tháng', 0, 5000, true);

  form.addTextItem().setTitle('Thời lượng trung bình mỗi buổi (giờ)').setRequired(true)
      .setHelpText('Ví dụ 1 hoặc 1,5. Tổng giờ-người = số buổi × thời lượng, ' +
                   'do bảng tính tự tính.')
      .setValidation(FormApp.createTextValidation()
        .setHelpText('Khoảng hợp lệ 0,25 – 4 giờ.')
        .requireNumberBetween(0.25, 4).build());

  soNguyen(form, 'Số biến cố trong tháng', 0, 200, true);

  Logger.log('Giờ-người tập: ' + form.getPublishedUrl());
  return 'Giờ-người tập: ' + form.getPublishedUrl();
}

/* ------------------------------------------------------------------ */
/*  3. CHỈ SỐ CHƯƠNG TRÌNH — một tháng = một lượt trả lời              */
/* ------------------------------------------------------------------ */
function taoFormChiSo() {
  var form = FormApp.create('Chỉ số chương trình — Nghiên cứu PHCN tim mạch');
  form.setDescription(
      'Theo dõi chuỗi rơi rụng: đủ điều kiện → được giới thiệu → tham gia → ' +
      'hoàn thành. MỘT THÁNG = MỘT LƯỢT TRẢ LỜI.\n\n' +
      'Mốc phấn đấu năm 1: tỷ lệ giới thiệu ≥ 60%; tỷ lệ tham gia ≥ 40%; ' +
      'tỷ lệ hoàn thành ≥ 60%; thời gian chờ ≤ 14 ngày.\n' +
      'Bối cảnh toàn cầu: 30% được giới thiệu → 9% tham gia → <5% hoàn thành ' +
      '(Redfern và cs., 2026, Nat Rev Cardiol).')
      .setAllowResponseEdits(true);

  form.addTextItem().setTitle('Tháng (mm/yyyy)').setRequired(true)
      .setValidation(FormApp.createTextValidation()
        .setHelpText('Nhập đúng dạng mm/yyyy, ví dụ 09/2026.')
        .requireTextMatchesPattern('^(0[1-9]|1[0-2])/20[0-9]{2}$').build());

  soNguyen(form, 'Số người bệnh suy tim đủ điều kiện', 0, 2000, true);
  soNguyen(form, 'Số được giới thiệu', 0, 2000, true);
  soNguyen(form, 'Số tham gia ≥1 buổi', 0, 2000, true);
  soNguyen(form, 'Số hoàn thành ≥24 buổi', 0, 2000, true);
  soNguyen(form, 'Thời gian chờ trung bình (ngày)', 0, 365, false);

  Logger.log('Chỉ số chương trình: ' + form.getPublishedUrl());
  return 'Chỉ số chương trình: ' + form.getPublishedUrl();
}

/* ------------------------------------------------------------------ */
function soNguyen(form, tieuDe, min, max, batBuoc) {
  form.addTextItem().setTitle(tieuDe).setRequired(!!batBuoc)
      .setValidation(FormApp.createTextValidation()
        .setHelpText('Khoảng hợp lệ ' + min + ' – ' + max + '.')
        .requireNumberBetween(min, max).build());
}
