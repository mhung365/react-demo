# Hướng dẫn học: Data fetching trong useEffect

**Mục tiêu:** Hiểu **khi nào** fetch trong useEffect là chấp nhận được; khi nào thành **ý tưởng tồi** (race, stale, double fetch); **cleanup (cancellation)** bắt buộc thế nào; so sánh fix tối thiểu (useEffect + cancelled flag) vs **cách tốt hơn** (React Query).

**Điều kiện:** Đã nắm useEffect, dependency array, cleanup.

---

## 1. Thứ tự học

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Đọc **README.md** (nếu có) | Nắm khi nào fetch trong useEffect ổn, khi nào không. |
| 2 | Chạy demo → tab **Wrong** / **Fixed** / **Refactored** | Thấy race (All → Active nhanh), double fetch (Strict Mode), stale data (thiếu deps). |
| 3 | Đọc **FixedRaceUseEffectFetch** (nếu có) | Cancelled flag trong cleanup; deps đúng. |
| 4 | Đọc **RefactoredFetch** (nếu có) | useQuery; queryKey; thư viện xử lý cancellation, cache. |
| 5 | **PR-REVIEW.md** (nếu có) | Trade-offs; khi nào chuyển sang React Query. |

---

## 2. Khi nào fetch trong useEffect là chấp nhận được?

**Chấp nhận được** khi đủ các điều sau:

- **Một lần hoặc trigger ổn định:** Fetch một lần khi mount (ví dụ user profile, app config) hoặc khi một bộ deps nhỏ, ổn định đổi (ví dụ một `userId` từ URL).
- **Dependency array đúng:** `[]` cho chỉ mount; không thì gồm mọi giá trị trong effect ảnh hưởng request (filters, ids). Thiếu deps → params cũ; thừa/unstable deps → double hoặc fetch không cần thiết.
- **Cleanup (hủy / bỏ qua):** Khi effect chạy lại hoặc component unmount, bạn phải bỏ qua response đang in-flight. Dùng flag `cancelled` (hoặc `aborted`) set trong cleanup; trong `.then` / `.catch` chỉ gọi `setState` nếu `!cancelled`. Nếu không → race (response cũ ghi đè mới) hoặc setState sau unmount.

**Ví dụ:** Load current user một lần khi mount. Deps rỗng, cancelled flag trong cleanup. Không filter, không dependency churn.

---

## 3. Khi nào fetch trong useEffect thành ý tưởng tồi?

- **Fetch theo filter/param:** Ngay khi request phụ thuộc giá trị đổi thường xuyên (search, filters, pagination), bạn gặp:
  - **Race:** User đổi filter A → B → C; request A, B, C cùng in-flight; nếu A xong cuối, UI hiển thị data của A trong khi UI đang hiển thị C. Sửa: hủy request trước trong cleanup (bỏ qua response khi `cancelled`).
  - **Stale params:** Bỏ deps (ví dụ `[]` hoặc thiếu `search`) → fetch một lần hoặc với giá trị cũ → UI và data lệch.
  - **Double fetch:** Trong Strict Mode, React mount hai lần ở dev; không cleanup thì gửi hai request. Có cleanup đúng thì chỉ “thắng” với request của lần mount cuối.
- **Độ phức tạp:** Bạn phải tự quản loading, error, cancellation ở mọi component fetch → logic trùng và dễ sai.

**Kết luận:** Fetch trong useEffect chấp nhận được cho load **đơn giản, một lần hoặc tần số thấp**, kèm cleanup. Với “fetch khi filters/params đổi”, hoặc làm đúng (cancellation + deps đúng) hoặc chuyển sang thư viện data (React Query, v.v.).

---

## 4. Double fetch, stale data, race

- **Double fetch:** Ở React 18 Strict Mode (dev), effect chạy hai lần khi mount. Không cleanup → gửi hai request. Có cleanup → cleanup của effect lần một chạy trước lần hai; nếu dùng flag `cancelled`, response của request đầu bị bỏ qua. Vẫn gửi hai request nhưng chỉ một cập nhật state. Để không gửi request thứ hai, dùng AbortController và abort trong cleanup (hoặc thư viện làm giúp).

- **Stale data:** Deps sai hoặc rỗng. Ví dụ: effect có `[]` nhưng dùng `status` và `search`. Bạn chỉ fetch với giá trị ban đầu; user đổi filter thì không refetch. UI hiển thị data cho params cũ = stale.

- **Race:** Không cancellation. User chọn All (request 1), rồi Active (request 2). Request 1 chậm, request 2 nhanh → request 2 xong trước, bạn set state theo Active. Sau đó request 1 xong và bạn set state theo All. UI ghi “Active” nhưng list là All. Sửa: trong cleanup set `cancelled = true`; trong `.then` của request 1 kiểm tra `if (!cancelled)` trước `setState` — khi request 1 xong thì bỏ qua vì đã chuyển sang request 2.

Demo dùng delay khác nhau trong mock (All = 700ms, Active/Archived = 300ms) để bạn tái tạo: chuyển All → Active nhanh và xem console; không cancellation thì “end” của All có thể đến sau Active và ghi đè.

---

## 5. Refactor: fix tối thiểu vs cách tốt hơn

- **Fix tối thiểu (vẫn dùng useEffect):** Thêm flag `cancelled`. Trong cleanup của effect set `cancelled = true`. Trong mọi `.then`/`.catch` chỉ cập nhật state nếu `!cancelled`. Dùng đúng dependency array (mọi giá trị ảnh hưởng request). Xem `FixedRaceUseEffectFetch` (nếu có).

- **Cách tốt hơn (server state theo filter):** Dùng React Query (hoặc tương tự). Bạn truyền `queryKey` (ví dụ `['dashboard', filters]`) và `queryFn`. Thư viện xử lý:
  - Khi nào fetch (key đổi)
  - Cancellation / bỏ qua kết quả lỗi thời
  - Cache và chính sách refetch
  - Loading và error state

Bạn không viết useEffect cho fetch đó; chỉ dùng `useQuery`. Ít bug hơn, ít code hơn. Xem `RefactoredFetch` (nếu có).

---

## 6. Trade-offs

- **useEffect + cancellation:** Bạn giữ toàn quyền và không thêm dependency. Bạn phải làm đúng deps và cleanup ở mọi chỗ fetch; trùng code và sai sót là phổ biến.

- **React Query:** Bạn thêm dependency và ủy quyền việc khi nào/cách nào fetch chạy và cache hoạt động. Đổi lại bạn có cancellation nhất quán, cache, loading/error và ít code effect tùy biến. Với server state phụ thuộc filters/params, đây thường là trade-off tốt hơn.

- **Custom hook bọc fetch trong useEffect:** Bạn có thể gói “fetch + cancelled flag + deps đúng + loading/error” trong hook (ví dụ `useDashboardData(filters)`). Giảm trùng và tập trung pattern. Bạn vẫn tự xử lý cancellation và deps; React Query đi xa hơn bằng cache và vòng đời request.
