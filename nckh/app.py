# -*- coding: utf-8 -*-
"""Hệ thống quản lý đề tài nghiên cứu khoa học cấp bệnh viện.

Chạy:  python app.py           (mặc định http://0.0.0.0:8080)
"""
import csv
import io
import os
import re
import secrets
import sys
from datetime import datetime
from functools import wraps
from pathlib import Path

from flask import (Flask, abort, flash, g, jsonify, redirect, render_template,
                   request, send_file, session, url_for)
from werkzeug.security import check_password_hash, generate_password_hash

from core import config, db, mailer
from core.constants import (CAP_DE_TAI, DUNG_LUONG_TOI_DA, DUOI_TEP_CHO_PHEP,
                            HOC_VI, LINH_VUC, NHOM_TRANG_THAI, TRANG_THAI,
                            TRANG_THAI_CHO_SUA, XEP_LOAI, mau_trang_thai,
                            nhom_cua_trang_thai, ten_trang_thai)

app = Flask(__name__)
CH = config.nap()
app.secret_key = CH["secret_key"]
app.config["MAX_CONTENT_LENGTH"] = 80 * 1024 * 1024      # tổng dung lượng 1 lần gửi
app.jinja_env.trim_blocks = True
app.jinja_env.lstrip_blocks = True


# --------------------------------------------------------------------------- #
#  Hạ tầng
# --------------------------------------------------------------------------- #
def csdl():
    if "db" not in g:
        g.db = db.ket_noi()
    return g.db


@app.teardown_appcontext
def _dong_csdl(_e=None):
    cn = g.pop("db", None)
    if cn is not None:
        cn.close()


@app.context_processor
def _bien_chung():
    ch = config.nap()
    return {
        "TRANG_THAI": TRANG_THAI, "NHOM_TRANG_THAI": NHOM_TRANG_THAI,
        "CAP_DE_TAI": CAP_DE_TAI, "LINH_VUC": LINH_VUC, "XEP_LOAI": XEP_LOAI,
        "HOC_VI": HOC_VI, "ten_trang_thai": ten_trang_thai,
        "mau_trang_thai": mau_trang_thai, "nhom_cua_trang_thai": nhom_cua_trang_thai,
        "cauhinh": ch, "nguoi_dang_nhap": session.get("ho_ten"),
        "email_san_sang": config.email_da_cau_hinh(ch),
        "nam_nay": datetime.now(db.MUI_GIO_VN).year,
    }


@app.template_filter("tien")
def _loc_tien(v):
    try:
        return "{:,.0f}".format(float(v)).replace(",", ".")
    except (TypeError, ValueError):
        return "0"


@app.template_filter("ngay")
def _loc_ngay(v):
    if not v:
        return "—"
    s = str(v)[:10]
    try:
        return datetime.strptime(s, "%Y-%m-%d").strftime("%d/%m/%Y")
    except ValueError:
        return s


@app.template_filter("dung_luong")
def _loc_dung_luong(v):
    v = float(v or 0)
    for dv in ("B", "KB", "MB", "GB"):
        if v < 1024 or dv == "GB":
            return ("{:.0f} {}" if dv == "B" else "{:.1f} {}").format(v, dv)
        v /= 1024


def can_dang_nhap(f):
    @wraps(f)
    def bao(*a, **kw):
        if not session.get("uid"):
            return redirect(url_for("dang_nhap", tiep=request.full_path))
        return f(*a, **kw)
    return bao


# --------------------------------------------------------------------------- #
#  Tiện ích
# --------------------------------------------------------------------------- #
RE_EMAIL = re.compile(r"^[^@\s]+@[^@\s.]+\.[^@\s]+$")


def _t(ten, mac_dinh=""):
    return (request.form.get(ten) or mac_dinh).strip()


def _so(ten):
    gt = re.sub(r"[^\d]", "", request.form.get(ten) or "")
    return int(gt) if gt else 0


def _luu_tep(cn, de_tai_id, cac_tep, nguoi="tac_gia"):
    """Lưu danh sách FileStorage; trả về (số tệp đã lưu, danh sách lỗi)."""
    da_luu, loi = 0, []
    for tep in cac_tep:
        if not tep or not tep.filename:
            continue
        ten_goc = os.path.basename(tep.filename)[:200]
        duoi = Path(ten_goc).suffix.lower()
        if duoi not in DUOI_TEP_CHO_PHEP:
            loi.append("Không nhận tệp “{}” (định dạng không được phép).".format(ten_goc))
            continue
        du_lieu = tep.read()
        if len(du_lieu) > DUNG_LUONG_TOI_DA:
            loi.append("Tệp “{}” vượt quá 25 MB.".format(ten_goc))
            continue
        if not du_lieu:
            continue
        ten_luu = "{}_{}{}".format(datetime.now().strftime("%Y%m%d%H%M%S"),
                                   secrets.token_hex(6), duoi)
        config.THU_MUC_UPLOAD.mkdir(parents=True, exist_ok=True)
        (config.THU_MUC_UPLOAD / ten_luu).write_bytes(du_lieu)
        cn.execute(
            "INSERT INTO tep (de_tai_id, ten_goc, ten_luu, kich_thuoc, nguoi_tai,"
            " ngay_tai_len) VALUES (?,?,?,?,?,?)",
            (de_tai_id, ten_goc, ten_luu, len(du_lieu), nguoi, db.bay_gio()))
        da_luu += 1
    return da_luu, loi


def _lay_de_tai(dieu_kien, tham_so):
    return csdl().execute(
        "SELECT * FROM de_tai WHERE " + dieu_kien, tham_so).fetchone()


# --------------------------------------------------------------------------- #
#  PHẦN CÔNG KHAI — dành cho bác sĩ
# --------------------------------------------------------------------------- #
@app.route("/")
def trang_chu():
    return render_template("gui_de_tai.html", form={}, loi=[])


@app.post("/gui")
def gui_de_tai():
    f = {k: _t(k) for k in (
        "ten_de_tai", "cap_de_tai", "linh_vuc", "cn_hoc_vi", "cn_ho_ten",
        "cn_chuc_vu", "khoa_phong", "cn_email", "cn_dien_thoai", "thanh_vien",
        "dat_van_de", "muc_tieu", "doi_tuong_pp", "san_pham", "dao_duc",
        "du_kien_bat_dau", "du_kien_ket_thuc", "nguon_kinh_phi")}
    f["kinh_phi"] = _so("kinh_phi")

    loi = []
    if len(f["ten_de_tai"]) < 10:
        loi.append("Tên đề tài quá ngắn (tối thiểu 10 ký tự).")
    if not f["cn_ho_ten"]:
        loi.append("Vui lòng nhập họ tên chủ nhiệm đề tài.")
    if not RE_EMAIL.match(f["cn_email"]):
        loi.append("Email không hợp lệ — đây là địa chỉ nhận thư xác nhận, xin kiểm tra kỹ.")
    if not f["khoa_phong"]:
        loi.append("Vui lòng chọn/nhập khoa – phòng công tác.")
    if len(f["muc_tieu"]) < 10:
        loi.append("Vui lòng nêu mục tiêu nghiên cứu.")
    if f["cap_de_tai"] not in CAP_DE_TAI:
        f["cap_de_tai"] = "co_so"
    if f["linh_vuc"] not in LINH_VUC:
        f["linh_vuc"] = "lam_sang"
    if loi:
        return render_template("gui_de_tai.html", form=f, loi=loi), 400

    cn = csdl()
    nam = datetime.now(db.MUI_GIO_VN).year
    ma = db.sinh_ma_ho_so(cn, nam)
    token = secrets.token_urlsafe(24)
    luc = db.bay_gio()
    cur = cn.execute(
        "INSERT INTO de_tai (ma_ho_so, ma_tra_cuu, nam, ten_de_tai, cap_de_tai,"
        " linh_vuc, cn_hoc_vi, cn_ho_ten, cn_chuc_vu, khoa_phong, cn_email,"
        " cn_dien_thoai, thanh_vien, dat_van_de, muc_tieu, doi_tuong_pp, san_pham,"
        " dao_duc, du_kien_bat_dau, du_kien_ket_thuc, kinh_phi, nguon_kinh_phi,"
        " trang_thai, ngay_gui, cap_nhat_luc)"
        " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'moi',?,?)",
        (ma, token, nam, f["ten_de_tai"], f["cap_de_tai"], f["linh_vuc"],
         f["cn_hoc_vi"], f["cn_ho_ten"], f["cn_chuc_vu"], f["khoa_phong"],
         f["cn_email"].lower(), f["cn_dien_thoai"], f["thanh_vien"], f["dat_van_de"],
         f["muc_tieu"], f["doi_tuong_pp"], f["san_pham"], f["dao_duc"],
         f["du_kien_bat_dau"], f["du_kien_ket_thuc"], f["kinh_phi"],
         f["nguon_kinh_phi"], luc, luc))
    dt_id = cur.lastrowid
    _, loi_tep = _luu_tep(cn, dt_id, request.files.getlist("tep"))
    db.ghi_nhat_ky(cn, dt_id, "he_thong", "Tác giả gửi hồ sơ đề xuất qua cổng trực tuyến.",
                   tt_moi="moi", nguoi=f["cn_ho_ten"], cong_khai=1)
    cn.commit()

    dt = dict(_lay_de_tai("id=?", (dt_id,)))
    ch = config.nap()
    if ch.get("tu_dong_bao_nhan", True):
        mailer.xep_hang(dt["cn_email"], *mailer.thu_xac_nhan(dt), de_tai_id=dt_id)
    if ch.get("tu_dong_bao_quan_ly", True) and ch.get("email_quan_ly"):
        mailer.xep_hang(ch["email_quan_ly"], *mailer.thu_bao_quan_ly(dt), de_tai_id=dt_id)

    for m in loi_tep:
        flash(m, "canh_bao")
    return redirect(url_for("gui_thanh_cong", token=token))


@app.get("/gui-thanh-cong/<token>")
def gui_thanh_cong(token):
    dt = _lay_de_tai("ma_tra_cuu=?", (token,))
    if not dt:
        abort(404)
    return render_template("gui_thanh_cong.html", dt=dt)


@app.route("/tra-cuu", methods=["GET", "POST"])
def tra_cuu():
    if request.method == "POST":
        ma = _t("ma_ho_so").upper()
        email = _t("cn_email").lower()
        dt = _lay_de_tai("UPPER(ma_ho_so)=? AND LOWER(cn_email)=?", (ma, email))
        if not dt:
            return render_template("tra_cuu.html", ma=ma, email=email,
                                   loi="Không tìm thấy hồ sơ khớp với mã và email đã nhập."), 404
        return redirect(url_for("tra_cuu_chi_tiet", token=dt["ma_tra_cuu"]))
    return render_template("tra_cuu.html", ma="", email="", loi=None)


@app.get("/tra-cuu/<token>")
def tra_cuu_chi_tiet(token):
    cn = csdl()
    dt = _lay_de_tai("ma_tra_cuu=?", (token,))
    if not dt:
        abort(404)
    tep = cn.execute("SELECT * FROM tep WHERE de_tai_id=? ORDER BY id", (dt["id"],)).fetchall()
    nk = cn.execute("SELECT * FROM nhat_ky WHERE de_tai_id=? AND cong_khai=1"
                    " ORDER BY id DESC", (dt["id"],)).fetchall()
    return render_template("tra_cuu_chi_tiet.html", dt=dt, tep=tep, nhat_ky=nk,
                           cho_sua=dt["trang_thai"] in TRANG_THAI_CHO_SUA)


@app.post("/tra-cuu/<token>/bo-sung")
def tac_gia_bo_sung(token):
    cn = csdl()
    dt = _lay_de_tai("ma_tra_cuu=?", (token,))
    if not dt:
        abort(404)
    if dt["trang_thai"] not in TRANG_THAI_CHO_SUA:
        flash("Hồ sơ hiện không ở trạng thái cho phép bổ sung.", "loi")
        return redirect(url_for("tra_cuu_chi_tiet", token=token))

    ghi_chu = _t("noi_dung")
    so_tep, loi_tep = _luu_tep(cn, dt["id"], request.files.getlist("tep"), nguoi="tac_gia")
    if not ghi_chu and not so_tep:
        flash("Chưa có nội dung hay tệp nào được gửi.", "loi")
        return redirect(url_for("tra_cuu_chi_tiet", token=token))

    noi_dung = ghi_chu or "(không có ghi chú)"
    if so_tep:
        noi_dung += "\n[Đính kèm {} tệp bổ sung]".format(so_tep)
    db.ghi_nhat_ky(cn, dt["id"], "bo_sung", noi_dung, nguoi=dt["cn_ho_ten"], cong_khai=1)
    cn.execute("UPDATE de_tai SET trang_thai='da_tiep_nhan', cap_nhat_luc=? WHERE id=?",
               (db.bay_gio(), dt["id"]))
    db.ghi_nhat_ky(cn, dt["id"], "trang_thai", "Tác giả đã nộp bổ sung, hồ sơ quay lại xử lý.",
                   tt_cu="bo_sung", tt_moi="da_tiep_nhan", nguoi=dt["cn_ho_ten"], cong_khai=1)
    cn.commit()

    ch = config.nap()
    if ch.get("email_quan_ly"):
        dt2 = dict(_lay_de_tai("id=?", (dt["id"],)))
        td, tx, th = mailer.thu_bao_quan_ly(dt2)
        mailer.xep_hang(ch["email_quan_ly"], "[Bổ sung] " + td, tx, th, de_tai_id=dt["id"])
    for m in loi_tep:
        flash(m, "canh_bao")
    flash("Đã gửi nội dung bổ sung tới bộ phận quản lý. Xin cảm ơn!", "ok")
    return redirect(url_for("tra_cuu_chi_tiet", token=token))


@app.get("/tra-cuu/<token>/tep/<int:tep_id>")
def tai_tep_cong_khai(token, tep_id):
    dt = _lay_de_tai("ma_tra_cuu=?", (token,))
    if not dt:
        abort(404)
    t = csdl().execute("SELECT * FROM tep WHERE id=? AND de_tai_id=?",
                       (tep_id, dt["id"])).fetchone()
    return _gui_tep(t)


def _gui_tep(t):
    if not t:
        abort(404)
    duong_dan = config.THU_MUC_UPLOAD / t["ten_luu"]
    if not duong_dan.exists():
        abort(404)
    return send_file(duong_dan, as_attachment=True, download_name=t["ten_goc"])


# --------------------------------------------------------------------------- #
#  ĐĂNG NHẬP QUẢN TRỊ
# --------------------------------------------------------------------------- #
@app.route("/admin/dang-nhap", methods=["GET", "POST"])
def dang_nhap():
    if request.method == "POST":
        u = _t("ten_dang_nhap").lower()
        p = request.form.get("mat_khau") or ""
        nd = csdl().execute("SELECT * FROM nguoi_dung WHERE ten_dang_nhap=?", (u,)).fetchone()
        if nd and check_password_hash(nd["mat_khau_hash"], p):
            session.clear()
            session["uid"] = nd["id"]
            session["ho_ten"] = nd["ho_ten"] or nd["ten_dang_nhap"]
            session.permanent = True
            if nd["doi_mat_khau"]:
                flash("Bạn đang dùng mật khẩu khởi tạo. Hãy đổi mật khẩu ngay.", "canh_bao")
                return redirect(url_for("doi_mat_khau"))
            tiep = request.args.get("tiep")
            return redirect(tiep if tiep and tiep.startswith("/admin") else url_for("bang_dieu_khien"))
        return render_template("dang_nhap.html", loi="Sai tên đăng nhập hoặc mật khẩu.",
                               u=u), 401
    return render_template("dang_nhap.html", loi=None, u="")


@app.get("/admin/dang-xuat")
def dang_xuat():
    session.clear()
    return redirect(url_for("dang_nhap"))


@app.route("/admin/doi-mat-khau", methods=["GET", "POST"])
@can_dang_nhap
def doi_mat_khau():
    if request.method == "POST":
        cu = request.form.get("mat_khau_cu") or ""
        moi = request.form.get("mat_khau_moi") or ""
        lai = request.form.get("mat_khau_lai") or ""
        cn = csdl()
        nd = cn.execute("SELECT * FROM nguoi_dung WHERE id=?", (session["uid"],)).fetchone()
        if not check_password_hash(nd["mat_khau_hash"], cu):
            return render_template("doi_mat_khau.html", loi="Mật khẩu hiện tại không đúng."), 400
        if len(moi) < 8:
            return render_template("doi_mat_khau.html", loi="Mật khẩu mới tối thiểu 8 ký tự."), 400
        if moi != lai:
            return render_template("doi_mat_khau.html", loi="Hai lần nhập mật khẩu mới không khớp."), 400
        cn.execute("UPDATE nguoi_dung SET mat_khau_hash=?, doi_mat_khau=0 WHERE id=?",
                   (generate_password_hash(moi), nd["id"]))
        cn.commit()
        flash("Đã đổi mật khẩu.", "ok")
        return redirect(url_for("bang_dieu_khien"))
    return render_template("doi_mat_khau.html", loi=None)


# --------------------------------------------------------------------------- #
#  BẢNG ĐIỀU KHIỂN
# --------------------------------------------------------------------------- #
@app.get("/admin")
@can_dang_nhap
def bang_dieu_khien():
    cn = csdl()
    nam = request.args.get("nam", "")
    dk, ts = ("WHERE nam=?", (int(nam),)) if nam.isdigit() else ("", ())

    theo_tt = {r["trang_thai"]: r["c"] for r in cn.execute(
        "SELECT trang_thai, COUNT(*) c FROM de_tai " + dk + " GROUP BY trang_thai", ts)}
    tong = sum(theo_tt.values())
    theo_nhom = {k: 0 for k in NHOM_TRANG_THAI}
    for ma, c in theo_tt.items():
        theo_nhom[nhom_cua_trang_thai(ma)] = theo_nhom.get(nhom_cua_trang_thai(ma), 0) + c

    cac_nam = [r["nam"] for r in cn.execute(
        "SELECT DISTINCT nam FROM de_tai ORDER BY nam DESC")]
    theo_nam = cn.execute("SELECT nam, COUNT(*) c,"
                          " SUM(trang_thai='da_nghiem_thu') nt"
                          " FROM de_tai GROUP BY nam ORDER BY nam DESC LIMIT 8").fetchall()
    theo_khoa = cn.execute(
        "SELECT khoa_phong, COUNT(*) c, SUM(trang_thai='da_nghiem_thu') nt FROM de_tai "
        + dk + " GROUP BY khoa_phong ORDER BY c DESC LIMIT 10", ts).fetchall()
    theo_linh_vuc = cn.execute(
        "SELECT linh_vuc, COUNT(*) c FROM de_tai " + dk +
        " GROUP BY linh_vuc ORDER BY c DESC", ts).fetchall()
    theo_cap = cn.execute(
        "SELECT cap_de_tai, COUNT(*) c FROM de_tai " + dk +
        " GROUP BY cap_de_tai ORDER BY c DESC", ts).fetchall()
    moi_nhat = cn.execute(
        "SELECT * FROM de_tai ORDER BY id DESC LIMIT 8").fetchall()
    can_xu_ly = cn.execute(
        "SELECT * FROM de_tai WHERE trang_thai IN ('moi','bo_sung','cho_nghiem_thu')"
        " ORDER BY CASE trang_thai WHEN 'moi' THEN 0 WHEN 'bo_sung' THEN 1 ELSE 2 END,"
        " id DESC LIMIT 12").fetchall()
    kinh_phi = cn.execute("SELECT COALESCE(SUM(kinh_phi),0) s FROM de_tai "
                          + (dk + " AND" if dk else "WHERE") +
                          " trang_thai IN ('da_duyet','cho_nghiem_thu','da_nghiem_thu')",
                          ts).fetchone()["s"]

    return render_template("admin_dashboard.html", tong=tong, theo_tt=theo_tt,
                           theo_nhom=theo_nhom, theo_nam=theo_nam, theo_khoa=theo_khoa,
                           theo_linh_vuc=theo_linh_vuc, theo_cap=theo_cap,
                           moi_nhat=moi_nhat, can_xu_ly=can_xu_ly, cac_nam=cac_nam,
                           nam_loc=nam, kinh_phi=kinh_phi)


# --------------------------------------------------------------------------- #
#  DANH SÁCH ĐỀ TÀI
# --------------------------------------------------------------------------- #
SAP_XEP = {
    "moi_nhat": "d.id DESC", "cu_nhat": "d.id ASC",
    "ten": "d.ten_de_tai COLLATE NOCASE ASC",
    "khoa": "d.khoa_phong COLLATE NOCASE ASC, d.id DESC",
    "trang_thai": "d.trang_thai ASC, d.id DESC",
    "cap_nhat": "d.cap_nhat_luc DESC",
}


def _dieu_kien_loc():
    dk, ts = ["1=1"], []
    q = (request.args.get("q") or "").strip()
    if q:
        dk.append("(d.ten_de_tai LIKE ? OR d.cn_ho_ten LIKE ? OR d.ma_ho_so LIKE ?"
                  " OR d.khoa_phong LIKE ? OR d.thanh_vien LIKE ? OR d.muc_tieu LIKE ?)")
        ts += ["%{}%".format(q)] * 6
    for cot, thamso in (("trang_thai", "trang_thai"), ("cap_de_tai", "cap"),
                        ("linh_vuc", "linh_vuc"), ("khoa_phong", "khoa"),
                        ("xep_loai", "xep_loai")):
        gt = (request.args.get(thamso) or "").strip()
        if gt:
            dk.append("d.{}=?".format(cot))
            ts.append(gt)
    nam = (request.args.get("nam") or "").strip()
    if nam.isdigit():
        dk.append("d.nam=?")
        ts.append(int(nam))
    nhom = (request.args.get("nhom") or "").strip()
    if nhom in NHOM_TRANG_THAI:
        ma = [k for k, v in TRANG_THAI.items() if v["nhom"] == nhom]
        dk.append("d.trang_thai IN ({})".format(",".join("?" * len(ma))))
        ts += ma
    return " AND ".join(dk), ts


@app.get("/admin/de-tai")
@can_dang_nhap
def danh_sach():
    cn = csdl()
    dk, ts = _dieu_kien_loc()
    sx = SAP_XEP.get(request.args.get("sx", "moi_nhat"), SAP_XEP["moi_nhat"])
    trang = max(1, int(request.args.get("trang", 1) or 1))
    moi_trang = 25
    tong = cn.execute("SELECT COUNT(*) c FROM de_tai d WHERE " + dk, ts).fetchone()["c"]
    hang = cn.execute(
        "SELECT d.*, (SELECT COUNT(*) FROM tep WHERE de_tai_id=d.id) so_tep"
        " FROM de_tai d WHERE " + dk + " ORDER BY " + sx + " LIMIT ? OFFSET ?",
        ts + [moi_trang, (trang - 1) * moi_trang]).fetchall()
    cac_nam = [r["nam"] for r in cn.execute("SELECT DISTINCT nam FROM de_tai ORDER BY nam DESC")]
    cac_khoa = [r["khoa_phong"] for r in cn.execute(
        "SELECT DISTINCT khoa_phong FROM de_tai WHERE khoa_phong<>''"
        " ORDER BY khoa_phong COLLATE NOCASE")]
    return render_template("admin_danh_sach.html", hang=hang, tong=tong, trang=trang,
                           so_trang=max(1, -(-tong // moi_trang)), cac_nam=cac_nam,
                           cac_khoa=cac_khoa, args=request.args)


@app.get("/admin/xuat-csv")
@can_dang_nhap
def xuat_csv():
    dk, ts = _dieu_kien_loc()
    hang = csdl().execute("SELECT d.* FROM de_tai d WHERE " + dk +
                          " ORDER BY d.nam DESC, d.ma_ho_so", ts).fetchall()
    bo_dem = io.StringIO()
    w = csv.writer(bo_dem, delimiter=";")
    w.writerow(["Mã hồ sơ", "Năm", "Tên đề tài", "Cấp đề tài", "Lĩnh vực",
                "Học vị", "Chủ nhiệm", "Chức vụ", "Khoa/Phòng", "Email", "Điện thoại",
                "Thành viên", "Mục tiêu", "Bắt đầu", "Kết thúc", "Kinh phí (VNĐ)",
                "Nguồn kinh phí", "Trạng thái", "Phân nhóm", "Ngày gửi", "Ngày tiếp nhận",
                "Ngày họp duyệt", "Ngày nghiệm thu", "Hội đồng", "Xếp loại", "Điểm", "Ghi chú"])
    for d in hang:
        w.writerow([
            d["ma_ho_so"], d["nam"], d["ten_de_tai"],
            CAP_DE_TAI.get(d["cap_de_tai"], d["cap_de_tai"]),
            LINH_VUC.get(d["linh_vuc"], d["linh_vuc"]), d["cn_hoc_vi"], d["cn_ho_ten"],
            d["cn_chuc_vu"], d["khoa_phong"], d["cn_email"], d["cn_dien_thoai"],
            d["thanh_vien"], d["muc_tieu"], d["du_kien_bat_dau"], d["du_kien_ket_thuc"],
            d["kinh_phi"], d["nguon_kinh_phi"], ten_trang_thai(d["trang_thai"]),
            NHOM_TRANG_THAI.get(nhom_cua_trang_thai(d["trang_thai"]), ""),
            d["ngay_gui"], d["ngay_tiep_nhan"], d["ngay_hop_duyet"], d["ngay_nghiem_thu"],
            d["hoi_dong"], XEP_LOAI.get(d["xep_loai"] or "", ""),
            d["diem_nghiem_thu"] if d["diem_nghiem_thu"] is not None else "", d["ghi_chu"]])
    du_lieu = "﻿" + bo_dem.getvalue()          # BOM để Excel đọc đúng tiếng Việt
    return send_file(io.BytesIO(du_lieu.encode("utf-8")), mimetype="text/csv",
                     as_attachment=True,
                     download_name="de-tai-nckh-{}.csv".format(
                         datetime.now().strftime("%Y%m%d-%H%M")))


# --------------------------------------------------------------------------- #
#  CHI TIẾT ĐỀ TÀI
# --------------------------------------------------------------------------- #
@app.get("/admin/de-tai/<int:dt_id>")
@can_dang_nhap
def chi_tiet(dt_id):
    cn = csdl()
    dt = _lay_de_tai("id=?", (dt_id,))
    if not dt:
        abort(404)
    tep = cn.execute("SELECT * FROM tep WHERE de_tai_id=? ORDER BY id", (dt_id,)).fetchall()
    nk = cn.execute("SELECT * FROM nhat_ky WHERE de_tai_id=? ORDER BY id DESC",
                    (dt_id,)).fetchall()
    thu = cn.execute("SELECT * FROM email_log WHERE de_tai_id=? ORDER BY id DESC",
                     (dt_id,)).fetchall()
    return render_template("admin_chi_tiet.html", dt=dt, tep=tep, nhat_ky=nk, thu=thu)


@app.post("/admin/de-tai/<int:dt_id>/trang-thai")
@can_dang_nhap
def doi_trang_thai(dt_id):
    cn = csdl()
    dt = _lay_de_tai("id=?", (dt_id,))
    if not dt:
        abort(404)
    tt_moi = _t("trang_thai")
    if tt_moi not in TRANG_THAI:
        flash("Trạng thái không hợp lệ.", "loi")
        return redirect(url_for("chi_tiet", dt_id=dt_id))
    nhan_xet = _t("nhan_xet")
    gui_thu = request.form.get("gui_thu") == "1"
    tt_cu = dt["trang_thai"]
    luc = db.bay_gio()

    cap_nhat = {"trang_thai": tt_moi, "cap_nhat_luc": luc}
    if tt_moi == "da_tiep_nhan" and not dt["ngay_tiep_nhan"]:
        cap_nhat["ngay_tiep_nhan"] = luc[:10]
    if tt_moi in ("da_duyet", "khong_duyet") and not dt["ngay_hop_duyet"]:
        cap_nhat["ngay_hop_duyet"] = luc[:10]
    if tt_moi == "da_nghiem_thu" and not dt["ngay_nghiem_thu"]:
        cap_nhat["ngay_nghiem_thu"] = luc[:10]
    cn.execute("UPDATE de_tai SET {} WHERE id=?".format(
        ", ".join(k + "=?" for k in cap_nhat)), list(cap_nhat.values()) + [dt_id])
    db.ghi_nhat_ky(cn, dt_id, "trang_thai", nhan_xet, tt_cu=tt_cu, tt_moi=tt_moi,
                   nguoi=session.get("ho_ten", ""), cong_khai=1)
    cn.commit()

    ch = config.nap()
    if gui_thu and ch.get("tu_dong_bao_doi_trang_thai", True) and tt_cu != tt_moi:
        dt2 = dict(_lay_de_tai("id=?", (dt_id,)))
        mailer.xep_hang(dt2["cn_email"],
                        *mailer.thu_doi_trang_thai(dt2, tt_moi, nhan_xet), de_tai_id=dt_id)
        flash("Đã chuyển sang “{}” và xếp hàng gửi thư báo cho chủ nhiệm.".format(
            ten_trang_thai(tt_moi)), "ok")
    else:
        flash("Đã chuyển sang “{}”.".format(ten_trang_thai(tt_moi)), "ok")
    return redirect(url_for("chi_tiet", dt_id=dt_id))


TRUONG_QUAN_LY = ("ten_de_tai", "cap_de_tai", "linh_vuc", "cn_hoc_vi", "cn_ho_ten",
                  "cn_chuc_vu", "khoa_phong", "cn_email", "cn_dien_thoai", "thanh_vien",
                  "dat_van_de", "muc_tieu", "doi_tuong_pp", "san_pham", "dao_duc",
                  "du_kien_bat_dau", "du_kien_ket_thuc", "nguon_kinh_phi",
                  "ngay_tiep_nhan", "ngay_hop_duyet", "ngay_nghiem_thu",
                  "hoi_dong", "xep_loai", "ghi_chu")


@app.post("/admin/de-tai/<int:dt_id>/thong-tin")
@can_dang_nhap
def sua_thong_tin(dt_id):
    cn = csdl()
    if not _lay_de_tai("id=?", (dt_id,)):
        abort(404)
    gt = {k: _t(k) for k in TRUONG_QUAN_LY}
    gt["kinh_phi"] = _so("kinh_phi")
    diem = _t("diem_nghiem_thu").replace(",", ".")
    try:
        gt["diem_nghiem_thu"] = float(diem) if diem else None
    except ValueError:
        gt["diem_nghiem_thu"] = None
    gt["cap_nhat_luc"] = db.bay_gio()
    cn.execute("UPDATE de_tai SET {} WHERE id=?".format(
        ", ".join(k + "=?" for k in gt)), list(gt.values()) + [dt_id])
    db.ghi_nhat_ky(cn, dt_id, "he_thong", "Cập nhật thông tin hồ sơ.",
                   nguoi=session.get("ho_ten", ""))
    cn.commit()
    flash("Đã lưu thông tin hồ sơ.", "ok")
    return redirect(url_for("chi_tiet", dt_id=dt_id))


@app.post("/admin/de-tai/<int:dt_id>/nhan-xet")
@can_dang_nhap
def them_nhan_xet(dt_id):
    cn = csdl()
    dt = _lay_de_tai("id=?", (dt_id,))
    if not dt:
        abort(404)
    noi_dung = _t("noi_dung")
    if not noi_dung:
        flash("Chưa nhập nội dung.", "loi")
        return redirect(url_for("chi_tiet", dt_id=dt_id))
    cong_khai = 1 if request.form.get("cong_khai") == "1" else 0
    db.ghi_nhat_ky(cn, dt_id, "nhan_xet", noi_dung, nguoi=session.get("ho_ten", ""),
                   cong_khai=cong_khai)
    cn.execute("UPDATE de_tai SET cap_nhat_luc=? WHERE id=?", (db.bay_gio(), dt_id))
    cn.commit()
    if request.form.get("gui_thu") == "1":
        dt2 = dict(dt)
        mailer.xep_hang(dt2["cn_email"],
                        *mailer.thu_doi_trang_thai(dt2, dt2["trang_thai"], noi_dung),
                        de_tai_id=dt_id)
        flash("Đã lưu nhận xét và xếp hàng gửi thư cho chủ nhiệm.", "ok")
    else:
        flash("Đã lưu nhận xét.", "ok")
    return redirect(url_for("chi_tiet", dt_id=dt_id))


@app.post("/admin/de-tai/<int:dt_id>/tep")
@can_dang_nhap
def them_tep(dt_id):
    cn = csdl()
    if not _lay_de_tai("id=?", (dt_id,)):
        abort(404)
    so, loi = _luu_tep(cn, dt_id, request.files.getlist("tep"), nguoi="quan_ly")
    if so:
        db.ghi_nhat_ky(cn, dt_id, "he_thong", "Bổ sung {} tệp vào hồ sơ.".format(so),
                       nguoi=session.get("ho_ten", ""))
    cn.commit()
    for m in loi:
        flash(m, "canh_bao")
    flash("Đã thêm {} tệp.".format(so), "ok" if so else "canh_bao")
    return redirect(url_for("chi_tiet", dt_id=dt_id))


@app.get("/admin/tep/<int:tep_id>")
@can_dang_nhap
def tai_tep(tep_id):
    return _gui_tep(csdl().execute("SELECT * FROM tep WHERE id=?", (tep_id,)).fetchone())


@app.post("/admin/tep/<int:tep_id>/xoa")
@can_dang_nhap
def xoa_tep(tep_id):
    cn = csdl()
    t = cn.execute("SELECT * FROM tep WHERE id=?", (tep_id,)).fetchone()
    if not t:
        abort(404)
    try:
        (config.THU_MUC_UPLOAD / t["ten_luu"]).unlink(missing_ok=True)
    except OSError:
        pass
    cn.execute("DELETE FROM tep WHERE id=?", (tep_id,))
    db.ghi_nhat_ky(cn, t["de_tai_id"], "he_thong",
                   "Xóa tệp “{}”.".format(t["ten_goc"]), nguoi=session.get("ho_ten", ""))
    cn.commit()
    flash("Đã xóa tệp.", "ok")
    return redirect(url_for("chi_tiet", dt_id=t["de_tai_id"]))


@app.post("/admin/de-tai/<int:dt_id>/gui-thu")
@can_dang_nhap
def gui_thu_tay(dt_id):
    dt = _lay_de_tai("id=?", (dt_id,))
    if not dt:
        abort(404)
    tieu_de = _t("tieu_de")
    noi_dung = _t("noi_dung")
    den = _t("den") or dt["cn_email"]
    if not tieu_de or not noi_dung:
        flash("Cần nhập cả tiêu đề và nội dung thư.", "loi")
        return redirect(url_for("chi_tiet", dt_id=dt_id))
    import html as _h
    than = "<p style='white-space:pre-wrap;'>{}</p>".format(_h.escape(noi_dung))
    ch = config.nap()
    mailer.xep_hang(den, tieu_de, noi_dung,
                    mailer._khung(ch, "Thông báo về hồ sơ " + dt["ma_ho_so"], than),
                    de_tai_id=dt_id)
    cn = csdl()
    db.ghi_nhat_ky(cn, dt_id, "email", "Gửi thư “{}” tới {}.".format(tieu_de, den),
                   nguoi=session.get("ho_ten", ""))
    cn.commit()
    flash("Đã xếp hàng gửi thư tới {}.".format(den), "ok")
    return redirect(url_for("chi_tiet", dt_id=dt_id))


@app.post("/admin/de-tai/<int:dt_id>/xoa")
@can_dang_nhap
def xoa_de_tai(dt_id):
    cn = csdl()
    dt = _lay_de_tai("id=?", (dt_id,))
    if not dt:
        abort(404)
    if _t("xac_nhan") != dt["ma_ho_so"]:
        flash("Nhập đúng mã hồ sơ để xác nhận xóa.", "loi")
        return redirect(url_for("chi_tiet", dt_id=dt_id))
    for t in cn.execute("SELECT ten_luu FROM tep WHERE de_tai_id=?", (dt_id,)):
        try:
            (config.THU_MUC_UPLOAD / t["ten_luu"]).unlink(missing_ok=True)
        except OSError:
            pass
    cn.execute("DELETE FROM de_tai WHERE id=?", (dt_id,))
    cn.commit()
    flash("Đã xóa hồ sơ {}.".format(dt["ma_ho_so"]), "ok")
    return redirect(url_for("danh_sach"))


# --------------------------------------------------------------------------- #
#  NHẬT KÝ EMAIL & CẤU HÌNH
# --------------------------------------------------------------------------- #
@app.get("/admin/email")
@can_dang_nhap
def nhat_ky_email():
    hang = csdl().execute(
        "SELECT e.*, d.ma_ho_so FROM email_log e LEFT JOIN de_tai d ON d.id=e.de_tai_id"
        " ORDER BY e.id DESC LIMIT 200").fetchall()
    return render_template("admin_email.html", hang=hang)


TRUONG_CAU_HINH_CHU = ("ten_don_vi", "ten_phong_ban", "dia_chi_ung_dung", "smtp_host",
                       "smtp_bao_mat", "smtp_tai_khoan", "email_nguoi_gui",
                       "ten_nguoi_gui", "email_quan_ly")
TRUONG_CAU_HINH_BAT = ("bat_email", "tu_dong_bao_nhan", "tu_dong_bao_doi_trang_thai",
                       "tu_dong_bao_quan_ly")


@app.route("/admin/cau-hinh", methods=["GET", "POST"])
@can_dang_nhap
def cau_hinh():
    if request.method == "POST":
        moi = {k: _t(k) for k in TRUONG_CAU_HINH_CHU}
        moi["smtp_port"] = _so("smtp_port") or 587
        for k in TRUONG_CAU_HINH_BAT:
            moi[k] = request.form.get(k) == "1"
        mk = request.form.get("smtp_mat_khau") or ""
        if mk.strip():
            moi["smtp_mat_khau"] = mk.replace(" ", "")   # App Password hay có dấu cách
        config.luu(moi)
        flash("Đã lưu cấu hình.", "ok")
        return redirect(url_for("cau_hinh"))
    return render_template("admin_cau_hinh.html", ch=config.nap())


@app.post("/admin/cau-hinh/thu-kiem-tra")
@can_dang_nhap
def thu_kiem_tra():
    ch = config.nap()
    den = _t("den") or ch.get("email_quan_ly") or ch.get("smtp_tai_khoan")
    if not den:
        flash("Chưa có địa chỉ nhận thư kiểm tra.", "loi")
        return redirect(url_for("cau_hinh"))
    if not config.email_da_cau_hinh(ch):
        flash("Chưa bật gửi email hoặc thiếu tài khoản/mật khẩu SMTP.", "loi")
        return redirect(url_for("cau_hinh"))
    mailer.xep_hang(den, *mailer.thu_kiem_tra())
    mailer.cho_gui_xong()
    hang = csdl().execute("SELECT * FROM email_log ORDER BY id DESC LIMIT 1").fetchone()
    if hang and hang["trang_thai"] == "da_gui":
        flash("Gửi thành công thư kiểm tra tới {}.".format(den), "ok")
    elif hang and hang["trang_thai"] == "loi":
        flash("Gửi thất bại: {}".format(hang["loi"]), "loi")
    else:
        flash("Thư đang chờ gửi, xem kết quả ở mục Nhật ký email.", "canh_bao")
    return redirect(url_for("cau_hinh"))


# --------------------------------------------------------------------------- #
@app.errorhandler(404)
def _404(_e):
    return render_template("loi.html", ma=404,
                           thong_diep="Không tìm thấy trang hoặc hồ sơ bạn yêu cầu."), 404


@app.errorhandler(413)
def _413(_e):
    return render_template("loi.html", ma=413,
                           thong_diep="Tệp đính kèm quá lớn. Mỗi tệp tối đa 25 MB, "
                                      "tổng một lần gửi tối đa 80 MB."), 413


@app.errorhandler(500)
def _500(_e):
    return render_template("loi.html", ma=500,
                           thong_diep="Hệ thống gặp sự cố. Vui lòng thử lại."), 500


def _sua_bang_ma_console():
    """Cửa sổ lệnh Windows mặc định là cp1252/cp437 — ép về UTF-8 để in tiếng Việt."""
    for luong in (sys.stdout, sys.stderr):
        try:
            luong.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError, OSError):
            pass


def _in_dia_chi(cong):
    import socket
    print("\n  Hệ thống quản lý đề tài khoa học đang chạy:")
    print("    - Trên máy này      : http://localhost:{}".format(cong))
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        print("    - Máy khác trong LAN: http://{}:{}".format(ip, cong))
    except OSError:
        pass
    print("    - Trang quản trị    : http://localhost:{}/admin\n".format(cong))


if __name__ == "__main__":
    _sua_bang_ma_console()
    mk_moi = db.khoi_tao()
    if mk_moi:
        print("\n" + "=" * 68)
        print("  TÀI KHOẢN QUẢN TRỊ VỪA ĐƯỢC TẠO")
        print("    Tên đăng nhập : quanly")
        print("    Mật khẩu      : " + mk_moi)
        print("  Hãy đăng nhập và ĐỔI MẬT KHẨU ngay tại /admin/doi-mat-khau")
        print("=" * 68)
    mailer.khoi_dong()
    cong = int(os.environ.get("PORT", 8080))
    _in_dia_chi(cong)
    app.run(host="0.0.0.0", port=cong, debug=False, threaded=True)
