/* =========================================================================
 * PHCN-METRICS · Thư viện thang điểm lượng hóa chức năng
 * scales-core.js  —  Hạ tầng + Nhóm bệnh lý + Thang điểm dùng CHUNG
 * ========================================================================= */
(function (g) {
  'use strict';

  /* ---------------- Hạ tầng ---------------- */
  var REGISTRY = {};
  var ORDER = [];

  function S(def) {
    if (REGISTRY[def.id]) { console.warn('Trùng id thang điểm:', def.id); }
    def.groups = def.groups || [];
    def.coreFor = def.coreFor || [];
    def.sections = def.sections || [];
    REGISTRY[def.id] = def;
    ORDER.push(def.id);
    return def;
  }

  /* Tạo mảng lựa chọn: O([0,'Không'],[5,'Cần trợ giúp'],[10,'Độc lập']) */
  function O() {
    return Array.prototype.slice.call(arguments).map(function (p) {
      return { v: p[0], l: p[1] };
    });
  }
  /* Dải điểm 0..max, có thể gắn mô tả mốc */
  function rng(max, anchors) {
    var a = [], i;
    for (i = 0; i <= max; i++) {
      a.push({ v: i, l: String(i) + (anchors && anchors[i] ? ' – ' + anchors[i] : '') });
    }
    return a;
  }
  function rngFrom(min, max, anchors) {
    var a = [], i;
    for (i = min; i <= max; i++) {
      a.push({ v: i, l: String(i) + (anchors && anchors[i] ? ' – ' + anchors[i] : '') });
    }
    return a;
  }
  function yn(labelYes, labelNo, vYes, vNo) {
    return [{ v: (vNo === undefined ? 0 : vNo), l: labelNo || 'Không' },
            { v: (vYes === undefined ? 1 : vYes), l: labelYes || 'Có' }];
  }
  function it(id, label, options, extra) {
    var o = { id: id, label: label, type: 'select', options: options };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }
  /* Item số KHÔNG cộng tổng (đo lường: mét, giây, độ...) */
  function num(id, label, unit, extra) {
    var o = { id: id, label: label, type: 'number', unit: unit, sum: false };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }
  /* Item số CÓ cộng tổng (nhập điểm phân mục) */
  function nums(id, label, max, extra) {
    var o = { id: id, label: label, type: 'number', sum: true, min: 0, max: max, unit: '0–' + max + ' điểm' };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }
  function sec(id, title, items, extra) {
    var o = { id: id, title: title, items: items };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }
  /* Diễn giải theo ngưỡng (so sánh <=) */
  function band(rules) {
    return function (t) {
      for (var i = 0; i < rules.length; i++) {
        if (t <= rules[i][0]) return { label: rules[i][1], cls: rules[i][2], text: rules[i][3] || '' };
      }
      var last = rules[rules.length - 1];
      return { label: last[1], cls: last[2], text: last[3] || '' };
    };
  }

  /* ---------------- Nhóm đối tượng bệnh lý ---------------- */
  var GROUPS = [
    { id: 'stroke_motor', name: 'Đột quỵ não – Khiếm khuyết vận động', short: 'ĐQ · Vận động', icon: '🧠', color: '#2563eb',
      desc: 'Liệt nửa người, rối loạn trương lực cơ, thăng bằng, dáng đi, chức năng chi trên.' },
    { id: 'stroke_lang', name: 'Đột quỵ não – Ngôn ngữ, lời nói & nuốt', short: 'ĐQ · Ngôn ngữ', icon: '🗣️', color: '#7c3aed',
      desc: 'Thất ngôn, nói khó (dysarthria), rối loạn nuốt sau đột quỵ.' },
    { id: 'stroke_cog', name: 'Đột quỵ não – Nhận thức & tâm lý', short: 'ĐQ · Nhận thức', icon: '💭', color: '#0891b2',
      desc: 'Suy giảm nhận thức, chú ý, trí nhớ, chức năng điều hành, trầm cảm – lo âu sau đột quỵ.' },
    { id: 'sci', name: 'Tổn thương tủy sống', short: 'Tủy sống', icon: '🦴', color: '#059669',
      desc: 'Phân loại ISNCSCI/ASIA, độc lập chức năng SCIM III, khả năng đi WISCI II, co cứng, đau thần kinh.' },
    { id: 'hip', name: 'Bệnh lý & phẫu thuật khớp háng', short: 'Khớp háng', icon: '🦵', color: '#d97706',
      desc: 'Thoái hóa khớp háng, thay khớp háng toàn phần, gãy cổ xương đùi.' },
    { id: 'knee', name: 'Bệnh lý & phẫu thuật khớp gối', short: 'Khớp gối', icon: '🦿', color: '#dc2626',
      desc: 'Thoái hóa khớp gối, thay khớp gối, tái tạo dây chằng chéo trước, tổn thương sụn chêm.' },
    { id: 'shoulder', name: 'Bệnh lý & phẫu thuật khớp vai', short: 'Khớp vai', icon: '💪', color: '#db2777',
      desc: 'Viêm quanh khớp vai, rách chóp xoay, cứng khớp vai, thay khớp vai, bán trật vai sau đột quỵ.' },
    { id: 'cardiac', name: 'Phục hồi chức năng tim mạch', short: 'Tim mạch', icon: '❤️', color: '#e11d48',
      desc: 'Sau nhồi máu cơ tim, can thiệp mạch vành, phẫu thuật tim, suy tim mạn.' },
    { id: 'pulmo', name: 'Phục hồi chức năng hô hấp', short: 'Hô hấp', icon: '🫁', color: '#0284c7',
      desc: 'COPD, di chứng hậu COVID-19, bệnh phổi mạn tính, cai máy thở.' },
    { id: 'psych', name: 'Tâm thần – Tâm lý – Giấc ngủ', short: 'Tâm lý · Giấc ngủ', icon: '🧩', color: '#6366f1',
      toolOnly: true,
      desc: 'Trầm cảm, lo âu, stress, chất lượng giấc ngủ, mệt mỏi, sảng và gánh nặng người chăm sóc. Áp dụng cho MỌI nhóm bệnh lý.' },
    { id: 'general', name: 'Đánh giá chung / Bệnh lý khác', short: 'Chung', icon: '📋', color: '#475569',
      desc: 'Bộ công cụ nền áp dụng cho mọi bệnh nhân phục hồi chức năng.' }
  ];

  /* Danh sách id mọi nhóm bệnh lý thực (bỏ nhóm chỉ dùng làm bộ công cụ) */
  function allGroupIds() {
    return GROUPS.filter(function (x) { return !x.toolOnly; }).map(function (x) { return x.id; });
  }

  var DOMAINS = {
    body: 'Chức năng & cấu trúc cơ thể',
    activity: 'Hoạt động',
    participation: 'Tham gia & chất lượng sống',
    global: 'Đánh giá tổng thể'
  };

  g.PHCN = g.PHCN || {};
  g.PHCN.reg = { REGISTRY: REGISTRY, ORDER: ORDER };
  g.PHCN.GROUPS = GROUPS;
  g.PHCN.DOMAINS = DOMAINS;
  g.PHCN.allGroupIds = allGroupIds;
  g.PHCN.h = { S: S, O: O, rng: rng, rngFrom: rngFrom, yn: yn, it: it, num: num, nums: nums, sec: sec, band: band };

  /* =======================================================================
   *  A. THANG ĐIỂM DÙNG CHUNG
   * ===================================================================== */

  /* --- A1. Chỉ số Barthel --- */
  S({
    id: 'barthel', mcidVal: 9.25, short: 'BI', name: 'Chỉ số Barthel (Barthel Index)',
    domain: 'activity', max: 100, minutes: '5–10 phút',
    ref: 'Mahoney FI, Barthel DW. Md State Med J. 1965;14:61-5',
    note: 'Đánh giá mức độ độc lập trong 10 hoạt động sinh hoạt hàng ngày cơ bản (ADL). Điểm càng cao càng độc lập.',
    mcid: 'MCID ≈ 9,25 điểm (đột quỵ bán cấp)',
    groups: ['general', 'stroke_motor', 'stroke_cog', 'sci', 'hip', 'knee', 'cardiac', 'pulmo'],
    coreFor: ['general', 'stroke_motor', 'stroke_cog', 'hip', 'sci'],
    sections: [sec('main', 'Mười hoạt động sinh hoạt hàng ngày', [
      it('feed', '1. Ăn uống', O([0, '0 – Không tự ăn được'], [5, '5 – Cần trợ giúp (cắt thức ăn, phết bơ…)'], [10, '10 – Độc lập'])),
      it('bath', '2. Tắm', O([0, '0 – Phụ thuộc'], [5, '5 – Độc lập (tự vào/ra bồn hoặc vòi sen)'])),
      it('groom', '3. Vệ sinh cá nhân (rửa mặt, chải tóc, đánh răng, cạo râu)', O([0, '0 – Cần trợ giúp'], [5, '5 – Độc lập'])),
      it('dress', '4. Mặc quần áo', O([0, '0 – Phụ thuộc'], [5, '5 – Cần trợ giúp một phần'], [10, '10 – Độc lập (kể cả cài cúc, khóa kéo, buộc dây giày)'])),
      it('bowel', '5. Kiểm soát đại tiện', O([0, '0 – Mất kiểm soát / cần thụt tháo'], [5, '5 – Thỉnh thoảng són (≤1 lần/tuần)'], [10, '10 – Kiểm soát tốt'])),
      it('bladder', '6. Kiểm soát tiểu tiện', O([0, '0 – Mất kiểm soát / đặt sonde không tự chăm sóc được'], [5, '5 – Thỉnh thoảng són (≤1 lần/24h)'], [10, '10 – Kiểm soát tốt / tự chăm sóc sonde'])),
      it('toilet', '7. Sử dụng nhà vệ sinh', O([0, '0 – Phụ thuộc'], [5, '5 – Cần trợ giúp một phần'], [10, '10 – Độc lập (ngồi/đứng dậy, lau chùi, mặc lại quần áo)'])),
      it('transfer', '8. Di chuyển giường ↔ ghế', O([0, '0 – Không thực hiện được, không giữ được thăng bằng ngồi'], [5, '5 – Cần trợ giúp nhiều (1–2 người)'], [10, '10 – Cần trợ giúp ít (bằng lời hoặc thể chất)'], [15, '15 – Độc lập'])),
      it('mobility', '9. Di chuyển trên mặt phẳng', O([0, '0 – Không di chuyển được'], [5, '5 – Độc lập bằng xe lăn >50 m'], [10, '10 – Đi được >50 m có người trợ giúp'], [15, '15 – Đi độc lập >50 m (có thể dùng dụng cụ trợ giúp)'])),
      it('stairs', '10. Lên xuống cầu thang', O([0, '0 – Không thực hiện được'], [5, '5 – Cần trợ giúp hoặc giám sát'], [10, '10 – Độc lập']))
    ])],
    interpret: band([
      [20, 'Phụ thuộc hoàn toàn', 'severe', 'Cần chăm sóc toàn diện 24/24.'],
      [60, 'Phụ thuộc nặng', 'severe', 'Cần trợ giúp trong phần lớn hoạt động.'],
      [90, 'Phụ thuộc trung bình', 'mod', 'Cần trợ giúp một phần, còn tiềm năng cải thiện.'],
      [99, 'Phụ thuộc nhẹ', 'mild', 'Gần độc lập, cần giám sát ở một vài hoạt động.'],
      [100, 'Độc lập hoàn toàn', 'good', 'Độc lập trong sinh hoạt hàng ngày cơ bản.']
    ])
  });

  /* --- A2. Thang Rankin sửa đổi --- */
  S({
    id: 'mrs', short: 'mRS', name: 'Thang Rankin sửa đổi (modified Rankin Scale)',
    domain: 'global', max: 6, reverse: true, minutes: '2 phút',
    ref: 'van Swieten JC et al. Stroke. 1988;19:604-7',
    note: 'Tiêu chí kết cục chuẩn trong nghiên cứu đột quỵ. Điểm CÀNG THẤP càng tốt. Kết cục tốt thường định nghĩa mRS 0–2.',
    groups: ['general', 'stroke_motor', 'stroke_cog', 'stroke_lang'],
    coreFor: ['general', 'stroke_motor', 'stroke_cog', 'stroke_lang'],
    sections: [sec('main', 'Mức độ tàn tật tổng thể', [
      it('mrs', 'Chọn mức mô tả đúng nhất', O(
        [0, '0 – Không có triệu chứng'],
        [1, '1 – Không tàn tật đáng kể dù còn triệu chứng; thực hiện được mọi công việc và sinh hoạt thường ngày'],
        [2, '2 – Tàn tật nhẹ: không làm được mọi việc như trước nhưng tự chăm sóc bản thân không cần trợ giúp'],
        [3, '3 – Tàn tật vừa: cần một số trợ giúp nhưng đi lại được không cần người dìu'],
        [4, '4 – Tàn tật vừa–nặng: không đi lại được nếu không có người trợ giúp; không tự đáp ứng nhu cầu cơ thể'],
        [5, '5 – Tàn tật nặng: nằm liệt giường, tiêu tiểu không tự chủ, cần chăm sóc điều dưỡng liên tục'],
        [6, '6 – Tử vong']
      ), { fig: 'level:mrs' })
    ])],
    interpret: band([
      [2, 'Kết cục tốt (độc lập chức năng)', 'good', 'mRS 0–2 được xem là kết cục thuận lợi trong nghiên cứu đột quỵ.'],
      [3, 'Tàn tật vừa', 'mod', ''],
      [5, 'Tàn tật nặng – phụ thuộc', 'severe', ''],
      [6, 'Tử vong', 'severe', '']
    ])
  });

  /* --- A3. FIM --- */
  var fimA = { 1: 'Trợ giúp toàn bộ (BN tự làm <25%)', 2: 'Trợ giúp tối đa (25–49%)', 3: 'Trợ giúp trung bình (50–74%)', 4: 'Trợ giúp tối thiểu (≥75%)', 5: 'Giám sát / chuẩn bị', 6: 'Độc lập có điều kiện (dụng cụ, chậm hơn)', 7: 'Độc lập hoàn toàn' };
  S({
    id: 'fim', short: 'FIM', name: 'Thang đo độc lập chức năng (Functional Independence Measure)',
    domain: 'activity', max: 126, min: 18, minutes: '20–30 phút',
    ref: 'Keith RA et al. Adv Clin Rehabil. 1987;1:6-18',
    note: '18 mục × 1–7 điểm. Gồm 13 mục vận động (13–91) và 5 mục nhận thức (5–35). Nhạy hơn Barthel ở nhóm phụ thuộc nặng.',
    groups: ['general', 'stroke_motor', 'stroke_cog', 'sci', 'hip'],
    coreFor: ['sci'],
    subscales: [
      { id: 'motor', name: 'Vận động (13 mục, 13–91)', items: ['selfcare.feed', 'selfcare.groom', 'selfcare.bath', 'selfcare.dressup', 'selfcare.dresslow', 'selfcare.toileting', 'sphincter.bladder', 'sphincter.bowel', 'transfer.tbed', 'transfer.ttoilet', 'transfer.ttub', 'locomotion.walk', 'locomotion.stairs'], max: 91 },
      { id: 'cog', name: 'Nhận thức (5 mục, 5–35)', items: ['comm.compre', 'comm.express', 'social.social', 'social.solve', 'social.memory'], max: 35 }
    ],
    sections: [
      sec('selfcare', 'Tự chăm sóc', [
        it('feed', '1. Ăn uống', rngFrom(1, 7, fimA)),
        it('groom', '2. Chải chuốt – vệ sinh cá nhân', rngFrom(1, 7, fimA)),
        it('bath', '3. Tắm rửa', rngFrom(1, 7, fimA)),
        it('dressup', '4. Mặc quần áo phần thân trên', rngFrom(1, 7, fimA)),
        it('dresslow', '5. Mặc quần áo phần thân dưới', rngFrom(1, 7, fimA)),
        it('toileting', '6. Sử dụng nhà vệ sinh', rngFrom(1, 7, fimA))
      ]),
      sec('sphincter', 'Kiểm soát cơ tròn', [
        it('bladder', '7. Kiểm soát bàng quang', rngFrom(1, 7, fimA)),
        it('bowel', '8. Kiểm soát ruột', rngFrom(1, 7, fimA))
      ]),
      sec('transfer', 'Di chuyển tại chỗ (transfers)', [
        it('tbed', '9. Giường – ghế – xe lăn', rngFrom(1, 7, fimA)),
        it('ttoilet', '10. Bồn cầu', rngFrom(1, 7, fimA)),
        it('ttub', '11. Bồn tắm / vòi sen', rngFrom(1, 7, fimA))
      ]),
      sec('locomotion', 'Vận chuyển', [
        it('walk', '12. Đi bộ / xe lăn', rngFrom(1, 7, fimA)),
        it('stairs', '13. Lên xuống cầu thang', rngFrom(1, 7, fimA))
      ]),
      sec('comm', 'Giao tiếp', [
        it('compre', '14. Hiểu (nghe / nhìn)', rngFrom(1, 7, fimA)),
        it('express', '15. Diễn đạt (lời nói / không lời)', rngFrom(1, 7, fimA))
      ]),
      sec('social', 'Nhận thức xã hội', [
        it('social', '16. Tương tác xã hội', rngFrom(1, 7, fimA)),
        it('solve', '17. Giải quyết vấn đề', rngFrom(1, 7, fimA)),
        it('memory', '18. Trí nhớ', rngFrom(1, 7, fimA))
      ])
    ],
    interpret: band([
      [18, 'Phụ thuộc hoàn toàn', 'severe', ''],
      [53, 'Phụ thuộc nhiều (cần trợ giúp >50%)', 'severe', ''],
      [90, 'Phụ thuộc một phần (trợ giúp <50%)', 'mod', ''],
      [125, 'Gần độc lập / độc lập có điều kiện', 'mild', ''],
      [126, 'Độc lập hoàn toàn', 'good', '']
    ])
  });

  /* --- A4. Berg Balance Scale --- */
  var bergA = { 0: 'không thực hiện được', 4: 'thực hiện an toàn, độc lập' };
  S({
    id: 'berg', mcidVal: 6, short: 'BBS', name: 'Thang thăng bằng Berg (Berg Balance Scale)',
    domain: 'activity', max: 56, minutes: '15–20 phút',
    ref: 'Berg K et al. Can J Public Health. 1992;83(Suppl 2):S7-11',
    note: '14 nghiệm pháp × 0–4 điểm. Điểm <45 gợi ý nguy cơ ngã cao.',
    mcid: 'MDC ≈ 6 điểm (đột quỵ mạn tính)',
    groups: ['general', 'stroke_motor', 'sci', 'hip', 'knee', 'cardiac'],
    coreFor: ['stroke_motor'],
    sections: [sec('main', '14 nghiệm pháp thăng bằng (0 = không làm được → 4 = độc lập, an toàn)', [
      it('b1', '1. Từ ngồi sang đứng', rng(4, bergA)),
      it('b2', '2. Đứng không trợ giúp (2 phút)', rng(4, bergA)),
      it('b3', '3. Ngồi không tựa lưng, chân chạm sàn (2 phút)', rng(4, bergA)),
      it('b4', '4. Từ đứng sang ngồi', rng(4, bergA)),
      it('b5', '5. Di chuyển giường ↔ ghế', rng(4, bergA)),
      it('b6', '6. Đứng nhắm mắt (10 giây)', rng(4, bergA)),
      it('b7', '7. Đứng hai chân sát nhau (1 phút)', rng(4, bergA)),
      it('b8', '8. Vươn tay ra trước tối đa khi đứng', rng(4, bergA)),
      it('b9', '9. Nhặt vật dưới sàn từ tư thế đứng', rng(4, bergA)),
      it('b10', '10. Quay đầu nhìn ra sau qua vai trái và phải', rng(4, bergA)),
      it('b11', '11. Xoay người 360°', rng(4, bergA)),
      it('b12', '12. Đặt luân phiên bàn chân lên bục (8 lần)', rng(4, bergA)),
      it('b13', '13. Đứng một chân trước một chân (tandem)', rng(4, bergA)),
      it('b14', '14. Đứng trên một chân', rng(4, bergA))
    ])],
    interpret: band([
      [20, 'Thăng bằng kém – phụ thuộc xe lăn', 'severe', 'Nguy cơ ngã rất cao.'],
      [40, 'Thăng bằng trung bình – đi lại có trợ giúp', 'mod', 'Nguy cơ ngã cao.'],
      [44, 'Nguy cơ ngã cao (<45 điểm)', 'mod', ''],
      [52, 'Thăng bằng khá – đi lại độc lập', 'mild', ''],
      [56, 'Thăng bằng tốt', 'good', '']
    ])
  });

  /* --- A5. FAC --- */
  S({
    id: 'fac', short: 'FAC', name: 'Phân loại khả năng đi bộ chức năng (Functional Ambulation Category)',
    domain: 'activity', max: 5, minutes: '2 phút',
    ref: 'Holden MK et al. Phys Ther. 1984;64:35-40',
    note: 'Phân loại nhanh mức độ trợ giúp cần thiết khi đi bộ.',
    groups: ['general', 'stroke_motor', 'sci', 'hip', 'knee'],
    coreFor: ['stroke_motor'],
    sections: [sec('main', 'Mức độ đi bộ', [
      it('fac', 'Chọn mức', O(
        [0, '0 – Không đi được hoặc cần ≥2 người trợ giúp'],
        [1, '1 – Cần trợ giúp liên tục, nhiều của 1 người (đỡ trọng lượng và thăng bằng)'],
        [2, '2 – Cần trợ giúp nhẹ hoặc chạm liên tục của 1 người để giữ thăng bằng'],
        [3, '3 – Cần giám sát bằng lời, không cần chạm'],
        [4, '4 – Đi độc lập trên mặt phẳng, cần trợ giúp ở cầu thang / dốc / bề mặt gồ ghề'],
        [5, '5 – Đi độc lập ở mọi địa hình']
      ), { fig: 'level:fac' })
    ])],
    interpret: band([
      [0, 'Không đi được', 'severe', ''],
      [2, 'Phụ thuộc trợ giúp thể chất', 'severe', ''],
      [3, 'Cần giám sát', 'mod', ''],
      [4, 'Độc lập trên mặt phẳng', 'mild', ''],
      [5, 'Đi lại độc lập hoàn toàn', 'good', '']
    ])
  });

  /* --- A6. Rivermead Mobility Index --- */
  S({
    id: 'rmi', short: 'RMI', name: 'Chỉ số vận động Rivermead (Rivermead Mobility Index)',
    domain: 'activity', max: 15, minutes: '5 phút',
    ref: 'Collen FM et al. Int Disabil Stud. 1991;13:50-4',
    note: '15 câu hỏi Có/Không về khả năng vận động, từ lăn trở tại giường đến chạy.',
    groups: ['general', 'stroke_motor', 'sci', 'hip', 'knee'],
    sections: [sec('main', 'Trả lời Có (1 điểm) / Không (0 điểm)', [
      it('r1', '1. Tự xoay trở trên giường (nằm ngửa → nằm nghiêng)', yn('Có', 'Không')),
      it('r2', '2. Tự ngồi dậy từ tư thế nằm', yn('Có', 'Không')),
      it('r3', '3. Ngồi thăng bằng ở mép giường 10 giây', yn('Có', 'Không')),
      it('r4', '4. Đứng dậy từ ghế trong 15 giây và giữ 15 giây', yn('Có', 'Không')),
      it('r5', '5. Đứng không trợ giúp 10 giây', yn('Có', 'Không')),
      it('r6', '6. Di chuyển từ giường sang ghế không trợ giúp', yn('Có', 'Không')),
      it('r7', '7. Đi 10 m trong nhà (có hoặc không dụng cụ trợ giúp)', yn('Có', 'Không')),
      it('r8', '8. Lên xuống một tầng cầu thang không trợ giúp', yn('Có', 'Không')),
      it('r9', '9. Đi lại ngoài trời trên mặt phẳng', yn('Có', 'Không')),
      it('r10', '10. Đi 10 m trong nhà KHÔNG dùng dụng cụ trợ giúp', yn('Có', 'Không')),
      it('r11', '11. Nhặt vật dưới sàn khi đang đi bộ', yn('Có', 'Không')),
      it('r12', '12. Đi lại ngoài trời trên mặt gồ ghề', yn('Có', 'Không')),
      it('r13', '13. Tự tắm (vào/ra bồn tắm hoặc vòi sen)', yn('Có', 'Không')),
      it('r14', '14. Lên xuống 4 bậc thang không vịn', yn('Có', 'Không')),
      it('r15', '15. Chạy 10 m trong 4 giây, không khập khiễng', yn('Có', 'Không'))
    ])],
    interpret: band([
      [3, 'Vận động rất hạn chế (chủ yếu tại giường)', 'severe', ''],
      [7, 'Vận động hạn chế nhiều', 'mod', ''],
      [11, 'Vận động khá', 'mild', ''],
      [15, 'Vận động tốt / gần bình thường', 'good', '']
    ])
  });

  /* --- A7. Modified Ashworth Scale --- */
  var masOpts = O([0, '0 – Không tăng trương lực'],
    [1, '1 – Tăng nhẹ: sức cản nhẹ ở cuối tầm vận động'],
    [1.5, '1+ – Tăng nhẹ: sức cản ở <50% tầm vận động còn lại'],
    [2, '2 – Tăng rõ trong phần lớn tầm vận động, vẫn di động dễ'],
    [3, '3 – Tăng nhiều, vận động thụ động khó khăn'],
    [4, '4 – Cứng ở tư thế gấp hoặc duỗi']);
  S({
    id: 'mas', short: 'MAS', name: 'Thang Ashworth sửa đổi (Modified Ashworth Scale)',
    domain: 'body', max: 36, minutes: '10 phút', figure: 'ashworth',
    ref: 'Bohannon RW, Smith MB. Phys Ther. 1987;67:206-7',
    note: 'Lượng giá co cứng theo nhóm cơ ở bên tổn thương. Mức "1+" được mã hóa 1,5 để thuận tiện phân tích thống kê.',
    groups: ['general', 'stroke_motor', 'sci'],
    coreFor: ['stroke_motor', 'sci'],
    sections: [
      sec('ue', 'Chi trên (bên tổn thương)', [
        it('sh_add', 'Cơ khép vai', masOpts),
        it('el_flex', 'Cơ gấp khuỷu', masOpts),
        it('fore_pron', 'Cơ sấp cẳng tay', masOpts),
        it('wr_flex', 'Cơ gấp cổ tay', masOpts),
        it('fin_flex', 'Cơ gấp ngón tay', masOpts)
      ]),
      sec('le', 'Chi dưới (bên tổn thương)', [
        it('hip_add', 'Cơ khép háng', masOpts),
        it('knee_ext', 'Cơ duỗi gối (tứ đầu đùi)', masOpts),
        it('knee_flex', 'Cơ gấp gối (hamstrings)', masOpts),
        it('ankle_pf', 'Cơ gấp gan chân (tam đầu cẳng chân)', masOpts)
      ])
    ],
    interpret: band([
      [0, 'Không co cứng', 'good', ''],
      [6, 'Co cứng nhẹ', 'mild', ''],
      [14, 'Co cứng vừa', 'mod', ''],
      [40, 'Co cứng nặng, lan tỏa', 'severe', 'Cân nhắc botulinum toxin / thuốc giãn cơ / phẫu thuật chỉnh hình.']
    ])
  });

  /* --- A8. Đau NRS --- */
  S({
    id: 'pain', mcidVal: 2, short: 'NRS', name: 'Lượng giá đau (Numeric Rating Scale)',
    domain: 'body', max: 10, reverse: true, minutes: '2 phút',
    ref: 'Farrar JT et al. Pain. 2001;94:149-58',
    note: 'Điểm tổng lấy theo mục "đau hiện tại". Các mục còn lại là biến số bổ sung.',
    mcid: 'MCID ≈ giảm 2 điểm hoặc 30%',
    groups: ['general', 'stroke_motor', 'sci', 'hip', 'knee', 'shoulder'],
    coreFor: ['hip', 'knee', 'shoulder'],
    sections: [sec('main', 'Cường độ đau trong 24 giờ qua', [
      it('now', 'Đau hiện tại', rng(10, { 0: 'không đau', 10: 'đau không chịu nổi' }), { fig: 'faces' }),
      num('worst', 'Đau nhiều nhất trong 24h', 'điểm 0–10', { min: 0, max: 10 }),
      num('avg', 'Đau trung bình trong 24h', 'điểm 0–10', { min: 0, max: 10 }),
      { id: 'loc', label: 'Vị trí đau (bấm chọn trên sơ đồ, có thể chọn nhiều vùng)', type: 'bodymap', text: true, sum: false }
    ])],
    interpret: band([
      [0, 'Không đau', 'good', ''],
      [3, 'Đau nhẹ', 'mild', ''],
      [6, 'Đau vừa', 'mod', 'Ảnh hưởng tập luyện – cần kiểm soát đau trước buổi tập.'],
      [10, 'Đau nặng', 'severe', 'Cần can thiệp giảm đau tích cực trước khi tập PHCN.']
    ])
  });

  /* --- A9. Bộ test hiệu năng --- */
  S({
    id: 'perf', short: 'PERF', name: 'Bộ test hiệu năng vận động (TUG · 10MWT · 6MWT · lực nắm)',
    domain: 'activity', noTotal: true, minutes: '15 phút',
    ref: 'Podsiadlo & Richardson 1991; ATS Statement 2002',
    note: 'Các đo lường KHÁCH QUAN, không cộng tổng. Đây là biến số liên tục có giá trị cao nhất cho phân tích thống kê.',
    groups: ['general', 'stroke_motor', 'sci', 'hip', 'knee', 'cardiac', 'pulmo'],
    coreFor: ['general', 'knee', 'cardiac', 'pulmo'],
    sections: [
      sec('tug', 'Timed Up and Go (TUG)', [
        num('tug', 'Thời gian TUG', 'giây', { min: 0, max: 300, help: '>13,5 giây: nguy cơ ngã cao ở người cao tuổi; >14 giây ở bệnh nhân đột quỵ.' }),
        it('tug_aid', 'Dụng cụ trợ giúp khi làm TUG', O([0, 'Không'], [0, 'Gậy'], [0, 'Khung tập đi'], [0, 'Nạng'], [0, 'Có người giám sát']), { text: true, sum: false })
      ]),
      sec('gait', 'Tốc độ đi bộ 10 m (10MWT)', [
        num('t10m', 'Thời gian đi 10 m (tốc độ thoải mái)', 'giây', { min: 0, max: 300 }),
        num('speed', 'Tốc độ đi tính được', 'm/giây', { min: 0, max: 5, step: 0.01, help: '<0,4 m/s: đi trong nhà; 0,4–0,8: đi hạn chế ngoài cộng đồng; >0,8: đi được trong cộng đồng. MCID đột quỵ ≈ 0,16 m/s.' }),
        num('cadence', 'Nhịp bước (tùy chọn)', 'bước/phút', { min: 0, max: 250 })
      ]),
      sec('sixmwt', 'Test đi bộ 6 phút (6MWT)', [
        num('d6', 'Quãng đường đi được trong 6 phút', 'mét', { min: 0, max: 1200, help: 'MCID: 30–50 m (tim mạch, hô hấp); ≈34 m (đột quỵ).' }),
        num('stops', 'Số lần dừng nghỉ', 'lần', { min: 0, max: 20 }),
        num('spo2_pre', 'SpO₂ trước test', '%', { min: 50, max: 100 }),
        num('spo2_post', 'SpO₂ thấp nhất sau test', '%', { min: 50, max: 100 }),
        num('hr_pre', 'Mạch trước test', 'lần/phút', { min: 30, max: 220 }),
        num('hr_post', 'Mạch ngay sau test', 'lần/phút', { min: 30, max: 220 }),
        num('borg_post', 'Borg khó thở sau test', 'điểm 0–10', { min: 0, max: 10 })
      ]),
      sec('grip', 'Lực cơ', [
        num('grip_r', 'Lực nắm tay phải', 'kg', { min: 0, max: 100 }),
        num('grip_l', 'Lực nắm tay trái', 'kg', { min: 0, max: 100, help: 'Ngưỡng yếu cơ (EWGSOP2): nam <27 kg, nữ <16 kg.' }),
        num('sts5', 'Test ngồi–đứng 5 lần', 'giây', { min: 0, max: 120, help: '>12 giây gợi ý yếu chi dưới / nguy cơ ngã.' })
      ])
    ]
  });

  /* --- A10. SPPB --- */
  S({
    id: 'sppb', short: 'SPPB', name: 'Bộ test hiệu năng thể chất ngắn (Short Physical Performance Battery)',
    domain: 'activity', max: 12, minutes: '10 phút',
    ref: 'Guralnik JM et al. J Gerontol. 1994;49:M85-94',
    note: 'Ba phần: thăng bằng, tốc độ đi 4 m, ngồi–đứng 5 lần; mỗi phần 0–4 điểm.',
    groups: ['general', 'cardiac', 'pulmo', 'hip', 'knee'],
    sections: [sec('main', 'Ba thành phần', [
      it('bal', 'Thăng bằng (chụm chân / bán tandem / tandem)', rng(4, { 0: 'không giữ được tư thế nào', 4: 'giữ tandem đủ 10 giây' })),
      it('gait', 'Tốc độ đi 4 m', rng(4, { 0: 'không đi được', 1: '>8,70 s', 2: '6,21–8,70 s', 3: '4,82–6,20 s', 4: '<4,82 s' })),
      it('chair', 'Ngồi–đứng 5 lần', rng(4, { 0: '>60 s hoặc không làm được', 1: '16,7–60 s', 2: '13,7–16,69 s', 3: '11,2–13,69 s', 4: '≤11,19 s' }))
    ])],
    interpret: band([
      [3, 'Hạn chế vận động nặng', 'severe', ''],
      [6, 'Hạn chế vận động vừa', 'mod', '≤6 điểm dự báo tăng nguy cơ tàn tật và tử vong.'],
      [9, 'Hạn chế vận động nhẹ', 'mild', ''],
      [12, 'Hiệu năng thể chất tốt', 'good', '']
    ])
  });

  /* --- A11. EQ-5D-5L --- */
  var eqA = ['1 – Không có vấn đề', '2 – Vấn đề nhẹ', '3 – Vấn đề vừa', '4 – Vấn đề nặng', '5 – Không thể / cực kỳ nặng'];
  function eqOpts(labels) { return labels.map(function (l, i) { return { v: i + 1, l: l }; }); }
  S({
    id: 'eq5d', short: 'EQ-5D-5L', name: 'Chất lượng cuộc sống EQ-5D-5L',
    domain: 'participation', max: 25, reverse: true, minutes: '5 phút',
    ref: 'EuroQol Group. Health Policy. 1990;16:199-208',
    note: 'Năm chiều tạo thành mã sức khỏe (VD 11223). Điểm tổng CÀNG THẤP càng tốt. EQ-VAS 0–100 càng cao càng tốt. Sử dụng trong nghiên cứu cần đăng ký license với EuroQol.',
    groups: ['general', 'stroke_motor', 'sci', 'hip', 'knee', 'shoulder', 'cardiac', 'pulmo'],
    coreFor: ['general', 'cardiac'],
    sections: [
      sec('dim', 'Năm chiều sức khỏe (tình trạng hôm nay)', [
        it('mo', '1. Đi lại', eqOpts(['1 – Không khó khăn khi đi lại', '2 – Hơi khó khăn', '3 – Khó khăn vừa', '4 – Rất khó khăn', '5 – Không thể đi lại'])),
        it('sc', '2. Tự chăm sóc (tắm, mặc quần áo)', eqOpts(eqA)),
        it('ua', '3. Sinh hoạt thường lệ (làm việc, học tập, việc nhà, giải trí)', eqOpts(eqA)),
        it('pd', '4. Đau / khó chịu', eqOpts(['1 – Không đau, không khó chịu', '2 – Đau nhẹ', '3 – Đau vừa', '4 – Đau nặng', '5 – Đau cực độ'])),
        it('ad', '5. Lo lắng / trầm cảm', eqOpts(['1 – Không lo lắng, không trầm cảm', '2 – Nhẹ', '3 – Vừa', '4 – Nặng', '5 – Cực độ']))
      ]),
      sec('vas', 'Thang nhìn EQ-VAS', [
        num('vas', 'Tự đánh giá sức khỏe hôm nay (0 = tệ nhất, 100 = tốt nhất)', 'điểm 0–100', { min: 0, max: 100 })
      ])
    ],
    compute: function (v, raw) {
      var dims = ['mo', 'sc', 'ua', 'pd', 'ad'], code = '', sum = 0;
      dims.forEach(function (d) {
        var x = v['dim.' + d];
        if (x === undefined || x === null || x === '') { code += '_'; } else { code += String(x); sum += Number(x); }
      });
      var vas = raw['vas.vas'];
      return { total: sum, extra: { 'Mã sức khỏe': code, 'EQ-VAS': (vas === undefined || vas === '' ? '—' : vas + '/100') } };
    },
    interpret: band([
      [5, 'Không có vấn đề ở cả 5 chiều', 'good', ''],
      [9, 'Ảnh hưởng nhẹ đến chất lượng sống', 'mild', ''],
      [15, 'Ảnh hưởng vừa', 'mod', ''],
      [25, 'Ảnh hưởng nặng đến chất lượng sống', 'severe', '']
    ])
  });

})(window);
