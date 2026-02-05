# Hướng dẫn học: Context và Re-renders

**Mục tiêu:** Hiểu **tại sao Context thường gây re-render rộng**; cách **Context propagation** hoạt động; **object identity** của value; **memo không ngăn** re-render do Context; cách **refactor** (tách context, memo value).

**Điều kiện:** Đã nắm Context (Provider, useContext), memo, Object.is / reference equality.

---

## 1. Thứ tự học (learning path)

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Đọc **README.md** | Nắm propagation, object identity, memo không giúp, refactor. |
| 2 | Tab **Unstable value** → click Increment, mở Console | Thấy 4 [render]: Provider + CounterDisplay, CounterButton, ThemeDisplay. ThemeDisplay không cần count vẫn re-render. |
| 3 | Tab **Memo no help** → click Increment | Vẫn 4 [render]. ThemeDisplay đã bọc memo nhưng vẫn re-render — Context value identity đổi, memo không chặn. |
| 4 | Tab **Refactored** → click Increment | Chỉ 3 [render]: CountProvider, CounterDisplay, CounterButton. ThemeDisplay không log. |
| 5 | **UnstableProviderValue.tsx**, **MemoizedConsumersNoHelp.tsx**, **RefactoredBlastRadius.tsx** | So sánh value (useMemo hay không), memo consumer, tách context. |
| 6 | **PR-REVIEW.md** | Hiểu nhầm thường gặp; trade-offs; khi nào tránh Context. |

---

## 2. Context propagation nội bộ

- **Khi value đổi (theo reference):** React so sánh `Object.is(prevValue, nextValue)`. Nếu false (value mới) → **mọi** consumer của context đó được đánh dấu re-render.
- **Không so sánh sâu:** React không so từng field. Một object mới `{ count: 0, theme: 'dark' }` mỗi render → reference mới → mọi consumer re-render.
- **useMemo cho value:** `useMemo(() => ({ count, theme }), [count, theme])` → value chỉ đổi reference khi count hoặc theme đổi; khi chưa đổi, consumer không re-render vì value reference giữ nguyên.

---

## 3. Memo consumer không ngăn Context re-render

- **memo** chỉ bỏ qua re-render khi **props** của component referentially equal. Re-render do Context không đi qua props — nó do **context value** (từ Provider) đổi. React re-render consumer vì nó dùng `useContext` và value identity đã đổi; memo không can thiệp.
- **Chứng minh:** Tab "Memo no help" — ThemeDisplay bọc memo, chỉ dùng theme. Click Increment (chỉ count đổi) → ThemeDisplay vẫn re-render vì context value object mới.

---

## 4. Refactor: giảm blast radius

- **Tách context:** CountContext (count, setCount) và ThemeContext (theme, setTheme). Consumer chỉ subscribe context cần. Count đổi → chỉ CountContext consumers re-render; ThemeDisplay dùng ThemeContext → không re-render.
- **Memo value:** Trong mỗi Provider, `useMemo(() => ({ ... }), [deps])` để value identity ổn định khi deps chưa đổi.
