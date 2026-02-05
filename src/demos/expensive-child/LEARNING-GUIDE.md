# Hướng dẫn học: Expensive Child Demo

**Mục tiêu:** Hiểu **value equality** (bằng giá trị) vs **reference equality** (bằng tham chiếu); tại sao `memo` “thất bại” khi parent truyền inline object/function; khi nào dùng `useMemo`/`useCallback` để ổn định props cho child đắt; tránh tối ưu quá mức.

**Điều kiện:** Đã học xong demo **re-render** (re-render vs DOM update, parent re-render → mặc định mọi child re-render, `memo` + stable props).

---

## 1. Thứ tự học

| Bước | File / hành động | Mục đích |
|------|------------------|----------|
| 1 | Đọc **README.md** | Nắm value equal vs reference equal; broken vs fixed. |
| 2 | Chạy app → tab **Broken** → mở Console → click **Increment parent state** vài lần | Thấy ParentBroken + ExpensiveChild re-render mỗi lần; `[props]` có `reference equal: false`; `[expensive]` có thời gian giả lập. |
| 3 | Chuyển tab **Fixed** → click **Increment parent state** vài lần | Thấy chỉ ParentFixed re-render; ExpensiveChild **không** log (memo skip). |
| 4 | **types.ts** | ChildConfig — object truyền xuống; mỗi lần tạo mới = reference mới. |
| 5 | **ExpensiveChild.tsx** | Child được memo; nhận config + onSubmit; có “expensive” work giả lập; dùng usePropReferenceLog để xem value vs ref. |
| 6 | **ParentBroken.tsx** | Inline config={{ }} và onSubmit={() => {}} → reference mới mỗi render → memo không skip. |
| 7 | **ParentFixed.tsx** | useMemo cho config, useCallback cho onSubmit → cùng reference → memo skip. |
| 8 | **usePropReferenceLog.ts** | Cách so value equal (JSON) vs reference equal (===); vì sao lưu prev trong ref + cập nhật trong effect. |
| 9 | **PR-REVIEW.md** | Sai lầm hay gặp, trade-off, khi nào không nên memo/useMemo/useCallback. |

---

## 2. Khái niệm bắt buộc: Value equal vs Reference equal

| Thuật ngữ | Nghĩa | React dùng? |
|-----------|--------|-------------|
| **Value equal** | Nội dung “giống nhau” (ví dụ `{ theme: 'dark' }` vs `{ theme: 'dark' }`). Có thể so bằng JSON.stringify hoặc deep equal. | **Không** dùng cho so sánh props trong memo. |
| **Reference equal** | Cùng một object/function trong bộ nhớ (prev === next). | **Có.** React.memo so sánh **nông** và dùng Object.is (reference cho object/function). |

**Kết luận:** “Props trông giống nhau” (value) **không** đủ để memo bỏ qua re-render. Props phải **referentially equal** (cùng reference) thì shallow compare mới pass.

**Trong demo:** ParentBroken mỗi lần render tạo `config = { theme: 'dark', pageSize: 10 }` và `onSubmit = (value) => { ... }` → object/function **mới** → prevProps.config !== nextProps.config → memo không skip → ExpensiveChild chạy lại và “expensive” work chạy lại.

---

## 3. Data trong demo — toàn bộ UI state

| Data | Nơi sống | Loại | Ghi chú |
|------|----------|------|---------|
| count | ParentBroken / ParentFixed (useState) | UI state | Chỉ để kích hoạt re-render parent; không dùng trong ExpensiveChild. |
| mode | ExpensiveChildDemo (useState) | UI state | Chọn Broken vs Fixed. |
| config | Parent: useMemo (Fixed) hoặc inline (Broken) | Derived / inline | Không phải server state; là cấu hình ổn định hoặc tạo mới mỗi lần. |
| onSubmit | Parent: useCallback (Fixed) hoặc inline (Broken) | Callback | Ổn định reference (Fixed) hoặc mới mỗi lần (Broken). |

**Tại sao không Context/Redux?** Demo chỉ minh họa quan hệ 1 parent → 1 child và prop identity. State local ở parent là đủ.

---

## 4. Từng file — học gì từ code

### 4.1 ExpensiveChild.tsx — Memo + “expensive” work

- **Memo:** Component được bọc memo(ExpensiveChildInner) → React so sánh props **nông** (reference cho object/function).
- **Simulated work:** simulateExpensiveWork() (vòng lặp) khiến mỗi lần re-render “đắt” → dễ thấy lợi ích khi memo skip.
- **usePropReferenceLog:** In ra value equal vs reference equal cho config và onSubmit → thấy rõ “giá trị giống nhau” nhưng “reference khác” (Broken) và “reference giống” (Fixed).

**Bài tập:** Tạm bỏ memo (export ExpensiveChildInner thay vì memo(ExpensiveChildInner)). Ở tab Fixed, click Increment — ExpensiveChild vẫn re-render dù props reference ổn định, vì không còn memo để skip.

### 4.2 ParentBroken.tsx — Inline = reference mới mỗi lần

- Mỗi lần ParentBroken render: `config={{ theme: 'dark', pageSize: 10 }}` là **object mới**, `onSubmit={(value) => { ... }}` là **function mới**.
- memo so: prev.config === next.config → false, prev.onSubmit === next.onSubmit → false → re-render.

**Bài tập:** Đổi thành config={obj} với `const obj = { theme: 'dark', pageSize: 10 }` khai báo **trong** component (không useMemo). Kết quả vẫn giống Broken: mỗi lần hàm chạy lại là một object mới.

### 4.3 ParentFixed.tsx — useMemo + useCallback = stable refs

- useMemo(..., []): factory chạy một lần, cùng reference trả về mỗi lần render.
- useCallback(..., []): cùng function reference mỗi lần render.
- memo so: prev.config === next.config → true, prev.onSubmit === next.onSubmit → true → **skip** re-render.

**Bài tập:** Thêm dep vào useCallback: [count]. Mỗi lần count đổi, onSubmit là reference mới → ExpensiveChild re-render khi count đổi. Dùng khi callback thực sự cần count (tránh stale closure); đổi lại [] khi không cần.

### 4.4 usePropReferenceLog — Value vs reference, lưu prev trong ref

- **Value equal:** So bằng JSON.stringify (hoặc [Function] cho function) — “nhìn vào nội dung”.
- **Reference equal:** So bằng === — “cùng một tham chiếu”.
- **Prev props:** Lưu trong useRef; **cập nhật trong useEffect** sau commit. Lý do: so sánh với “props lần render trước”. Nếu cập nhật trong render thì prev và current cùng lần render, so sánh sai. Effect chạy sau commit nên lần render tiếp theo mới có prev đúng.

---

## 5. Liên hệ với demo re-render

| Demo | Nhấn mạnh |
|------|------------|
| **re-render** | Re-render vs DOM update; parent re-render → mọi child re-render; memo + stable props để skip; nhiều child (primitive, inline object, stable, callback). |
| **expensive-child** | **Một** child đắt; value vs reference rõ ràng (log); broken (inline) vs fixed (useMemo/useCallback); khi nào memo “có tác dụng” và khi nào không. |

Cả hai đều dạy: **memo chỉ hữu ích khi props referentially stable**; inline object/function phá memo.

---

## 6. Khi nào KHÔNG nên dùng memo / useMemo / useCallback

- **Chưa đo:** Đừng tối ưu “phòng thủ”. Dùng React DevTools Profiler tìm component thực sự chậm.
- **Child rẻ:** Component nhỏ, render nhanh → chi phí so sánh props của memo có thể không đáng.
- **Props luôn thay đổi:** Nếu config/onSubmit phụ thuộc state thay đổi liên tục, stable ref khó hoặc gây stale closure; memo ít khi skip.
- **Memo nhưng không ổn định props:** Như ParentBroken — memo vô dụng.

**Stale closure:** useCallback(fn, []) giữ function tham chiếu đến state cũ. Nếu callback cần state mới nhất, phải thêm deps → ref đổi khi deps đổi → memo skip ít hơn. Trade-off: đúng logic vs ít re-render.

---

## 7. Checklist tự kiểm tra

- [ ] Value equal và reference equal khác nhau thế nào? React.memo dùng cái nào?
- [ ] Tại sao ParentBroken khiến ExpensiveChild re-render mỗi lần dù “giá trị” config/onSubmit không đổi?
- [ ] ParentFixed làm gì để ExpensiveChild không re-render khi chỉ count đổi?
- [ ] Trong usePropReferenceLog, vì sao prev props được cập nhật trong useEffect thay vì trong render?
- [ ] Khi nào không nên bọc component trong memo hoặc wrap mọi prop trong useMemo/useCallback?
- [ ] Nếu onSubmit cần dùng count bên trong, nên deps useCallback là [] hay [count]? Trade-off?

---

## 8. Bước tiếp theo

- Dùng **React DevTools → Profiler**: ghi khi click Increment (Broken vs Fixed), xem thời gian render của ExpensiveChild.
- Đọc lại **re-render** (ChildUnstableProps vs ChildStableProps / ChildWithCallback) để gộp: re-render mặc định + prop identity + memo.
- Thử **custom compare** cho memo (tham số thứ hai của memo(Comp, (prev, next) => ...)) khi cần so sánh “value” thay vì reference — nhớ là custom compare cũng có chi phí.

---

**Tóm tắt:** “Props trông giống nhau” = so theo giá trị (value). React.memo so theo **reference** (===). Inline {} hoặc () => {} tạo reference mới mỗi lần render → memo không skip được. Dùng useMemo/useCallback để giữ reference ổn định khi có child đắt và đã bọc memo. Chỉ tối ưu sau khi đo.
