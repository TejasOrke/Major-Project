// utils/pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generatePDF = async (options) => {
  return new Promise((resolve, reject) => {
    try {
      const { content, outputPath, studentName, university, signedBy, date } = options;

      // Create a PDF document
      const doc = new PDFDocument({
        margins: { top: 50, bottom: 50, left: 72, right: 72 },
        size: 'A4'
      });

      // Pipe output to file
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Add college/university header
      doc.image(path.join(__dirname, '../assets/logo.png'), {
        fit: [100, 100],
        align: 'center'
      });

      doc.moveDown();
      doc.fontSize(16).font('Helvetica-Bold').text('LETTER OF RECOMMENDATION', { align: 'center' });
      doc.moveDown(2);

      // Add date to top right
      doc.fontSize(10).font('Helvetica').text(date, { align: 'right' });
      doc.moveDown();

      // Add recipient (university)
      doc.fontSize(10).font('Helvetica-Bold').text(`To: Admissions Office`, { continued: true });
      doc.font('Helvetica').text(`, ${university}`);
      doc.moveDown(2);

      // Add subject line
      doc.fontSize(10).font('Helvetica-Bold').text(`Subject: Letter of Recommendation for ${studentName}`);
      doc.moveDown(2);

      // Add content
      doc.fontSize(10).font('Helvetica').text(content, {
        align: 'justify',
        lineGap: 5
      });
      doc.moveDown(3);

      // Add signature
      doc.fontSize(10).font('Helvetica-Bold').text('Sincerely,');
      doc.moveDown();
      doc.image(path.join(__dirname, '../assets/signature.png'), {
        width: 150
      });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica-Bold').text(signedBy);
      doc.fontSize(10).font('Helvetica').text('Faculty Member');
      doc.fontSize(10).font('Helvetica').text('College of Engineering');
      
      // Add footer with page number
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        
        // Footer line
        doc.lineWidth(0.5)
           .moveTo(72, doc.page.height - 50)
           .lineTo(doc.page.width - 72, doc.page.height - 50)
           .stroke();
        
        doc.fontSize(8).text(
          'This document is official and confidential',
          72,
          doc.page.height - 40,
          { align: 'center', width: doc.page.width - 144 }
        );
      }

      // Finalize the PDF
      doc.end();

      stream.on('finish', () => {
        resolve(outputPath);
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};