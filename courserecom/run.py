from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import sys
import os

# Add the app directory to the path to import the Recommender model
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
try:
    from api.model import Recommender
    # Initialize the recommender model
    recommender = Recommender()
    print("✓ Recommender model loaded successfully")
except Exception as e:
    print(f"⚠ Warning: Could not load Recommender model: {str(e)}")
    print("  Falling back to Coursera API only")
    recommender = None

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/recommend', methods=['GET'])
def recommend():
    try:
        skills = request.args.get('skills')
        if not skills:
            return jsonify({'error': 'No skills provided', 'recommended_courses': []}), 400
        
        skill_list = [skill.strip() for skill in skills.split(',') if skill.strip()]
        if not skill_list:
            return jsonify({'error': 'Invalid skills format', 'recommended_courses': []}), 400
        
        results = get_recommended_courses(skill_list)
        return jsonify(results)
    except Exception as e:
        print(f"Error in /recommend endpoint: {str(e)}")
        return jsonify({
            'error': f'Internal server error: {str(e)}',
            'recommended_courses': []
        }), 500

def get_coursera_courses(skill, seen_titles, limit=3):
    """Fetch courses from Coursera API"""
    courses = []
    try:
        url = f"https://api.coursera.org/api/courses.v1?q=search&query={skill.strip()}&limit={limit}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            for course in data.get("elements", []):
                course_title = course.get("name", "")
                if course_title and course_title not in seen_titles:
                    seen_titles.add(course_title)
                    courses.append({
                        "title": course_title,
                        "platform": "Coursera",
                        "provider": "Coursera",
                        "id": course.get("id", ""),
                        "slug": course.get("slug", ""),
                        "url": f"https://www.coursera.org/learn/{course.get('slug', '')}" if course.get('slug') else "",
                        "category": skill,
                        "image": f"https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/{course.get('photoUrl', '')}" if course.get('photoUrl') else None
                    })
    except Exception as e:
        print(f"Error querying Coursera API for skill '{skill}': {str(e)}")
    return courses

def get_udemy_courses(skill, seen_titles=None, limit=2):
    """Fetch courses from Udemy (using search simulation)"""
    courses = []
    if seen_titles is None:
        seen_titles = set()
    try:
        # Note: Udemy doesn't have a public API, so we'll create search URLs
        # In production, you'd use Udemy's affiliate API or web scraping
        search_query = skill.strip().replace(" ", "+")
        title = f"{skill.title()} - Complete Course"
        if title not in seen_titles:
            seen_titles.add(title)
            courses.append({
                "title": title,
                "platform": "Udemy",
                "provider": "Udemy",
                "url": f"https://www.udemy.com/courses/search/?q={search_query}",
                "category": skill,
                "image": None,
                "note": "Search results on Udemy"
            })
    except Exception as e:
        print(f"Error creating Udemy search for skill '{skill}': {str(e)}")
    return courses

def get_edx_courses(skill, seen_titles=None, limit=2):
    """Fetch courses from edX (using search simulation)"""
    courses = []
    if seen_titles is None:
        seen_titles = set()
    try:
        # edX has a public catalog API, but requires authentication for full access
        # For now, we'll create search URLs
        search_query = skill.strip().replace(" ", "+")
        title = f"{skill.title()} Course"
        if title not in seen_titles:
            seen_titles.add(title)
            courses.append({
                "title": title,
                "platform": "edX",
                "provider": "edX",
                "url": f"https://www.edx.org/search?q={search_query}",
                "category": skill,
                "image": None,
                "note": "Search results on edX"
            })
    except Exception as e:
        print(f"Error creating edX search for skill '{skill}': {str(e)}")
    return courses

def get_khan_academy_courses(skill, seen_titles, limit=2):
    """Fetch courses from Khan Academy"""
    courses = []
    try:
        # Khan Academy has a public API
        search_query = skill.strip().replace(" ", "%20")
        url = f"https://www.khanacademy.org/api/v1/search?query={search_query}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            for item in data.get("hits", [])[:limit]:
                if item.get("kind") == "Video" or item.get("kind") == "Article":
                    title = item.get("title", "")
                    if title and title not in seen_titles:
                        seen_titles.add(title)
                        courses.append({
                            "title": title,
                            "platform": "Khan Academy",
                            "provider": "Khan Academy",
                            "url": f"https://www.khanacademy.org{item.get('url', '')}",
                            "category": skill,
                            "image": item.get("image_url") if item.get("image_url") else None
                        })
    except Exception as e:
        print(f"Error querying Khan Academy API for skill '{skill}': {str(e)}")
    return courses

def get_recommended_courses(skills):
    recommended_courses = []
    seen_titles = set()  # To avoid duplicates
    
    # First, try using the Recommender model with the Coursera dataset
    if recommender:
        for skill in skills[:5]:  # Limit to first 5 skills
            try:
                similar_courses = recommender.recommend(skill)
                for course_name, course_data in similar_courses[:3]:
                    if course_name not in seen_titles:
                        seen_titles.add(course_name)
                        recommended_courses.append({
                            "title": course_name,
                            "platform": "Coursera",
                            "provider": "Coursera",
                            "url": course_data.get('url', ''),
                            "similarity": course_data.get('similarity', 0),
                            "category": skill,
                            "image": None
                        })
            except Exception as e:
                print(f"Error using Recommender model for skill '{skill}': {str(e)}")
                continue
    
    # Fetch from multiple course providers
    providers = [
        ("Coursera", get_coursera_courses, 2),
        ("Khan Academy", get_khan_academy_courses, 1),
        ("Udemy", get_udemy_courses, 1),
        ("edX", get_edx_courses, 1),
    ]
    
    for skill in skills[:4]:  # Process first 4 skills
        for provider_name, provider_func, limit in providers:
            if len(recommended_courses) >= 15:  # Limit total results
                break
            try:
                courses = provider_func(skill, seen_titles, limit)
                recommended_courses.extend(courses)
            except Exception as e:
                print(f"Error fetching from {provider_name} for skill '{skill}': {str(e)}")
                continue
        if len(recommended_courses) >= 15:
            break
    
    return {
        "recommended_courses": recommended_courses[:15],  # Return top 15
        "count": len(recommended_courses),
        "providers": list(set([c.get("provider", "Unknown") for c in recommended_courses]))
    }

if __name__ == '__main__':
    app.run(port=5001, debug=True)
