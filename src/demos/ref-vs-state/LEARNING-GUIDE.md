# Hướng dẫn học: useRef vs useState

**Mục tiêu:** Hiểu tại sao **useRef không gây re-render** còn **useState có**; khi nào dùng ref đúng (persist value, không drive UI), khi nào dùng ref là bug (data cần hiển thị).

**Điều kiện:** Đã nắm useState, useRef cơ bản.

---

## 1. Thứ tự học (learning path)

| Bước | File / hành động | Mục đích |
|------|------------------|----------|
| 1 | Đọc **README.md** | Nắm state vs ref, correct vs wrong |
| 2 | Chạy app → tab **State vs Ref** → mở Console | Thấy CounterWithState: mỗi click Increment → [render] + render # tăng. CounterWithRef: click Increment (ref) → không [render]; Force re-render → [render] + giá trị nhảy |
| 3 | Tab **Correct: ref** | Timer chạy mỗi giây; state hiển thị giây; interval ID trong ref để cleanup |
| 4 | Tab **Bug: ref as state** | Click Increment → số không đổi; ref không trigger re-render |
| 5 | **useRenderCount.ts** | Dùng ref để đếm số lần render; ref.current++ trong render không gây re-render |
| 6 | **CounterWithState.tsx** | setState → React schedule re-render → component chạy lại với state mới |
| 7 | **CounterWithRef.tsx** | ref.current++ → không setState → không re-render; Force re-render dùng setState để "thấy" ref |
| 8 | **CorrectRefUsage.tsx** | intervalIdRef cho setInterval/clearInterval; state cho seconds |
| 9 | **WrongRefUsage.tsx** | count trong ref + hiển thị ref.current → UI stale |
| 10 | **PR-REVIEW.md** | Sai lầm junior/mid, trade-off, khi nào không thay state bằng ref |

---

## 2. Khái niệm: useState tham gia render cycle; useRef không

| Thuật ngữ | Nghĩa |
|-----------|--------|
| **useState** | setState(newValue) báo cho React biết state đổi → React **schedule re-render** → lần render tiếp theo component chạy lại với state mới → tạo **render snapshot mới** → React commit DOM → UI cập nhật. |
| **useRef** | Ref là một "hộp" mutable, tồn tại qua các lần render. Gán ref.current = x **không** báo cho React → **không** schedule re-render → component function không chạy lại → **không** có render snapshot mới → UI không cập nhật. |
| **Render snapshot** | Mỗi lần component function chạy = một lần render; props và state tại thời điểm đó là snapshot. setState tạo snapshot mới; ref.current = x không tạo snapshot mới. |

**Kết luận:** Data cần **hiển thị** hoặc **ảnh hưởng output** → dùng state (để React re-render). Data chỉ cần **persist qua renders** hoặc **dùng trong callback/effect** mà không cần drive UI → có thể dùng ref.

---

## 3. Data trong demo — phân loại

| Data | Nơi sống | Loại | Ghi chú |
|------|----------|------|---------|
| count (CounterWithState) | useState | UI state | Drive UI → state đúng. |
| countRef (CounterWithRef) | useRef | Mutable value, không drive UI | Chỉ để minh họa "ref không re-render"; Force re-render dùng state khác. |
| seconds (CorrectRefUsage) | useState | UI state | Drive timer display. |
| intervalIdRef (CorrectRefUsage) | useRef | Imperative handle | Cần clear interval trong cleanup; không cần trong UI → ref đúng. |
| countRef (WrongRefUsage) | useRef | Bug | Đáng lẽ là state vì cần hiển thị. |

---

## 4. Bài tập

1. **CounterWithRef:** Bỏ nút "Force re-render", chỉ có "Increment (ref)". Giải thích tại sao người dùng không bao giờ thấy số tăng.
2. **WrongRefUsage:** Đổi countRef thành useState, giữ logic increment. So sánh: mỗi click có [render] không? UI có cập nhật không?
3. **CorrectRefUsage:** Thử lưu interval ID vào state thay vì ref. Gợi ý: setIntervalId(id) sau setInterval. Quan sát: có re-render thừa không? Cleanup có cần ID không?
