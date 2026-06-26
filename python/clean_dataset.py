"""
Hệ thống Quản lý Ca làm việc và Chấm công (Staff Shift Management)
Script xử lý và làm sạch dữ liệu môn DBI202 (Tuần 6 & Tuần 7)
Ngôn ngữ: Python (Pandas, Numpy)
Nhóm thực hiện: Nhóm 01
"""

import pandas as pd
import numpy as np
from datetime import datetime

def clean_timecard_data(input_path, output_path):
    print("=== BẮT ĐẦU QUY TRÌNH LÀM SẠCH DỮ LIỆU (DATA CLEANING PIPELINE) ===")
    
    # 1. Đọc tập dữ liệu thô (Raw Dataset)
    print(f"[Bước 1] Đọc dữ liệu từ {input_path}...")
    df = pd.read_csv(input_path)
    print(f" -> Tổng số dòng ban đầu: {len(df)}")

    # 2. Loại bỏ các bản ghi trùng lặp (Remove Duplicates)
    print("[Bước 2] Kiểm tra và loại bỏ dữ liệu trùng lặp...")
    dups = df.duplicated().sum()
    if dups > 0:
        df = df.drop_duplicates(keep='first')
        print(f" -> Đã xóa {dups} dòng trùng lặp hoàn toàn.")
    else:
        print(" -> Không phát hiện dòng trùng lặp.")

    # 3. Xử lý dữ liệu thiếu (Null / Missing Values)
    # Trong thực tế máy chấm công có thể lỗi khiến CheckIn hoặc CheckOut bị Null (NaN)
    print("[Bước 3] Xử lý dữ liệu thiếu (Missing Values)...")
    missing_before = df.isnull().sum().sum()
    print(f" -> Tổng số ô bị trống ban đầu: {missing_before}")
    
    # Nếu thiếu CheckOut nhưng có CheckIn, giả định nhân viên làm chuẩn ca 8 tiếng (16:00:00)
    df['CheckOut'] = df['CheckOut'].fillna('16:00:00')
    # Nếu thiếu CheckIn, giả định nhân viên đến đúng giờ ca sáng (08:00:00)
    df['CheckIn'] = df['CheckIn'].fillna('08:00:00')

    # 4. Chuẩn hóa và Tính toán giờ làm (Khắc phục lỗi ca đêm vắt ngày)
    print("[Bước 4] Tính toán số giờ làm việc thực tế (TotalHours)...")
    
    def calc_hours(row):
        fmt = '%H:%M:%S'
        try:
            t_in = datetime.strptime(row['CheckIn'], fmt)
            t_out = datetime.strptime(row['CheckOut'], fmt)
            
            diff_sec = (t_out - t_in).total_seconds()
            
            # XỬ LÝ CA ĐÊM (VD: Vào 22:00 ra 06:00 sáng hôm sau -> diff bị âm)
            if diff_sec < 0:
                diff_sec += 24 * 3600  # Cộng thêm 24 giờ (86400 giây)
                
            hours = diff_sec / 3600.0
            return np.round(hours, 2)
        except Exception as e:
            return 0.0

    df['TotalHours'] = df.apply(calc_hours, axis=1)

    # 5. Đánh giá trạng thái chuyên cần (On Time / Late)
    # Ca sáng bắt đầu lúc 08:00:00, cho phép trễ tối đa 5 phút (đến 08:05:00)
    print("[Bước 5] Phân loại trạng thái Đúng giờ / Đi muộn...")
    df['Status'] = np.where(df['CheckIn'] > '08:05:00', 'Đi muộn', 'Đúng giờ')

    # 6. Xuất tập dữ liệu sạch sẵn sàng cho Phân tích (Export Cleaned Dataset)
    print(f"[Bước 6] Ghi dữ liệu đã chuẩn hóa ra {output_path}...")
    df.to_csv(output_path, index=False, encoding='utf-8-sig')
    print("=== HOÀN TẤT PIPELINE XỬ LÝ DỮ LIỆU ===")
    return df

import os

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    raw_csv = os.path.join(base_dir, '..', 'dataset', 'raw_timecards.csv')
    clean_csv = os.path.join(base_dir, '..', 'dataset', 'cleaned_timecards.csv')
    
    # Chạy thử nghiệm
    try:
        cleaned_df = clean_timecard_data(raw_csv, clean_csv)
        print("\n--- BẢNG DỮ LIỆU SAU KHI LÀM SẠCH ---")
        print(cleaned_df[['TimecardID', 'StaffName', 'CheckIn', 'CheckOut', 'TotalHours', 'Status']])
    except Exception as err:
        print(f"Lỗi thực thi script: {err}")
