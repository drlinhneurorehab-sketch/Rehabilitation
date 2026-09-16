# -*- coding: utf-8 -*-
"""Lớp truy cập CSDL SQLite."""
import sqlite3
import secrets
from datetime import datetime, timezone, timedelta

from werkzeug.security import generate_password_hash

from . import config

MUI_GIO_VN = timezone(timedelta(hours=7))

SCHEMA = """
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS de_tai (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_ho_so            TEXT    NOT NULL UNIQUE,
    ma_tra_cuu          TEXT    NOT NULL UNIQUE,
    nam                 INTEGER NOT NULL,

    ten_de_tai          TEXT    NOT NULL,
    cap_de_tai          TEXT    NOT NULL DEFAULT 'co_so',
    linh_vuc            TEXT    NOT NULL DEFAULT 'lam_sang',

    cn_hoc_vi           TEXT    DEFAULT '',
    cn_ho_ten           TEXT    NOT NULL,
    cn_chuc_vu          TEXT    DEFAULT '',
    khoa_phong          TEXT    DEFAULT '',
    cn_email            TEXT    NOT NULL,
    cn_dien_thoai       TEXT    DEFAULT '',
    thanh_vien          TEXT    DEFAULT '',

    dat_van_de          TEXT    DEFAULT '',
    muc_tieu            TEXT    DEFAULT '',
    doi_tuong_pp        TEXT    DEFAULT '',
    san_pham            TEXT    DEFAULT '',
    dao_duc             TEXT    DEFAULT 'chua',

    du_kien_bat_dau     TEXT    DEFAULT '',
    du_kien_ket_thuc    TEXT    DEFAULT '',
    kinh_phi            INTEGER DEFAULT 0,
    nguon_kinh_phi      TEXT    DEFAULT '',

    trang_thai          TEXT    NOT NULL DEFAULT 'moi',
    ngay_gui            TEXT    NOT NULL,
    ngay_tiep_nhan      TEXT    DEFAULT '',
    ngay_hop_duyet      TEXT    DEFAULT '',
    ngay_nghiem_thu     TEXT    DEFAULT '',
    hoi_dong            TEXT    DEFAULT '',
    xep_loai            TEXT    DEFAULT '',
    diem_nghiem_thu     REAL,
    ghi_chu             TEXT    DEFAULT '',
    cap_nhat_luc        TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dt_trang_thai ON de_tai(trang_thai);
CREATE INDEX IF NOT EXISTS idx_dt_nam        ON de_tai(nam);
CREATE INDEX IF NOT EXISTS idx_dt_khoa       ON de_tai(khoa_phong);

CREATE TABLE IF NOT EXISTS tep (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    de_tai_id    INTEGER NOT NULL REFERENCES de_tai(id) ON DELETE CASCADE,
    ten_goc      TEXT NOT NULL,
    ten_luu      TEXT NOT NULL,
    kich_thuoc   INTEGER NOT NULL DEFAULT 0,
    nguoi_tai    TEXT DEFAULT 'tac_gia',
    ngay_tai_len TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tep_dt ON tep(de_tai_id);

CREATE TABLE IF NOT EXISTS nhat_ky (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    de_tai_id      INTEGER NOT NULL REFERENCES de_tai(id) ON DELETE CASCADE,
    thoi_gian      TEXT NOT NULL,
    loai           TEXT NOT NULL DEFAULT 'ghi_chu',
    trang_thai_cu  TEXT DEFAULT '',
    trang_thai_moi TEXT DEFAULT '',
    noi_dung       TEXT DEFAULT '',
    nguoi_thuc_hien TEXT DEFAULT '',
    cong_khai      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_nk_dt ON nhat_ky(de_tai_id);

CREATE TABLE IF NOT EXISTS nguoi_dung (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    ten_dang_nhap TEXT NOT NULL UNIQUE,
    mat_khau_hash TEXT NOT NULL,
    ho_ten        TEXT DEFAULT '',
    email         TEXT DEFAULT '',
    vai_tro       TEXT NOT NULL DEFAULT 'quan_ly',
    doi_mat_khau  INTEGER NOT NULL DEFAULT 0,
    tao_luc       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    de_tai_id  INTEGER,
    den        TEXT NOT NULL,
    tieu_de    TEXT NOT NULL,
    noi_dung   TEXT NOT NULL,
    thoi_gian  TEXT NOT NULL,
    trang_thai TEXT NOT NULL DEFAULT 'cho',
    loi        TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_el_tg ON email_log(thoi_gian DESC);
"""


def bay_gio():
    return datetime.now(MUI_GIO_VN).strftime("%Y-%m-%d %H:%M:%S")


def ket_noi():
    config.THU_MUC_DATA.mkdir(parents=True, exist_ok=True)
    cn = sqlite3.connect(config.DUONG_DAN_DB, timeout=15)
    cn.row_factory = sqlite3.Row
    cn.execute("PRAGMA foreign_keys = ON")
    return cn


def khoi_tao():
    """Tạo bảng nếu chưa có và tạo tài khoản quản trị mặc định.

    Trả về mật khẩu khởi tạo nếu vừa tạo tài khoản mới, ngược lại None.
    """
    config.THU_MUC_UPLOAD.mkdir(parents=True, exist_ok=True)
    with ket_noi() as cn:
        cn.executescript(SCHEMA)
        co = cn.execute("SELECT COUNT(*) c FROM nguoi_dung").fetchone()["c"]
        if co:
            return None
        mk = "quanly@" + secrets.token_hex(4)
        cn.execute(
            "INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, vai_tro,"
            " doi_mat_khau, tao_luc) VALUES (?,?,?,?,1,?)",
            ("quanly", generate_password_hash(mk), "Quản lý NCKH", "quan_tri", bay_gio()),
        )
        return mk


def sinh_ma_ho_so(cn, nam):
    """Sinh mã hồ sơ dạng DT-2026-001, không trùng trong cùng năm."""
    tien_to = f"DT-{nam}-"
    hang = cn.execute(
        "SELECT ma_ho_so FROM de_tai WHERE ma_ho_so LIKE ? ORDER BY id DESC LIMIT 1",
        (tien_to + "%",),
    ).fetchone()
    stt = 1
    if hang:
        duoi = hang["ma_ho_so"].rsplit("-", 1)[-1]
        if duoi.isdigit():
            stt = int(duoi) + 1
    while cn.execute("SELECT 1 FROM de_tai WHERE ma_ho_so=?",
                     (f"{tien_to}{stt:03d}",)).fetchone():
        stt += 1
    return f"{tien_to}{stt:03d}"


def ghi_nhat_ky(cn, de_tai_id, loai, noi_dung="", tt_cu="", tt_moi="",
                nguoi="", cong_khai=0):
    cn.execute(
        "INSERT INTO nhat_ky (de_tai_id, thoi_gian, loai, trang_thai_cu,"
        " trang_thai_moi, noi_dung, nguoi_thuc_hien, cong_khai)"
        " VALUES (?,?,?,?,?,?,?,?)",
        (de_tai_id, bay_gio(), loai, tt_cu, tt_moi, noi_dung, nguoi, cong_khai),
    )
