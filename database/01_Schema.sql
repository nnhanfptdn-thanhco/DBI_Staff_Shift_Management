-- =========================================
-- Project: Staff Shift Management
-- Description: Database Schema (Basic Version)
-- =========================================

-- Tạo Database mới
CREATE DATABASE StaffShiftManagement;
GO

USE StaffShiftManagement;
GO

-- =========================================
-- 1. Bảng STAFF (Nhân viên)
-- =========================================
CREATE TABLE STAFF (
    UserID INT PRIMARY KEY,
    FullName NVARCHAR(100),
    Role NVARCHAR(50),
    HourlyRate DECIMAL(10, 2)
);
GO

-- =========================================
-- 2. Bảng SHIFT (Ca làm việc)
-- =========================================
CREATE TABLE SHIFT (
    ShiftID INT PRIMARY KEY,
    ShiftName NVARCHAR(50),
    Time_Range NVARCHAR(50)
);
GO

-- =========================================
-- 3. Bảng SCHEDULES
-- (Quan hệ Nhiều - Nhiều giữa STAFF và SHIFT)
-- =========================================
CREATE TABLE SCHEDULES (
    UserID INT,
    ShiftID INT,
    PRIMARY KEY (UserID, ShiftID),
    FOREIGN KEY (UserID) REFERENCES STAFF(UserID),
    FOREIGN KEY (ShiftID) REFERENCES SHIFT(ShiftID)
);
GO

-- =========================================
-- 4. Bảng TIMECARD (Thẻ chấm công)
-- (Quan hệ Một - Nhiều với STAFF và SHIFT)
-- =========================================
CREATE TABLE TIMECARD (
    TimecardID INT PRIMARY KEY,
    WorkDate DATE,
    CheckIn TIME,
    CheckOut TIME,
    UserID INT,
    ShiftID INT,
    FOREIGN KEY (UserID) REFERENCES STAFF(UserID),
    FOREIGN KEY (ShiftID) REFERENCES SHIFT(ShiftID)
);
GO

-- Thêm constraint cho mức lương
ALTER TABLE STAFF ADD CONSTRAINT CHK_HourlyRate CHECK (HourlyRate > 0);
GO

-- Tối ưu hóa truy vấn theo ngày
CREATE INDEX IDX_WorkDate ON TIMECARD(WorkDate);
GO
