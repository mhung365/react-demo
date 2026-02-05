# Hướng dẫn học: Khi useMemo làm app chậm hơn

**Mục tiêu:** Hiểu **chi phí của memoization**, khi useMemo **thêm overhead mà không có lợi**, khi nó **thực sự tránh vấn đề hiệu năng**, và cách **dependency không ổn định** làm mất tác dụng memo.

**Điều kiện:** Đã nắm useMemo, React.memo, reference equality.

---

## 1. Thứ tự học (learning path)

| Bước | File / hành động | Mục đích |
|------|------------------|----------|
| 1 | Đọc **README.md** | Nắm cost, unnecessary vs justified, unstable deps |
| 2 | Tab **Dashboard (measure)** → click Increment vài lần | So sánh "Last render" ms: cheap no-memo (baseline) vs cheap useMemo (overhead) vs expensive justified (cache hit) vs unstable deps (recompute mỗi lần). |
| 3 | Tab **Unnecessary useMemo** → click Increment vài lần | Factory chạy 1 lần; không có consumer cần stable ref |
| 4 | Tab **Better without useMemo** → click Increment | Không useMemo; so sánh [measure] với Unnecessary |
| 5 | Tab **Justified useMemo** → click Increment | Parent re-render nhưng useMemo cache hit; child không re-render |
| 6 | Tab **Unstable deps** → click Increment | Factory chạy mỗi lần; cache không bao giờ dùng |
| 7 | **simulateWork.ts** | cheapComputation() vs simulateExpensiveWork() |
| 8 | **useMeasureRender.ts** | Log thời gian render (~[measure]); optional onMeasured(ms) cho Dashboard |
| 9 | **UnnecessaryUseMemo** vs **BetterWithoutUseMemo** | Cùng computation rẻ; có useMemo = overhead, không có = đơn giản hơn |
| 10 | **JustifiedUseMemo** | Computation đắt + child memo nhận result; useMemo đúng chỗ |
| 11 | **UnstableDepsUseMemo** | Deps thay đổi mỗi render → recompute mỗi lần; memo vô hiệu |
| 12 | **PR-REVIEW.md** | Sai lầm hay gặp, trade-off, khi nào không nên tối ưu |

---

## 2. Khái niệm: Cost và khi nào dùng

| Thuật ngữ | Nghĩa |
|-----------|--------|
| **Cost của memoization** | Mỗi render: so sánh deps (Object.is). Khi deps đổi: chạy factory và lưu kết quả. Luôn trả giá so sánh; đôi khi trả giá factory. Lưu trữ: deps cũ + result. |
| **Unnecessary useMemo** | Computation rẻ và không có consumer cần stable ref → overhead không đem lại lợi. Tính trong render. |
| **Justified useMemo** | Computation đắt và/hoặc consumer được memo nhận value. Deps ổn định → bỏ qua recompute, cùng ref → child bỏ qua re-render. |
| **Unstable deps** | Deps tạo mới mỗi render (object/array inline) → recompute mỗi lần, không bao giờ cache hit. Trả comparison + factory mỗi lần — tệ hơn không dùng useMemo. |

---

## 3. Bài tập

1. **JustifiedUseMemo:** Tạm bỏ useMemo, tính result trực tiếp trong render. Click Increment — child có re-render mỗi lần không? So sánh với có useMemo.
2. **UnstableDepsUseMemo:** Đổi deps thành useMemo(() => ({ theme: 'dark' }), []) để ổn định. Click Increment — factory còn chạy mỗi lần không?
3. Khi nào **không** nên dùng useMemo? (Xem PR-REVIEW.)
