/* =========================================================================
 * PHCN-METRICS · scales-neuro.js
 * Đột quỵ não (vận động · ngôn ngữ–nuốt · nhận thức) + Tổn thương tủy sống
 * ========================================================================= */
(function (g) {
  'use strict';
  var h = g.PHCN.h, S = h.S, O = h.O, rng = h.rng, rngFrom = h.rngFrom, yn = h.yn,
      it = h.it, num = h.num, nums = h.nums, sec = h.sec, band = h.band;

  /* =======================================================================
   *  B. ĐỘT QUỴ – KHIẾM KHUYẾT VẬN ĐỘNG
   * ===================================================================== */

  /* --- B1. NIHSS --- */
  S({
    id: 'nihss', short: 'NIHSS', name: 'Thang đột quỵ NIH (National Institutes of Health Stroke Scale)',
    domain: 'body', max: 42, reverse: true, minutes: '10 phút',
    ref: 'Brott T et al. Stroke. 1989;20:864-70',
    note: 'Lượng giá mức độ nặng thiếu sót thần kinh. Điểm CÀNG CAO càng nặng. Là biến số nền quan trọng khi phân tầng bệnh nhân đột quỵ trong nghiên cứu.',
    groups: ['stroke_motor', 'stroke_lang', 'stroke_cog'],
    coreFor: ['stroke_motor'],
    sections: [
      sec('conscious', '1. Ý thức', [
        it('loc', '1a. Mức ý thức', O([0, '0 – Tỉnh táo, đáp ứng nhanh'], [1, '1 – Ngủ gà, đánh thức được bằng kích thích nhẹ'], [2, '2 – Lơ mơ, cần kích thích mạnh lặp lại'], [3, '3 – Hôn mê, chỉ đáp ứng phản xạ hoặc không đáp ứng'])),
        it('loc_q', '1b. Câu hỏi ý thức (tháng, tuổi)', O([0, '0 – Trả lời đúng cả 2'], [1, '1 – Đúng 1 câu'], [2, '2 – Sai cả 2'])),
        it('loc_c', '1c. Mệnh lệnh (nhắm/mở mắt, nắm/mở bàn tay)', O([0, '0 – Thực hiện đúng cả 2'], [1, '1 – Đúng 1 lệnh'], [2, '2 – Không thực hiện được lệnh nào']))
      ]),
      sec('cranial', '2–4. Thần kinh sọ', [
        it('gaze', '2. Vận nhãn ngang', O([0, '0 – Bình thường'], [1, '1 – Liệt vận nhãn một phần'], [2, '2 – Lệch mắt cưỡng bức / liệt vận nhãn hoàn toàn'])),
        it('vf', '3. Thị trường', O([0, '0 – Không mất thị trường'], [1, '1 – Bán manh một phần'], [2, '2 – Bán manh hoàn toàn'], [3, '3 – Bán manh hai bên (mù vỏ não)'])),
        it('facial', '4. Liệt mặt', O([0, '0 – Bình thường'], [1, '1 – Liệt nhẹ (mờ rãnh mũi má, cân xứng khi cười)'], [2, '2 – Liệt một phần (liệt rõ nửa mặt dưới)'], [3, '3 – Liệt hoàn toàn một hoặc hai bên']))
      ]),
      sec('motor', '5–7. Vận động & thất điều', [
        it('arm_l', '5a. Vận động tay TRÁI (giữ 90°/45° trong 10 giây)', O([0, '0 – Không rơi'], [1, '1 – Rơi xuống trước 10 giây nhưng không chạm giường'], [2, '2 – Có kháng trọng lực nhưng rơi chạm giường'], [3, '3 – Không kháng được trọng lực'], [4, '4 – Không có vận động'])),
        it('arm_r', '5b. Vận động tay PHẢI', O([0, '0 – Không rơi'], [1, '1 – Rơi trước 10 giây, không chạm giường'], [2, '2 – Rơi chạm giường'], [3, '3 – Không kháng được trọng lực'], [4, '4 – Không có vận động'])),
        it('leg_l', '6a. Vận động chân TRÁI (giữ 30° trong 5 giây)', O([0, '0 – Không rơi'], [1, '1 – Rơi trước 5 giây, không chạm giường'], [2, '2 – Rơi chạm giường'], [3, '3 – Không kháng được trọng lực'], [4, '4 – Không có vận động'])),
        it('leg_r', '6b. Vận động chân PHẢI', O([0, '0 – Không rơi'], [1, '1 – Rơi trước 5 giây, không chạm giường'], [2, '2 – Rơi chạm giường'], [3, '3 – Không kháng được trọng lực'], [4, '4 – Không có vận động'])),
        it('ataxia', '7. Thất điều chi', O([0, '0 – Không có'], [1, '1 – Có ở 1 chi'], [2, '2 – Có ở ≥2 chi']))
      ]),
      sec('sensory', '8–11. Cảm giác, ngôn ngữ, chú ý', [
        it('sensory', '8. Cảm giác', O([0, '0 – Bình thường'], [1, '1 – Giảm nhẹ–vừa'], [2, '2 – Mất cảm giác nặng hoặc hoàn toàn'])),
        it('language', '9. Ngôn ngữ (thất ngôn)', O([0, '0 – Không thất ngôn'], [1, '1 – Thất ngôn nhẹ–vừa'], [2, '2 – Thất ngôn nặng'], [3, '3 – Câm lặng / thất ngôn toàn bộ'])),
        it('dysarthria', '10. Nói khó (dysarthria)', O([0, '0 – Bình thường'], [1, '1 – Nhẹ–vừa, vẫn hiểu được'], [2, '2 – Nặng, không hiểu được hoặc câm'])),
        it('neglect', '11. Mất chú ý / lãng quên nửa không gian', O([0, '0 – Không có'], [1, '1 – Mất chú ý một giác quan'], [2, '2 – Mất chú ý nhiều giác quan / lãng quên nửa người nặng']))
      ])
    ],
    interpret: band([
      [0, 'Không có thiếu sót thần kinh', 'good', ''],
      [4, 'Đột quỵ nhẹ', 'mild', ''],
      [15, 'Đột quỵ mức độ vừa', 'mod', ''],
      [20, 'Đột quỵ vừa – nặng', 'severe', ''],
      [42, 'Đột quỵ nặng', 'severe', 'Tiên lượng phục hồi chức năng dè dặt; cần chương trình PHCN tích cực và dài hạn.']
    ])
  });

  /* --- B2. Fugl-Meyer chi trên --- */
  S({
    id: 'fma_ue', mcidVal: 5.25, short: 'FMA-UE', name: 'Fugl-Meyer chi trên (Fugl-Meyer Assessment – Upper Extremity)',
    domain: 'body', max: 66, minutes: '20–30 phút',
    ref: 'Fugl-Meyer AR et al. Scand J Rehabil Med. 1975;7:13-31',
    note: 'Tiêu chuẩn vàng lượng giá phục hồi vận động chi trên sau đột quỵ. Nhập điểm theo từng phân mục (mỗi item gốc chấm 0–1–2).',
    mcid: 'MCID ≈ 5,25 điểm (giai đoạn bán cấp); MDC ≈ 5,2',
    groups: ['stroke_motor'],
    coreFor: ['stroke_motor'],
    subscales: [
      { id: 'motor', name: 'Vận động chi trên (A–D)', items: ['motor.a', 'motor.b', 'motor.c', 'motor.d'], max: 66 }
    ],
    sections: [
      sec('motor', 'Chức năng vận động (tổng 66 điểm)', [
        nums('a', 'A. Vai / khuỷu / cẳng tay – phản xạ, đồng vận gấp–duỗi, vận động phối hợp', 36),
        nums('b', 'B. Cổ tay – ổn định và gấp/duỗi luân phiên', 10),
        nums('c', 'C. Bàn tay – các kiểu cầm nắm (khối, trụ, gọng kìm, cầu)', 14),
        nums('d', 'D. Phối hợp / tốc độ – test ngón tay – mũi', 6)
      ]),
      sec('extra', 'Các phân mục bổ sung (không tính vào tổng 66)', [
        num('sensation', 'Cảm giác chi trên (0–12)', 'điểm', { min: 0, max: 12 }),
        num('rom', 'Tầm vận động thụ động (0–24)', 'điểm', { min: 0, max: 24 }),
        num('painj', 'Đau khớp khi vận động (0–24, 24 = không đau)', 'điểm', { min: 0, max: 24 })
      ])
    ],
    interpret: band([
      [22, 'Suy giảm vận động chi trên NẶNG', 'severe', 'Ưu tiên dự phòng bán trật vai, co rút; kỹ thuật hỗ trợ, kích thích điện chức năng.'],
      [31, 'Suy giảm vận động chi trên vừa–nặng', 'severe', ''],
      [47, 'Suy giảm vận động chi trên VỪA', 'mod', 'Phù hợp liệu pháp vận động cưỡng bức bên liệt (CIMT) có điều chỉnh.'],
      [58, 'Suy giảm NHẸ', 'mild', 'Ứng viên tốt cho CIMT, tập nhiệm vụ định hướng.'],
      [66, 'Chức năng gần bình thường', 'good', '']
    ])
  });

  /* --- B3. Fugl-Meyer chi dưới --- */
  S({
    id: 'fma_le', mcidVal: 6, short: 'FMA-LE', name: 'Fugl-Meyer chi dưới (Fugl-Meyer Assessment – Lower Extremity)',
    domain: 'body', max: 34, minutes: '15 phút',
    ref: 'Fugl-Meyer AR et al. Scand J Rehabil Med. 1975',
    note: 'Chức năng vận động chi dưới: phản xạ, đồng vận, vận động phối hợp và tốc độ.',
    mcid: 'MDC ≈ 6 điểm',
    groups: ['stroke_motor'],
    coreFor: ['stroke_motor'],
    sections: [
      sec('motor', 'Chức năng vận động (tổng 34 điểm)', [
        nums('e', 'E. Chi dưới – phản xạ, đồng vận gấp–duỗi, vận động phối hợp (nằm, ngồi, đứng)', 28),
        nums('f', 'F. Phối hợp / tốc độ – test gót chân – xương bánh chè', 6)
      ]),
      sec('extra', 'Bổ sung (không tính vào tổng 34)', [
        num('sensation', 'Cảm giác chi dưới (0–12)', 'điểm', { min: 0, max: 12 }),
        num('rom', 'Tầm vận động thụ động chi dưới (0–20)', 'điểm', { min: 0, max: 20 })
      ])
    ],
    interpret: band([
      [14, 'Suy giảm vận động chi dưới nặng', 'severe', ''],
      [22, 'Suy giảm vừa', 'mod', ''],
      [28, 'Suy giảm nhẹ', 'mild', ''],
      [34, 'Chức năng gần bình thường', 'good', '']
    ])
  });

  /* --- B4. Motricity Index --- */
  var miOpts = O([0, '0 – Không có co cơ'], [9, '9 – Có co cơ sờ thấy nhưng không có cử động'],
    [14, '14 – Có cử động nhưng không thắng được trọng lực'], [19, '19 – Cử động thắng trọng lực'],
    [25, '25 – Cử động kháng lại lực cản nhưng yếu hơn bên lành'], [33, '33 – Sức cơ bình thường']);
  S({
    id: 'motricity', short: 'MI', name: 'Chỉ số vận động (Motricity Index)',
    domain: 'body', max: 200, minutes: '10 phút',
    ref: 'Demeurisse G et al. Eur Neurol. 1980;19:382-9',
    note: 'Đánh giá sức cơ tự chủ bên liệt. Điểm tay = tổng 3 động tác + 1; điểm chân = tổng 3 động tác + 1 (mỗi chi tối đa 100).',
    groups: ['stroke_motor', 'sci'],
    sections: [
      sec('arm', 'Chi trên bên liệt', [
        it('pinch', 'Cầm gọng kìm (khối 2,5 cm giữa ngón cái và ngón trỏ)', miOpts),
        it('elbow', 'Gấp khuỷu (từ 90°, gấp chủ động)', miOpts),
        it('shoulder', 'Dạng vai', miOpts)
      ]),
      sec('leg', 'Chi dưới bên liệt', [
        it('ankle', 'Gấp mu bàn chân', miOpts),
        it('knee', 'Duỗi gối', miOpts),
        it('hip', 'Gấp háng', miOpts)
      ])
    ],
    compute: function (v) {
      function part(keys) {
        var s = 0, any = false;
        keys.forEach(function (k) { if (v[k] !== undefined && v[k] !== '') { s += Number(v[k]); any = true; } });
        return any ? Math.min(100, s + 1) : 0;
      }
      var arm = part(['arm.pinch', 'arm.elbow', 'arm.shoulder']);
      var leg = part(['leg.ankle', 'leg.knee', 'leg.hip']);
      return { total: arm + leg, extra: { 'Điểm chi trên': arm + '/100', 'Điểm chi dưới': leg + '/100', 'Chỉ số bên liệt (trung bình)': Math.round((arm + leg) / 2) + '/100' } };
    },
    interpret: band([
      [50, 'Yếu cơ rất nặng', 'severe', ''],
      [100, 'Yếu cơ nặng', 'severe', ''],
      [150, 'Yếu cơ vừa', 'mod', ''],
      [190, 'Yếu cơ nhẹ', 'mild', ''],
      [200, 'Sức cơ gần bình thường', 'good', '']
    ])
  });

  /* --- B5. Trunk Control Test --- */
  var tctOpts = O([0, '0 – Không thực hiện được nếu không có trợ giúp'], [12, '12 – Thực hiện được nhưng theo cách bất thường (kéo, vịn)'], [25, '25 – Thực hiện bình thường']);
  S({
    id: 'tct', short: 'TCT', name: 'Test kiểm soát thân mình (Trunk Control Test)',
    domain: 'body', max: 100, minutes: '5 phút',
    ref: 'Collin C, Wade D. J Neurol Neurosurg Psychiatry. 1990;53:576-9',
    note: 'Yếu tố dự báo mạnh khả năng đi lại độc lập sau đột quỵ.',
    groups: ['stroke_motor'],
    coreFor: ['stroke_motor'],
    sections: [sec('main', 'Bốn động tác', [
      it('roll_weak', '1. Lăn sang bên LIỆT', tctOpts),
      it('roll_strong', '2. Lăn sang bên LÀNH', tctOpts),
      it('sit_up', '3. Ngồi dậy từ tư thế nằm', tctOpts),
      it('balance', '4. Ngồi thăng bằng ở mép giường 30 giây', tctOpts)
    ])],
    interpret: band([
      [24, 'Mất kiểm soát thân mình nặng', 'severe', 'Tiên lượng đi lại độc lập kém; ưu tiên tập kiểm soát thân mình.'],
      [49, 'Kiểm soát thân mình kém', 'severe', ''],
      [74, 'Kiểm soát thân mình trung bình', 'mod', ''],
      [99, 'Kiểm soát thân mình khá', 'mild', ''],
      [100, 'Kiểm soát thân mình bình thường', 'good', '']
    ])
  });

  /* --- B6. ARAT --- */
  S({
    id: 'arat', mcidVal: 5.7, short: 'ARAT', name: 'Test hoạt động chi trên (Action Research Arm Test)',
    domain: 'activity', max: 57, minutes: '10–15 phút',
    ref: 'Lyle RC. Int J Rehabil Res. 1981;4:483-92',
    note: '19 nhiệm vụ × 0–3 điểm, chia 4 phân mục. Nhập điểm từng phân mục.',
    mcid: 'MCID ≈ 5,7 điểm (đột quỵ)',
    groups: ['stroke_motor'],
    subscales: [{ id: 'all', name: 'Tổng ARAT', items: ['main.grasp', 'main.grip', 'main.pinch', 'main.gross'], max: 57 }],
    sections: [sec('main', 'Bốn phân mục (bên liệt)', [
      nums('grasp', 'Cầm nắm (Grasp) – 6 nhiệm vụ', 18),
      nums('grip', 'Nắm giữ (Grip) – 4 nhiệm vụ', 12),
      nums('pinch', 'Kẹp ngón (Pinch) – 6 nhiệm vụ', 18),
      nums('gross', 'Vận động thô (Gross movement) – 3 nhiệm vụ', 9)
    ])],
    interpret: band([
      [10, 'Chức năng chi trên rất kém', 'severe', ''],
      [21, 'Chức năng kém', 'severe', ''],
      [42, 'Chức năng trung bình', 'mod', ''],
      [53, 'Chức năng khá', 'mild', ''],
      [57, 'Chức năng gần bình thường', 'good', '']
    ])
  });

  /* --- B7. Brunnstrom --- */
  var brOpts = O([1, 'I – Liệt mềm, không có vận động chủ ý'], [2, 'II – Bắt đầu xuất hiện đồng vận, co cứng nhẹ'],
    [3, 'III – Đồng vận chủ ý hoàn toàn, co cứng đạt đỉnh'], [4, 'IV – Bắt đầu tách khỏi đồng vận, co cứng giảm'],
    [5, 'V – Vận động độc lập khỏi đồng vận'], [6, 'VI – Vận động phối hợp gần bình thường, co cứng biến mất']);
  S({
    id: 'brunnstrom', short: 'Brunnstrom', name: 'Giai đoạn phục hồi vận động Brunnstrom',
    domain: 'body', max: 18, min: 3, minutes: '5 phút',
    ref: 'Brunnstrom S. Movement Therapy in Hemiplegia. 1970',
    note: 'Phân giai đoạn phục hồi vận động (I–VI) cho tay, bàn tay và chân bên liệt.',
    groups: ['stroke_motor'],
    coreFor: ['stroke_motor'],
    sections: [sec('main', 'Giai đoạn theo từng phần chi bên liệt', [
      it('arm', 'Chi trên (vai – khuỷu)', brOpts),
      it('hand', 'Bàn tay', brOpts),
      it('leg', 'Chi dưới', brOpts)
    ])],
    interpret: band([
      [6, 'Giai đoạn sớm (liệt mềm / bắt đầu đồng vận)', 'severe', ''],
      [11, 'Giai đoạn trung gian (đồng vận – co cứng)', 'mod', ''],
      [15, 'Giai đoạn phục hồi tốt', 'mild', ''],
      [18, 'Phục hồi gần hoàn toàn', 'good', '']
    ])
  });

  /* --- B8. HMS — thang vận động & khéo léo bàn tay --- */
  S({
    id: 'hms', mcidVal: 1, short: 'HMS', name: 'Thang vận động và khéo léo bàn tay (Hand Movement Scale)',
    domain: 'body', max: 6, min: 1, minutes: '3–5 phút',
    ref: 'Hand Movement Scale — phân bậc phục hồi vận động bàn tay sau đột quỵ (tham khảo PMC5426273)',
    note: 'Sáu bậc mô tả tiến trình phục hồi vận động TINH của bàn tay bên liệt: từ liệt mềm hoàn toàn → cử động đồng vận → tách rời từng ngón → đối chiếu ngón cái. Đánh giá bằng quan sát trực tiếp cử động CHỦ ĐỘNG, không tính cử động thụ động hay do người khác trợ giúp.',
    mcid: 'Tăng ≥1 bậc được xem là cải thiện có ý nghĩa lâm sàng',
    groups: ['stroke_motor', 'sci'],
    coreFor: ['stroke_motor'],
    sections: [
      sec('main', 'Bậc vận động bàn tay bên liệt', [
        it('hms', 'Chọn bậc cao nhất mà người bệnh thực hiện được', O(
          [1, 'Bậc 1 – Không có cử động chủ động nào ở các ngón tay'],
          [2, 'Bậc 2 – Chỉ có cử động co (gấp) các ngón tay theo dạng đồng vận'],
          [3, 'Bậc 3 – Co (gấp) và duỗi các ngón tay theo dạng đồng vận, chưa có cử động tách rời'],
          [4, 'Bậc 4 – Duỗi riêng được ngón trỏ trong khi các ngón khác vẫn giữ tư thế co'],
          [5, 'Bậc 5 – Đưa được ngón cái lại gần đối chiếu với đầu ngón trỏ'],
          [6, 'Bậc 6 – Đối chiếu ngón cái với tất cả các đầu ngón tay khác (vận động tinh hoàn chỉnh)']
        ), { fig: 'hand' })
      ]),
      sec('ctx', 'Bối cảnh đánh giá (không tính vào tổng điểm)', [
        it('side', 'Bàn tay được đánh giá', O([0, 'Bên phải'], [0, 'Bên trái']), { text: true, sum: false }),
        it('dom', 'Có phải tay thuận không?', O([0, 'Tay thuận'], [0, 'Tay không thuận']), { text: true, sum: false }),
        it('tone', 'Ảnh hưởng của co cứng khi thực hiện', O([0, 'Không đáng kể'], [0, 'Hạn chế nhẹ'], [0, 'Hạn chế rõ rệt']), { text: true, sum: false })
      ])
    ],
    interpret: band([
      [1, 'Liệt bàn tay hoàn toàn (bậc 1)', 'severe', 'Ưu tiên dự phòng co rút, đặt tư thế, vận động thụ động, kích thích điện chức năng.'],
      [2, 'Chỉ có cử động gấp đồng vận (bậc 2)', 'severe', 'Tập khởi động cử động chủ động có trợ giúp, ức chế mẫu đồng vận gấp.'],
      [3, 'Cử động đồng vận gấp – duỗi (bậc 3)', 'mod', 'Bắt đầu tập tách rời cử động từng ngón; cân nhắc liệu pháp gương, tập nhiệm vụ định hướng.'],
      [4, 'Bắt đầu tách rời từng ngón (bậc 4)', 'mod', 'Tập cầm nắm chức năng; đây là mốc tiên lượng phục hồi bàn tay thuận lợi.'],
      [5, 'Đối chiếu được ngón cái – ngón trỏ (bậc 5)', 'mild', 'Ứng viên tốt cho liệu pháp vận động cưỡng bức bên liệt (CIMT) và tập khéo léo.'],
      [6, 'Vận động tinh hoàn chỉnh (bậc 6)', 'good', 'Chuyển sang tập tốc độ, độ chính xác và hoạt động hai tay phối hợp.']
    ])
  });

  /* =======================================================================
   *  C. ĐỘT QUỴ – NGÔN NGỮ, LỜI NÓI & NUỐT
   * ===================================================================== */

  /* --- C1. WAB Aphasia Quotient --- */
  S({
    id: 'wab_aq', short: 'WAB-AQ', name: 'Chỉ số thất ngôn WAB (Western Aphasia Battery – Aphasia Quotient)',
    domain: 'body', max: 100, minutes: '30–45 phút',
    ref: 'Kertesz A. Western Aphasia Battery. 1982',
    note: 'AQ = (Lưu loát + Thông tin + Hiểu/20 + Nhắc lại/10 + Gọi tên/10) × 2. AQ <93,8 gợi ý thất ngôn.',
    groups: ['stroke_lang'],
    coreFor: ['stroke_lang'],
    sections: [sec('main', 'Điểm thô từng phân mục', [
      num('info', 'Nội dung thông tin trong lời nói tự phát (0–10)', 'điểm', { min: 0, max: 10 }),
      num('fluency', 'Độ lưu loát, ngữ pháp, hoán vị âm (0–10)', 'điểm', { min: 0, max: 10 }),
      num('compre', 'Hiểu lời nói – điểm thô (0–200)', 'điểm', { min: 0, max: 200 }),
      num('repeat', 'Nhắc lại – điểm thô (0–100)', 'điểm', { min: 0, max: 100 }),
      num('naming', 'Gọi tên & tìm từ – điểm thô (0–100)', 'điểm', { min: 0, max: 100 })
    ])],
    compute: function (v, raw) {
      function n(k) { var x = raw['main.' + k]; return (x === undefined || x === '') ? 0 : Number(x); }
      var aq = (n('info') + n('fluency') + n('compre') / 20 + n('repeat') / 10 + n('naming') / 10) * 2;
      aq = Math.round(aq * 10) / 10;
      return { total: aq, extra: { 'AQ (0–100)': aq.toFixed(1) } };
    },
    interpret: band([
      [25, 'Thất ngôn rất nặng', 'severe', 'Ưu tiên giao tiếp thay thế – tăng cường (AAC).'],
      [50, 'Thất ngôn nặng', 'severe', ''],
      [75, 'Thất ngôn vừa', 'mod', ''],
      [93.7, 'Thất ngôn nhẹ', 'mild', ''],
      [100, 'Không thất ngôn (AQ ≥93,8)', 'good', '']
    ])
  });

  /* --- C2. Mức độ thất ngôn BDAE + gọi tên --- */
  S({
    id: 'aphasia_sev', short: 'BDAE-SRS', name: 'Mức độ nặng thất ngôn BDAE & Test gọi tên Boston',
    domain: 'body', max: 5, minutes: '10 phút',
    ref: 'Goodglass H, Kaplan E. BDAE. 1983; Kaplan et al. BNT. 1983',
    note: 'Thang mức độ nặng 0–5 của BDAE (điểm cao = tốt) kèm điểm gọi tên Boston (0–60).',
    groups: ['stroke_lang'],
    coreFor: ['stroke_lang'],
    sections: [
      sec('sev', 'Thang mức độ nặng thất ngôn (BDAE Severity Rating Scale)', [
        it('sev', 'Mức độ', O(
          [0, '0 – Không có lời nói hữu dụng hoặc không hiểu lời nói'],
          [1, '1 – Giao tiếp hoàn toàn nhờ người nghe suy đoán, phạm vi thông tin rất hạn chế'],
          [2, '2 – Có thể trao đổi về chủ đề quen thuộc với sự trợ giúp của người nghe'],
          [3, '3 – Trao đổi được hầu hết vấn đề thường ngày, người nghe ít phải trợ giúp'],
          [4, '4 – Mất lưu loát hoặc hiểu ít, nhưng nội dung không bị hạn chế đáng kể'],
          [5, '5 – Khó khăn tối thiểu, chỉ bản thân bệnh nhân nhận thấy']
        ))
      ]),
      sec('bnt', 'Test gọi tên Boston (Boston Naming Test)', [
        num('bnt', 'Số hình gọi tên đúng (không gợi ý)', '/60', { min: 0, max: 60 }),
        num('bnt_cue', 'Số hình đúng sau gợi ý âm vị', '/60', { min: 0, max: 60 })
      ]),
      sec('type', 'Phân loại thể thất ngôn', [
        it('type', 'Thể thất ngôn', O([0, 'Không thất ngôn'], [0, 'Broca (không lưu loát)'], [0, 'Wernicke (lưu loát)'], [0, 'Dẫn truyền'], [0, 'Toàn bộ'], [0, 'Xuyên vỏ vận động'], [0, 'Xuyên vỏ cảm giác'], [0, 'Quên từ (anomic)']), { text: true, sum: false })
      ])
    ],
    interpret: band([
      [0, 'Thất ngôn toàn bộ / không giao tiếp bằng lời', 'severe', ''],
      [1, 'Thất ngôn rất nặng', 'severe', ''],
      [2, 'Thất ngôn nặng', 'severe', ''],
      [3, 'Thất ngôn vừa', 'mod', ''],
      [4, 'Thất ngôn nhẹ', 'mild', ''],
      [5, 'Khiếm khuyết ngôn ngữ tối thiểu', 'good', '']
    ])
  });

  /* --- C3. Nói khó --- */
  S({
    id: 'dysarthria', short: 'DYS', name: 'Lượng giá nói khó (Dysarthria) & độ dễ hiểu lời nói',
    domain: 'body', max: 20, minutes: '10 phút',
    ref: 'Enderby P. Frenchay Dysarthria Assessment. 1983 (rút gọn)',
    note: 'Chấm 0 (nặng nhất) → 4 (bình thường) cho 5 hệ thống phát âm. Điểm cao = tốt.',
    groups: ['stroke_lang'],
    sections: [
      sec('sys', 'Hệ thống phát âm (0 = mất chức năng → 4 = bình thường)', [
        it('resp', 'Hô hấp (kiểm soát hơi thở khi nói)', rng(4)),
        it('phon', 'Phát thanh (chất giọng, cường độ)', rng(4)),
        it('reson', 'Cộng hưởng (giọng mũi)', rng(4)),
        it('artic', 'Cấu âm (môi, lưỡi, hàm)', rng(4)),
        it('prosody', 'Ngữ điệu – nhịp điệu', rng(4))
      ]),
      sec('intel', 'Độ dễ hiểu lời nói', [
        num('word', 'Độ dễ hiểu ở mức TỪ đơn', '%', { min: 0, max: 100 }),
        num('sentence', 'Độ dễ hiểu ở mức CÂU', '%', { min: 0, max: 100 }),
        it('grade', 'Mức độ nói khó tổng thể', O([0, 'Không có'], [0, 'Nhẹ'], [0, 'Vừa'], [0, 'Nặng'], [0, 'Câm (anarthria)']), { text: true, sum: false })
      ])
    ],
    interpret: band([
      [5, 'Nói khó nặng – lời nói không hiểu được', 'severe', ''],
      [11, 'Nói khó vừa', 'mod', ''],
      [17, 'Nói khó nhẹ', 'mild', ''],
      [20, 'Chức năng phát âm bình thường', 'good', '']
    ])
  });

  /* --- C4. GUSS --- */
  S({
    id: 'guss', short: 'GUSS', name: 'Sàng lọc nuốt Gugging (Gugging Swallowing Screen)',
    domain: 'body', max: 20, minutes: '10 phút',
    ref: 'Trapl M et al. Stroke. 2007;38:2948-52',
    note: 'Sàng lọc rối loạn nuốt sau đột quỵ theo 4 bước. Chỉ chuyển sang bước sau khi bước trước đạt điểm tối đa (5).',
    groups: ['stroke_lang', 'stroke_motor'],
    coreFor: ['stroke_lang'],
    sections: [
      sec('indirect', 'Bước 1 – Test nuốt gián tiếp (tối đa 5)', [
        it('vigil', 'Tỉnh táo, duy trì chú ý ≥15 phút', yn('Có (1)', 'Không (0)')),
        it('cough', 'Ho / hắng giọng chủ động (2 lần)', yn('Có (1)', 'Không (0)')),
        it('saliva', 'Nuốt nước bọt: thực hiện được', yn('Có (1)', 'Không (0)')),
        it('drool', 'Không chảy nước dãi', yn('Không chảy (1)', 'Có chảy (0)')),
        it('voice', 'Không thay đổi giọng (ướt, khàn)', yn('Bình thường (1)', 'Thay đổi (0)'))
      ]),
      sec('semi', 'Bước 2 – Thức ăn đặc sệt (tối đa 5)', [
        it('swal', 'Nuốt', O([0, '0 – Không nuốt được'], [1, '1 – Nuốt chậm (>2 giây)'], [2, '2 – Nuốt thành công'])),
        it('cough', 'Ho (trước, trong, sau nuốt tới 3 phút)', yn('Không ho (1)', 'Có ho (0)')),
        it('drool', 'Chảy nước dãi', yn('Không (1)', 'Có (0)')),
        it('voice', 'Thay đổi giọng', yn('Không (1)', 'Có (0)'))
      ]),
      sec('liquid', 'Bước 3 – Chất lỏng (tối đa 5)', [
        it('swal', 'Nuốt', O([0, '0 – Không nuốt được'], [1, '1 – Nuốt chậm'], [2, '2 – Nuốt thành công'])),
        it('cough', 'Ho', yn('Không (1)', 'Có (0)')),
        it('drool', 'Chảy nước dãi', yn('Không (1)', 'Có (0)')),
        it('voice', 'Thay đổi giọng', yn('Không (1)', 'Có (0)'))
      ]),
      sec('solid', 'Bước 4 – Thức ăn đặc (tối đa 5)', [
        it('swal', 'Nuốt', O([0, '0 – Không nuốt được'], [1, '1 – Nuốt chậm (>10 giây)'], [2, '2 – Nuốt thành công'])),
        it('cough', 'Ho', yn('Không (1)', 'Có (0)')),
        it('drool', 'Chảy nước dãi', yn('Không (1)', 'Có (0)')),
        it('voice', 'Thay đổi giọng', yn('Không (1)', 'Có (0)'))
      ])
    ],
    interpret: band([
      [9, 'Rối loạn nuốt NẶNG – nguy cơ hít sặc cao', 'severe', 'Nhịn ăn đường miệng (NPO), đặt sonde dạ dày, hội chẩn chuyên khoa nuốt, nội soi/VFSS.'],
      [14, 'Rối loạn nuốt vừa – nguy cơ hít sặc', 'mod', 'Chế độ ăn đặc sệt, không dùng chất lỏng loãng, cần đánh giá chuyên sâu.'],
      [19, 'Rối loạn nuốt nhẹ – nguy cơ hít sặc thấp', 'mild', 'Ăn thức ăn mềm/đặc sệt, chất lỏng cần làm đặc; theo dõi sát.'],
      [20, 'Chức năng nuốt bình thường', 'good', 'Có thể ăn uống đường miệng bình thường.']
    ])
  });

  /* --- C5. FOIS --- */
  S({
    id: 'fois', short: 'FOIS', name: 'Thang mức độ ăn uống đường miệng (Functional Oral Intake Scale)',
    domain: 'activity', max: 7, minutes: '2 phút',
    ref: 'Crary MA et al. Arch Phys Med Rehabil. 2005;86:1516-20',
    note: 'Phân loại mức độ ăn uống đường miệng thực tế của bệnh nhân.',
    groups: ['stroke_lang', 'stroke_motor'],
    coreFor: ['stroke_lang'],
    sections: [sec('main', 'Mức độ', [
      it('fois', 'Chọn mức', O(
        [1, '1 – Không ăn uống đường miệng'],
        [2, '2 – Phụ thuộc ống nuôi, ăn đường miệng tối thiểu'],
        [3, '3 – Phụ thuộc ống nuôi, ăn đường miệng đều đặn'],
        [4, '4 – Ăn đường miệng hoàn toàn với MỘT dạng thức ăn duy nhất'],
        [5, '5 – Ăn đường miệng nhiều dạng thức ăn nhưng cần chế biến đặc biệt'],
        [6, '6 – Ăn đường miệng hoàn toàn, không cần chế biến đặc biệt nhưng phải kiêng một số món'],
        [7, '7 – Ăn đường miệng hoàn toàn, không hạn chế']
      ))
    ])],
    interpret: band([
      [1, 'Không ăn được đường miệng', 'severe', ''],
      [3, 'Phụ thuộc ống nuôi ăn', 'severe', ''],
      [5, 'Ăn đường miệng có hạn chế', 'mod', ''],
      [6, 'Ăn đường miệng gần bình thường', 'mild', ''],
      [7, 'Ăn uống bình thường', 'good', '']
    ])
  });

  /* =======================================================================
   *  D. ĐỘT QUỴ – NHẬN THỨC & TÂM LÝ
   * ===================================================================== */

  /* --- D1. MMSE --- */
  S({
    id: 'mmse', short: 'MMSE', name: 'Đánh giá trạng thái tâm thần tối thiểu (Mini-Mental State Examination)',
    domain: 'body', max: 30, minutes: '10 phút',
    ref: 'Folstein MF et al. J Psychiatr Res. 1975;12:189-98',
    note: 'Sàng lọc suy giảm nhận thức tổng quát. Cần hiệu chỉnh theo trình độ học vấn ở người Việt Nam.',
    groups: g.PHCN.allGroupIds(),
    coreFor: ['stroke_cog'],
    sections: [sec('main', 'Bảy lĩnh vực', [
      it('ori_time', '1. Định hướng thời gian (năm, mùa, tháng, ngày, thứ)', rng(5)),
      it('ori_place', '2. Định hướng không gian (tỉnh, huyện, bệnh viện, tầng, khoa)', rng(5)),
      it('reg', '3. Ghi nhận 3 từ', rng(3)),
      it('att', '4. Chú ý & tính toán (100 trừ 7 liên tiếp × 5 lần, hoặc đánh vần ngược)', rng(5)),
      it('recall', '5. Nhớ lại 3 từ', rng(3)),
      it('naming', '6a. Gọi tên 2 đồ vật (bút, đồng hồ)', rng(2)),
      it('repeat', '6b. Nhắc lại câu "không nếu, và, hoặc nhưng"', rng(1)),
      it('command', '6c. Làm theo mệnh lệnh 3 bước', rng(3)),
      it('read', '6d. Đọc và làm theo "Hãy nhắm mắt lại"', rng(1)),
      it('write', '6e. Viết một câu hoàn chỉnh', rng(1)),
      it('copy', '7. Vẽ lại hình hai ngũ giác lồng nhau', rng(1))
    ])],
    interpret: band([
      [9, 'Sa sút trí tuệ nặng', 'severe', ''],
      [17, 'Sa sút trí tuệ vừa', 'severe', ''],
      [23, 'Suy giảm nhận thức nhẹ – sa sút nhẹ', 'mod', 'Ngưỡng <24 điểm gợi ý suy giảm nhận thức.'],
      [26, 'Ranh giới / nghi ngờ suy giảm', 'mild', ''],
      [30, 'Nhận thức trong giới hạn bình thường', 'good', '']
    ])
  });

  /* --- D2. MoCA --- */
  S({
    id: 'moca', short: 'MoCA', name: 'Đánh giá nhận thức Montreal (Montreal Cognitive Assessment)',
    domain: 'body', max: 30, minutes: '10–15 phút',
    ref: 'Nasreddine ZS et al. J Am Geriatr Soc. 2005;53:695-9',
    note: 'Nhạy hơn MMSE với suy giảm nhận thức nhẹ và suy giảm nhận thức mạch máu. Cộng thêm 1 điểm nếu học vấn ≤12 năm (tổng không quá 30).',
    groups: g.PHCN.allGroupIds(),
    coreFor: ['stroke_cog'],
    sections: [sec('main', 'Bảy lĩnh vực', [
      it('vis', '1. Thị giác – không gian & điều hành (nối số-chữ, vẽ khối lập phương, vẽ đồng hồ)', rng(5)),
      it('naming', '2. Gọi tên 3 con vật', rng(3)),
      it('attention', '3. Chú ý (nhắc số xuôi/ngược, gõ chữ A, trừ 7 liên tiếp)', rng(6)),
      it('language', '4. Ngôn ngữ (nhắc lại 2 câu, lưu loát từ chữ cái)', rng(3)),
      it('abstract', '5. Trừu tượng hóa (tương đồng)', rng(2)),
      it('recall', '6. Nhớ lại có trì hoãn 5 từ (không gợi ý)', rng(5)),
      it('orient', '7. Định hướng (ngày, tháng, năm, thứ, nơi chốn, thành phố)', rng(6)),
      it('edu', 'Điểm cộng học vấn (≤12 năm)', yn('+1 điểm', 'Không cộng'))
    ])],
    compute: function (v) {
      var keys = ['vis', 'naming', 'attention', 'language', 'abstract', 'recall', 'orient', 'edu'], s = 0;
      keys.forEach(function (k) { var x = v['main.' + k]; if (x !== undefined && x !== '') s += Number(x); });
      return { total: Math.min(30, s) };
    },
    interpret: band([
      [9, 'Suy giảm nhận thức nặng', 'severe', ''],
      [17, 'Suy giảm nhận thức vừa', 'severe', ''],
      [22, 'Suy giảm nhận thức mức nhẹ–vừa', 'mod', ''],
      [25, 'Suy giảm nhận thức nhẹ (MCI)', 'mild', 'Ngưỡng <26 điểm gợi ý suy giảm nhận thức.'],
      [30, 'Nhận thức bình thường', 'good', '']
    ])
  });

  /* --- D3. Chú ý – điều hành – lãng quên nửa không gian --- */
  S({
    id: 'neuropsy', short: 'NPSY', name: 'Test thần kinh – tâm lý bổ sung (chú ý, điều hành, lãng quên nửa không gian)',
    domain: 'body', noTotal: true, minutes: '20 phút',
    ref: 'Reitan 1958 (TMT); Halligan 1991 (Star Cancellation); Shulman 1993 (CDT)',
    note: 'Các test bổ sung, ghi giá trị thô. Không cộng tổng.',
    groups: ['stroke_cog'],
    coreFor: ['stroke_cog'],
    sections: [
      sec('tmt', 'Trail Making Test', [
        num('a', 'TMT phần A (thời gian)', 'giây', { min: 0, max: 300, help: 'Bất thường khi >78 giây.' }),
        num('b', 'TMT phần B (thời gian)', 'giây', { min: 0, max: 600, help: 'Bất thường khi >273 giây.' }),
        num('err', 'Số lỗi phần B', 'lỗi', { min: 0, max: 50 })
      ]),
      sec('span', 'Trí nhớ làm việc', [
        num('fwd', 'Nhắc số xuôi (số chữ số tối đa)', 'chữ số', { min: 0, max: 12 }),
        num('bwd', 'Nhắc số ngược', 'chữ số', { min: 0, max: 12 }),
        num('fluency', 'Lưu loát ngôn ngữ (số con vật kể trong 1 phút)', 'từ', { min: 0, max: 80 })
      ]),
      sec('neglect', 'Lãng quên nửa không gian', [
        num('star', 'Star Cancellation – số sao gạch đúng', '/54', { min: 0, max: 54, help: '<44 gợi ý lãng quên nửa không gian.' }),
        num('star_l', 'Số sao gạch được bên TRÁI', '/27', { min: 0, max: 27 }),
        num('star_r', 'Số sao gạch được bên PHẢI', '/27', { min: 0, max: 27 }),
        num('bisect', 'Sai lệch test cắt đôi đoạn thẳng', 'mm', { min: -100, max: 100 })
      ]),
      sec('cdt', 'Vẽ đồng hồ (Clock Drawing Test – Shulman)', [
        it('cdt', 'Điểm CDT (0 = hoàn hảo → 5 = không nhận ra đồng hồ)', rng(5, { 0: 'hoàn hảo', 5: 'không vẽ được / không nhận ra đồng hồ' }), { sum: false })
      ])
    ]
  });

  /* --- D4. PHQ-9 --- */
  var phqOpts = O([0, '0 – Không ngày nào'], [1, '1 – Vài ngày'], [2, '2 – Hơn nửa số ngày'], [3, '3 – Gần như mỗi ngày']);
  S({
    id: 'phq9', mcidVal: 5, short: 'PHQ-9', name: 'Thang trầm cảm PHQ-9',
    domain: 'body', max: 27, reverse: true, minutes: '5 phút',
    ref: 'Kroenke K et al. J Gen Intern Med. 2001;16:606-13',
    note: 'Trong 2 tuần qua, bệnh nhân bị làm phiền bởi các vấn đề sau ở mức độ nào? Điểm CÀNG CAO càng nặng.',
    groups: g.PHCN.allGroupIds().concat(['psych']),
    coreFor: g.PHCN.allGroupIds(), home: 'psych',
    sections: [sec('main', 'Chín triệu chứng trong 2 tuần qua', [
      it('q1', '1. Ít hứng thú hoặc không thấy vui thích khi làm việc gì', phqOpts),
      it('q2', '2. Cảm thấy buồn, chán nản hoặc tuyệt vọng', phqOpts),
      it('q3', '3. Khó ngủ, ngủ không yên giấc hoặc ngủ quá nhiều', phqOpts),
      it('q4', '4. Cảm thấy mệt mỏi hoặc có ít năng lượng', phqOpts),
      it('q5', '5. Ăn kém hoặc ăn quá nhiều', phqOpts),
      it('q6', '6. Cảm thấy tự ti, thất bại, hoặc làm gia đình thất vọng', phqOpts),
      it('q7', '7. Khó tập trung (đọc báo, xem tivi)', phqOpts),
      it('q8', '8. Di chuyển hoặc nói chậm chạp bất thường / bồn chồn quá mức', phqOpts),
      it('q9', '9. Có ý nghĩ muốn chết hoặc tự làm hại bản thân', phqOpts)
    ])],
    interpret: band([
      [4, 'Không / trầm cảm tối thiểu', 'good', ''],
      [9, 'Trầm cảm nhẹ', 'mild', ''],
      [14, 'Trầm cảm vừa', 'mod', 'Cân nhắc can thiệp tâm lý và/hoặc thuốc.'],
      [19, 'Trầm cảm vừa–nặng', 'severe', 'Chỉ định điều trị tích cực.'],
      [27, 'Trầm cảm nặng', 'severe', 'Cần hội chẩn chuyên khoa tâm thần. Lưu ý câu 9 (ý tưởng tự sát).']
    ])
  });

  /* --- D5. HADS --- */
  S({
    id: 'hads', short: 'HADS', name: 'Thang lo âu – trầm cảm bệnh viện (Hospital Anxiety and Depression Scale)',
    domain: 'body', max: 42, reverse: true, minutes: '5 phút',
    ref: 'Zigmond AS, Snaith RP. Acta Psychiatr Scand. 1983;67:361-70',
    note: '14 mục: 7 mục lo âu (HADS-A) và 7 mục trầm cảm (HADS-D), mỗi tiểu thang 0–21. Ngưỡng ≥8 điểm cho mỗi tiểu thang.',
    groups: g.PHCN.allGroupIds().concat(['psych']),
    coreFor: ['cardiac'], home: 'psych',
    subscales: [
      { id: 'a', name: 'Lo âu (HADS-A)', items: ['anx.a1', 'anx.a2', 'anx.a3', 'anx.a4', 'anx.a5', 'anx.a6', 'anx.a7'], max: 21 },
      { id: 'd', name: 'Trầm cảm (HADS-D)', items: ['dep.d1', 'dep.d2', 'dep.d3', 'dep.d4', 'dep.d5', 'dep.d6', 'dep.d7'], max: 21 }
    ],
    sections: [
      sec('anx', 'Tiểu thang LO ÂU (0 = không → 3 = rất nhiều)', [
        it('a1', 'Tôi cảm thấy căng thẳng hoặc "lên dây cót"', rng(3)),
        it('a2', 'Tôi có cảm giác sợ hãi như điều gì tồi tệ sắp xảy ra', rng(3)),
        it('a3', 'Những ý nghĩ lo lắng cứ quẩn quanh trong đầu tôi', rng(3)),
        it('a4', 'Tôi có thể ngồi thoải mái và cảm thấy thư giãn (đảo điểm)', rng(3)),
        it('a5', 'Tôi có cảm giác sợ hãi kèm "bồn chồn trong bụng"', rng(3)),
        it('a6', 'Tôi cảm thấy bồn chồn như phải luôn cử động', rng(3)),
        it('a7', 'Tôi đột nhiên có cảm giác hoảng sợ', rng(3))
      ]),
      sec('dep', 'Tiểu thang TRẦM CẢM (0 = không → 3 = rất nhiều)', [
        it('d1', 'Tôi vẫn thấy thích thú những điều mình từng thích (đảo điểm)', rng(3)),
        it('d2', 'Tôi vẫn có thể cười và thấy khía cạnh hài hước (đảo điểm)', rng(3)),
        it('d3', 'Tôi cảm thấy vui vẻ (đảo điểm)', rng(3)),
        it('d4', 'Tôi cảm thấy mọi việc như chậm lại', rng(3)),
        it('d5', 'Tôi không còn quan tâm đến vẻ ngoài của mình', rng(3)),
        it('d6', 'Tôi mong chờ và tận hưởng những điều sắp tới (đảo điểm)', rng(3)),
        it('d7', 'Tôi có thể thưởng thức một cuốn sách hay chương trình tivi (đảo điểm)', rng(3))
      ])
    ],
    interpret: band([
      [14, 'Không có rối loạn khí sắc rõ rệt', 'good', 'Lưu ý xét riêng từng tiểu thang: ≥8 điểm là ngưỡng nghi ngờ.'],
      [21, 'Có dấu hiệu lo âu / trầm cảm', 'mod', ''],
      [42, 'Lo âu và/hoặc trầm cảm mức độ nặng', 'severe', '']
    ])
  });

  /* =======================================================================
   *  E. TỔN THƯƠNG TỦY SỐNG
   * ===================================================================== */

  var mrcOpts = O([0, '0 – Không co cơ'], [1, '1 – Co cơ sờ thấy hoặc nhìn thấy'], [2, '2 – Vận động hết tầm khi loại bỏ trọng lực'],
    [3, '3 – Vận động hết tầm kháng trọng lực'], [4, '4 – Vận động kháng lực cản vừa'], [5, '5 – Sức cơ bình thường']);

  /* --- E1. ISNCSCI vận động --- */
  S({
    id: 'isncsci', short: 'ISNCSCI', name: 'Phân loại thần kinh chuẩn quốc tế tổn thương tủy sống (ISNCSCI/ASIA)',
    domain: 'body', max: 100, minutes: '30–45 phút', figure: ['dermatome', 'mrc'],
    ref: 'ASIA/ISCoS International Standards, phiên bản 2019',
    note: 'Điểm vận động: 10 nhóm cơ chìa khóa × 2 bên × 0–5 = 100 (UEMS 50 + LEMS 50). Điểm cảm giác nhập theo tổng phân mục.',
    groups: ['sci'],
    coreFor: ['sci'],
    subscales: [
      { id: 'uems', name: 'Điểm vận động chi trên (UEMS)', items: ['ue_r.c5', 'ue_r.c6', 'ue_r.c7', 'ue_r.c8', 'ue_r.t1', 'ue_l.c5', 'ue_l.c6', 'ue_l.c7', 'ue_l.c8', 'ue_l.t1'], max: 50 },
      { id: 'lems', name: 'Điểm vận động chi dưới (LEMS)', items: ['le_r.l2', 'le_r.l3', 'le_r.l4', 'le_r.l5', 'le_r.s1', 'le_l.l2', 'le_l.l3', 'le_l.l4', 'le_l.l5', 'le_l.s1'], max: 50 }
    ],
    sections: [
      sec('ue_r', 'Cơ chìa khóa chi trên – BÊN PHẢI', [
        it('c5', 'C5 – Gấp khuỷu (nhị đầu)', mrcOpts),
        it('c6', 'C6 – Duỗi cổ tay', mrcOpts),
        it('c7', 'C7 – Duỗi khuỷu (tam đầu)', mrcOpts),
        it('c8', 'C8 – Gấp ngón giữa (gấp sâu các ngón)', mrcOpts),
        it('t1', 'T1 – Dạng ngón út', mrcOpts)
      ]),
      sec('ue_l', 'Cơ chìa khóa chi trên – BÊN TRÁI', [
        it('c5', 'C5 – Gấp khuỷu', mrcOpts),
        it('c6', 'C6 – Duỗi cổ tay', mrcOpts),
        it('c7', 'C7 – Duỗi khuỷu', mrcOpts),
        it('c8', 'C8 – Gấp ngón giữa', mrcOpts),
        it('t1', 'T1 – Dạng ngón út', mrcOpts)
      ]),
      sec('le_r', 'Cơ chìa khóa chi dưới – BÊN PHẢI', [
        it('l2', 'L2 – Gấp háng (thắt lưng chậu)', mrcOpts),
        it('l3', 'L3 – Duỗi gối (tứ đầu)', mrcOpts),
        it('l4', 'L4 – Gấp mu bàn chân (chày trước)', mrcOpts),
        it('l5', 'L5 – Duỗi ngón cái dài', mrcOpts),
        it('s1', 'S1 – Gấp gan bàn chân (tam đầu cẳng chân)', mrcOpts)
      ]),
      sec('le_l', 'Cơ chìa khóa chi dưới – BÊN TRÁI', [
        it('l2', 'L2 – Gấp háng', mrcOpts),
        it('l3', 'L3 – Duỗi gối', mrcOpts),
        it('l4', 'L4 – Gấp mu bàn chân', mrcOpts),
        it('l5', 'L5 – Duỗi ngón cái dài', mrcOpts),
        it('s1', 'S1 – Gấp gan bàn chân', mrcOpts)
      ]),
      sec('sensory', 'Điểm cảm giác (28 khoanh da × 0–2 mỗi bên)', [
        num('lt_r', 'Sờ nông (Light touch) – bên phải', '/56', { min: 0, max: 56 }),
        num('lt_l', 'Sờ nông – bên trái', '/56', { min: 0, max: 56 }),
        num('pp_r', 'Châm kim (Pin prick) – bên phải', '/56', { min: 0, max: 56 }),
        num('pp_l', 'Châm kim – bên trái', '/56', { min: 0, max: 56 })
      ]),
      sec('classify', 'Phân loại thần kinh', [
        it('level', 'Mức tổn thương thần kinh (NLI)', O([0, 'C1'], [0, 'C2'], [0, 'C3'], [0, 'C4'], [0, 'C5'], [0, 'C6'], [0, 'C7'], [0, 'C8'], [0, 'T1'], [0, 'T2'], [0, 'T3'], [0, 'T4'], [0, 'T5'], [0, 'T6'], [0, 'T7'], [0, 'T8'], [0, 'T9'], [0, 'T10'], [0, 'T11'], [0, 'T12'], [0, 'L1'], [0, 'L2'], [0, 'L3'], [0, 'L4'], [0, 'L5'], [0, 'S1'], [0, 'S2'], [0, 'S3'], [0, 'S4-5']), { text: true, sum: false }),
        it('ais', 'Phân độ AIS (ASIA Impairment Scale)', O(
          [0, 'A – Mất hoàn toàn: không còn chức năng cảm giác và vận động ở khoanh S4-5'],
          [0, 'B – Không hoàn toàn về cảm giác: còn cảm giác dưới mức tổn thương kể cả S4-5, không còn vận động'],
          [0, 'C – Không hoàn toàn về vận động: >50% cơ chìa khóa dưới mức tổn thương có sức cơ <3'],
          [0, 'D – Không hoàn toàn về vận động: ≥50% cơ chìa khóa dưới mức tổn thương có sức cơ ≥3'],
          [0, 'E – Bình thường: cảm giác và vận động bình thường ở mọi khoanh']
        ), { text: true, sum: false }),
        it('vac', 'Co thắt hậu môn chủ ý (VAC)', O([0, 'Có'], [0, 'Không']), { text: true, sum: false }),
        it('dap', 'Cảm giác sâu quanh hậu môn (DAP)', O([0, 'Có'], [0, 'Không']), { text: true, sum: false }),
        it('type', 'Loại tổn thương', O([0, 'Liệt tứ chi (tetraplegia)'], [0, 'Liệt hai chi dưới (paraplegia)']), { text: true, sum: false })
      ])
    ],
    interpret: band([
      [0, 'Mất hoàn toàn vận động dưới mức tổn thương', 'severe', ''],
      [24, 'Suy giảm vận động rất nặng', 'severe', ''],
      [49, 'Suy giảm vận động nặng', 'severe', ''],
      [74, 'Suy giảm vận động vừa', 'mod', ''],
      [94, 'Suy giảm vận động nhẹ', 'mild', ''],
      [100, 'Vận động các cơ chìa khóa bình thường', 'good', '']
    ])
  });

  /* --- E2. SCIM III --- */
  S({
    id: 'scim3', short: 'SCIM III', name: 'Thang độc lập chức năng tủy sống III (Spinal Cord Independence Measure III)',
    domain: 'activity', max: 100, minutes: '30–40 phút',
    ref: 'Catz A, Itzkovich M et al. Spinal Cord. 2007;45:275-91',
    note: 'Công cụ đặc hiệu cho tổn thương tủy sống, 19 mục, 3 lĩnh vực: tự chăm sóc (0–20), hô hấp & cơ tròn (0–40), di chuyển (0–40).',
    groups: ['sci'],
    coreFor: ['sci'],
    subscales: [
      { id: 'self', name: 'Tự chăm sóc (0–20)', items: ['self.feeding', 'self.bath_up', 'self.bath_low', 'self.dress_up', 'self.dress_low', 'self.groom'], max: 20 },
      { id: 'resp', name: 'Hô hấp & quản lý cơ tròn (0–40)', items: ['resp.breath', 'resp.bladder', 'resp.bowel', 'resp.toilet'], max: 40 },
      { id: 'mob', name: 'Di chuyển (0–40)', items: ['mob_room.bed', 'mob_room.t_bed_wc', 'mob_room.t_wc_toilet', 'mob_out.indoor', 'mob_out.moderate', 'mob_out.outdoor', 'mob_out.stairs', 'mob_out.t_car', 'mob_out.t_ground'], max: 40 }
    ],
    sections: [
      sec('self', 'Lĩnh vực 1 – Tự chăm sóc (0–20 điểm)', [
        it('feeding', '1. Ăn uống (cắt, mở hộp, rót, đưa thức ăn lên miệng, cầm cốc)', rng(3, { 0: 'cần nuôi ăn qua ống/hoàn toàn trợ giúp', 3: 'ăn uống độc lập, không cần dụng cụ' })),
        it('bath_up', '2. Tắm phần thân trên (xà phòng, vặn vòi, kỳ cọ, lau khô)', rng(3, { 0: 'cần trợ giúp hoàn toàn', 3: 'độc lập, không cần dụng cụ thích ứng' })),
        it('bath_low', '3. Tắm phần thân dưới', rng(3, { 0: 'cần trợ giúp hoàn toàn', 3: 'độc lập hoàn toàn' })),
        it('dress_up', '4. Mặc quần áo thân trên', rng(4, { 0: 'cần trợ giúp hoàn toàn', 4: 'độc lập với mọi loại quần áo' })),
        it('dress_low', '5. Mặc quần áo thân dưới', rng(4, { 0: 'cần trợ giúp hoàn toàn', 4: 'độc lập với mọi loại quần áo' })),
        it('groom', '6. Chải chuốt (rửa tay – mặt, đánh răng, chải tóc, cạo râu, trang điểm)', rng(3, { 0: 'cần trợ giúp hoàn toàn', 3: 'độc lập, không cần dụng cụ' }))
      ]),
      sec('resp', 'Lĩnh vực 2 – Hô hấp & quản lý cơ tròn (0–40 điểm)', [
        it('breath', '7. Hô hấp', rng(10, { 0: 'cần thở máy qua ống', 2: 'mở khí quản + thở máy một phần', 4: 'thở tự nhiên qua mở khí quản, cần hút đờm nhiều', 6: 'thở tự nhiên qua mở khí quản, hút đờm ít', 8: 'thở tự nhiên, cần trợ giúp ho/thở máy không xâm nhập', 10: 'thở bình thường, không cần trợ giúp' })),
        it('bladder', '8. Quản lý cơ tròn bàng quang', rng(15, { 0: 'sonde lưu', 3: 'nước tiểu tồn dư >100 ml, thông tiểu không đều', 6: 'nước tiểu tồn dư <100 ml, cần trợ giúp thông tiểu ngắt quãng', 9: 'tự thông tiểu ngắt quãng, cần trợ giúp đặt dụng cụ', 11: 'tự thông tiểu, độc lập với dụng cụ chứa', 13: 'tự thông tiểu độc lập, không rò rỉ', 15: 'tiểu tiện bình thường, kiểm soát tốt' })),
        it('bowel', '9. Quản lý cơ tròn ruột', rng(10, { 0: 'đại tiện không đúng thời điểm hoặc <1 lần/3 ngày', 5: 'đều đặn nhưng cần trợ giúp; dùng thuốc đặt/kích thích', 8: 'đều đặn, không cần trợ giúp; có dùng thuốc kích thích', 10: 'đại tiện đều đặn, không cần trợ giúp và không dùng thuốc' })),
        it('toilet', '10. Sử dụng nhà vệ sinh (vệ sinh vùng đáy chậu, mặc/cởi quần áo, dùng băng vệ sinh)', rng(5, { 0: 'cần trợ giúp hoàn toàn', 5: 'độc lập hoàn toàn, không cần dụng cụ thích ứng' }))
      ]),
      sec('mob_room', 'Lĩnh vực 3A – Di chuyển trong phòng & nhà vệ sinh', [
        it('bed', '11. Vận động tại giường & dự phòng loét tì đè', rng(6, { 0: 'cần trợ giúp mọi hoạt động', 6: 'thực hiện độc lập mọi hoạt động (lăn trở, ngồi dậy, nâng người, không cần dụng cụ)' })),
        it('t_bed_wc', '12. Di chuyển giường ↔ xe lăn (khóa xe, gác chân, tựa tay)', rng(2, { 0: 'cần trợ giúp', 2: 'độc lập hoàn toàn' })),
        it('t_wc_toilet', '13. Di chuyển xe lăn ↔ bồn cầu / bồn tắm', rng(2, { 0: 'cần trợ giúp', 2: 'độc lập hoàn toàn' }))
      ]),
      sec('mob_out', 'Lĩnh vực 3B – Di chuyển trong nhà & ngoài trời', [
        it('indoor', '14. Di chuyển trong nhà', rng(8, { 0: 'cần trợ giúp hoàn toàn', 2: 'xe lăn điện hoặc cần trợ giúp xe lăn tay', 4: 'xe lăn tay độc lập', 6: 'đi có khung/nạng có giám sát', 8: 'đi lại độc lập không cần dụng cụ' })),
        it('moderate', '15. Di chuyển quãng vừa (10–100 m)', rng(8, { 0: 'cần trợ giúp hoàn toàn', 4: 'xe lăn tay độc lập', 8: 'đi lại độc lập không cần dụng cụ' })),
        it('outdoor', '16. Di chuyển ngoài trời (>100 m)', rng(8, { 0: 'cần trợ giúp hoàn toàn', 4: 'xe lăn tay độc lập', 8: 'đi lại độc lập không cần dụng cụ' })),
        it('stairs', '17. Lên xuống cầu thang', rng(3, { 0: 'không lên xuống được', 3: 'lên xuống ≥3 bậc độc lập, không vịn/không dụng cụ' })),
        it('t_car', '18. Di chuyển xe lăn ↔ ô tô', rng(2, { 0: 'cần trợ giúp', 2: 'độc lập hoàn toàn, không cần dụng cụ' })),
        it('t_ground', '19. Di chuyển mặt đất ↔ xe lăn', rng(1, { 0: 'cần trợ giúp', 1: 'độc lập' }))
      ])
    ],
    interpret: band([
      [20, 'Phụ thuộc gần như hoàn toàn', 'severe', ''],
      [40, 'Phụ thuộc nặng', 'severe', ''],
      [65, 'Phụ thuộc trung bình', 'mod', ''],
      [89, 'Phụ thuộc nhẹ', 'mild', ''],
      [100, 'Độc lập chức năng', 'good', '']
    ])
  });

  /* --- E3. WISCI II --- */
  S({
    id: 'wisci', short: 'WISCI II', name: 'Chỉ số đi bộ trong tổn thương tủy sống (Walking Index for SCI II)',
    domain: 'activity', max: 20, minutes: '10 phút',
    ref: 'Dittuno PL, Dittuno JF. Spinal Cord. 2001;39:654-6',
    note: 'Xếp hạng khả năng đi 10 m theo nhu cầu dụng cụ chỉnh hình, dụng cụ trợ giúp và trợ giúp thể chất.',
    groups: ['sci'],
    coreFor: ['sci'],
    sections: [sec('main', 'Mức độ đi bộ (10 m)', [
      it('wisci', 'Chọn mức', O(
        [0, '0 – Không thể đứng hoặc tham gia đi bộ'],
        [1, '1 – Thanh song song, nẹp và 2 người trợ giúp, <10 m'],
        [2, '2 – Thanh song song, nẹp và 2 người trợ giúp, 10 m'],
        [3, '3 – Thanh song song, nẹp và 1 người trợ giúp, 10 m'],
        [4, '4 – Thanh song song, không nẹp, 1 người trợ giúp, 10 m'],
        [5, '5 – Thanh song song, có nẹp, không người trợ giúp, 10 m'],
        [6, '6 – Khung tập đi, có nẹp, 1 người trợ giúp, 10 m'],
        [7, '7 – Hai nạng, có nẹp, 1 người trợ giúp, 10 m'],
        [8, '8 – Khung tập đi, không nẹp, 1 người trợ giúp, 10 m'],
        [9, '9 – Khung tập đi, có nẹp, không người trợ giúp, 10 m'],
        [10, '10 – Hai nạng, không nẹp, 1 người trợ giúp, 10 m'],
        [11, '11 – Hai gậy, có nẹp, không người trợ giúp, 10 m'],
        [12, '12 – Hai nạng, có nẹp, không người trợ giúp, 10 m'],
        [13, '13 – Khung tập đi, không nẹp, không người trợ giúp, 10 m'],
        [14, '14 – Hai nạng, không nẹp, không người trợ giúp, 10 m'],
        [15, '15 – Hai gậy, không nẹp, không người trợ giúp, 10 m'],
        [16, '16 – Một nạng/gậy, có nẹp, không người trợ giúp, 10 m'],
        [17, '17 – Không dụng cụ, có nẹp, không người trợ giúp, 10 m'],
        [18, '18 – Không dụng cụ, không nẹp, 1 người trợ giúp, 10 m'],
        [19, '19 – Một nạng/gậy, không nẹp, không người trợ giúp, 10 m'],
        [20, '20 – Không dụng cụ, không nẹp, không người trợ giúp, 10 m']
      ))
    ])],
    interpret: band([
      [0, 'Không đi được', 'severe', ''],
      [5, 'Đi được chỉ trong thanh song song', 'severe', ''],
      [12, 'Đi được với dụng cụ trợ giúp và/hoặc nẹp', 'mod', ''],
      [18, 'Đi độc lập với dụng cụ tối thiểu', 'mild', ''],
      [20, 'Đi độc lập hoàn toàn', 'good', '']
    ])
  });

  /* --- E4. Đau thần kinh DN4 --- */
  S({
    id: 'dn4', short: 'DN4', name: 'Bộ câu hỏi đau thần kinh DN4 (Douleur Neuropathique 4)',
    domain: 'body', max: 10, reverse: true, minutes: '5 phút',
    ref: 'Bouhassira D et al. Pain. 2005;114:29-36',
    note: 'Điểm ≥4/10 gợi ý đau có nguồn gốc thần kinh. Hữu ích ở tổn thương tủy sống và đau trung ương sau đột quỵ.',
    groups: ['sci', 'stroke_motor', 'general'],
    sections: [
      sec('interview', 'Phỏng vấn bệnh nhân', [
        it('burn', '1. Cảm giác bỏng rát', yn('Có (1)', 'Không (0)')),
        it('cold', '2. Cảm giác lạnh buốt đau đớn', yn('Có (1)', 'Không (0)')),
        it('shock', '3. Cảm giác như điện giật', yn('Có (1)', 'Không (0)')),
        it('tingle', '4. Kiến bò (tingling)', yn('Có (1)', 'Không (0)')),
        it('pins', '5. Kim châm (pins and needles)', yn('Có (1)', 'Không (0)')),
        it('numb', '6. Tê bì', yn('Có (1)', 'Không (0)')),
        it('itch', '7. Ngứa', yn('Có (1)', 'Không (0)'))
      ]),
      sec('exam', 'Khám lâm sàng vùng đau', [
        it('hypo_touch', '8. Giảm cảm giác khi chạm nhẹ', yn('Có (1)', 'Không (0)')),
        it('hypo_prick', '9. Giảm cảm giác khi châm kim', yn('Có (1)', 'Không (0)')),
        it('brush', '10. Đau tăng hoặc xuất hiện khi chải nhẹ trên da (allodynia)', yn('Có (1)', 'Không (0)'))
      ])
    ],
    interpret: band([
      [3, 'Không hướng tới đau thần kinh (<4 điểm)', 'good', ''],
      [10, 'Hướng tới đau thần kinh (≥4 điểm)', 'mod', 'Cân nhắc gabapentinoid, thuốc chống trầm cảm ba vòng/SNRI thay vì NSAID đơn thuần.']
    ])
  });

})(window);
