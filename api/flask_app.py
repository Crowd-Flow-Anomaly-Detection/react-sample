from flask import Flask, render_template, jsonify, request, send_file
import csv
import calendar as cal
from datetime import datetime
import matplotlib.pyplot as plt
import io
from flask_cors import CORS


import matplotlib
matplotlib.use('Agg')

app = Flask(__name__)
CORS(app)


FILE_NAME = 'footfall_data.csv'

# 從CSV讀取人流量數據的函式
def read_data(filename=FILE_NAME):
    data = {}
    total = 0
    with open(filename, 'r') as csvfile:
        reader = csv.reader(csvfile)
        next(reader)  # 跳過標題
        for row in reader:
            date, hour, footfall = row
            if date not in data:
                data[date] = [0] * 24  # 初始化24小時的數據
            data[date][int(hour)] = int(footfall)
            total += int(footfall)
    return data, total

# 將數據寫入CSV的函式
def write_data(data, filename=FILE_NAME):
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['Date', 'Hour', 'Footfall'])
        for date, hours in data.items():
            for hour, footfall in enumerate(hours):
                writer.writerow([date, hour, footfall])

# API端點來獲取所有人流量數據
@app.route('/api/footfall', methods=['GET'])
def api_get_footfall():
    data, total = read_data()
    result = {}
    for date, hours in data.items():
        result[date] = [[hour, footfall] for hour, footfall in enumerate(hours)]
    return jsonify({"data": result, "total": total})

# API端點來新增人流量數據
@app.route('/api/footfall', methods=['POST'])
def api_add_footfall():
    new_entry = request.json
    data, _ = read_data()
    
    date = new_entry['date']
    hour = int(new_entry['hour'])
    footfall = new_entry['footfall']
    
    if date not in data:
        data[date] = [0] * 24
    data[date][hour] = footfall
    
    write_data(data)
    return jsonify({"message": "Data added successfully", "data": new_entry}), 201

# API端點來根據日期和小時刪除人流量數據
@app.route('/api/footfall/<date>/<hour>', methods=['DELETE'])
def api_delete_footfall(date, hour):
    data, _ = read_data()
    hour = int(hour)
    
    if date in data and data[date][hour] != 0:
        data[date][hour] = 0
    else:
        return jsonify({"error": "Date or hour not found"}), 404
    
    write_data(data)
    return jsonify({"message": "Data deleted successfully", "date": date, "hour": hour}), 200

# API端點來根據日期和小時獲取人流量數據
@app.route('/api/footfall/<date>/<hour>', methods=['GET'])
def api_get_footfall_by_date_hour(date, hour):
    data, _ = read_data()
    hour = int(hour)
    if date in data and data[date][hour] != 0:
        return jsonify({"date": date, "hour": hour, "footfall": data[date][hour]})
    else:
        return jsonify({"error": "Date or hour not found"}), 404
    
# API端點來根據日期獲取人流量數據
@app.route('/api/footfall/<date>', methods=['GET'])
def api_get_footfall_by_date_api(date):
    data, _ = read_data()
    if date in data:
        return jsonify({"date": date, "footfall": data[date]})
    else:
        return jsonify({"error": "Date not found"}), 404

# API端點來根據日期和小時修改人流量數據
@app.route('/api/footfall/<date>/<hour>', methods=['PUT'])
def api_update_footfall(date, hour):
    updated_entry = request.json
    data, _ = read_data()
    hour = int(hour)
    
    if date in data:
        data[date][hour] = updated_entry['footfall']
    else:
        return jsonify({"error": "Date not found"}), 404

    write_data(data)
    return jsonify({"message": "Data updated successfully", "date": date, "hour": hour, "footfall": updated_entry['footfall']}), 200

@app.route('/')
def index():
    current_date = datetime.now()
    year = int(request.args.get('year', current_date.year))
    month = int(request.args.get('month', current_date.month))
    data, _ = read_data()
    month_data = {}
    for date in data:
        date_parts = date.split('-')
        if int(date_parts[0]) == year and int(date_parts[1]) == month:
            day = int(date_parts[2])
            month_data[day] = sum(data[date])
    
    cal.setfirstweekday(cal.SUNDAY)
    cal_data = cal.monthcalendar(year, month)
    
    return render_template('index.html', year=year, month=month, data=month_data, cal=cal_data)

@app.route('/api/footfall/<year>/<month>/<day>', methods=['GET'])
def api_get_footfall_by_date(year, month, day):
    data, _ = read_data()
    date = f"{year}-{str(month).zfill(2)}-{str(day).zfill(2)}"
    if date in data:
        return jsonify({"date": date, "footfall": data[date]})
    else:
        return jsonify({"error": "尚無資料"}), 404

# 生成並返回人流量圖表
@app.route('/footfall_chart/<year>/<month>/<day>.png')
def footfall_chart(year, month, day):
    data, _ = read_data()
    date = f"{year}-{str(month).zfill(2)}-{str(day).zfill(2)}"
    
    if date not in data:
        return jsonify({"error": "Date not found"}), 404
    
    footfall = data[date]
    hours = list(range(24))

    plt.figure(figsize=(10, 6))
    plt.bar(hours, footfall, color='blue')
    plt.xlabel('Hour')
    plt.ylabel('Footfall')
    plt.title(f'Footfall for {date}')
    plt.xticks(hours)
    
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()
    
    return send_file(img, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True)
