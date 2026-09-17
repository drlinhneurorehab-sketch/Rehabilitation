/* =========================================================================
 * PHCN-METRICS · scales-cardio.js
 * Phục hồi chức năng TIM MẠCH và HÔ HẤP
 * ========================================================================= */
(function (g) {
  'use strict';
  var h = g.PHCN.h, S = h.S, O = h.O, rng = h.rng, rngFrom = h.rngFrom, yn = h.yn,
      it = h.it, num = h.num, nums = h.nums, sec = h.sec, band = h.band;

  /* =======================================================================
   *  J. TIM MẠCH
   * ===================================================================== */

  /* --- J1. Phân độ NYHA & CCS --- */
  S({
    id: 'nyha', short: 'NYHA', name: 'Phân độ chức năng NYHA & phân độ đau thắt ngực CCS',
    domain: 'global', max: 4, reverse: true, minutes: '3 phút',
    ref: 'New York Heart Association 1994; Campeau L. Circulation. 1976',
    note: 'Phân độ triệu chứng cơ năng. Điểm tổng lấy theo NYHA (I–IV), CCS ghi nhận riêng.',
    groups: ['cardiac'],
    coreFor: ['cardiac'],
    sections: [
      sec('nyha', 'Phân độ suy tim NYHA', [
        it('nyha', 'Độ NYHA', O(
          [1, 'I – Không hạn chế hoạt động thể lực; hoạt động thông thường không gây mệt, khó thở hay hồi hộp'],
          [2, 'II – Hạn chế nhẹ; dễ chịu khi nghỉ nhưng hoạt động thể lực thông thường gây triệu chứng'],
          [3, 'III – Hạn chế rõ rệt; dễ chịu khi nghỉ nhưng hoạt động nhẹ hơn thông thường đã gây triệu chứng'],
          [4, 'IV – Không thể thực hiện bất kỳ hoạt động thể lực nào mà không khó chịu; triệu chứng ngay cả khi nghỉ']
        ))
      ]),
      sec('ccs', 'Phân độ đau thắt ngực CCS (nếu có bệnh mạch vành)', [
        it('ccs', 'Độ CCS', O(
          [0, '0 – Không đau thắt ngực'],
          [0, 'I – Đau khi gắng sức mạnh, nhanh hoặc kéo dài'],
          [0, 'II – Hạn chế nhẹ hoạt động thông thường (đi nhanh, lên dốc, leo >1 tầng)'],
          [0, 'III – Hạn chế rõ (đi 100–200 m trên mặt phẳng, leo 1 tầng gác)'],
          [0, 'IV – Đau khi làm bất kỳ việc gì hoặc đau khi nghỉ']
        ), { text: true, sum: false })
      ]),
      sec('clinical', 'Thông số lâm sàng & cận lâm sàng nền', [
        num('lvef', 'Phân suất tống máu thất trái (LVEF)', '%', { min: 5, max: 80 }),
        num('bnp', 'NT-proBNP (nếu có)', 'pg/mL', { min: 0, max: 40000 }),
        num('sbp', 'Huyết áp tâm thu khi nghỉ', 'mmHg', { min: 50, max: 250 }),
        num('dbp', 'Huyết áp tâm trương khi nghỉ', 'mmHg', { min: 30, max: 160 }),
        num('hr_rest', 'Tần số tim khi nghỉ', 'lần/phút', { min: 30, max: 200 }),
        it('risk', 'Phân tầng nguy cơ khi tập luyện (AACVPR)', O([0, 'Nguy cơ thấp'], [0, 'Nguy cơ trung bình'], [0, 'Nguy cơ cao']), { text: true, sum: false })
      ])
    ],
    interpret: band([
      [1, 'NYHA I – Không hạn chế chức năng', 'good', 'Có thể tập luyện cường độ trung bình – cao dưới giám sát.'],
      [2, 'NYHA II – Hạn chế nhẹ', 'mild', 'Tập luyện cường độ trung bình, theo dõi triệu chứng.'],
      [3, 'NYHA III – Hạn chế rõ rệt', 'mod', 'Tập luyện cường độ thấp, ngắt quãng, giám sát chặt.'],
      [4, 'NYHA IV – Triệu chứng khi nghỉ', 'severe', 'Chỉ tập vận động tại giường/ghế, chống chỉ định gắng sức.']
    ])
  });

  /* --- J2. Đánh giá gắng sức --- */
  S({
    id: 'cpx', short: 'CPX', name: 'Đánh giá khả năng gắng sức (nghiệm pháp gắng sức, METs, VO₂ đỉnh)',
    domain: 'body', noTotal: true, minutes: '30–60 phút',
    ref: 'ACSM Guidelines for Exercise Testing and Prescription, 11th ed.',
    note: 'Số liệu khách quan xác định cường độ tập luyện. Không cộng tổng.',
    groups: ['cardiac', 'pulmo'],
    coreFor: ['cardiac'],
    sections: [
      sec('test', 'Nghiệm pháp gắng sức', [
        it('protocol', 'Phác đồ', O([0, 'Bruce'], [0, 'Bruce sửa đổi'], [0, 'Naughton'], [0, 'Xe đạp lực kế'], [0, 'Test đi bộ 6 phút thay thế'], [0, 'Không thực hiện được']), { text: true, sum: false }),
        num('duration', 'Thời gian gắng sức', 'phút', { min: 0, max: 30, step: 0.1 }),
        num('mets', 'Khả năng gắng sức ước tính', 'METs', { min: 0, max: 20, step: 0.1, help: '<5 METs: tiên lượng kém; >7 METs: tiên lượng tốt.' }),
        num('vo2', 'VO₂ đỉnh (nếu đo trực tiếp)', 'mL/kg/phút', { min: 0, max: 70, step: 0.1 }),
        num('hr_peak', 'Tần số tim đỉnh', 'lần/phút', { min: 40, max: 220 }),
        num('hr_reserve', 'Tần số tim dự trữ đạt được', '%', { min: 0, max: 100 }),
        num('sbp_peak', 'Huyết áp tâm thu đỉnh', 'mmHg', { min: 60, max: 280 }),
        num('rer', 'Tỷ số trao đổi hô hấp (RER)', '', { min: 0.5, max: 1.5, step: 0.01 }),
        it('reason', 'Lý do dừng test', O([0, 'Đạt mục tiêu / kiệt sức'], [0, 'Khó thở'], [0, 'Đau ngực'], [0, 'Thay đổi ST-T'], [0, 'Rối loạn nhịp'], [0, 'Đáp ứng huyết áp bất thường'], [0, 'Mệt chân']), { text: true, sum: false })
      ]),
      sec('rx', 'Kê đơn tập luyện', [
        num('thr_low', 'Ngưỡng tần số tim tập luyện – dưới', 'lần/phút', { min: 40, max: 200 }),
        num('thr_high', 'Ngưỡng tần số tim tập luyện – trên', 'lần/phút', { min: 40, max: 200 }),
        num('borg_target', 'Mức Borg mục tiêu (6–20)', 'điểm', { min: 6, max: 20 }),
        num('sessions', 'Số buổi tập/tuần theo kế hoạch', 'buổi', { min: 0, max: 14 }),
        num('completed', 'Số buổi đã hoàn thành đến thời điểm đánh giá', 'buổi', { min: 0, max: 200 })
      ])
    ]
  });

  /* --- J3. Borg --- */
  S({
    id: 'borg', short: 'Borg', name: 'Thang gắng sức Borg (RPE 6–20) & khó thở Borg CR10',
    domain: 'body', max: 20, reverse: true, minutes: '2 phút',
    ref: 'Borg GA. Med Sci Sports Exerc. 1982;14:377-81',
    note: 'Điểm tổng lấy theo RPE 6–20 (nhân 10 ≈ tần số tim tương ứng). Vùng tập luyện khuyến nghị: 11–14.',
    groups: ['cardiac', 'pulmo'],
    coreFor: ['cardiac', 'pulmo'],
    sections: [
      sec('rpe', 'Cảm nhận gắng sức khi tập (RPE)', [
        it('rpe', 'Mức gắng sức cảm nhận', rngFrom(6, 20, { 6: 'Không gắng sức chút nào', 7: 'Cực kỳ nhẹ', 9: 'Rất nhẹ', 11: 'Nhẹ', 13: 'Hơi nặng', 15: 'Nặng', 17: 'Rất nặng', 19: 'Cực kỳ nặng', 20: 'Gắng sức tối đa' }))
      ]),
      sec('cr10', 'Khó thở & mệt chân (Borg CR10)', [
        it('dyspnea', 'Khó thở', rng(10, { 0: 'Hoàn toàn không', 0.5: 'Rất rất nhẹ', 1: 'Rất nhẹ', 2: 'Nhẹ', 3: 'Vừa', 4: 'Hơi nặng', 5: 'Nặng', 7: 'Rất nặng', 10: 'Tối đa' }), { sum: false }),
        it('leg', 'Mệt chân', rng(10, { 0: 'Hoàn toàn không', 10: 'Tối đa' }), { sum: false })
      ])
    ],
    interpret: band([
      [10, 'Gắng sức rất nhẹ', 'good', 'Có thể tăng cường độ tập.'],
      [14, 'Vùng tập luyện tối ưu (RPE 11–14)', 'good', 'Duy trì cường độ hiện tại.'],
      [16, 'Gắng sức nặng', 'mod', 'Cân nhắc giảm cường độ nếu kèm triệu chứng.'],
      [20, 'Gắng sức rất nặng – tối đa', 'severe', 'Vượt ngưỡng an toàn cho tập luyện thường quy.']
    ])
  });

  /* --- J4. DASI --- */
  S({
    id: 'dasi', short: 'DASI', name: 'Chỉ số tình trạng hoạt động Duke (Duke Activity Status Index)',
    domain: 'activity', max: 58.2, minutes: '5 phút',
    ref: 'Hlatky MA et al. Am J Cardiol. 1989;64:651-4',
    note: '12 câu Có/Không có trọng số. Tổng điểm 0–58,2. Ước tính VO₂ đỉnh = (0,43 × DASI + 9,6) và METs = VO₂/3,5.',
    groups: ['cardiac', 'pulmo'],
    coreFor: ['cardiac'],
    sections: [sec('main', 'Bạn có tự làm được các việc sau không?', [
      it('q1', '1. Tự chăm sóc bản thân (ăn, mặc quần áo, tắm, đi vệ sinh)', yn('Có', 'Không', 2.75)),
      it('q2', '2. Đi lại trong nhà', yn('Có', 'Không', 1.75)),
      it('q3', '3. Đi bộ 1–2 dãy phố trên mặt phẳng', yn('Có', 'Không', 2.75)),
      it('q4', '4. Leo một tầng gác hoặc lên dốc', yn('Có', 'Không', 5.50)),
      it('q5', '5. Chạy một quãng ngắn', yn('Có', 'Không', 8.00)),
      it('q6', '6. Làm việc nhà nhẹ (quét nhà, rửa bát, lau bụi)', yn('Có', 'Không', 2.70)),
      it('q7', '7. Làm việc nhà vừa (hút bụi, quét sân, xách đồ đi chợ)', yn('Có', 'Không', 3.50)),
      it('q8', '8. Làm việc nhà nặng (cọ sàn, kê dịch đồ đạc nặng)', yn('Có', 'Không', 8.00)),
      it('q9', '9. Làm vườn (cào lá, làm cỏ, đẩy máy cắt cỏ)', yn('Có', 'Không', 4.50)),
      it('q10', '10. Sinh hoạt tình dục', yn('Có', 'Không', 5.25)),
      it('q11', '11. Chơi thể thao mức trung bình (cầu lông đôi, khiêu vũ, bowling, ném bóng)', yn('Có', 'Không', 6.00)),
      it('q12', '12. Chơi thể thao gắng sức (bơi, tennis đơn, bóng đá, chạy bộ)', yn('Có', 'Không', 7.50))
    ])],
    compute: function (v) {
      var s = 0;
      Object.keys(v).forEach(function (k) { if (v[k] !== '' && v[k] !== undefined && v[k] !== null) s += Number(v[k]); });
      s = Math.round(s * 100) / 100;
      var vo2 = (0.43 * s + 9.6);
      return { total: s, extra: { 'VO₂ đỉnh ước tính': vo2.toFixed(1) + ' mL/kg/phút', 'METs ước tính': (vo2 / 3.5).toFixed(1) } };
    },
    interpret: band([
      [14.5, 'Khả năng hoạt động rất thấp (<4 METs)', 'severe', 'Nguy cơ chu phẫu và tim mạch cao.'],
      [24.5, 'Khả năng hoạt động thấp (4–5 METs)', 'mod', ''],
      [39, 'Khả năng hoạt động trung bình (5–7 METs)', 'mild', ''],
      [58.2, 'Khả năng hoạt động tốt (>7 METs)', 'good', '']
    ])
  });

  /* --- J5. MLHFQ --- */
  var mlOpts = rng(5, { 0: 'Không', 1: 'Rất ít', 5: 'Rất nhiều' });
  S({
    id: 'mlhfq', mcidVal: 5, short: 'MLHFQ', name: 'Bộ câu hỏi chất lượng sống suy tim Minnesota (Minnesota Living with Heart Failure Questionnaire)',
    domain: 'participation', max: 105, reverse: true, minutes: '10 phút',
    ref: 'Rector TS, Cohn JN. Am Heart J. 1992;124:1017-25',
    note: '21 mục × 0–5. Điểm CÀNG CAO càng ảnh hưởng nhiều. Có tiểu thang thể chất (8 mục) và cảm xúc (5 mục).',
    mcid: 'MCID ≈ giảm 5 điểm',
    groups: ['cardiac'],
    coreFor: ['cardiac'],
    subscales: [
      { id: 'phys', name: 'Thể chất (0–40)', items: ['main.q2', 'main.q3', 'main.q4', 'main.q5', 'main.q6', 'main.q7', 'main.q12', 'main.q13'], max: 40 },
      { id: 'emo', name: 'Cảm xúc (0–25)', items: ['main.q17', 'main.q18', 'main.q19', 'main.q20', 'main.q21'], max: 25 }
    ],
    sections: [sec('main', 'Trong tháng qua, bệnh tim đã cản trở bạn sống như mong muốn ở mức nào? (0 = không, 5 = rất nhiều)', [
      it('q1', '1. Gây phù chân, mắt cá chân', mlOpts),
      it('q2', '2. Buộc phải ngồi hoặc nằm nghỉ ban ngày', mlOpts),
      it('q3', '3. Làm việc đi bộ hoặc leo cầu thang trở nên khó khăn', mlOpts),
      it('q4', '4. Làm việc nhà trở nên khó khăn', mlOpts),
      it('q5', '5. Khó đi xa khỏi nhà', mlOpts),
      it('q6', '6. Khó ngủ ngon vào ban đêm', mlOpts),
      it('q7', '7. Khó tham gia hoạt động cùng bạn bè, người thân', mlOpts),
      it('q8', '8. Khó làm việc kiếm sống', mlOpts),
      it('q9', '9. Khó tham gia giải trí, thể thao, sở thích', mlOpts),
      it('q10', '10. Ảnh hưởng đến sinh hoạt tình dục', mlOpts),
      it('q11', '11. Phải ăn kiêng những món yêu thích', mlOpts),
      it('q12', '12. Gây khó thở', mlOpts),
      it('q13', '13. Làm mệt mỏi, kiệt sức, thiếu năng lượng', mlOpts),
      it('q14', '14. Phải nằm viện điều trị', mlOpts),
      it('q15', '15. Tốn kém chi phí y tế', mlOpts),
      it('q16', '16. Gây tác dụng phụ của thuốc', mlOpts),
      it('q17', '17. Cảm thấy là gánh nặng cho gia đình, bạn bè', mlOpts),
      it('q18', '18. Cảm thấy mất tự chủ trong cuộc sống', mlOpts),
      it('q19', '19. Cảm thấy lo lắng', mlOpts),
      it('q20', '20. Khó tập trung hoặc giảm trí nhớ', mlOpts),
      it('q21', '21. Cảm thấy trầm cảm', mlOpts)
    ])],
    interpret: band([
      [23, 'Chất lượng sống ít bị ảnh hưởng', 'good', ''],
      [45, 'Ảnh hưởng vừa', 'mod', ''],
      [69, 'Ảnh hưởng nhiều', 'severe', ''],
      [105, 'Ảnh hưởng rất nặng nề', 'severe', '']
    ])
  });

  /* =======================================================================
   *  K. HÔ HẤP
   * ===================================================================== */
  S({
    id: 'mmrc', short: 'mMRC', name: 'Thang khó thở mMRC (modified Medical Research Council)',
    domain: 'body', max: 4, reverse: true, minutes: '1 phút',
    ref: 'Fletcher CM. BMJ. 1960; sửa đổi ATS 1982',
    note: 'Phân độ khó thở khi gắng sức. mMRC ≥2 là ngưỡng "triệu chứng nhiều" trong phân nhóm GOLD.',
    groups: ['pulmo', 'cardiac'],
    coreFor: ['pulmo'],
    sections: [sec('main', 'Mức độ khó thở', [
      it('mmrc', 'Chọn mức', O(
        [0, '0 – Chỉ khó thở khi gắng sức mạnh'],
        [1, '1 – Khó thở khi đi nhanh trên mặt phẳng hoặc lên dốc nhẹ'],
        [2, '2 – Đi chậm hơn người cùng tuổi trên mặt phẳng, hoặc phải dừng lại để thở khi đi bằng tốc độ của mình'],
        [3, '3 – Phải dừng lại để thở sau khi đi khoảng 100 m hoặc vài phút'],
        [4, '4 – Quá khó thở để ra khỏi nhà, hoặc khó thở khi thay quần áo']
      ))
    ])],
    interpret: band([
      [0, 'Khó thở tối thiểu', 'good', ''],
      [1, 'Khó thở nhẹ', 'mild', ''],
      [2, 'Khó thở vừa (ngưỡng triệu chứng nhiều theo GOLD)', 'mod', ''],
      [3, 'Khó thở nặng', 'severe', ''],
      [4, 'Khó thở rất nặng, hạn chế sinh hoạt', 'severe', '']
    ])
  });

  S({
    id: 'cat', mcidVal: 2, short: 'CAT', name: 'Bộ câu hỏi đánh giá COPD (COPD Assessment Test)',
    domain: 'participation', max: 40, reverse: true, minutes: '5 phút',
    ref: 'Jones PW et al. Eur Respir J. 2009;34:648-54',
    note: '8 mục × 0–5. Điểm CÀNG CAO càng ảnh hưởng nhiều. Ngưỡng ≥10 là "triệu chứng nhiều".',
    mcid: 'MCID ≈ giảm 2 điểm',
    groups: ['pulmo'],
    coreFor: ['pulmo'],
    sections: [sec('main', 'Đánh dấu mức mô tả đúng nhất tình trạng hiện tại (0 → 5)', [
      it('q1', '1. Ho: 0 = không bao giờ ho → 5 = ho liên tục', rng(5)),
      it('q2', '2. Đờm: 0 = không có đờm trong phổi → 5 = đầy đờm trong phổi', rng(5)),
      it('q3', '3. Nặng ngực: 0 = không nặng ngực → 5 = rất nặng ngực', rng(5)),
      it('q4', '4. Khó thở khi lên dốc/cầu thang: 0 = không khó thở → 5 = rất khó thở', rng(5)),
      it('q5', '5. Hạn chế hoạt động tại nhà: 0 = không hạn chế → 5 = hạn chế rất nhiều', rng(5)),
      it('q6', '6. Tự tin khi ra khỏi nhà: 0 = hoàn toàn tự tin → 5 = không tự tin chút nào', rng(5)),
      it('q7', '7. Giấc ngủ: 0 = ngủ ngon → 5 = không ngủ ngon vì bệnh phổi', rng(5)),
      it('q8', '8. Năng lượng: 0 = tràn đầy năng lượng → 5 = không còn chút năng lượng nào', rng(5))
    ])],
    interpret: band([
      [9, 'Ảnh hưởng THẤP (<10 điểm)', 'good', ''],
      [20, 'Ảnh hưởng TRUNG BÌNH', 'mod', ''],
      [30, 'Ảnh hưởng CAO', 'severe', ''],
      [40, 'Ảnh hưởng RẤT CAO', 'severe', '']
    ])
  });

  S({
    id: 'resp_obj', short: 'HÔ HẤP-KQ', name: 'Thông số hô hấp khách quan (hô hấp ký, cơ hô hấp, BODE)',
    domain: 'body', noTotal: true, minutes: '20 phút',
    ref: 'GOLD Report 2024; Celli BR et al. N Engl J Med. 2004 (BODE)',
    note: 'Biến số khách quan cho nghiên cứu PHCN hô hấp.',
    groups: ['pulmo', 'cardiac'],
    coreFor: ['pulmo'],
    sections: [
      sec('spiro', 'Hô hấp ký', [
        num('fev1', 'FEV₁', 'lít', { min: 0, max: 6, step: 0.01 }),
        num('fev1_pct', 'FEV₁ so với dự đoán', '%', { min: 0, max: 150 }),
        num('fvc', 'FVC', 'lít', { min: 0, max: 8, step: 0.01 }),
        num('ratio', 'FEV₁/FVC', '%', { min: 0, max: 100 }),
        it('gold', 'Phân độ GOLD', O([0, 'GOLD 1 – nhẹ (FEV₁ ≥80%)'], [0, 'GOLD 2 – trung bình (50–79%)'], [0, 'GOLD 3 – nặng (30–49%)'], [0, 'GOLD 4 – rất nặng (<30%)']), { text: true, sum: false })
      ]),
      sec('muscle', 'Cơ hô hấp & khí máu', [
        num('mip', 'Áp lực hít vào tối đa (MIP)', 'cmH₂O', { min: 0, max: 200 }),
        num('mep', 'Áp lực thở ra tối đa (MEP)', 'cmH₂O', { min: 0, max: 250 }),
        num('pef', 'Lưu lượng đỉnh khi ho (PCF)', 'L/phút', { min: 0, max: 700, help: '<270 L/phút: khả năng ho không hiệu quả.' }),
        num('spo2_rest', 'SpO₂ khi nghỉ (khí trời)', '%', { min: 50, max: 100 })
      ]),
      sec('bode', 'Chỉ số BODE (0–10, càng cao tiên lượng càng xấu)', [
        num('bmi', 'BMI', 'kg/m²', { min: 10, max: 50, step: 0.1 }),
        it('bode', 'Điểm BODE tính được', rng(10), { sum: false, help: 'Gồm BMI, mức tắc nghẽn (FEV₁%), khó thở (mMRC) và khả năng gắng sức (6MWT).' })
      ])
    ]
  });

})(window);
