// controllers/lorController.js
const LORRequest = require("../models/LORRequest");
const LORTemplate = require("../models/LORTemplate");
const User = require("../models/User");
const Student = require("../models/Student");
const Internship = require("../models/Internship");
const { generatePDF } = require("../utils/pdfGenerator");
const path = require("path");
const fs = require("fs");

// Generate LOR content for a request
exports.generateLOR = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { templateId } = req.body;

    // Authorization check
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Get LOR request
    const lorRequest = await LORRequest.findById(requestId)
      .populate({
        path: 'student',
        populate: { path: 'department' }
      });

    if (!lorRequest) {
      return res.status(404).json({ message: "LOR request not found" });
    }

    // Get template
    const template = await LORTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Get additional student data
    const student = await Student.findById(lorRequest.student);
    
    // Get student's internships
    const internships = await Internship.find({ studentId: lorRequest.student });

    // Prepare data for template filling
    const studentData = {
      name: student.name,
      rollNo: student.rollNo,
      department: student.department?.name || "N/A",
      cgpa: student.cgpa || "N/A",
      skills: student.skills?.join(", ") || "N/A",
      achievements: student.achievements?.join(", ") || "N/A",
      internships: internships.map(i => `${i.position} at ${i.company}`).join(", ") || "N/A",
      university: lorRequest.university,
      program: lorRequest.program,
      purpose: lorRequest.purpose,
      facultyName: req.user.name,
      facultyDepartment: req.user.department || "N/A",
      date: new Date().toLocaleDateString(),
    };

    // Generate LOR content by replacing placeholders
    let content = template.content;
    Object.entries(studentData).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    // Update LOR request with generated content
    lorRequest.generatedContent = content;
    lorRequest.templateUsed = template._id;
    lorRequest.status = "approved";
    lorRequest.signedBy = req.user.id;
    await lorRequest.save();

    res.json({ 
      message: "LOR generated successfully", 
      lorRequest: {
        ...lorRequest.toObject(),
        generatedContent: content
      }
    });
  } catch (error) {
    console.error("LOR Generation Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create PDF and save it
exports.createPDF = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Authorization check
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ message: "Not authorized" });
    }

    const lorRequest = await LORRequest.findById(requestId)
      .populate('student', 'name rollNo')
      .populate('signedBy', 'name');

    if (!lorRequest) {
      return res.status(404).json({ message: "LOR request not found" });
    }

    if (!lorRequest.generatedContent) {
      return res.status(400).json({ message: "LOR content not generated yet" });
    }

    // Create directory if not exists
    const dir = './uploads/lors';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `LOR_${lorRequest.student.rollNo}_${Date.now()}.pdf`;
    const filepath = path.join(dir, filename);
    
    // Generate PDF
    await generatePDF({
      content: lorRequest.generatedContent,
      outputPath: filepath,
      studentName: lorRequest.student.name,
      university: lorRequest.university,
      signedBy: lorRequest.signedBy.name,
      date: new Date().toLocaleDateString()
    });

    // Update LOR request with PDF path
    lorRequest.finalPDF = filepath;
    lorRequest.status = "completed";
    await lorRequest.save();

    res.json({ 
      message: "PDF generated successfully", 
      pdfPath: `/uploads/lors/${filename}` 
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};