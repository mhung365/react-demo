# Hướng dẫn học: Logic trong effect và khả năng test

**Mục tiêu:** Hiểu **tại sao logic trong useEffect khó test** (và dễ vỡ khi scale); **đặt logic ở đâu thay thế** (pure function, custom hook); **tách rõ** effect orchestration vs business logic; **khi nào** logic trong effect vẫn chấp nhận được.

**Điều kiện:** Đã nắm useEffect, unit test cơ bản (Jest/Vitest).

---

## 1. Thứ tự học

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Đọc **README.md** (nếu có) | Nắm logic trong effect khó test; tách pure function + hook. |
| 2 | Chạy demo (nếu có) → tab Before/After | Thấy component dày logic vs component mỏng + hook + logic file. |
| 3 | Đọc **dashboardLogic.ts** (nếu có) | Pure: validate, normalize, sort, summary. |
| 4 | Đọc **useDashboardData** (nếu có) | Hook: effect chỉ fetch → gọi pipeline → setState. |
| 5 | Chạy **dashboardLogic.test.ts** (nếu có) | Unit test pure: input → output, không React, không fetch. |
| 6 | **PR-REVIEW.md** (nếu có) | Sai lầm hay gặp; khi nào logic trong effect vẫn ổn. |

---

## 2. Tại sao logic trong useEffect khó test (và dễ vỡ khi scale)?

- **Không gọi cô lập được.** Logic nằm trong callback của effect. Để chạy nó bạn phải: render component (hoặc hook), thỏa dependency của effect (mount hoặc deps đổi), và chờ async. Bạn đang test "component + effect + async" cùng lúc, không phải "hàm này với input này trả về output này."
- **Cần React và (thường) mock.** Bạn cần test renderer, mock timer hoặc fake fetch, và assert state sau khi effect chạy. Đó là test kiểu integration, không phải unit test nhanh, tập trung cho một mảng logic.
- **Mental model lẫn lộn.** Effect trộn "khi nào chạy" (orchestration) với "làm gì" (business logic). Đọc code phải tách "khi filter đổi" khỏi "validate, normalize, sort, summary." Khó lý giải và khó test hơn.

**Tóm lại:** **Logic trong useEffect khó unit test** vì gắn với lifecycle React và async; bạn không có test đơn giản "input → output."

**Khi scale** càng tệ: nhiều component với logic tương tự (ví dụ fetch + validate + normalize) nghĩa là trùng code trong mọi effect. Đổi một rule (ví dụ "cho phép status 'draft'") buộc tìm và sửa mọi effect inline rule đó. Không có một chỗ để unit test rule; bạn hoặc bỏ qua test hoặc viết integration test nặng (render + mock fetch + assert state) cho từng màn. Dễ vỡ (mock, async, nhiều test) và chậm. Refactor bằng cách tách pure function cho một chỗ cho rule và một chỗ để unit test.

**Trong thực tế khi scale:** Tưởng tượng 5 màn kiểu dashboard (reports, alerts, audit log, …) mỗi màn có "fetch list + validate status + normalize + sort + summary" trong useEffect. Một thay đổi product ("thêm status 'draft' mọi nơi") buộc tìm và sửa 5 body effect và viết 5 integration test (hoặc không). Với pipeline pure dùng chung và hook: sửa `validateItems` một lần, mở rộng unit test một lần; cả 5 màn nhận hành vi mới và vẫn test được.

---

## 3. Logic nên đặt ở đâu thay thế?

- **Pure function:** Validation, normalization, sort và summary là **pure**: cùng input → cùng output, không side effect, không React. Đặt trong module riêng (ví dụ `dashboardLogic.ts`). Sau đó unit test bằng Jest/Vitest thuần: `expect(processRawItems(mockRaw)).toEqual(...)`. Không React, không render, không async.
- **Custom hook cho orchestration:** **Effect** chỉ nên làm: "khi deps đổi, chạy workflow side-effect." Workflow có thể là: fetch → gọi pipeline pure → setState. Đặt trong custom hook (ví dụ `useDashboardData(filters)`). Hook test được bằng `renderHook`: mock fetch, đổi filter, assert state trả về. Bạn test "khi filter đổi, hook có trả đúng data không?" mà không test bản thân business rule (nằm trong pure function).
- **Component:** Giữ UI state (ví dụ filter), gọi hook, render. Mỏng; dễ snapshot hoặc test tương tác user.

**Tóm lại:** **Business logic → pure function (unit test). Effect orchestration → custom hook (test bằng renderHook). Component → mỏng (chỉ render/handler).**

---

## 4. Cách làm này cải thiện chiến lược test

| Thứ gì | Đặt ở đâu | Cách test |
|--------|-----------|-----------|
| **Validate, normalize, sort, summary** | Pure function trong `dashboardLogic.ts` | Unit test: truyền input thô, assert output. Không React, không fetch. Nhanh, xác định. |
| **Khi nào fetch, cleanup, loading/error** | Custom hook `useDashboardData` | Test với `renderHook`: mock `fetchRawDashboard`, đổi filter, assert `result.current.items`, `result.current.summary`, `result.current.loading`, `result.current.error`. |
| **Filter state, render list/summary** | Component | Shallow render hoặc integration test: đổi filter, assert DOM hoặc state. Hoặc snapshot. |

Bạn có:

- **Unit test nhanh** cho business rule (pure function).
- **Hook test tập trung** cho "effect orchestration có đúng không?" (mock fetch, assert state).
- **Component test đơn giản hơn** (component mỏng, ít nhánh).

---

## 5. Tách rõ: effect orchestration vs business logic

- **Effect orchestration:** "Khi nào chạy? Làm gì với kết quả? Cleanup?" — đó là effect (hoặc hook chứa effect). Nên mỏng: fetch, rồi gọi pipeline pure, rồi setState. Không inline logic validate/normalize.
- **Business logic:** "Validate thế nào? Normalize thế nào? Sort thế nào? Summary tính thế nào?" — đó là pure function. Cùng input → cùng output. Không setState, không fetch, không React.

Phiên bản refactor giữ tách bạch: `useDashboardData` chạy effect và gọi `processRawItems(res.items)`; `processRawItems` là pipeline pure trong `dashboardLogic.ts`.

---

## 6. Khi nào logic trong useEffect vẫn chấp nhận được?

- **One-liner tầm thường:** Ví dụ `document.title = title` trong effect. Không có "logic" thật để unit test; effect chỉ là chỗ đúng cho side effect.
- **"Gọi API theo deps" thuần túy:** Nếu effect đúng nghĩa là "fetch(url(deps)).then(setState)" và không có validate/normalize/sort, "logic" rất ít. Bạn vẫn có thể tách hook để tái dùng và test, nhưng một ít code trong effect là chấp nhận được.
- **Code thử nghiệm hoặc tạm:** Với spike nhanh, logic inline trong effect có thể ổn. Cho production, tách pure function và hook khi logic lớn lên hoặc cần test.

**Quy tắc:** Nếu bạn muốn unit test logic (validate, normalize, tính toán), nó không nên nằm trong effect. Tách ra pure function và gọi từ effect (hoặc từ custom hook chứa effect).

---

## 7. Ví dụ test cho pure logic

Xem **dashboardLogic.test.ts** trong folder này (nếu có). Nó unit test:

- `validateItems`: lọc status không hợp lệ; chỉ active/archived; rỗng khi tất cả invalid.
- `normalizeToViewModels`: camelCase, Date, displayLabel.
- `sortByUpdatedDesc`: mới nhất trước; không mutate input.
- `computeSummary`: total, activeCount, archivedCount, lastUpdated; lastUpdated null khi rỗng.
- `processRawItems`: pipeline đầy đủ; invalid bị lọc; items đã sort; summary đúng.

Chạy: `npm run test`. Không React, không mock fetch — chỉ input/output. Đó là lợi ích của việc tách pure logic: nhanh, xác định, dễ thêm case khi rule đổi.
