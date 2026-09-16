/* =========================================================================
 * PHCN TIM MẠCH — TẠO GOOGLE FORM NHẬP LIỆU NGHIÊN CỨU
 * TỰ ĐỘNG SINH bởi tools/gen_gs.py — đừng sửa tay, sửa file Excel rồi sinh lại.
 *
 * CÁCH DÙNG
 *   1. Vào script.google.com → New project.
 *   2. Dán TOÀN BỘ file này vào, đặt tên dự án rồi Lưu.
 *   3. Chọn hàm taoForm ở thanh trên → Run. Lần đầu Google sẽ hỏi cấp quyền.
 *   4. Xem Execution log để lấy link biểu mẫu.
 *   5. Nếu script dừng giữa chừng vì quá 6 phút, chạy tiếp hàm taoForm một
 *      lần nữa — nó tự nhớ vị trí và làm tiếp, không tạo trùng.
 * ======================================================================= */

var TEN_FORM = "Bộ nhập liệu — Nghiên cứu PHCN tim mạch trên người bệnh suy tim";

var MO_TA_FORM = "Bộ nhập liệu cho nghiên cứu phục hồi chức năng tim mạch trên người bệnh suy tim.\n\nQUY ƯỚC:\n• Giá trị thiếu (không thu thập được): BỎ TRỐNG câu hỏi — không nhập 0, không nhập 999.\n• Không áp dụng: nhập KAD (với câu hỏi trắc nghiệm chọn mục \"KAD\").\n• Mỗi người bệnh = một lượt trả lời.\n• KHÔNG nhập họ tên, số điện thoại hay địa chỉ — chỉ dùng mã nghiên cứu.\n\nCác biến tự tính (BMI, 6MWD, SPPB, GDMT, thiểu cơ, cảnh báo PHQ-9…) do script trên bảng tính tính tự động, không hỏi trong biểu mẫu này.";

/* Các mục của biểu mẫu, đúng thứ tự cột của sheet NHAP_LIEU. */
var MUC = [
 {
  "loai": "trang",
  "tieu_de": "A. Hành chính"
 },
 {
  "loai": "text",
  "ma": "ma_nc",
  "tieu_de": "Mã nghiên cứu",
  "tro_giup": "Mã biến: ma_nc",
  "bat_buoc": true
 },
 {
  "loai": "date",
  "ma": "ngay_ttsl",
  "tieu_de": "Ngày thu thập số liệu",
  "tro_giup": "Mã biến: ngay_ttsl",
  "bat_buoc": true
 },
 {
  "loai": "text",
  "ma": "dtv",
  "tieu_de": "Mã điều tra viên",
  "tro_giup": "Mã biến: dtv"
 },
 {
  "loai": "select",
  "ma": "dia_diem",
  "tieu_de": "Địa điểm thu thập",
  "tro_giup": "Mã biến: dia_diem",
  "lua_chon": [
   "1 – Ngoại trú",
   "2 – Nội trú",
   "3 – Đơn vị PHCNTM",
   "KAD"
  ]
 },
 {
  "loai": "number",
  "ma": "tuoi",
  "tieu_de": "Tuổi",
  "tro_giup": "Đơn vị: năm · Khoảng hợp lệ: 18 – 110 · Mã biến: tuoi",
  "min": 18,
  "max": 110
 },
 {
  "loai": "select",
  "ma": "gioi",
  "tieu_de": "Giới",
  "tro_giup": "Mã biến: gioi",
  "lua_chon": [
   "1 – Nam",
   "2 – Nữ",
   "KAD"
  ]
 },
 {
  "loai": "trang",
  "tieu_de": "B. Phơi nhiễm"
 },
 {
  "loai": "select",
  "ma": "nhom",
  "tieu_de": "Nhóm nghiên cứu",
  "tro_giup": "Mã biến: nhom",
  "bat_buoc": true,
  "lua_chon": [
   "1 – A (hoàn thành PHCNTM ≥24 buổi)",
   "2 – B1 (được giới thiệu, không tham gia)",
   "3 – B2 (chưa được giới thiệu)",
   "4 – C (tham gia một phần 8-23 buổi)",
   "KAD"
  ]
 },
 {
  "loai": "number",
  "ma": "so_buoi",
  "tieu_de": "Số buổi tập có giám sát",
  "tro_giup": "Đơn vị: buổi · Khoảng hợp lệ: 0 – 36 · Mã biến: so_buoi",
  "min": 0,
  "max": 36
 },
 {
  "loai": "number",
  "ma": "so_buoi_gd",
  "tieu_de": "Số buổi giáo dục đã dự",
  "tro_giup": "Đơn vị: buổi · Khoảng hợp lệ: 0 – 8 · Mã biến: so_buoi_gd",
  "min": 0,
  "max": 8
 },
 {
  "loai": "number",
  "ma": "tong_gio_tap",
  "tieu_de": "Tổng thời gian tập luyện",
  "tro_giup": "Đơn vị: giờ · Khoảng hợp lệ: 0 – 60 · Mã biến: tong_gio_tap",
  "min": 0,
  "max": 60
 },
 {
  "loai": "number",
  "ma": "met_gio_tuan",
  "tieu_de": "Liều tập luyện",
  "tro_giup": "Đơn vị: MET-giờ/tuần · Khoảng hợp lệ: 0 – 30 · Mã biến: met_gio_tuan",
  "min": 0,
  "max": 30
 },
 {
  "loai": "number",
  "ma": "thang_ket_thuc",
  "tieu_de": "Thời gian từ khi kết thúc chương trình",
  "tro_giup": "Đơn vị: tháng · Khoảng hợp lệ: 0 – 24 · Mã biến: thang_ket_thuc",
  "min": 0,
  "max": 24
 },
 {
  "loai": "select",
  "ma": "duy_tri_tap",
  "tieu_de": "Hiện còn duy trì tập tại nhà",
  "tro_giup": "Mã biến: duy_tri_tap",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "da_gioi_thieu",
  "tieu_de": "Đã từng được giới thiệu PHCNTM",
  "tro_giup": "Mã biến: da_gioi_thieu",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "9 – Không rõ",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "nguon_gt",
  "tieu_de": "Nguồn giới thiệu",
  "tro_giup": "Mã biến: nguon_gt",
  "lua_chon": [
   "1 – BS tim mạch",
   "2 – BS PHCN",
   "3 – BS phẫu thuật",
   "4 – Điều dưỡng",
   "5 – Tự tìm hiểu",
   "6 – Khác",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "chi_tra",
  "tieu_de": "Hình thức chi trả",
  "tro_giup": "Mã biến: chi_tra",
  "lua_chon": [
   "1 – BHYT",
   "2 – Tự chi trả",
   "3 – Kết hợp",
   "4 – Miễn phí",
   "KAD"
  ]
 },
 {
  "loai": "trang",
  "tieu_de": "C. Nhân khẩu"
 },
 {
  "loai": "select",
  "ma": "noi_cu_tru",
  "tieu_de": "Nơi cư trú",
  "tro_giup": "Mã biến: noi_cu_tru",
  "lua_chon": [
   "1 – Thành thị",
   "2 – Nông thôn",
   "KAD"
  ]
 },
 {
  "loai": "number",
  "ma": "khoang_cach",
  "tieu_de": "Khoảng cách đến trung tâm",
  "tro_giup": "Đơn vị: km · Khoảng hợp lệ: 0 – 500 · Mã biến: khoang_cach",
  "min": 0,
  "max": 500
 },
 {
  "loai": "select",
  "ma": "hoc_van",
  "tieu_de": "Trình độ học vấn",
  "tro_giup": "Mã biến: hoc_van",
  "lua_chon": [
   "1 – Không đi học",
   "2 – Tiểu học",
   "3 – THCS",
   "4 – THPT",
   "5 – TC/CĐ",
   "6 – ĐH trở lên",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "nghe_nghiep",
  "tieu_de": "Nghề nghiệp",
  "tro_giup": "Mã biến: nghe_nghiep",
  "lua_chon": [
   "1 – Nông dân",
   "2 – Công nhân",
   "3 – Viên chức",
   "4 – Kinh doanh",
   "5 – Nội trợ",
   "6 – Nghỉ hưu",
   "7 – Thất nghiệp",
   "8 – Khác",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "hon_nhan",
  "tieu_de": "Tình trạng hôn nhân",
  "tro_giup": "Mã biến: hon_nhan",
  "lua_chon": [
   "1 – Độc thân",
   "2 – Có vợ/chồng",
   "3 – Ly hôn/ly thân",
   "4 – Goá",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "song_mot_minh",
  "tieu_de": "Sống một mình",
  "tro_giup": "Mã biến: song_mot_minh",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "thu_nhap",
  "tieu_de": "Thu nhập hộ/tháng",
  "tro_giup": "Mã biến: thu_nhap",
  "lua_chon": [
   "1 – <5tr",
   "2 – 5-10tr",
   "3 – 10-20tr",
   "4 – >20tr VNĐ",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "bhyt",
  "tieu_de": "Có bảo hiểm y tế",
  "tro_giup": "Mã biến: bhyt",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "trang",
  "tieu_de": "D. Lâm sàng"
 },
 {
  "loai": "number",
  "ma": "nam_cd",
  "tieu_de": "Năm chẩn đoán suy tim",
  "tro_giup": "Đơn vị: năm · Khoảng hợp lệ: 1950 – 2100 · Mã biến: nam_cd",
  "min": 1950,
  "max": 2100
 },
 {
  "loai": "number",
  "ma": "thoi_gian_benh",
  "tieu_de": "Thời gian mắc bệnh",
  "tro_giup": "Đơn vị: tháng · Khoảng hợp lệ: 0 – 600 · Mã biến: thoi_gian_benh",
  "min": 0,
  "max": 600
 },
 {
  "loai": "select",
  "ma": "phan_nhom_ef",
  "tieu_de": "Phân nhóm EF",
  "tro_giup": "Mã biến: phan_nhom_ef",
  "lua_chon": [
   "1 – HFrEF (≤40%)",
   "2 – HFmrEF (41-49%)",
   "3 – HFpEF (≥50%)",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "nyha",
  "tieu_de": "Phân độ NYHA",
  "tro_giup": "Mã biến: nyha",
  "lua_chon": [
   "1 – I",
   "2 – II",
   "3 – III",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "benh_nguyen",
  "tieu_de": "Bệnh nguyên chính",
  "tro_giup": "Mã biến: benh_nguyen",
  "lua_chon": [
   "1 – Thiếu máu cục bộ",
   "2 – Sau NMCT",
   "3 – Do THA",
   "4 – Bệnh van tim",
   "5 – BCT giãn",
   "6 – BCT phì đại",
   "7 – Do rượu",
   "8 – Sau hoá trị",
   "9 – Khác",
   "99 – Không rõ",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "pci",
  "tieu_de": "Tiền sử PCI",
  "tro_giup": "Mã biến: pci",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "cabg",
  "tieu_de": "Tiền sử CABG",
  "tro_giup": "Mã biến: cabg",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "pt_van",
  "tieu_de": "Tiền sử phẫu thuật van tim",
  "tro_giup": "Mã biến: pt_van",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "icd",
  "tieu_de": "Có ICD",
  "tro_giup": "Mã biến: icd",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "number",
  "ma": "icd_nguong",
  "tieu_de": "Ngưỡng nhịp kích hoạt sốc ICD",
  "tro_giup": "Đơn vị: lần/phút · Khoảng hợp lệ: 100 – 220 · Mã biến: icd_nguong",
  "min": 100,
  "max": 220
 },
 {
  "loai": "select",
  "ma": "crt",
  "tieu_de": "Có CRT",
  "tro_giup": "Mã biến: crt",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "trang",
  "tieu_de": "D. Bệnh đồng mắc"
 },
 {
  "loai": "select",
  "ma": "tha",
  "tieu_de": "Tăng huyết áp",
  "tro_giup": "Mã biến: tha",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "dtd",
  "tieu_de": "Đái tháo đường típ 2",
  "tro_giup": "Mã biến: dtd",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "rlm",
  "tieu_de": "Rối loạn lipid máu",
  "tro_giup": "Mã biến: rlm",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "btm",
  "tieu_de": "Bệnh thận mạn",
  "tro_giup": "Mã biến: btm",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "rung_nhi",
  "tieu_de": "Rung nhĩ",
  "tro_giup": "Mã biến: rung_nhi",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "thieu_mau",
  "tieu_de": "Thiếu máu",
  "tro_giup": "Mã biến: thieu_mau",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "copd",
  "tieu_de": "COPD",
  "tro_giup": "Mã biến: copd",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "dot_quy",
  "tieu_de": "Đột quỵ/TIA",
  "tro_giup": "Mã biến: dot_quy",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "number",
  "ma": "cci",
  "tieu_de": "Chỉ số bệnh đồng mắc Charlson",
  "tro_giup": "Đơn vị: điểm · Khoảng hợp lệ: 0 – 20 · Chỉ số Charlson đã hiệu chỉnh tuổi (0–20 điểm). · Mã biến: cci",
  "min": 0,
  "max": 20
 },
 {
  "loai": "trang",
  "tieu_de": "D. Hành vi"
 },
 {
  "loai": "select",
  "ma": "hut_thuoc",
  "tieu_de": "Tình trạng hút thuốc",
  "tro_giup": "Mã biến: hut_thuoc",
  "lua_chon": [
   "0 – Chưa bao giờ",
   "1 – Đã bỏ",
   "2 – Đang hút",
   "KAD"
  ]
 },
 {
  "loai": "number",
  "ma": "bao_nam",
  "tieu_de": "Số bao-năm",
  "tro_giup": "Đơn vị: bao-năm · Khoảng hợp lệ: 0 – 150 · Mã biến: bao_nam",
  "min": 0,
  "max": 150
 },
 {
  "loai": "select",
  "ma": "ruou",
  "tieu_de": "Uống rượu bia",
  "tro_giup": "Mã biến: ruou",
  "lua_chon": [
   "0 – Không",
   "1 – Thỉnh thoảng",
   "2 – Thường xuyên",
   "KAD"
  ]
 },
 {
  "loai": "trang",
  "tieu_de": "D. Sử dụng dịch vụ"
 },
 {
  "loai": "number",
  "ma": "nv_12t",
  "tieu_de": "Số lần nhập viện 12 tháng (mọi nguyên nhân)",
  "tro_giup": "Đơn vị: lần · Khoảng hợp lệ: 0 – 20 · Mã biến: nv_12t",
  "min": 0,
  "max": 20
 },
 {
  "loai": "number",
  "ma": "nv_st_12t",
  "tieu_de": "Số lần nhập viện do suy tim 12 tháng",
  "tro_giup": "Đơn vị: lần · Khoảng hợp lệ: 0 – 20 · Mã biến: nv_st_12t",
  "min": 0,
  "max": 20
 },
 {
  "loai": "number",
  "ma": "ngay_nam_vien",
  "tieu_de": "Tổng số ngày nằm viện 12 tháng",
  "tro_giup": "Đơn vị: ngày · Khoảng hợp lệ: 0 – 365 · Mã biến: ngay_nam_vien",
  "min": 0,
  "max": 365
 },
 {
  "loai": "number",
  "ma": "cap_cuu_12t",
  "tieu_de": "Số lần khám cấp cứu 12 tháng",
  "tro_giup": "Đơn vị: lần · Khoảng hợp lệ: 0 – 20 · Mã biến: cap_cuu_12t",
  "min": 0,
  "max": 20
 },
 {
  "loai": "trang",
  "tieu_de": "E. Thuốc"
 },
 {
  "loai": "select",
  "ma": "ucmc_arb",
  "tieu_de": "Dùng ƯCMC/ARB",
  "tro_giup": "Mã biến: ucmc_arb",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "arni",
  "tieu_de": "Dùng ARNI",
  "tro_giup": "Mã biến: arni",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "chen_beta",
  "tieu_de": "Dùng chẹn beta",
  "tro_giup": "Mã biến: chen_beta",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "mra",
  "tieu_de": "Dùng kháng MRA",
  "tro_giup": "Mã biến: mra",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "sglt2",
  "tieu_de": "Dùng ức chế SGLT2",
  "tro_giup": "Mã biến: sglt2",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "select",
  "ma": "loi_tieu",
  "tieu_de": "Dùng lợi tiểu quai",
  "tro_giup": "Mã biến: loi_tieu",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "number",
  "ma": "so_thuoc",
  "tieu_de": "Tổng số loại thuốc đang dùng",
  "tro_giup": "Đơn vị: loại · Khoảng hợp lệ: 0 – 30 · Mã biến: so_thuoc",
  "min": 0,
  "max": 30
 },
 {
  "loai": "trang",
  "tieu_de": "F. Khám lâm sàng"
 },
 {
  "loai": "number",
  "ma": "hatt",
  "tieu_de": "Huyết áp tâm thu",
  "tro_giup": "Đơn vị: mmHg · Khoảng hợp lệ: 60 – 250 · Mã biến: hatt",
  "min": 60,
  "max": 250
 },
 {
  "loai": "number",
  "ma": "hattr",
  "tieu_de": "Huyết áp tâm trương",
  "tro_giup": "Đơn vị: mmHg · Khoảng hợp lệ: 30 – 150 · Mã biến: hattr",
  "min": 30,
  "max": 150
 },
 {
  "loai": "number",
  "ma": "nhip_tim",
  "tieu_de": "Nhịp tim lúc nghỉ",
  "tro_giup": "Đơn vị: lần/phút · Khoảng hợp lệ: 30 – 180 · Mã biến: nhip_tim",
  "min": 30,
  "max": 180
 },
 {
  "loai": "number",
  "ma": "can_nang",
  "tieu_de": "Cân nặng",
  "tro_giup": "Đơn vị: kg · Khoảng hợp lệ: 25 – 200 · Mã biến: can_nang",
  "min": 25,
  "max": 200
 },
 {
  "loai": "number",
  "ma": "chieu_cao",
  "tieu_de": "Chiều cao",
  "tro_giup": "Đơn vị: cm · Khoảng hợp lệ: 120 – 200 · Mã biến: chieu_cao",
  "min": 120,
  "max": 200
 },
 {
  "loai": "number",
  "ma": "vong_eo",
  "tieu_de": "Vòng eo",
  "tro_giup": "Đơn vị: cm · Khoảng hợp lệ: 50 – 160 · Mã biến: vong_eo",
  "min": 50,
  "max": 160
 },
 {
  "loai": "number",
  "ma": "spo2",
  "tieu_de": "SpO₂ khí trời lúc nghỉ",
  "tro_giup": "Đơn vị: % · Khoảng hợp lệ: 70 – 100 · Mã biến: spo2",
  "min": 70,
  "max": 100
 },
 {
  "loai": "trang",
  "tieu_de": "G. Cận lâm sàng"
 },
 {
  "loai": "number",
  "ma": "ntprobnp",
  "tieu_de": "NT-proBNP",
  "tro_giup": "Đơn vị: pg/mL · Khoảng hợp lệ: 5 – 70000 · Ngưỡng tiên lượng nội địa: ≥ 1.858 pg/mL. · Mã biến: ntprobnp",
  "min": 5,
  "max": 70000
 },
 {
  "loai": "number",
  "ma": "hb",
  "tieu_de": "Hemoglobin",
  "tro_giup": "Đơn vị: g/L · Khoảng hợp lệ: 40 – 200 · Mã biến: hb",
  "min": 40,
  "max": 200
 },
 {
  "loai": "number",
  "ma": "ferritin",
  "tieu_de": "Ferritin",
  "tro_giup": "Đơn vị: ng/mL · Khoảng hợp lệ: 1 – 2000 · Mã biến: ferritin",
  "min": 1,
  "max": 2000
 },
 {
  "loai": "number",
  "ma": "tsat",
  "tieu_de": "Độ bão hoà transferrin",
  "tro_giup": "Đơn vị: % · Khoảng hợp lệ: 1 – 100 · Mã biến: tsat",
  "min": 1,
  "max": 100
 },
 {
  "loai": "number",
  "ma": "na",
  "tieu_de": "Natri",
  "tro_giup": "Đơn vị: mmol/L · Khoảng hợp lệ: 110 – 160 · Mã biến: na",
  "min": 110,
  "max": 160
 },
 {
  "loai": "number",
  "ma": "k",
  "tieu_de": "Kali",
  "tro_giup": "Đơn vị: mmol/L · Khoảng hợp lệ: 2 – 8 · Mã biến: k",
  "min": 2,
  "max": 8
 },
 {
  "loai": "number",
  "ma": "creatinin",
  "tieu_de": "Creatinin",
  "tro_giup": "Đơn vị: µmol/L · Khoảng hợp lệ: 20 – 1200 · Mã biến: creatinin",
  "min": 20,
  "max": 1200
 },
 {
  "loai": "number",
  "ma": "egfr",
  "tieu_de": "eGFR (CKD-EPI)",
  "tro_giup": "Đơn vị: mL/ph/1,73m² · Khoảng hợp lệ: 2 – 150 · Mã biến: egfr",
  "min": 2,
  "max": 150
 },
 {
  "loai": "number",
  "ma": "hba1c",
  "tieu_de": "HbA1c",
  "tro_giup": "Đơn vị: % · Khoảng hợp lệ: 3 – 18 · Mã biến: hba1c",
  "min": 3,
  "max": 18
 },
 {
  "loai": "number",
  "ma": "ldl",
  "tieu_de": "LDL-C",
  "tro_giup": "Đơn vị: mmol/L · Khoảng hợp lệ: 0.3 – 10 · Mã biến: ldl",
  "min": 0.3,
  "max": 10
 },
 {
  "loai": "number",
  "ma": "albumin",
  "tieu_de": "Albumin",
  "tro_giup": "Đơn vị: g/L · Khoảng hợp lệ: 10 – 60 · Mã biến: albumin",
  "min": 10,
  "max": 60
 },
 {
  "loai": "trang",
  "tieu_de": "G. Siêu âm tim"
 },
 {
  "loai": "number",
  "ma": "lvef",
  "tieu_de": "LVEF (Simpson)",
  "tro_giup": "Đơn vị: % · Khoảng hợp lệ: 5 – 80 · Mã biến: lvef",
  "min": 5,
  "max": 80
 },
 {
  "loai": "number",
  "ma": "lvedd",
  "tieu_de": "LVEDD",
  "tro_giup": "Đơn vị: mm · Khoảng hợp lệ: 30 – 90 · Mã biến: lvedd",
  "min": 30,
  "max": 90
 },
 {
  "loai": "number",
  "ma": "lavi",
  "tieu_de": "Chỉ số thể tích nhĩ trái",
  "tro_giup": "Đơn vị: mL/m² · Khoảng hợp lệ: 10 – 100 · Mã biến: lavi",
  "min": 10,
  "max": 100
 },
 {
  "loai": "number",
  "ma": "e_e_prime",
  "tieu_de": "E/e′ trung bình",
  "tro_giup": "Khoảng hợp lệ: 2 – 40 · Mã biến: e_e_prime",
  "min": 2,
  "max": 40
 },
 {
  "loai": "number",
  "ma": "tapse",
  "tieu_de": "TAPSE",
  "tro_giup": "Đơn vị: mm · Khoảng hợp lệ: 5 – 35 · Mã biến: tapse",
  "min": 5,
  "max": 35
 },
 {
  "loai": "number",
  "ma": "gls",
  "tieu_de": "GLS (nếu có)",
  "tro_giup": "Đơn vị: % · Khoảng hợp lệ: -30 – -3 · Mã biến: gls",
  "min": -30,
  "max": -3
 },
 {
  "loai": "number",
  "ma": "paps",
  "tieu_de": "Áp lực ĐMP tâm thu ước tính",
  "tro_giup": "Đơn vị: mmHg · Khoảng hợp lệ: 15 – 120 · Mã biến: paps",
  "min": 15,
  "max": 120
 },
 {
  "loai": "trang",
  "tieu_de": "H. 6MWT"
 },
 {
  "loai": "number",
  "ma": "mwd1",
  "tieu_de": "6MWD lần đo 1",
  "tro_giup": "Đơn vị: m · Khoảng hợp lệ: 0 – 800 · Đo 2 lần cách nhau ≥ 30 phút; phân tích lấy giá trị lớn hơn (ERS/ATS 2014). · Mã biến: mwd1",
  "min": 0,
  "max": 800
 },
 {
  "loai": "number",
  "ma": "mwd2",
  "tieu_de": "6MWD lần đo 2",
  "tro_giup": "Đơn vị: m · Khoảng hợp lệ: 0 – 800 · Lần đo thứ hai, cách lần đầu ≥ 30 phút. · Mã biến: mwd2",
  "min": 0,
  "max": 800
 },
 {
  "loai": "number",
  "ma": "mwd_dudoan",
  "tieu_de": "6MWD dự đoán theo chuẩn Việt Nam",
  "tro_giup": "Đơn vị: m · Khoảng hợp lệ: 200 – 700 · Tính theo phương trình tham chiếu NGƯỜI VIỆT (Nguyen và cs., 2024; JRM 56:jrm18628) — KHÔNG dùng Enright. · Mã biến: mwd_dudoan",
  "min": 200,
  "max": 700
 },
 {
  "loai": "number",
  "ma": "borg_kt_sau",
  "tieu_de": "Borg khó thở sau nghiệm pháp (lần đo dùng phân tích)",
  "tro_giup": "Khoảng hợp lệ: 0 – 10 · Borg CR10: 0 = hoàn toàn không khó thở … 10 = tối đa · Mã biến: borg_kt_sau",
  "min": 0,
  "max": 10
 },
 {
  "loai": "number",
  "ma": "borg_met_sau",
  "tieu_de": "Borg mệt chi dưới sau nghiệm pháp",
  "tro_giup": "Khoảng hợp lệ: 0 – 10 · Borg CR10: 0 = hoàn toàn không mệt … 10 = tối đa · Mã biến: borg_met_sau",
  "min": 0,
  "max": 10
 },
 {
  "loai": "number",
  "ma": "spo2_sau",
  "tieu_de": "SpO₂ thấp nhất trong nghiệm pháp",
  "tro_giup": "Đơn vị: % · Khoảng hợp lệ: 60 – 100 · Mã biến: spo2_sau",
  "min": 60,
  "max": 100
 },
 {
  "loai": "select",
  "ma": "dung_som",
  "tieu_de": "Dừng sớm trước 6 phút",
  "tro_giup": "Mã biến: dung_som",
  "lua_chon": [
   "0 – Không",
   "1 – Có",
   "KAD"
  ]
 },
 {
  "loai": "trang",
  "tieu_de": "I. Chức năng"
 },
 {
  "loai": "number",
  "ma": "sppb_tb",
  "tieu_de": "Điểm thăng bằng SPPB",
  "tro_giup": "Khoảng hợp lệ: 0 – 4 · 0 = không giữ được tư thế nào … 4 = giữ tandem đủ 10 giây · Mã biến: sppb_tb",
  "min": 0,
  "max": 4
 },
 {
  "loai": "number",
  "ma": "sppb_di",
  "tieu_de": "Điểm tốc độ đi bộ SPPB",
  "tro_giup": "Khoảng hợp lệ: 0 – 4 · 0 = không đi được; 1 = >8,70 s; 2 = 6,21–8,70 s; 3 = 4,82–6,20 s; 4 = <4,82 s · Mã biến: sppb_di",
  "min": 0,
  "max": 4
 },
 {
  "loai": "number",
  "ma": "sppb_ghe",
  "tieu_de": "Điểm đứng lên ngồi xuống SPPB",
  "tro_giup": "Khoảng hợp lệ: 0 – 4 · 0 = >60 s hoặc không làm được; 1 = 16,7–60 s; 2 = 13,7–16,69 s; 3 = 11,2–13,69 s; 4 = ≤11,19 s · Mã biến: sppb_ghe",
  "min": 0,
  "max": 4
 },
 {
  "loai": "number",
  "ma": "tg_di_4m",
  "tieu_de": "Thời gian đi bộ 4 m (tốt nhất)",
  "tro_giup": "Đơn vị: giây · Khoảng hợp lệ: 2 – 30 · Mã biến: tg_di_4m",
  "min": 2,
  "max": 30
 },
 {
  "loai": "number",
  "ma": "luc_nam",
  "tieu_de": "Lực nắm tay (tối đa, tay thuận)",
  "tro_giup": "Đơn vị: kg · Khoảng hợp lệ: 2 – 70 · Mã biến: luc_nam",
  "min": 2,
  "max": 70
 },
 {
  "loai": "number",
  "ma": "mip",
  "tieu_de": "MIP (nếu có)",
  "tro_giup": "Đơn vị: cmH₂O · Khoảng hợp lệ: 10 – 200 · Mã biến: mip",
  "min": 10,
  "max": 200
 },
 {
  "loai": "trang",
  "tieu_de": "J. CPET"
 },
 {
  "loai": "number",
  "ma": "peak_vo2",
  "tieu_de": "Peak VO₂ (CPET)",
  "tro_giup": "Đơn vị: mL/kg/phút · Khoảng hợp lệ: 3 – 45 · Mã biến: peak_vo2",
  "min": 3,
  "max": 45
 },
 {
  "loai": "number",
  "ma": "ve_vco2",
  "tieu_de": "Độ dốc VE/VCO₂",
  "tro_giup": "Khoảng hợp lệ: 15 – 80 · Mã biến: ve_vco2",
  "min": 15,
  "max": 80
 },
 {
  "loai": "number",
  "ma": "rer",
  "tieu_de": "RER tối đa",
  "tro_giup": "Khoảng hợp lệ: 0.7 – 1.5 · Mã biến: rer",
  "min": 0.7,
  "max": 1.5
 },
 {
  "loai": "trang",
  "tieu_de": "K. Bộ câu hỏi"
 },
 {
  "loai": "luoi",
  "id": "mlhfq",
  "tieu_de": "MLHFQ — Chất lượng cuộc sống suy tim Minnesota",
  "mo_ta": "Trong tháng qua, bệnh tim đã cản trở người bệnh sống như mong muốn ở mức nào? (0 = không, 5 = rất nhiều) — Nguồn: Rector TS, Cohn JN. Am Heart J. 1992;124:1017-25",
  "hang": [
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
  ],
  "cot": [
   "0 – Không",
   "1 – Rất ít",
   "2",
   "3",
   "4",
   "5 – Rất nhiều"
  ]
 },
 {
  "loai": "luoi",
  "id": "phq9",
  "tieu_de": "PHQ-9 — Sàng lọc trầm cảm",
  "mo_ta": "Trong 2 tuần qua, người bệnh bị làm phiền bởi các vấn đề sau ở mức độ nào? — Nguồn: Kroenke K et al. J Gen Intern Med. 2001;16:606-13",
  "hang": [
   "Ít hứng thú hoặc không thấy vui thích khi làm việc gì",
   "Cảm thấy buồn, chán nản hoặc tuyệt vọng",
   "Khó ngủ, ngủ không yên giấc hoặc ngủ quá nhiều",
   "Cảm thấy mệt mỏi hoặc có ít năng lượng",
   "Ăn kém hoặc ăn quá nhiều",
   "Cảm thấy tự ti, thất bại, hoặc làm gia đình thất vọng",
   "Khó tập trung (đọc báo, xem tivi)",
   "Di chuyển hoặc nói chậm chạp bất thường / bồn chồn quá mức",
   "Có ý nghĩ muốn chết hoặc tự làm hại bản thân"
  ],
  "cot": [
   "0 – Không ngày nào",
   "1 – Vài ngày",
   "2 – Hơn nửa số ngày",
   "3 – Gần như mỗi ngày"
  ]
 },
 {
  "loai": "luoi",
  "id": "gad7",
  "tieu_de": "GAD-7 — Sàng lọc lo âu lan tỏa",
  "mo_ta": "Trong 2 tuần qua, người bệnh bị làm phiền bởi các vấn đề sau ở mức độ nào? — Nguồn: Spitzer RL et al. Arch Intern Med. 2006;166:1092-7",
  "hang": [
   "Cảm thấy bồn chồn, lo lắng hoặc căng thẳng",
   "Không thể ngừng lo lắng hoặc không kiểm soát được sự lo lắng",
   "Lo lắng quá nhiều về những chuyện khác nhau",
   "Khó thư giãn",
   "Bồn chồn đến mức khó ngồi yên",
   "Dễ bực bội hoặc cáu kỉnh",
   "Cảm thấy sợ hãi như thể điều gì tồi tệ sắp xảy ra"
  ],
  "cot": [
   "0 – Không ngày nào",
   "1 – Vài ngày",
   "2 – Hơn nửa số ngày",
   "3 – Gần như mỗi ngày"
  ]
 },
 {
  "loai": "luoi",
  "id": "eq5d",
  "tieu_de": "EQ-5D-5L — Năm chiều sức khỏe HÔM NAY",
  "mo_ta": "Năm chiều tạo thành mã sức khỏe 5 chữ số (biến eq5d_ma). Dùng trong nghiên cứu cần đăng ký license với EuroQol. — Nguồn: EuroQol Group. Health Policy. 1990;16:199-208",
  "hang": [
   "Đi lại",
   "Tự chăm sóc (tắm, mặc quần áo)",
   "Sinh hoạt thường lệ (làm việc, việc nhà, giải trí)",
   "Đau / khó chịu",
   "Lo lắng / trầm cảm"
  ],
  "cot": [
   "1 – Không có vấn đề",
   "2 – Nhẹ",
   "3 – Vừa",
   "4 – Nặng",
   "5 – Không thể / cực kỳ nặng"
  ]
 },
 {
  "loai": "number",
  "ma": "eq5d_index",
  "tieu_de": "EQ-5D-5L chỉ số hữu dụng (bộ giá trị VN)",
  "tro_giup": "Đơn vị: -0,5115 đến 1 · Khoảng hợp lệ: -0.5115 – 1 · Tra theo bộ giá trị EQ-5D-5L của Việt Nam. · Mã biến: eq5d_index",
  "min": -0.5115,
  "max": 1
 },
 {
  "loai": "number",
  "ma": "eq_vas",
  "tieu_de": "EQ-VAS",
  "tro_giup": "Khoảng hợp lệ: 0 – 100 · Mã biến: eq_vas",
  "min": 0,
  "max": 100
 },
 {
  "loai": "number",
  "ma": "ipaq_met",
  "tieu_de": "IPAQ-SF tổng",
  "tro_giup": "Đơn vị: MET-phút/tuần · Khoảng hợp lệ: 0 – 20000 · IPAQ-SF: 8,0×(ngày×phút nặng) + 4,0×(ngày×phút vừa) + 3,3×(ngày×phút đi bộ). · Mã biến: ipaq_met",
  "min": 0,
  "max": 20000
 },
 {
  "loai": "number",
  "ma": "ipaq_ngoi",
  "tieu_de": "IPAQ-SF thời gian ngồi/ngày",
  "tro_giup": "Đơn vị: phút · Khoảng hợp lệ: 0 – 1440 · Mã biến: ipaq_ngoi",
  "min": 0,
  "max": 1440
 },
 {
  "loai": "number",
  "ma": "gmas",
  "tieu_de": "GMAS tổng",
  "tro_giup": "Khoảng hợp lệ: 0 – 33 · Mã biến: gmas",
  "min": 0,
  "max": 33
 },
 {
  "loai": "number",
  "ma": "hls",
  "tieu_de": "HLS-SF12 chỉ số",
  "tro_giup": "Khoảng hợp lệ: 0 – 50 · Mã biến: hls",
  "min": 0,
  "max": 50
 },
 {
  "loai": "trang",
  "tieu_de": "L. CRBS-V"
 },
 {
  "loai": "number",
  "ma": "crbs_nt",
  "tieu_de": "CRBS-V — nhu cầu nhận thức/hệ thống y tế (TB)",
  "tro_giup": "Khoảng hợp lệ: 1 – 5 · Mã biến: crbs_nt",
  "min": 1,
  "max": 5
 },
 {
  "loai": "number",
  "ma": "crbs_bdm",
  "tieu_de": "CRBS-V — bệnh đồng mắc/chức năng (TB)",
  "tro_giup": "Khoảng hợp lệ: 1 – 5 · Mã biến: crbs_bdm",
  "min": 1,
  "max": 5
 },
 {
  "loai": "number",
  "ma": "crbs_hc",
  "tieu_de": "CRBS-V — hậu cần (TB)",
  "tro_giup": "Khoảng hợp lệ: 1 – 5 · Mã biến: crbs_hc",
  "min": 1,
  "max": 5
 },
 {
  "loai": "number",
  "ma": "crbs_cv",
  "tieu_de": "CRBS-V — công việc/thời gian (TB)",
  "tro_giup": "Khoảng hợp lệ: 1 – 5 · Mã biến: crbs_cv",
  "min": 1,
  "max": 5
 },
 {
  "loai": "select",
  "ma": "san_sang_mp",
  "tieu_de": "Sẵn sàng tham gia nếu miễn phí + tại nhà",
  "tro_giup": "Mã biến: san_sang_mp",
  "lua_chon": [
   "1 – Chắc chắn có",
   "2 – Có thể",
   "3 – Không chắc",
   "4 – Có thể không",
   "5 – Chắc chắn không",
   "KAD"
  ]
 },
 {
  "loai": "trang",
  "tieu_de": "N. Kết thúc"
 },
 {
  "loai": "doan_van",
  "ma": "ghi_chu",
  "tieu_de": "Ghi chú",
  "tro_giup": "Mã biến: ghi_chu"
 }
];

/* ------------------------------------------------------------------ */
function taoForm() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('FORM_ID');
  var form;

  if (id) {
    form = FormApp.openById(id);
  } else {
    form = FormApp.create(TEN_FORM);
    form.setDescription(MO_TA_FORM)
        .setProgressBar(true)
        .setAllowResponseEdits(true)
        .setCollectEmail(false)
        .setConfirmationMessage(
          'Đã ghi nhận phiếu. Kiểm tra lại mã nghiên cứu trước khi rời trang.');
    props.setProperty('FORM_ID', form.getId());
    Logger.log('Đã tạo biểu mẫu mới: ' + form.getId());
  }

  var batDau = Number(props.getProperty('VI_TRI') || 0);
  var moc = new Date().getTime();

  for (var i = batDau; i < MUC.length; i++) {
    /* Apps Script bị cắt ở 6 phút — dừng sớm ở phút thứ 4,5 và ghi lại vị trí. */
    if (new Date().getTime() - moc > 270000) {
      props.setProperty('VI_TRI', String(i));
      Logger.log('TẠM DỪNG ở mục ' + i + '/' + MUC.length +
                 '. Chạy lại hàm taoForm để làm tiếp.');
      return;
    }
    themMuc(form, MUC[i]);
  }

  props.deleteProperty('VI_TRI');
  Logger.log('HOÀN TẤT ' + MUC.length + ' mục.');
  Logger.log('Link điền phiếu: ' + form.getPublishedUrl());
  Logger.log('Link chỉnh sửa:  ' + form.getEditUrl());
}

/** Xoá ghi nhớ để lần sau taoForm tạo một biểu mẫu hoàn toàn mới. */
function batDauLai() {
  PropertiesService.getScriptProperties().deleteAllProperties();
  Logger.log('Đã xoá ghi nhớ. Lần chạy taoForm tới sẽ tạo biểu mẫu mới.');
}

/* ------------------------------------------------------------------ */
function themMuc(form, m) {
  if (m.loai === 'trang') {
    form.addPageBreakItem().setTitle(m.tieu_de);
    return;
  }

  if (m.loai === 'luoi') {
    var luoi = form.addGridItem();
    luoi.setTitle(m.tieu_de)
        .setHelpText(m.mo_ta)
        .setRows(m.hang)
        .setColumns(m.cot);
    return;
  }

  if (m.loai === 'select') {
    form.addListItem()
        .setTitle(m.tieu_de)
        .setHelpText(m.tro_giup)
        .setChoiceValues(m.lua_chon)
        .setRequired(!!m.bat_buoc);
    return;
  }

  if (m.loai === 'date') {
    form.addDateItem()
        .setTitle(m.tieu_de)
        .setHelpText(m.tro_giup)
        .setRequired(!!m.bat_buoc);
    return;
  }

  if (m.loai === 'doan_van') {
    form.addParagraphTextItem()
        .setTitle(m.tieu_de)
        .setHelpText(m.tro_giup)
        .setRequired(!!m.bat_buoc);
    return;
  }

  /* number và text đều là ô chữ, khác nhau ở luật kiểm tra. */
  var o = form.addTextItem()
              .setTitle(m.tieu_de)
              .setHelpText(m.tro_giup)
              .setRequired(!!m.bat_buoc);

  if (m.loai === 'number' && m.min !== undefined) {
    /* Google Forms chỉ nhận MỘT luật cho mỗi ô: ưu tiên chặn ngoài khoảng. */
    o.setValidation(FormApp.createTextValidation()
      .setHelpText('Giá trị phải nằm trong khoảng ' + m.min + ' – ' + m.max +
                   '. Bỏ trống nếu không thu thập được.')
      .requireNumberBetween(m.min, m.max)
      .build());
  } else if (m.mau) {
    o.setValidation(FormApp.createTextValidation()
      .setHelpText('Sai định dạng.')
      .requireTextMatchesPattern(m.mau)
      .build());
  }
}
