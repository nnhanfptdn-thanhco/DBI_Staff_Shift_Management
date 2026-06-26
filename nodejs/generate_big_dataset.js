const fs = require('fs');
const path = require('path');

const staffPool = [
    "Nguyễn Văn An", "Trần Thị Bình", "Lê Văn Cường", "Phạm Thị Dung", "Hoàng Văn Em",
    "Vũ Thị Phương", "Đặng Văn Hùng", "Bùi Thị Hoa", "Đỗ Văn Kiên", "Hồ Thị Linh",
    "Ngô Văn Minh", "Dương Thị Nga", "Lý Văn Oai", "Mai Thị Phúc", "Đoàn Văn Quân"
];
const shiftsPool = ["Ca Sáng", "Ca Chiều", "Ca Đêm"];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const totalRecords = 1050;
let scrapedLines = ["TimecardID,WorkDate,StaffName,ShiftName,CheckIn,CheckOut"];
let rawLines = ["TimecardID,WorkDate,StaffName,ShiftName,CheckIn,CheckOut,Notes"];

let baseDate = new Date(2026, 5, 1); // 2026-06-01

for (let id = 1001; id <= 1000 + totalRecords; id++) {
    const sName = staffPool[id % staffPool.length];
    const shName = shiftsPool[id % shiftsPool.length];
    
    const dayOffset = id % 30;
    const d = new Date(baseDate);
    d.setDate(d.getDate() + dayOffset);
    const dateStr = d.toISOString().split('T')[0];
    
    let cIn, cOut, notes = "Bình thường";
    if (shName === "Ca Sáng") {
        cIn = `07:${randomInt(45,59).toString().padStart(2,'0')}:00`;
        cOut = `16:${randomInt(0,10).toString().padStart(2,'0')}:00`;
        if (id % 15 === 0) notes = "Đi muộn nhẹ";
    } else if (shName === "Ca Chiều") {
        cIn = `15:${randomInt(50,59).toString().padStart(2,'0')}:00`;
        cOut = `00:${randomInt(0,15).toString().padStart(2,'0')}:00`;
        notes = "Ca chiều vắt đêm";
    } else {
        cIn = `22:00:00`;
        cOut = `06:00:00`;
        notes = "Trực đêm";
    }
    
    if (id % 50 === 0) {
        cOut = ""; // Missing value
        notes = "Quên bấm giờ ra (Missing value)";
    }

    scrapedLines.push(`${id},${dateStr},${sName},${shName},${cIn},${cOut}`);
    rawLines.push(`${id},${dateStr},${sName},${shName},${cIn},${cOut},${notes}`);
}

const datasetDir = path.join(__dirname, '..', 'dataset');
if (!fs.existsSync(datasetDir)) fs.mkdirSync(datasetDir, { recursive: true });

fs.writeFileSync(path.join(datasetDir, 'scraped_timecards.csv'), scrapedLines.join('\n'), 'utf8');
fs.writeFileSync(path.join(datasetDir, 'raw_timecards.csv'), rawLines.join('\n'), 'utf8');

console.log(`Đã sinh thành công ${totalRecords} records vào dataset/scraped_timecards.csv và raw_timecards.csv!`);
