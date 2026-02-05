# Hướng dẫn học: Side effects trong React

**Mục tiêu:** Hiểu **side effect** trong React là gì; **khi nào** dùng effect, khi nào **không**; logic nên đặt ở **render**, **event handler** hay **useEffect**; tránh lạm dụng effect (derived state, phản ứng theo user).

**Điều kiện:** Đã nắm useState, useEffect cơ bản.

---

## 1. Thứ tự học

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Đọc **README.md** (nếu có) | Nắm side effect vs render thuần. |
| 2 | Chạy demo → mở Console | Thấy `[render]` trước, sau đó `[effect]` — effect chạy **sau** commit. |
| 3 | Đọc phần 2–3 bên dưới | Phân biệt derived data (render) vs side effect (effect); bảng “logic đặt ở đâu”. |
| 4 | **PR-REVIEW.md** (nếu có) | Sai lầm hay gặp; trade-offs. |

---

## 2. Side effect trong React là gì?

**Side effect** là đoạn code làm việc **bên ngoài** luồng thuần “render → JSX”:

- **Tác động ra bên ngoài:** Gọi API, WebSocket, `setInterval`, thao tác DOM (focus, scroll, `document.title`), analytics, log lên server.
- **Chạy khác thời điểm với render:** React chạy effect **sau** khi đã commit cây lên DOM (sau paint). Effect chạy bất đồng bộ so với hàm component.

**Không phải side effect (theo nghĩa React):**

- **Derived data:** Tính danh sách lọc từ `items` và `filter`, hoặc label hiển thị từ `name` và `category`. Đó là tính toán thuần từ props/state → làm **trong render** (không dùng `useEffect`).
- **Phản ứng theo ý user:** “User bấm Submit” → gửi analytics, điều hướng, v.v. Làm trong **event handler**, không phải effect theo dõi state “submitted”.

**Quy tắc:** Nếu bạn chỉ đọc props/state và tính ra thứ hiển thị trong JSX → đó là **render**. Nếu bạn chạm ra ngoài (mạng, DOM, subscription, analytics) → đó là **side effect** và `useEffect` (hoặc thư viện dùng nó, như React Query) là chỗ đúng.

---

## 3. Tại sao side effect hay bị lạm dụng?

- **Thói quen lifecycle:** Trong class component, “khi X đổi” thường làm trong `componentDidMount` / `componentDidUpdate`. Với hooks, tương đương là “bỏ vào `useEffect` với X trong dependency array.” Nên nhiều người bỏ **mọi** logic “khi state đổi” vào effect, kể cả derived state và phản ứng kiểu event.
- **Mental model sai:** “Khi category đổi, cập nhật danh sách lọc” nghe giống “chạy effect khi category đổi.” Nhưng danh sách lọc từ category là **derived state** — nó là **hàm** của `category` và `items`. Nên **tính trong render**: `const filtered = items.filter(...)`. Không effect, không state thừa.
- **Data fetching:** “Khi mount hoặc filter đổi thì fetch” là side effect thật. Nhưng làm bằng `useEffect` + `useState` thuần nghĩa là bạn tự làm loading, error, cache, dedupe. React Query (hoặc tương tự) gói sẵn; component gọn và ít effect tùy biến.

---

## 4. Logic nên đặt ở đâu?

| Loại logic | Đặt ở đâu | Sai chỗ |
|------------|-----------|---------|
| **Derived data** (lọc list, label hiển thị) | **Render:** `const filtered = items.filter(...)` | `useEffect` set state từ props/state khác |
| **User làm gì đó** (click, submit) | **Event handler:** `onClick={() => { track(); doSomething(); }}` | `useEffect` theo dõi state “action” |
| **Server data** (fetch, cache, refetch) | **React Query** (hoặc tương tự): `useQuery({ queryKey, queryFn })` | `useEffect` + tự quản loading/error/cache |
| **Subscription** (WebSocket, interval) | **useEffect** có cleanup | — |
| **DOM** (focus, scroll, title) | **useEffect** (hoặc useLayoutEffect nếu cần trước paint) | — |
| **Analytics “khi filter đổi”** | **Event handler** khi user đổi filter | `useEffect` theo dõi state filter |

---

## 5. Effect chạy khi nào so với render

- **Render:** Hàm component chạy **đồng bộ**. Mọi `useRenderLog` hoặc `console.log` trong body chạy trong phase này. DOM chưa cập nhật cho lần render này.
- **Commit:** React áp dụng cây mới lên DOM.
- **Effects:** Sau commit, React chạy callback của `useEffect`. Bạn luôn thấy **tất cả** log `[render]` trước, rồi **tất cả** log `[effect]`. Thứ tự đó giải thích tại sao “sync state trong effect” có thể gây thêm một lần render: render 1 (state A) → commit → effect chạy → setState(B) → render 2 (state B).

Demo dùng log rõ ràng để bạn thấy: `[render] OveruseOfEffects #N` rồi sau đó `[effect] OveruseOfEffects — "fetch products"`. Điều đó minh họa effect chạy **sau** render và lạm dụng effect nghĩa là nhiều effect chạy mỗi khi có thay đổi liên quan.

---

## 6. Khi nào side effect là bắt buộc?

Bạn **cần** `useEffect` (hoặc thư viện dùng nó) cho:

- **Subscription:** WebSocket, `setInterval`, `window.addEventListener` — kèm cleanup trong return của effect.
- **DOM:** Focus input, set `document.title`, đo kích thước hoặc scroll — thường trong effect (hoặc useLayoutEffect nếu cần trước paint).
- **Tích hợp bên thứ ba:** Thư viện cần chạy sau mount hoặc khi giá trị đổi; effect là chỗ phù hợp.

Bạn **không** cần effect cho:

- **Fetch server data** trong app điển hình — dùng React Query (hoặc tương tự) để thư viện sở hữu effect và cache.
- **Derived state** — tính trong render.
- **Phản ứng theo event của user** — dùng event handler.

---

## 7. Trade-offs

- **Ít effect:** Mental model đơn giản; ít rủi ro stale closure và lỗi dependency; dễ lý giải thứ tự (render → commit → effects).
- **Nhiều effect:** Nhiều “khi X đổi thì làm Y” rải rác trong effects; khó nhìn toàn luồng; dễ trùng công việc (ví dụ fetch + analytics cùng deps trong hai effect).
- **React Query cho server state:** Bạn đổi lại việc kiểm soát “chính xác lúc nào fetch chạy” để lấy cache, dedupe, loading/error và ít code effect tùy biến. Với đa số UI, trade-off đó đáng.
