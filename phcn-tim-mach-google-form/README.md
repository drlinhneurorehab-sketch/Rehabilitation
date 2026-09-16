# PHCN TIM MẠCH — Bộ nhập liệu trên Google Form

Chuyển bộ nhập liệu `05_BO_NHAP_LIEU_PHCN_TIM_MACH.xlsx` sang **Google Forms + Google Sheets**.

Không ai dựng tay 128 câu hỏi được, nên ở đây là **mã Apps Script tự dựng biểu mẫu**: dán vào, bấm Run, Google tạo xong toàn bộ biểu mẫu kèm ràng buộc giá trị. Sửa file Excel gốc thì sinh lại mã, chạy lại là có biểu mẫu mới.

## Bốn biểu mẫu

| Biểu mẫu | Tương ứng sheet | Số câu hỏi | File mã |
|---|---|---|---|
| Bộ nhập liệu chính | `NHAP_LIEU` | 115 câu, 17 trang | `1-tao-form.gs` |
| Biến cố bất lợi | `BIEN_CO_BAT_LOI` | 15 câu | `3-form-phu.gs` |
| Giờ-người tập luyện | `GIO_NGUOI_TAP` | 5 câu | `3-form-phu.gs` |
| Chỉ số chương trình | `CHI_SO_CHUONG_TRINH` | 6 câu | `3-form-phu.gs` |

115 câu chứ không phải 128 vì: 10 biến là công thức (bảng tính tự tính), còn PHQ-9 / GAD-7 / MLHFQ / EQ-5D-5L được hỏi **theo từng mục dưới dạng lưới** rồi tự cộng điểm — đỡ được toàn bộ phép cộng nhẩm, nguồn sai số lớn nhất khi nhập liệu, và giữ lại dữ liệu mức mục để tính Cronbach's alpha sau này.

---

## Cài đặt — làm một lần, khoảng 15 phút

### Bước 1 · Tạo biểu mẫu chính

1. Vào [script.google.com](https://script.google.com) → **New project**.
2. Xoá nội dung mẫu, dán **toàn bộ** `1-tao-form.gs` vào. Đặt tên dự án, Lưu.
3. Chọn hàm `taoForm` ở thanh trên → **Run**. Lần đầu Google hỏi cấp quyền → Advanced → Go to project → Allow.
4. Mở **Execution log** để lấy link biểu mẫu.

> Nếu log báo *TẠM DỪNG ở mục …*: Apps Script bị cắt ở 6 phút. Chỉ cần **bấm Run hàm `taoForm` một lần nữa** — script nhớ vị trí và làm tiếp, không tạo trùng.
>
> Muốn bỏ hết làm lại từ đầu thì chạy hàm `batDauLai` trước.

### Bước 2 · Nối biểu mẫu với bảng tính

Mở biểu mẫu vừa tạo → tab **Câu trả lời** → biểu tượng Sheets màu xanh → **Tạo bảng tính mới**.

### Bước 3 · Cài script xử lý số liệu

1. Trong bảng tính đó: **Tiện ích mở rộng → Apps Script**.
2. Dán toàn bộ `2-xu-ly-du-lieu.gs` vào, Lưu.
3. Muốn nhận email cảnh báo PHQ-9 thì sửa dòng đầu: `var EMAIL_CANH_BAO = 'email@cua.ban';`
4. Chạy hàm `caiDat` một lần, cấp quyền khi Google hỏi.

Xong. Từ giờ mỗi phiếu gửi lên sẽ tự dựng lại sheet **PHAN_TICH**. Tải lại bảng tính sẽ thấy thực đơn **PHCN Tim mạch** trên thanh menu.

### Bước 4 · Ba biểu mẫu phụ

Tạo một dự án Apps Script mới, dán `3-form-phu.gs`, chạy hàm `taoBaFormPhu`. Log trả về 3 đường link.

---

## Sheet PHAN_TICH — bộ số liệu để phân tích

Script dựng sheet `PHAN_TICH` gồm **đúng 128 cột, đúng thứ tự và đúng mã biến** của sheet `NHAP_LIEU` trong file Excel gốc. Ba việc nó làm:

**Đổi nhãn về mã số.** Người điền thấy `1 – Nam`, sheet `PHAN_TICH` ghi `1`. Ô `KAD` giữ nguyên.

**Cộng điểm bộ câu hỏi.** MLHFQ ra `mlhfq_tc` (mục 2,3,4,5,6,7,12,13) / `mlhfq_cx` (mục 17–21) / `mlhfq`; PHQ-9 ra `phq9` và `phq9_c9`; GAD-7 ra `gad7`; EQ-5D-5L ghép thành mã 5 chữ số `eq5d_ma`. Thiếu một mục thì để trống chứ không cộng nửa vời.

**Tính 10 biến công thức**, chép nguyên công thức Excel:

| Biến | Công thức |
|---|---|
| `gdmt` | `MIN(1; ƯCMC/ARB + ARNI) + chẹn beta + MRA + SGLT2` |
| `bmi` | cân nặng ÷ (chiều cao mét)² |
| `mwd` | `MAX(6MWD lần 1; lần 2)` |
| `mwd_pct` | `mwd ÷ mwd_dudoan × 100` |
| `sppb` | tổng 3 phần |
| `toc_do_di` | `4 ÷ tg_di_4m` |
| `thieu_co` | AWGS 2019: lực nắm < 28 kg (nam) / < 18 kg (nữ), hoặc tốc độ đi < 1,0 m/s |
| `clcs_kem` | `mlhfq > 45` |
| `canh_bao_tt` | `phq9_c9 ≥ 1` hoặc `phq9 ≥ 15` → **BÁO BS NGAY** |
| `crbs_tong` | `(NT×7 + BĐM×4 + HC×6 + CV×4) ÷ 21` |

Tải `PHAN_TICH` về dạng CSV là nạp thẳng vào SPSS / Stata / R được.

**Đừng sửa tay sheet PHAN_TICH** — mỗi phiếu mới sẽ ghi đè. Sửa thì sửa ở sheet câu trả lời gốc, hoặc sửa chính lượt trả lời trên biểu mẫu.

## Kiểm tra chất lượng

Menu **PHCN Tim mạch → Kiểm tra chất lượng số liệu** dựng sheet `KIEM_TRA` liệt kê:

- mã nghiên cứu bị trùng
- huyết áp tâm trương ≥ tâm thu
- LVEF không khớp phân nhóm EF đã chọn
- nhóm A mà < 24 buổi; nhóm C ngoài khoảng 8–23 buổi; nhóm B1/B2 mà số buổi > 0
- số lần nhập viện do suy tim > tổng số lần nhập viện
- 6MWT chỉ đo 1 lần
- có ICD nhưng thiếu ngưỡng nhịp sốc
- chưa bao giờ hút thuốc nhưng số bao-năm > 0
- cảnh báo PHQ-9, NT-proBNP ≥ 1.858 pg/mL

## Công thức cho hai biểu mẫu phụ

Google Forms không tính được, nên thêm cột công thức vào bảng tính câu trả lời.

**Giờ-người tập** — dán vào ô `G1` và `H1`:

```
=ARRAYFORMULA(IF(ROW(A:A)=1;"tong_gio_nguoi";IF(A:A="";"";D:D*E:E)))
=ARRAYFORMULA(IF(ROW(A:A)=1;"tan_suat_1000";IF(A:A="";"";IFERROR(F:F/(D:D*E:E)*1000;""))))
```

**Chỉ số chương trình** — dán vào `H1`, `I1`, `J1`:

```
=ARRAYFORMULA(IF(ROW(A:A)=1;"ty_le_gioi_thieu";IF(A:A="";"";IFERROR(D:D/C:C*100;""))))
=ARRAYFORMULA(IF(ROW(A:A)=1;"ty_le_tham_gia";IF(A:A="";"";IFERROR(E:E/D:D*100;""))))
=ARRAYFORMULA(IF(ROW(A:A)=1;"ty_le_hoan_thanh";IF(A:A="";"";IFERROR(F:F/E:E*100;""))))
```

Nếu bảng tính của bạn dùng dấu phẩy thay vì chấm phẩy để ngăn tham số, đổi `;` thành `,`.

---

## Những chỗ Google Forms làm không tốt bằng Excel hay web app

Nói trước để khỏi bất ngờ giữa chừng:

**Không có ô tự tính ngay trên biểu mẫu.** Người điền không thấy BMI hay tổng SPPB tại chỗ; phải mở bảng tính mới thấy. Cảnh báo PHQ-9 cũng chỉ đến sau khi bấm Gửi (qua email, nếu đã đặt `EMAIL_CANH_BAO`) chứ không hiện ngay lúc đang hỏi. Với câu 9 PHQ-9 thì độ trễ này là điều cần cân nhắc — quy trình đề cương yêu cầu báo bác sĩ ngay.

**Không nhảy câu theo điều kiện ở mức từng ô.** Ví dụ "có ICD → mới hỏi ngưỡng sốc" thì Forms chỉ rẽ nhánh được theo cả trang, không theo từng câu. Hiện tại câu ngưỡng sốc luôn hiện, để trống nếu không có ICD.

**Ràng buộc giá trị chỉ được một luật mỗi ô.** Tôi ưu tiên chặn ngoài khoảng (`requireNumberBetween`), nên ô đáng lẽ chỉ nhận số nguyên vẫn nhận được số lẻ. Sheet `KIEM_TRA` bắt lại phần này.

**Sửa biểu mẫu sau khi đã có dữ liệu là rủi ro.** Script dò cột theo **tiêu đề câu hỏi**. Đổi chữ trong tiêu đề là cột đó mất khỏi `PHAN_TICH`. Cần sửa thì sửa trong file Excel gốc → sinh lại mã → tạo biểu mẫu mới.

**Điền một phiếu là cuộn qua 17 trang.** Excel và web app cho nhìn 20 ô cùng lúc; Forms thì mỗi câu một dòng.

Đổi lại, Forms được ba thứ Excel không có: điền trên điện thoại bất kỳ không cần cài gì, nhiều người nhập cùng lúc mà không phải gộp file, và số liệu về thẳng một bảng tính duy nhất.

## Về nơi lưu số liệu

Dữ liệu nằm trên máy chủ Google, không nằm trong bệnh viện. Bộ số liệu này đã phi định danh — chỉ có mã nghiên cứu, và mô tả biểu mẫu đã ghi rõ không nhập họ tên, số điện thoại, địa chỉ. Dù vậy đề cương và Hội đồng Đạo đức có thể có quy định riêng về nơi lưu trữ số liệu nghiên cứu, nên đối chiếu trước khi bắt đầu thu thập.

Nên đặt biểu mẫu ở chế độ chỉ người trong tổ chức mới điền được, và giới hạn quyền xem bảng tính trong nhóm nghiên cứu.

## Sinh lại mã khi bộ nhập liệu gốc thay đổi

```bash
python tools/gen_gs.py "C:\Users\...\05_BO_NHAP_LIEU_PHCN_TIM_MACH.xlsx"
```

Lệnh này đọc sheet `TU_DIEN_BIEN_SO` (nhãn, loại biến, mã hoá) và `NHAP_LIEU` (thứ tự cột, ràng buộc data-validation) rồi ghi lại `1-tao-form.gs` và `2-xu-ly-du-lieu.gs`. Không cần thư viện ngoài.

Thêm `--tong` nếu muốn quay lại kiểu hỏi **điểm tổng** của PHQ-9 / GAD-7 / MLHFQ / EQ-5D thay vì hỏi từng mục:

```bash
python tools/gen_gs.py "...xlsx" --tong
```

Bộ đọc Excel dùng chung với web app (`../nckh-tim-mach/tools/gen_dict.py`), nên từ điển biến của hai bản luôn khớp nhau.

## Cấu trúc thư mục

```
phcn-tim-mach-google-form/
├── 1-tao-form.gs         ← sinh tự động · tạo biểu mẫu chính 115 câu
├── 2-xu-ly-du-lieu.gs    ← sinh tự động · dựng PHAN_TICH, KIEM_TRA, cảnh báo email
├── 3-form-phu.gs         ← viết tay · 3 biểu mẫu phụ
└── tools/gen_gs.py       ← sinh lại 2 file .gs từ file Excel gốc
```

Bản web app chạy trong trình duyệt vẫn nằm ở `../nckh-tim-mach/`. Hai bản dùng chung một từ điển biến nên số liệu xuất ra có cùng cấu trúc — dùng bản nào cũng được, hoặc dùng song song (Forms cho tuyến ngoại trú, web app cho máy tính tại đơn vị).
