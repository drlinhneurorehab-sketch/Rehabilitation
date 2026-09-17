# PHCN-METRICS

Công cụ web lượng hóa chức năng bệnh nhân **Phục hồi chức năng**, tổ chức theo nhóm đối tượng bệnh lý, phục vụ theo dõi lâm sàng và thu thập số liệu nghiên cứu.

## Chạy trên máy tính

Không cần cài đặt, không cần internet, không cần máy chủ.

**Cách 1 — một file duy nhất (khuyến nghị khi mang sang máy khác)**
Nhấp đúp vào `dist/PHCN-METRICS.html`. Toàn bộ giao diện, mã nguồn và 53 thang điểm nằm gọn trong một file; chép qua USB hay gửi email đều chạy được.

**Cách 2 — bản đầy đủ nhiều file (khi cần chỉnh sửa)**
Nhấp đúp `index.html`, hoặc chạy `Mo-ung-dung.bat`.

**Cách 3 — máy chủ nội bộ (dùng chung trong khoa phòng)**
Chạy `Chay-may-chu.bat` (cần Python 3), rồi truy cập `http://localhost:8777`. Máy khác trong cùng mạng LAN thay `localhost` bằng địa chỉ IP của máy chạy.

### Đóng gói lại sau khi sửa mã nguồn

```bash
python build.py
```

Lệnh này tạo lại thư mục `dist/` gồm: file HTML độc lập, bản ZIP đầy đủ và tờ hướng dẫn ngắn.

## Triển khai qua GitHub Pages và dùng trên iPad

**Đưa lên GitHub**

1. Tạo repository mới, đẩy toàn bộ thư mục này lên (kéo–thả trên giao diện web cũng được).
2. `Settings → Pages → Source: Deploy from a branch → main → / (root) → Save`.
3. Sau vài phút có địa chỉ `https://<tài-khoản>.github.io/<tên-repo>/`.

Không cần bước build, không cần workflow: đây là trang tĩnh thuần, `index.html` nằm ở gốc. File `.nojekyll` đã có sẵn để GitHub phục vụ nguyên trạng.

**Cài lên iPad**

Mở địa chỉ trên bằng **Safari** → nút Chia sẻ → **Thêm vào MH chính**. Ứng dụng chạy toàn màn hình, có biểu tượng riêng, và nhờ Service Worker (`sw.js`) vẫn **chấm điểm được khi mất mạng** sau lần mở đầu tiên. Giao diện đã tối ưu cho cảm ứng: vùng chạm ≥44 px, cỡ chữ ô nhập 16 px để Safari không tự phóng to, bố cục xếp lại theo chiều dọc/ngang của iPad.

Khi phát hành phiên bản mới, tăng số `CACHE` trong `sw.js` (ví dụ `phcn-metrics-v5` → `v6`) để các iPad tự cập nhật.

**Dùng nhiều iPad cùng lúc**

Mỗi iPad lưu dữ liệu riêng và **không tự đồng bộ** (phần mềm không có máy chủ). Quy trình gộp:

1. Đặt mã người bệnh theo tiền tố từng máy: iPad 1 → `A001, A002…`, iPad 2 → `B001…` — tránh hai máy tạo trùng hồ sơ.
2. Cuối buổi, trên từng iPad: *Dữ liệu nghiên cứu → Sao lưu toàn bộ (JSON)*, gửi file về máy tổng hợp qua AirDrop hoặc email.
3. Trên máy tổng hợp: *Nhập dữ liệu → chế độ **Gộp*** — bản ghi trùng id sẽ bị bỏ qua, không nhân đôi.

GitHub Pages là trang công khai nhưng chỉ chứa **phần mềm**, không chứa dữ liệu người bệnh; mọi số liệu nằm trong chính iPad/máy tính đó.

### Lưu ý về dữ liệu

Dữ liệu lưu trong `localStorage` của trình duyệt trên chính máy đó — **không gửi đi bất kỳ đâu**. Mỗi trình duyệt giữ dữ liệu riêng, và bản một-file với bản nhiều-file cũng không dùng chung dữ liệu. Muốn chuyển: *Dữ liệu nghiên cứu → Sao lưu toàn bộ (JSON)*, rồi *Nhập dữ liệu* ở nơi cần. Hãy sao lưu sau mỗi buổi làm việc.

## Nhóm đối tượng bệnh lý

| Nhóm | Bộ công cụ cốt lõi |
|---|---|
| 🧠 Đột quỵ – vận động | NIHSS, FMA-UE, FMA-LE, **HMS (bàn tay)**, MAS, Brunnstrom, TCT, Berg, FAC, Barthel, mRS |
| 🗣️ Đột quỵ – ngôn ngữ & nuốt | WAB-AQ, BDAE-SRS, Boston Naming, đánh giá nói khó, GUSS, FOIS |
| 💭 Đột quỵ – nhận thức & tâm lý | MMSE, MoCA, TMT, Star Cancellation, CDT, PHQ-9, HADS |
| 🦴 Tổn thương tủy sống | ISNCSCI/ASIA, SCIM III, WISCI II, FIM, MAS, DN4 |
| 🦵 Khớp háng | Harris Hip Score, Oxford Hip Score, WOMAC, HOOS-JR, ROM, NRS |
| 🦿 Khớp gối | Oxford Knee Score, Lysholm, KOOS-JR, WOMAC, ROM/chu vi/LSI, TUG, 6MWT |
| 💪 Khớp vai | Constant–Murley, SPADI, QuickDASH, Oxford Shoulder Score, ROM, chóp xoay |
| ❤️ Tim mạch | NYHA, CCS, 6MWT, METs/VO₂ đỉnh, Borg, DASI, MLHFQ, HADS |
| 🫁 Hô hấp | mMRC, CAT, hô hấp ký, MIP/MEP, BODE, 6MWT, SPPB |
| 📋 Chung | Barthel, FIM, mRS, Berg, EQ-5D-5L, SPPB, TUG/10MWT/6MWT, lực nắm, NRS |
| 🧩 **Tâm lý – Giấc ngủ** *(mọi nhóm)* | **PHQ-9, GAD-7, ISI** nạp mặc định cho mọi người bệnh; tùy chọn DASS-21, CES-D, PSS-10, HADS, WHO-5, PSQI, ESS, STOP-BANG, FSS, CAM, ZBI-12 |

### Bộ cận lâm sàng theo nhóm bệnh

Mỗi nhóm bệnh lý có một bộ **cận lâm sàng riêng**, tự nạp cùng bộ cốt lõi và mặc định thu gọn. Không cộng điểm, nhưng được lưu theo thời điểm, so sánh được giữa các lần và xuất ra file nghiên cứu.

| Bộ | Nội dung |
|---|---|
| CLS-ĐQ · Đột quỵ | CT/MRI sọ (vị trí, thể tích, ASPECTS, Fazekas), Doppler cảnh – CTA, điện tâm đồ – siêu âm tim – Holter, huyết học – đông máu, glucose/HbA1c/lipid/thận/albumin/CRP, VFSS-FEES, X-quang ngực, Doppler chi dưới |
| CLS-TS · Tủy sống | MRI/CT cột sống, AO Spine – TLICS, niệu động học, siêu âm tiết niệu, cấy nước tiểu, DEXA, cốt hóa lạc chỗ, loét tì đè, SSEP/MEP/EMG |
| CLS-HÁNG | X-quang KL – khe khớp – chênh lệch chi, Garden/AO, khớp nhân tạo và chỉ định chịu lực, ARCO hoại tử chỏm, CRP/VS/Hb/DEXA |
| CLS-GỐI | X-quang chịu lực (KL, HKA), MRI dây chằng – sụn chêm – sụn khớp ICRS, siêu âm, phẫu thuật, dịch khớp, acid uric, RF/anti-CCP |
| CLS-VAI | Khoảng cùng vai – chỏm, siêu âm chóp xoay, MRI Patte – Goutallier – sụn viền – bao khớp, HbA1c, chức năng giáp |
| CLS-TIM | PCI/CABG, siêu âm tim (LVEF, E/e′, van), điện tâm đồ – Holter – thiết bị cấy, troponin – NT-proBNP – LDL-C, phân tầng AACVPR |
| CLS-HH | Khí máu động mạch, X-quang/CT ngực, **siêu âm cơ hoành** (DTF, biên độ), CRP – procalcitonin – albumin – BMI, cấy đờm |
| CLS-CHUNG | Công thức máu, sinh hóa cơ bản, albumin – prealbumin, vitamin D, TSH, HbA1c, X-quang ngực, siêu âm bụng, DEXA |

Tổng cộng **74 công cụ lượng hóa** với hơn 650 mục chấm điểm, kèm hình minh họa trực quan cho các đầu mục cần quan sát.

### Nhóm tâm thần – tâm lý – giấc ngủ

Toàn bộ nhóm này dùng được cho **mọi đối tượng bệnh lý**, vì trầm cảm, lo âu và mất ngủ làm giảm mức tham gia tập luyện và gây nhiễu kết quả của mọi thang chức năng.

| Thang | Nội dung | Thang đo | Ngưỡng |
|---|---|---|---|
| PHQ-9 | Trầm cảm | 0–27 | ≥10 vừa; lưu ý câu 9 (ý tưởng tự sát) |
| GAD-7 | Lo âu lan tỏa | 0–21 | ≥10 dương tính |
| DASS-21 | Trầm cảm · lo âu · stress | 0–63 (×2 mỗi tiểu thang) | theo từng tiểu thang |
| CES-D | Trầm cảm dịch tễ, 20 mục | 0–60 | ≥16 |
| PSS-10 | Cảm nhận stress | 0–40 | ≥27 cao |
| HADS | Lo âu & trầm cảm bệnh viện | 0–42 (A/D mỗi 0–21) | ≥8 mỗi tiểu thang |
| WHO-5 | An lạc tinh thần | 0–25 → 0–100 | <50/100 cần sàng lọc trầm cảm |
| ISI | Mức độ mất ngủ | 0–28 | ≥15 mất ngủ lâm sàng |
| PSQI | Chất lượng giấc ngủ, 7 thành phần | 0–21 | >5 kém |
| ESS | Buồn ngủ ban ngày | 0–24 | >10 quá mức |
| STOP-BANG | Sàng lọc ngừng thở khi ngủ | 0–8 | ≥3 trung bình, ≥5 cao |
| FSS | Mức độ mệt mỏi | 9–63 (TB 1–7) | TB ≥4 có ý nghĩa |
| CAM | Sàng lọc sảng (thuật toán 4 đặc điểm) | Âm/Dương | (1∧2)∧(3∨4) |
| ZBI-12 | Gánh nặng người chăm sóc | 0–48 | ≥17 cao |

## Tính năng

- **Trường chấm điểm cho từng đầu mục**: mỗi mục có ô chọn mức kèm mô tả tiếng Việt và ô hiển thị điểm đạt/điểm tối đa; mỗi phân mục có dòng tổng điểm phần; mỗi thang có tổng điểm, điểm tiểu thang và diễn giải mức độ — tính tự động ngay khi nhập.
- **Bộ thang điểm tự nạp**: chọn người bệnh là bộ cốt lõi của nhóm bệnh lý hiện ra ngay cùng toàn bộ trường chấm điểm, không phải thao tác thêm.
- **Phần Kết luận lượng giá** cuối mỗi phiếu: điểm chức năng tổng hợp 0–100, biểu đồ thanh biểu diễn mọi thang điểm thu được, bảng chi tiết (điểm đạt · thang đo · tỷ lệ · mức độ · hoàn thành) và cảnh báo thang chưa chấm đủ — in được.
- **Hình minh họa dựng bằng SVG** (không dùng file ảnh ngoài nên vẫn chạy offline):
  - *Dải ngưỡng diễn giải* dưới mỗi hộp kết quả — các vùng mức độ tô màu kèm con trỏ vị trí điểm người bệnh.
  - *Biểu đồ radar theo lĩnh vực ICF* trong phần Kết luận: chức năng cơ thể · hoạt động · tham gia · tâm lý–giấc ngủ · tổng thể.
  - *Thang mặt biểu cảm đau* 0–10 và *sơ đồ cơ thể trước/sau bấm chọn vùng đau* (35 vùng, xuất được ra CSV).
  - *Thước đo góc khớp* vẽ đúng góc đo được so với tầm bình thường (háng, gối, vai — 12 động tác).
  - *Bậc sức cơ MRC 0–5* và *mức tăng trương lực Ashworth*.
  - *Sơ đồ điểm cảm giác chìa khóa ISNCSCI* (24 mốc khoanh da, có chú giải khi rê chuột).
  - *Dải hình người minh họa mức độ* cho FAC (6 mức) và mRS (7 mức).
  - *Dải hình bàn tay 6 bậc* cho thang HMS: từ liệt mềm → gấp đồng vận → tách rời ngón trỏ → đối chiếu ngón cái với đủ 5 ngón.
- Công thức riêng cho các thang cần tính toán: WAB-AQ, Motricity Index, DASI (→ VO₂ đỉnh, METs), QuickDASH, SPADI %, WOMAC chuẩn hóa, EQ-5D mã sức khỏe.
- Bộ công cụ cốt lõi gợi ý sẵn theo nhóm bệnh lý; vẫn có thể chọn bất kỳ thang nào trong thư viện.
- **Tổng kết & so sánh nhiều lần đánh giá** (trang hồ sơ người bệnh):
  - Tóm tắt nhanh: số lần đo, số ngày theo dõi, điểm chức năng đầu vào / gần nhất / mức chênh, số thang cải thiện – xấu đi, số thang đạt MCID.
  - **So sánh hai thời điểm bất kỳ**: khối A → B, biểu đồ **radar chồng hai thời điểm** theo lĩnh vực ICF, bảng đối chiếu từng thang (điểm A · điểm B · thay đổi · biến thiên % · đạt MCID · mức độ chuyển từ gì sang gì).
  - **Bảng tổng kết toàn bộ**: hàng là thang điểm, cột là từng lần đánh giá, có thay đổi so với lần liền trước dưới mỗi ô, đường xu hướng thu nhỏ, tổng thay đổi và kết luận MCID; bật được cả tiểu thang và các đo lường khách quan.
  - Biểu đồ diễn tiến điểm chức năng tổng hợp và diễn tiến từng thang, đã đảo chiều thang "điểm cao = nặng".
  - Nút **Xuất bảng tổng kết** tạo CSV riêng cho một người bệnh (hàng = thang điểm, cột = lần đánh giá, kèm ngày thứ N kể từ khởi phát và cột MCID).
- **Ngưỡng MCID dạng số** cài sẵn cho 18 thang (Barthel 9,25 · Berg 6 · FMA-UE 5,25 · FMA-LE 6 · ARAT 5,7 · HMS 1 · NRS 2 · HHS 18 · OHS/OKS 5 · Lysholm 8,9 · Constant 10,4 · MLHFQ 5 · CAT 2 · GAD-7 4 · ISI 6 · PSQI 3 · PHQ-9 5) để phần mềm tự kết luận thay đổi có ý nghĩa lâm sàng hay chưa.
- Thư viện thang điểm tra cứu được: mục chấm điểm, ngưỡng diễn giải, tài liệu gốc, ngưỡng MCID/MDC — in được phiếu trắng.
- Xuất **CSV dạng rộng** (mỗi dòng = một lượt đánh giá, có cột "ngày thứ N kể từ khởi phát"), kèm **từ điển biến số** và **sao lưu JSON**; thống kê mô tả nhanh (n, trung bình, độ lệch chuẩn, trung vị, khoảng).

## Cấu trúc mã nguồn

```
index.html                     khung giao diện + nội dung trang Hướng dẫn
assets/css/style.css           toàn bộ giao diện, có kiểu in ấn riêng
assets/js/scales-core.js       hạ tầng thư viện + nhóm bệnh lý + thang dùng chung
assets/js/scales-neuro.js      đột quỵ (vận động, ngôn ngữ–nuốt, nhận thức) + tủy sống
assets/js/scales-msk.js        khớp háng, khớp gối, khớp vai
assets/js/scales-cardio.js     tim mạch, hô hấp
assets/js/scales-psych.js      tâm thần, tâm lý, giấc ngủ (dùng cho mọi nhóm)
assets/js/icons.js             bộ biểu tượng SVG dạng nét
assets/js/figures.js           thư viện hình minh họa SVG (radar, sơ đồ cơ thể, thước đo góc…)
assets/icons/                  biểu tượng PNG cho PWA và màn hình chính iPad
manifest.webmanifest           khai báo ứng dụng web (cài lên iPad)
sw.js                          Service Worker — chạy offline sau lần mở đầu
.nojekyll                      để GitHub Pages phục vụ nguyên trạng
assets/js/store.js             lưu trữ localStorage, bộ máy tính điểm, xuất dữ liệu
assets/js/app.js               định tuyến, biểu mẫu, biểu đồ SVG
build.py                       đóng gói ra dist/ (file đơn + ZIP)
Mo-ung-dung.bat                mở nhanh bằng trình duyệt
Chay-may-chu.bat               chạy máy chủ nội bộ cổng 8777
dist/                          bản phát hành để mang đi máy khác
```

### Thêm một thang điểm mới

Trong file thư viện tương ứng:

```js
S({
  id: 'ten_thang', short: 'TT', name: 'Tên đầy đủ',
  domain: 'activity',            // body | activity | participation | global
  max: 100, reverse: false,      // reverse: true nếu điểm cao = nặng hơn
  ref: 'Tác giả. Tạp chí. Năm', note: 'Mô tả ngắn', mcid: 'MCID ≈ …',
  groups: ['knee'], coreFor: ['knee'],
  sections: [ sec('main', 'Tiêu đề phần', [
    it('m1', 'Nội dung mục', O([0,'0 – Không'],[1,'1 – Có']))
  ])],
  interpret: band([[50,'Kém','severe'],[100,'Tốt','good']])
});
```

Các hàm hỗ trợ: `O()` lựa chọn tùy ý, `rng(max)` dải 0–max, `rngFrom(min,max)`, `yn()` có/không, `num()` ô nhập số không cộng tổng, `nums()` ô nhập số có cộng tổng, `sec()` phân mục, `band()` ngưỡng diễn giải. Thêm `subscales: [{id, name, items:['sec.item',…], max}]` cho tiểu thang và `compute(clean, raw)` cho công thức riêng.

Sau khi sửa file JS, tăng số phiên bản trong `index.html` (`?v=5` → `?v=6`) và số `CACHE` trong `sw.js` để trình duyệt nạp lại, rồi chạy `python build.py` để đóng gói lại.

## Lưu ý

- Một số công cụ (FIM, EQ-5D-5L, SCIM III, WAB, MoCA…) yêu cầu **đăng ký hoặc trả phí bản quyền** khi dùng trong nghiên cứu và công bố. Kiểm tra trước khi triển khai.
- Với nghiên cứu, nên dùng **mã ẩn danh** thay cho họ tên và tuân thủ quy định của Hội đồng đạo đức.
- Công cụ hỗ trợ tính điểm và tổ chức dữ liệu; việc chấm điểm vẫn phải do người được đào tạo thực hiện theo hướng dẫn gốc của từng thang.
