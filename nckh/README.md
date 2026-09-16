# Hệ thống quản lý đề tài nghiên cứu khoa học

Ứng dụng web cho bệnh viện: bác sĩ **gửi đề xuất đề tài trực tuyến**, bộ phận quản lý
**tiếp nhận – phân loại – theo dõi đến khi nghiệm thu**, hệ thống **tự động gửi thư xác nhận**
và thư thông báo mỗi khi trạng thái hồ sơ thay đổi.

Chạy bằng Python + Flask + SQLite. Không cần cài đặt máy chủ CSDL, không cần Node.js.

---

## 1. Khởi động

Nhấp đúp **`Chay-quan-ly-de-tai.bat`**.

Lần chạy đầu tiên, cửa sổ lệnh in ra tài khoản quản trị — **hãy chép lại ngay**:

```
TÀI KHOẢN QUẢN TRỊ VỪA ĐƯỢC TẠO
  Tên đăng nhập : quanly
  Mật khẩu      : quanly@xxxxxxxx
```

Trình duyệt tự mở `http://localhost:8080/admin`. Đăng nhập xong hệ thống **bắt buộc đổi mật khẩu**.

Muốn dừng: đóng cửa sổ lệnh hoặc nhấn `Ctrl + C`.

### Ba địa chỉ cần nhớ

| Địa chỉ | Dành cho |
|---|---|
| `http://localhost:8080/` | Bác sĩ gửi đề xuất đề tài |
| `http://localhost:8080/tra-cuu` | Bác sĩ tra cứu tiến độ hồ sơ |
| `http://localhost:8080/admin` | Bạn — quản lý toàn bộ đề tài |

---

## 2. Cho bác sĩ trong bệnh viện truy cập (mạng LAN)

Khi khởi động, cửa sổ lệnh in ra địa chỉ dạng `http://192.168.1.50:8080` — đó là địa chỉ
máy khác trong cùng mạng bệnh viện dùng để vào.

1. Máy chạy ứng dụng phải **bật liên tục** trong giờ nhận hồ sơ.
2. Lần đầu, Windows hỏi cho phép qua tường lửa → chọn **Mạng riêng (Private)** → **Cho phép**.
3. Vào **Cấu hình → Địa chỉ truy cập hệ thống**, điền đúng `http://192.168.1.50:8080`.
   Địa chỉ này được nhúng vào email gửi bác sĩ, điền sai thì link trong thư sẽ không mở được.
4. Gửi cho các khoa phòng đường dẫn `http://192.168.1.50:8080/`.

> Nên xin phòng CNTT đặt **địa chỉ IP tĩnh** cho máy này, tránh IP đổi làm hỏng các link đã gửi.

---

## 3. Bật gửi email tự động bằng Gmail

Google không cho phép đăng nhập SMTP bằng mật khẩu Gmail thông thường. Cần **Mật khẩu ứng dụng**:

1. Vào <https://myaccount.google.com/security> → bật **Xác minh 2 bước** (bắt buộc, làm một lần).
2. Vào <https://myaccount.google.com/apppasswords> → đặt tên bất kỳ (ví dụ `Quan ly de tai`)
   → Google trả về **chuỗi 16 ký tự** dạng `abcd efgh ijkl mnop`.
3. Trong ứng dụng, vào **Cấu hình** và điền:

   | Ô | Giá trị |
   |---|---|
   | Máy chủ SMTP | `smtp.gmail.com` |
   | Cổng | `587` |
   | Bảo mật | STARTTLS |
   | Tài khoản | địa chỉ Gmail của bạn |
   | Mật khẩu ứng dụng | chuỗi 16 ký tự vừa tạo (dán cả dấu cách cũng được) |
   | Email nhận thông báo hồ sơ mới | địa chỉ bạn muốn nhận báo có hồ sơ mới |

4. **Lưu cấu hình**, rồi bấm **Gửi thư kiểm tra**. Nhận được thư là xong.

Nếu báo lỗi `535 Username and Password not accepted` → đang dùng mật khẩu Gmail thường
thay vì Mật khẩu ứng dụng, hoặc chưa bật Xác minh 2 bước.

Mọi thư gửi đi đều được ghi lại ở mục **Nhật ký email** kèm kết quả thành công / lỗi.

### Ba loại thư tự động

| Thời điểm | Người nhận | Nội dung |
|---|---|---|
| Bác sĩ vừa bấm gửi hồ sơ | Chủ nhiệm đề tài | Xác nhận đã tiếp nhận, kèm **mã hồ sơ** và link theo dõi |
| Bạn đổi trạng thái hồ sơ | Chủ nhiệm đề tài | Trạng thái mới + ý kiến của hội đồng (nếu có) |
| Có hồ sơ mới gửi lên | Bộ phận quản lý | Tóm tắt hồ sơ + link mở thẳng để xử lý |

Từng loại có thể bật/tắt riêng trong **Cấu hình → Thư tự động**.

---

## 4. Quy trình xử lý một đề tài

```
Mới gửi → Đã tiếp nhận → Đang xét duyệt → Đã duyệt – triển khai
                ↑              ↓
                └── Yêu cầu bổ sung          → Chờ nghiệm thu → Đã nghiệm thu
                                              (hoặc Không phê duyệt / Tạm dừng)
```

Chín trạng thái được gom thành **ba nhóm** để lọc nhanh:

- **Đã nghiệm thu** — đề tài hoàn thành, có ngày nghiệm thu và xếp loại.
- **Chưa nghiệm thu** — đang trong quy trình (từ Mới gửi đến Chờ nghiệm thu).
- **Không tiếp tục** — không phê duyệt hoặc tạm dừng/hủy.

Khi chọn **Yêu cầu bổ sung**, tác giả nhận thư kèm ý kiến của hội đồng và mở được khung
nộp giải trình + tệp bổ sung ngay trên trang tra cứu; nộp xong hồ sơ **tự quay lại**
trạng thái *Đã tiếp nhận*.

Đổi sang *Đã tiếp nhận*, *Đã duyệt*, *Không phê duyệt*, *Đã nghiệm thu* thì hệ thống
tự điền mốc ngày tương ứng nếu ô đó còn trống.

---

## 5. Những việc làm được ở trang quản trị

**Tổng quan** — số đề tài theo nhóm nghiệm thu, theo trạng thái, theo khoa phòng, theo
lĩnh vực, theo cấp đề tài, theo năm; tổng kinh phí; danh sách hồ sơ đang chờ bạn xử lý.

**Danh mục đề tài** — tìm toàn văn (tên đề tài, chủ nhiệm, mã hồ sơ, khoa, mục tiêu) và
lọc chồng nhau theo nhóm nghiệm thu / trạng thái / năm / khoa phòng / cấp / lĩnh vực,
sáu kiểu sắp xếp, phân trang 25 hồ sơ.

**Chi tiết hồ sơ** —
chuyển trạng thái kèm ý kiến gửi cho chủ nhiệm ·
ghi nhận xét (chọn cho tác giả xem hay chỉ nội bộ) ·
soạn thư gửi riêng ·
sửa mọi thông tin, nhập hội đồng – ngày nghiệm thu – xếp loại – điểm ·
tải lên/xuống tệp đính kèm · xem toàn bộ lịch sử xử lý và thư đã gửi.

**Xuất Excel** — nút *Xuất Excel (CSV)* xuất đúng tập hồ sơ đang lọc, 27 cột, mở bằng
Excel không lỗi phông tiếng Việt. Dùng để làm báo cáo tổng kết NCKH hằng năm.

---

## 6. Dữ liệu nằm ở đâu

Toàn bộ nằm trong thư mục `data/`:

- `nckh.db` — cơ sở dữ liệu SQLite (đề tài, nhật ký, người dùng, nhật ký email)
- `uploads/` — tệp đính kèm do bác sĩ và bạn tải lên
- `cauhinh.json` — cấu hình, **có chứa mật khẩu ứng dụng Gmail** → không chia sẻ, không đưa lên GitHub

**Sao lưu:** đóng ứng dụng rồi chép cả thư mục `data/` sang ổ khác. Nên làm hằng tuần.

**Xóa sạch để bắt đầu lại:** đóng ứng dụng, xóa `data/nckh.db*`, `data/cauhinh.json` và
mọi tệp trong `data/uploads/`, rồi chạy lại — hệ thống tạo tài khoản quản trị mới.

---

## 7. Đưa lên internet để bác sĩ dùng ngoài viện

Ứng dụng chạy được nguyên trạng trên Render / Railway / Fly.io (gói miễn phí):

- Lệnh khởi động: `python app.py`
- Biến môi trường: `PORT`, `SECRET_KEY`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_QUAN_LY`,
  `DIA_CHI_UNG_DUNG` (đặt bằng đúng địa chỉ https công khai)
- Gắn **ổ đĩa lưu trữ bền (persistent disk)** vào thư mục `data/`, nếu không thì mỗi lần
  triển khai lại sẽ mất toàn bộ hồ sơ.

Lưu ý pháp lý: hồ sơ đề tài có thể chứa thông tin nghiên cứu chưa công bố. Khi đưa ra
internet, nên bật HTTPS (các nền tảng trên bật sẵn) và cân nhắc quy định bảo mật của bệnh viện.

---

## 8. Cấu trúc mã nguồn

```
nckh/
├── app.py                    Toàn bộ định tuyến Flask
├── core/
│   ├── constants.py          Danh mục: trạng thái, cấp đề tài, lĩnh vực, xếp loại
│   ├── config.py             Đọc/ghi cấu hình (data/cauhinh.json + biến môi trường)
│   ├── db.py                 Lược đồ SQLite, sinh mã hồ sơ, ghi nhật ký
│   └── mailer.py             Hàng đợi gửi thư chạy nền + khuôn thư HTML
├── templates/                Giao diện (Jinja2), toàn bộ tiếng Việt
├── static/css/style.css      Giao diện dùng chung, có sẵn chế độ tối
└── data/                     CSDL, tệp đính kèm, cấu hình (không đưa lên GitHub)
```

Sửa danh mục khoa phòng gợi ý: mở `templates/gui_de_tai.html`, tìm `<datalist id="ds_khoa">`.
Thêm/bớt trạng thái, lĩnh vực, cấp đề tài: sửa `core/constants.py`.
