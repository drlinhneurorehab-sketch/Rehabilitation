/* =========================================================================
 * PHCN TIM MẠCH — XỬ LÝ DỮ LIỆU TRẢ LỜI
 * TỰ ĐỘNG SINH bởi tools/gen_gs.py — đừng sửa tay.
 *
 * Script này đặt trong BẢNG TÍNH nhận câu trả lời (không phải trong biểu mẫu).
 *
 * CÁCH DÙNG
 *   1. Mở biểu mẫu → tab Câu trả lời → biểu tượng Sheets → tạo bảng tính.
 *   2. Trong bảng tính đó: Tiện ích mở rộng → Apps Script.
 *   3. Dán TOÀN BỘ file này vào, Lưu.
 *   4. Chạy hàm caiDat một lần (cấp quyền khi Google hỏi).
 *   5. Từ đó mỗi phiếu gửi lên sẽ tự dựng lại sheet PHAN_TICH.
 *
 * SHEET PHAN_TICH là bộ số liệu để phân tích: 128 cột đúng thứ tự và đúng mã
 * biến của sheet NHAP_LIEU trong file Excel gốc, đã đổi nhãn lựa chọn về mã số
 * và đã tính đủ 10 biến công thức. Tải về dạng CSV là nạp thẳng vào SPSS/Stata/R.
 * ======================================================================= */

/* Địa chỉ email nhận cảnh báo PHQ-9. Để trống '' nếu không muốn gửi. */
var EMAIL_CANH_BAO = '';

var THU_TU = ["ma_nc", "ngay_ttsl", "dtv", "dia_diem", "tuoi", "gioi", "nhom", "so_buoi", "so_buoi_gd", "tong_gio_tap", "met_gio_tuan", "thang_ket_thuc", "duy_tri_tap", "da_gioi_thieu", "nguon_gt", "chi_tra", "noi_cu_tru", "khoang_cach", "hoc_van", "nghe_nghiep", "hon_nhan", "song_mot_minh", "thu_nhap", "bhyt", "nam_cd", "thoi_gian_benh", "phan_nhom_ef", "nyha", "benh_nguyen", "pci", "cabg", "pt_van", "icd", "icd_nguong", "crt", "tha", "dtd", "rlm", "btm", "rung_nhi", "thieu_mau", "copd", "dot_quy", "cci", "hut_thuoc", "bao_nam", "ruou", "nv_12t", "nv_st_12t", "ngay_nam_vien", "cap_cuu_12t", "ucmc_arb", "arni", "chen_beta", "mra", "sglt2", "loi_tieu", "so_thuoc", "gdmt", "hatt", "hattr", "nhip_tim", "can_nang", "chieu_cao", "bmi", "vong_eo", "spo2", "ntprobnp", "hb", "ferritin", "tsat", "na", "k", "creatinin", "egfr", "hba1c", "ldl", "albumin", "lvef", "lvedd", "lavi", "e_e_prime", "tapse", "gls", "paps", "mwd1", "mwd2", "mwd", "mwd_dudoan", "mwd_pct", "borg_kt_sau", "borg_met_sau", "spo2_sau", "dung_som", "sppb_tb", "sppb_di", "sppb_ghe", "sppb", "tg_di_4m", "toc_do_di", "luc_nam", "thieu_co", "mip", "peak_vo2", "ve_vco2", "rer", "mlhfq_tc", "mlhfq_cx", "mlhfq", "clcs_kem", "eq5d_ma", "eq5d_index", "eq_vas", "phq9", "phq9_c9", "canh_bao_tt", "gad7", "ipaq_met", "ipaq_ngoi", "gmas", "hls", "crbs_nt", "crbs_bdm", "crbs_hc", "crbs_cv", "crbs_tong", "san_sang_mp", "ghi_chu"];

/* Mã biến -> tiêu đề câu hỏi trong biểu mẫu (dùng để dò cột). */
var TIEU_DE = {
 "ma_nc": "Mã nghiên cứu",
 "ngay_ttsl": "Ngày thu thập số liệu",
 "dtv": "Mã điều tra viên",
 "dia_diem": "Địa điểm thu thập",
 "tuoi": "Tuổi",
 "gioi": "Giới",
 "nhom": "Nhóm nghiên cứu",
 "so_buoi": "Số buổi tập có giám sát",
 "so_buoi_gd": "Số buổi giáo dục đã dự",
 "tong_gio_tap": "Tổng thời gian tập luyện",
 "met_gio_tuan": "Liều tập luyện",
 "thang_ket_thuc": "Thời gian từ khi kết thúc chương trình",
 "duy_tri_tap": "Hiện còn duy trì tập tại nhà",
 "da_gioi_thieu": "Đã từng được giới thiệu PHCNTM",
 "nguon_gt": "Nguồn giới thiệu",
 "chi_tra": "Hình thức chi trả",
 "noi_cu_tru": "Nơi cư trú",
 "khoang_cach": "Khoảng cách đến trung tâm",
 "hoc_van": "Trình độ học vấn",
 "nghe_nghiep": "Nghề nghiệp",
 "hon_nhan": "Tình trạng hôn nhân",
 "song_mot_minh": "Sống một mình",
 "thu_nhap": "Thu nhập hộ/tháng",
 "bhyt": "Có bảo hiểm y tế",
 "nam_cd": "Năm chẩn đoán suy tim",
 "thoi_gian_benh": "Thời gian mắc bệnh",
 "phan_nhom_ef": "Phân nhóm EF",
 "nyha": "Phân độ NYHA",
 "benh_nguyen": "Bệnh nguyên chính",
 "pci": "Tiền sử PCI",
 "cabg": "Tiền sử CABG",
 "pt_van": "Tiền sử phẫu thuật van tim",
 "icd": "Có ICD",
 "icd_nguong": "Ngưỡng nhịp kích hoạt sốc ICD",
 "crt": "Có CRT",
 "tha": "Tăng huyết áp",
 "dtd": "Đái tháo đường típ 2",
 "rlm": "Rối loạn lipid máu",
 "btm": "Bệnh thận mạn",
 "rung_nhi": "Rung nhĩ",
 "thieu_mau": "Thiếu máu",
 "copd": "COPD",
 "dot_quy": "Đột quỵ/TIA",
 "cci": "Chỉ số bệnh đồng mắc Charlson",
 "hut_thuoc": "Tình trạng hút thuốc",
 "bao_nam": "Số bao-năm",
 "ruou": "Uống rượu bia",
 "nv_12t": "Số lần nhập viện 12 tháng (mọi nguyên nhân)",
 "nv_st_12t": "Số lần nhập viện do suy tim 12 tháng",
 "ngay_nam_vien": "Tổng số ngày nằm viện 12 tháng",
 "cap_cuu_12t": "Số lần khám cấp cứu 12 tháng",
 "ucmc_arb": "Dùng ƯCMC/ARB",
 "arni": "Dùng ARNI",
 "chen_beta": "Dùng chẹn beta",
 "mra": "Dùng kháng MRA",
 "sglt2": "Dùng ức chế SGLT2",
 "loi_tieu": "Dùng lợi tiểu quai",
 "so_thuoc": "Tổng số loại thuốc đang dùng",
 "hatt": "Huyết áp tâm thu",
 "hattr": "Huyết áp tâm trương",
 "nhip_tim": "Nhịp tim lúc nghỉ",
 "can_nang": "Cân nặng",
 "chieu_cao": "Chiều cao",
 "vong_eo": "Vòng eo",
 "spo2": "SpO₂ khí trời lúc nghỉ",
 "ntprobnp": "NT-proBNP",
 "hb": "Hemoglobin",
 "ferritin": "Ferritin",
 "tsat": "Độ bão hoà transferrin",
 "na": "Natri",
 "k": "Kali",
 "creatinin": "Creatinin",
 "egfr": "eGFR (CKD-EPI)",
 "hba1c": "HbA1c",
 "ldl": "LDL-C",
 "albumin": "Albumin",
 "lvef": "LVEF (Simpson)",
 "lvedd": "LVEDD",
 "lavi": "Chỉ số thể tích nhĩ trái",
 "e_e_prime": "E/e′ trung bình",
 "tapse": "TAPSE",
 "gls": "GLS (nếu có)",
 "paps": "Áp lực ĐMP tâm thu ước tính",
 "mwd1": "6MWD lần đo 1",
 "mwd2": "6MWD lần đo 2",
 "mwd_dudoan": "6MWD dự đoán theo chuẩn Việt Nam",
 "borg_kt_sau": "Borg khó thở sau nghiệm pháp (lần đo dùng phân tích)",
 "borg_met_sau": "Borg mệt chi dưới sau nghiệm pháp",
 "spo2_sau": "SpO₂ thấp nhất trong nghiệm pháp",
 "dung_som": "Dừng sớm trước 6 phút",
 "sppb_tb": "Điểm thăng bằng SPPB",
 "sppb_di": "Điểm tốc độ đi bộ SPPB",
 "sppb_ghe": "Điểm đứng lên ngồi xuống SPPB",
 "tg_di_4m": "Thời gian đi bộ 4 m (tốt nhất)",
 "luc_nam": "Lực nắm tay (tối đa, tay thuận)",
 "mip": "MIP (nếu có)",
 "peak_vo2": "Peak VO₂ (CPET)",
 "ve_vco2": "Độ dốc VE/VCO₂",
 "rer": "RER tối đa",
 "mlhfq_tc": "MLHFQ — điểm thể chất",
 "mlhfq_cx": "MLHFQ — điểm cảm xúc",
 "mlhfq": "MLHFQ — TỔNG",
 "eq5d_ma": "EQ-5D-5L mã 5 chữ số",
 "eq5d_index": "EQ-5D-5L chỉ số hữu dụng (bộ giá trị VN)",
 "eq_vas": "EQ-VAS",
 "phq9": "PHQ-9 tổng",
 "phq9_c9": "PHQ-9 câu 9 (ý nghĩ tự hại)",
 "gad7": "GAD-7 tổng",
 "ipaq_met": "IPAQ-SF tổng",
 "ipaq_ngoi": "IPAQ-SF thời gian ngồi/ngày",
 "gmas": "GMAS tổng",
 "hls": "HLS-SF12 chỉ số",
 "crbs_nt": "CRBS-V — nhu cầu nhận thức/hệ thống y tế (TB)",
 "crbs_bdm": "CRBS-V — bệnh đồng mắc/chức năng (TB)",
 "crbs_hc": "CRBS-V — hậu cần (TB)",
 "crbs_cv": "CRBS-V — công việc/thời gian (TB)",
 "san_sang_mp": "Sẵn sàng tham gia nếu miễn phí + tại nhà",
 "ghi_chu": "Ghi chú"
};

var LA_LUA_CHON = ["dia_diem", "gioi", "nhom", "duy_tri_tap", "da_gioi_thieu", "nguon_gt", "chi_tra", "noi_cu_tru", "hoc_van", "nghe_nghiep", "hon_nhan", "song_mot_minh", "thu_nhap", "bhyt", "phan_nhom_ef", "nyha", "benh_nguyen", "pci", "cabg", "pt_van", "icd", "crt", "tha", "dtd", "rlm", "btm", "rung_nhi", "thieu_mau", "copd", "dot_quy", "hut_thuoc", "ruou", "ucmc_arb", "arni", "chen_beta", "mra", "sglt2", "loi_tieu", "dung_som", "san_sang_mp"];
var LA_NGAY = ["ngay_ttsl"];
var BIEN_TU_TINH = ["gdmt", "bmi", "mwd", "mwd_pct", "sppb", "toc_do_di", "thieu_co", "clcs_kem", "canh_bao_tt", "crbs_tong"];
var BO_LUOI = [
 {
  "id": "mlhfq",
  "tieu_de": "MLHFQ — Chất lượng cuộc sống suy tim Minnesota",
  "muc": [
   "Gây phù chân, mắt cá chân",
   "Buộc phải ngồi hoặc nằm nghỉ ban ngày",
   "Làm việc đi bộ hoặc leo cầu thang trở nên khó khăn",
   "Làm việc nhà trở nên khó khăn",
   "Khó đi xa khỏi nhà",
   "Khó ngủ ngon vào ban đêm",
   "Khó tham gia hoạt động cùng bạn bè, người thân",
   "Khó làm việc kiếm sống",
   "Khó tham gia giải trí, thể thao, sở thích",
   "Ảnh hưởng đến sinh hoạt tình dục",
   "Phải ăn kiêng những món yêu thích",
   "Gây khó thở",
   "Làm mệt mỏi, kiệt sức, thiếu năng lượng",
   "Phải nằm viện điều trị",
   "Tốn kém chi phí y tế",
   "Gây tác dụng phụ của thuốc",
   "Cảm thấy là gánh nặng cho gia đình, bạn bè",
   "Cảm thấy mất tự chủ trong cuộc sống",
   "Cảm thấy lo lắng",
   "Khó tập trung hoặc giảm trí nhớ",
   "Cảm thấy trầm cảm"
  ]
 },
 {
  "id": "phq9",
  "tieu_de": "PHQ-9 — Sàng lọc trầm cảm",
  "muc": [
   "Ít hứng thú hoặc không thấy vui thích khi làm việc gì",
   "Cảm thấy buồn, chán nản hoặc tuyệt vọng",
   "Khó ngủ, ngủ không yên giấc hoặc ngủ quá nhiều",
   "Cảm thấy mệt mỏi hoặc có ít năng lượng",
   "Ăn kém hoặc ăn quá nhiều",
   "Cảm thấy tự ti, thất bại, hoặc làm gia đình thất vọng",
   "Khó tập trung (đọc báo, xem tivi)",
   "Di chuyển hoặc nói chậm chạp bất thường / bồn chồn quá mức",
   "Có ý nghĩ muốn chết hoặc tự làm hại bản thân"
  ]
 },
 {
  "id": "gad7",
  "tieu_de": "GAD-7 — Sàng lọc lo âu lan tỏa",
  "muc": [
   "Cảm thấy bồn chồn, lo lắng hoặc căng thẳng",
   "Không thể ngừng lo lắng hoặc không kiểm soát được sự lo lắng",
   "Lo lắng quá nhiều về những chuyện khác nhau",
   "Khó thư giãn",
   "Bồn chồn đến mức khó ngồi yên",
   "Dễ bực bội hoặc cáu kỉnh",
   "Cảm thấy sợ hãi như thể điều gì tồi tệ sắp xảy ra"
  ]
 },
 {
  "id": "eq5d",
  "tieu_de": "EQ-5D-5L — Năm chiều sức khỏe HÔM NAY",
  "muc": [
   "Đi lại",
   "Tự chăm sóc (tắm, mặc quần áo)",
   "Sinh hoạt thường lệ (làm việc, việc nhà, giải trí)",
   "Đau / khó chịu",
   "Lo lắng / trầm cảm"
  ]
 }
];

/* ------------------------------------------------------------------ */
function caiDat() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'khiNhanPhieu') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('khiNhanPhieu').forSpreadsheet(ss).onFormSubmit().create();
  capNhatPhanTich();
  Logger.log('Đã cài đặt. Sheet PHAN_TICH sẽ tự cập nhật sau mỗi phiếu gửi lên.');
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('PHCN Tim mạch')
    .addItem('Dựng lại sheet PHAN_TICH', 'capNhatPhanTich')
    .addItem('Kiểm tra chất lượng số liệu', 'kiemTraChatLuong')
    .addItem('Cài đặt / cài lại trigger', 'caiDat')
    .addToUi();
}

function khiNhanPhieu(e) {
  capNhatPhanTich();
  guiCanhBao(e);
}

/* ------------------------------------------------------------------ */
/*  Dựng sheet PHAN_TICH                                               */
/* ------------------------------------------------------------------ */
function capNhatPhanTich() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var nguon = sheetTraLoi(ss);
  if (!nguon) { Logger.log('Chưa tìm thấy sheet câu trả lời.'); return; }

  var duLieu = nguon.getDataRange().getValues();
  if (duLieu.length < 1) return;
  var dauDe = duLieu[0].map(function (x) { return String(x).trim(); });
  var cot = {};
  dauDe.forEach(function (t, i) { if (!(t in cot)) cot[t] = i; });

  var ket = [THU_TU.slice()];
  for (var r = 1; r < duLieu.length; r++) {
    ket.push(doiMotDong(duLieu[r], cot));
  }

  var dich = ss.getSheetByName('PHAN_TICH') || ss.insertSheet('PHAN_TICH');
  dich.clear();
  dich.getRange(1, 1, ket.length, THU_TU.length).setValues(ket);
  dich.setFrozenRows(1);
  dich.getRange(1, 1, 1, THU_TU.length).setFontWeight('bold');
  Logger.log('PHAN_TICH: ' + (ket.length - 1) + ' phiếu.');
}

function doiMotDong(hang, cot) {
  var tho = {};
  /* Lấy giá trị theo tiêu đề câu hỏi. */
  Object.keys(TIEU_DE).forEach(function (ma) {
    var i = cot[TIEU_DE[ma]];
    tho[ma] = (i === undefined) ? '' : hang[i];
  });

  /* Đổi nhãn lựa chọn "1 – Nam" về mã số 1; giữ nguyên KAD. */
  LA_LUA_CHON.forEach(function (ma) {
    tho[ma] = veMaSo(tho[ma]);
  });
  LA_NGAY.forEach(function (ma) {
    tho[ma] = dinhDangNgay(tho[ma]);
  });

  /* Cộng điểm các bộ câu hỏi dạng lưới. */
  BO_LUOI.forEach(function (bo) {
    var diem = bo.muc.map(function (m) {
      var i = cot[bo.tieu_de + ' [' + m + ']'];
      return (i === undefined) ? null : soHoa(hang[i]);
    });
    if (bo.id === 'mlhfq') {
      tho.mlhfq_tc = congMuc(diem, [2, 3, 4, 5, 6, 7, 12, 13]);
      tho.mlhfq_cx = congMuc(diem, [17, 18, 19, 20, 21]);
      tho.mlhfq = congMuc(diem, day(1, 21));
    } else if (bo.id === 'phq9') {
      tho.phq9 = congMuc(diem, day(1, 9));
      tho.phq9_c9 = diem[8] === null ? '' : diem[8];
    } else if (bo.id === 'gad7') {
      tho.gad7 = congMuc(diem, day(1, 7));
    } else if (bo.id === 'eq5d') {
      var ma = '';
      for (var k = 0; k < 5; k++) {
        if (diem[k] === null) { ma = ''; break; }
        ma += diem[k];
      }
      tho.eq5d_ma = ma;
    }
  });

  tinhBienCongThuc(tho);
  return THU_TU.map(function (ma) {
    var v = tho[ma];
    return (v === undefined || v === null) ? '' : v;
  });
}

/* ------------------------------------------------------------------ */
/*  10 biến tự tính — chép nguyên công thức sheet NHAP_LIEU            */
/* ------------------------------------------------------------------ */
function tinhBienCongThuc(r) {
  var n = soHoa;

  /* gdmt = MIN(1; ƯCMC/ARB + ARNI) + chẹn beta + MRA + SGLT2 */
  var a = n(r.ucmc_arb), b = n(r.arni), c = n(r.chen_beta),
      d = n(r.mra), e = n(r.sglt2);
  r.gdmt = (a === null || b === null || c === null || d === null || e === null)
    ? '' : Math.min(1, a + b) + c + d + e;

  /* bmi = cân nặng / (chiều cao mét)^2 */
  var w = n(r.can_nang), h = n(r.chieu_cao);
  r.bmi = (w === null || !h) ? '' : lamTron(w / Math.pow(h / 100, 2), 1);

  /* mwd = MAX(lần 1; lần 2) */
  var m1 = n(r.mwd1), m2 = n(r.mwd2);
  r.mwd = (m1 === null && m2 === null) ? ''
    : Math.max(m1 === null ? -Infinity : m1, m2 === null ? -Infinity : m2);

  /* mwd_pct = mwd / mwd_dudoan * 100 */
  var md = n(r.mwd), dd = n(r.mwd_dudoan);
  r.mwd_pct = (md === null || !dd) ? '' : lamTron(md / dd * 100, 1);

  /* sppb = tổng 3 phần, cần đủ cả 3 */
  var s1 = n(r.sppb_tb), s2 = n(r.sppb_di), s3 = n(r.sppb_ghe);
  r.sppb = (s1 === null || s2 === null || s3 === null) ? '' : s1 + s2 + s3;

  /* toc_do_di = 4 / thời gian đi 4 m */
  var t = n(r.tg_di_4m);
  r.toc_do_di = !t ? '' : lamTron(4 / t, 2);

  /* thieu_co theo AWGS 2019 */
  var grip = n(r.luc_nam), gioi = n(r.gioi), sp = n(r.toc_do_di);
  r.thieu_co = (grip === null || gioi === null) ? ''
    : (((gioi === 1 && grip < 28) || (gioi === 2 && grip < 18) ||
        (sp !== null && sp < 1)) ? 1 : 0);

  /* clcs_kem = MLHFQ > 45 */
  var ml = n(r.mlhfq);
  r.clcs_kem = ml === null ? '' : (ml > 45 ? 1 : 0);

  /* canh_bao_tt = PHQ-9 câu 9 >= 1 HOẶC tổng >= 15 */
  var pt = n(r.phq9), q9 = n(r.phq9_c9);
  r.canh_bao_tt = (pt === null && q9 === null) ? ''
    : (((q9 !== null && q9 >= 1) || (pt !== null && pt >= 15)) ? 'BÁO BS NGAY' : '-');

  /* crbs_tong = (NT*7 + BĐM*4 + HC*6 + CV*4) / 21 */
  var c1 = n(r.crbs_nt), c2 = n(r.crbs_bdm), c3 = n(r.crbs_hc), c4 = n(r.crbs_cv);
  r.crbs_tong = (c1 === null || c2 === null || c3 === null || c4 === null)
    ? '' : lamTron((c1 * 7 + c2 * 4 + c3 * 6 + c4 * 4) / 21, 2);
}

/* ------------------------------------------------------------------ */
/*  Kiểm tra chất lượng                                                */
/* ------------------------------------------------------------------ */
function kiemTraChatLuong() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pt = ss.getSheetByName('PHAN_TICH');
  if (!pt) { capNhatPhanTich(); pt = ss.getSheetByName('PHAN_TICH'); }
  var v = pt.getDataRange().getValues();
  var idx = {};
  v[0].forEach(function (t, i) { idx[t] = i; });

  var loi = [['Mã nghiên cứu', 'Vấn đề']];
  var daGap = {};

  for (var r = 1; r < v.length; r++) {
    var ma = String(v[r][idx.ma_nc] || '(chưa có mã)');
    var g = function (k) { return soHoa(v[r][idx[k]]); };

    if (daGap[ma]) loi.push([ma, 'Mã nghiên cứu bị trùng — có ' + (daGap[ma] + 1) + ' phiếu cùng mã']);
    daGap[ma] = (daGap[ma] || 0) + 1;

    var hatt = g('hatt'), hattr = g('hattr');
    if (hatt !== null && hattr !== null && hattr >= hatt) {
      loi.push([ma, 'Huyết áp tâm trương (' + hattr + ') ≥ tâm thu (' + hatt + ')']);
    }
    var lvef = g('lvef'), ef = g('phan_nhom_ef');
    if (lvef !== null && ef !== null) {
      var mong = lvef <= 40 ? 1 : (lvef < 50 ? 2 : 3);
      if (mong !== ef) {
        loi.push([ma, 'LVEF ' + lvef + '% không khớp phân nhóm EF đã chọn (gợi ý nhóm ' + mong + ')']);
      }
    }
    var nhom = g('nhom'), buoi = g('so_buoi');
    if (nhom !== null && buoi !== null) {
      if (nhom === 1 && buoi < 24) loi.push([ma, 'Nhóm A yêu cầu ≥ 24 buổi, đang ghi ' + buoi]);
      if (nhom === 4 && (buoi < 8 || buoi > 23)) loi.push([ma, 'Nhóm C là 8–23 buổi, đang ghi ' + buoi]);
      if ((nhom === 2 || nhom === 3) && buoi > 0) {
        loi.push([ma, 'Nhóm B1/B2 không tham gia tập nhưng số buổi > 0']);
      }
    }
    var nv = g('nv_12t'), nvst = g('nv_st_12t');
    if (nv !== null && nvst !== null && nvst > nv) {
      loi.push([ma, 'Số lần nhập viện do suy tim lớn hơn tổng số lần nhập viện']);
    }
    if (g('mwd1') !== null && g('mwd2') === null) {
      loi.push([ma, '6MWT chỉ có 1 lần đo — quy trình yêu cầu đo 2 lần cách nhau ≥ 30 phút']);
    }
    if (g('icd') === 1 && g('icd_nguong') === null) {
      loi.push([ma, 'Có ICD nhưng chưa ghi ngưỡng nhịp kích hoạt sốc']);
    }
    if (g('hut_thuoc') === 0 && g('bao_nam') > 0) {
      loi.push([ma, 'Chưa bao giờ hút thuốc nhưng số bao-năm > 0']);
    }
    if (String(v[r][idx.canh_bao_tt]) === 'BÁO BS NGAY') {
      loi.push([ma, 'CẢNH BÁO PHQ-9 — báo bác sĩ, chuyển chuyên khoa tâm thần trong 24 giờ']);
    }
    var bnp = g('ntprobnp');
    if (bnp !== null && bnp >= 1858) {
      loi.push([ma, 'NT-proBNP ' + bnp + ' pg/mL ≥ ngưỡng tiên lượng nội địa 1.858']);
    }
  }

  var sh = ss.getSheetByName('KIEM_TRA') || ss.insertSheet('KIEM_TRA');
  sh.clear();
  sh.getRange(1, 1, loi.length, 2).setValues(loi);
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, 2).setFontWeight('bold');
  sh.autoResizeColumns(1, 2);
  Logger.log('KIEM_TRA: ' + (loi.length - 1) + ' vấn đề.');
}

/* ------------------------------------------------------------------ */
function guiCanhBao(e) {
  if (!EMAIL_CANH_BAO || !e || !e.namedValues) return;
  var lay = function (t) {
    var v = e.namedValues[t];
    return (v && v[0]) ? v[0] : '';
  };
  var ma = lay(TIEU_DE.ma_nc);
  var canhBao = [];

  BO_LUOI.forEach(function (bo) {
    if (bo.id !== 'phq9') return;
    var tong = 0, du = true, q9 = null;
    bo.muc.forEach(function (m, i) {
      var s = soHoa(lay(bo.tieu_de + ' [' + m + ']'));
      if (s === null) du = false; else tong += s;
      if (i === 8) q9 = s;
    });
    if ((q9 !== null && q9 >= 1) || (du && tong >= 15)) {
      canhBao.push('PHQ-9: tổng ' + (du ? tong : '?') + ', câu 9 = ' + q9 +
                   ' — báo bác sĩ ngay, chuyển chuyên khoa tâm thần trong 24 giờ.');
    }
  });

  var bnp = soHoa(lay(TIEU_DE.ntprobnp));
  if (bnp !== null && bnp >= 1858) {
    canhBao.push('NT-proBNP ' + bnp + ' pg/mL ≥ ngưỡng tiên lượng nội địa 1.858 pg/mL.');
  }
  if (!canhBao.length) return;

  MailApp.sendEmail(EMAIL_CANH_BAO,
    '[PHCN Tim mạch] Cảnh báo lâm sàng — phiếu ' + ma,
    'Phiếu ' + ma + ' vừa được gửi lên và có dấu hiệu cần xử trí:\n\n• ' +
    canhBao.join('\n• ') +
    '\n\n(Thư tự động từ bảng tính nhập liệu nghiên cứu.)');
}

/* ------------------------------------------------------------------ */
/*  Tiện ích                                                           */
/* ------------------------------------------------------------------ */
function sheetTraLoi(ss) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var ten = sheets[i].getName();
    if (ten === 'PHAN_TICH' || ten === 'KIEM_TRA') continue;
    var d = sheets[i].getRange(1, 1).getValue();
    if (String(d).indexOf('Dấu thời gian') === 0 ||
        String(d).indexOf('Timestamp') === 0) return sheets[i];
  }
  return sheets[0] || null;
}

/** '1 – Nam' -> 1 ; 'KAD' -> 'KAD' ; '' -> '' */
function veMaSo(v) {
  if (v === '' || v === null || v === undefined) return '';
  var s = String(v).trim();
  if (s === 'KAD') return 'KAD';
  var m = s.match(/^(-?\d+)/);
  return m ? Number(m[1]) : s;
}

function soHoa(v) {
  if (v === '' || v === null || v === undefined || v === 'KAD') return null;
  if (typeof v === 'number') return v;
  var m = String(v).trim().replace(',', '.').match(/^-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

function dinhDangNgay(v) {
  if (!v) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(v);
}

function lamTron(x, d) {
  var f = Math.pow(10, d);
  return Math.round(x * f) / f;
}

function congMuc(diem, soThuTu) {
  var s = 0;
  for (var i = 0; i < soThuTu.length; i++) {
    var v = diem[soThuTu[i] - 1];
    if (v === null || v === undefined) return '';
    s += v;
  }
  return s;
}

function day(a, b) {
  var out = [];
  for (var i = a; i <= b; i++) out.push(i);
  return out;
}
