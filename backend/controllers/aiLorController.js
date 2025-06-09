const Student = require("../models/Student");
const User = require("../models/User");
const Internship = require("../models/Internship");
const LORTemplate = require("../models/LORTemplate");
const LORRequest = require("../models/LORRequest");
const axios = require("axios");
const mongoose = require("mongoose");

// Analyze student data and generate custom LOR
exports.generateSmartLOR = async (req, res) => {
  try {
    const { studentId, purpose, university, program } = req.body;

    if (!studentId || !purpose || !university || !program) {
      return res.status(400).json({ 
        message: "Missing required fields: studentId, purpose, university, program" 
      });
    }

    // Get student data
    const student = await Student.findById(studentId)
      .populate("department")
      .populate("user", "name email");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get student's internships
    const internships = await Internship.find({ studentId });

    // Get student's course data, achievements, etc.
    const studentData = {
      name: student.name,
      rollNo: student.rollNo,
      department: student.department?.name || "Engineering",
      cgpa: student.cgpa || "N/A",
      skills: student.skills || [],
      achievements: student.achievements || [],
      internships: internships.map(i => ({
        company: i.company,
        position: i.position,
        duration: i.duration
      })),
      purpose,
      university,
      program
    };

    // Select the appropriate template based on student data and purpose
    let template = await selectBestTemplate(studentData);
    
    if (!template) {
      // Use default template if no matching template found
      template = await LORTemplate.findOne({ isDefault: true });
      
      if (!template) {
        return res.status(404).json({ message: "No suitable template found" });
      }
    }

    // Generate LOR content by filling in the template with student data
    const lorContent = generateLORContent(template.content, studentData, req.user);

    // Create a new LOR request with the generated content
    const lorRequest = new LORRequest({
      student: studentId,
      generatedBy: req.user._id,
      status: "approved",
      purpose,
      university,
      program,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      generatedContent: lorContent,
      templateUsed: template._id,
      signedBy: req.user._id
    });

    await lorRequest.save();

    res.status(201).json({
      message: "LOR generated successfully",
      lorRequest
    });

  } catch (error) {
    console.error("Error in smart LOR generation:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Analyze student skills and coursework to recommend LOR approach
exports.analyzeLORRecommendations = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const student = await Student.findById(studentId)
      .populate("department")
      .populate("user", "name email");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get student's internships
    const internships = await Internship.find({ studentId });

    // Analyze student strengths based on available data
    const strengths = determineStudentStrengths(student, internships);
    
    // Generate recommendations for LOR content
    const recommendations = generateRecommendations(strengths, student);

    res.json({
      studentName: student.name,
      recommendations,
      strengths
    });

  } catch (error) {
    console.error("Error analyzing LOR recommendations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper functions

// Select the best template based on student data and purpose
async function selectBestTemplate(studentData) {
  // Determine the student's primary field/focus based on skills, internships, etc.
  const field = determinePrimaryField(studentData);
  
  // Logic to find the most appropriate template
  // Priority: 1) Matching field, 2) Matching purpose, 3) Default
  const templates = await LORTemplate.find({});
  
  // Find templates with matching keywords in title or content
  const matchingTemplates = templates.filter(template => {
    // Check for field keywords in template
    const hasFieldMatch = template.title.toLowerCase().includes(field.toLowerCase()) || 
                          template.content.toLowerCase().includes(field.toLowerCase());
                          
    // Check for purpose keywords in template
    const hasPurposeMatch = template.title.toLowerCase().includes(studentData.purpose.toLowerCase()) || 
                            template.content.toLowerCase().includes(studentData.purpose.toLowerCase());
    
    // Match university type (if mentioned in template)
    const hasUniversityMatch = template.content.toLowerCase().includes(studentData.university.toLowerCase());
    
    return hasFieldMatch || hasPurposeMatch || hasUniversityMatch;
  });

  // Score each template based on how well it matches
  const scoredTemplates = matchingTemplates.map(template => {
    let score = 0;
    
    // Score based on field match
    if (template.title.toLowerCase().includes(field.toLowerCase())) score += 3;
    if (template.content.toLowerCase().includes(field.toLowerCase())) score += 2;
    
    // Score based on purpose match
    if (template.title.toLowerCase().includes(studentData.purpose.toLowerCase())) score += 3;
    if (template.content.toLowerCase().includes(studentData.purpose.toLowerCase())) score += 2;
    
    // Score based on program type match
    if (template.content.toLowerCase().includes(studentData.program.toLowerCase())) score += 2;
    
    return { template, score };
  });
  
  // Sort templates by score (highest first)
  scoredTemplates.sort((a, b) => b.score - a.score);
  
  // Return the highest scored template, if any
  return scoredTemplates.length > 0 ? scoredTemplates[0].template : null;
}

// Generate LOR content from template and student data
function generateLORContent(templateContent, studentData, faculty) {
  let content = templateContent;

  // Replace basic student data
  content = content.replace(/{{name}}/g, studentData.name);
  content = content.replace(/{{rollNo}}/g, studentData.rollNo);
  content = content.replace(/{{department}}/g, studentData.department);
  content = content.replace(/{{cgpa}}/g, studentData.cgpa);
  content = content.replace(/{{university}}/g, studentData.university);
  content = content.replace(/{{program}}/g, studentData.program);
  content = content.replace(/{{purpose}}/g, studentData.purpose);
  
  // Replace faculty data
  content = content.replace(/{{facultyName}}/g, faculty.name);
  content = content.replace(/{{facultyDepartment}}/g, faculty.department || "Engineering");
  content = content.replace(/{{date}}/g, new Date().toLocaleDateString());

  // Handle arrays (skills, achievements)
  if (studentData.skills && studentData.skills.length > 0) {
    content = content.replace(/{{skills}}/g, studentData.skills.join(", "));
  } else {
    content = content.replace(/{{skills}}/g, "various technical skills");
  }

  if (studentData.achievements && studentData.achievements.length > 0) {
    content = content.replace(/{{achievements}}/g, studentData.achievements.join(", "));
  } else {
    content = content.replace(/{{achievements}}/g, "academic achievements");
  }

  // Handle internships
  if (studentData.internships && studentData.internships.length > 0) {
    const internshipText = studentData.internships
      .map(i => `${i.position} at ${i.company}`)
      .join(", ");
    content = content.replace(/{{internships}}/g, internshipText);
  } else {
    content = content.replace(/{{internships}}/g, "academic projects");
  }

  // Generate intelligent highlights based on student data
  let strengths = determineStudentStrengths({
    cgpa: studentData.cgpa,
    skills: studentData.skills,
    achievements: studentData.achievements
  }, studentData.internships);

  // Add dynamic paragraph highlighting student strengths if {{strengths}} placeholder exists
  if (content.includes("{{strengths}}")) {
    let strengthsParagraph = "";
    
    if (strengths.includes("academic")) {
      strengthsParagraph += `${studentData.name} has demonstrated exceptional academic abilities, maintaining a CGPA of ${studentData.cgpa}. `;
    }
    
    if (strengths.includes("technical")) {
      strengthsParagraph += `Their technical proficiency in ${studentData.skills.slice(0, 3).join(", ")} is particularly noteworthy. `;
    }
    
    if (strengths.includes("leadership")) {
      strengthsParagraph += `They have displayed excellent leadership qualities through their involvement in various activities. `;
    }
    
    if (strengths.includes("practical")) {
      strengthsParagraph += `Their practical experience through internships has prepared them well for further studies and professional challenges. `;
    }
    
    content = content.replace(/{{strengths}}/g, strengthsParagraph);
  }

  return content;
}

// Determine primary field of study/expertise based on student data
function determinePrimaryField(studentData) {
  // Start with department
  let field = studentData.department;

  // Check skills for more specific field indicators
  const skillKeywords = {
    "web development": ["html", "css", "javascript", "react", "angular", "node", "web"],
    "data science": ["python", "r", "statistics", "machine learning", "data", "analysis"],
    "software engineering": ["java", "c++", "software", "development", "oop"],
    "ai/ml": ["machine learning", "ai", "artificial intelligence", "deep learning", "neural"],
    "cybersecurity": ["security", "cyber", "encryption", "network security"],
    "mobile development": ["android", "ios", "swift", "kotlin", "mobile"],
    "cloud computing": ["aws", "azure", "cloud", "docker", "kubernetes"]
  };

  // Count keyword occurrences
  const fieldCounts = {};
  for (const [fieldName, keywords] of Object.entries(skillKeywords)) {
    fieldCounts[fieldName] = 0;
    
    // Check skills
    if (studentData.skills && studentData.skills.length > 0) {
      for (const skill of studentData.skills) {
        for (const keyword of keywords) {
          if (skill.toLowerCase().includes(keyword)) {
            fieldCounts[fieldName]++;
            break;
          }
        }
      }
    }
    
    // Check internship positions
    if (studentData.internships && studentData.internships.length > 0) {
      for (const internship of studentData.internships) {
        for (const keyword of keywords) {
          if (internship.position.toLowerCase().includes(keyword)) {
            fieldCounts[fieldName] += 2; // Weight internships more heavily
            break;
          }
        }
      }
    }
  }

  // Find field with highest count
  let maxCount = 0;
  let primaryField = field; // Default to department
  
  for (const [fieldName, count] of Object.entries(fieldCounts)) {
    if (count > maxCount) {
      maxCount = count;
      primaryField = fieldName;
    }
  }

  return primaryField;
}

// Determine student's key strengths for LOR focus
function determineStudentStrengths(student, internships) {
  const strengths = [];

  // Academic strength
  if (student.cgpa && parseFloat(student.cgpa) >= 8.0) {
    strengths.push("academic");
  }

  // Technical strength (based on skills)
  if (student.skills && student.skills.length >= 3) {
    strengths.push("technical");
  }

  // Leadership/soft skills
  if (student.achievements && student.achievements.some(ach => 
    ach.toLowerCase().includes("lead") || 
    ach.toLowerCase().includes("organiz") || 
    ach.toLowerCase().includes("head") ||
    ach.toLowerCase().includes("volunteer") ||
    ach.toLowerCase().includes("coordin"))) {
    strengths.push("leadership");
  }

  // Practical experience
  if (internships && internships.length > 0) {
    strengths.push("practical");
  }

  return strengths;
}

// Generate specific recommendations based on strengths
function generateRecommendations(strengths, student) {
  const recommendations = [];

  if (strengths.includes("academic")) {
    recommendations.push({
      area: "Academic Excellence",
      suggestion: `Emphasize the student's academic performance with CGPA of ${student.cgpa}`,
      templateType: "Academic Focused"
    });
  }

  if (strengths.includes("technical")) {
    recommendations.push({
      area: "Technical Skills",
      suggestion: `Highlight proficiency in ${student.skills.slice(0, 3).join(", ")}`,
      templateType: "Technical Expertise"
    });
  }

  if (strengths.includes("leadership")) {
    recommendations.push({
      area: "Leadership",
      suggestion: "Focus on leadership qualities and soft skills demonstrated through activities",
      templateType: "Character & Leadership"
    });
  }

  if (strengths.includes("practical")) {
    recommendations.push({
      area: "Practical Experience",
      suggestion: "Emphasize internship experience and practical application of skills",
      templateType: "Industry Readiness"
    });
  }

  return recommendations;
}

module.exports = exports;