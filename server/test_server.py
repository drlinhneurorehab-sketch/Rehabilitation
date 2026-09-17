# -*- coding: utf-8 -*-
"""
PHCN-METRICS · Máy chủ đồng bộ tối giản (Python, không cần thư viện ngoài)

Dùng để:
  1. KIỂM THỬ tính năng đồng bộ ngay trên máy mình trước khi dựng Google Sheet.
  2. Làm mẫu nếu bạn muốn tự dựng máy chủ riêng trên một VPS có internet.

Chạy:
    python server/test_server.py            (cổng mặc định 8788)
    python server/test_server.py 9000       (chọn cổng khác)

Dữ liệu lưu vào file  server/phcn_data.json  ngay cạnh mã nguồn.
Địa chỉ dán vào phần mềm:  http://localhost:8788/sync
"""

import json
import os
import sys
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SECRET = 'doi-chuoi-nay-thanh-mat-khau-cua-ban'
HERE = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(HERE, 'phcn_data.json')
LOCK = threading.Lock()


def now_iso():
    return datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')


def load_db():
    if not os.path.exists(DB_PATH):
        return {'patients': {}, 'assessments': {}, 'log': []}
    with open(DB_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_db(db):
    tmp = DB_PATH + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=1)
    os.replace(tmp, DB_PATH)


def stamp(rec):
    return str(rec.get('updatedAt') or rec.get('createdAt') or '')


def upsert(bucket, records):
    """Ghi mới hoặc cập nhật theo id; chỉ ghi đè khi updatedAt mới hơn."""
    saved = 0
    for r in records or []:
        rid = r.get('id')
        if not rid:
            continue
        old = bucket.get(rid)
        if old is None or stamp(r) >= stamp(old):
            bucket[rid] = r
            saved += 1
    return saved


def read_since(bucket, since):
    if not since:
        return list(bucket.values())
    return [r for r in bucket.values() if stamp(r) > since]


class Handler(BaseHTTPRequestHandler):
    server_version = 'PHCN-Sync/1.0'

    def _send(self, obj, status=200):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        # Cho phép trình duyệt ở tên miền khác gọi vào
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send({'ok': True})

    def do_GET(self):
        db = load_db()
        self._send({
            'ok': True,
            'service': 'PHCN-METRICS sync (ban thu nghiem)',
            'serverTime': now_iso(),
            'totalPatients': len(db['patients']),
            'totalAssessments': len(db['assessments'])
        })

    def do_POST(self):
        try:
            length = int(self.headers.get('Content-Length') or 0)
            body = json.loads(self.rfile.read(length).decode('utf-8') or '{}')
        except Exception as e:
            self._send({'ok': False, 'error': 'Không đọc được dữ liệu gửi lên: %s' % e})
            return

        if str(body.get('secret') or '') != SECRET:
            self._send({'ok': False, 'error': 'Sai chuỗi bí mật.'})
            return

        action = body.get('action') or 'sync'
        with LOCK:
            db = load_db()

            if action == 'ping':
                self._send({
                    'ok': True, 'serverTime': now_iso(),
                    'totalPatients': len(db['patients']),
                    'totalAssessments': len(db['assessments'])
                })
                return

            saved_p = upsert(db['patients'], body.get('patients'))
            saved_a = upsert(db['assessments'], body.get('assessments'))
            db['log'] = (db.get('log') or [])[-200:] + [{
                'at': now_iso(), 'site': body.get('site') or '',
                'patients': saved_p, 'assessments': saved_a
            }]
            save_db(db)

            since = body.get('since') or ''
            self._send({
                'ok': True,
                'serverTime': now_iso(),
                'savedPatients': saved_p,
                'savedAssessments': saved_a,
                'patients': read_since(db['patients'], since),
                'assessments': read_since(db['assessments'], since)
            })

    def log_message(self, fmt, *args):
        sys.stderr.write('  %s - %s\n' % (self.address_string(), fmt % args))


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8788
    srv = ThreadingHTTPServer(('0.0.0.0', port), Handler)
    print('May chu dong bo PHCN-METRICS dang chay')
    print('  Dia chi dan vao phan mem : http://localhost:%d/sync' % port)
    print('  Chuoi bi mat             : %s' % SECRET)
    print('  Du lieu luu tai          : %s' % DB_PATH)
    print('  Nhan Ctrl+C de dung.')
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print('\nDa dung may chu.')


if __name__ == '__main__':
    main()
