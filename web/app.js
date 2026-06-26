/**
 * Staff Shift Management - Frontend App Logic
 * Tái hiện mô hình CSDL DBI202 và thuật toán xử lý giờ làm chuẩn từ Node.js
 */

// ==========================================
// 1. DỮ LIỆU MẪU CHUẨN TỪ 02_Insert_Mock_Data.sql
// ==========================================
const DEFAULT_STAFF = [
    { UserID: 1, FullName: 'Nguyễn Văn A', Role: 'Manager', HourlyRate: 50.00 },
    { UserID: 2, FullName: 'Trần Thị B', Role: 'Staff', HourlyRate: 25.00 },
    { UserID: 3, FullName: 'Lê Văn C', Role: 'Staff', HourlyRate: 25.00 }
];

const DEFAULT_SHIFTS = [
    { ShiftID: 1, ShiftName: 'Ca Sáng', Time_Range: '08:00 - 16:00' },
    { ShiftID: 2, ShiftName: 'Ca Chiều', Time_Range: '16:00 - 00:00' }
];

const DEFAULT_SCHEDULES = [
    { UserID: 1, ShiftID: 1 },
    { UserID: 2, ShiftID: 1 },
    { UserID: 3, ShiftID: 2 }
];

const DEFAULT_TIMECARDS = [
    { TimecardID: 1, WorkDate: '2026-06-20', CheckIn: '07:55:00', CheckOut: '16:05:00', UserID: 1, ShiftID: 1 },
    { TimecardID: 2, WorkDate: '2026-06-20', CheckIn: '08:15:00', CheckOut: '16:00:00', UserID: 2, ShiftID: 1 },
    { TimecardID: 3, WorkDate: '2026-06-21', CheckIn: '15:50:00', CheckOut: '00:15:00', UserID: 3, ShiftID: 2 },
    { TimecardID: 4, WorkDate: '2026-06-22', CheckIn: '22:00:00', CheckOut: '06:00:00', UserID: 1, ShiftID: 2 }
];

// Quản lý State cục bộ (khôi phục từ localStorage hoặc dùng mặc định)
let state = {
    staff: JSON.parse(localStorage.getItem('dbi_staff')) || DEFAULT_STAFF,
    shifts: JSON.parse(localStorage.getItem('dbi_shifts')) || DEFAULT_SHIFTS,
    schedules: JSON.parse(localStorage.getItem('dbi_schedules')) || DEFAULT_SCHEDULES,
    timecards: JSON.parse(localStorage.getItem('dbi_timecards')) || DEFAULT_TIMECARDS
};

function saveState() {
    localStorage.setItem('dbi_staff', JSON.stringify(state.staff));
    localStorage.setItem('dbi_shifts', JSON.stringify(state.shifts));
    localStorage.setItem('dbi_schedules', JSON.stringify(state.schedules));
    localStorage.setItem('dbi_timecards', JSON.stringify(state.timecards));
}

// ==========================================
// 2. THUẬT TOÁN CHUẨN TỪ process_timecards.js
// ==========================================
function calculateTotalHours(checkIn, checkOut) {
    const [inHours, inMins] = checkIn.split(':').map(Number);
    const [outHours, outMins] = checkOut.split(':').map(Number);
    
    let totalMins = (outHours * 60 + outMins) - (inHours * 60 + inMins);
    if (totalMins < 0) {
        totalMins += 24 * 60; // Ca làm đêm qua ngày hôm sau
    }
    return Number((totalMins / 60).toFixed(2));
}

function evaluateStatus(checkIn, shiftID) {
    const [inHours, inMins] = checkIn.split(':').map(Number);
    
    // Shift 1 bắt đầu 08:00, Shift 2 bắt đầu 16:00
    if (shiftID === 1 && (inHours > 8 || (inHours === 8 && inMins > 0))) {
        return 'Late';
    } else if (shiftID === 2 && (inHours > 16 || (inHours === 16 && inMins > 0))) {
        return 'Late';
    }
    return 'On Time';
}

// ==========================================
// 3. LOGIC HIỂN THỊ & RENDER GIAO DIỆN
// ==========================================
function renderAll() {
    renderDashboard();
    renderStaffTable('all');
    renderShifts();
    renderTimecards();
    updateBadgesAndDropdowns();
}

function renderDashboard() {
    document.getElementById('dash-total-staff').textContent = state.staff.length;
    document.getElementById('dash-total-shifts').textContent = state.shifts.length;
    document.getElementById('dash-total-timecards').textContent = state.timecards.length;
    
    // View 3: vw_High_Rate_Staff (HourlyRate >= 40)
    const highRateStaff = state.staff.filter(s => s.HourlyRate >= 40);
    document.getElementById('dash-high-rate').textContent = highRateStaff.length;
    
    const hrListContainer = document.getElementById('high-rate-list');
    hrListContainer.innerHTML = highRateStaff.map(s => `
        <div class="staff-mini-card">
            <div class="smc-left">
                <span class="smc-name">${s.FullName}</span>
                <span class="smc-role">${s.Role}</span>
            </div>
            <span class="smc-rate">$${s.HourlyRate.toFixed(2)}/h</span>
        </div>
    `).join('') || `<p class="text-secondary text-sm">Không có nhân viên lương cao</p>`;

    // View 2: vw_Daily_Attendance (COUNT GROUP BY WorkDate)
    const attendanceMap = {};
    state.timecards.forEach(tc => {
        attendanceMap[tc.WorkDate] = (attendanceMap[tc.WorkDate] || 0) + 1;
    });
    
    const maxCount = Math.max(...Object.values(attendanceMap), 1);
    const chartContainer = document.getElementById('attendance-chart-container');
    chartContainer.innerHTML = Object.entries(attendanceMap).map(([date, count]) => {
        const percent = Math.round((count / maxCount) * 100);
        return `
            <div class="bar-row">
                <span class="bar-date">${date}</span>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${percent}%"></div>
                </div>
                <span class="bar-count">${count} lượt</span>
            </div>
        `;
    }).join('') || `<p class="text-secondary text-sm">Chưa có dữ liệu chấm công</p>`;
}

function renderStaffTable(filterType = 'all', searchQuery = '') {
    const tbody = document.getElementById('staff-table-body');
    let filtered = state.staff;

    if (filterType === 'high') {
        filtered = filtered.filter(s => s.HourlyRate >= 40);
    } else if (filterType === 'manager') {
        filtered = filtered.filter(s => s.Role.toLowerCase().includes('manager'));
    }

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(s => 
            s.FullName.toLowerCase().includes(q) || s.Role.toLowerCase().includes(q)
        );
    }

    tbody.innerHTML = filtered.map(s => {
        // Tìm các ca phân công cho nhân viên này
        const assignedShiftIDs = state.schedules.filter(sc => sc.UserID === s.UserID).map(sc => sc.ShiftID);
        const shiftNames = state.shifts
            .filter(sh => assignedShiftIDs.includes(sh.ShiftID))
            .map(sh => `<span class="badge badge-info">${sh.ShiftName}</span>`)
            .join(' ');

        const isHigh = s.HourlyRate >= 40 ? `<span class="badge badge-warning ml-2">&ge; $40</span>` : '';

        return `
            <tr>
                <td><strong>#${s.UserID}</strong></td>
                <td>${s.FullName} ${isHigh}</td>
                <td><span class="badge badge-outline">${s.Role}</span></td>
                <td><strong>$${s.HourlyRate.toFixed(2)}</strong></td>
                <td>${shiftNames || '<span class="text-muted">Chưa phân ca</span>'}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="deleteStaff(${s.UserID})">
                        <span class="material-symbols-outlined" style="font-size:16px">delete</span>
                    </button>
                </td>
            </tr>
        `;
    }).join('') || `<tr><td colspan="6" class="text-center text-muted">Không tìm thấy bản ghi phù hợp</td></tr>`;
}

function renderShifts() {
    const sContainer = document.getElementById('shifts-container');
    sContainer.innerHTML = state.shifts.map(sh => {
        const assignedUsers = state.schedules
            .filter(sc => sc.ShiftID === sh.ShiftID)
            .map(sc => state.staff.find(s => s.UserID === sc.UserID))
            .filter(Boolean);

        return `
            <div class="shift-card glass-card">
                <div class="shift-card-header">
                    <h4>${sh.ShiftName}</h4>
                    <span class="badge badge-outline">${sh.Time_Range}</span>
                </div>
                <p class="text-secondary text-sm">Danh sách nhân viên phụ trách:</p>
                <div class="shift-staff-list">
                    ${assignedUsers.map(u => `
                        <div class="staff-tag">
                            <span class="material-symbols-outlined">person</span>
                            <span>${u.FullName} (${u.Role})</span>
                        </div>
                    `).join('') || '<span class="text-muted text-sm">Trống</span>'}
                </div>
            </div>
        `;
    }).join('');

    // View 1: vw_Staff_Shifts
    const schedBody = document.getElementById('schedules-table-body');
    schedBody.innerHTML = state.schedules.map(sc => {
        const staff = state.staff.find(s => s.UserID === sc.UserID);
        const shift = state.shifts.find(sh => sh.ShiftID === sc.ShiftID);
        if (!staff || !shift) return '';

        return `
            <tr>
                <td><strong>${staff.FullName}</strong></td>
                <td><span class="badge badge-info">${shift.ShiftName}</span></td>
                <td><code>${shift.Time_Range}</code></td>
                <td><span class="badge badge-success">Đã xác nhận</span></td>
            </tr>
        `;
    }).join('');
}

function formatVietnameseHours(totalHours) {
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    if (minutes === 0) {
        return `${hours} giờ`;
    }
    return `${hours} giờ ${minutes} phút`;
}

function renderTimecards() {
    const tbody = document.getElementById('timecards-table-body');
    
    // Tự động xử lý qua logic Node.js
    const processed = state.timecards.map(tc => {
        const totalHours = calculateTotalHours(tc.CheckIn, tc.CheckOut);
        const status = evaluateStatus(tc.CheckIn, tc.ShiftID);
        const staff = state.staff.find(s => s.UserID === tc.UserID);
        const shift = state.shifts.find(sh => sh.ShiftID === tc.ShiftID);
        
        const estWage = staff ? (totalHours * staff.HourlyRate) : 0;

        return { ...tc, totalHours, status, staff, shift, estWage };
    });

    // Sắp xếp ngày mới nhất lên đầu
    processed.sort((a, b) => new Date(b.WorkDate) - new Date(a.WorkDate));

    tbody.innerHTML = processed.map(r => {
        const badgeStatus = r.status === 'On Time' 
            ? `<span class="badge badge-success">Đúng giờ</span>`
            : `<span class="badge badge-danger">Đi muộn</span>`;

        const timeFormatted = formatVietnameseHours(r.totalHours);

        return `
            <tr>
                <td><strong>#${r.TimecardID}</strong></td>
                <td>${r.WorkDate}</td>
                <td>${r.staff ? r.staff.FullName : 'Unknown'}</td>
                <td><span class="badge badge-outline">${r.shift ? r.shift.ShiftName : 'Unknown'}</span></td>
                <td><code>${r.CheckIn}</code></td>
                <td><code>${r.CheckOut}</code></td>
                <td><strong>${timeFormatted}</strong></td>
                <td>${badgeStatus}</td>
                <td><strong class="text-amber">$${r.estWage.toFixed(2)}</strong></td>
            </tr>
        `;
    }).join('');
}

function updateBadgesAndDropdowns() {
    document.getElementById('staff-count-badge').textContent = state.staff.length;

    const staffSelect = document.getElementById('ci-staff');
    staffSelect.innerHTML = state.staff.map(s => 
        `<option value="${s.UserID}">${s.FullName} (${s.Role})</option>`
    ).join('');

    const shiftSelect = document.getElementById('ci-shift');
    shiftSelect.innerHTML = state.shifts.map(sh => 
        `<option value="${sh.ShiftID}">${sh.ShiftName} (${sh.Time_Range})</option>`
    ).join('');
}

// ==========================================
// 4. THAO TÁC NGƯỜI DÙNG & EVENTS
// ==========================================
function deleteStaff(id) {
    if (confirm('Xóa nhân viên này? Các phân ca và thẻ chấm công liên quan sẽ bị xóa theo (ON DELETE CASCADE)')) {
        state.staff = state.staff.filter(s => s.UserID !== id);
        state.schedules = state.schedules.filter(sc => sc.UserID !== id);
        state.timecards = state.timecards.filter(tc => tc.UserID !== id);
        saveState();
        renderAll();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderAll();

    // Set default date to today for modal
    document.getElementById('ci-date').valueAsDate = new Date();

    // Tab Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');

    const TITLES = {
        dashboard: ['Tổng Quan Hệ Thống', 'Thống kê hoạt động chấm công và phân ca nhân viên'],
        staff: ['Quản Lý Nhân Viên (STAFF)', 'Danh sách nhân viên, chức vụ và mức lương thù lao'],
        shifts: ['Phân Ca Làm Việc & Lịch', 'Bảng trung gian SCHEDULES thể hiện quan hệ M-N'],
        timecards: ['Thẻ Chấm Công & Tính Lương', 'Tái hiện xử lý dữ liệu chuẩn từ Node.js Script']
    };

    function switchTab(tabId) {
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tabId);
        });
        tabPanes.forEach(pane => {
            pane.classList.toggle('active', pane.id === `tab-${tabId}`);
        });

        if (TITLES[tabId]) {
            pageTitle.textContent = TITLES[tabId][0];
            pageSubtitle.textContent = TITLES[tabId][1];
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.dataset.tab;
            switchTab(tabId);
        });
    });

    // Staff Filter Buttons
    const filterBtns = document.querySelectorAll('.btn-filter');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderStaffTable(btn.dataset.filter, document.getElementById('global-search').value);
        });
    });

    // Search input
    document.getElementById('global-search').addEventListener('input', (e) => {
        const activeFilter = document.querySelector('.btn-filter.active').dataset.filter;
        renderStaffTable(activeFilter, e.target.value);
    });

    // Modals Handling
    const modalAddStaff = document.getElementById('modal-add-staff');
    const modalCheckin = document.getElementById('modal-checkin');

    document.getElementById('btn-open-add-staff').addEventListener('click', () => modalAddStaff.classList.add('open'));
    document.getElementById('btn-open-checkin').addEventListener('click', () => modalCheckin.classList.add('open'));
    document.getElementById('btn-quick-action').addEventListener('click', () => modalCheckin.classList.add('open'));

    document.querySelectorAll('.btn-close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            modalAddStaff.classList.remove('open');
            modalCheckin.classList.remove('open');
        });
    });

    // Form Add Staff Submit
    document.getElementById('form-add-staff').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = Number(document.getElementById('input-userid').value);
        if (state.staff.some(s => s.UserID === id)) {
            alert('Lỗi Constraint: UserID này đã tồn tại trong bảng STAFF!');
            return;
        }

        const newStaff = {
            UserID: id,
            FullName: document.getElementById('input-fullname').value,
            Role: document.getElementById('input-role').value,
            HourlyRate: Number(document.getElementById('input-rate').value)
        };

        state.staff.push(newStaff);
        // Mặc định phân ca 1 cho nhân viên mới
        state.schedules.push({ UserID: id, ShiftID: 1 });
        
        saveState();
        renderAll();
        modalAddStaff.classList.remove('open');
        e.target.reset();
        alert('Thêm nhân viên thành công!');
    });

    // Form Checkin Submit
    document.getElementById('form-checkin').addEventListener('submit', (e) => {
        e.preventDefault();
        const newID = state.timecards.length ? Math.max(...state.timecards.map(t => t.TimecardID)) + 1 : 1;
        
        const newCard = {
            TimecardID: newID,
            WorkDate: document.getElementById('ci-date').value,
            CheckIn: document.getElementById('ci-in').value,
            CheckOut: document.getElementById('ci-out').value,
            UserID: Number(document.getElementById('ci-staff').value),
            ShiftID: Number(document.getElementById('ci-shift').value)
        };

        state.timecards.push(newCard);
        saveState();
        renderAll();
        modalCheckin.classList.remove('open');
        switchTab('timecards');
        alert('Đã xử lý thẻ chấm công! Vui lòng xem kết quả đánh giá On Time/Late ở bảng dưới.');
    });
});
