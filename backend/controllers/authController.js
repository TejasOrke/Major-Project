const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const LORRequest = require("../models/LORRequest");

// User Registration (Admin Only)
exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email, password: hashedPassword, role });

        await user.save();
        res.json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// User Login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, role: user.role });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Admin: Add Student
exports.addStudent = async (req, res) => {
    try {
        const { name, email, rollNumber, department } = req.body;
        
        // Check if admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        let student = await User.findOne({ email });
        if (student) {
            return res.status(400).json({ message: "Student already exists" });
        }

        // Generate a random password that student can change later
        const defaultPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        student = new User({
            name,
            email,
            password: hashedPassword,
            role: 'student',
            rollNumber,
            department
        });

        await student.save();

        res.json({ 
            message: "Student added successfully",
            defaultPassword // In production, send this via email
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Admin: Remove Student
exports.removeStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Check if admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        const student = await User.findOneAndDelete({ 
            _id: studentId,
            role: 'student'
        });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json({ message: "Student removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Admin: Update Student Details
exports.updateStudentDetails = async (req, res) => {
    try {
        const { studentId } = req.params;
        const updates = req.body;

        // Check if admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Prevent role update through this endpoint
        delete updates.role;
        delete updates.password;

        const student = await User.findOneAndUpdate(
            { _id: studentId, role: 'student' },
            { $set: updates },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json({ message: "Student details updated successfully", student });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Admin: Get All Students
exports.getAllStudents = async (req, res) => {
    try {
        // Check if admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        const students = await User.find({ role: 'student' })
            .select('-password'); // Exclude password from response

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Admin: Add LOR Request
exports.addLORRequest = async (req, res) => {
    try {
        const { studentId, purpose, university, program, deadline } = req.body;
        
        // Check if admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        const student = await User.findOne({ _id: studentId, role: 'student' });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const lorRequest = new LORRequest({
            student: studentId,
            purpose,
            university,
            program,
            deadline,
            status: 'pending'
        });

        await lorRequest.save();
        res.json({ message: "LOR request added successfully", lorRequest });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Admin: Update LOR Status
exports.updateLORStatus = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, remarks } = req.body;

        // Check if admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        const lorRequest = await LORRequest.findByIdAndUpdate(
            requestId,
            { 
                $set: { 
                    status,
                    remarks,
                    updatedAt: Date.now()
                }
            },
            { new: true }
        );

        if (!lorRequest) {
            return res.status(404).json({ message: "LOR request not found" });
        }

        res.json({ message: "LOR status updated successfully", lorRequest });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Admin: Get All LOR Requests
exports.getAllLORRequests = async (req, res) => {
    try {
        // Check if admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        const lorRequests = await LORRequest.find()
            .populate('student', 'name email rollNumber')
            .sort({ createdAt: -1 });

        res.json(lorRequests);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Admin: Delete LOR Request
exports.deleteLORRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        // Check if admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        const lorRequest = await LORRequest.findByIdAndDelete(requestId);

        if (!lorRequest) {
            return res.status(404).json({ message: "LOR request not found" });
        }

        res.json({ message: "LOR request deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};