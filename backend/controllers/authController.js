const jwt = require("jsonwebtoken");
const User = require("../models/User");
const LORRequest = require("../models/LORRequest");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const PendingUser = require("../models/PendingUser"); // Assuming model path

const ADMIN_EMAIL = "vedantonkar27@gmail.com";

// Configure the mail transporter using a fixed admin email
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { 
        user: ADMIN_EMAIL,  // Admin email as sender
        pass: process.env.ADMIN_PASS // App password (not email password)
    }
});

// Request Registration - User requests access
exports.requestRegistration = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        let existingRequest = await PendingUser.findOne({ email });
        if (existingRequest) {
            return res.status(400).json({ message: "Request already submitted" });
        }

        await new PendingUser({ email }).save();

        // Admin approval links
        const approveLink = `http://localhost:3000/approve-user?email=${encodeURIComponent(email)}`;
        const rejectLink = `http://localhost:3000/reject-user?email=${encodeURIComponent(email)}`;

        const emailHtml = `
            <p>A new user has requested access: <strong>${email}</strong></p>
            <p>Click below to approve or reject:</p>
            <a href="${approveLink}" style="display:inline-block;padding:10px;background:green;color:white;text-decoration:none;border-radius:5px;margin-right:10px;">Approve</a>
            <a href="${rejectLink}" style="display:inline-block;padding:10px;background:red;color:white;text-decoration:none;border-radius:5px;">Reject</a>
        `;

        // Send email to the Admin
        await transporter.sendMail({
            from: ADMIN_EMAIL,
            to: ADMIN_EMAIL, // Admin receives the request
            subject: "New Registration Request",
            html: emailHtml
        });

        res.json({ message: "Request submitted. Admin will review your request." });

    } catch (error) {
        console.error("Request Registration Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Approve User - Admin approves the registration
exports.approveUser = async (req, res) => {
    const { email } = req.query; // Extract email from query parameters

    try {
        // Check if the email exists in the pending users collection
        const pendingUser = await PendingUser.findOne({ email });
        if (!pendingUser) {
            return res.status(400).json({ message: "No pending request found for this email." });
        }

        // Generate random user details
        const name = email.split("@")[0]; // Use the part before '@' as the name
        const password = Math.random().toString(36).slice(-8); // Generate a random password
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

        // Create a new user in the database
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: "faculty", // Assign the role as 'faculty'
        });
        await newUser.save();

        // Remove the user from the pending users collection
        // await PendingUser.deleteOne({ email });

        // Send login credentials to the user via email
        await transporter.sendMail({
            from: ADMIN_EMAIL,
            to: `${email}`
,
            subject: "Your Account Details",
            text: `Your account has been approved.\n\nLogin details:\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after logging in.`,
        });

        await PendingUser.deleteOne({ email });
        // Notify the admin about the approval
        await transporter.sendMail({
            from: ADMIN_EMAIL,
            to: ADMIN_USER,
            subject: "User Approved",
            text: `The user with email ${email} has been approved.`,
        });

        // Respond with a success message
        res.json({ message: "User approved successfully and credentials sent." });
    } catch (error) {
        console.error("Approve User Error:", error);
        res.status(500).json({ message: "Server error occurred while approving the user." });
    }
};

// Reject User - Admin rejects the registration
exports.rejectUser = async (req, res) => {
    const { email } = req.query;

    try {
        const pendingUser = await PendingUser.findOne({ email });
        if (!pendingUser) {
            return res.status(404).send("No pending request found");
        }

        // Remove from pending users list
        await PendingUser.deleteOne({ email });

        // Notify user about rejection
        await transporter.sendMail({
            from: ADMIN_EMAIL, // Use the admin email to send
            to: email,
            subject: "Registration Request Rejected",
            text: "Your request to register has been rejected by the admin."
        });

        // Notify admin about the rejection
        await transporter.sendMail({
            from: ADMIN_EMAIL,
            to: ADMIN_EMAIL,
            subject: "User Request Rejected",
            text: `The user with email ${email} has been rejected.`
        });

        res.send("User request rejected.");

    } catch (error) {
        console.error("Reject User Error:", error);
        res.status(500).send("Server error");
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
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
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