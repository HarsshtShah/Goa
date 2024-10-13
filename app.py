from flask import render_template, redirect, url_for, Flask, request, jsonify
import os
import csv

app = Flask(__name__)

# Static list of 8 profiles: 1 admin and 7 regular profiles
profiles = [
    {"name": "Admin", "image": "admin.webp", "role": "admin"},
    {"name": "Harssht", "image": "harssht.webp", "role": "user"},
    {"name": "Suru", "image": "suru.webp", "role": "user"},
    {"name": "Yash", "image": "yash.webp", "role": "user"},
    {"name": "More", "image": "more.webp", "role": "user"},
    {"name": "Kosh", "image": "kosh.webp", "role": "user"},
    {"name": "Shivang", "image": "shivang.webp", "role": "user"},
    {"name": "Ri", "image": "ri.webp", "role": "user"}
]

# Route to show the profile selection page
@app.route('/')
def profile_selection():
    return render_template('profile_selection.html', profiles=profiles)

# Route to render index.html for a selected profile
@app.route('/profile/<profile_name>')
def profile_page(profile_name):
    csv_file = f'data/items_{profile_name}.csv'
    items = []

    # Check if the CSV file exists for the profile, if not create it
    if os.path.exists(csv_file):
        with open(csv_file, newline='') as f:
            reader = csv.reader(f)
            items = list(reader)
    else:
        create_csv_file_if_not_exists(csv_file)

    return render_template('index.html', profile_name=profile_name, items=items)

# Ensure CSV file exists
def create_csv_file_if_not_exists(csv_file):
    if not os.path.exists(csv_file):
        with open(csv_file, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['name', 'price'])

# Route to load items from CSV for a profile
@app.route('/items/<profile_name>', methods=['GET'])
def get_items(profile_name):
    csv_file_path = f'data/items_{profile_name}.csv'
    create_csv_file_if_not_exists(csv_file_path)

    items = []
    with open(csv_file_path, mode='r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            items.append({'name': row['name'], 'price': float(row['price'])})
    return jsonify(items)

# Route to save items to CSV for a profile
@app.route('/items/<profile_name>', methods=['POST'])
def save_items(profile_name):
    csv_file_path = f'data/items_{profile_name}.csv'
    items = request.json  # Get the JSON data sent from the client

    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['name', 'price'])  # Write headers
        for item in items:
            writer.writerow([item['name'], item['price']])

    return jsonify({'message': f'Items saved successfully for {profile_name}'})

if __name__ == '__main__':
    app.run(debug=True)
