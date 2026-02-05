# PR Review: Why premature memoization is a mistake

**Reviewer lens:** Senior React — thứ tự tối ưu (refactor trước, measure, rồi mới memo), red flags của premature optimization, trade-offs, cách Senior sắp xếp bước tối ưu.

---

## 1. Tóm tắt thay đổi

- **Initial:** Dashboard đơn giản, không memo; re-render rẻ; “works fine”.
- **Premature memo:** Cùng UI, thêm React.memo + useMemo + useCallback khắp nơi. Props vẫn đổi (tick) → memo không skip. Tăng complexity, không cải thiện đo được; khóa kiến trúc (state trên cao, “tối ưu” bằng memo thay vì sửa cấu trúc).
- **Refactor (no memo):** Colocate state — TickWidget sở hữu tick; MetricGrid không nhận tick. Chỉ TickWidget re-render khi Increment. Performance tốt hơn **không** dùng memo.
- **Justified memo:** Sau refactor, có một component đắt (ExpensiveChart); đã đo. Thêm memo + stable props chỉ cho ExpensiveChart. Đúng thứ tự: refactor → measure → memo chỉ chỗ cần.

**Verdict:** Demo rõ luồng; dưới đây là red flags, trade-offs, và cách Senior sắp xếp tối ưu.

---

## 2. Điểm tốt

- **Initial vs Premature:** So sánh trực tiếp: cùng re-render count / measure; premature thêm code (deps, callbacks) mà không lợi.
- **Refactor không memo:** Colocate state → ít re-render hơn, không dùng memo. Chứng minh “fix architecture trước” hiệu quả.
- **Justified:** Memo chỉ cho ExpensiveChart (đắt, đã đo), stable props; phần còn lại giữ đơn giản. Đúng thứ tự: refactor → measure → memo có chủ đích.
- **Render logs + measure:** [render] và [measure] giúp so sánh từng bước.

---

## 3. Red flags (chỉ ra premature optimization)

| Red flag | Ý nghĩa |
|----------|--------|
| **Memo/useMemo/useCallback trước khi có số liệu** | Chưa profile / measure đã thêm memo → thường là premature. |
| **“Tối ưu” nhưng props vẫn đổi mỗi render** | Memo không skip → không lợi; chỉ thêm so sánh và code phức tạp. |
| **Nhiều useCallback/useMemo với dependency array dài** | Dễ stale closure, khó debug “dep nào gây re-run”; tăng complexity. |
| **Không refactor kiến trúc, chỉ “bù” bằng memo** | State vẫn tập trung trên cao, component to; memo chỉ che triệu chứng, không sửa nguyên nhân. |
| **“[measure] không cải thiện (hoặc tệ hơn) sau khi thêm memo”** | Memo thêm overhead (so sánh) mà không giảm re-render → net negative. |

---

## 4. Trade-offs và thứ tự tối ưu (Senior)

| Bước | Hành động | Lợi | Rủi ro / cost |
|------|-----------|-----|----------------|
| **1. Initial** | Làm feature, không memo. | Code đơn giản, dễ đổi. | Nếu thật sự chậm thì chưa tối ưu. |
| **2. Measure** | Profile / [measure] / [render] để tìm bottleneck. | Biết chỗ nào đắt, chỗ nào re-render thừa. | Tốn thời gian đo. |
| **3. Refactor** | Colocate state, tách component, giảm re-render không cần thiết. | Cải thiện performance mà không thêm memo. | Phải sửa cấu trúc. |
| **4. Measure lại** | Đo sau refactor. | Xác nhận đã đủ nhanh hoặc còn bottleneck. | — |
| **5. Memo chỉ chỗ cần** | Nếu còn component đắt (đã đo), thêm memo + stable props cho đúng component đó. | Giảm re-render đúng chỗ. | Phải duy trì stable refs (useMemo/useCallback). |

**Thứ tự sai (premature):** Thêm memo trước khi refactor và measure → khóa kiến trúc kém, complexity tăng, không có bằng chứng lợi.

**Thứ tự đúng:** Initial → (nếu cần) Measure → Refactor → Measure lại → Memo chỉ nơi đo được bottleneck.

---

## 5. Khi memoization “khóa” kiến trúc kém

- **Kiến trúc kém:** Toàn bộ state (vd. tick) ở root; mọi card nhận tick → mọi card re-render khi tick đổi.
- **Cách sai:** Thêm memo cho từng card nhưng vẫn truyền tick (hoặc derived từ tick) → memo không skip → không cải thiện; code phức tạp hơn.
- **Hệ quả:** Team nghĩ “đã tối ưu” nên không refactor (colocate state). Kiến trúc kém bị “khóa” vì “đã có memo rồi”.
- **Cách đúng:** Refactor (colocate state, chỉ component cần tick mới có tick) → đo → nếu còn bottleneck thật (một component đắt) mới thêm memo cho đúng chỗ đó.

---

## 6. Tóm tắt một dòng

**Premature memoization thêm complexity và khóa kiến trúc kém mà không cải thiện đo được; đúng cách là refactor (colocate state, sửa cấu trúc) trước, measure, rồi mới thêm memo chỉ nơi đã đo là bottleneck.**
