# Hướng dẫn học: Re-render Demo

**Mục tiêu:** Hiểu rõ **khi nào** và **tại sao** component re-render; phân biệt **re-render** vs **DOM update**; biết khi nào dùng `memo` / `useMemo` / `useCallback` và khi nào không.

**Điều kiện:** Đã nắm useState, component function, props cơ bản.

---

## 1. Thứ tự học

| Bước | File / hành động | Mục đích |
|------|------------------|----------|
| 1 | Đọc **README.md** | Nắm định nghĩa re-render vs DOM update. |
| 2 | Chạy app, mở Console, click **Increment** và **Toggle label** | Quan sát thứ tự `[render]` và `[commit]`. |
| 3 | **useRenderLog.ts** | Hiểu "re-render = function chạy lại"; log sync trong render vs effect sau commit. |
| 4 | **Dashboard.tsx** | Nơi state sống; khi setCount/setLabel thì parent re-render, mặc định mọi child re-render. |
| 5 | **StaticChild.tsx** và **ChildPrimitive.tsx** | Re-render không có nghĩa DOM thay đổi; child không memo thì luôn chạy lại khi parent re-render. |
| 6 | **ChildInlineObject.tsx** và **ChildUnstableProps.tsx** | Inline object/function = reference mới mỗi lần, memo không cắt được re-render. |
| 7 | **ChildStableProps.tsx** và **ChildWithCallback.tsx** | useMemo/useCallback giữ reference ổn định, memo mới "skip" re-render được. |
| 8 | **PR-REVIEW.md** | Tổng kết sai lầm hay gặp và trade-off. |

---

## 2. Khái niệm bắt buộc

### Re-render khác DOM update

| Thuật ngữ | Nghĩa |
|-----------|--------|
| **Re-render** | **Hàm component** được gọi lại. Bạn thấy log `[render]`. |
| **DOM update** | **DOM thật** của browser bị sửa (thêm/xóa/sửa node). Chỉ xảy ra khi React reconcile thấy diff giữa cây ảo mới và cũ. |

**Quan trọng:** Re-render **không** bắt buộc phải kéo theo DOM update. Nếu component trả về **cùng** JSX (cùng cấu trúc, cùng giá trị primitive), React reconcile xong sẽ **không** đụng DOM. Trong demo: click "Toggle label" thì StaticChild và ChildPrimitive (khi count không đổi) vẫn re-render nhưng output giống hệt, không có DOM update cho những subtree đó.

### Khi nào React re-render?

1. **State của component này thay đổi** — setState (hoặc tương đương) được gọi.
2. **Parent re-render** — Mặc định React gọi lại **tất cả** children (hàm child chạy lại). **Không** cần "props thay đổi".
3. **Context mà component dùng thay đổi** — value của provider đổi và component subscribe context đó.
4. **Props identity thay đổi (và component được memo)** — Với memo(), React so sánh props nông; nếu có prop (reference hoặc primitive) đổi thì re-render.

**Kết luận:** Re-render **không** phải "props thay đổi". Re-render là "component (hoặc tổ tiên) được lên lịch chạy lại". Props chỉ quan trọng khi bạn muốn **bỏ qua** re-render (ví dụ memo + props ổn định).

---

## 3. Data trong demo — toàn bộ UI state

| Data | Nơi sống | Lý do |
|------|----------|--------|
| count, label | Dashboard (useState) | Chỉ phục vụ UI demo (nút, hiển thị). Không phải server state, không cần share sâu. |
| stableConfig | Dashboard (useMemo) | Không phải state — là derived reference ổn định để truyền xuống child memo. |
| stableOnAction | Dashboard (useCallback) | Callback ổn định để child memo không bị re-render vì prop function mới. |

**Tại sao không dùng Context/Redux?** Chỉ có 1 parent, vài child, không nhiều tầng hay nhiều route cần share state. Giữ state local ở Dashboard là đủ. Context/Redux dùng khi cần share client state sâu hoặc phức tạp.

---

## 4. Từng nhóm component — học gì từ code

### 4.1 StaticChild + ChildPrimitive — Re-render khác props thay đổi

- **StaticChild:** Không nhận prop "data" nào. Khi parent re-render, hàm vẫn chạy (có [render]) nhưng JSX không đổi, không có DOM update.
- **ChildPrimitive:** Chỉ nhận count (primitive). Khi bạn click "Toggle label", count không đổi nhưng **parent đã re-render** nên ChildPrimitive vẫn chạy lại. Điều này chứng minh: re-render do parent re-render, không phải do "props thay đổi".

**Bài tập:** Comment useRenderLog trong StaticChild, chỉ giữ trong ChildPrimitive. Click "Toggle label" — bạn vẫn thấy ChildPrimitive log vì nó vẫn bị gọi lại.

### 4.2 ChildInlineObject + ChildUnstableProps — Prop identity phá memo

- **ChildInlineObject:** Parent truyền config={{ theme: 'dark', locale: 'en' }}. Mỗi lần Dashboard render là một **object mới**, reference mới, component luôn "thấy" prop mới (và không dùng memo nên luôn chạy).
- **ChildUnstableProps:** Dùng memo nhưng vẫn nhận **inline object** từ parent. So sánh nông: prev.config !== next.config (vì object mới mỗi lần) nên memo **không** chặn re-render. Sai lầm hay gặp: bọc memo nhưng vẫn truyền config={{ }} hoặc onClick={() => {}}.

**Bài tập:** Trong Dashboard, đổi ChildUnstableProps thành nhận config={stableConfig} (cùng biến với ChildStableProps). Reload, click "Increment" — ChildUnstableProps sẽ không log nữa vì prop reference ổn định.

### 4.3 ChildStableProps + ChildWithCallback — Memo "có tác dụng" khi props ổn định

- **ChildStableProps:** Parent truyền config={stableConfig} với stableConfig = useMemo(() => ({ theme: 'dark', locale: 'en' }), []). Cùng reference giữa các lần render nên memo so sánh thấy props bằng nhau, **bỏ qua** re-render.
- **ChildWithCallback:** Parent truyền onAction={stableOnAction} với stableOnAction = useCallback(() => { ... }, []). Reference function ổn định nên memo skip re-render khi parent re-render mà không cần gọi lại child.

**Bài tập:** Đổi ChildWithCallback thành nhận onAction={() => console.log('click')} (inline function). Save, click "Increment" — bạn sẽ thấy ChildWithCallback log lại mỗi lần vì prop function mới mỗi lần.

---

## 5. useRenderLog — Vì sao log trong render, không chỉ trong effect?

- **Log trong render:** Cho biết **thứ tự** và **số lần** hàm component được gọi (re-render). Thấy log = component function đã chạy.
- **Log trong useEffect:** Chạy **sau** commit; dùng để đối chiếu "sau khi đã ghi lên DOM". Nhiều lần render có thể dẫn đến chỉ một lần commit (khi output giống nhau).

**Closure / identity:** count được lấy từ renderCount.current trong cùng lần render, rồi dùng trong effect. Effect "nhớ" đúng count của lần render đó (closure). Không có vấn đề stale closure ở đây vì ta chỉ log, không setState theo count.

---

## 6. Khi nào KHÔNG nên tối ưu re-render

- **Chưa đo:** Đừng memo "phòng thủ". Đo (React DevTools Profiler) trước, tối ưu sau.
- **Component rẻ:** Chạy lại vài component nhỏ rất nhanh; memo thêm chi phí so sánh props.
- **Props luôn đổi:** Nếu props thay đổi mỗi lần (ví dụ object tạo trong render mà không useMemo), memo gần như không bỏ qua re-render nào, chỉ tốn so sánh.
- **Memo nhưng không ổn định props:** Truyền inline object/function thì memo gần như vô dụng.

Trong demo, memo và useMemo/useCallback dùng **để dạy** — trong app thật chỉ thêm sau khi profile và xác định được component/cây component đắt.

---

## 7. Checklist tự kiểm tra

Sau khi học xong demo, bạn có thể trả lời:

- [ ] Re-render và DOM update khác nhau thế nào? Cho ví dụ trong demo.
- [ ] Tại sao click "Toggle label" vẫn làm ChildPrimitive log dù count không đổi?
- [ ] Tại sao ChildUnstableProps (có memo) vẫn re-render mỗi lần parent re-render?
- [ ] ChildStableProps và ChildWithCallback "skip" re-render bằng cách nào (parent + child)?
- [ ] Trong demo, toàn bộ data là UI state đúng không? Vì sao không cần React Query / Redux?
- [ ] Khi nào **không** nên dùng memo/useMemo/useCallback?

---

## 8. Bước tiếp theo

- Mở **React DevTools, tab Profiler**, ghi lại khi click "Increment" / "Toggle label", xem component nào thực sự mất thời gian render (nếu có).
- So sánh với demo **expensive-child**: khi nào cần memo cho "expensive child" và cách tránh prop reference mới (object/function).

---

**Tóm tắt:** Re-render = hàm component chạy lại; DOM update = DOM thật bị sửa. Parent re-render thì mặc định mọi child re-render. Dùng memo + props ổn định (useMemo/useCallback) khi muốn bỏ qua re-render; tránh memo khi vẫn truyền object/function tạo inline. Chỉ tối ưu sau khi đo.
