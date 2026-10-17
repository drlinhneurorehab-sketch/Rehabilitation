/* =========================================================================
 * Kiểm thử khung nâng cấp cấu trúc dữ liệu (store.js)
 *
 *   node server/test_migrate.js
 *
 * Chạy store.js trong một localStorage giả lập, không cần trình duyệt.
 * Phải chạy lại mỗi khi tăng SCHEMA_VERSION hoặc thêm bước migration.
 * ======================================================================= */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const NGUON = path.join(__dirname, '..', 'assets', 'js', 'store.js');
const KEY = 'phcn_metrics_db_v1';

let soDat = 0, soHong = 0;
function dat(ten, dung, chiTiet) {
  if (dung) { soDat++; console.log('  OK   ' + ten); }
  else { soHong++; console.log('  HONG ' + ten + (chiTiet ? '  -> ' + chiTiet : '')); }
}

/** Nạp store.js vào một môi trường mới với localStorage giả. */
function napStore(duLieuBanDau) {
  const kho = Object.create(null);
  if (duLieuBanDau !== undefined) kho[KEY] = JSON.stringify(duLieuBanDau);
  const canhBao = [];
  const sandbox = {
    window: {
      localStorage: {
        getItem: k => (k in kho ? kho[k] : null),
        setItem: (k, v) => { kho[k] = String(v); },
        removeItem: k => { delete kho[k]; }
      }
    },
    console: { log(){}, info(){}, warn: m => canhBao.push(String(m)), error: m => canhBao.push(String(m)) },
    alert: m => canhBao.push('alert: ' + String(m)),
    Blob: function () {}, URL: { createObjectURL(){ return ''; }, revokeObjectURL(){} },
    document: { createElement: () => ({ click(){}, style:{} }), body: { appendChild(){}, removeChild(){} } },
    setTimeout: () => 0
  };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(NGUON, 'utf8'), sandbox);
  return { store: sandbox.window.PHCN.store, kho, canhBao };
}

console.log('\n=== 1. Kho rỗng thì tạo dữ liệu ở phiên bản mới nhất ===');
{
  const { store } = napStore(undefined);
  const db = store.load();
  dat('version = SCHEMA_VERSION', db.version === store.SCHEMA_VERSION, 'được ' + db.version);
  dat('có đủ 4 bộ dữ liệu',
    Array.isArray(db.patients) && Array.isArray(db.assessments) &&
    Array.isArray(db.notes) && Array.isArray(db.attachments));
  dat('không báo lỗi nạp', store.loadError() === '');
}

console.log('\n=== 2. Nâng cấp dữ liệu v1 lên v2, GIỮ NGUYÊN dữ liệu cũ ===');
{
  const cu = {
    version: 1, createdAt: '2026-01-01T00:00:00.000Z',
    patients: [{ id: 'bn_1', code: 'BN001', name: 'Nguyễn Văn A', groups: ['stroke_motor'] }],
    assessments: [{ id: 'lt_1', patientId: 'bn_1', timepoint: 'T0', values: { barthel: { a: '5' } } }],
    settings: { site: 'Khoa PHCN', researcher: 'BS Linh' }
  };
  const { store, kho } = napStore(cu);
  const db = store.load();
  dat('đã lên v2', db.version === 2, 'được ' + db.version);
  dat('giữ nguyên 1 bệnh nhân', db.patients.length === 1 && db.patients[0].code === 'BN001');
  dat('giữ nguyên 1 lượt đánh giá', db.assessments.length === 1 && db.assessments[0].id === 'lt_1');
  dat('giữ nguyên điểm đã chấm', db.assessments[0].values.barthel.a === '5');
  dat('giữ nguyên cấu hình', db.settings.researcher === 'BS Linh');
  dat('thêm notes rỗng', Array.isArray(db.notes) && db.notes.length === 0);
  dat('thêm attachments rỗng', Array.isArray(db.attachments) && db.attachments.length === 0);
  dat('có sao lưu nguyên trạng trước khi nâng', !!kho[KEY + '__backup_v1']);
  const sao = JSON.parse(kho[KEY + '__backup_v1']);
  dat('bản sao lưu đúng là dữ liệu v1', sao.version === 1 && sao.patients.length === 1);
  dat('không báo lỗi nạp', store.loadError() === '');
}

console.log('\n=== 3. Nâng cấp chỉ chạy một lần, không lặp ===');
{
  const { store, kho } = napStore({ version: 1, patients: [], assessments: [], settings: {} });
  store.load();
  store.save();
  const sauLan1 = JSON.parse(kho[KEY]);
  dat('sau khi lưu, dữ liệu trên đĩa là v2', sauLan1.version === 2);
  const lai = napStore(sauLan1);
  lai.store.load();
  dat('mở lại không tạo thêm bản sao lưu', !lai.kho[KEY + '__backup_v2']);
}

console.log('\n=== 4. Dữ liệu từ phiên bản MỚI HƠN phần mềm thì phải từ chối ===');
{
  const { store } = napStore({ version: 99, patients: [{ id: 'x' }], assessments: [] });
  const db = store.load();
  dat('có báo lỗi', store.loadError().indexOf('99') >= 0, store.loadError());
  dat('KHÔNG xoá dữ liệu', db.patients.length === 1);
  dat('chặn ghi đè', store.save() === false);
}

console.log('\n=== 5. Dữ liệu hỏng thì không được ghi đè ===');
{
  const kho = Object.create(null);
  kho[KEY] = '{ day khong phai JSON hop le';
  const canhBao = [];
  const sandbox = {
    window: { localStorage: {
      getItem: k => (k in kho ? kho[k] : null),
      setItem: (k, v) => { kho[k] = String(v); },
      removeItem: k => { delete kho[k]; } } },
    console: { log(){}, info(){}, warn(){}, error(){} },
    alert: m => canhBao.push(String(m)),
    Blob: function(){}, URL:{createObjectURL(){return '';},revokeObjectURL(){}},
    document:{createElement:()=>({click(){},style:{}}),body:{appendChild(){},removeChild(){}}},
    setTimeout: () => 0
  };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(NGUON, 'utf8'), sandbox);
  const store = sandbox.window.PHCN.store;
  store.load();
  dat('có báo lỗi dữ liệu hỏng', store.loadError().indexOf('hỏng') >= 0, store.loadError());
  const khoaHong = Object.keys(kho).filter(k => k.indexOf('__corrupt_') >= 0);
  dat('giữ lại bản gốc ở khoá riêng', khoaHong.length === 1);
  dat('bản gốc còn nguyên văn', kho[khoaHong[0]] === '{ day khong phai JSON hop le');
  dat('chặn ghi đè', store.save() === false);
  dat('khoá chính CHƯA bị ghi đè', kho[KEY] === '{ day khong phai JSON hop le');
  dat('có cảnh báo cho người dùng', canhBao.length > 0);
}

console.log('\n=== 6. Nhập file sao lưu v1 phải được nâng cấp ===');
{
  const { store } = napStore(undefined);
  const fileCu = JSON.stringify({
    version: 1,
    patients: [{ id: 'bn_9', code: 'BN009', name: 'Lê Văn C', groups: ['cardiac'] }],
    assessments: [], settings: {}
  });
  const kq = store.importJSON(fileCu, 'replace');
  const db = store.load();
  dat('nhập thay thế: đã nâng lên v2', db.version === 2, 'được ' + db.version);
  dat('nhập thay thế: có notes/attachments', Array.isArray(db.notes) && Array.isArray(db.attachments));
  dat('nhập thay thế: giữ bệnh nhân', kq.patients === 1 && db.patients[0].code === 'BN009');
}
{
  const { store } = napStore({ version: 2, patients: [], assessments: [], notes: [], attachments: [], settings: {} });
  const kq = store.importJSON(JSON.stringify({
    version: 1,
    patients: [{ id: 'bn_8', code: 'BN008' }],
    assessments: [{ id: 'lt_8', patientId: 'bn_8' }],
    settings: {}
  }), 'merge');
  dat('nhập gộp từ file v1 chạy được', kq.patients === 1 && kq.assessments === 1);
  dat('nhập gộp trả về cả số notes/attachments', kq.notes === 0 && kq.attachments === 0);
}

console.log('\n=== 7. Không mất dữ liệu notes/attachments khi gộp ===');
{
  const { store } = napStore({
    version: 2, patients: [], assessments: [], settings: {},
    notes: [{ id: 'n1', text: 'ghi chú máy A' }],
    attachments: [{ id: 't1', url: 's3://a.jpg' }]
  });
  const kq = store.importJSON(JSON.stringify({
    version: 2, patients: [], assessments: [], settings: {},
    notes: [{ id: 'n2', text: 'ghi chú máy B' }],
    attachments: [{ id: 't2', url: 's3://b.jpg' }]
  }), 'merge');
  const db = store.load();
  dat('gộp thêm ghi chú máy khác', kq.notes === 1 && db.notes.length === 2);
  dat('gộp thêm tệp đính kèm máy khác', kq.attachments === 1 && db.attachments.length === 2);
  const lai = store.importJSON(JSON.stringify({
    version: 2, patients: [], assessments: [], settings: {},
    notes: [{ id: 'n2', text: 'ghi chú máy B' }], attachments: []
  }), 'merge');
  dat('gộp lần hai không nhân đôi', lai.notes === 0 && store.load().notes.length === 2);
}

console.log('\n-------------------------------------------');
console.log(soHong === 0
  ? 'TAT CA ' + soDat + ' KIEM THU DEU DAT.'
  : soDat + ' dat, ' + soHong + ' HONG.');
process.exit(soHong === 0 ? 0 : 1);
