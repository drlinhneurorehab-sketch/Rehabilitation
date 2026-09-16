# -*- coding: utf-8 -*-
"""Gửi email tự động (chạy nền, không làm chậm thao tác của người dùng)."""
import html
import queue
import smtplib
import ssl
import threading
import time
import traceback
from email.message import EmailMessage
from email.utils import formataddr, formatdate

from . import config, db
from .constants import ten_trang_thai, CAP_DE_TAI, XEP_LOAI

_hang_doi = queue.Queue()
_luong = None
_khoa = threading.Lock()


# --------------------------------------------------------------------------- #
#  Gửi thật qua SMTP
# --------------------------------------------------------------------------- #
def _gui_smtp(ch, den, tieu_de, than_text, than_html):
    tu = config.dia_chi_gui(ch)
    thu = EmailMessage()
    thu["Subject"] = tieu_de
    thu["From"] = formataddr((str(ch.get("ten_nguoi_gui") or "Ban Quan ly NCKH"), tu))
    thu["To"] = den
    thu["Date"] = formatdate(localtime=True)
    thu.set_content(than_text)
    thu.add_alternative(than_html, subtype="html")

    host, cong = ch["smtp_host"], int(ch["smtp_port"])
    bao_mat = (ch.get("smtp_bao_mat") or "starttls").lower()
    ctx = ssl.create_default_context()

    if bao_mat == "ssl":
        may = smtplib.SMTP_SSL(host, cong, timeout=30, context=ctx)
    else:
        may = smtplib.SMTP(host, cong, timeout=30)
    with may:
        may.ehlo()
        if bao_mat == "starttls":
            may.starttls(context=ctx)
            may.ehlo()
        if ch.get("smtp_tai_khoan"):
            may.login(ch["smtp_tai_khoan"], ch["smtp_mat_khau"])
        may.send_message(thu)


def _xu_ly(viec):
    cn = db.ket_noi()
    try:
        cur = cn.execute(
            "INSERT INTO email_log (de_tai_id, den, tieu_de, noi_dung, thoi_gian,"
            " trang_thai) VALUES (?,?,?,?,?,'cho')",
            (viec.get("de_tai_id"), viec["den"], viec["tieu_de"],
             viec["text"], db.bay_gio()),
        )
        log_id = cur.lastrowid
        cn.commit()

        ch = config.nap()
        if not config.email_da_cau_hinh(ch):
            cn.execute("UPDATE email_log SET trang_thai='bo_qua',"
                       " loi='Chưa cấu hình SMTP hoặc đã tắt gửi email' WHERE id=?",
                       (log_id,))
            cn.commit()
            return
        try:
            _gui_smtp(ch, viec["den"], viec["tieu_de"], viec["text"], viec["html"])
            cn.execute("UPDATE email_log SET trang_thai='da_gui' WHERE id=?", (log_id,))
        except Exception as e:                                  # noqa: BLE001
            cn.execute("UPDATE email_log SET trang_thai='loi', loi=? WHERE id=?",
                       ("{}: {}".format(type(e).__name__, e), log_id))
        cn.commit()
    except Exception:                                           # noqa: BLE001
        traceback.print_exc()
    finally:
        cn.close()


def _vong_lap():
    while True:
        viec = _hang_doi.get()
        if viec is None:
            break
        _xu_ly(viec)
        _hang_doi.task_done()


def khoi_dong():
    global _luong
    with _khoa:
        if _luong is None or not _luong.is_alive():
            _luong = threading.Thread(target=_vong_lap, daemon=True, name="gui-email")
            _luong.start()


def xep_hang(den, tieu_de, than_text, than_html, de_tai_id=None):
    """Đưa một thư vào hàng đợi. Không bao giờ ném lỗi ra ngoài."""
    if not den or "@" not in den:
        return False
    khoi_dong()
    _hang_doi.put({"den": den.strip(), "tieu_de": tieu_de, "text": than_text,
                   "html": than_html, "de_tai_id": de_tai_id})
    return True


def cho_gui_xong(giay=25):
    """Dùng khi gửi thư kiểm tra cấu hình — chờ hàng đợi cạn."""
    het = time.time() + giay
    while not _hang_doi.empty() and time.time() < het:
        time.sleep(0.2)
    time.sleep(0.4)


# --------------------------------------------------------------------------- #
#  Khuôn thư
# --------------------------------------------------------------------------- #
_CSS = ("font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;"
        "font-size:15px;line-height:1.65;color:#1f2937;")


def _khung(ch, tieu_de_trong_thu, than_html):
    don_vi = html.escape(str(ch.get("ten_don_vi") or "Bệnh viện"))
    phong = html.escape(str(ch.get("ten_phong_ban") or ""))
    return (
        '<!doctype html><html lang="vi"><body style="margin:0;background:#f3f4f6;padding:24px 12px;">'
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">'
        '<table role="presentation" width="620" cellpadding="0" cellspacing="0"'
        ' style="max-width:620px;width:100%;background:#ffffff;border-radius:12px;'
        'overflow:hidden;border:1px solid #e5e7eb;' + _CSS + '">'
        '<tr><td style="background:#0f766e;color:#ffffff;padding:20px 26px;">'
        '<div style="font-size:13px;letter-spacing:.06em;text-transform:uppercase;opacity:.85;">'
        + don_vi + '</div>'
        '<div style="font-size:19px;font-weight:600;margin-top:2px;">'
        + html.escape(tieu_de_trong_thu) + '</div></td></tr>'
        '<tr><td style="padding:26px;">' + than_html + '</td></tr>'
        '<tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 26px;'
        'font-size:12.5px;color:#6b7280;">'
        'Thư được gửi tự động từ Hệ thống quản lý đề tài khoa học – ' + phong + '.<br>'
        'Vui lòng không trả lời trực tiếp thư này; mọi trao đổi xin liên hệ bộ phận quản lý NCKH.'
        '</td></tr></table></td></tr></table></body></html>'
    )


def _bang(cac_dong):
    o = "".join(
        '<tr><td style="padding:5px 12px 5px 0;color:#6b7280;white-space:nowrap;'
        'vertical-align:top;">' + html.escape(str(k)) + '</td>'
        '<td style="padding:5px 0;font-weight:600;">' + html.escape(str(v)) + '</td></tr>'
        for k, v in cac_dong if v
    )
    return ('<table role="presentation" style="border-collapse:collapse;font-size:14.5px;">'
            + o + '</table>')


def _nut(link, chu):
    return ('<p style="margin:22px 0 4px;"><a href="' + html.escape(link) + '"'
            ' style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;'
            'padding:11px 20px;border-radius:8px;font-weight:600;">' + html.escape(chu) + '</a></p>')


def _link_tra_cuu(ch, dt):
    goc = str(ch.get("dia_chi_ung_dung") or "").rstrip("/")
    return "{}/tra-cuu/{}".format(goc, dt["ma_tra_cuu"])


# --- 1. Thư xác nhận đã nhận hồ sơ (gửi ngay cho bác sĩ) --------------------- #
def thu_xac_nhan(dt):
    ch = config.nap()
    link = _link_tra_cuu(ch, dt)
    ten_gui = "{} {}".format(dt["cn_hoc_vi"] or "", dt["cn_ho_ten"]).strip()
    tieu_de = "[{}] Đã tiếp nhận hồ sơ đề xuất đề tài khoa học".format(dt["ma_ho_so"])

    text = """Kính gửi {ten},

{phong} xác nhận đã tiếp nhận hồ sơ đề xuất đề tài nghiên cứu khoa học của Ông/Bà.

  Mã hồ sơ     : {ma}
  Tên đề tài   : {ten_dt}
  Cấp đề tài   : {cap}
  Thời gian nộp: {ngay}
  Trạng thái   : {tt}

Hồ sơ sẽ được rà soát và đưa ra Hội đồng Khoa học xem xét. Ông/Bà sẽ nhận được
thư thông báo mỗi khi trạng thái hồ sơ thay đổi.

Theo dõi tiến độ hồ sơ tại: {link}

Đề nghị Ông/Bà lưu lại mã hồ sơ {ma} để tiện tra cứu và liên hệ.

Trân trọng cảm ơn,
{phong}
{don_vi}""".format(ten=ten_gui, phong=ch.get("ten_phong_ban"), ma=dt["ma_ho_so"],
                   ten_dt=dt["ten_de_tai"],
                   cap=CAP_DE_TAI.get(dt["cap_de_tai"], dt["cap_de_tai"]),
                   ngay=dt["ngay_gui"], tt=ten_trang_thai(dt["trang_thai"]),
                   link=link, don_vi=ch.get("ten_don_vi"))

    than = (
        "<p>Kính gửi <strong>" + html.escape(ten_gui) + "</strong>,</p>"
        "<p>" + html.escape(str(ch.get("ten_phong_ban"))) + " xin xác nhận "
        "<strong>đã tiếp nhận</strong> hồ sơ đề xuất đề tài nghiên cứu khoa học của Ông/Bà.</p>"
        + _bang([
            ("Mã hồ sơ", dt["ma_ho_so"]),
            ("Tên đề tài", dt["ten_de_tai"]),
            ("Cấp đề tài", CAP_DE_TAI.get(dt["cap_de_tai"], dt["cap_de_tai"])),
            ("Thời gian nộp", dt["ngay_gui"]),
            ("Trạng thái", ten_trang_thai(dt["trang_thai"])),
        ])
        + "<p style='margin-top:18px;'>Hồ sơ sẽ được rà soát và đưa ra Hội đồng Khoa học "
          "xem xét. Ông/Bà sẽ nhận được thư thông báo mỗi khi trạng thái hồ sơ thay đổi.</p>"
        + _nut(link, "Theo dõi tiến độ hồ sơ")
        + "<p style='color:#6b7280;font-size:13.5px;'>Xin lưu lại mã hồ sơ <strong>"
        + html.escape(dt["ma_ho_so"]) + "</strong> để tiện tra cứu và liên hệ.</p>"
    )
    return tieu_de, text, _khung(ch, "Xác nhận tiếp nhận hồ sơ", than)


# --- 2. Thư thông báo đổi trạng thái ---------------------------------------- #
_LOI_NHAN = {
    "da_tiep_nhan":   "Hồ sơ đã được bộ phận quản lý tiếp nhận và đưa vào danh mục theo dõi.",
    "dang_xet_duyet": "Hồ sơ đang được Hội đồng Khoa học xem xét, thẩm định.",
    "bo_sung":        "Hội đồng đề nghị Ông/Bà chỉnh sửa, bổ sung hồ sơ theo nội dung dưới đây.",
    "da_duyet":       "Chúc mừng! Đề tài đã được phê duyệt và chính thức được triển khai.",
    "cho_nghiem_thu": "Đề tài đã hoàn thành giai đoạn triển khai và đang chờ tổ chức nghiệm thu.",
    "da_nghiem_thu":  "Đề tài đã được Hội đồng nghiệm thu thông qua. Xin chúc mừng!",
    "khong_duyet":    "Rất tiếc, đề tài chưa được Hội đồng phê duyệt trong đợt xét lần này.",
    "tam_dung":       "Đề tài được ghi nhận tạm dừng / hủy theo quyết định của Hội đồng.",
    "moi":            "Hồ sơ được đưa trở lại trạng thái mới gửi.",
}


def thu_doi_trang_thai(dt, tt_moi, nhan_xet=""):
    ch = config.nap()
    link = _link_tra_cuu(ch, dt)
    ten_gui = "{} {}".format(dt["cn_hoc_vi"] or "", dt["cn_ho_ten"]).strip()
    ten_tt = ten_trang_thai(tt_moi)
    tieu_de = "[{}] Cập nhật trạng thái: {}".format(dt["ma_ho_so"], ten_tt)
    loi = _LOI_NHAN.get(tt_moi, "Trạng thái hồ sơ vừa được cập nhật.")

    dong = [("Mã hồ sơ", dt["ma_ho_so"]), ("Tên đề tài", dt["ten_de_tai"]),
            ("Trạng thái mới", ten_tt)]
    if tt_moi == "da_nghiem_thu":
        dong.append(("Ngày nghiệm thu", dt["ngay_nghiem_thu"]))
        dong.append(("Xếp loại", XEP_LOAI.get(dt["xep_loai"] or "", "")))

    text = """Kính gửi {ten},

{loi}

  Mã hồ sơ      : {ma}
  Tên đề tài    : {ten_dt}
  Trạng thái mới: {tt}
""".format(ten=ten_gui, loi=loi, ma=dt["ma_ho_so"], ten_dt=dt["ten_de_tai"], tt=ten_tt)
    if nhan_xet:
        text += "\nÝ kiến của bộ phận quản lý / Hội đồng:\n" + nhan_xet + "\n"
    text += "\nXem chi tiết hồ sơ tại: {}\n\nTrân trọng,\n{}\n{}".format(
        link, ch.get("ten_phong_ban"), ch.get("ten_don_vi"))

    than = ("<p>Kính gửi <strong>" + html.escape(ten_gui) + "</strong>,</p>"
            "<p>" + html.escape(loi) + "</p>" + _bang(dong))
    if nhan_xet:
        than += ("<div style='margin-top:18px;padding:14px 16px;background:#fffbeb;"
                 "border-left:4px solid #f59e0b;border-radius:6px;'>"
                 "<div style='font-weight:600;margin-bottom:6px;'>"
                 "Ý kiến của bộ phận quản lý / Hội đồng</div>"
                 "<div style='white-space:pre-wrap;'>" + html.escape(nhan_xet) + "</div></div>")
    than += _nut(link, "Xem chi tiết hồ sơ")
    return tieu_de, text, _khung(ch, "Cập nhật trạng thái hồ sơ", than)


# --- 3. Thư báo cho quản lý khi có hồ sơ mới -------------------------------- #
def thu_bao_quan_ly(dt):
    ch = config.nap()
    goc = str(ch.get("dia_chi_ung_dung") or "").rstrip("/")
    link = "{}/admin/de-tai/{}".format(goc, dt["id"])
    tieu_de = "[Hồ sơ mới] {} – {}".format(dt["ma_ho_so"], dt["ten_de_tai"][:70])
    dong = [("Mã hồ sơ", dt["ma_ho_so"]), ("Tên đề tài", dt["ten_de_tai"]),
            ("Chủ nhiệm", "{} {}".format(dt["cn_hoc_vi"] or "", dt["cn_ho_ten"]).strip()),
            ("Khoa/Phòng", dt["khoa_phong"]), ("Email", dt["cn_email"]),
            ("Điện thoại", dt["cn_dien_thoai"]),
            ("Cấp đề tài", CAP_DE_TAI.get(dt["cap_de_tai"], dt["cap_de_tai"])),
            ("Thời gian nộp", dt["ngay_gui"])]
    text = ("Có hồ sơ đề xuất đề tài mới:\n\n"
            + "\n".join("  {}: {}".format(k, v) for k, v in dong if v)
            + "\n\nXử lý tại: " + link + "\n")
    than = ("<p>Có <strong>hồ sơ đề xuất đề tài mới</strong> vừa được gửi lên hệ thống.</p>"
            + _bang(dong) + _nut(link, "Mở hồ sơ để xử lý"))
    return tieu_de, text, _khung(ch, "Hồ sơ đề xuất mới", than)


def thu_kiem_tra():
    ch = config.nap()
    than = ("<p>Đây là thư kiểm tra cấu hình gửi email của "
            "<strong>Hệ thống quản lý đề tài khoa học</strong>.</p>"
            "<p>Nếu Ông/Bà nhận được thư này, chức năng gửi thư tự động "
            "đã hoạt động bình thường.</p>")
    return ("Kiểm tra cấu hình email – Hệ thống quản lý đề tài khoa học",
            "Thư kiểm tra cấu hình gửi email. Nếu nhận được thư này, cấu hình SMTP đã hoạt động.",
            _khung(ch, "Thư kiểm tra cấu hình", than))
