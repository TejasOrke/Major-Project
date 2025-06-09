// controllers/lorTemplateController.js
const LORTemplate = require("../models/LORTemplate");

// Get all templates
exports.getAllTemplates = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ message: "Not authorized" });
    }

    const templates = await LORTemplate.find({
      $or: [
        { createdBy: req.user.id }, // User's own templates
        { isDefault: true } // Default templates
      ]
    }).populate('createdBy', 'name email');

    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create new template
exports.createTemplate = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, content, isDefault } = req.body;

    // Only admins can create default templates
    if (isDefault && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can create default templates" });
    }

    const template = new LORTemplate({
      title,
      content,
      createdBy: req.user.id,
      isDefault: isDefault || false
    });

    await template.save();
    res.status(201).json({ message: "Template created successfully", template });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update template
exports.updateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { title, content, isDefault } = req.body;

    const template = await LORTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Check ownership or admin role
    if (template.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to modify this template" });
    }

    // Only admins can set templates as default
    if (isDefault !== undefined && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can change default status" });
    }

    const updates = { title, content };
    if (req.user.role === 'admin' && isDefault !== undefined) {
      updates.isDefault = isDefault;
    }

    const updatedTemplate = await LORTemplate.findByIdAndUpdate(
      templateId,
      { $set: updates },
      { new: true }
    );

    res.json({ message: "Template updated successfully", template: updatedTemplate });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    const template = await LORTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Check ownership or admin role
    if (template.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to delete this template" });
    }

    await LORTemplate.findByIdAndDelete(templateId);
    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};