# Hướng dẫn học: Props Drilling vs Context

**Mục tiêu:** Hiểu **khi nào props drilling là lựa chọn TỐT**; so sánh **readability**, **traceability** và **re-render** giữa props drilling và Context; biết **khi nào props drilling không còn chấp nhận được**.

**Điều kiện:** Đã nắm props, state, và Context (Provider, useContext).

---

## 1. Thứ tự học (learning path)

| Bước | Hành động | Mục đích |
|------|-----------|----------|
| 1 | Đọc **README.md** | Nắm khi nào props drilling tốt; so sánh hai phiên bản. |
| 2 | Tab **Props drilling** → mở một component (e.g. FieldGroup) | Thấy props: formData, setField — rõ ràng. |
| 3 | Tab **Context** → mở một component | Thấy useContext(FormContext) — không thấy formData/setField trong signature; phải tìm Provider. |
| 4 | Gõ vào ô input, xem console | Cả hai đều log re-render theo path. So sánh mental overhead: props = theo cây; context = tìm Provider và mọi consumer. |
| 5 | **PropsDrillingVersion.tsx** | FormLayout nhận formData, setField và truyền xuống FormSection → FieldGroup. Một luồng dữ liệu rõ ràng. |
| 6 | **ContextVersion.tsx** | FormProvider, FormContext; mọi component dùng useFormContext(). So sánh độ phức tạp và traceability. |
| 7 | **PR-REVIEW.md** | Sai lầm junior hay mắc; trade-offs; khi nào props drilling dừng chấp nhận được. |

---

## 2. So sánh: Readability, Traceability, Re-render

| Tiêu chí | Props drilling | Context (cùng độ sâu) |
|----------|----------------|------------------------|
| **Readability** | Mỗi component có props rõ ràng (formData, setField). | Component dùng useContext — không thấy shape trong signature; phải mở Provider. |
| **Traceability** | Theo cây lên: Dashboard → FormLayout → FormSection → FieldGroup. Một đường. | Tìm FormProvider (nơi set value); tìm mọi useContext(FormContext) (nơi đọc). Nhiều file. |
| **Re-render** | State đổi → path từ owner xuống re-render. | Value đổi → mọi consumer re-render. Ở độ sâu 4, số lượng tương đương. |
| **Debugging** | Đặt breakpoint ở parent, xem props truyền xuống. | Phải biết value được set ở đâu (Provider) và ai dùng (mọi consumer). |

---

## 3. Khi nào props drilling dừng chấp nhận được

- **Nhiều tầng** (7+): Truyền cùng một bó props qua nhiều tầng trung gian mệt; Context hoặc composition có thể giảm boilerplate (đổi lại luồng dữ liệu ẩn).
- **Nhiều nhánh không liên quan** cần cùng dữ liệu: Header, Sidebar, Form sâu đều cần "current user" — drill từ root qua từng nhánh rất dài; Context (hoặc provider hẹp) có thể hợp lý.
- **Trước đó:** Ưu tiên props drilling để đơn giản và dễ trace.
