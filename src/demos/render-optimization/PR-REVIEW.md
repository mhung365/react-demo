# PR Review: When to optimize React rendering

**Reviewer lens:** Senior React — khi nào nên tối ưu render, khi nào không; trade-off và sai lầm thường gặp.

---

## 1. Tóm tắt thay đổi

- Demo dashboard với 4 biến thể: **Harmless** (nhiều re-render rẻ), **Problem** (một child đắt → jank), **Optimized** (memo chỉ child đắt), **Premature** (memo/useCallback/useMemo khắp nơi, không lợi).
- Render logs và `useMeasureRender` để đo và phân biệt render noise vs render problem.
- **Debug & measure:** 4 tab mới: **False positive** (logs/counts trông tệ, Profiler OK), **Real bottleneck** (Profiler chỉ ra component chậm), **Wrong optimization** (tối ưu theo logs, Profiler không cải thiện), **Correct optimization** (Profiler chứng minh fix đúng). Có render counters per component và Profiler-based panel (programmatic `<Profiler onRender>`).

**Verdict:** Implementation đúng hướng; dưới đây là điểm review, profiling mistakes, và cách Senior quyết định khi nào tối ưu.

---

## 2. Điểm tốt

- **Đo trước khi tối ưu:** Demo dùng `[render]` + `[measure]` để thấy rõ chi phí từng component. Đúng quy trình: measure → identify bottleneck → optimize only there.
- **Tối ưu có mục tiêu:** Optimized chỉ memo `ExpensiveChartBlock`, không memo `MetricCard` / `StatRow`. Tránh over-optimization.
- **Stable props cho expensive child:** ExpensiveChartBlock không nhận props thay đổi theo tick → memo thực sự skip re-render khi tick thay đổi.
- **Premature variant rõ ràng:** DashboardPremature cho thấy memo mọi thứ nhưng vẫn pass `tick` (hoặc value phụ thuộc tick) → shallow compare fail → vẫn re-render; chỉ thêm overhead và độ phức tạp.
- **Debug & measure:** Render counters (`useRenderCount` + `RenderCountPanel`) cho thấy “ai re-render”; Profiler panel (programmatic `<Profiler onRender>`) cho thấy *actualDuration* — phân biệt expected vs problematic. False positive / Wrong optimization / Correct optimization minh họa “đừng tin logs, tin Profiler”.

---

## 3. Sai lầm thường gặp (premature optimization)

| Sai lầm | Hậu quả | Cách tránh |
|--------|---------|------------|
| **Memo mọi component** | So sánh props mỗi render; không skip nếu props luôn mới; code khó đọc. | Chỉ memo component đã đo là đắt và có thể nhận stable props. |
| **useCallback cho mọi handler** | Nhiều dependency array; dễ stale closure; không lợi nếu child không memo hoặc không cần ref equality. | Dùng useCallback khi: truyền vào component được memo, hoặc vào effect/child cần ref stable. |
| **useMemo cho mọi derived value** | So sánh deps mỗi render; deps không ổn định (inline object) → recompute mỗi lần → tệ hơn không memo. | useMemo khi: tính toán đắt **hoặc** consumer cần stable ref (memo child, effect deps). |
| **Tối ưu trước khi đo** | Tốn thời gian tối ưu chỗ không gây vấn đề; thêm bug tiềm ẩn (deps, stale). | Luôn dùng Profiler hoặc measure log để tìm component thực sự chậm. |
| **Nhầm “nhiều re-render” với “app chậm”** | Nhiều re-render nhưng mỗi cái &lt;1ms thì vẫn 60fps. | Phân biệt render noise (nhiều log, rẻ) vs render problem (ít component nhưng &gt;10ms/render). |

---

## 4. Trade-offs

| Quyết định | Được gì | Mất gì |
|------------|--------|--------|
| **Không memo cheap components** | Code đơn giản, ít bug deps, ít so sánh. | Nhiều lần gọi function component (nhưng rẻ). |
| **Memo chỉ expensive component + stable props** | Giảm jank đúng chỗ; ít code thừa. | Phải thiết kế props ổn định (có khi cần useMemo/useCallback cho từng prop). |
| **Memo/useCallback/useMemo khắp nơi** | Cảm giác “đã tối ưu”. | Overhead so sánh, code phức tạp, dễ sai; thường không cải thiện UX nếu không có bottleneck thật. |

---

## 5. Cách Senior quyết định khi nào tối ưu

1. **Có metric không?** Nếu chưa đo (Profiler, measure, user báo lag) → không tối ưu render theo cảm giác.
2. **Bottleneck ở đâu?** Tìm component (hoặc vài component) có render time cao, không phải “nhiều component re-render”.
3. **Có thể cho stable props không?** Nếu component đắt cần data thay đổi mỗi lần (ví dụ filter theo input) → memo ít tác dụng; cân nhắc state colocation, virtualization, hoặc tách logic.
4. **Sau khi tối ưu, đo lại.** Đảm bảo re-render của component đắt thực sự giảm và frame time cải thiện.
5. **Khi nghi ngờ:** Ưu tiên code đơn giản; chỉ thêm memo/useMemo/useCallback khi có bằng chứng và lợi rõ ràng.

---

## 6. Khi nào **không** nên tối ưu

- Ứng dụng đủ nhanh, không có báo cáo jank.
- Chưa profile / chưa biết component nào thực sự chậm.
- Component rẻ (chỉ render vài node đơn giản); memo chỉ thêm so sánh.
- Component luôn nhận props mới (ví dụ `value={tick}`) và không thể hoặc không đáng thiết kế lại → memo không skip.

---

## 7. Profiling mistakes (khi debug re-render trong production)

| Sai lầm | Hậu quả | Cách tránh |
|--------|---------|------------|
| **Tin logs/counts mà không dùng Profiler** | Nhiều re-render ≠ chậm; tối ưu nhầm chỗ. | Dùng Profiler (DevTools hoặc programmatic) để xem *actualDuration*; tối ưu chỉ component ≥10ms. |
| **Tối ưu dựa trên “số lần re-render cao”** | Memo khắp nơi nhưng props vẫn đổi → không skip → không lợi (Wrong optimization tab). | Đo trước (Profiler); tối ưu sau; đo lại để xác nhận. |
| **Profile chỉ dev build** | Dev chậm hơn production; có thể bỏ sót bottleneck thật. | Profile production build khi có thể. |
| **Profile một lần rồi kết luận** | Một commit có thể nhanh, commit khác chậm. | Record nhiều commit (ví dụ 3–5 lần click); xem worst case hoặc trung bình. |

Chi tiết: **PROFILING-MISTAKES.md**.

---

## 8. Measurements vs intuition

- **Tin measurements khi:** Có số liệu Profiler cho đúng kịch bản user báo (ví dụ “click lag”), đã profile nhiều lần và thấy component chậm ổn định, đã so sánh before/after (trước và sau memo) bằng Profiler.
- **Intuition dùng để:** Quyết định *đặt Profiler ở đâu*, *thử fix gì trước*; không dùng để kết luận “app chậm” hoặc “component X chậm” mà chưa đo.
- **Rule:** Chỉ tối ưu khi **measurement** (Profiler) chỉ ra bottleneck. Intuition để hướng dẫn đo; measurement để xác nhận.

---

## 9. Tóm tắt một dòng

**Optimize when you have measured a render problem and a clear fix (e.g. memo + stable props). Do not optimize “just in case”; avoid memo/useMemo/useCallback everywhere without evidence.**
