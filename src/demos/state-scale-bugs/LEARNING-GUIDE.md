# Hướng dẫn học: State Placement Bugs at Scale

**Mục tiêu:** Hiểu **các lỗi xuất hiện khi state đặt sai** khi app mở rộng: **stale UI**, **inconsistent data**, **unnecessary re-renders**; biết **early warning signs** và cách refactor.

**Điều kiện:** Đã nắm state colocation vs lifting, single source of truth.

---

## 1. Thứ tự học (learning path)

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Đọc **README.md** | Nắm ba loại bug: stale UI, inconsistent data, re-renders. |
| 2 | Tab **Initial** | Thấy List + Detail, selectedId ở parent. Hoạt động đúng. |
| 3 | Tab **Scaled with bugs** | (1) Chọn item từ main List — Recent list không cập nhật highlight (stale). (2) Bấm "Clear selection" ở Detail — Detail trống nhưng List vẫn highlight item (inconsistent). (3) Mở console — mỗi thao tác log 5+ [render]. |
| 4 | Tab **Refactored** | Chọn từ List → Recent list highlight đúng. Clear → List và Detail cùng clear. Ít re-render hơn. |
| 5 | **InitialSmallScale.tsx** | selectedId ở parent; List và Detail nhận từ props. Một nguồn sự thật. |
| 6 | **ScaledWithBugs.tsx** | Recent list có highlightedId riêng (stale). Detail có detailCleared riêng (inconsistent). selectedId, favorites, recentIds cùng ở parent (re-render rộng). |
| 7 | **RefactoredScalable.tsx** | Một nguồn sự thật; Recent dùng parent selectedId; Detail Clear gọi onClearSelection(); memo cho Sidebar và RecentList. |
| 8 | **PR-REVIEW.md** | Early warning signs, trade-offs, cách phát hiện sớm. |

---

## 2. Ba loại bug từ state placement sai

| Bug | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| **Stale UI** | Child giữ bản copy riêng (e.g. highlightedId). Parent đổi selectedId (từ list khác) nhưng child không nhận → child vẫn highlight item cũ. | Một nguồn sự thật: parent hold selectedId; child nhận qua prop, không giữ state riêng cho "cái nào đang chọn". |
| **Inconsistent data** | Child có state local override hiển thị (e.g. "Clear" set local cleared) nhưng parent không đổi → List vẫn show selected, Detail show "Select an item". | Hành động thay đổi state chung phải update owner (parent). Không dùng local state để "ẩn" dữ liệu chung. |
| **Unnecessary re-renders** | Mọi state ở một parent; mỗi thay đổi re-render mọi child. | Tách state theo feature hoặc memo child + truyền props ổn định để thu hẹp scope re-render. |

---

## 3. Early warning signs (dấu hiệu sớm)

- **Hai nơi cùng lưu "cái nào đang chọn":** Parent có selectedId, child có highlightedId/localSelection → dễ stale hoặc inconsistent. Nên chỉ một nơi (parent), child nhận prop.
- **"Clear" / "Reset" chỉ đổi UI local:** Nếu Clear chỉ set state trong child mà không gọi callback lên parent → List và Detail có thể lệch. Nên Clear gọi onClearSelection() để parent update.
- **Thêm feature mới là phải kéo state lên cao:** Nếu mỗi feature mới (Favorites, Recent) đều khiến bạn đẩy state lên root → blast radius tăng. Cân nhắc minimal ancestor hoặc tách context theo feature.

---

## 4. Cách phát hiện sớm

- **Manual test:** Chọn từ list A, xem list B có cập nhật highlight không. Bấm Clear ở panel, xem list có bỏ highlight không.
- **Render logs:** Thêm useRenderLog (hoặc React DevTools Profiler); mỗi click xem bao nhiêu component re-render. Nếu mọi action đều re-render toàn bộ cây → cân nhắc tách state hoặc memo.
- **Code review:** Khi thêm state mới, hỏi: "Ai cần đọc? Ai cần ghi?" Nếu chỉ một subtree cần → colocate hoặc minimal ancestor; tránh đẩy lên root.
