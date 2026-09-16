# -*- coding: utf-8 -*-
"""Danh mục dùng chung cho toàn hệ thống quản lý đề tài khoa học."""

# --- Trạng thái hồ sơ đề tài -------------------------------------------------
# Thứ tự trong dict cũng là thứ tự hiển thị trên giao diện.
TRANG_THAI = {
    "moi":            {"ten": "Mới gửi",              "mau": "xam",   "nhom": "chua_nghiem_thu"},
    "da_tiep_nhan":   {"ten": "Đã tiếp nhận",         "mau": "xanh",  "nhom": "chua_nghiem_thu"},
    "dang_xet_duyet": {"ten": "Đang xét duyệt",       "mau": "tim",   "nhom": "chua_nghiem_thu"},
    "bo_sung":        {"ten": "Yêu cầu bổ sung",      "mau": "cam",   "nhom": "chua_nghiem_thu"},
    "da_duyet":       {"ten": "Đã duyệt – triển khai","mau": "luc",   "nhom": "chua_nghiem_thu"},
    "cho_nghiem_thu": {"ten": "Chờ nghiệm thu",       "mau": "vang",  "nhom": "chua_nghiem_thu"},
    "da_nghiem_thu":  {"ten": "Đã nghiệm thu",        "mau": "lucdam","nhom": "da_nghiem_thu"},
    "khong_duyet":    {"ten": "Không phê duyệt",      "mau": "do",    "nhom": "khong_tiep_tuc"},
    "tam_dung":       {"ten": "Tạm dừng / Hủy",       "mau": "do",    "nhom": "khong_tiep_tuc"},
}

NHOM_TRANG_THAI = {
    "chua_nghiem_thu": "Chưa nghiệm thu",
    "da_nghiem_thu":   "Đã nghiệm thu",
    "khong_tiep_tuc":  "Không tiếp tục",
}

# Trạng thái mà tác giả được phép sửa / nộp lại hồ sơ
TRANG_THAI_CHO_SUA = {"bo_sung"}

CAP_DE_TAI = {
    "co_so":   "Cấp cơ sở (bệnh viện)",
    "nganh":   "Cấp ngành / Sở Y tế",
    "tinh":    "Cấp tỉnh / thành phố",
    "bo":      "Cấp Bộ / Nhà nước",
    "quoc_te": "Hợp tác quốc tế",
    "sang_kien": "Sáng kiến cải tiến kỹ thuật",
}

LINH_VUC = {
    "lam_sang":    "Lâm sàng",
    "can_lam_sang":"Cận lâm sàng",
    "phcn":        "Phục hồi chức năng",
    "dieu_duong":  "Điều dưỡng",
    "duoc":        "Dược – Vật tư",
    "yhct":        "Y học cổ truyền",
    "ytcc":        "Y tế công cộng – Dịch tễ",
    "quan_ly":     "Quản lý – Kinh tế y tế",
    "khac":        "Lĩnh vực khác",
}

XEP_LOAI = {
    "xuat_sac":  "Xuất sắc",
    "kha":       "Khá",
    "dat":       "Đạt",
    "khong_dat": "Không đạt",
}

HOC_VI = ["BS", "BSCKI", "BSCKII", "ThS.BS", "TS.BS", "PGS.TS", "GS.TS",
          "DS", "ThS.DS", "TS.DS", "CN", "ThS", "TS", "ĐD", "CNĐD", "KTV"]

# Đuôi tệp cho phép đính kèm
DUOI_TEP_CHO_PHEP = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
                     ".jpg", ".jpeg", ".png", ".zip", ".rar", ".txt", ".csv"}
DUNG_LUONG_TOI_DA = 25 * 1024 * 1024   # 25 MB mỗi tệp


def ten_trang_thai(ma):
    return TRANG_THAI.get(ma, {}).get("ten", ma or "—")


def mau_trang_thai(ma):
    return TRANG_THAI.get(ma, {}).get("mau", "xam")


def nhom_cua_trang_thai(ma):
    return TRANG_THAI.get(ma, {}).get("nhom", "chua_nghiem_thu")
