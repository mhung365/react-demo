# Hướng dẫn học: Race conditions trong useEffect

**Mục tiêu:** Hiểu **race xảy ra thế nào dù dependency đúng** (nhiều request in-flight, thứ tự response không đảm bảo); **overlapping effect** do state đổi nhanh; **ba cách xử lý** (AbortController, request-id guard, ignore stale) và **ưu/nhược từng cách**; khi nào dùng cách nào.

**Điều kiện:** Đã nắm useEffect, dependency array, cleanup.

---

## 1. Thứ tự học

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Đọc **README.md** (nếu có) | Nắm race dù deps đúng; ba strategy. |
| 2 | Chạy demo → gõ search nhanh (a → ab) | Thấy response cũ có thể về sau và ghi đè (UI hiển thị "a" trong khi đã gõ "ab"). |
| 3 | Tab **AbortController** / **Request ID** / **Ignore stale** (nếu có) | So sánh cách hủy thật vs bỏ qua response. |
| 4 | Đọc phần 2–5 bên dưới | Overlapping effect; bảng so sánh; giới hạn từng cách; khi nào dùng gì. |
| 5 | **PR-REVIEW.md** (nếu có) | So sánh ba fix; limitations. |

---

## 2. Race xảy ra thế nào dù dependency đúng

- **Dependency đúng** nghĩa là: khi `query` (hoặc filter) đổi, effect chạy và bắt đầu request mới. Ta *có* bắt đầu đúng request khi user đổi input.
- **Nhưng** request trước vẫn in-flight. Ta không cancel và không bỏ qua response của nó. Nên ta có thể có **hai (hoặc nhiều) request in-flight** cùng lúc.
- **Thứ tự response không đảm bảo** trùng thứ tự request. Độ trễ mạng, tải server, hoặc (trong demo) delay biến theo độ dài query có thể khiến request cũ xong *sau* request mới.
- **`.then` nào chạy cuối** gọi `setState`. Nên response đến cuối cùng ghi đè state. Nếu response đó là của query cũ, ta hiển thị **data cũ** (ví dụ UI ghi "ab" nhưng ta show kết quả của "a").

**Tóm lại:** **Deps đúng đảm bảo ta bắt đầu đúng request; chúng KHÔNG đảm bảo ta bỏ qua hoặc hủy request lỗi thời.** Effect chồng + response không theo thứ tự = race.

---

## 3. Overlapping effect do state đổi nhanh

- User gõ "a" → effect chạy → request #1 (query=a) bắt đầu.
- User gõ "ab" trước khi #1 xong → effect chạy lại (cleanup cho #1 chạy, nhưng ta không cancel request) → request #2 (query=ab) bắt đầu.
- Lúc đó hai request in-flight. Nếu #2 xong trước, ta setState(kết quả ab). Sau đó #1 xong và ta setState(kết quả a) → **stale ghi đè**.

State đổi nhanh (ví dụ search-as-you-type, bật/tắt filter nhanh) gây effect chồng và do đó request chồng. Dependency array đúng (ta refetch khi query đổi); bug là ta không xử lý "request trước không còn liên quan."

---

## 4. Các cách xử lý: so sánh và giới hạn

| Cách | Làm gì | Ưu | Nhược |
|------|--------|-----|--------|
| **AbortController** | Trong cleanup gọi `controller.abort()`. Truyền `signal` vào fetch (hoặc API). Request trước **bị hủy** (reject với AbortError). | Request thực sự bị hủy; server/mạng có thể dừng; không lãng phí bandwidth. Chỉ request mới nhất có thể hoàn thành. | API phải hỗ trợ AbortSignal. Trong catch phải xử lý AbortError (không coi là lỗi user). |
| **Request ID guard** | Mỗi lần chạy effect có một ID (ví dụ `myId = ++requestIdRef.current`). Trong `.then` chỉ setState nếu `myId === requestIdRef.current`. | Hoạt động với mọi API (không cần signal). Rõ "generation" semantics. | Request vẫn chạy đến hết (server/mạng vẫn làm). Bạn phải truyền ID qua closure. |
| **Ignore stale (flag cancelled)** | Cleanup set `cancelled = true`. Trong `.then`/`.catch` chỉ setState nếu `!cancelled`. | Hoạt động với mọi API. Đơn giản; không cần theo dõi ID. | Giống request-id: request vẫn chạy đến hết. Ít tường minh hơn "request nào là current" (bạn chỉ biết "lần chạy này đã bị thay thế"). |

**Tóm tắt:** AbortController tốt nhất khi API hỗ trợ (hủy thật). Request-id và ignore-stale cho kết quả tương đương: chỉ response mới nhất cập nhật state; request trước vẫn chạy hết nhưng response bị bỏ qua. Dùng chúng khi API không hỗ trợ abort hoặc khi bạn không muốn hủy (ví dụ muốn cache response ở chỗ khác).

---

## 5. Giới hạn từng cách

- **AbortController:** Không phải API nào cũng nhận AbortSignal (ví dụ một số SDK hoặc endpoint cũ). Bạn phải truyền signal qua fetch wrapper và xử lý AbortError để không hiện toast lỗi hoặc set error state cho "đã hủy." Ở một số môi trường (ví dụ proxy nhất định), request có thể đã gửi trước khi abort được xử lý.
- **Request ID guard:** Bạn phải đảm bảo ID "current" được cập nhật khi lần chạy effect mới bắt đầu (ví dụ trong body effect, không chỉ trong cleanup). Nếu có nhiều thao tác async chồng, bạn cần theo dõi ID theo loại hoặc key. Request vẫn tốn tài nguyên server/mạng đến khi xong.
- **Ignore stale (flag cancelled):** Giống request-id: request chạy đến hết. Bạn phải set flag trong cleanup và kiểm tra trong mọi .then/.catch/.finally chạm state. Nếu có nhiều cập nhật state (ví dụ setResults và setLoading), phải guard tất cả.

---

## 6. Khi nào dùng cách nào

- **Ưu tiên AbortController** cho search-as-you-type, fetch theo filter, hoặc pagination khi API hỗ trợ `signal`. Bạn có hủy thật và một nguồn sự thật (chỉ request mới nhất có thể hoàn thành).
- **Dùng request-id hoặc ignore-stale** khi API không hỗ trợ abort, hoặc khi bạn bọc thư viện không nhận signal. Cùng UX (không stale ghi đè); bạn chỉ không hủy request.
- **React Query (hoặc tương tự):** Thư viện xử lý cancellation hoặc bỏ qua query lỗi thời cho bạn. Dùng cho server state khi có thể để không tự viết một trong các pattern này ở mọi component.
