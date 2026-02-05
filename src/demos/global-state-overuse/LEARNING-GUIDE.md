# Hướng dẫn học: Global State Overuse

**Mục tiêu:** Hiểu **tại sao global state (Context / Redux) thường bị lạm dụng**; thấy **coupling** và **re-render scope** khi UI state bị đưa lên global; biết **khi nào global state thực sự cần thiết**.

**Điều kiện:** Đã nắm Context (useContext, Provider), re-render (khi context value đổi thì mọi consumer re-render).

---

## 1. Thứ tự học (learning path)

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Đọc **README.md** | Nắm global by convenience vs refactored vs global by necessity. |
| 2 | Tab **Global by convenience** → gõ vào search, mở Console | Thấy 6+ component log `[render]` mỗi keystroke; toggle sidebar cũng vậy. |
| 3 | Tab **Refactored** → gõ search | Chỉ SearchSection, SearchPanel, UserList re-render; UserDetail (memo) không. Toggle sidebar → chỉ Layout, Sidebar. |
| 4 | Tab **Global by necessity** → toggle theme | Chỉ Header, ThemeToggle log; UnrelatedPanel không (ở ngoài Provider). |
| 5 | **GlobalByConvenience.tsx** | Một AppStoreContext chứa sidebarOpen, currentStep, searchQuery, selectedUserId. Mọi consumer re-render khi bất kỳ giá trị nào đổi. |
| 6 | **RefactoredLocalOwnership.tsx** | State ở Layout (sidebar), StepWizard (step), SearchSection (search + selection). UserDetail memo. |
| 7 | **GlobalByNecessity.tsx** | Chỉ ThemeContext; Provider bọc chỉ Header + ThemeToggle. UnrelatedPanel ngoài Provider. |
| 8 | **PR-REVIEW.md** | Lý do dev hay “với tay” lên global state; khi nào global state hợp lý. |

---

## 2. Khái niệm: Global by convenience vs by necessity

| Thuật ngữ | Nghĩa |
|-----------|--------|
| **Global by convenience** | Đưa UI state (sidebar, step, search, selection) vào Context/Redux “để mọi nơi đều đọc được”. Hệ quả: mọi consumer re-render khi bất kỳ slice nào đổi; coupling cao. |
| **Refactored (local / feature ownership)** | State colocate hoặc ở minimal ancestor: chỉ component/subtree cần state mới re-render khi state đổi. Blast radius nhỏ. |
| **Global by necessity** | State thực sự app-wide (theme, current user) và có ít consumer hoặc update thô (toggle theme, login). Provider có thể bọc chỉ phần cây cần dùng → component ngoài Provider không re-render khi context đổi. |

---

## 3. Data trong demo

| Data | Global by convenience | Refactored |
|------|------------------------|------------|
| sidebarOpen | AppStoreContext | Layout (useState) |
| currentStep | AppStoreContext | StepWizard (useState) |
| searchQuery | AppStoreContext | SearchSection (useState) |
| selectedUserId | AppStoreContext | SearchSection (useState) |
| theme | (không có) | GlobalByNecessity: ThemeContext, chỉ Header + ThemeToggle |

---

## 4. Từng file — học gì từ code

### 4.1 GlobalByConvenience.tsx

- **AppStoreProvider:** useState cho sidebarOpen, currentStep, searchQuery, selectedUserId; value = useMemo([...], [sidebarOpen, currentStep, searchQuery, selectedUserId]). Mỗi khi một trong bốn đổi → value mới → Provider re-render → **mọi consumer re-render**.
- **HeaderGlobal, SidebarGlobal, StepWizardGlobal, SearchPanelGlobal, UserListGlobal, UserDetailGlobal:** đều useAppStore(). Chỉ cần một phần state (e.g. UserDetail chỉ selectedUserId) nhưng vẫn re-render khi searchQuery đổi.
- **Bài tập:** Gõ vài ký tự vào search, đếm số `[render]` trong console. So sánh với Refactored.

### 4.2 RefactoredLocalOwnership.tsx

- **LayoutLocal:** nhận sidebarOpen, setSidebarOpen (props từ parent). Parent (Dashboard) giữ useState(sidebarOpen). Toggle sidebar → chỉ Dashboard, Layout, Sidebar re-render.
- **StepWizardLocal:** useState(currentStep) nội bộ. Đổi step → chỉ StepWizard re-render.
- **SearchSectionWithUserList:** useState(searchQuery), useState(selectedUserId). Gõ search → SearchSection, SearchPanelLocal, UserListLocal re-render; UserDetailLocal (memo) nhận user (useMemo từ selectedUserId) nên khi chỉ search đổi mà selectedUserId không đổi → memo skip.
- **Bài tập:** So sánh số lần re-render khi gõ search: Global by convenience (6+) vs Refactored (3–4, UserDetail skip).

### 4.3 GlobalByNecessity.tsx

- **ThemeProvider:** useState(theme); bọc chỉ HeaderWithTheme và ThemeToggle. UnrelatedPanel là sibling (ngoài Provider). Khi theme đổi → ThemeProvider re-render → chỉ Header và ThemeToggle re-render; UnrelatedPanel không (parent của UnrelatedPanel không re-render).
- **Bài tập:** Toggle theme, kiểm tra UnrelatedPanel không log `[render]`.

---

## 5. Khi nào global state hợp lý

- **Theme, ngôn ngữ, current user:** Nhiều component xa nhau cần đọc; update không liên tục (toggle theme, login). Có thể dùng Context với Provider bọc chỉ nhánh cần dùng để giảm blast radius.
- **Server state (danh sách user, bài viết):** Nên dùng React Query / SWR, không nhét vào Context toàn bộ — cache và refetch theo key.

## 6. Khi nào không nên dùng global state

- **Chỉ một component hoặc một cây con cần state:** Colocate hoặc lift đến minimal ancestor, không cần Context/Redux.
- **UI state tạm (sidebar mở/đóng, step hiện tại, ô search, item được chọn):** Thường chỉ vài component cần; đặt ở local hoặc feature block tránh re-render toàn app.
