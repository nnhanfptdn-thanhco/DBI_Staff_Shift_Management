# Staff Shift Management

Dự án quản lý ca làm việc và chấm công của nhân viên. Được thiết kế cơ bản và trực quan để dễ dàng phục vụ cho việc học tập và trình bày môn học CSDL (DBI202).

## Cấu trúc thư mục

- `database/`: Chứa file `Staff_Shift_Management.sql` với các lệnh SQL đã được căn chỉnh đẹp mắt để tạo cơ sở dữ liệu và các bảng.
- `Staff Shift Management/`: Thư mục project được sinh ra bởi SQL Server Management Studio (SSMS).

## Cách chạy dự án

1. Mở SQL Server Management Studio (SSMS).
2. Tải file `database/Staff_Shift_Management.sql`.
3. Bấm **Execute** (hoặc `F5`) để tạo Database và các bảng tự động.

## Mô hình ERD

Dự án bao gồm các bảng:
- **STAFF:** Thông tin nhân viên.
- **SHIFT:** Thông tin các ca làm việc.
- **SCHEDULES:** Bảng trung gian thể hiện quan hệ M-N giữa `STAFF` và `SHIFT`.
- **TIMECARD:** Bảng thẻ chấm công lưu trữ giờ vào, giờ ra hàng ngày.
