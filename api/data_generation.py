import random
import datetime
import csv

# 生成資料函式
def generate_data(filename='footfall_data.csv'):
    current_date = datetime.datetime.now()
    data = []
    
    # 生成 30 天的資料
    for i in range(1000):
        date = (current_date - datetime.timedelta(days=i)).strftime('%Y-%m-%d')
        for hour in range(24):
            footfall = random.randint(5, 50)  # 隨機生成 5 到 50 之間的數字
            data.append((date, hour, footfall))
    
    # 按日期和小時排序
    data.sort(key=lambda x: (x[0], x[1]))
    
    # 寫入 CSV 
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['Date', 'Hour', 'Footfall'])
        writer.writerows(data)
    
    print(f"資料成功生成 存成 {filename}")

if __name__ == "__main__":
    generate_data()
