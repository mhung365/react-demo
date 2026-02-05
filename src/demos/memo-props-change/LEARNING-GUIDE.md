# Memoized component with changing props

**Mục tiêu:** Hiểu React.memo so sánh props thế nào (shallow); khi nào prop đổi theo reference nhưng không theo value vẫn làm memo fail; một prop đổi làm cả component re-render; prop shape và refactor (split props) để memo hiệu quả hơn.

---

## 1. Thứ tự học

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Mở Console → tab **All props unstable** → click **Increment** vài lần | Thấy [props] MemoizedCard — prop(s) that broke memo: config, onAction, count, children (ref hoặc value đổi). |
| 2 | Tab **Single prop changes** → click **Increment** | Thấy chỉ **count** broke memo; config và onAction stable. Một prop đổi → memo fail. |
| 3 | Tab **Refactor: split props** → click **Increment** | Chỉ [render] ParentRefactorSplit; không có [render] MemoizedCard. Memo skip vì child chỉ nhận stable props. |
| 4 | Đọc **PR-REVIEW.md** | Sai lầm khi memo, trade-off, khi memoization trở nên fragile. |

---

## 2. Shallow comparison và prop shape

| Khái niệm | Ý nghĩa |
|-----------|---------|
| **Shallow comparison** | React.memo so sánh từng prop bằng Object.is(prevProp, nextProp). Cùng reference (object/function) → skip; reference mới → re-render (dù value giống nhau). |
| **Single changing prop** | Chỉ cần một prop fail (reference hoặc value đổi) là toàn bộ component re-render. Bốn prop stable + một prop đổi → memo vẫn fail. |
| **Prop shape** | Trộn stable và changing props trong một component làm memo dễ fail. Refactor: tách để child chỉ nhận stable props; data đổi để parent (hoặc sibling) hiển thị. |

---

## 3. Refactor: split props

- **Trước:** MemoizedCard nhận id, count, config, onAction, children. count = {tick} → mỗi lần tick đổi → memo fail.
- **Sau:** MemoizedCard chỉ nhận id, config, onAction (và count=0 cố định hoặc bỏ count). tick hiển thị ở parent. Khi tick đổi, parent re-render nhưng MemoizedCard nhận cùng props → memo skip.

---

## 4. Data trong demo — toàn UI state

| Data | Nơi sống | Loại |
|------|----------|------|
| tick | Parent (useState) | UI state |
| config, onAction | Parent (useMemo/useCallback hoặc inline) | Stable ref hoặc mới mỗi render |

Không có server state.
