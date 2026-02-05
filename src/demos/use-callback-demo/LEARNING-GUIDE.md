# Hướng dẫn học: useCallback — root cause vs symptoms

**Mục tiêu:** Hiểu useCallback **không** sửa nguyên nhân gốc (parent re-render) mà chỉ xử lý **triệu chứng** (reference không ổn định); khi nào useCallback cần thiết, khi nào thêm độ phức tạp mà không có lợi; refactor (context) để không cần useCallback.

**Điều kiện:** Đã nắm React.memo, reference equality, và re-render.

---

## 1. Thứ tự học (learning path)

| Bước | File / hành động | Mục đích |
|------|------------------|----------|
| 1 | Đọc **README.md** | Nắm function identity, useCallback necessary vs no benefit, refactor |
| 2 | Tab **Unstable callback** → click Increment | Callback identity NEW mỗi lần; MemoizedChild re-render mỗi lần |
| 3 | Tab **useCallback necessary** → click Increment | Callback identity SAME; MemoizedChild không re-render |
| 4 | Tab **No benefit** vs **Simplified** | Cùng hành vi; Simplified không dùng useCallback, code đơn giản hơn |
| 5 | Tab **Refactor** → click Increment | Child lấy callback từ context; parent không truyền callback; không useCallback ở parent |
| 6 | **useCallbackIdentityLog.ts** | Log identity (SAME vs NEW) mỗi render |
| 7 | **MemoizedChild.tsx** | Child được memo; nhận onAction; re-render khi reference đổi |
| 8 | **UnstableCallbackParent** vs **StableCallbackParent** | Inline callback → child re-render; useCallback → child skip |
| 9 | **RefactorNoCallback** | Context cung cấp callback; kiến trúc thay đổi, không cần useCallback ở parent |
| 10 | **PR-REVIEW.md** | Sai lầm hay gặp, trade-off, khi nào không dùng useCallback |

---

## 2. Khái niệm: Root cause vs symptom

| Thuật ngữ | Nghĩa |
|-----------|--------|
| **Root cause** | Parent re-render vì state của nó đổi (ví dụ count). useCallback **không** ngăn parent re-render. |
| **Symptom** | Callback reference thay đổi mỗi render (inline function) → memoized child nhận prop mới → re-render. useCallback **ổn định reference** để memo có thể bỏ qua re-render khi chỉ parent state đổi. |
| **Fixing reference instability** | useCallback: cùng reference khi deps không đổi → memo so sánh prev === next → skip. |
| **Fixing architecture** | Thay đổi kiến trúc (ví dụ context cung cấp callback) để parent không cần truyền callback → không cần useCallback ở parent. |

---

## 3. Bài tập

1. **StableCallbackParent:** Tạm bỏ useCallback, dùng inline callback. Click Increment — MemoizedChild có re-render mỗi lần không? So sánh với có useCallback.
2. **RefactorNoCallback:** Nếu không dùng context, mà vẫn muốn child không re-render khi parent re-render (count), có cách nào khác không? (Gợi ý: useCallback ở parent là một cách; context là cách khác.)
3. Khi nào **không** nên dùng useCallback? (Xem PR-REVIEW.)
