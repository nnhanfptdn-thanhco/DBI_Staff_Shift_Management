USE StaffShiftManagement;
GO

CREATE VIEW vw_Staff_Shifts AS
SELECT s.FullName, sh.ShiftName, sh.Time_Range
FROM STAFF s
JOIN SCHEDULES sc ON s.UserID = sc.UserID
JOIN SHIFT sh ON sc.ShiftID = sh.ShiftID;
GO
