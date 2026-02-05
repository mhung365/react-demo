# PR Review: Memoized component with changing props

**Reviewer lens:** Senior React — shallow comparison, single prop invalidating memo, prop shape, refactor (split props), common mistakes, trade-offs, when memoization becomes fragile.

---

## 1. Tóm tắt thay đổi

- Demo: **một** child (MemoizedCard) bọc React.memo, nhận **nhiều** props (id, count, config, onAction, children).
- **usePropChangeLog:** So sánh props với lần render trước (shallow), log **prop nào** broke memo (ref hoặc value đổi).
- **All props unstable:** Inline config, onAction, count={tick}, children → mọi prop đổi → memo fail mỗi lần.
- **Single prop changes:** Chỉ count={tick} đổi; config và onAction stable → log chỉ ra **count** broke memo.
- **Refactor: split props:** Child chỉ nhận stable props; tick hiển thị ở parent → memo skip khi tick đổi.

**Verdict:** Implementation đúng; dưới đây là điểm review, sai lầm thường gặp, và khi memo trở nên fragile.

---

## 2. Điểm tốt

- **Shallow comparison** được minh họa rõ: [props] log từng key refEqual/valueEqual; user thấy “prop X broke memo”.
- **Reference vs value:** All-unstable cho thấy config/onAction đổi reference (value có thể giống); memo vẫn re-render.
- **Single changing prop:** ParentSingleChanging cho thấy chỉ một prop (count) đổi vẫn làm cả component re-render; prop shape: trộn stable + changing làm memo fragile.
- **Refactor:** ParentRefactorSplit tách responsibility — child chỉ nhận stable props; memo hiệu quả trở lại (không [render] MemoizedCard khi tick đổi).

---

## 3. Common mistakes khi memoizing components

| Sai lầm | Hậu quả | Cách tránh |
|--------|---------|------------|
| **Memo component nhưng vẫn truyền inline object/function** | Reference mới mỗi render → memo không bao giờ skip. | useMemo/useCallback cho object/function; hoặc refactor để child không nhận prop đó. |
| **Truyền “một prop đổi” cùng nhiều prop stable** | Một prop đổi (vd count) làm toàn bộ memo fail; các prop stable không giúp được. | Split: child chỉ nhận stable props; data đổi để parent/sibling render. |
| **Một object “data” chứa cả stable và changing fields** | Mỗi lần parent re-render tạo object mới → reference đổi → memo fail. | Tách thành từng prop (stable dùng useMemo, changing truyền riêng) hoặc split component. |
| **children là JSX phụ thuộc state** | children là prop; JSX mới mỗi render → reference đổi → memo fail. | Tránh truyền children phụ thuộc state vào memo child; hoặc tách phần “changing” ra ngoài. |
| **Memo “phòng thủ” không đo** | Component rẻ + props luôn đổi → memo không skip, chỉ thêm so sánh. | Chỉ memo khi đã đo (component đắt, hoặc re-render không cần thiết); đảm bảo stable props. |

---

## 4. Trade-offs và khi memoization trở nên fragile

| Tình huống | Lợi | Rủi ro / fragile |
|------------|-----|-------------------|
| **Memo + mọi prop stable** | Giảm re-render khi parent đổi nhưng props không đổi. | Phải duy trì stable refs (useMemo/useCallback, deps). |
| **Memo + một prop đổi (vd count)** | Không có lợi — memo luôn fail. | Dễ tưởng “đã tối ưu” trong khi child vẫn re-render mỗi lần. |
| **Refactor split props** | Child chỉ nhận stable props → memo skip. | Prop shape thay đổi (nhiều component hơn hoặc API khác); data đổi có thể phải đọc từ parent/sibling. |
| **“Big data” object** | Một prop duy nhất. | Bất kỳ field nào đổi → object mới → reference đổi → memo fail. Fragile: thêm một field đổi là vô hiệu hóa memo. |

**Khi memoization fragile:**

- Nhiều props, trong đó một vài prop dễ đổi (inline, hoặc phụ thuộc state).
- Một object “data” gộp nhiều thứ; chỉ cần một field đổi là reference đổi.
- children hoặc callback phụ thuộc state được truyền vào memo child.

**Rule:** Memo chỉ hiệu quả khi **toàn bộ** props có thể ổn định (reference) khi parent re-render. Nếu không thể, refactor: split props hoặc tách component để memo boundary chỉ nhận stable props.

---

## 5. Tóm tắt một dòng

**React.memo so sánh từng prop (shallow); một prop đổi (reference hoặc value) là cả component re-render. Prop shape và responsibility quan trọng: refactor (split props) để memo boundary chỉ nhận stable props thì memo mới hiệu quả.**
