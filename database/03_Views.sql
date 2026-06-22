USE StaffShiftManagement;
GO

CREATE VIEW vw_Staff_Shifts AS
SELECT s.FullName, sh.ShiftName, sh.Time_Range
FROM STAFF s
JOIN SCHEDULES sc ON s.UserID = sc.UserID
JOIN SHIFT sh ON sc.ShiftID = sh.ShiftID;
GO

CREATE VIEW vw_Daily_Attendance AS
SELECT WorkDate, COUNT(TimecardID) as TotalStaff
FROM TIMECARD
GROUP BY WorkDate;
GO

CREATE VIEW vw_High_Rate_Staff AS
SELECT FullName, Role, HourlyRate
FROM STAFF
WHERE HourlyRate >= 40;
GO
