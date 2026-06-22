const fs = require('fs');

// Hàm mô phỏng dữ liệu thô tải từ cơ sở dữ liệu (tương đương kết quả query SELECT * FROM TIMECARD)
function loadData() {
    return [
        { TimecardID: 1, WorkDate: '2026-06-22', CheckIn: '08:00:00', CheckOut: '16:00:00', UserID: 1, ShiftID: 1 },
        { TimecardID: 2, WorkDate: '2026-06-22', CheckIn: '16:30:00', CheckOut: '23:30:00', UserID: 2, ShiftID: 2 },
        { TimecardID: 3, WorkDate: '2026-06-23', CheckIn: '08:15:00', CheckOut: '16:00:00', UserID: 1, ShiftID: 1 },
        { TimecardID: 4, WorkDate: '2026-06-22', CheckIn: '22:00:00', CheckOut: '06:00:00', UserID: 1, ShiftID: 2 } // Ca đêm
    ];
}

// Hàm tính khoảng thời gian làm việc (Total Hours)
function calculateTotalHours(checkIn, checkOut) {
    const [inHours, inMins] = checkIn.split(':').map(Number);
    const [outHours, outMins] = checkOut.split(':').map(Number);
    
    let totalMins = (outHours * 60 + outMins) - (inHours * 60 + inMins);
    // Nếu Checkout nhỏ hơn Checkin (ví dụ ca đêm qua ngày hôm sau)
    if (totalMins < 0) {
        totalMins += 24 * 60;
    }
    
    return (totalMins / 60).toFixed(2);
}

// Hàm đánh giá trạng thái đi làm (Status)
function evaluateStatus(checkIn, shiftID) {
    // Giả sử: Shift 1 bắt đầu lúc 08:00, Shift 2 bắt đầu lúc 16:00
    const [inHours, inMins] = checkIn.split(':').map(Number);
    
    if (shiftID === 1 && (inHours > 8 || (inHours === 8 && inMins > 0))) {
        return 'Late';
    } else if (shiftID === 2 && (inHours > 16 || (inHours === 16 && inMins > 0))) {
        return 'Late';
    }
    return 'On Time';
}

function processTimecards() {
    console.log("Loading timecard data...");
    const data = loadData();
    
    const processedData = data.map(record => {
        const totalHours = calculateTotalHours(record.CheckIn, record.CheckOut);
        const status = evaluateStatus(record.CheckIn, record.ShiftID);
        
        return {
            ...record,
            TotalHours: Number(totalHours),
            Status: status
        };
    });
    
    console.log("Processed Data:");
    console.table(processedData);
    
    // Lưu ra file CSV
    try {
        const headers = "TimecardID,WorkDate,CheckIn,CheckOut,UserID,ShiftID,TotalHours,Status\n";
        const rows = processedData.map(r => 
            `${r.TimecardID},${r.WorkDate},${r.CheckIn},${r.CheckOut},${r.UserID},${r.ShiftID},${r.TotalHours},${r.Status}`
        ).join("\n");
        
        fs.writeFileSync('processed_timecards.csv', headers + rows);
        console.log("Data successfully exported to processed_timecards.csv");
    } catch (error) {
        console.error("Error saving file:", error.message);
    }
}

// Chạy script
processTimecards();
