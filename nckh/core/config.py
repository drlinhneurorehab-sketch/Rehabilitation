# -*- coding: utf-8 -*-
"""Đọc / ghi cấu hình hệ thống (lưu trong data/cauhinh.json)."""
import json
import os
import secrets
from pathlib import Path

GOC = Path(__file__).resolve().parent.parent
THU_MUC_DATA = GOC / "data"
THU_MUC_UPLOAD = THU_MUC_DATA / "uploads"
DUONG_DAN_DB = THU_MUC_DATA / "nckh.db"
DUONG_DAN_CAUHINH = THU_MUC_DATA / "cauhinh.json"

MAC_DINH = {
    "ten_don_vi": "Bệnh viện",
    "ten_phong_ban": "Phòng Chỉ đạo tuyến – Nghiên cứu khoa học",
    "dia_chi_ung_dung": "http://localhost:8080",

    # Gmail: dùng Mật khẩu ứng dụng (App Password) 16 ký tự, KHÔNG dùng mật khẩu Gmail thường
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_bao_mat": "starttls",          # starttls | ssl | khong
    "smtp_tai_khoan": "",
    "smtp_mat_khau": "",
    "email_nguoi_gui": "",               # để trống -> dùng smtp_tai_khoan
    "ten_nguoi_gui": "Ban Quản lý NCKH",
    "email_quan_ly": "",                 # nơi nhận thông báo khi có hồ sơ mới

    "bat_email": True,                   # bật/tắt toàn bộ chức năng gửi email
    "tu_dong_bao_nhan": True,            # tự động thư xác nhận khi bác sĩ vừa gửi hồ sơ
    "tu_dong_bao_doi_trang_thai": True,  # tự động thư khi quản lý đổi trạng thái
    "tu_dong_bao_quan_ly": True,         # thư báo cho quản lý khi có hồ sơ mới

    "secret_key": "",
}


def _nap_tu_dia():
    if DUONG_DAN_CAUHINH.exists():
        try:
            return json.loads(DUONG_DAN_CAUHINH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {}
    return {}


def nap():
    """Trả về cấu hình đầy đủ: mặc định <- file <- biến môi trường."""
    ch = dict(MAC_DINH)
    ch.update(_nap_tu_dia())

    # Biến môi trường ghi đè (tiện khi triển khai lên hosting)
    anh_xa_env = {
        "SMTP_HOST": "smtp_host", "SMTP_PORT": "smtp_port",
        "SMTP_USER": "smtp_tai_khoan", "SMTP_PASS": "smtp_mat_khau",
        "SMTP_FROM": "email_nguoi_gui", "EMAIL_QUAN_LY": "email_quan_ly",
        "DIA_CHI_UNG_DUNG": "dia_chi_ung_dung", "SECRET_KEY": "secret_key",
    }
    for bien, khoa in anh_xa_env.items():
        gt = os.environ.get(bien)
        if gt:
            ch[khoa] = int(gt) if khoa == "smtp_port" and gt.isdigit() else gt

    if not ch.get("secret_key"):
        ch["secret_key"] = secrets.token_hex(32)
        luu({"secret_key": ch["secret_key"]})
    return ch


def luu(thay_doi: dict):
    """Cập nhật một phần cấu hình rồi ghi xuống đĩa."""
    THU_MUC_DATA.mkdir(parents=True, exist_ok=True)
    hien_tai = _nap_tu_dia()
    hien_tai.update(thay_doi)
    tam = DUONG_DAN_CAUHINH.with_suffix(".json.tmp")
    tam.write_text(json.dumps(hien_tai, ensure_ascii=False, indent=2), encoding="utf-8")
    tam.replace(DUONG_DAN_CAUHINH)
    return hien_tai


def dia_chi_gui(ch=None):
    ch = ch or nap()
    return ch.get("email_nguoi_gui") or ch.get("smtp_tai_khoan") or ""


def email_da_cau_hinh(ch=None):
    ch = ch or nap()
    return bool(ch.get("bat_email") and ch.get("smtp_host")
                and ch.get("smtp_tai_khoan") and ch.get("smtp_mat_khau"))
