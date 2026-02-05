# Hướng dẫn học: Timer cleanup trong React

**Mục tiêu:** Hiểu **bug do thiếu hoặc sai cleanup** (interval chồng, setState sau unmount); **closure giữ giá trị cũ** trong callback timer; cách **implement đúng và an toàn** (lưu id, cleanup clear, ref nếu cần giá trị mới nhất); khi nào **tránh setInterval** (recursive setTimeout, React Query, WebSocket).

**Điều kiện:** Đã nắm useEffect, cleanup (return function), dependency array.

---

## 1. Thứ tự học

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Đọc **README.md** (nếu có) | Nắm bug do thiếu cleanup, closure trong timer. |
| 2 | Chạy demo → bật interval, unmount / remount | Thấy interval chồng hoặc cảnh báo setState sau unmount nếu không cleanup. |
| 3 | Đọc phần 2–3 bên dưới | Closure capture giá trị cũ; implement đúng: lưu id, cleanup, ref. |
| 4 | **PR-REVIEW.md** (nếu có) | Sai lầm hay gặp; khi nào tránh setInterval. |

---

## 2. Bug do thiếu hoặc sai cleanup

- **Interval chồng:** Khi effect chạy (mount hoặc deps đổi), ta gọi setInterval và nhận id. Nếu không clear interval cũ trong cleanup, interval cũ vẫn chạy. Khi user rời màn rồi quay lại (unmount → remount), ta bắt đầu interval **mới**. Lúc đó hai interval đang chạy. Mỗi 2s bạn có hai tick, hai fetch, hai setState. Càng remount nhiều, interval càng chồng.
- **setState sau unmount:** Khi component unmount, interval vẫn được lên lịch. Khi nó chạy, nó gọi setState. React cảnh báo: "Can't perform a React state update on an unmounted component." Có thể gây leak và state không nhất quán. Cleanup phải clear interval để callback không bao giờ chạy sau unmount.
- **Cleanup sai:** Nếu bạn clear nhầm id (ví dụ ghi đè biến id và clear id mới nhất thay vì id của lần chạy effect này), hoặc quên clear khi deps đổi, bạn vẫn bị chồng hoặc setState sau unmount. Luôn lưu id từ setInterval/setTimeout và clear nó trong cleanup của **cùng** effect đó.

---

## 3. Closure giữ giá trị cũ trong timer

- Callback của interval (hoặc timeout) được tạo khi effect chạy. Nó **đóng over** (closure) các biến trong scope lúc đó (ví dụ `refreshCount`, `enabled`). Trong callback, `refreshCount` là giá trị **khi effect chạy**, không phải giá trị hiện tại khi callback chạy.
- Ví dụ: effect chạy với refreshCount = 0. Ta start setInterval(callback). Mỗi 2s callback chạy. Trong callback ta đọc refreshCount — vẫn là 0 (stale). Ta dùng setRefreshCount(c => c + 1) nên **cập nhật** đúng (functional update không cần state mới nhất). Nhưng nếu ta **đọc** refreshCount để logic hoặc log, ta thấy 0 mỗi lần.
- **Cách đọc giá trị mới nhất:** Dùng ref. Trong body effect (hoặc mỗi render), gán `ref.current = value`. Callback đọc `ref.current`. Ref mutable và cùng ref dùng qua các lần render, nên callback luôn thấy giá trị mới nhất. Không đưa ref vào dependency array; bạn không dùng nó để kích hoạt effect, chỉ để đọc trong callback.

---

## 4. Implement đúng và an toàn

1. **Lưu id timer** trong biến trong effect: `const id = setInterval(...)`.
2. **Return cleanup** clear nó: `return () => clearInterval(id)` (hoặc clearTimeout(id)).
3. **Nếu callback cần state mới nhất,** dùng ref: `latestRef.current = value` trong body effect (hoặc mỗi render); trong callback đọc `latestRef.current`.
4. **Dependencies:** Gồm mọi giá trị trong effect ảnh hưởng **khi** timer nên chạy (ví dụ enabled). Khi deps đổi, cleanup chạy (clear timer cũ), rồi effect chạy lại (start timer mới). Bạn chỉ có một timer cho mỗi lần chạy effect.

---

## 5. Cách khác: tránh setInterval hoàn toàn

- **Recursive setTimeout:** Sau khi công việc async (ví dụ fetch) xong, lên lịch lần chạy tiếp theo bằng setTimeout. Bạn chỉ có **một** timeout đang chờ. Khi cleanup chạy, clear timeout đó và set flag cancelled để callback (khi chạy) không lên lịch lại. Không chồng theo thiết kế.
- **React Query refetchInterval:** Với polling server data, dùng useQuery với refetchInterval. Thư viện sở hữu timer và cleanup khi component unmount hoặc query bị tắt. Bạn không tự viết setInterval/setTimeout.
- **WebSocket hoặc Server-Sent Events:** Với cập nhật real-time, để server push thay vì polling. Không cần interval phía client.

---

## 6. Khi nào nên tránh timer

- **Polling khi đã có React Query:** Ưu tiên refetchInterval; tránh setInterval tự viết.
- **Cập nhật real-time:** Ưu tiên WebSocket/SSE thay vì polling khi backend hỗ trợ.
- **Countdown hoặc delay một lần:** Một setTimeout với cleanup là ổn. Với tick lặp (countdown mỗi 1s), dùng setInterval với cleanup hoặc recursive setTimeout. Tránh start setInterval mới mỗi render (đó là bug — không cleanup, chồng).

Trade-off: setInterval đơn giản nhưng bạn phải cleanup và xử lý stale closure. Recursive setTimeout tránh chồng (một timer tại một thời điểm) nhưng bạn phải cancel/clear và guard callback. React Query (hoặc tương tự) tránh timer tay cho server data.
