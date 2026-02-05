# What React.memo prevents (and does not)

**Mục tiêu:** Hiểu React.memo hoạt động nội bộ (shallow comparison); khi nào memo chặn re-render, khi nào không; tại sao Context/state không bị memo chặn.

---

## 1. Thứ tự học

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Mở Console → tab **Memo works** → click **Increment** vài lần | Chỉ thấy [render] Parent; không thấy [render] ExpensiveChild hay [expensive]. Memo đã skip. |
| 2 | Tab **Memo fails: props ref** → click **Increment** | Thấy [props] reference equal: false; [expensive] mỗi lần. Inline {} và () => {} → ref mới → memo không skip. |
| 3 | Tab **Memo fails: Context** → click **Change theme** | Thấy [render] ExpensiveChild (context) và [expensive] dù props có thể stable. Context thay đổi → consumer re-render; memo không chặn. |
| 4 | Tab **Memo fails: children** → click **Increment** | Thấy ExpensiveChild re-render mỗi lần. children là JSX mới mỗi render → ref mới → memo không skip. |
| 5 | Đọc **PR-REVIEW.md** | Sai lầm thường gặp, trade-off, khi memo là net negative. |

---

## 2. Shallow comparison

React.memo so sánh **nông** từng prop: `Object.is(prevProp, nextProp)`.

| Loại prop | Same value/ref | Kết quả |
|-----------|----------------|---------|
| Primitive (number, string, boolean) | Cùng giá trị | Skip re-render |
| Object / function | **Cùng reference** (===) | Skip re-render |
| Object / function | **Reference mới** (inline {} hoặc () => {}) | Re-render |

“Giá trị giống nhau” (value equal) **không đủ**; phải **reference equal** (cùng ref) thì memo mới skip.

---

## 3. Memo prevents gì?

- **Chỉ** re-render do “parent re-render và truyền **cùng** props (referentially)”.
- Nếu mọi prop đều === với lần trước → component body không chạy lại.

---

## 4. Memo KHÔNG prevents gì?

| Nguyên nhân re-render | Tại sao memo không chặn |
|-----------------------|-------------------------|
| **Props reference thay đổi** | Inline `{}` hoặc `() => {}` → ref mới mỗi render → shallow compare fail. |
| **Context value thay đổi** | Re-render do **subscription** (consumer của context), không phải do “parent truyền props mới”. Memo chỉ so props. |
| **State trong chính component** | useState/useReducer trong component → re-render; memo không liên quan. |
| **children prop mới** | JSX inline `<Child>{tick}</Child>` → children là element mới mỗi lần → ref mới → memo không skip. |

---

## 5. Data trong demo — toàn UI state

| Data | Nơi sống | Loại |
|------|----------|------|
| tick | Parent (useState) | UI state |
| theme | MemoFailsContext (useState) | UI state |
| config, onSubmit | Parent (useMemo/useCallback hoặc inline) | Derived / stable ref hoặc mới mỗi render |

Không có server state.
