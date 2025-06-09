import pandas as pd
import numpy as np
import spacy
import json
import os
import sys
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables from parent directory
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

# Connect to MongoDB (using same connection as Node.js)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/lor_system")
client = MongoClient(MONGO_URI)
db = client.get_database()  # This will use the same database as your Node.js app

# Initialize NLP components
try:
    nlp = spacy.load("en_core_web_md")
except:
    print("Error: Spacy model 'en_core_web_md' not found. Run: python -m spacy download en_core_web_md", file=sys.stderr)
    sys.exit(1)

class LORRecommendationAI:
    def __init__(self):
        self.template_collection = db["lortemplates"]
        self.student_collection = db["students"]
        self.internship_collection = db["internships"]
        self.placement_collection = db["placements"]
        
        # Load or create similarity model for template matching
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self._load_templates()
    
    def _load_templates(self):
        """Load all LOR templates and prepare for matching"""
        templates = list(self.template_collection.find())
        
        if not templates:
            print("Warning: No templates found in database", file=sys.stderr)
            self.templates = []
            self.template_vectors = None
            return
            
        self.templates = templates
        
        # Create content vector for similarity matching
        template_texts = [str(t.get("content", "")) for t in templates]
        self.template_vectors = self.vectorizer.fit_transform(template_texts)
    
    def analyze_student(self, student_id):
        """Analyze student data and determine strengths"""
        # Convert string ID to ObjectId if needed
        if isinstance(student_id, str):
            try:
                student_id_obj = ObjectId(student_id)
            except:
                return {"error": "Invalid student ID format"}
        else:
            student_id_obj = student_id
        
        # Get student data
        student = self.student_collection.find_one({"_id": student_id_obj})
        if not student:
            return {"error": "Student not found"}
        
        # Get student internships
        internships = list(self.internship_collection.find({"studentId": student_id}))
        
        # Get student placements
        placements = list(self.placement_collection.find({"studentId": student_id}))
        
        # Analyze student data to determine strengths
        strengths = []
        
        # Academic strength
        if "cgpa" in student and student["cgpa"]:
            try:
                cgpa = float(student["cgpa"])
                if cgpa >= 8.0:
                    strengths.append("academic")
            except:
                # Handle case where cgpa might not be a valid number
                pass
            
        # Technical strength
        if "skills" in student and isinstance(student["skills"], list) and len(student["skills"]) >= 3:
            strengths.append("technical")
            
        # Practical experience
        if internships and len(internships) > 0:
            strengths.append("practical")
            
        # Professional achievement
        if placements and len(placements) > 0:
            strengths.append("professional")
            
        # Leadership/soft skills (analyze achievements)
        if "achievements" in student and isinstance(student["achievements"], list) and student["achievements"]:
            achievement_text = " ".join(student["achievements"])
            leadership_keywords = ["lead", "organiz", "head", "volunteer", "president", 
                                  "chair", "captain", "manage", "direct"]
                                  
            if any(keyword in achievement_text.lower() for keyword in leadership_keywords):
                strengths.append("leadership")
        
        # Determine primary field of study/interest
        primary_field = self._determine_primary_field(student, internships)
        
        return {
            "studentName": student.get("name", ""),
            "strengths": strengths,
            "primaryField": primary_field,
            "recommendations": self._generate_recommendations(strengths, student)
        }
    
    def _determine_primary_field(self, student, internships):
        """Determine the student's primary field based on skills and internships"""
        # Define field keywords
        field_keywords = {
            "web development": ["html", "css", "javascript", "react", "angular", "node", "web"],
            "data science": ["python", "r", "statistics", "machine learning", "data", "analysis"],
            "software engineering": ["java", "c++", "software", "development", "oop"],
            "ai/ml": ["machine learning", "ai", "artificial intelligence", "deep learning", "neural"],
            "cybersecurity": ["security", "cyber", "encryption", "network security"],
            "mobile development": ["android", "ios", "swift", "kotlin", "mobile"],
            "cloud computing": ["aws", "azure", "cloud", "docker", "kubernetes"]
        }
        
        # Count matches for each field
        field_scores = {field: 0 for field in field_keywords}
        
        # Check skills
        if "skills" in student and isinstance(student["skills"], list):
            skills_text = " ".join(student["skills"]).lower()
            
            for field, keywords in field_keywords.items():
                for keyword in keywords:
                    if keyword in skills_text:
                        field_scores[field] += 1
        
        # Check internships
        if internships:
            for internship in internships:
                position = internship.get("position", "").lower()
                company = internship.get("company", "").lower()
                internship_text = f"{position} {company}"
                
                for field, keywords in field_keywords.items():
                    for keyword in keywords:
                        if keyword in internship_text:
                            field_scores[field] += 2  # Weight internships more heavily
        
        # Get field with highest score
        max_score = max(field_scores.values()) if field_scores else 0
        if max_score > 0:
            # Get the field with the highest score
            primary_field = max(field_scores, key=field_scores.get)
        else:
            # Default to student's department or a generic field
            department = student.get("department", "")
            if isinstance(department, dict) and "name" in department:
                primary_field = department["name"]
            else:
                primary_field = "engineering"
            
        return primary_field
    
    def _generate_recommendations(self, strengths, student):
        """Generate specific LOR recommendations based on student strengths"""
        recommendations = []
        
        if "academic" in strengths:
            recommendations.append({
                "area": "Academic Excellence",
                "suggestion": f"Emphasize the student's academic performance with CGPA of {student.get('cgpa', 'N/A')}",
                "templateType": "Academic Focused"
            })
            
        if "technical" in strengths:
            skills = student.get("skills", [])
            if skills:
                top_skills = ", ".join(skills[:3])
                recommendations.append({
                    "area": "Technical Skills",
                    "suggestion": f"Highlight proficiency in {top_skills}",
                    "templateType": "Technical Expertise"
                })
            else:
                recommendations.append({
                    "area": "Technical Skills",
                    "suggestion": "Highlight technical skills and proficiency",
                    "templateType": "Technical Expertise"
                })
            
        if "leadership" in strengths:
            recommendations.append({
                "area": "Leadership",
                "suggestion": "Focus on leadership qualities and soft skills demonstrated through activities",
                "templateType": "Character & Leadership"
            })
            
        if "practical" in strengths:
            recommendations.append({
                "area": "Practical Experience",
                "suggestion": "Emphasize internship experience and practical application of skills",
                "templateType": "Industry Readiness"
            })
            
        if "professional" in strengths:
            recommendations.append({
                "area": "Professional Achievement",
                "suggestion": "Highlight placement success and industry recognition",
                "templateType": "Professional Achievement"
            })
            
        return recommendations
    
    def find_best_template(self, student_id, purpose):
        """Find the most appropriate LOR template based on student profile and purpose"""
        student_analysis = self.analyze_student(student_id)
        
        if "error" in student_analysis:
            return {"error": student_analysis["error"]}
            
        if not self.templates:
            return {"error": "No templates available"}
            
        # Create a query document combining student strengths and purpose
        query_text = f"{student_analysis['primaryField']} {purpose} "
        
        # Add strengths to query
        for strength in student_analysis["strengths"]:
            query_text += f" {strength}"
            
        # Vectorize the query
        query_vector = self.vectorizer.transform([query_text])
        
        # Calculate similarity with all templates
        similarities = cosine_similarity(query_vector, self.template_vectors).flatten()
        
        # Get the best matching template
        best_match_idx = similarities.argmax()
        best_template = self.templates[best_match_idx]
        
        return {
            "template": best_template,
            "similarity_score": float(similarities[best_match_idx]),
            "student_analysis": student_analysis
        }
    
    def generate_lor_content(self, student_id, template_id=None, purpose="", university="", program=""):
        """Generate tailored LOR content based on student data and selected template"""
        # Convert string ID to ObjectId if needed
        if isinstance(student_id, str):
            try:
                student_id_obj = ObjectId(student_id)
            except:
                return {"error": "Invalid student ID format"}
        else:
            student_id_obj = student_id
            
        # Get student data
        student = self.student_collection.find_one({"_id": student_id_obj})
        if not student:
            return {"error": "Student not found"}
        
        # Get student internships
        internships = list(self.internship_collection.find({"studentId": student_id}))
        
        # Find best template if not provided
        if not template_id:
            template_result = self.find_best_template(student_id, purpose)
            if "error" in template_result:
                return template_result
            template = template_result["template"]
        else:
            # Convert template_id to ObjectId if needed
            if isinstance(template_id, str):
                try:
                    template_id_obj = ObjectId(template_id)
                except:
                    return {"error": "Invalid template ID format"}
            else:
                template_id_obj = template_id
                
            template = self.template_collection.find_one({"_id": template_id_obj})
            if not template:
                return {"error": "Template not found"}
        
        # Prepare student data for template filling
        department_name = "Engineering"
        if "department" in student:
            if isinstance(student["department"], dict) and "name" in student["department"]:
                department_name = student["department"]["name"]
            elif isinstance(student["department"], str):
                department_name = student["department"]
        
        student_data = {
            "name": student.get("name", ""),
            "rollNo": student.get("rollNo", ""),
            "department": department_name,
            "cgpa": student.get("cgpa", ""),
            "skills": student.get("skills", []),
            "achievements": student.get("achievements", []),
            "internships": [{
                "company": i.get("company", ""),
                "position": i.get("position", ""),
                "duration": i.get("duration", "")
            } for i in internships],
            "purpose": purpose,
            "university": university,
            "program": program
        }
        
        # Fill template with student data
        content = template["content"]
        
        # Replace basic student data
        content = content.replace("{{name}}", student_data["name"])
        content = content.replace("{{rollNo}}", str(student_data["rollNo"]))
        content = content.replace("{{department}}", student_data["department"])
        content = content.replace("{{cgpa}}", str(student_data["cgpa"]))
        content = content.replace("{{university}}", university)
        content = content.replace("{{program}}", program)
        content = content.replace("{{purpose}}", purpose)
        
        # Replace arrays (skills, achievements)
        if student_data["skills"]:
            content = content.replace("{{skills}}", ", ".join(student_data["skills"]))
        else:
            content = content.replace("{{skills}}", "various technical skills")
            
        if student_data["achievements"]:
            content = content.replace("{{achievements}}", ", ".join(student_data["achievements"]))
        else:
            content = content.replace("{{achievements}}", "academic achievements")
            
        # Handle internships
        if student_data["internships"]:
            internship_text = ", ".join([f"{i['position']} at {i['company']}" for i in student_data["internships"]])
            content = content.replace("{{internships}}", internship_text)
        else:
            content = content.replace("{{internships}}", "academic projects")
            
        # Generate strengths paragraph if needed
        if "{{strengths}}" in content:
            # Get student strengths
            analysis = self.analyze_student(student_id)
            strengths = analysis.get("strengths", [])
            
            strengths_paragraph = ""
            
            if "academic" in strengths:
                strengths_paragraph += f"{student_data['name']} has demonstrated exceptional academic abilities, maintaining a CGPA of {student_data['cgpa']}. "
            
            if "technical" in strengths:
                top_skills = ", ".join(student_data["skills"][:3]) if student_data["skills"] else "technical subjects"
                strengths_paragraph += f"Their technical proficiency in {top_skills} is particularly noteworthy. "
            
            if "leadership" in strengths:
                strengths_paragraph += "They have displayed excellent leadership qualities through their involvement in various activities. "
            
            if "practical" in strengths:
                strengths_paragraph += "Their practical experience through internships has prepared them well for further studies and professional challenges. "
                
            content = content.replace("{{strengths}}", strengths_paragraph)
            
        return {
            "generatedContent": content,
            "templateUsed": str(template["_id"]),
            "studentName": student_data["name"]
        }

# Command-line interface
def main():
    if len(sys.argv) < 2:
        print("Usage: python lor_recommendation_ai.py <student_id> [purpose] [university] [program]")
        sys.exit(1)
        
    student_id = sys.argv[1]
    
    # Check if we're just getting templates
    if len(sys.argv) > 2 and sys.argv[2] == "get_templates":
        recommender = LORRecommendationAI()
        templates = recommender.template_collection.find()
        # Convert ObjectId to string for JSON serialization
        template_list = []
        for t in templates:
            t["_id"] = str(t["_id"])
            template_list.append(t)
        print(json.dumps(template_list))
        sys.exit(0)
        
    purpose = sys.argv[2] if len(sys.argv) > 2 else "Graduate School"
    university = sys.argv[3] if len(sys.argv) > 3 else "Stanford University"
    program = sys.argv[4] if len(sys.argv) > 4 else "MS in Computer Science"
    
    recommender = LORRecommendationAI()
    
    # Check if enough arguments for LOR generation
    if len(sys.argv) > 2:
        # Generate LOR content
        lor = recommender.generate_lor_content(student_id, None, purpose, university, program)
        print(json.dumps(lor))
    else:
        # Just analyze student
        analysis = recommender.analyze_student(student_id)
        print(json.dumps(analysis))

if __name__ == "__main__":
    main()