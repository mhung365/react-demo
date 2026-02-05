# Hướng dẫn học: Pure render và tại sao fetch trong render là sai

**Mục tiêu:** Hiểu **pure render** trong React nghĩa là gì; **tại sao** fetch trong body component là sai (vòng lặp vô hạn, request trùng, race); so sánh với React Query, Suspense, Server Components — những thứ *trông* giống fetch trong render nhưng không vi phạm pure render.

**Điều kiện:** Đã nắm useState, useEffect, render phase vs commit/effect.

---

## 1. Thứ tự học

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Đọc **README.md** (nếu có) | Nắm pure render, fetch trong render sai thế nào. |
| 2 | Chạy demo (nếu có fetch trong render “sai”) | Thấy vòng lặp vô hạn hoặc request trùng. |
| 3 | Đọc phần 2–4 bên dưới | Hiểu rõ hậu quả và lý do dev vẫn hay viết fetch trong render. |
| 4 | Đọc phần 5–6 | Phân biệt với useQuery, Suspense, Server Components. |
| 5 | **PR-REVIEW.md** (nếu có) | Sai lầm hay gặp; pattern đúng. |

---

## 2. “Pure render” thực sự nghĩa là gì?

**Pure** theo nghĩa React: với **cùng props và state**, component trả về **cùng JSX** và **không làm gì khác**.

- **Cùng input → cùng output:** Không ngẫu nhiên, không đọc từ global mutable thay đổi giữa các lần gọi, không side effect.
- **Không side effect trong phase render:** Body component (hàm bạn viết) **không được**:
  - Bắt đầu request mạng (fetch, axios).
  - Gọi `setState` (hoặc dispatch) theo cách được kích hoạt bởi chính lần render này (ví dụ trong `.then()` của request bạn khởi chạy trong cùng lần render).
  - Mutate refs/globals mà code khác dựa vào để đúng.
  - Subscribe store bên ngoài theo cách lên lịch cập nhật trong render.

**Tóm lại:** **render = tính JSX từ (props, state)**. Mọi thứ chạm ra ngoài (mạng, DOM, timer, subscription) hoặc lên lịch setState từ trong phase render đều là side effect và **không** thuộc về body component.

---

## 3. Chuyện gì xảy ra nếu bạn fetch trong render?

- **Fetch không điều kiện trong render:** Mỗi lần component chạy, bạn bắt đầu một fetch mới. Khi resolve, bạn `setState` → React re-render → component chạy lại → bạn bắt đầu fetch khác → vòng lặp vô hạn. Bạn thấy log `[render]` lặp và request mạng lặp.
- **Fetch có điều kiện trong render (ví dụ `if (!data) fetch()`):** Bạn tránh vòng lặp vô hạn (một khi `data` đã set thì không fetch nữa), nhưng:
  - **Render vẫn không pure:** Bạn đang bắt đầu side effect (request mạng) trong body component.
  - **React có thể gọi component nhiều hơn một lần:** Trong Strict Mode (dev), React gọi component hai lần. Bạn có thể có hai lần render trước khi fetch đầu resolve → hai fetch.
  - **Bất kỳ re-render nào khác** (parent update, context đổi) trước khi request đầu xong có thể kích hoạt fetch khác. Không đoán trước và lãng phí.

**Kết luận:** Ngay cả fetch “có điều kiện” trong render cũng vi phạm pure render và có thể gây request trùng, bug khó thấy.

---

## 4. Tại sao dev vẫn hay fetch trong render?

- **Trông đơn giản:** “Khi component chạy thì lấy data” nghe tự nhiên. Nhiều người không nghĩ “khi component chạy” có thể xảy ra nhiều lần và việc bắt đầu request ở đó là side effect.
- **Ecosystem khác làm vậy:** Ở một số framework (ví dụ server-side “load data trong component”), component chạy một lần mỗi request và fetch ở đó là bình thường. Trong mô hình **client** của React, cùng một component có thể chạy nhiều lần (re-render), nên cùng pattern là sai.
- **Nhầm với “load on mount”:** “Tôi muốn load khi component xuất hiện” là đúng; làm bằng gọi fetch trong body là sai. Chỗ đúng là `useEffect` (hoặc thư viện data), chạy **sau** commit, không phải trong render.
- **Async/await trong body:** Nhiều người thử `async function Component()` hoặc `const data = await fetch()` trong body. Cái đó hoặc không chạy đúng (hooks không được conditional/async) hoặc gây cùng vấn đề: side effect trong render và/hoặc setState từ microtask được lên lịch trong render.

**Tóm lại:** **Ý định** (“load khi màn này hiển thị”) là ổn; **chỗ đặt** (body component = phase render) là sai.

---

## 5. Vòng lặp vô hạn và bug khó thấy từ fetch trong render

- **Vòng lặp vô hạn:** Fetch trong render → resolve → setState → re-render → fetch lại → … . Cách dừng duy nhất là không fetch trong render.
- **Request trùng:** Fetch có điều kiện trong render + Strict Mode hoặc re-render concurrent → nhiều request in-flight cho cùng một “load” logic.
- **Thứ tự sai / race:** Nhiều component hoặc điều kiện fetch trong render → thứ tự render và thứ tự request xong không xác định. UI có thể hiển thị stale hoặc không nhất quán.
- **Khó lý giải:** “Khi nào fetch chạy?” phụ thuộc tần số React re-render component. Đó là chi tiết implementation; logic load data không nên phụ thuộc vào nó.

---

## 6. So sánh: pattern/framework *trông* giống fetch trong render

Các pattern sau trông giống “fetch trong render” nhưng **không** chạy request thật trong cùng phase render như khi bạn gọi `fetch()` trong body.

### React Query (useQuery)

- Bạn viết `useQuery({ queryKey, queryFn })` trong component. **queryFn** (hàm thực hiện fetch) **không** chạy trong phase render của component. React Query chạy nó ở bước riêng (sau render / microtask hoặc lifecycle kiểu effect). Body component vẫn pure: chỉ return JSX và gọi hook **lên lịch** fetch. Bản thân fetch là side effect do thư viện quản lý.

### Suspense cho Data

- Với cache (ví dụ Relay, React Query với Suspense), component **đọc** từ cache trong render. Nếu thiếu data, cache **throw promise**. React bắt và suspend; khi promise resolve, React re-render. **Fetch** được bắt đầu bởi cache (hoặc parent/route), không phải “chạy component và gọi fetch()”. Component không bắt đầu request mạng trong render; nó hoặc đọc data cache hoặc kích hoạt suspend. Request thật được bắt đầu bên ngoài phase render (ví dụ khi cache thấy miss).

### Server Components (ví dụ Next.js App Router)

- Server Components chạy **trên server**, một lần mỗi request. “Trong render” ở đây không giống client render: không có vòng re-render, không có Strict Mode double-invoke theo cùng nghĩa. Fetch trong Server Component vẫn là side effect, nhưng mô hình thực thi là “chạy một lần mỗi request” và kết quả gửi xuống client. Nên ở đó an toàn. Trên **client**, bạn vẫn không được fetch trong render của client component; dùng `useEffect`, React Query, hoặc Suspense.

**Tóm tắt:** Trên **client** React, “fetch trong render” = “gọi fetch() trong body component.” Điều đó sai. React Query, Suspense và Server Components hoặc chạy fetch **bên ngoài** phase render (kiểu effect hoặc cache) hoặc ở **phase khác** (server request). Chúng không vi phạm “render phải pure” theo cách gọi `fetch()` trực tiếp trong body.

---

## 7. Pattern đúng: fetch là side effect

- **useEffect:** Chạy fetch (và setState khi resolve) bên trong `useEffect`. Chạy sau khi React đã commit cây. Render giữ pure: không fetch, không setState từ async trong body.
- **React Query / tương tự:** Dùng `useQuery`; thư viện chạy fetch trong lifecycle riêng. Component chỉ đọc `data` / `isLoading` và return JSX.
- **Suspense:** Dùng cache throw promise khi thiếu data; fetch thật do cache bắt đầu, không phải body component.

**Tóm lại:** **render = pure (props, state) → JSX**. **Fetch = side effect** → làm trong `useEffect`, trong thư viện data, hoặc qua cache tích hợp Suspense.
