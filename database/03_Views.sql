USE StaffShiftManagement;
GO

-- =========================================
-- VIEW 1: vw_Staff_Shifts
-- Lấy thông tin các ca làm việc đã được phân cho từng nhân viên
-- =========================================
CREATE VIEW vw_Staff_Shifts AS
SELECT s.FullName, sh.ShiftName, sh.Time_Range
FROM STAFF s
JOIN SCHEDULES sc ON s.UserID = sc.UserID
JOIN SHIFT sh ON sc.ShiftID = sh.ShiftID;
GO

-- =========================================
-- VIEW 2: vw_Daily_Attendance
-- Thống kê số lượng nhân viên đi làm mỗi ngày
-- =========================================
CREATE VIEW vw_Daily_Attendance AS
SELECT WorkDate, COUNT(TimecardID) as TotalStaff
FROM TIMECARD
GROUP BY WorkDate;
GO

-- =========================================
-- VIEW 3: vw_High_Rate_Staff
-- Tìm những nhân viên có mức lương cao (>= 40)
-- =========================================
CREATE VIEW vw_High_Rate_Staff AS
SELECT FullName, Role, HourlyRate
FROM STAFF
WHERE HourlyRate >= 40;
GO
