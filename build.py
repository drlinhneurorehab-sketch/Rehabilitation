# -*- coding: utf-8 -*-
"""
PHCN-METRICS · Công cụ đóng gói
--------------------------------
Gộp toàn bộ CSS + JS vào MỘT file HTML duy nhất để mang sang máy khác chỉ bằng
cách chép 1 file, đồng thời tạo bản ZIP của phiên bản nhiều file.

Chạy:  python build.py
Kết quả nằm trong thư mục dist/
"""

import base64
import os
import re
import shutil
import zipfile
from datetime import date

ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(ROOT, 'dist')

APP_NAME = 'PHCN-METRICS'


def read(path):
    with open(os.path.join(ROOT, path), 'r', encoding='utf-8') as f:
        return f.read()


def read_b64(path):
    with open(os.path.join(ROOT, path), 'rb') as f:
        return base64.b64encode(f.read()).decode('ascii')


def build_single_file():
    html = read('index.html')

    # --- Nội tuyến biểu tượng (bản một file không có thư mục assets) ---
    icon = 'data:image/png;base64,' + read_b64('assets/icons/icon-192.png')
    apple = 'data:image/png;base64,' + read_b64('assets/icons/apple-touch-icon.png')
    html = html.replace('href="assets/icons/icon-192.png"', 'href="' + icon + '"')
    html = html.replace('href="assets/icons/apple-touch-icon.png"', 'href="' + apple + '"')

    # --- Bỏ manifest và Service Worker: chỉ có ý nghĩa khi chạy qua máy chủ ---
    html = re.sub(r'\s*<link rel="manifest"[^>]*>', '', html)
    html = re.sub(r"<script>\s*/\* Đăng ký Service Worker.*?</script>", '', html, flags=re.S)

    # --- Nội tuyến CSS ---
    def css_repl(m):
        href = m.group(1).split('?')[0]
        return '<style>\n/* ===== ' + href + ' ===== */\n' + read(href) + '\n</style>'

    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css_repl, html)

    # --- Nội tuyến JS ---
    def js_repl(m):
        src = m.group(1).split('?')[0]
        code = read(src)
        # Tránh việc chuỗi "</script>" bên trong mã JS làm đóng thẻ sớm
        code = code.replace('</script>', '<\\/script>')
        return '<script>\n/* ===== ' + src + ' ===== */\n' + code + '\n</script>'

    html = re.sub(r'<script src="([^"]+)"></script>', js_repl, html)

    banner = ('<!--\n  ' + APP_NAME + ' — bản đóng gói một file, tạo ngày '
              + date.today().strftime('%d/%m/%Y') + '\n'
              '  Chép file này sang bất kỳ máy tính nào và mở bằng trình duyệt là dùng được.\n'
              '  Không cần cài đặt, không cần internet, không cần máy chủ.\n-->\n')
    html = html.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n' + banner, 1)

    out = os.path.join(DIST, APP_NAME + '.html')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)
    return out, len(html.encode('utf-8'))


def build_zip():
    """Đóng gói phiên bản nhiều file (dễ chỉnh sửa) thành ZIP."""
    out = os.path.join(DIST, APP_NAME + '-full.zip')
    include_files = ['index.html', 'README.md', 'Mo-ung-dung.bat', 'Chay-may-chu.bat',
                     'manifest.webmanifest', 'sw.js', 'build.py', '.gitignore', '.nojekyll']
    include_dirs = ['assets', 'server']
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        for name in include_files:
            p = os.path.join(ROOT, name)
            if os.path.exists(p):
                z.write(p, os.path.join(APP_NAME, name))
        for d in include_dirs:
            for base, _, files in os.walk(os.path.join(ROOT, d)):
                for fn in files:
                    if fn.startswith('phcn_data'):
                        continue          # dữ liệu thử của máy chủ, không đóng gói
                    p = os.path.join(base, fn)
                    rel = os.path.relpath(p, ROOT)
                    z.write(p, os.path.join(APP_NAME, rel))
    return out, os.path.getsize(out)


def main():
    if os.path.isdir(DIST):
        shutil.rmtree(DIST)
    os.makedirs(DIST)

    f1, s1 = build_single_file()
    print('  [1] File dung luong doc lap : %s  (%.0f KB)' % (os.path.basename(f1), s1 / 1024))

    f2, s2 = build_zip()
    print('  [2] Ban day du dang ZIP     : %s  (%.0f KB)' % (os.path.basename(f2), s2 / 1024))

    # Bản sao tiện dụng: đặt ngay cạnh file ZIP một hướng dẫn ngắn
    guide = os.path.join(DIST, 'DOC-TRUOC-KHI-DUNG.txt')
    with open(guide, 'w', encoding='utf-8') as f:
        f.write(
            APP_NAME + u''' — Công cụ lượng hóa chức năng Phục hồi chức năng
=====================================================================

CÁCH 1 — Dùng ngay (khuyến nghị)
  Nhấp đúp vào file  ''' + APP_NAME + u'''.html
  Mọi thứ đã nằm trong một file duy nhất: không cần cài đặt, không cần
  internet. Chép file này sang USB, email, máy khác đều chạy được.

CÁCH 2 — Bản đầy đủ để chỉnh sửa
  Giải nén  ''' + APP_NAME + u'''-full.zip  rồi nhấp đúp vào index.html
  (hoặc chạy Mo-ung-dung.bat). Bản này tách riêng các file mã nguồn nên
  dễ bổ sung thang điểm mới.

LƯU Ý QUAN TRỌNG VỀ DỮ LIỆU
  - Dữ liệu bệnh nhân lưu ngay trong trình duyệt của máy đang dùng,
    không gửi đi đâu cả.
  - Mỗi trình duyệt (Chrome, Edge, Firefox) giữ dữ liệu RIÊNG. Hãy dùng
    cố định một trình duyệt.
  - Bản một-file và bản nhiều-file cũng KHÔNG dùng chung dữ liệu.
    Muốn chuyển: vào trang "Xuất dữ liệu" → "Sao lưu toàn bộ (JSON)",
    rồi ở máy/bản kia chọn "Nhập dữ liệu".
  - Sao lưu file JSON sau mỗi buổi làm việc.
''')
    print('  [3] Huong dan ngan          : %s' % os.path.basename(guide))
    print('\nHoan tat. Mo thu muc dist/ de lay file.')


if __name__ == '__main__':
    main()
