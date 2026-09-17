/* =========================================================================
 * PHCN-METRICS · scales-labs.js
 * CẬN LÂM SÀNG ĐẶC TRƯNG THEO TỪNG NHÓM BỆNH LÝ
 * (sinh hóa – huyết học, chẩn đoán hình ảnh, thăm dò chức năng)
 *
 * Toàn bộ là bộ GHI NHẬN số liệu, không cộng điểm (noTotal), nhưng vẫn
 * được lưu, so sánh giữa các thời điểm và xuất ra file nghiên cứu.
 * ========================================================================= */
(function (g) {
  'use strict';
  var h = g.PHCN.h, S = h.S, O = h.O, it = h.it, num = h.num, sec = h.sec;

  /* Ô chọn lưu nhãn chữ (không tính điểm) */
  function pick(id, label, arr, extra) {
    var o = it(id, label, arr.map(function (x) { return { v: 0, l: x }; }), { text: true, sum: false });
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }
  /* Ô nhập chữ tự do */
  function txt(id, label, placeholder) {
    return { id: id, label: label, type: 'text', text: true, sum: false, placeholder: placeholder || '' };
  }
  function area(id, label, placeholder) {
    return { id: id, label: label, type: 'textarea', text: true, sum: false, placeholder: placeholder || '' };
  }
  var YN = ['Không', 'Có', 'Không làm'];

  /* Phần kết luận dùng chung cuối mỗi bộ */
  function conclusion(extraNote) {
    return sec('ket', 'Kết luận cận lâm sàng', [
      txt('date', 'Ngày làm cận lâm sàng gần nhất', 'VD: 10/06/2026'),
      txt('place', 'Nơi thực hiện', 'Khoa / bệnh viện'),
      area('summary', 'Tóm tắt kết luận cận lâm sàng', extraNote || 'Ghi ngắn gọn các bất thường chính và ảnh hưởng tới kế hoạch phục hồi chức năng'),
      area('impact', 'Ảnh hưởng đến chương trình PHCN', 'VD: chống chỉ định gắng sức, hạn chế chịu lực, cần theo dõi sát…')
    ]);
  }

  /* =======================================================================
   *  1. ĐỘT QUỴ NÃO
   * ===================================================================== */
  S({
    id: 'lab_stroke', short: 'CLS-ĐQ', name: 'Cận lâm sàng — Đột quỵ não',
    domain: 'body', noTotal: true, collapsed: true, minutes: 'ghi theo hồ sơ',
    ref: 'Theo hướng dẫn chẩn đoán và điều trị đột quỵ não (AHA/ASA; Bộ Y tế Việt Nam)',
    note: 'Ghi nhận xét nghiệm, chẩn đoán hình ảnh và thăm dò chức năng đặc trưng của người bệnh đột quỵ. Không tính điểm — dùng làm biến số nền và biến số an toàn khi tập luyện.',
    groups: ['stroke_motor', 'stroke_lang', 'stroke_cog'],
    coreFor: ['stroke_motor', 'stroke_lang', 'stroke_cog'],
    sections: [
      sec('img', 'Chẩn đoán hình ảnh sọ não', [
        pick('type', 'Thể đột quỵ', ['Nhồi máu não', 'Xuất huyết não', 'Xuất huyết dưới nhện', 'Huyết khối tĩnh mạch não', 'Chưa xác định']),
        pick('modality', 'Phương tiện chẩn đoán', ['CT sọ não không cản quang', 'CT có cản quang / CTA', 'MRI sọ não', 'CT + MRI', 'Chưa có']),
        txt('site', 'Vị trí tổn thương', 'VD: vùng chi phối động mạch não giữa phải, nhân bèo, bao trong'),
        pick('side', 'Bên tổn thương', ['Phải', 'Trái', 'Hai bên', 'Thân não / tiểu não']),
        num('volume', 'Thể tích ổ tổn thương (nếu đo được)', 'mL', { min: 0, max: 400, step: 0.1 }),
        num('aspects', 'Điểm ASPECTS (nhồi máu tuần hoàn trước)', '/10', { min: 0, max: 10, help: 'ASPECTS ≤7 gợi ý tổn thương rộng, tiên lượng phục hồi kém hơn.' }),
        pick('fazekas', 'Mức độ tổn thương chất trắng (Fazekas)', ['0 – Không có', '1 – Chấm rải rác', '2 – Bắt đầu hợp lưu', '3 – Hợp lưu lan tỏa', 'Không đánh giá']),
        pick('ht', 'Chuyển dạng xuất huyết', YN),
        pick('atrophy', 'Teo não / giãn não thất', ['Không', 'Nhẹ', 'Vừa', 'Nặng', 'Không đánh giá'])
      ]),
      sec('vessel', 'Thăm dò mạch máu', [
        pick('doppler', 'Siêu âm Doppler động mạch cảnh – đốt sống', ['Bình thường', 'Xơ vữa không hẹp đáng kể', 'Hẹp < 50%', 'Hẹp 50–69%', 'Hẹp ≥ 70%', 'Tắc hoàn toàn', 'Chưa làm']),
        num('imt', 'Bề dày lớp nội – trung mạc (IMT) lớn nhất', 'mm', { min: 0, max: 5, step: 0.01 }),
        pick('sten_side', 'Bên hẹp nặng hơn', ['Không hẹp', 'Phải', 'Trái', 'Hai bên']),
        txt('cta', 'CTA / MRA — vị trí tắc hoặc hẹp', 'VD: tắc đoạn M1 động mạch não giữa phải'),
        pick('tcd', 'Siêu âm Doppler xuyên sọ', ['Bình thường', 'Tăng tốc độ dòng', 'Giảm/mất tín hiệu', 'Chưa làm'])
      ]),
      sec('cardio', 'Tim mạch — tìm nguyên nhân và đánh giá an toàn khi tập', [
        pick('ecg', 'Điện tâm đồ', ['Nhịp xoang', 'Rung nhĩ', 'Cuồng nhĩ', 'Ngoại tâm thu', 'Thiếu máu cơ tim', 'Block dẫn truyền', 'Chưa làm']),
        num('ef', 'Phân suất tống máu thất trái (LVEF) trên siêu âm tim', '%', { min: 5, max: 80 }),
        pick('echo', 'Bất thường trên siêu âm tim', ['Không có', 'Huyết khối buồng tim', 'Rối loạn vận động vùng', 'Bệnh van tim', 'Còn lỗ bầu dục (PFO)', 'Chưa làm']),
        pick('holter', 'Holter điện tâm đồ 24h', ['Không có rối loạn nhịp', 'Phát hiện rung nhĩ cơn', 'Rối loạn nhịp khác', 'Chưa làm']),
        num('sbp', 'Huyết áp tâm thu trung bình khi nghỉ', 'mmHg', { min: 60, max: 250 }),
        num('dbp', 'Huyết áp tâm trương trung bình khi nghỉ', 'mmHg', { min: 30, max: 160 })
      ]),
      sec('blood', 'Huyết học & đông máu', [
        num('hb', 'Hemoglobin', 'g/L', { min: 30, max: 220 }),
        num('plt', 'Tiểu cầu', 'G/L', { min: 0, max: 1000 }),
        num('wbc', 'Bạch cầu', 'G/L', { min: 0, max: 60, step: 0.1 }),
        num('inr', 'INR', '', { min: 0.5, max: 8, step: 0.01 }),
        num('aptt', 'aPTT (bệnh/chứng)', 'tỷ số', { min: 0.5, max: 5, step: 0.01 }),
        pick('antithrombotic', 'Thuốc chống huyết khối đang dùng', ['Không', 'Kháng kết tập tiểu cầu đơn', 'Kháng kết tập tiểu cầu kép', 'Kháng vitamin K', 'Kháng đông đường uống thế hệ mới', 'Heparin trọng lượng phân tử thấp'])
      ]),
      sec('bio', 'Sinh hóa & chuyển hóa', [
        num('glu', 'Glucose máu đói', 'mmol/L', { min: 1, max: 40, step: 0.1 }),
        num('hba1c', 'HbA1c', '%', { min: 3, max: 20, step: 0.1 }),
        num('chol', 'Cholesterol toàn phần', 'mmol/L', { min: 1, max: 15, step: 0.01 }),
        num('ldl', 'LDL-cholesterol', 'mmol/L', { min: 0.2, max: 12, step: 0.01, help: 'Mục tiêu dự phòng thứ phát sau đột quỵ: LDL-C < 1,8 mmol/L.' }),
        num('hdl', 'HDL-cholesterol', 'mmol/L', { min: 0.1, max: 5, step: 0.01 }),
        num('tg', 'Triglycerid', 'mmol/L', { min: 0.1, max: 30, step: 0.01 }),
        num('cre', 'Creatinin máu', 'µmol/L', { min: 20, max: 1500 }),
        num('egfr', 'Mức lọc cầu thận ước tính (eGFR)', 'mL/phút/1,73m²', { min: 1, max: 160 }),
        num('alb', 'Albumin máu', 'g/L', { min: 10, max: 60, step: 0.1, help: '<35 g/L gợi ý suy dinh dưỡng, làm chậm phục hồi.' }),
        num('na', 'Natri máu', 'mmol/L', { min: 100, max: 180 }),
        num('k', 'Kali máu', 'mmol/L', { min: 1.5, max: 8, step: 0.1 }),
        num('crp', 'CRP', 'mg/L', { min: 0, max: 400, step: 0.1 }),
        num('vitd', 'Vitamin D (25-OH)', 'nmol/L', { min: 0, max: 250 })
      ]),
      sec('swallow', 'Nuốt – hô hấp – biến chứng', [
        pick('vfss', 'Đánh giá nuốt bằng hình ảnh', ['Chưa làm', 'VFSS (nuốt cản quang)', 'FEES (nội soi ống mềm)', 'Cả hai']),
        pick('aspiration', 'Kết quả — hít sặc', ['Không hít sặc', 'Xâm nhập thanh quản', 'Hít sặc có phản xạ ho', 'Hít sặc thầm lặng', 'Chưa đánh giá']),
        pick('cxr', 'X-quang ngực', ['Bình thường', 'Viêm phổi', 'Xẹp phổi', 'Tràn dịch màng phổi', 'Chưa làm']),
        pick('dvt', 'Siêu âm Doppler tĩnh mạch chi dưới', ['Không huyết khối', 'Huyết khối tĩnh mạch sâu', 'Chưa làm']),
        pick('feeding', 'Đường nuôi dưỡng hiện tại', ['Ăn đường miệng hoàn toàn', 'Sonde dạ dày', 'Mở thông dạ dày', 'Nuôi dưỡng tĩnh mạch hỗ trợ'])
      ]),
      conclusion('VD: nhồi máu ĐM não giữa phải, ASPECTS 7, hẹp ĐM cảnh trong phải 60%, rung nhĩ, HbA1c 8,2%')
    ]
  });

  /* =======================================================================
   *  2. TỔN THƯƠNG TỦY SỐNG
   * ===================================================================== */
  S({
    id: 'lab_sci', short: 'CLS-TS', name: 'Cận lâm sàng — Tổn thương tủy sống',
    domain: 'body', noTotal: true, collapsed: true, minutes: 'ghi theo hồ sơ',
    ref: 'ISCoS / AO Spine; hướng dẫn theo dõi biến chứng tổn thương tủy sống',
    note: 'Hình ảnh cột sống – tủy, chức năng bàng quang – thận, biến chứng xương khớp và nhiễm trùng. Không tính điểm.',
    groups: ['sci'], coreFor: ['sci'],
    sections: [
      sec('img', 'Hình ảnh cột sống – tủy sống', [
        pick('modality', 'Phương tiện', ['X-quang cột sống', 'CT cột sống', 'MRI cột sống', 'CT + MRI', 'Chưa có']),
        txt('level', 'Mức tổn thương trên hình ảnh', 'VD: vỡ thân đốt sống T10, chèn ép tủy'),
        pick('etiology', 'Cơ chế tổn thương', ['Chấn thương', 'U tủy / di căn', 'Viêm tủy', 'Thiếu máu tủy', 'Thoát vị đĩa đệm chèn ép', 'Dị dạng mạch', 'Khác']),
        pick('cord', 'Tín hiệu tủy trên MRI', ['Bình thường', 'Phù tủy', 'Chảy máu trong tủy', 'Hoại tử / rỗng tủy (syrinx)', 'Teo tủy', 'Chưa làm']),
        pick('compress', 'Còn chèn ép tủy hiện tại', YN),
        txt('classification', 'Phân loại chấn thương (AO Spine / TLICS)', 'VD: AO Spine A4, TLICS 7 điểm'),
        pick('surgery', 'Can thiệp cột sống', ['Chưa phẫu thuật', 'Giải ép', 'Cố định cột sống', 'Giải ép + cố định', 'Điều trị bảo tồn có nẹp']),
        pick('stability', 'Độ vững cột sống hiện tại', ['Vững', 'Cần mang nẹp khi vận động', 'Chưa vững — hạn chế vận động'])
      ]),
      sec('uro', 'Tiết niệu — bàng quang thần kinh', [
        pick('urodyn', 'Niệu động học', ['Chưa làm', 'Bàng quang tăng hoạt cơ detrusor', 'Bàng quang giảm hoạt / mất co bóp', 'Bất đồng vận cơ detrusor – cơ thắt', 'Bình thường']),
        num('capacity', 'Dung tích bàng quang tối đa', 'mL', { min: 0, max: 1200 }),
        num('pdet', 'Áp lực cơ detrusor lúc đầy tối đa', 'cmH₂O', { min: 0, max: 150, help: '>40 cmH₂O là ngưỡng nguy cơ tổn thương đường tiết niệu trên.' }),
        num('pvr', 'Nước tiểu tồn dư sau đi tiểu', 'mL', { min: 0, max: 1500 }),
        pick('kidney', 'Siêu âm hệ tiết niệu', ['Bình thường', 'Ứ nước thận một bên', 'Ứ nước thận hai bên', 'Sỏi thận / bàng quang', 'Dày thành bàng quang', 'Chưa làm']),
        pick('uti', 'Cấy nước tiểu', ['Âm tính', 'Dương tính — có điều trị', 'Vi khuẩn niệu không triệu chứng', 'Chưa làm']),
        pick('bladder_mgmt', 'Phương thức quản lý bàng quang', ['Tiểu tự chủ', 'Thông tiểu ngắt quãng sạch', 'Sonde tiểu lưu', 'Dẫn lưu bàng quang trên xương mu', 'Bao cao su dẫn lưu'])
      ]),
      sec('bio', 'Sinh hóa – huyết học', [
        num('cre', 'Creatinin máu', 'µmol/L', { min: 20, max: 1500 }),
        num('egfr', 'eGFR', 'mL/phút/1,73m²', { min: 1, max: 160 }),
        num('hb', 'Hemoglobin', 'g/L', { min: 30, max: 220 }),
        num('alb', 'Albumin máu', 'g/L', { min: 10, max: 60, step: 0.1 }),
        num('crp', 'CRP', 'mg/L', { min: 0, max: 400, step: 0.1 }),
        num('ca', 'Canxi máu toàn phần', 'mmol/L', { min: 1, max: 4, step: 0.01, help: 'Tăng canxi máu thường gặp giai đoạn sớm sau tổn thương tủy do tiêu xương.' }),
        num('vitd', 'Vitamin D (25-OH)', 'nmol/L', { min: 0, max: 250 })
      ]),
      sec('comp', 'Biến chứng cần tầm soát', [
        pick('dvt', 'Doppler tĩnh mạch chi dưới', ['Không huyết khối', 'Huyết khối tĩnh mạch sâu', 'Chưa làm']),
        pick('ho', 'Cốt hóa lạc chỗ (X-quang / siêu âm)', ['Không', 'Nghi ngờ', 'Có — vị trí ghi ở phần kết luận', 'Chưa làm']),
        num('dexa', 'Mật độ xương DEXA — T-score thấp nhất', 'T-score', { min: -6, max: 3, step: 0.1, help: 'T-score ≤ −2,5: loãng xương, tăng nguy cơ gãy xương khi tập đứng.' }),
        pick('pressure', 'Loét tì đè', ['Không', 'Độ I', 'Độ II', 'Độ III', 'Độ IV']),
        txt('pressure_site', 'Vị trí loét tì đè', 'VD: ụ ngồi phải, xương cùng'),
        pick('spasticity_tx', 'Điều trị co cứng đang dùng', ['Không', 'Thuốc uống', 'Tiêm botulinum toxin', 'Bơm baclofen nội tủy', 'Phẫu thuật'])
      ]),
      sec('neurophys', 'Điện sinh lý thần kinh', [
        pick('ssep', 'Điện thế gợi cảm giác thân thể (SSEP)', ['Bình thường', 'Giảm dẫn truyền', 'Mất đáp ứng', 'Chưa làm']),
        pick('mep', 'Điện thế gợi vận động (MEP)', ['Bình thường', 'Giảm biên độ / kéo dài', 'Mất đáp ứng', 'Chưa làm']),
        pick('emg', 'Điện cơ đồ', ['Bình thường', 'Tổn thương neuron vận động dưới', 'Tổn thương rễ', 'Chưa làm'])
      ]),
      conclusion('VD: vỡ T10 AO A4 đã cố định, còn ứ nước thận trái, bàng quang tăng hoạt, T-score −2,8')
    ]
  });

  /* =======================================================================
   *  3. KHỚP HÁNG
   * ===================================================================== */
  S({
    id: 'lab_hip', short: 'CLS-HÁNG', name: 'Cận lâm sàng — Khớp háng',
    domain: 'body', noTotal: true, collapsed: true, minutes: 'ghi theo hồ sơ',
    ref: 'Kellgren–Lawrence 1957; Garden 1961; ARCO 2019',
    note: 'X-quang, MRI, siêu âm và xét nghiệm đặc trưng cho bệnh lý và phẫu thuật khớp háng. Không tính điểm.',
    groups: ['hip'], coreFor: ['hip'],
    sections: [
      sec('xr', 'X-quang khung chậu – khớp háng', [
        pick('kl', 'Phân độ thoái hóa Kellgren–Lawrence', ['0 – Bình thường', '1 – Nghi ngờ hẹp khe khớp', '2 – Gai xương rõ, hẹp khe nhẹ', '3 – Hẹp khe rõ, xơ xương dưới sụn', '4 – Hẹp khe nặng, biến dạng chỏm', 'Không đánh giá']),
        num('jsw', 'Bề rộng khe khớp hẹp nhất', 'mm', { min: 0, max: 8, step: 0.1 }),
        pick('deform', 'Biến dạng cấu trúc', ['Không', 'Loạn sản ổ cối', 'Chỏm dẹt / biến dạng', 'Gai xương lớn', 'Hoại tử chỏm']),
        num('lld', 'Chênh lệch chiều dài chi trên phim', 'mm', { min: 0, max: 80 })
      ]),
      sec('fx', 'Gãy xương vùng háng (nếu có)', [
        pick('has_fx', 'Có gãy xương vùng háng', YN),
        pick('site', 'Vị trí gãy', ['Không có', 'Cổ xương đùi', 'Liên mấu chuyển', 'Dưới mấu chuyển', 'Ổ cối']),
        pick('garden', 'Phân loại Garden (gãy cổ xương đùi)', ['Không áp dụng', 'Garden I', 'Garden II', 'Garden III', 'Garden IV']),
        txt('ao', 'Phân loại AO/OTA', 'VD: 31-A2.2')
      ]),
      sec('arthro', 'Khớp nhân tạo (nếu đã thay khớp)', [
        pick('type', 'Loại phẫu thuật', ['Chưa thay khớp', 'Thay khớp háng toàn phần', 'Thay chỏm xương đùi', 'Thay lại khớp (revision)', 'Kết hợp xương']),
        txt('date', 'Ngày phẫu thuật', 'VD: 20/06/2026'),
        pick('fixation', 'Kiểu cố định', ['Không áp dụng', 'Có xi măng', 'Không xi măng', 'Kết hợp']),
        num('cup', 'Góc nghiêng ổ cối trên phim', 'độ', { min: 0, max: 80, help: 'Vùng an toàn thường 40 ± 10°.' }),
        pick('loosening', 'Dấu hiệu lỏng khớp / tiêu xương quanh chuôi', ['Không', 'Nghi ngờ', 'Rõ', 'Chưa đánh giá']),
        pick('weight', 'Chỉ định chịu lực của phẫu thuật viên', ['Chịu lực hoàn toàn', 'Chịu lực một phần', 'Chịu lực theo mức chịu đựng', 'Không chịu lực'])
      ]),
      sec('mri', 'MRI / siêu âm', [
        pick('arco', 'Hoại tử vô khuẩn chỏm — phân độ ARCO/Ficat', ['Không có', 'Giai đoạn I', 'Giai đoạn II', 'Giai đoạn III', 'Giai đoạn IV', 'Chưa làm']),
        pick('effusion', 'Siêu âm khớp háng — tràn dịch', ['Không', 'Ít', 'Nhiều', 'Chưa làm']),
        pick('bursa', 'Viêm túi hoạt dịch mấu chuyển lớn', YN),
        pick('dvt', 'Doppler tĩnh mạch chi dưới sau mổ', ['Không huyết khối', 'Huyết khối tĩnh mạch sâu', 'Chưa làm'])
      ]),
      sec('bio', 'Xét nghiệm', [
        num('crp', 'CRP', 'mg/L', { min: 0, max: 400, step: 0.1, help: 'CRP tăng kéo dài sau mổ gợi ý nhiễm trùng khớp nhân tạo.' }),
        num('esr', 'Tốc độ máu lắng giờ 1', 'mm', { min: 0, max: 150 }),
        num('wbc', 'Bạch cầu', 'G/L', { min: 0, max: 60, step: 0.1 }),
        num('hb', 'Hemoglobin', 'g/L', { min: 30, max: 220, help: 'Thiếu máu sau mổ làm giảm khả năng tập luyện.' }),
        num('alb', 'Albumin máu', 'g/L', { min: 10, max: 60, step: 0.1 }),
        num('dexa', 'DEXA — T-score thấp nhất', 'T-score', { min: -6, max: 3, step: 0.1 }),
        num('vitd', 'Vitamin D (25-OH)', 'nmol/L', { min: 0, max: 250 })
      ]),
      conclusion('VD: thoái hóa KL độ 4, đã thay khớp háng toàn phần không xi măng ngày 20/06, cho chịu lực hoàn toàn')
    ]
  });

  /* =======================================================================
   *  4. KHỚP GỐI
   * ===================================================================== */
  S({
    id: 'lab_knee', short: 'CLS-GỐI', name: 'Cận lâm sàng — Khớp gối',
    domain: 'body', noTotal: true, collapsed: true, minutes: 'ghi theo hồ sơ',
    ref: 'Kellgren–Lawrence 1957; ICRS 2000',
    note: 'X-quang, MRI, siêu âm, dịch khớp và xét nghiệm viêm đặc trưng cho bệnh lý khớp gối. Không tính điểm.',
    groups: ['knee'], coreFor: ['knee'],
    sections: [
      sec('xr', 'X-quang khớp gối (tư thế đứng chịu lực)', [
        pick('kl', 'Phân độ thoái hóa Kellgren–Lawrence', ['0 – Bình thường', '1 – Nghi ngờ', '2 – Gai xương rõ', '3 – Hẹp khe rõ, xơ xương dưới sụn', '4 – Hẹp khe nặng, biến dạng trục', 'Không đánh giá']),
        num('jsw_med', 'Bề rộng khe khớp trong', 'mm', { min: 0, max: 10, step: 0.1 }),
        num('jsw_lat', 'Bề rộng khe khớp ngoài', 'mm', { min: 0, max: 10, step: 0.1 }),
        num('hka', 'Góc trục cơ học chi dưới (HKA)', 'độ', { min: 160, max: 200, step: 0.1, help: '180° là trục thẳng; <180° vẹo trong (varus), >180° vẹo ngoài (valgus).' }),
        pick('align', 'Trục chi', ['Bình thường', 'Vẹo trong (varus)', 'Vẹo ngoài (valgus)']),
        pick('patella', 'Khớp chè – đùi', ['Bình thường', 'Thoái hóa', 'Lệch ngoài xương bánh chè', 'Chưa đánh giá'])
      ]),
      sec('mri', 'MRI khớp gối', [
        pick('acl', 'Dây chằng chéo trước', ['Bình thường', 'Rách bán phần', 'Rách hoàn toàn', 'Đã tái tạo', 'Chưa làm']),
        pick('pcl', 'Dây chằng chéo sau', ['Bình thường', 'Tổn thương', 'Chưa làm']),
        pick('mcl', 'Dây chằng bên', ['Bình thường', 'Tổn thương bên trong', 'Tổn thương bên ngoài', 'Chưa làm']),
        pick('meniscus', 'Sụn chêm', ['Bình thường', 'Rách sụn chêm trong', 'Rách sụn chêm ngoài', 'Rách cả hai', 'Đã cắt một phần', 'Chưa làm']),
        pick('cartilage', 'Tổn thương sụn khớp (ICRS)', ['Độ 0 – Bình thường', 'Độ 1 – Mềm sụn', 'Độ 2 – Khuyết < 50% bề dày', 'Độ 3 – Khuyết > 50% bề dày', 'Độ 4 – Lộ xương dưới sụn', 'Chưa làm']),
        pick('edema', 'Phù tủy xương', YN),
        pick('effusion_mri', 'Tràn dịch khớp trên MRI', ['Không', 'Ít', 'Vừa', 'Nhiều'])
      ]),
      sec('us', 'Siêu âm khớp gối', [
        pick('effusion', 'Tràn dịch khớp', ['Không', 'Ít', 'Vừa', 'Nhiều', 'Chưa làm']),
        pick('baker', 'Kén khoeo (kén Baker)', YN),
        pick('tendon', 'Viêm gân bánh chè / gân tứ đầu', YN),
        pick('dvt', 'Doppler tĩnh mạch chi dưới', ['Không huyết khối', 'Huyết khối tĩnh mạch sâu', 'Chưa làm'])
      ]),
      sec('surg', 'Phẫu thuật (nếu có)', [
        pick('type', 'Loại phẫu thuật', ['Chưa phẫu thuật', 'Thay khớp gối toàn phần', 'Thay khớp gối bán phần', 'Tái tạo dây chằng chéo trước', 'Nội soi cắt sụn chêm', 'Đục xương chỉnh trục', 'Khác']),
        txt('date', 'Ngày phẫu thuật', 'VD: 12/05/2026'),
        pick('weight', 'Chỉ định chịu lực', ['Chịu lực hoàn toàn', 'Chịu lực một phần', 'Theo mức chịu đựng', 'Không chịu lực']),
        pick('brace', 'Nẹp / khung chỉnh hình', ['Không dùng', 'Nẹp gối khóa duỗi', 'Nẹp gối có khớp giới hạn tầm', 'Băng chun'])
      ]),
      sec('bio', 'Xét nghiệm & dịch khớp', [
        num('crp', 'CRP', 'mg/L', { min: 0, max: 400, step: 0.1 }),
        num('esr', 'Tốc độ máu lắng giờ 1', 'mm', { min: 0, max: 150 }),
        num('ua', 'Acid uric máu', 'µmol/L', { min: 50, max: 1200 }),
        pick('rf', 'RF / anti-CCP', ['Âm tính', 'RF dương tính', 'Anti-CCP dương tính', 'Cả hai dương tính', 'Chưa làm']),
        pick('fluid', 'Dịch khớp', ['Chưa chọc hút', 'Dịch thoái hóa (ít tế bào)', 'Dịch viêm', 'Có tinh thể urat', 'Có tinh thể calci pyrophosphat', 'Nhiễm khuẩn (cấy dương tính)']),
        num('fluid_wbc', 'Số lượng bạch cầu trong dịch khớp', 'tế bào/mm³', { min: 0, max: 200000 })
      ]),
      conclusion('VD: thoái hóa KL độ 3 khoang trong, trục varus HKA 174°, đã thay khớp gối toàn phần, chịu lực hoàn toàn')
    ]
  });

  /* =======================================================================
   *  5. KHỚP VAI
   * ===================================================================== */
  S({
    id: 'lab_shoulder', short: 'CLS-VAI', name: 'Cận lâm sàng — Khớp vai',
    domain: 'body', noTotal: true, collapsed: true, minutes: 'ghi theo hồ sơ',
    ref: 'Goutallier 1994; Patte 1990',
    note: 'X-quang, siêu âm và MRI khớp vai; xét nghiệm liên quan cứng khớp vai. Không tính điểm.',
    groups: ['shoulder'], coreFor: ['shoulder'],
    sections: [
      sec('xr', 'X-quang khớp vai', [
        num('aha', 'Khoảng cách mỏm cùng vai – chỏm xương cánh tay', 'mm', { min: 0, max: 20, step: 0.1, help: '<7 mm gợi ý rách chóp xoay rộng, chỏm di lệch lên trên.' }),
        pick('acj', 'Khớp cùng – đòn', ['Bình thường', 'Thoái hóa', 'Trật / bán trật', 'Chưa đánh giá']),
        pick('calcif', 'Calci hóa gân chóp xoay', YN),
        pick('acromion', 'Hình thái mỏm cùng vai (Bigliani)', ['Type I – Phẳng', 'Type II – Cong', 'Type III – Móc', 'Chưa đánh giá']),
        pick('gh_oa', 'Thoái hóa khớp ổ chảo – cánh tay', ['Không', 'Nhẹ', 'Vừa', 'Nặng']),
        pick('sublux', 'Bán trật khớp vai (thường gặp sau đột quỵ)', ['Không', 'Có — đo khoảng cách ở phần lượng giá lâm sàng'])
      ]),
      sec('us', 'Siêu âm khớp vai', [
        pick('cuff', 'Gân chóp xoay', ['Bình thường', 'Viêm gân', 'Rách bán phần', 'Rách toàn phần', 'Chưa làm']),
        txt('cuff_site', 'Gân tổn thương', 'VD: gân trên gai, rách toàn phần rộng 2 cm'),
        num('tear_size', 'Kích thước chỗ rách', 'mm', { min: 0, max: 80 }),
        pick('bursa', 'Viêm bao hoạt dịch dưới mỏm cùng – delta', YN),
        pick('biceps', 'Gân nhị đầu (đầu dài)', ['Bình thường', 'Viêm gân', 'Bán trật / trật', 'Đứt', 'Chưa làm'])
      ]),
      sec('mri', 'MRI khớp vai', [
        pick('patte', 'Mức co rút gân theo Patte', ['Không áp dụng', 'Giai đoạn 1 – gần điểm bám', 'Giai đoạn 2 – ngang chỏm', 'Giai đoạn 3 – tới ổ chảo', 'Chưa làm']),
        pick('goutallier', 'Thoái hóa mỡ cơ chóp xoay (Goutallier)', ['Độ 0', 'Độ 1', 'Độ 2', 'Độ 3', 'Độ 4', 'Chưa làm']),
        pick('labrum', 'Sụn viền ổ chảo', ['Bình thường', 'Tổn thương SLAP', 'Tổn thương Bankart', 'Chưa làm']),
        pick('capsule', 'Bao khớp (viêm dính / cứng khớp vai)', ['Bình thường', 'Dày bao khớp, viêm dính', 'Chưa làm'])
      ]),
      sec('surg', 'Phẫu thuật & xét nghiệm', [
        pick('op', 'Phẫu thuật vai', ['Chưa phẫu thuật', 'Nội soi khâu chóp xoay', 'Giải ép dưới mỏm cùng', 'Thay khớp vai toàn phần', 'Thay khớp vai đảo ngược', 'Khác']),
        txt('op_date', 'Ngày phẫu thuật', 'VD: 02/07/2026'),
        pick('sling', 'Chế độ bất động sau mổ', ['Không', 'Đai treo tay', 'Nẹp dạng vai (abduction brace)']),
        num('crp', 'CRP', 'mg/L', { min: 0, max: 400, step: 0.1 }),
        num('glu', 'Glucose máu đói', 'mmol/L', { min: 1, max: 40, step: 0.1 }),
        num('hba1c', 'HbA1c', '%', { min: 3, max: 20, step: 0.1, help: 'Đái tháo đường làm tăng nguy cơ và kéo dài diễn tiến cứng khớp vai.' }),
        pick('thyroid', 'Chức năng tuyến giáp', ['Bình thường', 'Suy giáp', 'Cường giáp', 'Chưa làm'])
      ]),
      conclusion('VD: rách toàn phần gân trên gai 2 cm, Goutallier độ 2, khoảng cùng vai – chỏm 6 mm')
    ]
  });

  /* =======================================================================
   *  6. TIM MẠCH
   * ===================================================================== */
  S({
    id: 'lab_cardiac', short: 'CLS-TIM', name: 'Cận lâm sàng — Phục hồi chức năng tim mạch',
    domain: 'body', noTotal: true, collapsed: true, minutes: 'ghi theo hồ sơ',
    ref: 'ESC/AHA guidelines; AACVPR risk stratification',
    note: 'Men tim, siêu âm tim, điện tâm đồ, can thiệp mạch vành và các chỉ số quyết định mức độ an toàn khi tập luyện. Không tính điểm.',
    groups: ['cardiac'], coreFor: ['cardiac'],
    sections: [
      sec('dx', 'Chẩn đoán và can thiệp', [
        pick('dx', 'Bệnh lý tim mạch chính', ['Nhồi máu cơ tim cấp', 'Hội chứng vành cấp không ST chênh', 'Bệnh mạch vành mạn', 'Suy tim phân suất tống máu giảm', 'Suy tim phân suất tống máu bảo tồn', 'Sau phẫu thuật van tim', 'Sau phẫu thuật bắc cầu', 'Bệnh cơ tim', 'Khác']),
        pick('intervention', 'Can thiệp đã thực hiện', ['Điều trị nội khoa', 'Can thiệp mạch vành qua da (PCI)', 'Bắc cầu chủ – vành (CABG)', 'Phẫu thuật van', 'Cấy máy tạo nhịp / ICD', 'Khác']),
        txt('int_date', 'Ngày can thiệp / phẫu thuật', 'VD: 05/07/2026'),
        num('vessels', 'Số nhánh mạch vành tổn thương có ý nghĩa', 'nhánh', { min: 0, max: 3 }),
        txt('lesion', 'Vị trí tổn thương / stent', 'VD: LAD đoạn gần, đặt 1 stent phủ thuốc'),
        pick('residual', 'Còn tổn thương chưa can thiệp', YN)
      ]),
      sec('echo', 'Siêu âm tim', [
        num('lvef', 'Phân suất tống máu thất trái (LVEF)', '%', { min: 5, max: 80, help: '<40% là suy tim phân suất tống máu giảm — cần tập luyện thận trọng, tăng dần.' }),
        num('lvedd', 'Đường kính thất trái cuối tâm trương', 'mm', { min: 20, max: 90 }),
        num('ee', 'Tỷ số E/e′', '', { min: 2, max: 30, step: 0.1 }),
        num('paps', 'Áp lực động mạch phổi tâm thu ước tính', 'mmHg', { min: 10, max: 120 }),
        pick('wall', 'Rối loạn vận động vùng', ['Không', 'Giảm vận động khu trú', 'Vô động', 'Loạn động / phình vách']),
        pick('valve', 'Bệnh van tim đáng kể', ['Không', 'Hở van hai lá', 'Hẹp van động mạch chủ', 'Hở van động mạch chủ', 'Van nhân tạo', 'Khác']),
        pick('thrombus', 'Huyết khối buồng tim', YN)
      ]),
      sec('ecg', 'Điện tâm đồ & theo dõi nhịp', [
        pick('rhythm', 'Nhịp cơ bản', ['Nhịp xoang', 'Rung nhĩ', 'Cuồng nhĩ', 'Nhịp máy tạo nhịp', 'Khác']),
        num('qrs', 'Thời gian QRS', 'ms', { min: 40, max: 250 }),
        pick('ischemia', 'Dấu hiệu thiếu máu cơ tim trên điện tâm đồ', ['Không', 'ST chênh xuống', 'Sóng T âm', 'Sóng Q hoại tử']),
        pick('arrhythmia', 'Rối loạn nhịp trên Holter', ['Không có', 'Ngoại tâm thu thất thưa', 'Ngoại tâm thu thất dày / chùm', 'Nhịp nhanh thất không bền bỉ', 'Rung nhĩ cơn', 'Chưa làm']),
        pick('device', 'Thiết bị cấy ghép', ['Không', 'Máy tạo nhịp', 'Máy phá rung ICD', 'Máy tái đồng bộ CRT'])
      ]),
      sec('bio', 'Xét nghiệm', [
        num('trop', 'Troponin đỉnh (đợt cấp)', 'ng/L', { min: 0, max: 100000 }),
        num('bnp', 'NT-proBNP', 'pg/mL', { min: 0, max: 40000, help: 'Giá trị cao và không giảm gợi ý suy tim chưa ổn định — cần thận trọng khi tăng cường độ tập.' }),
        num('hb', 'Hemoglobin', 'g/L', { min: 30, max: 220 }),
        num('cre', 'Creatinin máu', 'µmol/L', { min: 20, max: 1500 }),
        num('egfr', 'eGFR', 'mL/phút/1,73m²', { min: 1, max: 160 }),
        num('k', 'Kali máu', 'mmol/L', { min: 1.5, max: 8, step: 0.1 }),
        num('ldl', 'LDL-cholesterol', 'mmol/L', { min: 0.2, max: 12, step: 0.01, help: 'Mục tiêu sau hội chứng vành cấp: LDL-C < 1,4 mmol/L.' }),
        num('hba1c', 'HbA1c', '%', { min: 3, max: 20, step: 0.1 }),
        num('crp', 'hs-CRP', 'mg/L', { min: 0, max: 400, step: 0.1 })
      ]),
      sec('other', 'Hình ảnh khác & phân tầng', [
        pick('cxr', 'X-quang ngực', ['Bình thường', 'Bóng tim to', 'Sung huyết phổi', 'Tràn dịch màng phổi', 'Chưa làm']),
        num('ctr', 'Chỉ số tim – lồng ngực', '%', { min: 20, max: 90 }),
        pick('risk', 'Phân tầng nguy cơ khi tập luyện (AACVPR)', ['Nguy cơ thấp', 'Nguy cơ trung bình', 'Nguy cơ cao', 'Chưa phân tầng']),
        area('contra', 'Chống chỉ định / thận trọng khi tập', 'VD: ngưng tập nếu đau ngực, giới hạn nhịp tim 110 lần/phút')
      ]),
      conclusion('VD: NMCT thành trước đã đặt stent LAD, LVEF 42%, NT-proBNP 1200, phân tầng nguy cơ trung bình')
    ]
  });

  /* =======================================================================
   *  7. HÔ HẤP
   * ===================================================================== */
  S({
    id: 'lab_pulmo', short: 'CLS-HH', name: 'Cận lâm sàng — Phục hồi chức năng hô hấp',
    domain: 'body', noTotal: true, collapsed: true, minutes: 'ghi theo hồ sơ',
    ref: 'GOLD Report; ATS/ERS standards',
    note: 'Khí máu, hình ảnh lồng ngực, siêu âm cơ hoành và vi sinh. Hô hấp ký chi tiết nằm ở bộ "Thông số hô hấp khách quan". Không tính điểm.',
    groups: ['pulmo'], coreFor: ['pulmo'],
    sections: [
      sec('abg', 'Khí máu động mạch', [
        num('ph', 'pH', '', { min: 6.8, max: 7.8, step: 0.01 }),
        num('pao2', 'PaO₂', 'mmHg', { min: 20, max: 200 }),
        num('paco2', 'PaCO₂', 'mmHg', { min: 15, max: 120, help: '>45 mmHg: suy hô hấp tăng CO₂ — cân nhắc thở máy không xâm nhập khi tập.' }),
        num('hco3', 'HCO₃⁻', 'mmol/L', { min: 5, max: 50, step: 0.1 }),
        num('sao2', 'SaO₂', '%', { min: 40, max: 100 }),
        pick('o2', 'Hỗ trợ oxy hiện tại', ['Khí trời', 'Oxy gọng kính', 'Mặt nạ', 'Oxy dòng cao', 'Thở máy không xâm nhập', 'Thở máy xâm nhập']),
        num('o2flow', 'Lưu lượng oxy đang dùng', 'L/phút', { min: 0, max: 60, step: 0.5 })
      ]),
      sec('img', 'Hình ảnh lồng ngực', [
        pick('cxr', 'X-quang ngực', ['Bình thường', 'Ứ khí, cơ hoành dẹt', 'Thâm nhiễm / viêm phổi', 'Xẹp phổi', 'Tràn dịch màng phổi', 'Xơ phổi', 'Chưa làm']),
        pick('ct', 'CT ngực', ['Chưa làm', 'Khí phế thũng', 'Giãn phế quản', 'Bệnh phổi kẽ / xơ hóa', 'Di chứng sau COVID-19', 'U phổi', 'Bình thường']),
        txt('ct_detail', 'Mô tả tổn thương trên CT', 'VD: khí phế thũng trung tâm tiểu thùy, ưu thế thùy trên'),
        pick('diaphragm_xr', 'Vận động cơ hoành trên X-quang động / soi', ['Bình thường', 'Giảm vận động', 'Liệt cơ hoành', 'Chưa làm'])
      ]),
      sec('us', 'Siêu âm cơ hoành & màng phổi', [
        num('dt_insp', 'Bề dày cơ hoành cuối thì hít vào', 'mm', { min: 0, max: 15, step: 0.1 }),
        num('dt_exp', 'Bề dày cơ hoành cuối thì thở ra', 'mm', { min: 0, max: 15, step: 0.1 }),
        num('dtf', 'Phân suất dày lên cơ hoành (DTF)', '%', { min: 0, max: 200, help: 'DTF <20% gợi ý yếu cơ hoành, khó cai máy thở.' }),
        num('excursion', 'Biên độ di động cơ hoành', 'mm', { min: 0, max: 100, help: '<10 mm gợi ý rối loạn chức năng cơ hoành nặng.' }),
        pick('pleural', 'Siêu âm màng phổi', ['Bình thường', 'Tràn dịch ít', 'Tràn dịch nhiều', 'Dày dính màng phổi', 'Chưa làm'])
      ]),
      sec('bio', 'Xét nghiệm & vi sinh', [
        num('hb', 'Hemoglobin', 'g/L', { min: 30, max: 220 }),
        num('wbc', 'Bạch cầu', 'G/L', { min: 0, max: 60, step: 0.1 }),
        num('crp', 'CRP', 'mg/L', { min: 0, max: 400, step: 0.1 }),
        num('pct', 'Procalcitonin', 'ng/mL', { min: 0, max: 100, step: 0.01 }),
        num('alb', 'Albumin máu', 'g/L', { min: 10, max: 60, step: 0.1 }),
        num('bmi', 'Chỉ số khối cơ thể', 'kg/m²', { min: 10, max: 60, step: 0.1, help: 'BMI <21 kg/m² là yếu tố tiên lượng xấu trong COPD (thành phần chỉ số BODE).' }),
        pick('sputum', 'Cấy đờm', ['Âm tính', 'Dương tính — có điều trị', 'Chưa làm']),
        txt('organism', 'Vi khuẩn phân lập', 'VD: Pseudomonas aeruginosa')
      ]),
      conclusion('VD: COPD GOLD 3, PaCO₂ 52 mmHg, khí phế thũng lan tỏa, DTF 16% — ưu tiên tập cơ hít vào')
    ]
  });

  /* =======================================================================
   *  8. NHÓM CHUNG / BỆNH LÝ KHÁC
   * ===================================================================== */
  S({
    id: 'lab_general', short: 'CLS-CHUNG', name: 'Cận lâm sàng — Bộ nền dùng chung',
    domain: 'body', noTotal: true, collapsed: true, minutes: 'ghi theo hồ sơ',
    ref: 'Bộ xét nghiệm nền thường quy trong phục hồi chức năng nội trú',
    note: 'Công thức máu, sinh hóa cơ bản và chỉ số dinh dưỡng — áp dụng cho mọi người bệnh khi không thuộc nhóm chuyên biệt hoặc cần bổ sung. Không tính điểm.',
    groups: g.PHCN.allGroupIds(), coreFor: ['general'], home: 'general',
    sections: [
      sec('cbc', 'Công thức máu', [
        num('hb', 'Hemoglobin', 'g/L', { min: 30, max: 220 }),
        num('wbc', 'Bạch cầu', 'G/L', { min: 0, max: 60, step: 0.1 }),
        num('plt', 'Tiểu cầu', 'G/L', { min: 0, max: 1000 })
      ]),
      sec('bio', 'Sinh hóa cơ bản', [
        num('glu', 'Glucose máu đói', 'mmol/L', { min: 1, max: 40, step: 0.1 }),
        num('cre', 'Creatinin máu', 'µmol/L', { min: 20, max: 1500 }),
        num('egfr', 'eGFR', 'mL/phút/1,73m²', { min: 1, max: 160 }),
        num('ast', 'AST', 'U/L', { min: 0, max: 2000 }),
        num('alt', 'ALT', 'U/L', { min: 0, max: 2000 }),
        num('na', 'Natri máu', 'mmol/L', { min: 100, max: 180 }),
        num('k', 'Kali máu', 'mmol/L', { min: 1.5, max: 8, step: 0.1 }),
        num('crp', 'CRP', 'mg/L', { min: 0, max: 400, step: 0.1 })
      ]),
      sec('nutri', 'Dinh dưỡng & nội tiết', [
        num('alb', 'Albumin máu', 'g/L', { min: 10, max: 60, step: 0.1, help: '<35 g/L gợi ý suy dinh dưỡng, làm chậm phục hồi và lành vết thương.' }),
        num('prealb', 'Prealbumin', 'mg/L', { min: 0, max: 600 }),
        num('bmi', 'Chỉ số khối cơ thể', 'kg/m²', { min: 10, max: 60, step: 0.1 }),
        num('vitd', 'Vitamin D (25-OH)', 'nmol/L', { min: 0, max: 250 }),
        num('tsh', 'TSH', 'mIU/L', { min: 0, max: 100, step: 0.01 }),
        num('hba1c', 'HbA1c', '%', { min: 3, max: 20, step: 0.1 })
      ]),
      sec('img', 'Hình ảnh nền', [
        pick('cxr', 'X-quang ngực', ['Bình thường', 'Bất thường — mô tả ở phần kết luận', 'Chưa làm']),
        pick('abdo', 'Siêu âm ổ bụng', ['Bình thường', 'Bất thường — mô tả ở phần kết luận', 'Chưa làm']),
        pick('dexa', 'Đo mật độ xương DEXA', ['Chưa làm', 'Bình thường', 'Thiếu xương (osteopenia)', 'Loãng xương (osteoporosis)']),
        num('tscore', 'T-score thấp nhất', 'T-score', { min: -6, max: 3, step: 0.1 })
      ]),
      conclusion()
    ]
  });

})(window);
