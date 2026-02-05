# Hướng dẫn học: Context — Khi nào tốt hơn props drilling, khi nào không

**Mục tiêu:** Hiểu **khi nào Context tốt hơn props drilling** (drilling quá nhiều tầng); **khi nào Context bị lạm dụng** (một context toàn cục gây re-render rộng); và **cách refactor** (tách context, scoped).

**Điều kiện:** Đã nắm props drilling, Context (Provider, useContext), re-render.

---

## 1. Thứ tự học (learning path)

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Đọc **README.md** | Nắm bốn biến thể: props noisy, context appropriate, overuse, refactored. |
| 2 | Tab **Props drilling (noisy)** | Thấy theme, user, setTheme được truyền qua Layout → Sidebar → NavItem / UserBadge, và Main → Page → ThemedCard. Prop list dài. |
| 3 | Tab **Context appropriate** | ThemeContext và UserContext tách; không drill; consumer dùng useTheme() / useUser(). |
| 4 | Tab **Context overuse** → bật theme | Console: 6+ [render] mỗi lần toggle. UserBadge chỉ cần user vẫn re-render. |
| 5 | Tab **Refactored** | Tách ThemeContext + UserContext; mỗi consumer chỉ subscribe đúng thứ cần. |
| 6 | **PropsDrillingNoisy.tsx**, **ContextAppropriate.tsx**, **ContextOveruse.tsx**, **ContextRefactored.tsx** | So sánh cấu trúc và re-render. |
| 7 | **PR-REVIEW.md** | Sai lầm khi dùng Context; trade-offs; khi nào tránh Context. |

---

## 2. Khi nào Context tốt hơn props drilling

- **Cùng một dữ liệu** (theme, user) qua **nhiều tầng** (5–6): drill qua Layout, Sidebar, Main, Page → dễ quên tầng, prop list dài. Context: consumer dùng useContext, không cần truyền qua trung gian. Rõ ràng hơn.
- **Nhiều nhánh** cần cùng dữ liệu: Sidebar (NavItem, UserBadge) và Main (ThemedCard) đều cần theme/user. Drill từ root qua từng nhánh rất dài; Context cho phép mỗi nhánh đọc trực tiếp.

## 3. Khi nào Context bị lạm dụng

- **Một context chứa mọi thứ** (theme, user, sidebarOpen, …): bất kỳ thay đổi nào → value mới → **mọi** consumer re-render. Component chỉ cần user vẫn re-render khi theme đổi. Giải pháp: tách context (ThemeContext, UserContext) hoặc scope Provider chỉ nhánh cần dùng.

## 4. Refactor: scoped, split contexts

- Thay một AppContext bằng **ThemeContext** và **UserContext**. Mỗi consumer chỉ subscribe đúng context cần. Rõ ràng, dễ bảo trì; tránh re-render rộng do một value toàn cục.
