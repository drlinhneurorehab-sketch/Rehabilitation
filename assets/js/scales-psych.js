/* =========================================================================
 * PHCN-METRICS · scales-psych.js
 * TÂM THẦN – TÂM LÝ – GIẤC NGỦ
 * Toàn bộ thang trong file này áp dụng cho MỌI nhóm đối tượng bệnh lý.
 * ========================================================================= */
(function (g) {
  'use strict';
  var h = g.PHCN.h, S = h.S, O = h.O, rng = h.rng, rngFrom = h.rngFrom, yn = h.yn,
      it = h.it, num = h.num, nums = h.nums, sec = h.sec, band = h.band;

  /* Mọi nhóm bệnh lý + nhóm công cụ tâm lý */
  var ALL = g.PHCN.allGroupIds().concat(['psych']);
  /* Bộ sàng lọc tâm lý tối thiểu: đưa vào bộ cốt lõi của MỌI nhóm bệnh lý */
  var CORE_ALL = g.PHCN.allGroupIds();

  /* Bộ lựa chọn dùng lại */
  var freq4 = O([0, '0 – Không ngày nào'], [1, '1 – Vài ngày'], [2, '2 – Hơn nửa số ngày'], [3, '3 – Gần như mỗi ngày']);
  var dass = O([0, '0 – Không đúng với tôi chút nào'], [1, '1 – Đúng với tôi phần nào, hoặc thỉnh thoảng'],
    [2, '2 – Đúng với tôi phần nhiều, hoặc phần lớn thời gian'], [3, '3 – Hoàn toàn đúng với tôi, hoặc hầu hết thời gian']);
  var cesd = O([0, '0 – Hiếm khi / không có (dưới 1 ngày)'], [1, '1 – Đôi khi (1–2 ngày)'],
    [2, '2 – Thỉnh thoảng (3–4 ngày)'], [3, '3 – Hầu hết thời gian (5–7 ngày)']);
  var cesdRev = O([3, '0 – Hiếm khi / không có (dưới 1 ngày)'], [2, '1 – Đôi khi (1–2 ngày)'],
    [1, '2 – Thỉnh thoảng (3–4 ngày)'], [0, '3 – Hầu hết thời gian (5–7 ngày)']);
  var pss = O([0, '0 – Không bao giờ'], [1, '1 – Hầu như không'], [2, '2 – Thỉnh thoảng'], [3, '3 – Khá thường xuyên'], [4, '4 – Rất thường xuyên']);
  var pssRev = O([4, '0 – Không bao giờ'], [3, '1 – Hầu như không'], [2, '2 – Thỉnh thoảng'], [1, '3 – Khá thường xuyên'], [0, '4 – Rất thường xuyên']);
  var who5 = O([5, '5 – Luôn luôn'], [4, '4 – Hầu hết thời gian'], [3, '3 – Hơn nửa thời gian'],
    [2, '2 – Chưa đến nửa thời gian'], [1, '1 – Thỉnh thoảng'], [0, '0 – Không lúc nào']);
  var zbi = O([0, '0 – Không bao giờ'], [1, '1 – Hiếm khi'], [2, '2 – Thỉnh thoảng'], [3, '3 – Khá thường xuyên'], [4, '4 – Gần như luôn luôn']);
  var fss = rngFrom(1, 7, { 1: 'Hoàn toàn không đồng ý', 4: 'Trung lập', 7: 'Hoàn toàn đồng ý' });

  /* =======================================================================
   *  L1. TRẦM CẢM
   * ===================================================================== */

  /* --- GAD-7 (lo âu) — thuộc bộ sàng lọc cốt lõi --- */
  S({
    id: 'gad7', short: 'GAD-7', name: 'Thang sàng lọc lo âu lan tỏa GAD-7',
    domain: 'body', max: 21, reverse: true, minutes: '3 phút', home: 'psych',
    ref: 'Spitzer RL et al. Arch Intern Med. 2006;166:1092-7',
    note: 'Trong 2 tuần qua, bạn bị làm phiền bởi các vấn đề sau ở mức độ nào? Điểm ≥10 là ngưỡng sàng lọc dương tính. Điểm CÀNG CAO càng nặng.',
    mcid: 'Thay đổi có ý nghĩa ≈ 4 điểm',
    groups: ALL, coreFor: CORE_ALL,
    sections: [sec('main', 'Bảy triệu chứng trong 2 tuần qua', [
      it('q1', '1. Cảm thấy bồn chồn, lo lắng hoặc căng thẳng', freq4),
      it('q2', '2. Không thể ngừng lo lắng hoặc không kiểm soát được sự lo lắng', freq4),
      it('q3', '3. Lo lắng quá nhiều về những chuyện khác nhau', freq4),
      it('q4', '4. Khó thư giãn', freq4),
      it('q5', '5. Bồn chồn đến mức khó ngồi yên', freq4),
      it('q6', '6. Dễ bực bội hoặc cáu kỉnh', freq4),
      it('q7', '7. Cảm thấy sợ hãi như thể điều gì tồi tệ sắp xảy ra', freq4)
    ])],
    interpret: band([
      [4, 'Lo âu tối thiểu', 'good', ''],
      [9, 'Lo âu nhẹ', 'mild', 'Theo dõi, đánh giá lại sau 2–4 tuần.'],
      [14, 'Lo âu mức độ vừa', 'mod', 'Ngưỡng ≥10 gợi ý rối loạn lo âu lan tỏa — cần đánh giá chuyên khoa.'],
      [21, 'Lo âu mức độ nặng', 'severe', 'Chỉ định can thiệp tâm lý và/hoặc dùng thuốc; hội chẩn chuyên khoa tâm thần.']
    ])
  });

  /* --- DASS-21 --- */
  S({
    id: 'dass21', short: 'DASS-21', name: 'Thang trầm cảm – lo âu – stress DASS-21',
    domain: 'body', max: 63, reverse: true, minutes: '7 phút', home: 'psych',
    ref: 'Lovibond SH, Lovibond PF. 1995; bản tiếng Việt đã chuẩn hóa',
    note: '21 mục cho 3 tiểu thang. Điểm thô mỗi tiểu thang được NHÂN 2 khi so với ngưỡng (xem phần giá trị dẫn xuất). Điểm CÀNG CAO càng nặng.',
    groups: ALL,
    subscales: [
      { id: 'd', name: 'Trầm cảm (thô 0–21)', items: ['main.q3', 'main.q5', 'main.q10', 'main.q13', 'main.q16', 'main.q17', 'main.q21'], max: 21 },
      { id: 'a', name: 'Lo âu (thô 0–21)', items: ['main.q2', 'main.q4', 'main.q7', 'main.q9', 'main.q15', 'main.q19', 'main.q20'], max: 21 },
      { id: 's', name: 'Stress (thô 0–21)', items: ['main.q1', 'main.q6', 'main.q8', 'main.q11', 'main.q12', 'main.q14', 'main.q18'], max: 21 }
    ],
    sections: [sec('main', 'Trong tuần qua, mức độ đúng với bạn (0 = không đúng chút nào → 3 = hoàn toàn đúng)', [
      it('q1', '1. Tôi thấy khó thư giãn, khó bình tĩnh lại', dass),
      it('q2', '2. Tôi bị khô miệng', dass),
      it('q3', '3. Tôi dường như chẳng có chút cảm xúc tích cực nào', dass),
      it('q4', '4. Tôi bị khó thở (thở gấp, hụt hơi dù không gắng sức)', dass),
      it('q5', '5. Tôi thấy khó bắt tay vào làm một việc gì đó', dass),
      it('q6', '6. Tôi có xu hướng phản ứng thái quá với các tình huống', dass),
      it('q7', '7. Tôi bị run (ví dụ run tay)', dass),
      it('q8', '8. Tôi thấy mình tiêu hao quá nhiều sức lực vì lo lắng', dass),
      it('q9', '9. Tôi lo về những tình huống có thể khiến tôi hoảng sợ hoặc mất mặt', dass),
      it('q10', '10. Tôi thấy chẳng có gì để mong đợi', dass),
      it('q11', '11. Tôi thấy mình dễ bị kích động, dễ nổi nóng', dass),
      it('q12', '12. Tôi thấy khó để nghỉ ngơi, thư giãn', dass),
      it('q13', '13. Tôi cảm thấy chán nản, buồn bã', dass),
      it('q14', '14. Tôi không chịu được khi có việc gì cản trở điều tôi đang làm', dass),
      it('q15', '15. Tôi thấy mình gần như hoảng loạn', dass),
      it('q16', '16. Tôi không thấy hào hứng với bất cứ điều gì', dass),
      it('q17', '17. Tôi cảm thấy mình chẳng có mấy giá trị', dass),
      it('q18', '18. Tôi thấy mình dễ tự ái, dễ phật lòng', dass),
      it('q19', '19. Tôi nhận thấy tim mình đập bất thường dù không gắng sức', dass),
      it('q20', '20. Tôi thấy sợ hãi mà không có lý do rõ ràng', dass),
      it('q21', '21. Tôi cảm thấy cuộc sống thật vô nghĩa', dass)
    ])],
    compute: function (v) {
      function part(keys) {
        var s = 0, any = false;
        keys.forEach(function (k) { if (v['main.' + k] !== undefined) { s += Number(v['main.' + k]); any = true; } });
        return any ? s : null;
      }
      var d = part(['q3', 'q5', 'q10', 'q13', 'q16', 'q17', 'q21']);
      var a = part(['q2', 'q4', 'q7', 'q9', 'q15', 'q19', 'q20']);
      var st = part(['q1', 'q6', 'q8', 'q11', 'q12', 'q14', 'q18']);
      function lv(x, cuts) {
        if (x === null) return '—';
        var names = ['Bình thường', 'Nhẹ', 'Vừa', 'Nặng', 'Rất nặng'];
        for (var i = 0; i < cuts.length; i++) if (x <= cuts[i]) return x + ' (' + names[i] + ')';
        return x + ' (' + names[4] + ')';
      }
      return {
        total: (d === null ? 0 : d) + (a === null ? 0 : a) + (st === null ? 0 : st),
        extra: {
          'Trầm cảm ×2': lv(d === null ? null : d * 2, [9, 13, 20, 27]),
          'Lo âu ×2': lv(a === null ? null : a * 2, [7, 9, 14, 19]),
          'Stress ×2': lv(st === null ? null : st * 2, [14, 18, 25, 33])
        }
      };
    },
    interpret: band([
      [10, 'Mức độ chung trong giới hạn bình thường', 'good', 'Cần xem riêng từng tiểu thang ở phần giá trị dẫn xuất.'],
      [20, 'Rối loạn khí sắc mức nhẹ', 'mild', ''],
      [34, 'Rối loạn khí sắc mức vừa', 'mod', ''],
      [63, 'Rối loạn khí sắc mức nặng', 'severe', 'Hội chẩn chuyên khoa tâm thần.']
    ])
  });

  /* --- WHO-5 --- */
  S({
    id: 'who5', short: 'WHO-5', name: 'Chỉ số an lạc tinh thần WHO-5 (WHO-5 Well-Being Index)',
    domain: 'participation', max: 25, minutes: '2 phút', home: 'psych',
    ref: 'WHO Regional Office for Europe, 1998',
    note: 'Năm câu về 2 tuần qua. Điểm thô 0–25, nhân 4 thành thang 0–100. Điểm CÀNG CAO càng tốt; dưới 50 (thô ≤12) cần sàng lọc trầm cảm.',
    mcid: 'Thay đổi có ý nghĩa ≈ 10 điểm (thang 0–100)',
    groups: ALL,
    sections: [sec('main', 'Trong 2 tuần qua, tôi cảm thấy…', [
      it('q1', '1. Vui vẻ và phấn chấn', who5),
      it('q2', '2. Bình tĩnh và thư thái', who5),
      it('q3', '3. Năng động và tràn đầy sinh lực', who5),
      it('q4', '4. Thức dậy với cảm giác tươi mới, được nghỉ ngơi đầy đủ', who5),
      it('q5', '5. Cuộc sống hàng ngày có nhiều điều thú vị', who5)
    ])],
    compute: function (v) {
      var s = 0;
      Object.keys(v).forEach(function (k) { s += Number(v[k]); });
      return { total: s, extra: { 'Điểm quy đổi 0–100': (s * 4) + '/100' } };
    },
    interpret: band([
      [7, 'An lạc rất thấp (≤28/100) — nhiều khả năng trầm cảm', 'severe', 'Cần đánh giá trầm cảm bằng PHQ-9 và hội chẩn chuyên khoa.'],
      [12, 'An lạc thấp (<50/100)', 'mod', 'Ngưỡng khuyến cáo sàng lọc trầm cảm sâu hơn.'],
      [17, 'An lạc trung bình', 'mild', ''],
      [25, 'An lạc tốt', 'good', '']
    ])
  });

  /* --- CES-D --- */
  S({
    id: 'cesd', short: 'CES-D', name: 'Thang trầm cảm dịch tễ CES-D (20 mục)',
    domain: 'body', max: 60, reverse: true, minutes: '10 phút', home: 'psych',
    ref: 'Radloff LS. Appl Psychol Meas. 1977;1:385-401 (miễn phí sử dụng)',
    note: 'Trong tuần qua bạn cảm thấy như thế nào? Bốn mục 4, 8, 12, 16 đã được ĐẢO ĐIỂM sẵn — cứ chọn đúng tần suất người bệnh mô tả. Ngưỡng ≥16 gợi ý có triệu chứng trầm cảm.',
    groups: ALL,
    sections: [sec('main', 'Trong tuần qua, tần suất bạn cảm thấy…', [
      it('q1', '1. Bực bội vì những chuyện thường ngày không làm tôi bận tâm', cesd),
      it('q2', '2. Không muốn ăn, ăn không ngon miệng', cesd),
      it('q3', '3. Không thể xua đi nỗi buồn dù có gia đình, bạn bè giúp đỡ', cesd),
      it('q4', '4. Cảm thấy mình cũng tốt như những người khác (mục đảo điểm)', cesdRev),
      it('q5', '5. Khó tập trung vào việc đang làm', cesd),
      it('q6', '6. Cảm thấy chán nản, trầm uất', cesd),
      it('q7', '7. Cảm thấy mọi việc mình làm đều tốn rất nhiều công sức', cesd),
      it('q8', '8. Cảm thấy hy vọng về tương lai (mục đảo điểm)', cesdRev),
      it('q9', '9. Nghĩ rằng cuộc đời mình là một thất bại', cesd),
      it('q10', '10. Cảm thấy sợ hãi', cesd),
      it('q11', '11. Ngủ không yên giấc', cesd),
      it('q12', '12. Cảm thấy hạnh phúc (mục đảo điểm)', cesdRev),
      it('q13', '13. Nói ít hơn bình thường', cesd),
      it('q14', '14. Cảm thấy cô đơn', cesd),
      it('q15', '15. Cảm thấy mọi người tỏ ra không thân thiện với mình', cesd),
      it('q16', '16. Cảm thấy tận hưởng được cuộc sống (mục đảo điểm)', cesdRev),
      it('q17', '17. Đã từng khóc', cesd),
      it('q18', '18. Cảm thấy buồn', cesd),
      it('q19', '19. Cảm thấy mọi người không ưa mình', cesd),
      it('q20', '20. Không thể bắt đầu làm một việc gì', cesd)
    ])],
    interpret: band([
      [15, 'Không có triệu chứng trầm cảm đáng kể (<16)', 'good', ''],
      [20, 'Triệu chứng trầm cảm nhẹ', 'mild', 'Ngưỡng ≥16 gợi ý cần đánh giá sâu hơn.'],
      [30, 'Triệu chứng trầm cảm mức vừa', 'mod', ''],
      [60, 'Triệu chứng trầm cảm mức nặng', 'severe', 'Hội chẩn chuyên khoa tâm thần.']
    ])
  });

  /* --- PSS-10 --- */
  S({
    id: 'pss10', short: 'PSS-10', name: 'Thang cảm nhận stress PSS-10 (Perceived Stress Scale)',
    domain: 'body', max: 40, reverse: true, minutes: '5 phút', home: 'psych',
    ref: 'Cohen S et al. J Health Soc Behav. 1983;24:385-96',
    note: 'Bốn mục 4, 5, 7, 8 đã được ĐẢO ĐIỂM sẵn. Điểm CÀNG CAO càng nhiều stress.',
    groups: ALL,
    sections: [sec('main', 'Trong tháng qua, bạn thường xuyên…', [
      it('q1', '1. Cảm thấy khó chịu vì điều gì đó xảy ra bất ngờ', pss),
      it('q2', '2. Cảm thấy không thể kiểm soát những điều quan trọng trong đời', pss),
      it('q3', '3. Cảm thấy căng thẳng và áp lực', pss),
      it('q4', '4. Cảm thấy tự tin vào khả năng xử lý vấn đề cá nhân (mục đảo điểm)', pssRev),
      it('q5', '5. Cảm thấy mọi việc đang diễn ra theo ý mình (mục đảo điểm)', pssRev),
      it('q6', '6. Thấy mình không thể đương đầu với tất cả những việc phải làm', pss),
      it('q7', '7. Có thể kiểm soát được những điều gây bực bội (mục đảo điểm)', pssRev),
      it('q8', '8. Cảm thấy mình làm chủ được mọi việc (mục đảo điểm)', pssRev),
      it('q9', '9. Tức giận vì những việc nằm ngoài tầm kiểm soát', pss),
      it('q10', '10. Cảm thấy khó khăn chồng chất đến mức không thể vượt qua', pss)
    ])],
    interpret: band([
      [13, 'Stress mức thấp', 'good', ''],
      [26, 'Stress mức trung bình', 'mod', 'Cân nhắc tư vấn kỹ năng ứng phó, thư giãn.'],
      [40, 'Stress mức cao', 'severe', 'Cần can thiệp tâm lý; stress cao làm giảm tuân thủ chương trình PHCN.']
    ])
  });

  /* =======================================================================
   *  L2. GIẤC NGỦ
   * ===================================================================== */

  /* --- ISI — thuộc bộ sàng lọc cốt lõi --- */
  S({
    id: 'isi', short: 'ISI', name: 'Chỉ số mức độ mất ngủ ISI (Insomnia Severity Index)',
    domain: 'body', max: 28, reverse: true, minutes: '3 phút', home: 'psych',
    ref: 'Bastien CH et al. Sleep Med. 2001;2:297-307',
    note: 'Bảy mục về 2 tuần qua. Điểm ≥15 là mất ngủ mức lâm sàng. Điểm CÀNG CAO càng nặng.',
    mcid: 'Thay đổi có ý nghĩa ≈ 6 điểm',
    groups: ALL, coreFor: CORE_ALL,
    sections: [
      sec('sev', 'Mức độ nghiêm trọng của vấn đề giấc ngủ hiện tại', [
        it('q1', '1. Khó đi vào giấc ngủ', rng(4, { 0: 'Không có', 1: 'Nhẹ', 2: 'Vừa', 3: 'Nặng', 4: 'Rất nặng' })),
        it('q2', '2. Khó duy trì giấc ngủ (thức giấc giữa đêm)', rng(4, { 0: 'Không có', 1: 'Nhẹ', 2: 'Vừa', 3: 'Nặng', 4: 'Rất nặng' })),
        it('q3', '3. Thức dậy quá sớm và không ngủ lại được', rng(4, { 0: 'Không có', 1: 'Nhẹ', 2: 'Vừa', 3: 'Nặng', 4: 'Rất nặng' }))
      ]),
      sec('impact', 'Mức độ hài lòng và ảnh hưởng', [
        it('q4', '4. Mức độ hài lòng với giấc ngủ hiện tại', rng(4, { 0: 'Rất hài lòng', 1: 'Hài lòng', 2: 'Trung bình', 3: 'Không hài lòng', 4: 'Rất không hài lòng' })),
        it('q5', '5. Mức độ người khác nhận thấy vấn đề giấc ngủ ảnh hưởng đến chất lượng sống của bạn', rng(4, { 0: 'Hoàn toàn không', 1: 'Một chút', 2: 'Vừa phải', 3: 'Nhiều', 4: 'Rất nhiều' })),
        it('q6', '6. Mức độ bạn lo lắng, khó chịu về vấn đề giấc ngủ', rng(4, { 0: 'Hoàn toàn không', 1: 'Một chút', 2: 'Vừa phải', 3: 'Nhiều', 4: 'Rất nhiều' })),
        it('q7', '7. Mức độ vấn đề giấc ngủ ảnh hưởng đến sinh hoạt ban ngày (mệt mỏi, tập trung, trí nhớ, khí sắc, công việc)', rng(4, { 0: 'Hoàn toàn không', 1: 'Một chút', 2: 'Vừa phải', 3: 'Nhiều', 4: 'Rất nhiều' }))
      ])
    ],
    interpret: band([
      [7, 'Không có mất ngủ đáng kể', 'good', ''],
      [14, 'Mất ngủ dưới ngưỡng lâm sàng', 'mild', 'Tư vấn vệ sinh giấc ngủ.'],
      [21, 'Mất ngủ mức lâm sàng (vừa)', 'mod', 'Chỉ định liệu pháp nhận thức – hành vi cho mất ngủ (CBT-I).'],
      [28, 'Mất ngủ mức nặng', 'severe', 'Cần can thiệp chuyên khoa giấc ngủ; rà soát thuốc và đau ban đêm.']
    ])
  });

  /* --- PSQI --- */
  S({
    id: 'psqi', short: 'PSQI', name: 'Chỉ số chất lượng giấc ngủ Pittsburgh (PSQI)',
    domain: 'body', max: 21, reverse: true, minutes: '10 phút', home: 'psych',
    ref: 'Buysse DJ et al. Psychiatry Res. 1989;28:193-213',
    note: 'Bảy thành phần, mỗi thành phần 0–3, tổng 0–21. Tổng >5 = chất lượng giấc ngủ KÉM. Nhập thêm số liệu thô để hệ thống tự tính hiệu quả giấc ngủ.',
    mcid: 'Thay đổi có ý nghĩa ≈ 3 điểm',
    groups: ALL,
    sections: [
      sec('raw', 'Số liệu thô trong 1 tháng qua (không tính vào tổng điểm)', [
        num('bedtime', 'Thường lên giường lúc mấy giờ (dạng 22.5 = 22h30)', 'giờ', { min: 0, max: 24, step: 0.25 }),
        num('latency', 'Thời gian nằm bao lâu mới ngủ được', 'phút', { min: 0, max: 600 }),
        num('waketime', 'Thường thức dậy lúc mấy giờ', 'giờ', { min: 0, max: 24, step: 0.25 }),
        num('hours', 'Số giờ NGỦ THỰC SỰ mỗi đêm', 'giờ', { min: 0, max: 16, step: 0.25 }),
        num('inbed', 'Số giờ NẰM TRÊN GIƯỜNG mỗi đêm', 'giờ', { min: 0, max: 20, step: 0.25 })
      ]),
      sec('comp', 'Bảy thành phần PSQI (mỗi thành phần 0–3)', [
        it('c1', 'C1. Chất lượng giấc ngủ chủ quan', rng(3, { 0: 'Rất tốt', 1: 'Khá tốt', 2: 'Khá kém', 3: 'Rất kém' })),
        it('c2', 'C2. Thời gian vào giấc (latency)', rng(3, { 0: '≤15 phút', 1: '16–30 phút', 2: '31–60 phút', 3: '>60 phút' })),
        it('c3', 'C3. Thời lượng giấc ngủ', rng(3, { 0: '>7 giờ', 1: '6–7 giờ', 2: '5–6 giờ', 3: '<5 giờ' })),
        it('c4', 'C4. Hiệu quả giấc ngủ thường lệ (giờ ngủ / giờ nằm giường)', rng(3, { 0: '>85%', 1: '75–84%', 2: '65–74%', 3: '<65%' })),
        it('c5', 'C5. Rối loạn giấc ngủ (thức giấc, ngạt thở, ho, đau, nóng/lạnh, ác mộng…)', rng(3, { 0: 'Không có', 1: 'Nhẹ', 2: 'Vừa', 3: 'Nặng' })),
        it('c6', 'C6. Sử dụng thuốc ngủ', rng(3, { 0: 'Không dùng', 1: '<1 lần/tuần', 2: '1–2 lần/tuần', 3: '≥3 lần/tuần' })),
        it('c7', 'C7. Rối loạn chức năng ban ngày (buồn ngủ, giảm nhiệt tình)', rng(3, { 0: 'Không có', 1: 'Nhẹ', 2: 'Vừa', 3: 'Nặng' }))
      ])
    ],
    compute: function (v, raw) {
      var s = 0;
      ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'].forEach(function (k) {
        if (v['comp.' + k] !== undefined) s += Number(v['comp.' + k]);
      });
      var ex = {};
      var hours = raw['raw.hours'], inbed = raw['raw.inbed'];
      if (hours !== undefined && inbed !== undefined && Number(inbed) > 0) {
        ex['Hiệu quả giấc ngủ'] = Math.round(Number(hours) / Number(inbed) * 100) + '%';
      }
      if (hours !== undefined) ex['Thời lượng ngủ'] = Number(hours) + ' giờ/đêm';
      return { total: s, extra: ex };
    },
    interpret: band([
      [5, 'Chất lượng giấc ngủ TỐT (≤5 điểm)', 'good', ''],
      [10, 'Chất lượng giấc ngủ kém', 'mod', 'Tư vấn vệ sinh giấc ngủ, rà soát đau và thuốc dùng buổi tối.'],
      [15, 'Chất lượng giấc ngủ rất kém', 'severe', ''],
      [21, 'Rối loạn giấc ngủ nặng', 'severe', 'Cần khám chuyên khoa giấc ngủ.']
    ])
  });

  /* --- ESS --- */
  S({
    id: 'ess', short: 'ESS', name: 'Thang buồn ngủ ban ngày Epworth (Epworth Sleepiness Scale)',
    domain: 'body', max: 24, reverse: true, minutes: '3 phút', home: 'psych',
    ref: 'Johns MW. Sleep. 1991;14:540-5',
    note: 'Khả năng ngủ gật trong 8 tình huống thường ngày. Điểm >10 = buồn ngủ ban ngày quá mức.',
    groups: ALL,
    sections: [sec('main', 'Khả năng bạn ngủ gật (không chỉ là thấy mệt) trong các tình huống sau', [
      it('q1', '1. Ngồi đọc sách báo', rng(3, { 0: 'Không bao giờ', 1: 'Ít khả năng', 2: 'Khả năng vừa', 3: 'Khả năng cao' })),
      it('q2', '2. Xem tivi', rng(3, { 0: 'Không bao giờ', 3: 'Khả năng cao' })),
      it('q3', '3. Ngồi yên ở nơi công cộng (rạp hát, cuộc họp)', rng(3, { 0: 'Không bao giờ', 3: 'Khả năng cao' })),
      it('q4', '4. Ngồi trên ô tô làm hành khách liên tục 1 giờ', rng(3, { 0: 'Không bao giờ', 3: 'Khả năng cao' })),
      it('q5', '5. Nằm nghỉ buổi chiều khi hoàn cảnh cho phép', rng(3, { 0: 'Không bao giờ', 3: 'Khả năng cao' })),
      it('q6', '6. Ngồi nói chuyện với ai đó', rng(3, { 0: 'Không bao giờ', 3: 'Khả năng cao' })),
      it('q7', '7. Ngồi yên sau bữa trưa (không uống rượu bia)', rng(3, { 0: 'Không bao giờ', 3: 'Khả năng cao' })),
      it('q8', '8. Ngồi trong ô tô khi dừng vài phút lúc tắc đường', rng(3, { 0: 'Không bao giờ', 3: 'Khả năng cao' }))
    ])],
    interpret: band([
      [10, 'Mức buồn ngủ ban ngày bình thường', 'good', ''],
      [14, 'Buồn ngủ ban ngày quá mức mức nhẹ', 'mild', ''],
      [18, 'Buồn ngủ ban ngày quá mức mức vừa', 'mod', 'Sàng lọc ngừng thở khi ngủ (STOP-BANG), rà soát thuốc an thần.'],
      [24, 'Buồn ngủ ban ngày quá mức mức nặng', 'severe', 'Cần khám chuyên khoa giấc ngủ; lưu ý an toàn khi tập luyện.']
    ])
  });

  /* --- STOP-BANG --- */
  S({
    id: 'stopbang', short: 'STOP-BANG', name: 'Sàng lọc ngừng thở khi ngủ do tắc nghẽn (STOP-BANG)',
    domain: 'body', max: 8, reverse: true, minutes: '2 phút', home: 'psych',
    ref: 'Chung F et al. Anesthesiology. 2008;108:812-21',
    note: 'Tám câu Có/Không. ≥3 điểm: nguy cơ trung bình; ≥5 điểm: nguy cơ cao mắc hội chứng ngừng thở khi ngủ.',
    groups: ALL,
    sections: [sec('main', 'Tám yếu tố', [
      it('s', 'S – Ngáy to (to hơn tiếng nói chuyện, nghe được qua cửa đóng)', yn('Có (1)', 'Không (0)')),
      it('t', 'T – Thường xuyên mệt mỏi, uể oải, buồn ngủ ban ngày', yn('Có (1)', 'Không (0)')),
      it('o', 'O – Có người chứng kiến ngừng thở hoặc nghẹt thở khi ngủ', yn('Có (1)', 'Không (0)')),
      it('p', 'P – Có tăng huyết áp hoặc đang điều trị tăng huyết áp', yn('Có (1)', 'Không (0)')),
      it('b', 'B – Chỉ số khối cơ thể BMI > 35 kg/m²', yn('Có (1)', 'Không (0)')),
      it('a', 'A – Tuổi trên 50', yn('Có (1)', 'Không (0)')),
      it('n', 'N – Chu vi cổ > 40 cm', yn('Có (1)', 'Không (0)')),
      it('gd', 'G – Giới tính nam', yn('Có (1)', 'Không (0)'))
    ])],
    interpret: band([
      [2, 'Nguy cơ THẤP mắc ngừng thở khi ngủ', 'good', ''],
      [4, 'Nguy cơ TRUNG BÌNH (≥3 điểm)', 'mod', 'Cân nhắc đo đa ký giấc ngủ, đặc biệt ở bệnh nhân tim mạch – hô hấp.'],
      [8, 'Nguy cơ CAO (≥5 điểm)', 'severe', 'Chỉ định đo đa ký giấc ngủ; thận trọng khi dùng an thần và khi gây mê.']
    ])
  });

  /* --- FSS --- */
  S({
    id: 'fss', short: 'FSS', name: 'Thang mức độ mệt mỏi FSS (Fatigue Severity Scale)',
    domain: 'body', max: 63, min: 9, reverse: true, minutes: '3 phút', home: 'psych',
    ref: 'Krupp LB et al. Arch Neurol. 1989;46:1121-3',
    note: 'Chín mục, mỗi mục 1–7. Điểm trung bình ≥4 gợi ý mệt mỏi có ý nghĩa lâm sàng; ≥5 là mệt mỏi nặng. Rất phổ biến sau đột quỵ, ở bệnh tim mạch và hô hấp mạn.',
    groups: ALL,
    sections: [sec('main', 'Mức độ đồng ý với các phát biểu (1 = hoàn toàn không đồng ý → 7 = hoàn toàn đồng ý)', [
      it('q1', '1. Động lực của tôi giảm sút khi tôi mệt mỏi', fss),
      it('q2', '2. Vận động, tập luyện làm tôi mệt mỏi', fss),
      it('q3', '3. Tôi dễ bị mệt mỏi', fss),
      it('q4', '4. Mệt mỏi ảnh hưởng đến hoạt động thể chất của tôi', fss),
      it('q5', '5. Mệt mỏi thường xuyên gây ra vấn đề cho tôi', fss),
      it('q6', '6. Mệt mỏi khiến tôi không duy trì được hoạt động thể chất', fss),
      it('q7', '7. Mệt mỏi cản trở tôi thực hiện một số nhiệm vụ và trách nhiệm', fss),
      it('q8', '8. Mệt mỏi là một trong ba triệu chứng gây khó chịu nhất của tôi', fss),
      it('q9', '9. Mệt mỏi ảnh hưởng đến công việc, gia đình hoặc đời sống xã hội', fss)
    ])],
    compute: function (v) {
      var s = 0, n = 0;
      Object.keys(v).forEach(function (k) { s += Number(v[k]); n++; });
      if (!n) return { total: null };
      return { total: s, extra: { 'Điểm trung bình (1–7)': (Math.round(s / n * 100) / 100).toString().replace('.', ',') + ' (' + n + '/9 mục)' } };
    },
    interpret: band([
      [26, 'Không mệt mỏi đáng kể (trung bình <3)', 'good', ''],
      [35, 'Mệt mỏi mức ranh giới (trung bình 3–3,9)', 'mild', ''],
      [44, 'Mệt mỏi có ý nghĩa lâm sàng (trung bình ≥4)', 'mod', 'Điều chỉnh cường độ và phân bố buổi tập; tầm soát thiếu máu, trầm cảm, rối loạn giấc ngủ.'],
      [63, 'Mệt mỏi nặng (trung bình ≥5)', 'severe', 'Ưu tiên chiến lược bảo tồn năng lượng, tập ngắt quãng cường độ thấp.']
    ])
  });

  /* =======================================================================
   *  L3. TÂM THẦN – SẢNG – NGƯỜI CHĂM SÓC
   * ===================================================================== */

  /* --- CAM (sảng) --- */
  S({
    id: 'cam', short: 'CAM', name: 'Thang đánh giá lú lẫn CAM (Confusion Assessment Method) – sàng lọc sảng',
    domain: 'body', max: 1, reverse: true, minutes: '5 phút', home: 'psych',
    ref: 'Inouye SK et al. Ann Intern Med. 1990;113:941-8',
    note: 'Thuật toán chẩn đoán: DƯƠNG TÍNH khi có (đặc điểm 1 VÀ 2) VÀ (đặc điểm 3 HOẶC 4). Sảng rất thường gặp ở người cao tuổi nằm viện và làm sai lệch mọi kết quả lượng giá chức năng khác.',
    groups: ALL,
    sections: [sec('main', 'Bốn đặc điểm', [
      it('f1', 'Đặc điểm 1 – Khởi phát CẤP TÍNH và diễn biến DAO ĐỘNG trong ngày', yn('Có', 'Không')),
      it('f2', 'Đặc điểm 2 – RỐI LOẠN CHÚ Ý (khó tập trung, dễ bị phân tán, khó theo dõi câu chuyện)', yn('Có', 'Không')),
      it('f3', 'Đặc điểm 3 – TƯ DUY KHÔNG MẠCH LẠC (nói lan man, rời rạc, chuyển chủ đề vô lý)', yn('Có', 'Không')),
      it('f4', 'Đặc điểm 4 – THAY ĐỔI MỨC Ý THỨC (kích thích, ngủ gà, sững sờ, hôn mê)', yn('Có', 'Không'))
    ])],
    compute: function (v) {
      var f1 = Number(v['main.f1'] || 0), f2 = Number(v['main.f2'] || 0),
          f3 = Number(v['main.f3'] || 0), f4 = Number(v['main.f4'] || 0);
      var pos = (f1 === 1 && f2 === 1) && (f3 === 1 || f4 === 1);
      var n = 0;
      ['main.f1', 'main.f2', 'main.f3', 'main.f4'].forEach(function (k) { if (v[k] !== undefined) n++; });
      if (n < 4) return { total: null, extra: { 'Thuật toán CAM': 'Cần đánh giá đủ 4 đặc điểm' } };
      return {
        total: pos ? 1 : 0,
        extra: {
          'Thuật toán CAM': pos ? 'DƯƠNG TÍNH – nghi ngờ sảng' : 'Âm tính',
          'Số đặc điểm dương': (f1 + f2 + f3 + f4) + '/4'
        }
      };
    },
    interpret: band([
      [0, 'Âm tính với sảng', 'good', ''],
      [1, 'DƯƠNG TÍNH với sảng', 'severe', 'Tìm nguyên nhân (nhiễm trùng, thuốc, rối loạn điện giải, đau, bí tiểu). Hoãn các lượng giá nhận thức cho đến khi hết sảng.']
    ])
  });

  /* --- ZBI-12 --- */
  S({
    id: 'zbi12', short: 'ZBI-12', name: 'Thang gánh nặng người chăm sóc Zarit rút gọn (ZBI-12)',
    domain: 'participation', max: 48, reverse: true, minutes: '5 phút', home: 'psych',
    ref: 'Bédard M et al. Gerontologist. 2001;41:652-7',
    note: 'Do NGƯỜI CHĂM SÓC trả lời. Điểm ≥17 gợi ý gánh nặng cao — yếu tố dự báo mạnh việc bỏ dở chương trình phục hồi chức năng tại nhà.',
    groups: ALL,
    sections: [sec('main', 'Người chăm sóc trả lời: bạn có cảm thấy…', [
      it('q1', '1. Người thân yêu cầu giúp đỡ nhiều hơn mức họ thực sự cần?', zbi),
      it('q2', '2. Vì dành thời gian chăm sóc nên không còn đủ thời gian cho bản thân?', zbi),
      it('q3', '3. Căng thẳng giữa việc chăm sóc và các trách nhiệm khác (gia đình, công việc)?', zbi),
      it('q4', '4. Ngại ngùng, xấu hổ vì hành vi của người thân?', zbi),
      it('q5', '5. Tức giận khi ở cạnh người thân?', zbi),
      it('q6', '6. Việc chăm sóc ảnh hưởng xấu đến quan hệ với người khác trong gia đình?', zbi),
      it('q7', '7. Lo sợ về tương lai của người thân?', zbi),
      it('q8', '8. Người thân phụ thuộc hoàn toàn vào bạn?', zbi),
      it('q9', '9. Căng thẳng, mệt mỏi khi ở cạnh người thân?', zbi),
      it('q10', '10. Sức khỏe của bạn bị ảnh hưởng vì việc chăm sóc?', zbi),
      it('q11', '11. Mất đi sự riêng tư, tự do vì phải chăm sóc?', zbi),
      it('q12', '12. Đời sống xã hội của bạn bị ảnh hưởng?', zbi)
    ])],
    interpret: band([
      [10, 'Gánh nặng thấp', 'good', ''],
      [16, 'Gánh nặng nhẹ – vừa', 'mild', ''],
      [30, 'Gánh nặng CAO (≥17)', 'mod', 'Cần hỗ trợ người chăm sóc: huấn luyện kỹ thuật, dịch vụ chăm sóc thay phiên, tư vấn tâm lý.'],
      [48, 'Gánh nặng rất cao', 'severe', 'Nguy cơ cao bỏ dở chương trình PHCN tại nhà và kiệt sức người chăm sóc.']
    ])
  });

})(window);
