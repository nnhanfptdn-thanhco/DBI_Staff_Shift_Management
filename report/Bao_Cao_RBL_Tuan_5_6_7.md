# BÁO CÁO TIẾN ĐỘ RBL (TUẦN 5 - TUẦN 7)
**Môn học:** Cơ sở dữ liệu (DBI202)  
**Đề tài:** Hệ thống Quản lý Ca làm việc và Chấm công nhân viên (Staff Shift Management)  
**Nhóm thực hiện:** Nhóm 01  

---

## TUẦN 5: CHỌN ĐỀ TÀI & XÁC ĐỊNH VAI TRÒ CỦA DATABASE

### 1. Tên đề tài nghiên cứu
**Hệ thống Quản lý Ca làm việc và Chấm công nhân viên (Staff Shift Management)**

### 2. Lý do chọn đề tài
Hiện nay, nhiều cửa hàng bán lẻ, quán cafe hay doanh nghiệp vừa và nhỏ sử dụng rất nhiều nhân viên làm việc theo ca (part-time và full-time). Việc ghi chép giờ vào làm, giờ tan làm bằng sổ tay hoặc các bảng tính Excel thủ công rất dễ gây ra sai sót, nhầm lẫn giờ làm, đặc biệt là với những ca làm đêm vắt qua ngày hôm sau. 

Vì vậy, nhóm quyết định chọn đề tài này để tìm hiểu cách thiết kế một cơ sở dữ liệu (Database) chặt chẽ giúp lưu trữ lịch làm việc, tự động ghi nhận thẻ chấm công và hỗ trợ tính toán chính xác thù lao cho nhân viên.

### 3. Xác định các thực thể chính và mối quan hệ
Sau khi thảo luận về nghiệp vụ thực tế, nhóm xác định mô hình dữ liệu gồm các thực thể chính sau:
* **STAFF (Nhân viên):** Lưu thông tin mã nhân viên (`UserID`), họ tên, chức vụ và mức lương theo giờ (`HourlyRate`).
* **SHIFT (Ca làm việc):** Lưu thông tin các ca định sẵn (`ShiftID`), tên ca (sáng, chiều, đêm) và khung giờ làm việc.
* **TIMECARD (Thẻ chấm công):** Lưu nhật ký ra vào hằng ngày gồm ngày làm việc (`WorkDate`), giờ vào (`CheckIn`), giờ ra (`CheckOut`).

**Mối quan hệ giữa các thực thể:**
* Quan hệ giữa `STAFF` và `SHIFT` là quan hệ **Nhiều - Nhiều (M-N)**: Một nhân viên có thể đăng ký làm nhiều ca khác nhau trong tuần, và một ca làm việc cũng có nhiều nhân viên cùng làm. Nhóm sử dụng bảng trung gian **`SCHEDULES`** để giải quyết quan hệ này.
* Quan hệ giữa `STAFF` và `TIMECARD` là quan hệ **Một - Nhiều (1-N)**: Một nhân viên sẽ có nhiều thẻ chấm công theo từng ngày.
* Quan hệ giữa `SHIFT` và `TIMECARD` là quan hệ **Một - Nhiều (1-N)**: Mỗi thẻ chấm công được gắn với một ca làm việc cụ thể.

### 4. Câu hỏi nghiên cứu (Research Question - RQ)
*“Làm thế nào để thiết kế cơ sở dữ liệu quan hệ giúp quản lý phân ca nhân viên chặt chẽ, đồng thời hỗ trợ khai thác dữ liệu để tự động hóa việc tính toán tổng số giờ làm việc thực tế và xác định nhân viên đi muộn hay đúng giờ?”*

### 5. Mô tả sơ bộ nguồn dữ liệu
* **Dữ liệu cố định (Tĩnh):** Danh sách nhân viên và các khung giờ ca làm việc do người quản lý nhập vào hệ thống.
* **Dữ liệu phát sinh (Động):** Các mốc thời gian Check-in và Check-out được tạo ra hàng ngày khi nhân viên tới làm việc.

---

## TUẦN 6: CÔNG CỤ & QUY TRÌNH TRIỂN KHAI DATASET

### 1. Công cụ sử dụng
Để triển khai bài tập lớn RBL, nhóm thống nhất sử dụng các công cụ sau:
* **Hệ quản trị cơ sở dữ liệu:** Microsoft SQL Server (sử dụng công cụ phần mềm SSMS để viết câu lệnh SQL tạo bảng, ràng buộc Constraint và View).
* **Ngôn ngữ xử lý dữ liệu:** JavaScript (sử dụng môi trường Node.js để viết script đọc dữ liệu thô, tính toán toán học về thời gian).
* **Trình soạn thảo mã nguồn:** Visual Studio Code.
* **Nền tảng viết báo cáo:** Overleaf (LaTeX) và Prism.openchat.ai.

### 2. Sơ đồ quy trình thu thập và xử lý dữ liệu (Workflow)
Luồng xử lý dữ liệu của hệ thống được nhóm thiết kế theo 4 bước tuần tự:

```
[Nhập liệu Staff & Shift] ---> [Ghi nhận CheckIn/Out (TIMECARD)] 
                                         |
                                         v
[Xuất báo cáo / Giao diện Web] <--- [Script Node.js làm sạch & Tính toán]
```

* **Bước 1 (Chuẩn bị CSDL):** Khởi tạo cấu trúc các bảng trên SQL Server, thiết lập các khóa chính, khóa ngoại và ràng buộc kiểm tra (ví dụ: lương `HourlyRate > 0`).
* **Bước 2 (Thu thập dữ liệu thô):** Ghi nhận các bản ghi quẹt thẻ chấm công hằng ngày vào bảng `TIMECARD`.
* **Bước 3 (Xử lý dữ liệu ban đầu):** Script Node.js (`process_timecards.js`) truy vấn lấy dữ liệu thẻ chấm công, thực hiện tính cột `TotalHours` (tổng số giờ làm) và so sánh mốc giờ vào làm để gán trạng thái `On Time` (Đúng giờ) hoặc `Late` (Đi muộn).
* **Bước 4 (Khai thác & Trình bày):** Dữ liệu sau khi xử lý được xuất ra file lưu trữ chuẩn và hiển thị lên giao diện Web để người quản lý theo dõi.

---

## TUẦN 7: THU THẬP DỮ LIỆU THỰC TẾ (CRAWL/SCRAPE & MOCK DATA)

### 1. Quá trình tạo dữ liệu thô (Raw Data)
Do dự án mang tính chất mô phỏng hệ thống chấm công nội bộ, nhóm đã tiến hành tạo tập dữ liệu thử nghiệm (Mock Data) bằng câu lệnh `INSERT INTO` trong SQL, tái hiện đầy đủ các tình huống thực tế của nhân viên:
* Các bản ghi nhân viên đi làm chuẩn giờ (Check-in lúc `07:55:00` ca sáng).
* Các bản ghi nhân viên đi làm muộn (Check-in lúc `08:15:00` ca sáng).
* Đặc biệt, nhóm thêm bản ghi làm ca đêm vắt qua ngày hôm sau (Check-in lúc `22:00:00` đêm hôm trước và Check-out lúc `06:00:00` sáng hôm sau).

### 2. Xử lý làm sạch và chuẩn hóa bằng Node.js
Trong mã nguồn `process_timecards.js`, nhóm thực hiện chuẩn hóa định dạng thời gian để phân tích:

1. **Thuật toán tính tổng giờ làm (`calculateTotalHours`):**  
   Dữ liệu giờ dạng chuỗi (ví dụ `"08:15:00"`) được tách bằng hàm `.split(':')` để đổi sang đơn vị phút.  
   *Khó khăn thực tế nhóm gặp phải:* Khi test dữ liệu ca đêm (từ 22h đến 6h sáng), công thức lấy `(giờ ra - giờ vào)` cho ra kết quả âm `(6 - 22 = -16 tiếng)`. Sau khi debug kiểm tra lại, nhóm đã sửa logic bằng cách thêm điều kiện `if (totalMins < 0) totalMins += 24 * 60`. Nhờ bù thêm 24 tiếng của ngày hôm sau, hệ thống đã tính ra con số chính xác là 8.00 tiếng.

2. **Thuật toán đánh giá trạng thái (`evaluateStatus`):**  
   Hệ thống kiểm tra điều kiện `If-Else` theo ca: Nếu là Ca sáng (bắt đầu 08:00) mà mốc giờ Check-in lớn hơn `8` hoặc đúng 8 giờ nhưng số phút lớn hơn `0` thì tự động gán nhãn `'Late'` (Đi muộn), ngược lại gán nhãn `'On Time'`.

### 3. Kết quả đạt được sau Tuần 7
Nhóm đã thu được tập dữ liệu sạch hoàn chỉnh (đã loại bỏ lỗi logic thời gian) lưu dưới dạng bảng `processed_timecards.csv` sẵn sàng cho các bước phân tích sâu hơn ở Tuần 8.
