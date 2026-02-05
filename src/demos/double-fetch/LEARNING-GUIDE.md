# Hướng dẫn học: Double fetch trong React

**Mục tiêu:** Hiểu **double fetch do StrictMode** (chỉ dev); **tại sao tắt StrictMode là sai**; **double fetch thật** do dependency không ổn định; **race** khi nhiều request cùng in-flight; cách thiết kế fetch an toàn (deps ổn định, cleanup).

**Điều kiện:** Đã nắm useEffect, dependency array, cleanup.

---

## 1. Thứ tự học

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Đọc **README.md** (nếu có) | Nắm StrictMode double effect vs unstable deps. |
| 2 | Chạy demo (có StrictMode) → mở Console | Thấy hai `[effect] mount` và hai request khi mount. |
| 3 | Tab **Unstable deps** (nếu có) → gõ / đổi filter | Effect chạy mỗi render vì deps là object mới. |
| 4 | Tab **Fixed** (nếu có) | Cleanup + cancelled flag; deps primitive hoặc useMemo. |
| 5 | **PR-REVIEW.md** (nếu có) | Dev-only vs production; race; cách thiết kế. |

---

## 2. Double fetch do StrictMode (chỉ dev)

Trong **React 18 Strict Mode** (development), React **cố ý** chạy effect **hai lần** khi mount:

1. Mount → chạy effect
2. Chạy cleanup (hàm bạn return từ effect)
3. Chạy effect lại

Nên bạn thấy hai log `[effect] mount` và, nếu effect bắt đầu fetch, **hai request fetch**. Đây là **thiết kế** và chỉ xảy ra ở development khi app được bọc trong `<StrictMode>`.

**Tại sao StrictMode làm vậy:**

- Để lộ bug **giả định “effect chạy đúng một lần.”** Nếu logic hoặc cleanup của bạn dựa vào đó, sẽ vỡ khi React chạy effect hai lần (hoặc khi concurrent re-run effects).
- Để đảm bảo **cleanup đúng.** Nếu bạn subscribe, fetch, hoặc start timer trong effect, cleanup phải hủy/bỏ qua công việc in-flight khi effect bị “thay thế” hoặc component unmount.

**Tóm lại:** Double run là **cố ý** để bạn viết effect bền (có cleanup), không dựa vào “chạy một lần.”

---

## 3. Tại sao tắt StrictMode là cách xử lý sai

Nếu bạn bỏ `<StrictMode>` để “sửa” double fetch:

- **Bạn che triệu chứng, không sửa nguyên nhân.** Effect vẫn giả định chạy một lần; bạn chưa thêm cleanup đúng.
- **Production vẫn có thể double-invoke.** Trong concurrent React, effect có thể bị re-run khi React cần (ví dụ offscreen → visible). Nếu bạn không xử lý double run ở dev bằng cleanup, bạn có thể gặp bug ở production.
- **Bạn mất các kiểm tra khác của Strict Mode.** Strict Mode còn double-invoke render (để tìm impure render) và sẽ lộ thêm vấn đề ở các phiên bản React sau. Tắt nó là mất an toàn.

**Cách đúng:** Giữ StrictMode. Làm effect **bền**: dùng flag `cancelled` (hoặc `aborted`) trong cleanup; trong `.then`/`.catch` của fetch chỉ gọi `setState` nếu `!cancelled`. Khi đó kết quả của lần chạy đầu bị bỏ qua khi cleanup của lần chạy thứ hai chạy; chỉ kết quả của “lần cuối” được dùng.

---

## 4. Double fetch thật: dependency effect sai

Double (hoặc nhiều lần) fetch **thật** xảy ra khi effect chạy **nhiều hơn bạn mong** vì **dependency không ổn định**:

- **Object/array trong deps:** Bạn viết `useEffect(..., [filters])` và `filters = { status, search }` tạo trong body component → **mỗi render** tạo object mới. React so deps bằng `Object.is`; `{} !== {}`, nên effect chạy mỗi lần. Kết quả: một fetch mỗi render (double hoặc nhiều).
- **Thiếu deps:** Bỏ qua giá trị bạn dùng trong effect → stale closure; nếu “sửa” bằng thêm object literal thì rơi vào trường hợp trên.
- **Cách sửa:** Dùng deps **primitive**: `[status, search]` thay vì `[filters]`. Effect chỉ chạy khi `status` hoặc `search` thực sự đổi. Có thể build `filters` bên trong effect từ các primitive đó.

Bug này **không** chỉ ở dev; xảy ra cả production mỗi khi component re-render (parent update, context, state).

---

## 5. Chỉ dev vs vấn đề production thật

| Nguyên nhân | Chỉ dev? | Làm gì |
|-------------|----------|--------|
| **StrictMode double effect** | Có (chỉ dev) | Thêm cleanup (flag cancelled) để bỏ qua kết quả in-flight. Không tắt StrictMode. |
| **Unstable deps (object trong deps)** | Không (cả production) | Dùng deps primitive hoặc `useMemo` cho dependency. |
| **Thiếu cleanup** | Có thể lộ ở dev (double run) và prod (race/unmount) | Luôn cleanup: hủy fetch, clear timer, unsubscribe. |
| **Race (nhiều fetch chồng)** | Không (cả production) | Hủy request trước trong cleanup (flag cancelled hoặc AbortController). |

---

## 6. Race khi nhiều fetch chồng

Khi user đổi filter nhanh, bạn có thể có **hai (hoặc nhiều) request cùng in-flight**:

- Request A (ví dụ status = "all") — chậm (600ms trong demo)
- Request B (ví dụ status = "active") — nhanh (250ms)

Nếu bạn không hủy A khi B bắt đầu, B có thể xong trước và bạn set state theo data của B. Sau đó A xong và bạn set state theo data của A → **sai**: UI hiển thị "all" trong khi user đã chọn "active."

**Cách sửa:** Trong cleanup của effect set `cancelled = true` (hoặc abort request trước bằng AbortController). Trong `.then` của mỗi request chỉ gọi `setState` nếu `!cancelled`. Khi A xong sau khi B đã chạy, bạn bỏ qua kết quả của A.

---

## 7. Thiết kế logic fetch an toàn

1. **Dependency ổn định:** Dùng primitive hoặc reference ổn định (ví dụ `useMemo` cho object) trong dependency array của effect. Tránh `[someObject]` khi `someObject` tạo trong render.
2. **Cleanup:** Mọi effect bắt đầu fetch (hoặc subscription/timer) phải return cleanup hoặc:
   - Set flag `cancelled` để callback in-flight không gọi `setState`, hoặc
   - Abort request (AbortController) để request thực sự bị hủy.
3. **Giữ StrictMode:** Đừng bỏ để tránh double run. Viết effect chịu được chạy hai lần và cleanup đúng.
4. **Cân nhắc React Query (hoặc tương tự):** Với server state, thư viện xử lý cache, cancellation và loading; bạn tránh bug effect/deps/cleanup tay.

Trade-off: useEffect tay cho toàn quyền nhưng bạn phải làm đúng deps và cleanup. React Query đổi quyền đó lấy ít code và ít bug hơn.
