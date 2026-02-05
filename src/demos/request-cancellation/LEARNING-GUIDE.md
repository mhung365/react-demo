# Hướng dẫn học: Request cancellation trong React

**Mục tiêu:** Hiểu **chỗ xử lý hủy request** (cleanup của effect); **cleanup ngăn memory leak** và race thế nào; so sánh **AbortController** (hủy thật) vs **flag cancelled** (bỏ qua response); cách implement AbortController trong cleanup; khi nào cancellation tay trở nên khó quản.

**Điều kiện:** Đã nắm useEffect, cleanup (return function), dependency array.

---

## 1. Thứ tự học

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Đọc **README.md** (nếu có) | Nắm cleanup = chỗ hủy/bỏ qua in-flight. |
| 2 | Chạy demo → đổi query nhanh / unmount | Thấy race (response cũ ghi đè mới) hoặc setState sau unmount nếu không cleanup. |
| 3 | Tab **AbortController** (nếu có) | cleanup gọi controller.abort(); catch AbortError. |
| 4 | Tab **Ignore response** (nếu có) | Flag cancelled trong cleanup; .then chỉ setState nếu !cancelled. |
| 5 | **PR-REVIEW.md** (nếu có) | Trade-offs; khi nào dùng thư viện. |

---

## 2. Chỗ xử lý request cancellation

**Trong cleanup của effect.** Khi effect chạy lại (deps đổi) hoặc component unmount, React gọi hàm cleanup bạn return từ `useEffect`. Đó là chỗ đúng để:

- **Hủy request đang in-flight:** Gọi `controller.abort()` để request bị hủy (fetch throw, API có thể dừng).
- **Hoặc bỏ qua response:** Set flag `cancelled` để khi promise resolve bạn không gọi `setState`.

**Tóm lại:** **cleanup = “lần chạy effect này không còn hợp lệ; hủy hoặc bỏ qua mọi công việc in-flight.”**

---

## 3. Cleanup ngăn memory leak thế nào

**Không có cleanup:**

- User đổi query (hoặc navigate đi). Request trước vẫn in-flight.
- Khi request xong, `.then` hoặc `.catch` chạy và gọi `setState`.
- Nếu component đã unmount → “Can’t perform a React state update on an unmounted component” và rủi ro leak hoặc state không nhất quán.
- Nếu component vẫn mount nhưng effect đã chạy lại (query mới) → bạn đang cập nhật state bằng data **cũ** (kết quả query cũ ghi đè query mới).

**Có cleanup:**

- Hoặc bạn abort request (AbortController) để promise reject và bạn không setState cho request đó, hoặc bạn set `cancelled = true` và trong `.then`/`.catch` kiểm tra `if (!cancelled)` trước `setState`.
- Công việc in-flight không bao giờ cập nhật state sau khi “lần chạy này đã lỗi thời” hoặc sau unmount. Điều đó ngăn cả race (cũ ghi đè mới) và cảnh báo/leak setState sau unmount.

---

## 4. Hủy thật (AbortController) vs bỏ qua response (flag cancelled)

| Cách | Làm gì | Ưu / nhược |
|------|--------|-------------|
| **AbortController** | Bạn truyền `signal` vào `fetch()` (hoặc API hỗ trợ). Trong cleanup gọi `controller.abort()`. Request **bị hủy** (fetch throw `AbortError`). | **Ưu:** Request thực sự hủy; server/mạng có thể dừng; không lãng phí bandwidth cho request bị bỏ. **Nhược:** API phải hỗ trợ AbortSignal; trong catch phải xử lý AbortError và không coi là lỗi thật. |
| **Bỏ qua response (flag cancelled)** | Bạn không hủy request. Trong cleanup set `cancelled = true`. Trong `.then`/`.catch` chỉ `setState` nếu `!cancelled`. | **Ưu:** Hoạt động với mọi API (không cần signal); đơn giản. **Nhược:** Request vẫn chạy đến hết (server/mạng vẫn làm; response bị vứt khi về). |

Với **search-as-you-type** hoặc **filters/pagination**, cả hai cách đều sửa race và vấn đề setState sau unmount. AbortController tốt hơn khi API hỗ trợ (hủy thật). Bỏ qua response là fallback hợp lệ khi API không hỗ trợ abort.

---

## 5. Implement AbortController trong cleanup

1. **Tạo controller bên trong effect** (mỗi lần chạy có một):  
   `const controller = new AbortController()`  
   `const { signal } = controller`

2. **Truyền `signal` vào fetch** (hoặc wrapper forward vào `fetch(url, { signal })`).  
   Mock trong demo `fetchSearch(query, signal)` lắng nghe `signal` và reject với `AbortError` khi bị abort.

3. **Trong cleanup của effect, abort:**  
   `return () => { controller.abort() }`

4. **Trong `.catch`, không coi AbortError là lỗi thật:**  
   `if (e?.name === 'AbortError') return` (hoặc log rồi return; không set error state hoặc toast).

5. **Trong `.finally`, chỉ cập nhật loading nếu chưa abort:**  
   `if (!signal.aborted) setLoading(false)` để không clear loading cho request đã bị abort (loading của “lần chạy hiện tại” đã do lần chạy mới xử lý).

---

## 6. Pattern thay thế

- **Request ID / generation counter:** Tăng counter (hoặc tạo ID) khi bắt đầu request. Truyền vào lần chạy effect. Trong `.then` chỉ `setState` nếu “request id” của response khớp với id hiện tại. Bạn không hủy request; bạn bỏ qua response không khớp lần chạy mới nhất. Cùng ý tưởng “bỏ qua response” nhưng key bằng ID. Hoạt động với mọi API; request vẫn chạy đến hết.

- **React Query (hoặc tương tự):** Thư viện quản vòng đời request và cancellation (hoặc bỏ qua kết quả lỗi thời) cho bạn. Bạn truyền `queryKey` và `queryFn`; khi key đổi, query trước bị hủy hoặc kết quả bị bỏ qua. Dùng cho server state khi có thể để không tự viết logic abort/ignore ở mọi component.

- **Custom hook:** Gói “fetch với AbortController + cleanup” trong hook (ví dụ `useSearch(query)`) để mọi component cần search không lặp cùng pattern. Hook tạo controller, truyền signal, và return cleanup gọi abort.

---

## 7. Khi nào cancellation tay trở nên khó quản

- **Nhiều endpoint / nhiều component:** Mỗi màn hoặc filter một useEffect + AbortController + xử lý error/loading → code phình và dễ quên abort hoặc xử lý AbortError sai. Cân nhắc thư viện data (React Query, SWR) hoặc hook dùng chung.

- **API không hỗ trợ AbortSignal:** Backend hoặc HTTP client không nhận signal thì bạn không thể hủy request thật; chỉ “bỏ qua response.” Vẫn đúng để tránh race và setState sau unmount, nhưng không tiết kiệm công server/mạng.

- **Luồng phức tạp (retry, dedupe, cache):** Khi thêm retry, dedupe request hoặc cache, logic cancellation tay trở nên rối. React Query (hoặc tương tự) xử lý cancellation, dedupe và cache cùng lúc.

Trade-off: **AbortController trong cleanup** là mặc định đúng cho “fetch khi deps đổi” trong một component. Với server state toàn app, ưu tiên thư viện data và chỉ dùng abort tay chỗ thư viện không áp dụng được.
