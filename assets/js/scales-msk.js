/* =========================================================================
 * PHCN-METRICS · scales-msk.js
 * Khớp háng · Khớp gối · Khớp vai  (cơ – xương – khớp)
 * ========================================================================= */
(function (g) {
  'use strict';
  var h = g.PHCN.h, S = h.S, O = h.O, rng = h.rng, rngFrom = h.rngFrom, yn = h.yn,
      it = h.it, num = h.num, nums = h.nums, sec = h.sec, band = h.band;

  /* Bộ lựa chọn 0–4 kiểu Oxford (0 = tệ nhất, 4 = tốt nhất) */
  function oxf(labels) {
    return labels.map(function (l, i) { return { v: 4 - i, l: (4 - i) + ' – ' + l }; });
  }
  var oxfPain = oxf(['Không đau', 'Đau rất nhẹ', 'Đau nhẹ', 'Đau vừa', 'Đau nặng']);
  var oxfDiff = oxf(['Không khó khăn', 'Khó khăn rất ít', 'Khó khăn vừa', 'Khó khăn nhiều', 'Không thể thực hiện']);
  var oxfTrouble = oxf(['Hoàn toàn không', 'Rất ít', 'Vừa phải', 'Nhiều', 'Không thể / luôn luôn']);

  /* WOMAC: 0 = không → 4 = cực độ (điểm cao = tệ) */
  var womOpts = O([0, '0 – Không'], [1, '1 – Nhẹ'], [2, '2 – Vừa'], [3, '3 – Nặng'], [4, '4 – Cực độ']);

  /* =======================================================================
   *  F. THANG DÙNG CHUNG CHO HÁNG & GỐI
   * ===================================================================== */
  S({
    id: 'womac', short: 'WOMAC', name: 'Chỉ số thoái hóa khớp WOMAC (Western Ontario & McMaster Universities OA Index)',
    domain: 'activity', max: 96, reverse: true, minutes: '10 phút',
    ref: 'Bellamy N et al. J Rheumatol. 1988;15:1833-40',
    note: '24 mục: đau (5), cứng khớp (2), chức năng (17). Điểm CÀNG CAO càng nặng. Thường quy đổi ra thang 0–100.',
    mcid: 'MCID ≈ giảm 12% điểm chuẩn hóa',
    groups: ['hip', 'knee'],
    coreFor: ['hip', 'knee'],
    subscales: [
      { id: 'pain', name: 'Đau (0–20)', items: ['pain.p1', 'pain.p2', 'pain.p3', 'pain.p4', 'pain.p5'], max: 20 },
      { id: 'stiff', name: 'Cứng khớp (0–8)', items: ['stiff.s1', 'stiff.s2'], max: 8 },
      { id: 'func', name: 'Chức năng (0–68)', items: ['func.f1', 'func.f2', 'func.f3', 'func.f4', 'func.f5', 'func.f6', 'func.f7', 'func.f8', 'func.f9', 'func.f10', 'func.f11', 'func.f12', 'func.f13', 'func.f14', 'func.f15', 'func.f16', 'func.f17'], max: 68 }
    ],
    sections: [
      sec('pain', 'A. Đau – mức độ đau khi… (48 giờ qua)', [
        it('p1', '1. Đi bộ trên mặt phẳng', womOpts),
        it('p2', '2. Lên hoặc xuống cầu thang', womOpts),
        it('p3', '3. Về đêm khi đang nằm trên giường', womOpts),
        it('p4', '4. Ngồi hoặc nằm', womOpts),
        it('p5', '5. Đứng thẳng', womOpts)
      ]),
      sec('stiff', 'B. Cứng khớp', [
        it('s1', '6. Mức độ cứng khớp ngay sau khi thức dậy buổi sáng', womOpts),
        it('s2', '7. Mức độ cứng khớp sau khi ngồi, nằm hoặc nghỉ ngơi trong ngày', womOpts)
      ]),
      sec('func', 'C. Chức năng – mức độ khó khăn khi…', [
        it('f1', '8. Xuống cầu thang', womOpts),
        it('f2', '9. Lên cầu thang', womOpts),
        it('f3', '10. Đứng dậy từ tư thế ngồi', womOpts),
        it('f4', '11. Đứng', womOpts),
        it('f5', '12. Cúi xuống sàn', womOpts),
        it('f6', '13. Đi bộ trên mặt phẳng', womOpts),
        it('f7', '14. Lên / xuống xe ô tô', womOpts),
        it('f8', '15. Đi chợ, mua sắm', womOpts),
        it('f9', '16. Mang tất / đi giày', womOpts),
        it('f10', '17. Ra khỏi giường', womOpts),
        it('f11', '18. Cởi tất / tháo giày', womOpts),
        it('f12', '19. Nằm trên giường (trở mình, giữ tư thế)', womOpts),
        it('f13', '20. Vào / ra bồn tắm', womOpts),
        it('f14', '21. Ngồi', womOpts),
        it('f15', '22. Ngồi xuống / đứng dậy khỏi bồn cầu', womOpts),
        it('f16', '23. Làm việc nhà nặng', womOpts),
        it('f17', '24. Làm việc nhà nhẹ', womOpts)
      ])
    ],
    compute: function (v) {
      var s = 0, n = 0;
      Object.keys(v).forEach(function (k) {
        if (v[k] !== '' && v[k] !== undefined && v[k] !== null) { s += Number(v[k]); n++; }
      });
      return { total: s, extra: { 'Điểm chuẩn hóa 0–100': (Math.round(s / 96 * 1000) / 10) + '%' } };
    },
    interpret: band([
      [19, 'Ảnh hưởng tối thiểu', 'good', ''],
      [38, 'Ảnh hưởng nhẹ', 'mild', ''],
      [57, 'Ảnh hưởng vừa', 'mod', ''],
      [76, 'Ảnh hưởng nặng', 'severe', ''],
      [96, 'Ảnh hưởng rất nặng', 'severe', '']
    ])
  });

  /* =======================================================================
   *  G. KHỚP HÁNG
   * ===================================================================== */
  S({
    id: 'hhs', mcidVal: 18, short: 'HHS', name: 'Điểm khớp háng Harris (Harris Hip Score)',
    domain: 'activity', max: 100, minutes: '10 phút',
    ref: 'Harris WH. J Bone Joint Surg Am. 1969;51:737-55',
    note: 'Thang chuẩn đánh giá kết quả thay khớp háng: đau (44), chức năng (47), không biến dạng (4), tầm vận động (5).',
    mcid: 'MCID ≈ 18 điểm sau thay khớp háng toàn phần',
    groups: ['hip'],
    coreFor: ['hip'],
    subscales: [
      { id: 'pain', name: 'Đau (0–44)', items: ['pain.pain'], max: 44 },
      { id: 'func', name: 'Chức năng (0–47)', items: ['gait.limp', 'gait.support', 'gait.distance', 'act.stairs', 'act.shoes', 'act.sitting', 'act.transport'], max: 47 }
    ],
    sections: [
      sec('pain', 'A. Đau (tối đa 44 điểm)', [
        it('pain', 'Mức độ đau khớp háng', O(
          [44, '44 – Không đau hoặc bỏ qua được'],
          [40, '40 – Đau thoáng qua, không ảnh hưởng hoạt động'],
          [30, '30 – Đau nhẹ, không ảnh hưởng hoạt động trung bình, đôi khi dùng thuốc giảm đau thông thường'],
          [20, '20 – Đau vừa, chịu đựng được nhưng phải hạn chế hoạt động; thường dùng thuốc giảm đau'],
          [10, '10 – Đau nhiều, hạn chế hoạt động nặng'],
          [0, '0 – Tàn phế, đau cả khi nằm, nằm liệt giường']
        ))
      ]),
      sec('gait', 'B. Chức năng – Dáng đi (tối đa 33 điểm)', [
        it('limp', 'Khập khiễng', O([11, '11 – Không'], [8, '8 – Nhẹ'], [5, '5 – Vừa'], [0, '0 – Nặng hoặc không đi được'])),
        it('support', 'Dụng cụ trợ giúp', O([11, '11 – Không cần'], [7, '7 – Gậy khi đi xa'], [5, '5 – Gậy thường xuyên'], [4, '4 – Một nạng'], [2, '2 – Hai gậy'], [0, '0 – Hai nạng hoặc không đi được'])),
        it('distance', 'Quãng đường đi được', O([11, '11 – Không giới hạn'], [8, '8 – Khoảng 1 km (6 dãy phố)'], [5, '5 – Khoảng 500 m (2–3 dãy phố)'], [2, '2 – Chỉ trong nhà'], [0, '0 – Nằm giường hoặc ngồi xe lăn']))
      ]),
      sec('act', 'C. Chức năng – Hoạt động (tối đa 14 điểm)', [
        it('stairs', 'Lên cầu thang', O([4, '4 – Bình thường, không vịn'], [2, '2 – Bình thường có vịn tay'], [1, '1 – Bằng cách nào đó'], [0, '0 – Không thể'])),
        it('shoes', 'Mang tất, đi giày', O([4, '4 – Dễ dàng'], [2, '2 – Khó khăn'], [0, '0 – Không thể'])),
        it('sitting', 'Ngồi', O([5, '5 – Ngồi ghế thường thoải mái 1 giờ'], [3, '3 – Ngồi ghế cao 30 phút'], [0, '0 – Không thể ngồi thoải mái trên bất kỳ ghế nào'])),
        it('transport', 'Sử dụng phương tiện công cộng', O([1, '1 – Có thể'], [0, '0 – Không thể']))
      ]),
      sec('deform', 'D. Không biến dạng (4 điểm nếu đủ cả 4 tiêu chí)', [
        it('flex', 'Co rút gấp cố định <30°', yn('Đạt (1)', 'Không đạt (0)')),
        it('add', 'Co rút khép cố định <10°', yn('Đạt (1)', 'Không đạt (0)')),
        it('rot', 'Co rút xoay trong ở tư thế duỗi <10°', yn('Đạt (1)', 'Không đạt (0)')),
        it('leg', 'Chênh lệch chiều dài chi <3,2 cm', yn('Đạt (1)', 'Không đạt (0)'))
      ]),
      sec('rom', 'E. Tầm vận động (tối đa 5 điểm) & số đo thực tế', [
        it('rom_score', 'Điểm tầm vận động (tổng tầm vận động có ích)', rng(5, { 0: 'rất hạn chế', 5: 'gần bình thường (>210°)' })),
        num('flex_deg', 'Gấp háng (đo thực tế)', 'độ', { min: 0, max: 150, fig: { type: 'gonio', normal: 120, label: 'Gấp háng' } }),
        num('abd_deg', 'Dạng háng', 'độ', { min: 0, max: 60, fig: { type: 'gonio', normal: 45, label: 'Dạng háng' } }),
        num('add_deg', 'Khép háng', 'độ', { min: 0, max: 45, fig: { type: 'gonio', normal: 30, label: 'Khép háng' } }),
        num('er_deg', 'Xoay ngoài', 'độ', { min: 0, max: 60, fig: { type: 'gonio', normal: 45, label: 'Xoay ngoài háng' } }),
        num('ir_deg', 'Xoay trong', 'độ', { min: 0, max: 45, fig: { type: 'gonio', normal: 35, label: 'Xoay trong háng' } }),
        num('lld', 'Chênh lệch chiều dài chi', 'cm', { min: 0, max: 15, step: 0.1 })
      ])
    ],
    interpret: band([
      [69, 'Kết quả KÉM', 'severe', ''],
      [79, 'Kết quả trung bình (fair)', 'mod', ''],
      [89, 'Kết quả KHÁ (good)', 'mild', ''],
      [100, 'Kết quả RẤT TỐT (excellent)', 'good', '']
    ])
  });

  S({
    id: 'ohs', mcidVal: 5, short: 'OHS', name: 'Điểm khớp háng Oxford (Oxford Hip Score)',
    domain: 'participation', max: 48, minutes: '5 phút',
    ref: 'Dawson J et al. J Bone Joint Surg Br. 1996;78:185-90',
    note: '12 câu hỏi do bệnh nhân tự trả lời về 4 tuần qua. Điểm CÀNG CAO càng tốt (0 = tệ nhất, 48 = tốt nhất).',
    mcid: 'MCID ≈ 5 điểm',
    groups: ['hip'],
    coreFor: ['hip'],
    sections: [sec('main', '12 câu hỏi về 4 tuần qua', [
      it('q1', '1. Mức độ đau khớp háng thường gặp nhất', oxfPain),
      it('q2', '2. Khó khăn khi tự tắm rửa và lau khô người', oxfDiff),
      it('q3', '3. Khó khăn khi lên/xuống ô tô hoặc phương tiện công cộng', oxfDiff),
      it('q4', '4. Khả năng tự mang tất, đi giày', oxfDiff),
      it('q5', '5. Khả năng tự đi chợ mua sắm', oxfDiff),
      it('q6', '6. Thời gian đi bộ được trước khi đau nhiều', oxf(['Trên 30 phút', '16–30 phút', '5–15 phút', 'Chỉ quanh nhà', 'Hoàn toàn không đi được'])),
      it('q7', '7. Khả năng lên xuống cầu thang', oxfDiff),
      it('q8', '8. Mức độ đau khi đứng dậy từ ghế sau khi ngồi ăn', oxfPain),
      it('q9', '9. Khập khiễng khi đi bộ', oxf(['Hiếm khi / không bao giờ', 'Đôi khi hoặc chỉ lúc đầu', 'Thường xuyên, không chỉ lúc đầu', 'Hầu hết thời gian', 'Luôn luôn'])),
      it('q10', '10. Đau nhói, đau dữ dội đột ngột ở khớp háng', oxf(['Không ngày nào', 'Chỉ 1–2 ngày', 'Vài ngày', 'Hầu hết các ngày', 'Mỗi ngày'])),
      it('q11', '11. Mức độ ảnh hưởng đến công việc và việc nhà', oxfTrouble),
      it('q12', '12. Đau khớp háng làm mất ngủ về đêm', oxf(['Không đêm nào', 'Chỉ 1–2 đêm', 'Vài đêm', 'Hầu hết các đêm', 'Mỗi đêm']))
    ])],
    interpret: band([
      [19, 'Chức năng khớp háng RẤT KÉM', 'severe', 'Có thể cần cân nhắc phẫu thuật.'],
      [29, 'Chức năng kém – vừa', 'mod', ''],
      [39, 'Chức năng khá', 'mild', ''],
      [48, 'Chức năng tốt', 'good', '']
    ])
  });

  S({
    id: 'hoos_jr', short: 'HOOS-JR', name: 'HOOS-JR (Hip Disability & OA Outcome Score – rút gọn)',
    domain: 'participation', max: 24, reverse: true, minutes: '3 phút',
    ref: 'Lyman S et al. Clin Orthop Relat Res. 2016;474:1472-82',
    note: '6 mục, mỗi mục 0–4 (0 = không vấn đề). Điểm thô CÀNG THẤP càng tốt.',
    groups: ['hip'],
    sections: [sec('main', 'Trong tuần qua', [
      it('s1', '1. Đau khi đi lên hoặc xuống cầu thang', womOpts),
      it('s2', '2. Đau khi đi bộ trên mặt phẳng', womOpts),
      it('s3', '3. Khó khăn khi đứng dậy từ tư thế ngồi', womOpts),
      it('s4', '4. Khó khăn khi cúi người xuống sàn / nhặt vật', womOpts),
      it('s5', '5. Khó khăn khi nằm trên giường (trở mình, giữ tư thế háng)', womOpts),
      it('s6', '6. Khó khăn khi ngồi', womOpts)
    ])],
    interpret: band([
      [4, 'Rất ít triệu chứng', 'good', ''],
      [9, 'Triệu chứng nhẹ', 'mild', ''],
      [16, 'Triệu chứng vừa', 'mod', ''],
      [24, 'Triệu chứng nặng', 'severe', '']
    ])
  });

  /* =======================================================================
   *  H. KHỚP GỐI
   * ===================================================================== */
  S({
    id: 'oks', mcidVal: 5, short: 'OKS', name: 'Điểm khớp gối Oxford (Oxford Knee Score)',
    domain: 'participation', max: 48, minutes: '5 phút',
    ref: 'Dawson J et al. J Bone Joint Surg Br. 1998;80:63-9',
    note: '12 câu hỏi tự trả lời về 4 tuần qua. Điểm CÀNG CAO càng tốt.',
    mcid: 'MCID ≈ 5 điểm',
    groups: ['knee'],
    coreFor: ['knee'],
    sections: [sec('main', '12 câu hỏi về 4 tuần qua', [
      it('q1', '1. Mức độ đau khớp gối thường gặp nhất', oxfPain),
      it('q2', '2. Khó khăn khi tự tắm rửa và lau khô người', oxfDiff),
      it('q3', '3. Khó khăn khi lên/xuống ô tô hoặc phương tiện công cộng', oxfDiff),
      it('q4', '4. Thời gian đi bộ được trước khi đau nhiều', oxf(['Trên 60 phút', '16–60 phút', '5–15 phút', 'Chỉ quanh nhà', 'Hoàn toàn không đi được'])),
      it('q5', '5. Mức độ đau khi đứng dậy từ ghế sau khi ngồi ăn', oxfPain),
      it('q6', '6. Khập khiễng khi đi bộ', oxf(['Hiếm khi / không bao giờ', 'Đôi khi hoặc chỉ lúc đầu', 'Thường xuyên, không chỉ lúc đầu', 'Hầu hết thời gian', 'Luôn luôn'])),
      it('q7', '7. Khả năng quỳ gối và đứng dậy sau đó', oxfDiff),
      it('q8', '8. Đau khớp gối làm mất ngủ về đêm', oxf(['Không đêm nào', 'Chỉ 1–2 đêm', 'Vài đêm', 'Hầu hết các đêm', 'Mỗi đêm'])),
      it('q9', '9. Mức độ ảnh hưởng của đau gối đến công việc và việc nhà', oxfTrouble),
      it('q10', '10. Cảm giác gối muốn khuỵu / mất vững', oxf(['Hiếm khi / không bao giờ', 'Đôi khi hoặc chỉ lúc đầu', 'Thường xuyên, không chỉ lúc đầu', 'Hầu hết thời gian', 'Luôn luôn'])),
      it('q11', '11. Khả năng tự đi chợ mua sắm', oxfDiff),
      it('q12', '12. Khả năng xuống một tầng cầu thang', oxfDiff)
    ])],
    interpret: band([
      [19, 'Chức năng khớp gối RẤT KÉM', 'severe', 'Có thể cần cân nhắc phẫu thuật thay khớp.'],
      [29, 'Chức năng kém – vừa', 'mod', ''],
      [39, 'Chức năng khá', 'mild', ''],
      [48, 'Chức năng tốt', 'good', '']
    ])
  });

  S({
    id: 'lysholm', mcidVal: 8.9, short: 'Lysholm', name: 'Điểm khớp gối Lysholm (Lysholm Knee Scoring Scale)',
    domain: 'activity', max: 100, minutes: '5 phút',
    ref: 'Lysholm J, Gillquist J. Am J Sports Med. 1982;10:150-4',
    note: 'Đặc biệt phù hợp với tổn thương dây chằng, sụn chêm và bệnh nhân thể thao.',
    mcid: 'MCID ≈ 8,9 điểm',
    groups: ['knee'],
    coreFor: ['knee'],
    sections: [sec('main', 'Tám lĩnh vực', [
      it('limp', '1. Khập khiễng', O([5, '5 – Không'], [3, '3 – Nhẹ hoặc từng lúc'], [0, '0 – Nặng và thường xuyên'])),
      it('support', '2. Dụng cụ trợ giúp', O([5, '5 – Không cần'], [2, '2 – Gậy hoặc nạng'], [0, '0 – Không thể chịu lực'])),
      it('lock', '3. Kẹt khớp', O([15, '15 – Không kẹt, không vướng'], [10, '10 – Có cảm giác vướng nhưng không kẹt'], [6, '6 – Kẹt khớp thỉnh thoảng'], [2, '2 – Kẹt khớp thường xuyên'], [0, '0 – Khớp đang bị kẹt khi khám'])),
      it('instab', '4. Mất vững (gối khuỵu)', O([25, '25 – Không bao giờ khuỵu'], [20, '20 – Hiếm khi, chỉ khi gắng sức nhiều'], [15, '15 – Thường xuyên khi gắng sức nhiều'], [10, '10 – Đôi khi trong sinh hoạt hàng ngày'], [5, '5 – Thường xuyên trong sinh hoạt hàng ngày'], [0, '0 – Mỗi bước đi'])),
      it('pain', '5. Đau', O([25, '25 – Không đau'], [20, '20 – Đau nhẹ, từng lúc khi gắng sức nhiều'], [15, '15 – Đau rõ khi gắng sức nhiều'], [10, '10 – Đau rõ khi hoặc sau khi đi bộ >2 km'], [5, '5 – Đau rõ khi hoặc sau khi đi bộ <2 km'], [0, '0 – Đau liên tục'])),
      it('swell', '6. Sưng gối', O([10, '10 – Không sưng'], [6, '6 – Sưng khi gắng sức nhiều'], [2, '2 – Sưng khi gắng sức thông thường'], [0, '0 – Sưng liên tục'])),
      it('stairs', '7. Lên xuống cầu thang', O([10, '10 – Không khó khăn'], [6, '6 – Hơi khó khăn'], [2, '2 – Phải bước từng bậc một'], [0, '0 – Không thể'])),
      it('squat', '8. Ngồi xổm', O([5, '5 – Không khó khăn'], [4, '4 – Hơi khó khăn'], [2, '2 – Không ngồi quá 90°'], [0, '0 – Không thể']))
    ])],
    interpret: band([
      [64, 'Kém (poor)', 'severe', ''],
      [83, 'Trung bình (fair)', 'mod', ''],
      [94, 'Khá (good)', 'mild', ''],
      [100, 'Rất tốt (excellent)', 'good', '']
    ])
  });

  S({
    id: 'koos_jr', short: 'KOOS-JR', name: 'KOOS-JR (Knee Injury & OA Outcome Score – rút gọn)',
    domain: 'participation', max: 28, reverse: true, minutes: '3 phút',
    ref: 'Lyman S et al. Clin Orthop Relat Res. 2016;474:1461-71',
    note: '7 mục × 0–4 (0 = không vấn đề). Điểm thô CÀNG THẤP càng tốt.',
    groups: ['knee'],
    sections: [sec('main', 'Trong tuần qua', [
      it('s1', '1. Cứng khớp gối vào buổi sáng khi mới thức dậy', womOpts),
      it('s2', '2. Đau khi duỗi thẳng gối hoàn toàn', womOpts),
      it('s3', '3. Đau khi gấp gối hoàn toàn', womOpts),
      it('s4', '4. Đau khi lên hoặc xuống cầu thang', womOpts),
      it('s5', '5. Đau khi đứng thẳng', womOpts),
      it('s6', '6. Khó khăn khi đứng dậy từ ghế', womOpts),
      it('s7', '7. Khó khăn khi đứng lâu', womOpts)
    ])],
    interpret: band([
      [5, 'Rất ít triệu chứng', 'good', ''],
      [11, 'Triệu chứng nhẹ', 'mild', ''],
      [19, 'Triệu chứng vừa', 'mod', ''],
      [28, 'Triệu chứng nặng', 'severe', '']
    ])
  });

  S({
    id: 'knee_obj', short: 'GỐI-KQ', name: 'Đo lường khách quan khớp gối (ROM, chu vi, sức cơ, test chức năng)',
    domain: 'body', noTotal: true, minutes: '10 phút',
    ref: 'Norkin & White. Measurement of Joint Motion. 2016',
    note: 'Biến số khách quan cho nghiên cứu. Không cộng tổng.',
    groups: ['knee'],
    coreFor: ['knee'],
    sections: [
      sec('rom', 'Tầm vận động khớp gối (bên bệnh)', [
        num('flex_act', 'Gấp gối chủ động', 'độ', { min: 0, max: 160, fig: { type: 'gonio', normal: 135, label: 'Gấp gối chủ động' } }),
        num('flex_pas', 'Gấp gối thụ động', 'độ', { min: 0, max: 160, fig: { type: 'gonio', normal: 140, label: 'Gấp gối thụ động' } }),
        num('ext_lag', 'Hạn chế duỗi (extension lag)', 'độ', { min: 0, max: 60, help: '0° = duỗi hết tầm.', fig: { type: 'gonio', normal: 15, label: 'Hạn chế duỗi gối', normalText: '0° là lý tưởng' } }),
        num('flex_ctr', 'Bên đối chứng – gấp gối chủ động', 'độ', { min: 0, max: 160 })
      ]),
      sec('circ', 'Chu vi & phù nề', [
        num('thigh_10', 'Chu vi đùi (trên khe khớp 10 cm) – bên bệnh', 'cm', { min: 20, max: 90, step: 0.5 }),
        num('thigh_10_c', 'Chu vi đùi – bên lành', 'cm', { min: 20, max: 90, step: 0.5 }),
        num('knee_circ', 'Chu vi ngang xương bánh chè – bên bệnh', 'cm', { min: 20, max: 80, step: 0.5 }),
        num('knee_circ_c', 'Chu vi ngang xương bánh chè – bên lành', 'cm', { min: 20, max: 80, step: 0.5 })
      ]),
      sec('strength', 'Sức cơ', [
        it('quad', 'Cơ tứ đầu đùi (thang MRC 0–5)', rng(5), { sum: false, fig: 'mrc' }),
        it('ham', 'Cơ hamstrings (thang MRC 0–5)', rng(5), { sum: false }),
        num('quad_nm', 'Lực duỗi gối đẳng động 60°/s (nếu có)', 'Nm', { min: 0, max: 400 }),
        num('lsi', 'Chỉ số đối xứng chi (LSI = bên bệnh/bên lành)', '%', { min: 0, max: 150, help: 'LSI ≥90% là tiêu chí trở lại thể thao sau tái tạo dây chằng chéo trước.' })
      ]),
      sec('hop', 'Test chức năng (sau tái tạo dây chằng)', [
        num('hop_single', 'Single hop for distance – bên bệnh', 'cm', { min: 0, max: 400 }),
        num('hop_single_c', 'Single hop – bên lành', 'cm', { min: 0, max: 400 }),
        num('sts30', 'Test ngồi–đứng 30 giây', 'lần', { min: 0, max: 60 })
      ])
    ]
  });

  /* =======================================================================
   *  I. KHỚP VAI
   * ===================================================================== */
  S({
    id: 'constant', mcidVal: 10.4, short: 'CMS', name: 'Điểm Constant–Murley khớp vai (Constant–Murley Score)',
    domain: 'activity', max: 100, minutes: '15 phút',
    ref: 'Constant CR, Murley AH. Clin Orthop Relat Res. 1987;214:160-4',
    note: 'Kết hợp chủ quan (đau 15, sinh hoạt 20) và khách quan (tầm vận động 40, sức cơ 25).',
    mcid: 'MCID ≈ 10,4 điểm',
    groups: ['shoulder'],
    coreFor: ['shoulder'],
    subscales: [
      { id: 'subj', name: 'Chủ quan (0–35)', items: ['pain.pain', 'adl.work', 'adl.sport', 'adl.sleep', 'adl.position'], max: 35 },
      { id: 'obj', name: 'Khách quan (0–65)', items: ['rom.flex', 'rom.abd', 'rom.er', 'rom.ir', 'power.power'], max: 65 }
    ],
    sections: [
      sec('pain', 'A. Đau (tối đa 15 điểm)', [
        it('pain', 'Mức độ đau vai', O([15, '15 – Không đau'], [10, '10 – Đau nhẹ'], [5, '5 – Đau vừa'], [0, '0 – Đau nặng']))
      ]),
      sec('adl', 'B. Sinh hoạt hàng ngày (tối đa 20 điểm)', [
        it('work', 'Mức độ hoạt động nghề nghiệp', rng(4, { 0: 'không làm việc được', 4: 'hoạt động nghề nghiệp bình thường' })),
        it('sport', 'Hoạt động giải trí / thể thao', rng(4, { 0: 'không thực hiện được', 4: 'bình thường' })),
        it('sleep', 'Giấc ngủ', O([2, '2 – Không bị ảnh hưởng'], [1, '1 – Thỉnh thoảng thức giấc vì đau vai'], [0, '0 – Mất ngủ vì đau vai'])),
        it('position', 'Tầm với có thể sử dụng tay (vị trí cao nhất làm việc thoải mái)', O([10, '10 – Trên đỉnh đầu'], [8, '8 – Ngang đỉnh đầu'], [6, '6 – Ngang cổ'], [4, '4 – Ngang mũi ức'], [2, '2 – Ngang thắt lưng'], [0, '0 – Chỉ dưới thắt lưng']))
      ]),
      sec('rom', 'C. Tầm vận động (tối đa 40 điểm)', [
        it('flex', 'Gấp vai ra trước', O([10, '10 – 151–180°'], [8, '8 – 121–150°'], [6, '6 – 91–120°'], [4, '4 – 61–90°'], [2, '2 – 31–60°'], [0, '0 – 0–30°'])),
        it('abd', 'Dạng vai', O([10, '10 – 151–180°'], [8, '8 – 121–150°'], [6, '6 – 91–120°'], [4, '4 – 61–90°'], [2, '2 – 31–60°'], [0, '0 – 0–30°'])),
        it('er', 'Xoay ngoài (cộng dồn, tối đa 10)', O([10, '10 – Tay đưa hoàn toàn lên trên đầu'], [8, '8 – Bàn tay lên đỉnh đầu, khuỷu ra trước'], [6, '6 – Bàn tay lên đỉnh đầu, khuỷu ra sau'], [4, '4 – Bàn tay sau đầu, khuỷu ra trước'], [2, '2 – Bàn tay sau đầu, khuỷu ra sau'], [0, '0 – Không thực hiện được'])),
        it('ir', 'Xoay trong (vị trí mu bàn tay chạm tới)', O([10, '10 – Giữa hai xương bả vai (T7)'], [8, '8 – Ngang đốt sống T12'], [6, '6 – Ngang đốt sống L3'], [4, '4 – Ngang thắt lưng (L5)'], [2, '2 – Ngang mông'], [0, '0 – Mặt ngoài đùi']))
      ]),
      sec('power', 'D. Sức cơ (tối đa 25 điểm)', [
        it('power', 'Sức dạng vai đo ở 90° (1 kg lực giữ được = 2 điểm; tối đa 25)', rng(25), { help: 'Đo bằng lực kế ở tư thế dạng 90°, mặt phẳng xương bả vai.' }),
        num('power_kg', 'Lực đo được (nếu dùng lực kế)', 'kg', { min: 0, max: 30, step: 0.5 })
      ])
    ],
    interpret: band([
      [55, 'Kết quả KÉM', 'severe', ''],
      [70, 'Trung bình (fair)', 'mod', ''],
      [85, 'Khá (good)', 'mild', ''],
      [100, 'Rất tốt (excellent)', 'good', '']
    ])
  });

  S({
    id: 'spadi', short: 'SPADI', name: 'Chỉ số đau & khuyết tật vai (Shoulder Pain and Disability Index)',
    domain: 'participation', max: 130, reverse: true, minutes: '5 phút',
    ref: 'Roach KE et al. Arthritis Care Res. 1991;4:143-9',
    note: '13 mục, mỗi mục 0–10. Điểm % = (tổng/130) × 100. Điểm CÀNG CAO càng nặng.',
    mcid: 'MCID ≈ 8–13 điểm % ',
    groups: ['shoulder'],
    coreFor: ['shoulder'],
    subscales: [
      { id: 'pain', name: 'Đau (0–50)', items: ['pain.p1', 'pain.p2', 'pain.p3', 'pain.p4', 'pain.p5'], max: 50 },
      { id: 'dis', name: 'Khuyết tật (0–80)', items: ['dis.d1', 'dis.d2', 'dis.d3', 'dis.d4', 'dis.d5', 'dis.d6', 'dis.d7', 'dis.d8'], max: 80 }
    ],
    sections: [
      sec('pain', 'A. Đau – mức độ đau khi… (0 = không đau, 10 = đau nhất có thể)', [
        it('p1', '1. Đau nhất trong ngày', rng(10)),
        it('p2', '2. Khi nằm nghiêng về bên vai đau', rng(10)),
        it('p3', '3. Khi với lấy vật trên cao', rng(10)),
        it('p4', '4. Khi chạm vào sau gáy', rng(10)),
        it('p5', '5. Khi đẩy vật bằng tay bên đau', rng(10))
      ]),
      sec('dis', 'B. Khuyết tật – mức độ khó khăn khi… (0 = không khó, 10 = cần trợ giúp hoàn toàn)', [
        it('d1', '1. Gội đầu', rng(10)),
        it('d2', '2. Kỳ lưng khi tắm', rng(10)),
        it('d3', '3. Mặc áo chui đầu', rng(10)),
        it('d4', '4. Mặc áo sơ mi cài cúc phía trước', rng(10)),
        it('d5', '5. Mặc quần', rng(10)),
        it('d6', '6. Đặt vật lên kệ cao', rng(10)),
        it('d7', '7. Mang vật nặng ≥5 kg', rng(10)),
        it('d8', '8. Lấy vật ở túi sau quần', rng(10))
      ])
    ],
    compute: function (v) {
      var s = 0;
      Object.keys(v).forEach(function (k) { if (v[k] !== '' && v[k] !== undefined && v[k] !== null) s += Number(v[k]); });
      return { total: s, extra: { 'SPADI (%)': (Math.round(s / 130 * 1000) / 10) + '%' } };
    },
    interpret: band([
      [26, 'Ảnh hưởng nhẹ (<20%)', 'good', ''],
      [52, 'Ảnh hưởng nhẹ – vừa', 'mild', ''],
      [91, 'Ảnh hưởng vừa – nặng', 'mod', ''],
      [130, 'Ảnh hưởng rất nặng (>70%)', 'severe', '']
    ])
  });

  S({
    id: 'quickdash', short: 'QuickDASH', name: 'QuickDASH – khuyết tật chi trên',
    domain: 'participation', max: 55, reverse: true, minutes: '5 phút',
    ref: 'Beaton DE et al. J Bone Joint Surg Am. 2005;87:1038-46',
    note: '11 mục × 1–5. Điểm quy đổi = ((tổng/11) − 1) × 25, thang 0–100. CÀNG CAO càng nặng.',
    mcid: 'MCID ≈ 8–15 điểm (thang 0–100)',
    groups: ['shoulder'],
    coreFor: ['shoulder'],
    sections: [sec('main', 'Trong tuần qua, mức độ khó khăn khi… (1 = không khó khăn → 5 = không thể)', [
      it('q1', '1. Mở nắp lọ chặt hoặc mới', rngFrom(1, 5)),
      it('q2', '2. Làm việc nhà nặng (lau tường, sàn)', rngFrom(1, 5)),
      it('q3', '3. Xách túi đồ đi chợ hoặc cặp tài liệu', rngFrom(1, 5)),
      it('q4', '4. Kỳ lưng khi tắm', rngFrom(1, 5)),
      it('q5', '5. Cắt thức ăn bằng dao', rngFrom(1, 5)),
      it('q6', '6. Hoạt động giải trí cần dùng lực hoặc va chạm cánh tay', rngFrom(1, 5)),
      it('q7', '7. Mức độ ảnh hưởng đến sinh hoạt xã hội với gia đình, bạn bè (1 = không → 5 = cực kỳ)', rngFrom(1, 5)),
      it('q8', '8. Hạn chế công việc / sinh hoạt hàng ngày (1 = không → 5 = rất nhiều)', rngFrom(1, 5)),
      it('q9', '9. Mức độ đau cánh tay – vai – bàn tay (1 = không đau → 5 = đau cực độ)', rngFrom(1, 5)),
      it('q10', '10. Cảm giác kiến bò, tê bì ở cánh tay – vai – bàn tay', rngFrom(1, 5)),
      it('q11', '11. Khó ngủ do đau cánh tay – vai – bàn tay', rngFrom(1, 5))
    ])],
    compute: function (v) {
      var s = 0, n = 0;
      Object.keys(v).forEach(function (k) { if (v[k] !== '' && v[k] !== undefined && v[k] !== null) { s += Number(v[k]); n++; } });
      if (n < 10) return { total: s, extra: { 'Điểm QuickDASH (0–100)': 'Cần ≥10/11 mục để tính' } };
      var sc = Math.round(((s / n) - 1) * 25 * 10) / 10;
      return { total: s, extra: { 'Điểm QuickDASH (0–100)': sc.toFixed(1), 'Số mục trả lời': n + '/11' } };
    },
    interpret: band([
      [16, 'Khuyết tật tối thiểu', 'good', ''],
      [27, 'Khuyết tật nhẹ', 'mild', ''],
      [38, 'Khuyết tật vừa', 'mod', ''],
      [55, 'Khuyết tật nặng', 'severe', '']
    ])
  });

  S({
    id: 'oss', short: 'OSS', name: 'Điểm khớp vai Oxford (Oxford Shoulder Score)',
    domain: 'participation', max: 48, minutes: '5 phút',
    ref: 'Dawson J et al. J Bone Joint Surg Br. 1996;78:593-600',
    note: '12 câu hỏi tự trả lời về 4 tuần qua. Điểm CÀNG CAO càng tốt.',
    groups: ['shoulder'],
    sections: [sec('main', '12 câu hỏi về 4 tuần qua', [
      it('q1', '1. Mức độ đau vai thường gặp nhất', oxfPain),
      it('q2', '2. Khó khăn khi tự mặc quần áo', oxfDiff),
      it('q3', '3. Khó khăn khi lên/xuống xe hoặc phương tiện công cộng', oxfDiff),
      it('q4', '4. Khả năng tự dùng dao và nĩa/đũa cùng lúc', oxfDiff),
      it('q5', '5. Khả năng tự làm việc nhà (mua sắm, nấu ăn)', oxfDiff),
      it('q6', '6. Khả năng chải tóc bằng tay bên đau', oxfDiff),
      it('q7', '7. Mức độ đau vai trong hầu hết thời gian', oxfPain),
      it('q8', '8. Khả năng treo quần áo lên móc/dây phơi', oxfDiff),
      it('q9', '9. Khả năng tự rửa và lau khô cả hai bên nách', oxfDiff),
      it('q10', '10. Mức độ ảnh hưởng đến công việc thường ngày', oxfTrouble),
      it('q11', '11. Đau vai làm mất ngủ về đêm', oxf(['Không đêm nào', 'Chỉ 1–2 đêm', 'Vài đêm', 'Hầu hết các đêm', 'Mỗi đêm'])),
      it('q12', '12. Đau vai khi mang vật nặng (túi đồ đi chợ)', oxfTrouble)
    ])],
    interpret: band([
      [19, 'Rối loạn chức năng vai nặng', 'severe', ''],
      [29, 'Rối loạn chức năng vừa', 'mod', ''],
      [39, 'Rối loạn chức năng nhẹ', 'mild', ''],
      [48, 'Chức năng vai tốt', 'good', '']
    ])
  });

  S({
    id: 'shoulder_obj', short: 'VAI-KQ', name: 'Đo lường khách quan khớp vai (ROM, sức cơ, nghiệm pháp)',
    domain: 'body', noTotal: true, minutes: '10 phút',
    ref: 'Norkin & White. Measurement of Joint Motion. 2016',
    note: 'Biến số khách quan. Ghi tầm vận động chủ động và bên đối chứng để tính mức thâm hụt.',
    groups: ['shoulder'],
    coreFor: ['shoulder'],
    sections: [
      sec('rom', 'Tầm vận động chủ động – bên bệnh', [
        num('flex', 'Gấp ra trước', 'độ', { min: 0, max: 180, fig: { type: 'gonio', normal: 180, label: 'Gấp vai ra trước' } }),
        num('abd', 'Dạng', 'độ', { min: 0, max: 180, fig: { type: 'gonio', normal: 180, label: 'Dạng vai' } }),
        num('er', 'Xoay ngoài (khuỷu ép sát thân)', 'độ', { min: -20, max: 100, fig: { type: 'gonio', normal: 90, label: 'Xoay ngoài vai' } }),
        num('ir', 'Xoay trong (mức đốt sống chạm tới, ghi số hiệu)', 'độ/mức', { min: 0, max: 100 }),
        num('ext', 'Duỗi ra sau', 'độ', { min: 0, max: 70, fig: { type: 'gonio', normal: 60, label: 'Duỗi vai ra sau' } })
      ]),
      sec('rom_c', 'Tầm vận động chủ động – bên đối chứng', [
        num('flex', 'Gấp ra trước', 'độ', { min: 0, max: 180 }),
        num('abd', 'Dạng', 'độ', { min: 0, max: 180 }),
        num('er', 'Xoay ngoài', 'độ', { min: -20, max: 100 })
      ]),
      sec('strength', 'Sức cơ chóp xoay (thang MRC 0–5)', [
        it('supra', 'Cơ trên gai (test Jobe / empty can)', rng(5), { sum: false, fig: 'mrc' }),
        it('infra', 'Cơ dưới gai – xoay ngoài', rng(5), { sum: false }),
        it('subscap', 'Cơ dưới vai – xoay trong (lift-off test)', rng(5), { sum: false }),
        it('deltoid', 'Cơ delta', rng(5), { sum: false })
      ]),
      sec('special', 'Nghiệm pháp đặc hiệu & biến chứng', [
        it('neer', 'Nghiệm pháp Neer (chèn ép dưới mỏm cùng)', O([0, 'Âm tính'], [0, 'Dương tính']), { text: true, sum: false }),
        it('hawkins', 'Nghiệm pháp Hawkins–Kennedy', O([0, 'Âm tính'], [0, 'Dương tính']), { text: true, sum: false }),
        it('sublux', 'Bán trật khớp vai (thường gặp sau đột quỵ)', O([0, 'Không'], [0, 'Bán trật <1 khoát ngón tay'], [0, 'Bán trật 1–2 khoát ngón'], [0, 'Bán trật >2 khoát ngón']), { text: true, sum: false }),
        num('sublux_cm', 'Khoảng cách mỏm cùng vai – chỏm xương cánh tay', 'cm', { min: 0, max: 5, step: 0.1 })
      ])
    ]
  });

})(window);
