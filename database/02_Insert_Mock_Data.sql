USE StaffShiftManagement;
GO

-- =========================================
-- File này chứa dữ liệu giả lập (Mock Data)
-- Để thầy cô có thể test database
-- =========================================

-- Xóa dữ liệu cũ nếu có
DELETE FROM TIMECARD;
DELETE FROM SCHEDULES;
DELETE FROM SHIFT;
DELETE FROM STAFF;
GO

-- 1. Thêm dữ liệu Nhân viên
INSERT INTO STAFF (UserID, FullName, Role, HourlyRate) VALUES
(1, N'Nguyễn Văn A', N'Manager', 50.00),
(2, N'Trần Thị B', N'Staff', 25.00),
(3, N'Lê Văn C', N'Staff', 25.00);

-- 2. Thêm dữ liệu Ca làm việc
INSERT INTO SHIFT (ShiftID, ShiftName, Time_Range) VALUES
(1, N'Ca Sáng', N'08:00 - 16:00'),
(2, N'Ca Chiều', N'16:00 - 00:00');

-- 3. Thêm dữ liệu Phân ca (Schedules)
INSERT INTO SCHEDULES (UserID, ShiftID) VALUES
(1, 1),
(2, 1),
(3, 2);

-- 4. Thêm dữ liệu Thẻ chấm công
INSERT INTO TIMECARD (TimecardID, WorkDate, CheckIn, CheckOut, UserID, ShiftID) VALUES
(1, '2026-06-20', '07:55:00', '16:05:00', 1, 1),
(2, '2026-06-20', '08:15:00', '16:00:00', 2, 1),
(3, '2026-06-21', '15:50:00', '00:15:00', 3, 2);
GO
