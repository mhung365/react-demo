# Hướng dẫn học: Render snapshot & closures

**Mục tiêu:** Hiểu **value equality** vs **reference equality** trong bối cảnh **render snapshot**; tại sao closure “giữ” giá trị của một render cụ thể; bug stale closure và cách sửa bằng functional update.

**Điều kiện:** Đã nắm React cơ bản (useState, event handlers, setTimeout).

---

## 1. Thứ tự học (learning path)

| Bước | File / hành động | Mục đích |
|------|------------------|----------|
| 1 | Đọc **README.md** | Nắm snapshot, closure, value vs reference |
| 2 | Chạy app → tab **Broken** → mở Console | Thấy `[snapshot]` mỗi render với `count`, `renderId` |
| 3 | Click **Increment in 1.5s** 3 lần nhanh | Count chỉ lên 1; console thấy handler tạo ở render #1 với snapshot count = 0; khi timeout chạy, "current count" vẫn 0 → stale |
| 4 | Tab **Fixed** → cùng thao tác | Count lên 3; log thấy dùng `setCount(c => c + 1)` — không đóng over count |
| 5 | **useSnapshotLog.ts** | Log snapshot mỗi render; `useLatestRef` để so sánh "giá trị từ closure" vs "giá trị hiện tại" khi async chạy |
| 6 | **CounterBroken.tsx** | Handler `setTimeout(() => setCount(count + 1))` — `count` từ snapshot lúc tạo; log rõ render # và stale |
| 7 | **CounterFixed.tsx** | Handler `setTimeout(() => setCount(c => c + 1))` — không đóng over count |
| 8 | **PR-REVIEW.md** | Sai lầm mid-level, trade-off, khi nào mental model này quan trọng |

---

## 2. Khái niệm: Render snapshot & closure

| Thuật ngữ | Nghĩa |
|-----------|--------|
| **Render snapshot** | Mỗi lần component function chạy = một “lần render”. Props và state tại thời điểm đó là **một snapshot** bất biến. Một lần render khác = snapshot khác. |
| **Closure** | Hàm (event handler, callback setTimeout/promise) được tạo **trong** một lần render sẽ “đóng” (close over) các biến trong scope của lần render đó. Nó giữ **giá trị** của snapshot đó, không phải giá trị “mới nhất” khi callback thực thi sau này. |
| **Value vs reference (trong ngữ cảnh snapshot)** | *Value* (ví dụ `count = 0`) là đúng **cho snapshot đó**. *Reference* (binding mà closure giữ) trở thành **stale** khi ta muốn dùng giá trị “hiện tại” tại thời điểm callback chạy. |

**Kết luận:** Logic “đọc count rồi set count + 1” trông đúng trong code, nhưng `count` trong callback là từ snapshot cũ → bug. Sửa: không đóng over state — dùng **functional update** `setState(prev => next)`.

---

## 3. Tại sao bug xảy ra (nội bộ)

1. **Render 1:** `count = 0`. User click “Increment in 1.5s” → tạo callback `() => setCount(0 + 1)`. Callback này **đóng over** `count = 0` (snapshot của render 1).
2. **Trước 1.5s:** Không có re-render (chưa setState). Nếu user click thêm 2 lần, mỗi lần vẫn chỉ có snapshot render 1, nên ta tạo 3 callback giống nhau: đều dùng `count = 0` → đều gọi `setCount(1)`.
3. **Sau 1.5s:** 3 timeout chạy → 3 lần `setCount(1)` → count cuối = 1. Ta muốn 3, nhưng closure chỉ thấy 0.

**“Value looks correct” vs “reference is stale”:** Trong render 1, giá trị `count = 0` là **đúng** cho snapshot đó. Nhưng **reference** (binding trong closure) là cố định ở 0; khi callback chạy sau 1.5s, “giá trị mới nhất” có thể đã khác (ở ví dụ này chưa re-render nên vẫn 0; nếu có re-render trước khi timeout chạy thì “current” đã lớn hơn). Stale = closure không thấy “current”, chỉ thấy snapshot cũ.

---

## 4. Data trong demo — toàn UI state

| Data | Nơi sống | Loại | Ghi chú |
|------|----------|------|---------|
| `count` | CounterBroken / CounterFixed (useState) | UI state | Giá trị hiển thị; trong Broken bị closure giữ snapshot. |
| `renderId` | ref tăng mỗi render | UI state (observability) | Chỉ để log “render #N”. |
| `latestCountRef` | useLatestRef(count) (Broken) | UI state (observability) | Luôn = count hiện tại; dùng để so sánh khi timeout chạy. |

**Tại sao không dùng ref để “sửa” Broken?** Có thể dùng ref lưu count và đọc ref trong timeout, nhưng đó là pattern “read latest from ref”; functional update đơn giản hơn và là cách React khuyến nghị cho “next state phụ thuộc prev state”. Demo cố ý dùng functional update làm cách sửa chính.

---

## 5. Bài tập

1. **Broken:** Đổi delay thành 100ms, click 5 lần nhanh. Đếm số lần `[snapshot]` và số lần timeout log “STALE”.
2. **Fixed:** Giữ delay 1.5s, thêm nút “Increment now” 5 lần rồi ngay sau đó click “Increment in 1.5s” 2 lần. Giải thích tại sao count cuối = 7.
3. **useEffect cleanup:** Viết một component có `useEffect` với `setInterval` log `count` mỗi giây; không có deps. So sánh: đưa `count` vào deps vs dùng functional update hoặc ref — khi nào closure stale?
