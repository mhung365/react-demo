# When to optimize React rendering

**Mục tiêu:** Phân biệt **render noise** (nhiều re-render nhưng rẻ) với **render problem** (re-render gây jank); biết khi nào tối ưu là cần thiết và khi nào là premature optimization.

---

## 1. Thứ tự học

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Mở Console → tab **Harmless re-renders** → click **Increment** vài lần | Thấy nhiều `[render]` và `[measure]`; mỗi render ~0ms. Đây là render noise. |
| 2 | Tab **Real problem (jank)** → click **Increment** | Thấy `[measure] ExpensiveChartBlock` ~10–30ms; UI có thể giật. Đây là render problem. |
| 3 | Tab **Optimized (justified)** → click **Increment** | Chỉ parent + metric/stat re-render; ExpensiveChartBlock **không** log. Tối ưu đúng chỗ. |
| 4 | Tab **Premature optimization** → click **Increment** | Vẫn nhiều re-render như Harmless; thêm memo/useCallback/useMemo nhưng không lợi. |
| 5 | Tab **Debug: False positive** → click **Increment** | Render counts tăng; Profiler panel cho thấy total &lt;2ms — logs “trông tệ” nhưng performance OK. |
| 6 | Tab **Debug: Real bottleneck** → click **Increment** | Profiler panel: ExpensiveChartBlock ≥10ms — bottleneck thật. |
| 7 | Tab **Debug: Wrong optimization** → click **Increment** | Ai đó tối ưu theo “số re-render cao”; Profiler không cải thiện (hoặc tệ hơn). |
| 8 | Tab **Debug: Correct optimization** → click **Increment** | Profiler total giảm; ExpensiveChartBlock không re-render khi tick đổi — fix đúng. |
| 9 | Đọc **PR-REVIEW.md** và **PROFILING-MISTAKES.md** | Sai lầm khi profile, measurements vs intuition, cách Senior quyết định khi nào tối ưu. |

---

## 2. Render noise vs render problem

| | Render noise | Render problem |
|--|--------------|----------------|
| **Triệu chứng** | Nhiều `[render]` logs | Một vài component render rất lâu (10ms+) |
| **Nguyên nhân** | Parent state thay đổi → nhiều child re-render; mỗi child chỉ render JSX đơn giản | Một vài child làm việc nặng trong render (tính toán phức tạp, list lớn, v.v.) |
| **Cách đo** | `useMeasureRender` / React DevTools Profiler: mỗi render &lt;1ms | Profiler hoặc `[measure]`: render &gt;10ms, frame drop |
| **Hành động** | **Không** tối ưu — memo/useMemo thêm overhead, không cải thiện UX | **Có** tối ưu: memo + stable props, hoặc colocate state, hoặc tách component đắt |

---

## 3. Khi nào optimization là justified

- Bạn **đã đo** (Profiler hoặc `useMeasureRender`): có component render chậm.
- Component đó **nhận props ổn định** (hoặc có thể thiết kế lại để nhận stable props) khi parent re-render.
- Sau khi thêm memo + stable props, **đo lại** và thấy render của component đó không chạy khi không cần → jank giảm.

**Trong demo:** ExpensiveChartBlock không phụ thuộc `tick` → wrap bằng `memo`, không truyền props thay đổi → khi tick thay đổi, React bỏ qua re-render ExpensiveChartBlock.

---

## 4. Cost of premature optimization

- **Memo/useMemo/useCallback** có cost: so sánh deps mỗi render, lưu prev deps + result.
- Nếu child **luôn nhận props mới** (ví dụ value phụ thuộc `tick`), memo **không skip** → ta trả cost so sánh mà không được lợi.
- Code phức tạp hơn (nhiều useCallback/useMemo, dependency array dài) → dễ sai (stale closure, deps thiếu).
- **Kết luận:** Chỉ dùng khi đã có bằng chứng (đo) và có chỗ cụ thể cần tối ưu.

---

## 5. Data trong demo — toàn UI state

| Data | Nơi sống | Loại |
|------|----------|------|
| tick | Dashboard (useState) | UI state |
| Các metric/stat | Derived từ tick trong render | Không lưu state riêng |

Không có server state; demo chỉ minh họa re-render và chi phí render.

---

## 6. Debug & measure trong production

- **Render counters** (`useRenderCount` + `RenderCountPanel`): cho biết *ai* re-render (expected vs noisy). Count cao **không** có nghĩa là chậm.
- **Profiler** (in-app panel dùng `<Profiler onRender>` hoặc React DevTools): cho biết *actualDuration* — component nào thực sự chậm (≥10ms).
- **False positive:** Counts cao, Profiler total thấp → đừng tối ưu theo logs.
- **Wrong optimization:** Tối ưu theo logs (memo khắp nơi) → Profiler không cải thiện.
- **Correct optimization:** Profiler chỉ bottleneck → memo chỉ component đó + stable props → Profiler cải thiện.

Chi tiết sai lầm khi profile: **PROFILING-MISTAKES.md**.
