const express = require('express');
const router = express.Router();
const path = require('path');
const { spawn } = require('child_process');
const authMiddleware = require('../middleware/authMiddleware');
const LORRequest = require('../models/LORRequest');
const Student = require('../models/Student');
const User = require('../models/User');

// Check if user is faculty
const isFaculty = (req, res, next) => {
  if (req.user && (req.user.role === 'faculty' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Faculty role required.' });
};

// Get AI recommendations for a student's LOR
router.get('/recommendations/:studentId', authMiddleware, isFaculty, async (req, res) => {
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

    // Use system Python instead of virtual env Python
    const pythonProcess = spawn('python', [
      path.join(__dirname, '..', '..', 'python', 'lor_recommendation_ai.py'),
      studentId
    ]);

    let result = '';
    let error = '';

    // Collect data from script
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    // Handle error
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.error(`Python Error: ${data}`);
    });

    // Handle process errors (like missing executables)
    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      return res.status(500).json({ 
        message: "Failed to start Python process. Make sure Python is installed and in your PATH.",
        error: err.message 
      });
    });

    // When the script closes
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script failed with code:', code);
        console.error('Error output:', error);
        return res.status(500).json({ message: "Python script execution failed" });
      }

      try {
        const analysisData = JSON.parse(result);
        return res.status(200).json(analysisData);
      } catch (parseError) {
        console.error("Error parsing Python script output:", parseError);
        console.error("Raw output:", result);
        return res.status(500).json({ message: "Failed to parse recommendation data" });
      }
    });

  } catch (error) {
    console.error("Error analyzing LOR recommendations:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Generate an AI-powered LOR
router.post('/generate', authMiddleware, isFaculty, async (req, res) => {
  try {
    const { studentId, purpose, university, program } = req.body;
    
    // Add placeholder deadline (1 month from now) since it's required in your schema
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 1);
    
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

    // Use system Python instead of virtual env Python
    const pythonProcess = spawn('python', [
      path.join(__dirname, '..', '..', 'python', 'lor_recommendation_ai.py'),
      studentId,
      purpose,
      university,
      program
    ]);

    let result = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.error(`Python Error: ${data}`);
    });
    
    // Handle process errors
    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      return res.status(500).json({ 
        message: "Failed to start Python process. Make sure Python is installed and in your PATH.",
        error: err.message 
      });
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script failed with code:', code);
        console.error('Error output:', error);
        return res.status(500).json({ message: "Python script execution failed" });
      }
      
      try {
        // Parse the generated LOR content
        const generatedLor = JSON.parse(result);
        
        // Create new LOR request in the database
        const createLorRequest = async () => {
          try {
            const studentUser = await User.findOne({ student: studentId });
if (!studentUser) {
  return res.status(404).json({ message: "Student user account not found" });
}
            // Create a new LOR request based on your schema
            const newLorRequest = new LORRequest({
              student: studentId,
              requestedBy: req.user._id, 
              purpose: purpose,
              university: university,
              program: program,
              deadline: deadline,
              status: "pending", // Default status from your enum
              generatedContent: generatedLor.generatedContent,
              templateUsed: generatedLor.templateUsed,
              signedBy: req.user._id, // Faculty who initiated the request
              requestedBy: req.user._id  // Should be a User ID, not a Student ID
            });
            
            const savedRequest = await newLorRequest.save();
            
            // Return the created LOR request
            return res.status(201).json({
              message: "LOR generated successfully",
              lorRequest: savedRequest
            });
          } catch (dbError) {
            console.error("Database error saving LOR:", dbError);
            return res.status(500).json({ 
              message: "Failed to save generated LOR to database", 
              error: dbError.message 
            });
          }
        };
        
        // Execute the async function to create the request
        createLorRequest();
        
      } catch (parseError) {
        console.error("Error parsing Python output:", parseError);
        console.error("Raw output:", result);
        return res.status(500).json({ message: "Failed to parse generated LOR" });
      }
    });
    
  } catch (error) {
    console.error("Error generating LOR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get recommended templates for a student
router.get('/recommended-templates/:studentId', authMiddleware, isFaculty, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }
    
    // Call Python script specifically for template recommendations
    const pythonProcess = spawn('python', [
      path.join(__dirname, '..', '..', 'python', 'lor_recommendation_ai.py'),
      studentId,
      "get_templates"
    ]);
    
    let result = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.error(`Python Error: ${data}`);
    });
    
    // Handle process errors
    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      return res.status(500).json({ 
        message: "Failed to start Python process. Make sure Python is installed and in your PATH.",
        error: err.message 
      });
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script failed with code:', code);
        console.error('Error output:', error);
        return res.status(500).json({ message: "Python script execution failed" });
      }
      
      try {
        const templates = JSON.parse(result);
        return res.status(200).json(templates);
      } catch (parseError) {
        console.error("Error parsing Python output:", parseError);
        console.error("Raw output:", result);
        return res.status(500).json({ message: "Failed to parse template recommendations" });
      }
    });
    
  } catch (error) {
    console.error("Error getting template recommendations:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;