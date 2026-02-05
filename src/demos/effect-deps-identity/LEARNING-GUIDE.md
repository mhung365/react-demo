# Hướng dẫn học: useEffect deps — reference identity

**Mục tiêu:** Hiểu tại sao **useEffect vẫn chạy lại** dù dependency "trông không đổi"; **reference identity** (Object.is); cách sửa: ổn định deps (useMemo/useCallback) hoặc bỏ effect (event handler).

**Điều kiện:** Đã nắm useEffect, dependency array, và effect lifecycle.

---

## 1. Thứ tự học (learning path)

| Bước | File / hành động | Mục đích |
|------|------------------|----------|
| 1 | Đọc **README.md** | Nắm Object.is, reference identity, stabilize vs no effect |
| 2 | Tab **Unstable deps** → click Increment vài lần | Effect run count tăng mỗi lần; console: same=false, ref equal=false |
| 3 | Tab **Stable deps** → click Increment | Effect run count = 1; không chạy lại |
| 4 | Tab **No effect** → đổi theme, bấm Apply | Sync chỉ khi bấm Apply; không có effect |
| 5 | **useDepsCompareLog.ts** | Log prev vs current deps với Object.is; giải thích vì sao effect re-run |
| 6 | **UnstableDepsBug** | config và onComplete tạo mới mỗi render → reference mới → effect chạy lại |
| 7 | **StableDepsRefactored** | useMemo(config), useCallback(onComplete) → reference ổn định |
| 8 | **NoEffectRefactored** | Bỏ effect; xử lý "Apply" trong onClick |
| 9 | **PR-REVIEW.md** | Sai lầm hay gặp, trade-off, khi nào stabilize là ý tưởng tồi |

---

## 2. Khái niệm: Reference identity

| Thuật ngữ | Nghĩa |
|-----------|--------|
| **Object.is** | React so sánh từng dep với giá trị lần trước bằng Object.is. Với object/function: cùng reference → true; object/function mới mỗi render → false → effect chạy lại. |
| **Reference identity** | Hai giá trị "trông giống nhau" (ví dụ { theme: 'dark' }) nhưng là hai reference khác nhau (object mới mỗi lần tạo) → Object.is trả về false → "đã đổi." |
| **Derived values** | Biến dạng `const config = { theme, count }` tạo object mới mỗi render. Đưa config vào deps → effect chạy mỗi render. |
| **Stabilize** | useMemo cho object/array; useCallback cho function. Reference giữ ổn định cho đến khi deps của chúng đổi. Hoặc bỏ effect và dùng event handler. |

---

## 3. Bài tập

1. **UnstableDepsBug:** Đổi config thành `useMemo(() => ({ theme: 'dark', count }), [count])`. Giải thích: effect chạy khi nào? So với deps `[config, onComplete]` và config không useMemo.
2. **NoEffectRefactored:** Nếu product yêu cầu "sync theme lên server ngay khi user đổi theme" (mỗi lần đổi select), có nên chuyển lại sang effect không? Khi nào dùng effect, khi nào dùng event?
3. Khi nào **không** nên stabilize bằng useMemo/useCallback? (Xem PR-REVIEW.)
