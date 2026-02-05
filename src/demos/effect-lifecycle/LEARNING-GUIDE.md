# Hướng dẫn học: useEffect lifecycle

**Mục tiêu:** Hiểu **khi nào useEffect chạy** và **khi nào cleanup chạy** (re-render / dep change / unmount); tránh bug do hiểu sai thứ tự (stale subscription, double effect).

**Điều kiện:** Đã nắm useState, useEffect cơ bản.

---

## 1. Thứ tự học (learning path)

| Bước | File / hành động | Mục đích |
|------|------------------|----------|
| 1 | Đọc **README.md** | Nắm render → commit → effect và khi nào cleanup chạy |
| 2 | Chạy app → tab **Order** → mở Console → click Increment | Thấy 1. render → 2. commit → 3. effect; mỗi lần click: 3b. effect cleanup → 3. effect ran |
| 3 | Tab **Correct effect + cleanup** | Đổi Channel A ↔ B; thấy unsubscribed rồi subscribed; listener count ổn định |
| 4 | Tab **Broken** | Đổi channel; thấy subscribed lại không có unsubscribed trước → double subscription |
| 5 | Tab **Unmount** | Unmount child; thấy effect cleanup của child; không có "effect ran" sau |
| 6 | **useLifecycleLog.ts** | Log render (trong body), commit (useLayoutEffect), effect và cleanup |
| 7 | **EffectOrderDemo.tsx** | Effect phụ thuộc [count]; mỗi lần count đổi → cleanup rồi effect |
| 8 | **CorrectEffect.tsx** | Subscribe trong effect; return () => unsub(); khi dep đổi → cleanup chạy trước |
| 9 | **BrokenEffect.tsx** | Subscribe nhưng không return cleanup → khi dep đổi effect chạy lại → leak |
| 10 | **PR-REVIEW.md** | Sai lầm hay gặp, trade-off, khi nào không dùng useEffect |

---

## 2. Khái niệm: Thứ tự lifecycle

| Giai đoạn | Ý nghĩa |
|-----------|--------|
| **Render** | Component function chạy; trả về JSX. Chưa cập nhật DOM. |
| **Commit** | React áp dụng thay đổi lên DOM (reconcile). useLayoutEffect chạy ngay sau commit (trước paint). |
| **Paint** | Trình duyệt vẽ lên màn hình. |
| **Effect** | useEffect chạy sau paint. Đây là lúc "side effect" chạy (subscribe, fetch, etc.). |
| **Cleanup** | Hàm return từ effect (và từ useLayoutEffect) được gọi: (1) trước lần chạy effect tiếp theo (khi deps thay đổi), (2) khi component unmount. |

**Kết luận:** Effect chạy **sau** khi DOM đã được cập nhật và sau paint. Cleanup của effect trước chạy **trước** khi effect mới chạy (nếu deps đổi) hoặc khi unmount.

---

## 3. Bug do hiểu sai timing

- **Không cleanup khi subscribe:** Khi dep (ví dụ channelId) đổi, effect chạy lại và subscribe vào channel mới. Nếu không return cleanup để unsubscribe channel cũ, channel cũ vẫn giữ listener → leak. Và nếu cùng một channel được subscribe hai lần (ví dụ dep sai), ta có double subscription.
- **Cho rằng cleanup chạy "sau" effect mới:** Sai. Cleanup của effect cũ chạy **trước** effect mới. Thứ tự đúng: cleanup (cũ) → effect (mới).

---

## 4. Data trong demo

| Data | Nơi sống | Loại | Ghi chú |
|------|----------|------|---------|
| count (EffectOrderDemo) | useState | UI state | Dep của effect; mỗi lần đổi → cleanup rồi effect |
| channelId (Correct/Broken) | useState | UI state | Dep của effect; đổi channel → cleanup (unsub) rồi effect (subscribe mới) |
| mounted (UnmountDemo) | useState | UI state | Quyết định mount/unmount child; unmount → child effect cleanup |

---

## 5. Bài tập

1. **EffectOrderDemo:** Thêm một effect với deps `[]`. So sánh: khi click Increment, effect nào chạy lại? Effect nào có cleanup chạy?
2. **BrokenEffect:** Thêm return cleanup gọi unsub(). Chuyển A → B; kiểm tra console: có "unsubscribed" trước "subscribed" không?
3. **UnmountDemo:** Trong child, thêm effect với dep [mounted] (từ parent qua props). Khi unmount, giải thích thứ tự: parent re-render → child unmount → child cleanup.
