from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route('/recommend', methods=['GET'])
def recommend():
    skills = request.args.get('skills')
    if not skills:
        return jsonify({'error': 'No skills provided'}), 400
    skill_list = skills.split(',')
    results = get_recommended_courses(skill_list)
    return jsonify(results)

def get_recommended_courses(skills):
    recommended_courses = []
    for skill in skills:
        # Query Coursera API for each skill
        url = f"https://api.coursera.org/api/courses.v1?q=search&query={skill.strip()}&limit=2"
        try:
            response = requests.get(url)
            data = response.json()
            for course in data.get("elements", []):
                recommended_courses.append({
                    "title": course.get("name"),
                    "platform": "Coursera",
                    "id": course.get("id"),
                    "slug": course.get("slug"),
                })
        except Exception as e:
            continue  # skip errors for this skill
    return {"recommended_courses": recommended_courses}

if __name__ == '__main__':
    app.run(port=5001)
