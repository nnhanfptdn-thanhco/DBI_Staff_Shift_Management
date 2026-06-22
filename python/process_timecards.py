import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

# =====================================================================
# BÀI TẬP TUẦN 6: Cài đặt và làm quen với Python (Pandas, Numpy)
# =====================================================================
print("--- HỆ THỐNG XỬ LÝ DỮ LIỆU STAFF SHIFT MANAGEMENT ---")

# 1. THU THẬP DỮ LIỆU (Giả lập lấy dữ liệu từ SQL Server / Máy chấm công)
# Trong thực tế, nhóm sẽ dùng thư viện 'pyodbc' để lấy dữ liệu từ SQL
data = {
    'TimecardID': range(1, 6),
    'UserID': [1, 2, 1, 3, 2],
    'WorkDate': ['2026-06-20', '2026-06-20', '2026-06-21', '2026-06-21', '2026-06-21'],
    'CheckIn': ['07:55:00', '08:15:00', '08:00:00', '16:05:00', '07:50:00'],
    'CheckOut': ['16:00:00', '16:05:00', '16:00:00', '00:15:00', '16:00:00']
}

df = pd.DataFrame(data)
print("\n[BƯỚC 1] Dữ liệu thô ban đầu (Thu thập từ máy chấm công):")
print(df)

# 2. XỬ LÝ DỮ LIỆU BẰNG PANDAS & NUMPY
# Chuyển đổi kiểu dữ liệu thời gian để tính toán
df['CheckIn'] = pd.to_timedelta(df['CheckIn'])
df['CheckOut'] = pd.to_timedelta(df['CheckOut'])

# TÍNH TOÁN BẰNG PANDAS: Tính tổng số giờ làm việc trong ngày
# (Ca làm qua đêm thì CheckOut < CheckIn nên phải cộng thêm 24h)
df['TotalHours'] = np.where(
    df['CheckOut'] < df['CheckIn'],
    (df['CheckOut'] + pd.to_timedelta('24:00:00') - df['CheckIn']).dt.total_seconds() / 3600,
    (df['CheckOut'] - df['CheckIn']).dt.total_seconds() / 3600
)
df['TotalHours'] = df['TotalHours'].round(2)

# PHÂN TÍCH BẰNG NUMPY: Phân loại trạng thái đi làm
# Giả sử ca sáng bắt đầu lúc 08:00:00, ca chiều lúc 16:00:00
df['Status'] = np.where(
    (df['CheckIn'] > pd.to_timedelta('08:00:00')) & (df['CheckIn'] < pd.to_timedelta('12:00:00')) | 
    (df['CheckIn'] > pd.to_timedelta('16:00:00')), 
    'Đi trễ', 'Đúng giờ'
)

print("\n[BƯỚC 2] Dữ liệu sau khi xử lý bằng Pandas & Numpy (Tính giờ làm & Đi trễ):")
processed_df = df[['TimecardID', 'UserID', 'WorkDate', 'TotalHours', 'Status']]
print(processed_df)

# 3. KẾT QUẢ ĐẦU RA
# Lưu kết quả ra file CSV (Tương đương việc insert ngược lại vào SQL để báo cáo)
processed_df.to_csv('processed_timecards.csv', index=False)
print("\n[BƯỚC 3] Đã xuất báo cáo ra file 'processed_timecards.csv' thành công để đem đi báo cáo!")

# LÆ¯U Ã: Cháº¡y script nÃ y báº±ng Python 3.9+
