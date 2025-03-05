import json
import os
from dotenv import load_dotenv
import pymysql
import pymysql.cursors

# Load environment variables
load_dotenv()


def get_db_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", ""),
        cursorclass=pymysql.cursors.DictCursor
    )

def format_key_considerations(considerations, rankings, explanations):
    """Format key considerations with rankings and explanations"""
    # Convert the new format to the old format
    # First, convert considerations dict to list of selected items
    selected_considerations = [
        {"id": key, "name": get_consideration_name(key)}
        for key, value in considerations.items()
        if value == True
    ]

    # Convert rankings dict to list format
    rankings_list = [
        {"id": key, "name": get_consideration_name(key), "value": int(value)}
        for key, value in rankings.items()
    ]

    # Sort considerations by their ranking
    sorted_considerations = sorted(rankings_list, key=lambda x: x['value'])

    # Format the considerations with explanations
    formatted_text = ""
    for consideration in sorted_considerations:
        explanation = explanations.get(consideration['id'], "")
        formatted_text += f"{consideration['value']}. {consideration['name']}: {explanation}\n"

    return formatted_text

def get_consideration_name(key):
    """Helper function to map keys to their display names"""
    consideration_names = {
        "fees": "School Fees",
        "location": "Location",
        "intern_opp": "Internship Opportunities",
        "stress": "Stress Level",
        "career_opp": "Career Opportunities",
        "school_env": "School Environment",
        "extracurricular": "CCA/Interest Groups"
    }
    return consideration_names.get(key, key)

def generate_prompt(student_id=None):
    """Generate a prompt based on the student's responses"""
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    # Get the most recent entry if no ID is specified
    if student_id is None:
        query = "SELECT * FROM student_responses ORDER BY submission_date DESC LIMIT 1"
        cursor.execute(query)
    else:
        query = "SELECT * FROM student_responses WHERE id = %s"
        cursor.execute(query, (student_id,))
    
    student_data = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not student_data:
        return "No student data found."
    
    # Parse JSON fields
    considerations = json.loads(student_data['considerations'])
    rankings = json.loads(student_data['rankings'])
    explanations = json.loads(student_data['explanations'])
    
    # Determine school (placeholder, you might want to collect this in your form)
    school = "Singapore Secondary School"  # Default value
    
    # Format key considerations
    key_considerations_text = format_key_considerations(considerations, rankings, explanations)
    
    # Create prompt
    prompt = f"""I am a student from {school} seeking guidance on my future educational and career paths. Here is my profile:

    Interests: {student_data['interests']}
    Strengths/skills: {student_data['strengths']}
    Academic Scores (L1R5): {student_data['l1r5_score']}
    Learning Preferences: {student_data['learning_style']}
    Education Focus: {student_data['education_focus']}

    In order of importance, these are the key considerations I have in deciding my path.
    {key_considerations_text}

    Based on information above, please provide me with 3 personalized recommendations for suitable Junior Colleges (JC) or Polytechnics (Poly). For each recommended institution, include:

        Name of the Institution
        Reasons why studying in this institution aligns with my preferences

    Present the recommendations in a structured format to facilitate easy comparison and understanding. Feel free to add a concluding sentence comparing the institutions.
    """
    
    return prompt


    


