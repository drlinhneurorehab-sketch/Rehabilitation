# -*- coding: utf-8 -*-
"""Sinh cac file .gs (Google Apps Script) tao Google Form tu bo nhap lieu Excel.

    python tools/gen_gs.py "duong/dan/05_BO_NHAP_LIEU_PHCN_TIM_MACH.xlsx"

Dung chung bo doc Excel voi ../nckh-tim-mach/tools/gen_dict.py nen tu dien bien
cua Google Form va cua web app luon khop nhau.
"""
import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
GEN_DICT = os.path.normpath(os.path.join(
    ROOT, '..', 'nckh-tim-mach', 'tools', 'gen_dict.py'))


def load_gen_dict():
    spec = importlib.util.spec_from_file_location('gen_dict', GEN_DICT)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


# ---------------------------------------------------------------------------
# Bo cau hoi hoi theo tung muc (che do CHI_TIET). Moi bo la mot cau hoi dang
# luoi trong Google Form -> mot muc = mot cot trong sheet tra loi.
# Cac bien tong se do script tu cong, khong hoi truc tiep nua.
# ---------------------------------------------------------------------------
BO_CAU_HOI = [
    {
        'id': 'mlhfq',
        'tieu_de': 'MLHFQ — Chất lượng cuộc sống suy tim Minnesota',
        'mo_ta': 'Trong tháng qua, bệnh tim đã cản trở người bệnh sống như mong '
                 'muốn ở mức nào? (0 = không, 5 = rất nhiều)',
        'nguon': 'Rector TS, Cohn JN. Am Heart J. 1992;124:1017-25',
        'nhom': 'K. Bộ câu hỏi',
        'cot': ['0 – Không', '1 – Rất ít', '2', '3', '4', '5 – Rất nhiều'],
        'thay_the': ['mlhfq_tc', 'mlhfq_cx', 'mlhfq'],
        'muc': [
            'Gây phù chân, mắt cá chân',
            'Buộc phải ngồi hoặc nằm nghỉ ban ngày',
            'Làm việc đi bộ hoặc leo cầu thang trở nên khó khăn',
            'Làm việc nhà trở nên khó khăn',
            'Khó đi xa khỏi nhà',
            'Khó ngủ ngon vào ban đêm',
            'Khó tham gia hoạt động cùng bạn bè, người thân',
            'Khó làm việc kiếm sống',
            'Khó tham gia giải trí, thể thao, sở thích',
            'Ảnh hưởng đến sinh hoạt tình dục',
            'Phải ăn kiêng những món yêu thích',
            'Gây khó thở',
            'Làm mệt mỏi, kiệt sức, thiếu năng lượng',
            'Phải nằm viện điều trị',
            'Tốn kém chi phí y tế',
            'Gây tác dụng phụ của thuốc',
            'Cảm thấy là gánh nặng cho gia đình, bạn bè',
            'Cảm thấy mất tự chủ trong cuộc sống',
            'Cảm thấy lo lắng',
            'Khó tập trung hoặc giảm trí nhớ',
            'Cảm thấy trầm cảm',
        ],
    },
    {
        'id': 'phq9',
        'tieu_de': 'PHQ-9 — Sàng lọc trầm cảm',
        'mo_ta': 'Trong 2 tuần qua, người bệnh bị làm phiền bởi các vấn đề sau ở mức độ nào?',
        'nguon': 'Kroenke K et al. J Gen Intern Med. 2001;16:606-13',
        'nhom': 'K. Bộ câu hỏi',
        'cot': ['0 – Không ngày nào', '1 – Vài ngày',
                '2 – Hơn nửa số ngày', '3 – Gần như mỗi ngày'],
        'thay_the': ['phq9', 'phq9_c9'],
        'muc': [
            'Ít hứng thú hoặc không thấy vui thích khi làm việc gì',
            'Cảm thấy buồn, chán nản hoặc tuyệt vọng',
            'Khó ngủ, ngủ không yên giấc hoặc ngủ quá nhiều',
            'Cảm thấy mệt mỏi hoặc có ít năng lượng',
            'Ăn kém hoặc ăn quá nhiều',
            'Cảm thấy tự ti, thất bại, hoặc làm gia đình thất vọng',
            'Khó tập trung (đọc báo, xem tivi)',
            'Di chuyển hoặc nói chậm chạp bất thường / bồn chồn quá mức',
            'Có ý nghĩ muốn chết hoặc tự làm hại bản thân',
        ],
    },
    {
        'id': 'gad7',
        'tieu_de': 'GAD-7 — Sàng lọc lo âu lan tỏa',
        'mo_ta': 'Trong 2 tuần qua, người bệnh bị làm phiền bởi các vấn đề sau ở mức độ nào?',
        'nguon': 'Spitzer RL et al. Arch Intern Med. 2006;166:1092-7',
        'nhom': 'K. Bộ câu hỏi',
        'cot': ['0 – Không ngày nào', '1 – Vài ngày',
                '2 – Hơn nửa số ngày', '3 – Gần như mỗi ngày'],
        'thay_the': ['gad7'],
        'muc': [
            'Cảm thấy bồn chồn, lo lắng hoặc căng thẳng',
            'Không thể ngừng lo lắng hoặc không kiểm soát được sự lo lắng',
            'Lo lắng quá nhiều về những chuyện khác nhau',
            'Khó thư giãn',
            'Bồn chồn đến mức khó ngồi yên',
            'Dễ bực bội hoặc cáu kỉnh',
            'Cảm thấy sợ hãi như thể điều gì tồi tệ sắp xảy ra',
        ],
    },
    {
        'id': 'eq5d',
        'tieu_de': 'EQ-5D-5L — Năm chiều sức khỏe HÔM NAY',
        'mo_ta': 'Năm chiều tạo thành mã sức khỏe 5 chữ số (biến eq5d_ma). '
                 'Dùng trong nghiên cứu cần đăng ký license với EuroQol.',
        'nguon': 'EuroQol Group. Health Policy. 1990;16:199-208',
        'nhom': 'K. Bộ câu hỏi',
        'cot': ['1 – Không có vấn đề', '2 – Nhẹ', '3 – Vừa',
                '4 – Nặng', '5 – Không thể / cực kỳ nặng'],
        'thay_the': ['eq5d_ma'],
        'muc': [
            'Đi lại',
            'Tự chăm sóc (tắm, mặc quần áo)',
            'Sinh hoạt thường lệ (làm việc, việc nhà, giải trí)',
            'Đau / khó chịu',
            'Lo lắng / trầm cảm',
        ],
    },
]

# Bo cau hoi khong dung luoi (moi phan mot thang diem rieng) -> giu nguyen
# cac bien goc trong tu dien, chi bo sung mo ta muc cham diem.
GOI_Y_CHAM_DIEM = {
    'sppb_tb': '0 = không giữ được tư thế nào … 4 = giữ tandem đủ 10 giây',
    'sppb_di': '0 = không đi được; 1 = >8,70 s; 2 = 6,21–8,70 s; 3 = 4,82–6,20 s; 4 = <4,82 s',
    'sppb_ghe': '0 = >60 s hoặc không làm được; 1 = 16,7–60 s; 2 = 13,7–16,69 s; '
                '3 = 11,2–13,69 s; 4 = ≤11,19 s',
    'borg_kt_sau': 'Borg CR10: 0 = hoàn toàn không khó thở … 10 = tối đa',
    'borg_met_sau': 'Borg CR10: 0 = hoàn toàn không mệt … 10 = tối đa',
    'mwd_dudoan': 'Tính theo phương trình tham chiếu NGƯỜI VIỆT '
                  '(Nguyen và cs., 2024; JRM 56:jrm18628) — KHÔNG dùng Enright.',
    'eq5d_index': 'Tra theo bộ giá trị EQ-5D-5L của Việt Nam.',
    'ntprobnp': 'Ngưỡng tiên lượng nội địa: ≥ 1.858 pg/mL.',
    'mwd1': 'Đo 2 lần cách nhau ≥ 30 phút; phân tích lấy giá trị lớn hơn (ERS/ATS 2014).',
    'mwd2': 'Lần đo thứ hai, cách lần đầu ≥ 30 phút.',
    'cci': 'Chỉ số Charlson đã hiệu chỉnh tuổi (0–20 điểm).',
    'ipaq_met': 'IPAQ-SF: 8,0×(ngày×phút nặng) + 4,0×(ngày×phút vừa) + 3,3×(ngày×phút đi bộ).',
}

MO_TA_FORM = (
    'Bộ nhập liệu cho nghiên cứu phục hồi chức năng tim mạch trên người bệnh suy tim.\n\n'
    'QUY ƯỚC:\n'
    '• Giá trị thiếu (không thu thập được): BỎ TRỐNG câu hỏi — không nhập 0, không nhập 999.\n'
    '• Không áp dụng: nhập KAD (với câu hỏi trắc nghiệm chọn mục "KAD").\n'
    '• Mỗi người bệnh = một lượt trả lời.\n'
    '• KHÔNG nhập họ tên, số điện thoại hay địa chỉ — chỉ dùng mã nghiên cứu.\n\n'
    'Các biến tự tính (BMI, 6MWD, SPPB, GDMT, thiểu cơ, cảnh báo PHQ-9…) do script '
    'trên bảng tính tính tự động, không hỏi trong biểu mẫu này.'
)


def js(v):
    return json.dumps(v, ensure_ascii=False)


def build_items(order, fields, chi_tiet):
    """Tra ve danh sach mo ta muc de Apps Script dung form."""
    thay_the = set()
    if chi_tiet:
        for bo in BO_CAU_HOI:
            thay_the.update(bo['thay_the'])

    bo_theo_nhom = {}
    for bo in BO_CAU_HOI:
        bo_theo_nhom.setdefault(bo['nhom'], []).append(bo)

    items, nhom_hien_tai = [], None
    for code in order:
        f = fields[code]
        if f['kind'] == 'computed':
            continue
        if chi_tiet and code in thay_the:
            continue
        if f['group'] != nhom_hien_tai:
            nhom_hien_tai = f['group']
            items.append({'loai': 'trang', 'tieu_de': nhom_hien_tai})
            if chi_tiet:
                for bo in bo_theo_nhom.get(nhom_hien_tai, []):
                    items.append({
                        'loai': 'luoi', 'id': bo['id'], 'tieu_de': bo['tieu_de'],
                        'mo_ta': bo['mo_ta'] + ' — Nguồn: ' + bo['nguon'],
                        'hang': bo['muc'], 'cot': bo['cot'],
                    })
        items.append(mo_ta_muc(f))
    return items


def mo_ta_muc(f):
    code, kind = f['code'], f['kind']
    tro_giup = []
    if f.get('unit'):
        tro_giup.append('Đơn vị: ' + f['unit'])
    if kind == 'number' and f.get('min') is not None:
        tro_giup.append('Khoảng hợp lệ: %s – %s' % (f['min'], f['max']))
    if code in GOI_Y_CHAM_DIEM:
        tro_giup.append(GOI_Y_CHAM_DIEM[code])
    tro_giup.append('Mã biến: ' + code)

    muc = {
        'loai': kind,
        'ma': code,
        'tieu_de': f['label'],
        'tro_giup': ' · '.join(tro_giup),
    }
    if f.get('required'):
        muc['bat_buoc'] = True
    if kind == 'select':
        muc['lua_chon'] = ['%s – %s' % (o['v'], o['l']) for o in f['options']] + ['KAD']
    elif kind == 'number':
        if f.get('min') is not None:
            muc['min'], muc['max'] = f['min'], f['max']
    elif kind == 'text':
        if f.get('pattern'):
            muc['mau'] = f['pattern']
        if f.get('multiline'):
            muc['loai'] = 'doan_van'
    return muc


# ---------------------------------------------------------------------------
def render_tao_form(items, chi_tiet):
    mau = '''/* =========================================================================
 * PHCN TIM MẠCH — TẠO GOOGLE FORM NHẬP LIỆU NGHIÊN CỨU
 * TỰ ĐỘNG SINH bởi tools/gen_gs.py — đừng sửa tay, sửa file Excel rồi sinh lại.
 *
 * CÁCH DÙNG
 *   1. Vào script.google.com → New project.
 *   2. Dán TOÀN BỘ file này vào, đặt tên dự án rồi Lưu.
 *   3. Chọn hàm taoForm ở thanh trên → Run. Lần đầu Google sẽ hỏi cấp quyền.
 *   4. Xem Execution log để lấy link biểu mẫu.
 *   5. Nếu script dừng giữa chừng vì quá 6 phút, chạy tiếp hàm taoForm một
 *      lần nữa — nó tự nhớ vị trí và làm tiếp, không tạo trùng.
 * ======================================================================= */

var TEN_FORM = @@TEN@@;

var MO_TA_FORM = @@MOTA@@;

/* Các mục của biểu mẫu, đúng thứ tự cột của sheet NHAP_LIEU. */
var MUC = @@ITEMS@@;

/* ------------------------------------------------------------------ */
function taoForm() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('FORM_ID');
  var form;

  if (id) {
    form = FormApp.openById(id);
  } else {
    form = FormApp.create(TEN_FORM);
    form.setDescription(MO_TA_FORM)
        .setProgressBar(true)
        .setAllowResponseEdits(true)
        .setCollectEmail(false)
        .setConfirmationMessage(
          'Đã ghi nhận phiếu. Kiểm tra lại mã nghiên cứu trước khi rời trang.');
    props.setProperty('FORM_ID', form.getId());
    Logger.log('Đã tạo biểu mẫu mới: ' + form.getId());
  }

  var batDau = Number(props.getProperty('VI_TRI') || 0);
  var moc = new Date().getTime();

  for (var i = batDau; i < MUC.length; i++) {
    /* Apps Script bị cắt ở 6 phút — dừng sớm ở phút thứ 4,5 và ghi lại vị trí. */
    if (new Date().getTime() - moc > 270000) {
      props.setProperty('VI_TRI', String(i));
      Logger.log('TẠM DỪNG ở mục ' + i + '/' + MUC.length +
                 '. Chạy lại hàm taoForm để làm tiếp.');
      return;
    }
    themMuc(form, MUC[i]);
  }

  props.deleteProperty('VI_TRI');
  Logger.log('HOÀN TẤT ' + MUC.length + ' mục.');
  Logger.log('Link điền phiếu: ' + form.getPublishedUrl());
  Logger.log('Link chỉnh sửa:  ' + form.getEditUrl());
}

/** Xoá ghi nhớ để lần sau taoForm tạo một biểu mẫu hoàn toàn mới. */
function batDauLai() {
  PropertiesService.getScriptProperties().deleteAllProperties();
  Logger.log('Đã xoá ghi nhớ. Lần chạy taoForm tới sẽ tạo biểu mẫu mới.');
}

/* ------------------------------------------------------------------ */
function themMuc(form, m) {
  if (m.loai === 'trang') {
    form.addPageBreakItem().setTitle(m.tieu_de);
    return;
  }

  if (m.loai === 'luoi') {
    var luoi = form.addGridItem();
    luoi.setTitle(m.tieu_de)
        .setHelpText(m.mo_ta)
        .setRows(m.hang)
        .setColumns(m.cot);
    return;
  }

  if (m.loai === 'select') {
    form.addListItem()
        .setTitle(m.tieu_de)
        .setHelpText(m.tro_giup)
        .setChoiceValues(m.lua_chon)
        .setRequired(!!m.bat_buoc);
    return;
  }

  if (m.loai === 'date') {
    form.addDateItem()
        .setTitle(m.tieu_de)
        .setHelpText(m.tro_giup)
        .setRequired(!!m.bat_buoc);
    return;
  }

  if (m.loai === 'doan_van') {
    form.addParagraphTextItem()
        .setTitle(m.tieu_de)
        .setHelpText(m.tro_giup)
        .setRequired(!!m.bat_buoc);
    return;
  }

  /* number và text đều là ô chữ, khác nhau ở luật kiểm tra. */
  var o = form.addTextItem()
              .setTitle(m.tieu_de)
              .setHelpText(m.tro_giup)
              .setRequired(!!m.bat_buoc);

  if (m.loai === 'number' && m.min !== undefined) {
    /* Google Forms chỉ nhận MỘT luật cho mỗi ô: ưu tiên chặn ngoài khoảng. */
    o.setValidation(FormApp.createTextValidation()
      .setHelpText('Giá trị phải nằm trong khoảng ' + m.min + ' – ' + m.max +
                   '. Bỏ trống nếu không thu thập được.')
      .requireNumberBetween(m.min, m.max)
      .build());
  } else if (m.mau) {
    o.setValidation(FormApp.createTextValidation()
      .setHelpText('Sai định dạng.')
      .requireTextMatchesPattern(m.mau)
      .build());
  }
}
'''
    thay = {
        '@@TEN@@': js('Bộ nhập liệu — Nghiên cứu PHCN tim mạch trên người bệnh suy tim'),
        '@@MOTA@@': js(MO_TA_FORM),
        '@@ITEMS@@': json.dumps(items, ensure_ascii=False, indent=1),
    }
    for k, v in thay.items():
        mau = mau.replace(k, v)
    return mau


# ---------------------------------------------------------------------------
def render_xu_ly(order, fields, chi_tiet):
    """Script dat trong BANG TINH tra loi: dung sheet PHAN_TICH + canh bao."""
    select_codes = [c for c in order if fields[c]['kind'] == 'select']
    date_codes = [c for c in order if fields[c]['kind'] == 'date']
    computed = [c for c in order if fields[c]['kind'] == 'computed']
    tieu_de = {c: fields[c]['label'] for c in order if fields[c]['kind'] != 'computed'}

    bo_luoi = []
    if chi_tiet:
        for bo in BO_CAU_HOI:
            bo_luoi.append({
                'id': bo['id'],
                'tieu_de': bo['tieu_de'],
                'muc': bo['muc'],
            })

    mau = '''/* =========================================================================
 * PHCN TIM MẠCH — XỬ LÝ DỮ LIỆU TRẢ LỜI
 * TỰ ĐỘNG SINH bởi tools/gen_gs.py — đừng sửa tay.
 *
 * Script này đặt trong BẢNG TÍNH nhận câu trả lời (không phải trong biểu mẫu).
 *
 * CÁCH DÙNG
 *   1. Mở biểu mẫu → tab Câu trả lời → biểu tượng Sheets → tạo bảng tính.
 *   2. Trong bảng tính đó: Tiện ích mở rộng → Apps Script.
 *   3. Dán TOÀN BỘ file này vào, Lưu.
 *   4. Chạy hàm caiDat một lần (cấp quyền khi Google hỏi).
 *   5. Từ đó mỗi phiếu gửi lên sẽ tự dựng lại sheet PHAN_TICH.
 *
 * SHEET PHAN_TICH là bộ số liệu để phân tích: 128 cột đúng thứ tự và đúng mã
 * biến của sheet NHAP_LIEU trong file Excel gốc, đã đổi nhãn lựa chọn về mã số
 * và đã tính đủ 10 biến công thức. Tải về dạng CSV là nạp thẳng vào SPSS/Stata/R.
 * ======================================================================= */

/* Địa chỉ email nhận cảnh báo PHQ-9. Để trống '' nếu không muốn gửi. */
var EMAIL_CANH_BAO = '';

var THU_TU = @@ORDER@@;

/* Mã biến -> tiêu đề câu hỏi trong biểu mẫu (dùng để dò cột). */
var TIEU_DE = @@TIEUDE@@;

var LA_LUA_CHON = @@SELECT@@;
var LA_NGAY = @@DATE@@;
var BIEN_TU_TINH = @@COMPUTED@@;
var BO_LUOI = @@LUOI@@;

/* ------------------------------------------------------------------ */
function caiDat() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'khiNhanPhieu') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('khiNhanPhieu').forSpreadsheet(ss).onFormSubmit().create();
  capNhatPhanTich();
  Logger.log('Đã cài đặt. Sheet PHAN_TICH sẽ tự cập nhật sau mỗi phiếu gửi lên.');
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('PHCN Tim mạch')
    .addItem('Dựng lại sheet PHAN_TICH', 'capNhatPhanTich')
    .addItem('Kiểm tra chất lượng số liệu', 'kiemTraChatLuong')
    .addItem('Cài đặt / cài lại trigger', 'caiDat')
    .addToUi();
}

function khiNhanPhieu(e) {
  capNhatPhanTich();
  guiCanhBao(e);
}

/* ------------------------------------------------------------------ */
/*  Dựng sheet PHAN_TICH                                               */
/* ------------------------------------------------------------------ */
function capNhatPhanTich() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var nguon = sheetTraLoi(ss);
  if (!nguon) { Logger.log('Chưa tìm thấy sheet câu trả lời.'); return; }

  var duLieu = nguon.getDataRange().getValues();
  if (duLieu.length < 1) return;
  var dauDe = duLieu[0].map(function (x) { return String(x).trim(); });
  var cot = {};
  dauDe.forEach(function (t, i) { if (!(t in cot)) cot[t] = i; });

  var ket = [THU_TU.slice()];
  for (var r = 1; r < duLieu.length; r++) {
    ket.push(doiMotDong(duLieu[r], cot));
  }

  var dich = ss.getSheetByName('PHAN_TICH') || ss.insertSheet('PHAN_TICH');
  dich.clear();
  dich.getRange(1, 1, ket.length, THU_TU.length).setValues(ket);
  dich.setFrozenRows(1);
  dich.getRange(1, 1, 1, THU_TU.length).setFontWeight('bold');
  Logger.log('PHAN_TICH: ' + (ket.length - 1) + ' phiếu.');
}

function doiMotDong(hang, cot) {
  var tho = {};
  /* Lấy giá trị theo tiêu đề câu hỏi. */
  Object.keys(TIEU_DE).forEach(function (ma) {
    var i = cot[TIEU_DE[ma]];
    tho[ma] = (i === undefined) ? '' : hang[i];
  });

  /* Đổi nhãn lựa chọn "1 – Nam" về mã số 1; giữ nguyên KAD. */
  LA_LUA_CHON.forEach(function (ma) {
    tho[ma] = veMaSo(tho[ma]);
  });
  LA_NGAY.forEach(function (ma) {
    tho[ma] = dinhDangNgay(tho[ma]);
  });

  /* Cộng điểm các bộ câu hỏi dạng lưới. */
  BO_LUOI.forEach(function (bo) {
    var diem = bo.muc.map(function (m) {
      var i = cot[bo.tieu_de + ' [' + m + ']'];
      return (i === undefined) ? null : soHoa(hang[i]);
    });
    if (bo.id === 'mlhfq') {
      tho.mlhfq_tc = congMuc(diem, [2, 3, 4, 5, 6, 7, 12, 13]);
      tho.mlhfq_cx = congMuc(diem, [17, 18, 19, 20, 21]);
      tho.mlhfq = congMuc(diem, day(1, 21));
    } else if (bo.id === 'phq9') {
      tho.phq9 = congMuc(diem, day(1, 9));
      tho.phq9_c9 = diem[8] === null ? '' : diem[8];
    } else if (bo.id === 'gad7') {
      tho.gad7 = congMuc(diem, day(1, 7));
    } else if (bo.id === 'eq5d') {
      var ma = '';
      for (var k = 0; k < 5; k++) {
        if (diem[k] === null) { ma = ''; break; }
        ma += diem[k];
      }
      tho.eq5d_ma = ma;
    }
  });

  tinhBienCongThuc(tho);
  return THU_TU.map(function (ma) {
    var v = tho[ma];
    return (v === undefined || v === null) ? '' : v;
  });
}

/* ------------------------------------------------------------------ */
/*  10 biến tự tính — chép nguyên công thức sheet NHAP_LIEU            */
/* ------------------------------------------------------------------ */
function tinhBienCongThuc(r) {
  var n = soHoa;

  /* gdmt = MIN(1; ƯCMC/ARB + ARNI) + chẹn beta + MRA + SGLT2 */
  var a = n(r.ucmc_arb), b = n(r.arni), c = n(r.chen_beta),
      d = n(r.mra), e = n(r.sglt2);
  r.gdmt = (a === null || b === null || c === null || d === null || e === null)
    ? '' : Math.min(1, a + b) + c + d + e;

  /* bmi = cân nặng / (chiều cao mét)^2 */
  var w = n(r.can_nang), h = n(r.chieu_cao);
  r.bmi = (w === null || !h) ? '' : lamTron(w / Math.pow(h / 100, 2), 1);

  /* mwd = MAX(lần 1; lần 2) */
  var m1 = n(r.mwd1), m2 = n(r.mwd2);
  r.mwd = (m1 === null && m2 === null) ? ''
    : Math.max(m1 === null ? -Infinity : m1, m2 === null ? -Infinity : m2);

  /* mwd_pct = mwd / mwd_dudoan * 100 */
  var md = n(r.mwd), dd = n(r.mwd_dudoan);
  r.mwd_pct = (md === null || !dd) ? '' : lamTron(md / dd * 100, 1);

  /* sppb = tổng 3 phần, cần đủ cả 3 */
  var s1 = n(r.sppb_tb), s2 = n(r.sppb_di), s3 = n(r.sppb_ghe);
  r.sppb = (s1 === null || s2 === null || s3 === null) ? '' : s1 + s2 + s3;

  /* toc_do_di = 4 / thời gian đi 4 m */
  var t = n(r.tg_di_4m);
  r.toc_do_di = !t ? '' : lamTron(4 / t, 2);

  /* thieu_co theo AWGS 2019 */
  var grip = n(r.luc_nam), gioi = n(r.gioi), sp = n(r.toc_do_di);
  r.thieu_co = (grip === null || gioi === null) ? ''
    : (((gioi === 1 && grip < 28) || (gioi === 2 && grip < 18) ||
        (sp !== null && sp < 1)) ? 1 : 0);

  /* clcs_kem = MLHFQ > 45 */
  var ml = n(r.mlhfq);
  r.clcs_kem = ml === null ? '' : (ml > 45 ? 1 : 0);

  /* canh_bao_tt = PHQ-9 câu 9 >= 1 HOẶC tổng >= 15 */
  var pt = n(r.phq9), q9 = n(r.phq9_c9);
  r.canh_bao_tt = (pt === null && q9 === null) ? ''
    : (((q9 !== null && q9 >= 1) || (pt !== null && pt >= 15)) ? 'BÁO BS NGAY' : '-');

  /* crbs_tong = (NT*7 + BĐM*4 + HC*6 + CV*4) / 21 */
  var c1 = n(r.crbs_nt), c2 = n(r.crbs_bdm), c3 = n(r.crbs_hc), c4 = n(r.crbs_cv);
  r.crbs_tong = (c1 === null || c2 === null || c3 === null || c4 === null)
    ? '' : lamTron((c1 * 7 + c2 * 4 + c3 * 6 + c4 * 4) / 21, 2);
}

/* ------------------------------------------------------------------ */
/*  Kiểm tra chất lượng                                                */
/* ------------------------------------------------------------------ */
function kiemTraChatLuong() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pt = ss.getSheetByName('PHAN_TICH');
  if (!pt) { capNhatPhanTich(); pt = ss.getSheetByName('PHAN_TICH'); }
  var v = pt.getDataRange().getValues();
  var idx = {};
  v[0].forEach(function (t, i) { idx[t] = i; });

  var loi = [['Mã nghiên cứu', 'Vấn đề']];
  var daGap = {};

  for (var r = 1; r < v.length; r++) {
    var ma = String(v[r][idx.ma_nc] || '(chưa có mã)');
    var g = function (k) { return soHoa(v[r][idx[k]]); };

    if (daGap[ma]) loi.push([ma, 'Mã nghiên cứu bị trùng — có ' + (daGap[ma] + 1) + ' phiếu cùng mã']);
    daGap[ma] = (daGap[ma] || 0) + 1;

    var hatt = g('hatt'), hattr = g('hattr');
    if (hatt !== null && hattr !== null && hattr >= hatt) {
      loi.push([ma, 'Huyết áp tâm trương (' + hattr + ') ≥ tâm thu (' + hatt + ')']);
    }
    var lvef = g('lvef'), ef = g('phan_nhom_ef');
    if (lvef !== null && ef !== null) {
      var mong = lvef <= 40 ? 1 : (lvef < 50 ? 2 : 3);
      if (mong !== ef) {
        loi.push([ma, 'LVEF ' + lvef + '% không khớp phân nhóm EF đã chọn (gợi ý nhóm ' + mong + ')']);
      }
    }
    var nhom = g('nhom'), buoi = g('so_buoi');
    if (nhom !== null && buoi !== null) {
      if (nhom === 1 && buoi < 24) loi.push([ma, 'Nhóm A yêu cầu ≥ 24 buổi, đang ghi ' + buoi]);
      if (nhom === 4 && (buoi < 8 || buoi > 23)) loi.push([ma, 'Nhóm C là 8–23 buổi, đang ghi ' + buoi]);
      if ((nhom === 2 || nhom === 3) && buoi > 0) {
        loi.push([ma, 'Nhóm B1/B2 không tham gia tập nhưng số buổi > 0']);
      }
    }
    var nv = g('nv_12t'), nvst = g('nv_st_12t');
    if (nv !== null && nvst !== null && nvst > nv) {
      loi.push([ma, 'Số lần nhập viện do suy tim lớn hơn tổng số lần nhập viện']);
    }
    if (g('mwd1') !== null && g('mwd2') === null) {
      loi.push([ma, '6MWT chỉ có 1 lần đo — quy trình yêu cầu đo 2 lần cách nhau ≥ 30 phút']);
    }
    if (g('icd') === 1 && g('icd_nguong') === null) {
      loi.push([ma, 'Có ICD nhưng chưa ghi ngưỡng nhịp kích hoạt sốc']);
    }
    if (g('hut_thuoc') === 0 && g('bao_nam') > 0) {
      loi.push([ma, 'Chưa bao giờ hút thuốc nhưng số bao-năm > 0']);
    }
    if (String(v[r][idx.canh_bao_tt]) === 'BÁO BS NGAY') {
      loi.push([ma, 'CẢNH BÁO PHQ-9 — báo bác sĩ, chuyển chuyên khoa tâm thần trong 24 giờ']);
    }
    var bnp = g('ntprobnp');
    if (bnp !== null && bnp >= 1858) {
      loi.push([ma, 'NT-proBNP ' + bnp + ' pg/mL ≥ ngưỡng tiên lượng nội địa 1.858']);
    }
  }

  var sh = ss.getSheetByName('KIEM_TRA') || ss.insertSheet('KIEM_TRA');
  sh.clear();
  sh.getRange(1, 1, loi.length, 2).setValues(loi);
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, 2).setFontWeight('bold');
  sh.autoResizeColumns(1, 2);
  Logger.log('KIEM_TRA: ' + (loi.length - 1) + ' vấn đề.');
}

/* ------------------------------------------------------------------ */
function guiCanhBao(e) {
  if (!EMAIL_CANH_BAO || !e || !e.namedValues) return;
  var lay = function (t) {
    var v = e.namedValues[t];
    return (v && v[0]) ? v[0] : '';
  };
  var ma = lay(TIEU_DE.ma_nc);
  var canhBao = [];

  BO_LUOI.forEach(function (bo) {
    if (bo.id !== 'phq9') return;
    var tong = 0, du = true, q9 = null;
    bo.muc.forEach(function (m, i) {
      var s = soHoa(lay(bo.tieu_de + ' [' + m + ']'));
      if (s === null) du = false; else tong += s;
      if (i === 8) q9 = s;
    });
    if ((q9 !== null && q9 >= 1) || (du && tong >= 15)) {
      canhBao.push('PHQ-9: tổng ' + (du ? tong : '?') + ', câu 9 = ' + q9 +
                   ' — báo bác sĩ ngay, chuyển chuyên khoa tâm thần trong 24 giờ.');
    }
  });

  var bnp = soHoa(lay(TIEU_DE.ntprobnp));
  if (bnp !== null && bnp >= 1858) {
    canhBao.push('NT-proBNP ' + bnp + ' pg/mL ≥ ngưỡng tiên lượng nội địa 1.858 pg/mL.');
  }
  if (!canhBao.length) return;

  MailApp.sendEmail(EMAIL_CANH_BAO,
    '[PHCN Tim mạch] Cảnh báo lâm sàng — phiếu ' + ma,
    'Phiếu ' + ma + ' vừa được gửi lên và có dấu hiệu cần xử trí:\\n\\n• ' +
    canhBao.join('\\n• ') +
    '\\n\\n(Thư tự động từ bảng tính nhập liệu nghiên cứu.)');
}

/* ------------------------------------------------------------------ */
/*  Tiện ích                                                           */
/* ------------------------------------------------------------------ */
function sheetTraLoi(ss) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var ten = sheets[i].getName();
    if (ten === 'PHAN_TICH' || ten === 'KIEM_TRA') continue;
    var d = sheets[i].getRange(1, 1).getValue();
    if (String(d).indexOf('Dấu thời gian') === 0 ||
        String(d).indexOf('Timestamp') === 0) return sheets[i];
  }
  return sheets[0] || null;
}

/** '1 – Nam' -> 1 ; 'KAD' -> 'KAD' ; '' -> '' */
function veMaSo(v) {
  if (v === '' || v === null || v === undefined) return '';
  var s = String(v).trim();
  if (s === 'KAD') return 'KAD';
  var m = s.match(/^(-?\\d+)/);
  return m ? Number(m[1]) : s;
}

function soHoa(v) {
  if (v === '' || v === null || v === undefined || v === 'KAD') return null;
  if (typeof v === 'number') return v;
  var m = String(v).trim().replace(',', '.').match(/^-?\\d+(\\.\\d+)?/);
  return m ? Number(m[0]) : null;
}

function dinhDangNgay(v) {
  if (!v) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(v);
}

function lamTron(x, d) {
  var f = Math.pow(10, d);
  return Math.round(x * f) / f;
}

function congMuc(diem, soThuTu) {
  var s = 0;
  for (var i = 0; i < soThuTu.length; i++) {
    var v = diem[soThuTu[i] - 1];
    if (v === null || v === undefined) return '';
    s += v;
  }
  return s;
}

function day(a, b) {
  var out = [];
  for (var i = a; i <= b; i++) out.push(i);
  return out;
}
'''
    thay = {
        '@@ORDER@@': json.dumps(order, ensure_ascii=False),
        '@@TIEUDE@@': json.dumps(tieu_de, ensure_ascii=False, indent=1),
        '@@SELECT@@': json.dumps(select_codes, ensure_ascii=False),
        '@@DATE@@': json.dumps(date_codes, ensure_ascii=False),
        '@@COMPUTED@@': json.dumps(computed, ensure_ascii=False),
        '@@LUOI@@': json.dumps(bo_luoi, ensure_ascii=False, indent=1),
    }
    for k, v in thay.items():
        mau = mau.replace(k, v)
    return mau


def main():
    gd = load_gen_dict()
    src = sys.argv[1] if len(sys.argv) > 1 else None
    groups, order, fields = gd.build(src)
    chi_tiet = '--tong' not in sys.argv

    items = build_items(order, fields, chi_tiet)
    so_muc = len([i for i in items if i['loai'] != 'trang'])

    out1 = os.path.join(ROOT, '1-tao-form.gs')
    with open(out1, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(render_tao_form(items, chi_tiet))

    out2 = os.path.join(ROOT, '2-xu-ly-du-lieu.gs')
    with open(out2, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(render_xu_ly(order, fields, chi_tiet))

    print('Da ghi', out1)
    print('Da ghi', out2)
    print('Che do:', 'chi tiet tung muc bo cau hoi' if chi_tiet else 'chi hoi diem tong')
    print('So bien:', len(order), '| so cau hoi:', so_muc,
          '| so trang:', len([i for i in items if i['loai'] == 'trang']))


if __name__ == '__main__':
    main()
