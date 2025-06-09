const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import the LORTemplate model
const LORTemplate = require('../models/LORTemplate');

// Mock admin user ID (replace with a real admin ID from your database)
const adminUserId = new mongoose.Types.ObjectId("680ccf32e6f61cfe2fd5581a"); // Replace with real ID

// Define sample LOR templates - adjusted to match your schema
const lorTemplates = [
  {
    title: "Academic Excellence Template",
    content: `To Whom It May Concern,

I am writing this letter to recommend {{name}}, a student in the {{department}} department, for the {{program}} at {{university}}.

During my time working with {{name}}, I have been consistently impressed by their academic performance. With a CGPA of {{cgpa}}, they rank among the top students in their class. {{name}} has demonstrated exceptional knowledge in {{skills}} and has completed several challenging assignments with remarkable competence.

{{strengths}}

In addition to their academic achievements, {{name}} has been involved in extracurricular activities including {{achievements}}. They have also gained practical experience through {{internships}}.

I believe {{name}} has the intellectual capability, academic preparation, and personal qualities to excel in your program. I strongly recommend {{name}} for admission to your institution.

Sincerely,
[Faculty Name]
[Department]`,
    createdBy: adminUserId,
    isDefault: true
  },
  {
    title: "Technical Skills Template",
    content: `Dear Admissions Committee,

I am pleased to recommend {{name}} for the {{program}} program at {{university}}.

As a student in the {{department}} department, {{name}} has demonstrated exceptional technical proficiency in {{skills}}. I have personally observed their strong analytical abilities and problem-solving skills in various technical challenges.

{{name}} has successfully completed several complex technical projects, including work in {{internships}}. Their ability to apply theoretical knowledge to practical situations is particularly noteworthy.

{{strengths}}

With a CGPA of {{cgpa}}, {{name}} has consistently performed well in technically demanding courses. They have also achieved recognition through {{achievements}}.

Based on their technical abilities and academic performance, I am confident that {{name}} will make valuable contributions to your program. I highly recommend them for admission.

Regards,
[Faculty Name]
[Department]`,
    createdBy: adminUserId,
    isDefault: true
  },
  {
    title: "Leadership & Character Template",
    content: `Dear Selection Committee,

I am writing to recommend {{name}}, a {{department}} student, for the {{program}} at {{university}}.

Beyond academic achievements, {{name}} has demonstrated exceptional leadership qualities and character. They have been actively involved in {{achievements}} where their ability to lead and inspire others has been evident.

With a solid academic foundation (CGPA: {{cgpa}}) and proficiency in {{skills}}, {{name}} combines intellectual capability with outstanding interpersonal skills.

{{strengths}}

Their experience in {{internships}} has further developed their professional capabilities and given them practical insights in their field.

{{name}}'s integrity, initiative, and ability to work effectively with diverse teams make them an excellent candidate for your program. I give them my highest recommendation.

Sincerely,
[Faculty Name]
[Department]`,
    createdBy: adminUserId,
    isDefault: true
  },
  {
    title: "Research Potential Template",
    content: `Dear Admissions Committee,

I am writing to strongly recommend {{name}} for the {{program}} at {{university}}.

As a student in the {{department}} department with a CGPA of {{cgpa}}, {{name}} has demonstrated exceptional research potential and analytical thinking. Their work in courses related to {{skills}} has been particularly impressive.

{{strengths}}

{{name}} has been involved in research projects and has shown the ability to formulate research questions, design methodologies, and analyze data effectively. Their contributions to {{achievements}} highlight their commitment to academic inquiry.

Their experience in {{internships}} has provided them with practical experience that complements their theoretical knowledge.

I believe {{name}} has the intellectual curiosity, research skills, and academic foundation necessary to excel in your research-oriented program. I highly recommend them for admission.

Respectfully,
[Faculty Name]
[Department]`,
    createdBy: adminUserId,
    isDefault: true
  },
  {
    title: "Industry Readiness Template",
    content: `To Whom It May Concern,

I am pleased to recommend {{name}} for the {{program}} at {{university}}.

As a student in the {{department}} department, {{name}} has developed a strong foundation of industry-relevant skills, particularly in {{skills}}. With a CGPA of {{cgpa}}, they have demonstrated academic excellence while focusing on practical applications.

Their experience in {{internships}} has given them valuable industry exposure and the ability to apply classroom knowledge to real-world challenges.

{{strengths}}

{{name}} has also distinguished themselves through {{achievements}}, further demonstrating their commitment to professional growth.

Their combination of technical knowledge, practical experience, and professional attributes makes them well-prepared for industry challenges. I am confident they will excel in your program and subsequent professional endeavors.

Sincerely,
[Faculty Name]
[Department]`,
    createdBy: adminUserId,
    isDefault: true
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB. Seeding LOR templates...');
    return seedTemplates();
  })
  .then(() => {
    console.log('LOR Templates seeded successfully!');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error seeding LOR templates:', err);
    mongoose.connection.close();
  });

// Function to seed the templates
async function seedTemplates() {
  try {
    // Check if templates already exist
    const count = await LORTemplate.countDocuments();
    
    if (count > 0) {
      console.log(`${count} templates already exist. Skipping seed.`);
      return;
    }
    
    // Insert the templates
    await LORTemplate.insertMany(lorTemplates);
    console.log(`${lorTemplates.length} templates inserted.`);
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}