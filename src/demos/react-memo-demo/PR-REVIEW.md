# PR Review: What React.memo prevents (and does not)

**Reviewer lens:** Senior React — shallow comparison, khi nào memo có tác dụng, sai lầm thường gặp, trade-off và khi memo là net negative.

---

## 1. Tóm tắt thay đổi

- Demo React.memo: **một** child (ExpensiveChild) bọc bằng React.memo.
- **Một** scenario memo thành công: parent truyền stable refs (useMemo/useCallback) → memo skip re-render.
- **Ba** scenario memo không giúp: (1) props reference thay đổi (inline object/function), (2) Context update, (3) children prop thay đổi (inline JSX).
- Render logs rõ ràng: [render], [props] (reference equal true/false), [expensive].

**Verdict:** Implementation đúng; dưới đây là điểm review, misconceptions, và trade-off.

---

## 2. Điểm tốt

- **Shallow comparison** được giải thích và minh họa: value equal vs reference equal; [props] log cho thấy ref equal true/false.
- **Memo works:** useMemo/useCallback với deps ổn định → cùng ref → memo skip; console chỉ còn Parent log.
- **Memo fails (props ref):** Inline `config={{}}` và `onSubmit={() => {}}` → ref mới mỗi render → [props] ref equal false, [expensive] chạy mỗi lần.
- **Memo fails (Context):** Child dùng useContext; khi context value đổi, consumer re-render — memo không ngăn vì re-render do subscription, không phải do props.
- **Memo fails (children):** children là JSX phụ thuộc state → element mới mỗi render → memo không skip.

---

## 3. Common misconceptions về React.memo

| Misconception | Sự thật |
|--------------|--------|
| “Memo ngăn mọi re-render của component.” | Memo chỉ ngăn re-render khi **parent** re-render và **mọi prop cùng reference** với lần trước. Re-render do Context, state trong component, hoặc prop ref mới thì memo không ngăn. |
| “Props value giống nhau là đủ để memo skip.” | Không. Memo dùng **reference** (===). Value equal (nội dung giống) nhưng ref khác (object/function mới) → vẫn re-render. |
| “Memo ngăn re-render do Context.” | Không. Context consumer re-render khi value đổi; đó là re-render do subscription, không phải do “parent truyền props mới”. Memo chỉ so props. |
| “Bọc memo là luôn tốt.” | Sai. Memo có cost (so sánh từng prop mỗi lần parent re-render). Component rẻ + props luôn mới → memo chỉ thêm overhead, không lợi. |
| “Children không phải prop.” | children là prop bình thường. Inline JSX tạo element mới mỗi render → ref mới → memo không skip. |

---

## 4. Trade-offs và khi memo là net negative

| Tình huống | Lợi | Hại |
|------------|-----|-----|
| **Memo + stable props** (useMemo/useCallback) | Giảm re-render component đắt khi parent đổi nhưng props không đổi. | Phải duy trì stable refs (deps, stale closure); code phức tạp hơn. |
| **Memo nhưng props luôn ref mới** (inline {} / () => {} / children) | Không có lợi. | Vẫn trả cost so sánh mỗi lần; code dễ hiểu nhầm “đã tối ưu”. |
| **Memo component rẻ** (chỉ vài node đơn giản) | Ít hoặc không lợi. | So sánh props mỗi lần parent re-render; thêm độ phức tạp. |
| **Memo component dùng Context** | Vẫn có thể lợi khi parent re-render nhưng **props** không đổi (context không đổi). | Khi context đổi, consumer vẫn re-render; memo không chặn. |

**Khi memo là net negative:**

- Component render rất rẻ (chỉ JSX đơn giản).
- Props luôn ref mới (không thể hoặc không đáng dùng useMemo/useCallback cho từng prop).
- Component là context consumer và context thay đổi thường xuyên — memo không ngăn những lần đó.

**Rule:** Dùng memo khi (1) component **đắt** (đo được), (2) parent re-render nhiều nhưng có thể truyền **stable props**, (3) đã đảm bảo không truyền inline object/function/children không ổn định. Không dùng memo “phòng thủ” cho mọi component.

---

## 5. Tóm tắt một dòng

**React.memo chỉ ngăn re-render khi parent re-render và mọi prop giữ reference (shallow compare). Nó không ngăn re-render do prop ref mới, Context update, state trong component, hay children mới; dùng memo chỉ khi component đắt và có stable props.**
