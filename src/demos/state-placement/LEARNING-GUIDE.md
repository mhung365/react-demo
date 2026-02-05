# Hướng dẫn học: State Colocation vs Lifting Up

**Mục tiêu:** Hiểu **khi nào colocate state** và **khi nào lift state**; thấy **re-render scope**, **prop drilling**, và **khi nào lifting trở thành anti-pattern** (lift quá cao + cây sâu).

**Điều kiện:** Đã nắm re-render (parent re-render → children re-render), và memo (shallow compare props).

---

## 1. Thứ tự học (learning path)

| Bước | File / hành động | Mục đích |
|------|------------------|----------|
| 1 | Đọc **README.md** | Nắm colocate vs lift; Basics (3 biến thể) + Lifting anti-pattern (3 biến thể). |
| 2 | Chạy app → **Basics** → **Colocated too low** → Console | Thấy Filters/List/Detail mỗi panel có state riêng; List không filter được; Detail không nhận selectedId. |
| 3 | **Basics** → **Lifted too high** → gõ search | `[render]` Dashboard, FiltersPanel, ListPanel, DetailPanel mỗi keystroke. |
| 4 | **Basics** → **Balanced** → gõ search | Dashboard, Filters, List re-render; Detail (memo) không. |
| 5 | **Lifting anti-pattern** → **Lifted deep (drilling)** → gõ search | **6 components** re-render: Dashboard, Layout, ContentArea, Filters, List, Detail. Layout/ContentArea chỉ forward 8 props (prop drilling). |
| 6 | **Lifting anti-pattern** → **Memo band-aid** → gõ search | 5 re-render (Detail skip); Layout/ContentArea vẫn re-render và vẫn drill 8 props. Memo là band-aid, không sửa cấu trúc. |
| 7 | **Lifting anti-pattern** → **Refactored (placed correctly)** → gõ search | Chỉ **3** re-render: ContentArea, Filters, List. Dashboard và Layout **không** log. State ở ContentArea (minimal ancestor); không drill qua Layout. |
| 8 | **types.ts**, **useRenderLog.ts** | Dữ liệu dashboard; log re-render scope. |
| 9 | **ColocatedTooLow.tsx** … **BalancedState.tsx** | Basics: colocated quá thấp, lifted quá cao, balanced. |
| 10 | **LiftedTooHighDeep.tsx**, **MemoBandAid.tsx**, **RefactoredCorrectly.tsx** | Lifting anti-pattern: deep tree + drilling, memo band-aid, refactor (state ở ContentArea). |
| 11 | **PR-REVIEW.md** | Sai lầm, hiểu nhầm về “lifting state up”, khi nào lift vẫn đúng. |

---

## 2. Khái niệm bắt buộc: Colocate vs Lift

| Thuật ngữ | Nghĩa | Khi nào dùng |
|-----------|--------|---------------|
| **Colocate** | State sống trong component (hoặc subtree) **duy nhất** cần đọc/ghi nó. | Chỉ một component cần state → giữ state ở đó. Re-render scope nhỏ, ít prop drilling. |
| **Lift to minimal common ancestor** | Đưa state lên component tổ tiên **nhỏ nhất** mà từ đó mọi component cần state đều là con (direct hoặc indirect). | Hai hoặc nhiều sibling (hoặc cây con) cần cùng state → lift lên ancestor chung nhỏ nhất. Không lift “càng cao càng tốt.” |

**Colocated too low:** State ở A; B cần đọc/ghi → không thể share → không implement được tính năng (filter list, show selected in detail). **Prevents feature growth.**

**Lifted too high:** Mọi state chung ở một root → mỗi thay đổi state re-render toàn bộ cây → component chỉ cần một phần state (e.g. Detail chỉ cần selectedItem) vẫn re-render khi searchQuery đổi. **Unnecessary re-renders.** Giải pháp: state vẫn ở common ancestor nhưng **memo** component chỉ phụ thuộc một phần (Detail) + truyền props ổn định (selectedItem từ useMemo) → Detail skip re-render khi searchQuery/statusFilter đổi.

---

## 3. Data trong demo — toàn bộ UI state

| Data | Nơi sống (Colocated / Lifted / Balanced) | Loại | Ghi chú |
|------|------------------------------------------|------|---------|
| searchQuery | Filters (colocated) / Dashboard (lifted, balanced) | UI state | Colocated: chỉ Filters biết; List không nhận → không filter. Lifted/balanced: Dashboard hold → Filters + List dùng. |
| statusFilter | Filters (colocated) / Dashboard (lifted, balanced) | UI state | Tương tự searchQuery. |
| selectedId | List (colocated) / Dashboard (lifted, balanced) | UI state | Colocated: chỉ List biết; Detail không nhận. Lifted/balanced: Dashboard hold → List + Detail dùng. |
| items / filteredItems | List (colocated) / Dashboard derived (lifted, balanced) | Derived / local | Colocated: List giữ MOCK_ITEMS local. Lifted/balanced: Dashboard filter bằng searchQuery + statusFilter → filteredItems. |

**Tại sao không Context/Redux?** Demo minh họa **ownership** và **re-render scope**; prop drilling từ Dashboard xuống là đủ. Ở app thật, nếu drilling quá sâu có thể dùng context (với trade-off: context change re-render mọi consumer).

---

## 4. Từng file — học gì từ code

### 4.1 ColocatedTooLow.tsx — State colocated quá thấp

- **FiltersPanelColocated:** `useState` searchQuery, statusFilter. List không nhận props này → **không thể filter list**.
- **ListPanelColocated:** `useState` items, selectedId. Detail không nhận selectedId → **không thể hiển thị item chọn trong Detail**.
- **DetailPanelColocated:** Chỉ render “Select an item” — không có selectedId/selectedItem.

**Bài tập:** Yêu cầu “filter list theo search” → bắt buộc phải lift searchQuery (và statusFilter) lên component cha chứa cả Filters và List (minimal common ancestor). Colocating trong Filters khiến feature không implement được.

### 4.2 LiftedTooHigh.tsx — State lift quá cao (anti-pattern)

- **Dashboard** giữ searchQuery, statusFilter, selectedId. Mỗi khi setSearchQuery (e.g. keystroke) → Dashboard re-render → **FiltersPanelLifted, ListPanelLifted, DetailPanelLifted đều re-render** (vì là con, không memo).
- **DetailPanelLifted** chỉ cần selectedItem. selectedItem không đổi khi searchQuery đổi → re-render Detail là **thừa**.

**Bài tập:** Mở console, gõ vài ký tự vào search. Đếm `[render] DetailPanel (lifted)` — mỗi keystroke một lần. Đó là unnecessary re-render.

### 4.3 BalancedState.tsx — Cân bằng: minimal ancestor + memo

- State vẫn ở Dashboard (minimal common ancestor) để Filters, List, Detail share.
- **DetailPanelBalanced** bọc bằng `memo`. Props: chỉ `selectedItem`. selectedItem từ `useMemo(..., [selectedId])` → khi searchQuery/statusFilter đổi, selectedId không đổi → selectedItem reference không đổi → memo so sánh prevSelectedItem === nextSelectedItem → **skip re-render**.
- Gõ search: Dashboard, Filters, List re-render; Detail **không** re-render. Click item: selectedId đổi → selectedItem đổi → Detail re-render.

**Bài tập:** So sánh console giữa Lifted too high (Detail re-render mỗi keystroke) và Balanced (Detail chỉ re-render khi đổi selection).

### 4.4 useRenderLog.ts — Đo re-render scope

- Mỗi lần component function chạy (re-render), log `[render] ComponentName #n` (+ meta). Dùng để **thấy** state placement ảnh hưởng đến scope: state đổi ở đâu thì các component nào re-render.

### 4.5 LiftedTooHighDeep.tsx — Lift quá cao + cây sâu (prop drilling)

- **Dashboard** giữ state; render **Layout** với 8 props (searchQuery, statusFilter, selectedId, callbacks, filteredItems, selectedItem).
- **Layout** không dùng state — chỉ forward 8 props xuống **ContentArea**. Một keystroke → Dashboard, Layout, ContentArea, Filters, List, Detail đều re-render (**blast radius: 6**). Prop drilling: Layout và ContentArea phải nhận và forward props không dùng → API dễ vỡ (thêm state là phải sửa mọi tầng).

### 4.6 MemoBandAid.tsx — Memo chỉ là band-aid

- Cùng cây với LiftedTooHighDeep; thêm **memo(Detail)** và truyền selectedItem (useMemo). Gõ search → Detail skip; còn **5** component re-render (Dashboard, Layout, ContentArea, Filters, List). Prop drilling không đổi; Layout/ContentArea vẫn nhận 8 props. Memo sửa triệu chứng (Detail không re-render thừa), không sửa cấu trúc (state vẫn quá cao, drilling vẫn nhiều).

### 4.7 RefactoredCorrectly.tsx — State ở minimal ancestor

- **Dashboard** không có state; render **Layout** với `children` (ContentArea). **ContentArea** giữ state (searchQuery, statusFilter, selectedId) và render Filters, List, Detail. Khi user gõ search: chỉ ContentArea re-render (vì state ở đây) → Filters, List re-render; **Dashboard và Layout không re-render** (parent của Layout là Dashboard, Dashboard không re-render). Blast radius: **3** (ContentArea, Filters, List). Detail memoized → chỉ re-render khi selectedItem đổi. Không drill props qua Layout; Layout chỉ nhận `children`.

---

## 5. Rule of thumb

- **Chỉ một component cần state?** → Colocate. Re-render scope nhỏ, code đơn giản.
- **Nhiều component (siblings hoặc cây con) cần cùng state?** → Lift lên **minimal common ancestor**. Không lift lên root “để dễ share” nếu không cần — sẽ gây re-render rộng.
- **Đã lift, nhưng một số con chỉ cần một phần state?** → Giữ state ở ancestor, nhưng **memo** con đó và chỉ truyền props nó cần (ổn định bằng useMemo/useCallback nếu cần) → con skip re-render khi phần state nó không dùng thay đổi.

---

## 6. Khi nào colocate sai (prevents feature growth)

- Filter list theo search/status nhưng search/status lại nằm trong component Filters, List không nhận → không filter được. Phải lift filter state lên cha chung của Filters và List.
- Detail cần hiển thị item được chọn nhưng selectedId nằm trong List → Detail không nhận selectedId. Phải lift selectedId lên cha chung của List và Detail.

## 7. Khi nào lift sai (unnecessary re-renders + prop drilling)

- Toàn bộ state chung đặt ở root → mỗi thay đổi re-render cả cây. Component chỉ cần một nhánh state (e.g. Detail chỉ cần selectedItem) vẫn re-render. Fix: state ở **minimal** common ancestor (không phải root); có thể thêm memo cho component chỉ phụ thuộc một phần state.
- **Cây sâu + state ở root:** Mỗi tầng trung gian (Layout, ContentArea) phải nhận và forward props → prop drilling, API dễ vỡ. Fix: đưa state xuống **minimal ancestor** (chỉ component cha trực tiếp của các consumer) → Layout không nhận state, không re-render khi state đổi.

## 8. Khi nào lifting trở thành anti-pattern

- State lift **cao hơn** minimal common ancestor (e.g. lên App khi chỉ một màn hình cần).
- Cây sâu và mọi tầng trung gian phải drill props → brittle, thêm state là sửa nhiều layer.
- Một state update re-render nhiều component không cần state đó. Memo có thể giảm re-render một vài leaf nhưng không sửa re-render của các tầng trung gian; refactor (state ở minimal ancestor) mới giảm blast radius thật.
