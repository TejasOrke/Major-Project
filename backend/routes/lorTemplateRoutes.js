// routes/lorTemplateRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const lorTemplateController = require('../controllers/lorTemplateController');

// Template routes
router.get('/', authMiddleware, lorTemplateController.getAllTemplates);
router.post('/', authMiddleware, lorTemplateController.createTemplate);
router.put('/:templateId', authMiddleware, lorTemplateController.updateTemplate);
router.delete('/:templateId', authMiddleware, lorTemplateController.deleteTemplate);

module.exports = router;

// Add to lorRoutes.js (existing file)
const lorController = require('../controllers/lorController');

// LOR Generation routes
router.post('/:requestId/generate', authMiddleware, lorController.generateLOR);
router.post('/:requestId/create-pdf', authMiddleware, lorController.createPDF);