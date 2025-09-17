const mongoose = require("mongoose");
const Student = require("../models/Student");
const LORRequest = require("../models/LORRequest");
const LORTemplate = require("../models/LORTemplate");
// CHANGE services -> Service to match your actual folder name
const { buildLORPrompt, generateLetterWithGemini } = require("../Service/geminiService");
// ...existing code...

/**
 * Analyze student profile and return simple heuristic recommendations
 */
exports.analyzeLORRecommendations = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) return res.status(400).json({ message: "Student ID is required" });
    if (!mongoose.Types.ObjectId.isValid(studentId)) return res.status(400).json({ message: "Invalid student ID" });

  console.log('[AI LOR][Analyze] Request for student', studentId);
  // Simple find (no populate) because Student schema uses primitive fields / embedded docs
  const student = await Student.findById(studentId).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Normalize collections similar to analyze route
    student.internships = Array.isArray(student.internships) ? student.internships : (student.internships ? [student.internships] : []);
    student.placements = student.placements || student.placement ? (student.placements || [student.placement].filter(Boolean)) : [];

    // Normalize internships array
    const internships = Array.isArray(student.internships) ? student.internships : (student.internships ? [student.internships] : []);
    // Student schema uses single 'placement' object, adapt to expected placements array
    const placements = student.placements || student.placement ? (student.placements || [student.placement].filter(Boolean)) : [];
    // Attach normalized fields for prompt usage
    student.internships = internships;
    student.placements = placements;

    const recs = [];
    if ((student.cgpa || 0) >= 8) {
      recs.push({
        area: "Academic Strength",
        suggestion: "Highlight consistent academic excellence and intellectual curiosity.",
        templateType: "academic_excellence"
      });
    }
    if ((student.internships || []).length > 0) {
      recs.push({
        area: "Applied Experience",
        suggestion: "Emphasize real-world problem solving and internship achievements.",
        templateType: "technical_skills"
      });
    }
    if ((student.placements || []).length > 0) {
      recs.push({
        area: "Industry Readiness",
        suggestion: "Mention placement success and professional preparedness.",
        templateType: "industry_readiness"
      });
    }
    if (recs.length === 0) {
      recs.push({
        area: "General Profile",
        suggestion: "Focus on character, reliability, adaptability and eagerness to learn.",
        templateType: "general"
      });
    }

    return res.status(200).json({ analysis: { recommendations: recs } });
  } catch (e) {
    return res.status(500).json({ message: "Analysis failed", error: e.message });
  }
};

/**
 * Diagnostic endpoint (optional)
 */
exports.testStudentData = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }
    const student = await Student.findById(studentId).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });
    return res.status(200).json({
      message: "Test OK",
      result: { testResult: true, fields: Object.keys(student) },
      debug: "Gemini integration active"
    });
  } catch (e) {
    return res.status(500).json({ message: "Test failed", error: e.message });
  }
};

/**
 * Generate Smart LOR via Gemini
 * Body: { studentId, purpose, university, program, save(optional bool), templateId(optional) }
 */
exports.generateSmartLOR = async (req, res) => {
  try {
    const { studentId, purpose, university, program, save = false, templateId = null } = req.body;

    if (!studentId || !purpose || !university || !program) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

  // Removed populate calls (department/internships/placements not defined as refs in Student schema)
  const student = await Student.findById(studentId).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });

    let templateText = null;
    let templateUsed = null;

    if (templateId && mongoose.Types.ObjectId.isValid(templateId)) {
      const tpl = await LORTemplate.findById(templateId).lean();
      if (tpl) {
        templateText = tpl.content;
        templateUsed = tpl.title;
      }
    } else {
      const defaultTpl = await LORTemplate.findOne({ isDefault: true }).lean();
      if (defaultTpl) {
        templateText = defaultTpl.content;
        templateUsed = defaultTpl.title;
      }
    }

    const prompt = buildLORPrompt(student, { purpose, university, program }, templateText);

    let generatedContent;
    let modelUsed = null;
    let attempts = 0;
    let apiErrors = [];
    try {
      console.log('[AI LOR] Prompt length chars:', prompt.length);
      const result = await generateLetterWithGemini(prompt);
      generatedContent = result.text;
      modelUsed = result.modelUsed;
      attempts = result.attempts;
      apiErrors = result.errors;
      console.log('[AI LOR] Generation success model=%s attempts=%d length=%d', modelUsed, attempts, generatedContent.length);
    } catch (apiErr) {
      console.error("[AI LOR] Gemini API error:", apiErr.meta || apiErr);
      apiErrors = apiErr.meta?.errors || [{ message: apiErr.message }];
      if (apiErr.meta?.breaker) {
        apiErrors.push({ breaker: apiErr.meta.breaker });
      }
      generatedContent = `To Whom It May Concern,

I am pleased to recommend ${student.name} for ${program} at ${university}. ${student.name} has demonstrated commitment, adaptability and potential. (Fallback letter used because AI service was temporarily unavailable.)

Sincerely,
Faculty`;
      modelUsed = 'fallback';
    }

    const payload = {
      message: save ? "LOR generated & saved" : "LOR generated successfully",
      generatedContent,
      templateUsed: templateUsed || null,
      metadata: {
        studentName: student.name,
        university,
        program,
        purpose,
        generationDate: new Date().toISOString(),
        source: modelUsed === 'fallback' ? 'fallback' : 'gemini',
        modelUsed,
        attempts,
  apiErrors
      }
    };

    if (save) {
      console.log('[AI LOR] Saving LOR draft to database');
      const lorDoc = new LORRequest({
        student: studentId,
        requestedBy: req.user ? req.user._id : undefined,
        purpose,
        university,
        program,
        status: "draft",
        generatedContent,
        templateUsed: templateUsed || null
      });
      await lorDoc.save();
      console.log('[AI LOR] Saved LOR draft with id', lorDoc._id.toString());
      return res.status(201).json({ ...payload, lorRequest: lorDoc });
    }

    return res.status(200).json(payload);
  } catch (e) {
    const debugId = Date.now().toString(36);
    console.error(`[AI LOR] Generation failure ${debugId}`, e);
    const fallback = {
      message: "LOR generated with fallback (AI temporarily unavailable)",
      generatedContent: `To Whom It May Concern,\n\nI am pleased to recommend (Fallback Letter). The AI service was temporarily unavailable.\n\nSincerely,\nFaculty`,
      templateUsed: null,
      metadata: { debugId, source: 'fallback', generationDate: new Date().toISOString() }
    };
    return res.status(200).json(fallback);
  }
};

/**
 * Get recommended templates (no Python). Heuristic filtering.
 * Query params: ?limit=5
 */
exports.getRecommendedTemplates = async (req, res) => {
  try {
    const { studentId } = req.params;
    const limit = parseInt(req.query.limit || "5", 10);

    if (!studentId) return res.status(400).json({ message: "Student ID is required" });
    if (!mongoose.Types.ObjectId.isValid(studentId)) return res.status(400).json({ message: "Invalid student ID" });

  const student = await Student.findById(studentId).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Base templates
    const templates = await LORTemplate.find().lean();

    // Simple scoring
    const scored = templates.map(t => {
      let score = 0;
      if (t.title.toLowerCase().includes("academic") && (student.cgpa || 0) >= 8) score += 3;
      if (t.title.toLowerCase().includes("technical") && (student.internships || []).length > 0) score += 2;
      if (t.title.toLowerCase().includes("industry") && (student.placements || []).length > 0) score += 2;
      if (t.isDefault) score += 1;
      return { ...t, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return res.status(200).json({
      templates: scored.slice(0, limit).map(t => ({
        _id: t._id,
        title: t.title,
        preview: t.content.substring(0, 160) + (t.content.length > 160 ? "..." : ""),
        isDefault: t.isDefault,
        score: t.score
      }))
    });
  } catch (e) {
    return res.status(500).json({ message: "Failed to get templates", error: e.message });
  }
};