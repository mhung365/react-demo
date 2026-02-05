# Hướng dẫn học: useEffect vs useLayoutEffect

**Mục tiêu:** Hiểu **thứ tự thời gian** (trước paint vs sau paint) và **khi nào dùng useLayoutEffect** (đo DOM, định vị tooltip) vs **khi nào tránh** (fetch, subscribe — chặn paint).

**Điều kiện:** Đã nắm useEffect, commit phase, và effect lifecycle.

---

## 1. Thứ tự học (learning path)

| Bước | File / hành động | Mục đích |
|------|------------------|----------|
| 1 | Đọc **README.md** | Nắm timing: useLayoutEffect trước paint, useEffect sau paint |
| 2 | Tab **Timing order** → mở Console | Thấy useLayoutEffect → rAF (paint) → useEffect |
| 3 | Tab **useEffect flicker** → Show tooltip | Thấy tooltip nhảy / flicker; useEffect chạy sau paint |
| 4 | Tab **useLayoutEffect fix** → Show tooltip | Tooltip xuất hiện đúng vị trí, không nhảy |
| 5 | Tab **Bad useLayoutEffect** | First paint bị trễ ~300ms; dùng useLayoutEffect cho "fetch" là sai |
| 6 | **useEffectVsLayoutTiming.ts** | Log "before paint" (useLayoutEffect) và "after paint" (useEffect) |
| 7 | **PositionFlickerBug** vs **PositionFlickerFixed** | Cùng UI; bug = measure trong useEffect → flicker; fix = measure trong useLayoutEffect |
| 8 | **BadUseLayoutEffect** | Fetch (giả lập) trong useLayoutEffect → chặn paint; nên dùng useEffect |
| 9 | **PR-REVIEW.md** | Sai lầm hay gặp, trade-off, khi nào tránh useLayoutEffect |

---

## 2. Khái niệm: Timing

| Giai đoạn | Ý nghĩa |
|-----------|--------|
| **Commit** | React đã cập nhật DOM (reconcile). |
| **useLayoutEffect** | Chạy ngay sau commit, **trước khi trình duyệt vẽ** (paint). Đồng bộ; **chặn** paint. |
| **Paint** | Trình duyệt vẽ lên màn hình. |
| **useEffect** | Chạy **sau** paint. Không chặn paint. |

**Kết luận:** Dùng useLayoutEffect khi cần đọc layout (getBoundingClientRect, scroll) hoặc mutate DOM và cần kết quả hiển thị ngay trong frame đầu (ví dụ định vị tooltip). Dùng useEffect cho fetch, subscribe, log — không chặn paint.

---

## 3. Bài tập

1. **PositionFlickerBug:** Đổi từ useEffect sang useLayoutEffect; kiểm tra tooltip không còn nhảy.
2. **BadUseLayoutEffect:** Đổi "fetch" giả lập sang useEffect; kiểm tra first paint không bị trễ 300ms.
3. Khi nào **bắt buộc** dùng useLayoutEffect? Khi nào **không nên** dùng?
