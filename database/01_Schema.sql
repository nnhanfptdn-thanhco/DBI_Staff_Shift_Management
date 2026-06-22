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
    FullName NVARCHAR(100) NOT NULL,
    Role NVARCHAR(50),
    HourlyRate DECIMAL(10, 2) CHECK (HourlyRate > 0) -- Constraint: Lương phải lớn hơn 0
);
GO

-- =========================================
-- 2. Bảng SHIFT (Ca làm việc)
-- =========================================
CREATE TABLE SHIFT (
    ShiftID INT PRIMARY KEY,
    ShiftName NVARCHAR(50) NOT NULL,
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
    FOREIGN KEY (UserID) REFERENCES STAFF(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ShiftID) REFERENCES SHIFT(ShiftID) ON DELETE CASCADE
);
GO

-- =========================================
-- 4. Bảng TIMECARD (Thẻ chấm công)
-- (Quan hệ Một - Nhiều với STAFF và SHIFT)
-- =========================================
CREATE TABLE TIMECARD (
    TimecardID INT PRIMARY KEY,
    WorkDate DATE NOT NULL,
    CheckIn TIME NOT NULL,
    CheckOut TIME NOT NULL,
    UserID INT,
    ShiftID INT,
    FOREIGN KEY (UserID) REFERENCES STAFF(UserID),
    FOREIGN KEY (ShiftID) REFERENCES SHIFT(ShiftID)
);
GO

-- Tối ưu hóa truy vấn tìm kiếm ngày làm việc
CREATE INDEX IDX_WorkDate ON TIMECARD(WorkDate);
GO
