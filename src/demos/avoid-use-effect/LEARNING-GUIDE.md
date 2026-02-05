# Hướng dẫn học: Khi nào tránh useEffect và dùng gì thay thế

**Mục tiêu:** Hiểu **tại sao tránh useEffect khi có thể** (effect chạy sau commit, khó đoán, dễ bug); **ba pattern thay thế**: derive trong render, event handler, data layer (React Query); **khi nào useEffect là bắt buộc** (DOM, subscription, sync ra ngoài).

**Điều kiện:** Đã nắm useState, useEffect, render vs commit vs effect.

---

## 1. Thứ tự học

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Đọc **README.md** (nếu có) | Nắm ba pattern thay thế và khi nào effect bắt buộc. |
| 2 | Chạy demo (nếu có) → so sánh Before/After | Thấy derive trong render, event handler, useQuery. |
| 3 | Đọc phần 2–5 bên dưới | Pattern 1: derive; Pattern 2: event; Pattern 3: data layer; khi nào effect không tránh được. |
| 4 | Bảng Before/After (phần 6) | Ôn nhanh từng case. |
| 5 | **PR-REVIEW.md** (nếu có) | Trade-offs; edge cases. |

---

## 2. Tại sao tránh useEffect khi có thể?

- **Effect chạy sau commit.** Nên "khi X đổi thì làm Y" trong effect nghĩa là: render (có thể với state cũ) → commit → effect chạy → có thể setState → render nữa. Nếu Y có thể tính từ X trong render, hoặc làm trong event gây ra X, bạn tránh được vòng thêm và giữ một nguồn sự thật.
- **Dễ đoán.** "Hiển thị giá trị từ prop" = derive trong render. "User click → làm gì đó" = làm trong click handler. "Server data theo filter" = data layer (ví dụ React Query). Mỗi thứ có chỗ rõ ràng, dễ đoán. Bỏ vào effect làm "khi nào chạy?" rải rác giữa mount và dependency đổi.
- **Ít bug.** Sync state từ props trong effect có thể lệch (ví dụ strict mode double mount, hoặc parent re-render). Phản ứng với hành động user trong effect cũng chạy khi mount nếu state ban đầu đã set. Data trong useEffect không có cache, không dedupe, và bạn phải tự xử lý cancellation.

**Tóm lại:** **Chỉ dùng effect khi bắt buộc đồng bộ với thứ bên ngoài React** (DOM, subscription, store ngoài). Với derivation, event của user và server data, dùng các pattern bên dưới.

---

## 3. Pattern 1: Derive trong render (thay vì sync state từ props)

**Vấn đề:** Parent truyền `userId`; child giữ state local và dùng `useEffect` để "sync" khi `userId` đổi. Gây thêm một lần render (render với state cũ → effect → setState → render lại) và có thể nhấp nháy hoặc lệch.

**Giải pháp:** Nếu child chỉ cần *hiển thị* prop, derive trong render: `const displayId = userId`. Không state, không effect. Một nguồn sự thật (prop).

**Khi cần state local "reset" khi prop đổi:** Dùng controlled component với `key={userId}` (hoặc giá trị xác định "entity"). Khi key đổi, React remount child với state mới. Không cần effect "sync state từ props."

**Tại sao tốt hơn:** Cùng input (prop) → cùng output (hiển thị) trong một lần render. Không render thừa, không bug sync.

---

## 4. Pattern 2: Event handler thay vì effect (phản ứng với hành động user)

**Vấn đề:** User chọn item → bạn setState(selectedId) → và bạn muốn track lựa chọn. Làm tracking trong `useEffect` chạy khi `selectedId` đổi nghĩa là: (1) tracking cũng chạy khi mount nếu state ban đầu đã set, (2) "nguyên nhân" (click) và "phản ứng" (track) ở hai chỗ khác nhau.

**Giải pháp:** Làm cả hai trong cùng event handler: `function handleSelect(id) { setSelectedId(id); trackEvent('item_selected', { itemId: id }); }`. Không effect.

**Tại sao tốt hơn:** Một event → một handler → cập nhật state + side effect. Chạy đúng lúc user hành động; không chạy khi mount; dễ lý giải.

---

## 5. Pattern 3: Data layer thay vì useEffect cho server data

**Vấn đề:** Fetch trong `useEffect` khi filter đổi: bạn tự quản loading, error, cancellation, và không có cache hay dedupe. Server state (API data) không nên mặc định nằm trong state của component.

**Giải pháp:** Dùng data layer (ví dụ React Query). `useQuery({ queryKey: ['dashboard', filters], queryFn: () => fetchDashboard(filters) })`. Không useEffect tay; thư viện xử lý fetch, cache, loading, error, cancellation.

**Tại sao tốt hơn:** Server state quản ở một chỗ; cùng filter → cùng cache; refetch và loading dễ đoán; ít boilerplate và ít bug race.

---

## 6. Khi nào useEffect là không tránh được

Dùng effect khi bạn **bắt buộc đồng bộ với thứ bên ngoài React**:

- **DOM imperative:** Focus input, scroll tới element, đo DOM. React không điều khiển những thứ này; bạn gọi `.focus()` hoặc thêm listener sau commit. Effect + cleanup là chỗ đúng.
- **Subscription:** Window resize, WebSocket, interval, store ngoài. Bạn subscribe sau mount và unsubscribe trong cleanup. Không primitive nào khác của React làm việc này.
- **document.title / sync ra store ngoài:** Nếu giá trị phụ thuộc props/state và phải đẩy ra ngoài sau commit, effect là phù hợp.

**Quy tắc:** Nếu "phản ứng" là với thứ *bên trong* React (prop, state từ hành động user), ưu tiên render hoặc event handler. Nếu là với thứ *bên ngoài* React (browser API, subscription mạng, store bên thứ ba), dùng effect và cleanup.

---

## 7. Bảng Before/After

| Trường hợp | Trước (useEffect) | Sau (pattern tốt hơn) |
|------------|-------------------|------------------------|
| Hiển thị giá trị từ prop | Effect sync state local khi prop đổi | Derive trong render: `const x = prop` |
| State local reset khi "item nào" đổi | Effect sync state khi prop đổi | Parent truyền `key={id}` để child remount với state mới |
| Làm gì đó khi user chọn item | Effect chạy khi state selectedId đổi | Làm trong cùng handler set selectedId |
| Fetch khi filter đổi | useEffect fetch; tự quản loading/error | React Query (hoặc tương tự): useQuery key theo filter |
| Focus input khi mount | — | useEffect (DOM imperative; không tránh được) |
| Subscribe window resize | — | useEffect + addEventListener; cleanup removeEventListener |

---

## 8. Trade-offs và edge cases

- **Derive trong render:** Nếu tính toán đắt, cân nhắc `useMemo` (có chi phí đo được; không memo mọi thứ). Với derivation đơn giản (ví dụ `displayId = userId`), không cần memo.
- **Event handler:** Nếu "phản ứng" là async (ví dụ gọi API rồi track), vẫn làm trong handler (fire-and-forget hoặc await). Đừng chuyển sang effect "khi state đổi" — tách nguyên nhân và kết quả.
- **React Query:** Thêm dependency và mental model (query key, stale time). Với fetch chỉ khi mount bạn vẫn có thể dùng useEffect nhỏ với cleanup; với data theo filter hoặc list, data layer thường tốt hơn.
- **Effect không tránh được:** Luôn có cleanup (remove listener, cancel subscription). Nếu không sẽ bị leak và stale closure.
