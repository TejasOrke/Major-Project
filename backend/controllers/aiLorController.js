const { spawn } = require('child_process');
const path = require('path');
const Student = require("../models/Student");
const LORRequest = require("../models/LORRequest");
const mongoose = require("mongoose");

exports.analyzeLORRecommendations = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const pythonProcess = spawn('python', [
      path.join(__dirname, '../../python/lor_recommendation_ai.py'),
      studentId
    ]);

    let result = '';

    // Collect data from script
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    // Handle error
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });

    // When the script closes
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ message: "Python script execution failed" });
      }

      try {
        const analysisData = JSON.parse(result);
        return res.status(200).json(analysisData);
      } catch (error) {
        console.error("Error parsing Python script output:", error);
        return res.status(500).json({ message: "Failed to parse recommendation data" });
      }
    });

  } catch (error) {
    console.error("Error analyzing LOR recommendations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.generateSmartLOR = async (req, res) => {
  try {
    const { studentId, purpose, university, program } = req.body;

    if (!studentId || !purpose || !university || !program) {
      return res.status(400).json({ 
        message: "Missing required fields: studentId, purpose, university, program" 
      });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const pythonProcess = spawn('python', [
      path.join(__dirname, '../../python/lor_recommendation_ai.py'),
      studentId,
      purpose,
      university,
      program
    ]);

    let result = '';

    // Collect data from script
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    // Handle error
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });

    // When the script closes
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ message: "Python script execution failed" });
      }

      try {
        // Extract the generated LOR content
        const analysisData = JSON.parse(result);
        
        // Create a new LOR request in the database
        const createLorRequest = async () => {
          try {
            const newLorRequest = new LORRequest({
              student: studentId,
             requestedBy: req.user._id, 
              purpose,
              university,
              program,
              status: "draft", // Set as draft initially
              generatedContent: analysisData.generatedContent,
              templateUsed: analysisData.templateUsed || null
            });
            
            await newLorRequest.save();
            
            return res.status(201).json({
              message: "LOR generated successfully",
              lorRequest: newLorRequest
            });
          } catch (dbError) {
            console.error("Database error saving LOR:", dbError);
            return res.status(500).json({ message: "Failed to save generated LOR to database" });
          }
        };
        
        createLorRequest();
        
      } catch (error) {
        console.error("Error parsing Python script output:", error);
        return res.status(500).json({ message: "Failed to parse generated LOR" });
      }
    });
    

  } catch (error) {
    console.error("Error in smart LOR generation:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Optional: Add a function to get pre-trained templates based on student profile
exports.getRecommendedTemplates = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }
    
    // Call Python script specifically for template recommendations
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../../python/lor_recommendation_ai.py'),
      studentId,
      "get_templates"
    ]);
    
    // Rest of implementation similar to other functions...
    let result = '';
    
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ message: "Python script execution failed" });
      }
      
      try {
        const templates = JSON.parse(result);
        return res.status(200).json(templates);
      } catch (error) {
        console.error("Error parsing Python output:", error);
        return res.status(500).json({ message: "Failed to parse template recommendations" });
      }
    });
    
  } catch (error) {
    console.error("Error getting template recommendations:", error);
    res.status(500).json({ message: "Server error" });
  }
};