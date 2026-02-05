# Hướng dẫn học: State Object vs Multiple useState

**Mục tiêu:** Hiểu trade-off khi gom state vào một object so với nhiều `useState`; thấy re-render và effect deps; biết khi nào gom state là hợp lý.

**Điều kiện:** Đã dùng `useState`, `useEffect`, hiểu reference equality (object so sánh theo tham chiếu).

---

## 1. Thứ tự học (learning path)

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Đọc **README.md** | Nắm vấn đề: object mới mỗi lần setState → re-render con, effect chạy mỗi lần. |
| 2 | Mở **Single state object** → Console → gõ vài ký tự vào Search | Thấy parent + FilterSummarySingle re-render mỗi keystroke; effect count tăng mỗi lần. |
| 3 | **Multiple useState** → gõ vào Search | Parent re-render; PageSizeDisplay (chỉ nhận pageSize) không re-render. Effect chỉ chạy khi giá trị thay đổi. |
| 4 | **Refactored** → gõ Search / đổi Page size | SearchStatusSummary và PaginationSummary chỉ re-render khi props của chúng đổi. Reset = 4 setState (hoặc có thể dùng reducer nếu muốn một setState). |
| 5 | **When grouping is beneficial** | Reset một lần setState(DEFAULT); submit dùng cả object; chỉ một consumer dùng toàn bộ field → gom object chấp nhận được. |
| 6 | Đọc **SingleStateObject.tsx** | setFilter(prev => ({ ...prev, search })) → object mới → [filter] trong effect luôn khác. |
| 7 | Đọc **MultipleUseState.tsx** | useEffect([search, status, page, pageSize]) — primitive deps; PageSizeDisplay chỉ nhận pageSize + memo. |
| 8 | **PR-REVIEW.md** | Sai lầm hay gặp, trade-off, khi nào gom state. |

---

## 2. Khái niệm bắt buộc

### 2.1 Reference equality và object state

- React so sánh dependency trong useEffect bằng **Object.is** (reference cho object).
- `setState(newObj)` dù `newObj` có nội dung giống cũ → reference khác → component re-render, effect có dep `[state]` chạy lại.
- Với một object: mỗi lần update một field bạn thường làm `setState(prev => ({ ...prev, field: value }))` → object mới mỗi lần → reference luôn đổi.

### 2.2 Re-render của con khi nhận object

- Con nhận prop là **object** (ví dụ `filter`). Mỗi lần parent setState object mới → prop `filter` là reference mới → React coi prop đổi → con re-render (dù con chỉ dùng `filter.pageSize` và pageSize không đổi).
- Con nhận prop là **primitive** (ví dụ `pageSize`). Parent đổi `search` nhưng không đổi `pageSize` → prop `pageSize` cùng giá trị → React so sánh primitive → con không re-render (nếu không có state/contex khác).

### 2.3 Effect dependency với object

- `useEffect(fn, [state])` với `state` là object: mỗi lần parent update bất kỳ field nào → state = object mới → effect chạy. Không thể "chỉ chạy khi field A đổi" nếu dep là cả object.
- `useEffect(fn, [search, status, page, pageSize])`: effect chỉ chạy khi một trong các giá trị này đổi (so sánh theo value).

---

## 3. Khi nào gom state vào một object là hợp lý?

| Tình huống | Gom object | Nhiều useState |
|------------|------------|----------------|
| Reset form một lần | setState(DEFAULT) gọn | Nhiều setState hoặc dùng useReducer |
| Gửi API / persist cả filter | Có thể derive object từ useMemo([search, status, page, pageSize]) | Dễ pass từng field, derive object khi cần |
| Con chỉ cần một field | Con re-render mỗi khi bất kỳ field nào đổi (tệ) | Truyền đúng field → con chỉ re-render khi field đó đổi |
| Chỉ một consumer dùng toàn bộ object (submit preview) | Chấp nhận được | Vẫn có thể dùng useMemo để tạo object từ nhiều state |

**Kết luận:** Gom object hợp lý khi (1) reset atomic, (2) một consumer dùng hết tất cả field, (3) không có con nào chỉ cần một phần. Nếu có con chỉ cần một field → ưu tiên nhiều useState và truyền đúng prop.

---

## 4. Từng file — học gì từ code

### SingleStateObject.tsx

- `const [filter, setFilter] = useState<FilterState>(...)`. Mỗi onChange: `setFilter(prev => ({ ...prev, search: e.target.value }))` → object mới.
- FilterSummarySingle nhận `filter` → mỗi lần parent update bất kỳ field nào → filter reference mới → FilterSummarySingle re-render.
- useEffect([filter]) → filter luôn reference mới khi có update → effect chạy mỗi lần.

### MultipleUseState.tsx

- Bốn useState: search, status, page, pageSize. PageSizeDisplay nhận chỉ `pageSize` (number), bọc memo → khi search đổi, pageSize không đổi → PageSizeDisplay không re-render.
- useEffect([search, status, page, pageSize]) → chỉ chạy khi một trong bốn giá trị thay đổi.

### RefactoredClear.tsx

- Nhiều useState; SearchStatusSummary chỉ nhận search, status; PaginationSummary chỉ nhận page, pageSize. filterAsObject = useMemo(() => ({ search, status, page, pageSize }), [search, status, page, pageSize]) — dùng khi cần gửi API hoặc reset (reset vẫn gọi 4 setState; có thể dùng useReducer nếu muốn một dispatch).

### WhenGroupingBeneficial.tsx

- Một useState(filter). Reset: setFilter(DEFAULT_FILTER). Submit: dùng trực tiếp filter. Chỉ một panel dùng toàn bộ filter (preview) → không có con chỉ cần một field → gom object ở đây chấp nhận được.

---

## 5. Tóm tắt

- **Một object:** setState luôn tạo reference mới → con nhận object re-render mỗi lần; effect([state]) chạy mỗi lần.
- **Nhiều useState:** Truyền đúng prop cho từng con → con chỉ re-render khi prop đó đổi; effect deps là primitive → chạy đúng lúc.
- **Khi vẫn cần "một object":** Dùng useMemo derive từ nhiều state, không lưu cả object trong một useState nếu có con chỉ cần một phần.
- **Gom object hợp lý:** Reset atomic, submit/persist cả khối, và chỉ một consumer dùng hết; không pass object xuống con chỉ cần một field.

Sau khi làm xong demo, đọc **PR-REVIEW.md** để xem sai lầm hay gặp và cách review trong PR.
