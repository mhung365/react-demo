# Hướng dẫn học: State Classification (UI / Client / Server)

**Mục tiêu:** Phân loại state đúng (UI, client, server); biết **nơi lưu** và **công cụ** phù hợp; thấy lỗi khi nhầm server state với client/global state và cách refactor.

**Điều kiện:** Đã dùng `useState`, `useEffect`, Context; hiểu fetch trong effect và loading/error state.

---

## 1. Thứ tự học (learning path)

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Đọc **README.md** | Nắm định nghĩa UI / client / server state và bảng tool. |
| 2 | Chạy app → **Wrong** tab → Filters → đổi search, status, page size → List | Thấy loading mỗi lần; không cache. |
| 3 | **Wrong** → mở List → click item (modal) → đóng → chuyển tab khác rồi quay lại | List lại loading — mỗi lần mount refetch. |
| 4 | **Refactored** tab → Filters → đổi search → List (loading) → đổi search lại rồi quay lại filter cũ | Lần quay lại filter cũ: data từ cache (có thể vẫn “Loading…” rất ngắn nếu refetch background). So sánh với Wrong: không cache. |
| 5 | **Refactored** → đổi page size (client pref) | Page size từ PreferencesContext; list refetch với pageSize mới (query key đổi). |
| 6 | Đọc **WrongImplementation.tsx** | Server data trong useState + useEffect; UI/client/server gom một chỗ; không cache. |
| 7 | Đọc **RefactoredCorrect.tsx** | useQuery cho server state; useState cho UI; PreferencesContext cho client (pageSize). |
| 8 | **mockApi.ts**, **types.ts** | API giả và kiểu dữ liệu. |
| 9 | **PR-REVIEW.md** | Sai lầm hay gặp, trade-off, scale. |

---

## 2. Khái niệm bắt buộc

### 2.1 UI state

- **Là gì:** State chỉ phục vụ giao diện, thoáng qua: modal mở/đóng, tab đang chọn, ô input search, trang pagination.
- **Ở đâu:** Component (hoặc ancestor nhỏ nhất cần dùng). Không cần global.
- **Công cụ:** `useState`. Có thể đồng bộ với URL (search, filter) nếu cần share link.

**Trong demo:** `modalOpen`, `activeTab`, `search`, `statusFilter`, `page`, `selectedId` — tất cả UI state, đều `useState` trong dashboard.

### 2.2 Client state

- **Là gì:** State của app, không đến từ server: preference (theme, page size, sidebar đóng/mở), onboarding đã xong, v.v.
- **Ở đâu:** Context hẹp (một concern một context) hoặc localStorage + context.
- **Công cụ:** Context + `useState`, hoặc sync với localStorage. **Không** trộn với server state trong cùng context.

**Trong demo:** `pageSize` — preference dùng chung (cross-feature) → `PreferencesContext`. Refactored: context chỉ có pageSize/setPageSize.

### 2.3 Server state

- **Là gì:** Dữ liệu từ API: list items, user profile, v.v. Có cache, stale, loading, error, refetch, invalidation.
- **Ở đâu:** **Không** lưu trong React state/context như “source of truth”. Giao cho thư viện cache (React Query).
- **Công cụ:** React Query (`useQuery`). Query key = bộ tham số request; cache, staleTime, refetch do thư viện quản lý.

**Trong demo:** Danh sách items theo filter/page/pageSize — server state. Wrong: `useState` + `useEffect` (tự quản loading, không cache). Refactored: `useQuery` với queryKey `['items', { search, status, page, pageSize }]`.

---

## 3. Data trong demo — phân loại

| Data | Loại | Wrong | Refactored |
|------|------|--------|------------|
| items, loading, error | Server state | useState + useEffect; no cache | useQuery (cache, staleTime, loading/error) |
| search, statusFilter, page, modalOpen, activeTab, selectedId | UI state | useState (đúng chỗ nhưng lẫn với server) | useState (tách bạch) |
| pageSize | Client state | useState (coi như UI, không share) | PreferencesContext |

---

## 4. Lỗi khi misclassify

1. **Server data trong useState/Context**
   - Mỗi mount refetch; không cache; không shared cache giữa components. Tự viết loading/error/invalidation → dễ thiếu (stale, duplicate request).
2. **UI state đưa lên global**
   - Một keystroke (search) re-render cả app. Modal state trong root → mọi component nhận context đổi khi đóng/mở modal.
3. **Client + server trong một context**
   - Cập nhật preference (client) re-render cả consumer đang dùng server data; hoặc ngược lại. Tách context: PreferencesContext vs không có “ItemsContext”.

---

## 5. Từng file — học gì từ code

### WrongImplementation.tsx

- `items`, `loading`, `error` — server state nhưng trong useState + fetch trong useEffect. Không cache.
- `search`, `statusFilter`, `page`, `pageSize`, `modalOpen`, `activeTab`, `selectedId` — gom chung; pageSize thực ra là client preference.
- Effect phụ thuộc `[search, statusFilter, page, pageSize]` — mỗi thay đổi refetch. Navigate away và back → component mount lại → effect chạy lại → loading lại.

### RefactoredCorrect.tsx

- **QueryClientProvider** bọc app (hoặc subtree) — React Query quản cache.
- **PreferencesProvider** — context chỉ có pageSize/setPageSize (client state).
- **DashboardRefactored:** UI state (search, status, page, modal, tab, selectedId) = useState. Server state = useQuery với queryKey từ filter + pageSize. Khi query key giống lần trước → data từ cache; loading/error từ query.

### mockApi.ts

- Giả lập API trả về items theo filter/pagination. Delay 400ms để thấy loading. Production thay bằng fetch/axios.

---

## 6. Khi nào dùng gì (tóm tắt)

- **Modal/tab/input/page (UI)** → `useState` local.
- **Preference, theme (client, cross-feature)** → Context nhỏ hoặc localStorage + context.
- **API data (server)** → React Query (useQuery). Không mặc định fetch trong useEffect rồi setState.

Sau khi làm xong demo, đọc **PR-REVIEW.md** để xem sai lầm hay gặp và cách review trong PR thật.
