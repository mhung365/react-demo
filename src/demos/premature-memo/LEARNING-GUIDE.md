# Why premature memoization is a mistake

**Mục tiêu:** Thấy bản initial chạy tốt không cần memo; bản premature memo thêm complexity, không cải thiện đo được, và khóa kiến trúc kém; refactor (colocate state, không dùng memo) cải thiện performance; chỉ sau đó mới thêm memo ở chỗ đã đo (justified).

---

## 1. Thứ tự học

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Tab **Initial (no memo)** → click **Increment** vài lần | [render] và [measure]; đơn giản, đủ nhanh. |
| 2 | Tab **Premature memo** → click **Increment** | Cùng số lần re-render; thêm memo/useMemo/useCallback nhưng props vẫn đổi → không lợi; code phức tạp hơn. |
| 3 | Tab **Refactor (no memo)** → click **Increment** | Chỉ TickWidget re-render; MetricGrid/MetricCard không. Cải thiện performance **không** dùng memo — nhờ colocate state. |
| 4 | Tab **Justified memo** → click **Increment** | Chỉ TickWidgetWithChart re-render; ExpensiveChart (memo + stable props) không. Memo chỉ dùng cho component đắt đã đo. |
| 5 | Đọc **PR-REVIEW.md** | Red flags, trade-offs, thứ tự tối ưu của Senior. |

---

## 2. Thứ tự tối ưu (Senior)

1. **Initial:** Làm feature trước, không memo. Nếu đủ nhanh → dừng.
2. **Đo:** Nếu có vấn đề (jank, re-render nhiều), profile để tìm bottleneck.
3. **Refactor:** Sửa kiến trúc trước (colocate state, tách component) để giảm re-render không cần thiết. Đo lại.
4. **Memo chỉ khi cần:** Nếu sau refactor vẫn còn bottleneck (một component đắt), mới thêm memo + stable props cho đúng chỗ đó.

---

## 3. Red flags (premature optimization)

- Memo/useMemo/useCallback xuất hiện trước khi có số liệu (profile / measure).
- “Tối ưu” bằng memo nhưng vẫn truyền props thay đổi mỗi render → memo không skip.
- Code phức tạp hơn (nhiều deps, callback) mà [measure] hoặc [render] count không cải thiện.
- Kiến trúc kém (state tập trung trên cao, component to) nhưng không refactor, chỉ “bù” bằng memo.

---

## 4. Data trong demo — toàn UI state

| Data | Nơi sống | Loại |
|------|----------|------|
| tick | DashboardInitial / TickWidget / TickWidgetWithChart (useState) | UI state |
| metrics | Derived trong render (Initial, Premature) hoặc static (Refactor, Justified) | Derived / static |

Không có server state.
