# Hướng dẫn học: useEffect dependency array

**Mục tiêu:** Hiểu dependency array là **contract** với React; khi nào ESLint đúng nhưng logic vẫn sai; khi nào “tắt rule” là ý tưởng tồi.

**Điều kiện:** Đã nắm useEffect, cleanup, và effect lifecycle.

---

## 1. Thứ tự học (learning path)

| Bước | File / hành động | Mục đích |
|------|------------------|----------|
| 1 | Đọc **README.md** | Nắm contract, React so deps thế nào, ESLint vs intent |
| 2 | Tab **Missing deps (bug)** → đổi user | "Loaded for" không đổi; console: effect chỉ chạy một lần |
| 3 | Tab **Missing deps (fixed)** → đổi user | "Loaded for" đổi; console: cleanup → effect; "reason: deps changed" |
| 4 | Tab **Unnecessary re-runs** → click Increment | Effect run count tăng mỗi lần; refactored: giữ 1 |
| 5 | Tab **Wrong logic** → gõ vào input | Fetch count tăng mỗi keystroke; refactored: chỉ tăng khi Search |
| 6 | **useEffectDepsLog.ts** | useWhyEffectRan: log "reason: mount | deps changed" và deps nào đổi |
| 7 | **MissingDepsBug** vs **MissingDepsFixed** | Thiếu deps → stale; đủ deps + cleanup → đúng |
| 8 | **AllDepsUnnecessary** vs **Refactored** | Thêm dep để “satisfy” ESLint → chạy thừa; refactor: bỏ dùng count trong effect |
| 9 | **AllDepsWrongLogic** vs **Refactored** | searchQuery trong deps → fetch mỗi keystroke; refactor: effect [userId], Search = onClick |
| 10 | **PR-REVIEW.md** | Sai lầm mid-level, trade-off, khi nào dùng pattern khác (event, derived state, ref, React Query) |

---

## 2. Khái niệm: Contract và quyết định re-run

| Thuật ngữ | Nghĩa |
|-----------|--------|
| **Contract** | Dependency array hứa với React: "Chạy lại effect khi bất kỳ giá trị nào trong mảng này thay đổi (so bằng Object.is)." [] = "không bao giờ chạy lại sau mount." |
| **React so sánh thế nào** | Sau commit, React so từng dep với giá trị lần trước (Object.is). Nếu có thay đổi → chạy cleanup (cũ) rồi chạy effect (mới). |
| **ESLint exhaustive-deps** | Cảnh báo khi bạn dùng một giá trị trong effect mà không có trong deps. Nó ép "contract đầy đủ" nhưng không biết intent (chạy một lần vs chạy khi X đổi, hay fetch khi click vs khi gõ). |
| **ESLint đúng, logic sai** | (1) Thêm dep → effect chạy khi ta chỉ muốn mount (chạy thừa). (2) Thêm searchQuery → fetch mỗi keystroke trong khi product muốn fetch khi bấm Search. |

---

## 3. Refactor không tắt ESLint

- **Missing deps:** Thêm đúng giá trị vào deps (userId) và cleanup (nếu subscribe). Không dùng eslint-disable.
- **Unnecessary re-runs:** Không dùng `count` trong effect (hoặc dùng ref nếu cần “latest” trong callback); deps = [].
- **Wrong trigger:** "Fetch khi Search" là event → xử lý trong onClick với searchQuery hiện tại. Effect chỉ [userId]. Không cho searchQuery vào deps.

---

## 4. Bài tập

1. **MissingDepsBug:** Bỏ eslint-disable và thêm userId vào deps. Kiểm tra: đổi user → "Loaded for" có cập nhật không?
2. **AllDepsWrongLogic:** Đổi effect thành [userId] và bỏ searchQuery; chỉ fetch khi Search click trong onClick. So sánh số lần fetch khi gõ vs khi bấm Search.
3. Khi nào dùng **event handler** thay vì effect cho "fetch khi user bấm nút"? Khi nào dùng **React Query** thay vì useEffect fetch?
