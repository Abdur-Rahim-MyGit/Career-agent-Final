const mongoose = require('mongoose');
require('dotenv').config();

const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smaart_db');
    console.log(`✅ MongoDB Database Initialized: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️ MongoDB Warning: Could not connect. Ensure MongoDB is running and MONGO_URI is correct.`);
    console.error(error.message);
  }
};

const careerAnalysisSchema = new mongoose.Schema({
  student_name: { type: String, required: false },
  student_email: { type: String, required: false },
  primary_role: { type: String, required: false },
  input_data: { type: mongoose.Schema.Types.Mixed, required: true },
  output_data: { type: mongoose.Schema.Types.Mixed, required: true },
  profile_hash: { type: String, index: true },
  college_code: { type: String, index: true },
  zone_primary: { type: String, enum: ['Green', 'Amber', 'Red', 'Unknown'] },
  zone_secondary: { type: String, enum: ['Green', 'Amber', 'Red', 'Unknown'] },
  zone_tertiary: { type: String, enum: ['Green', 'Amber', 'Red', 'Unknown'] },
  missing_skills: [String],
  matched_skills: [String],
  skill_coverage_pct: Number,
  path_text: String,
  future_scope_text: String,
  is_synthetic: { type: Boolean, default: false },
  student_rating: { type: Number, min: 1, max: 5 },
  consent_for_training: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

const CareerAnalysisModel = mongoose.model('CareerAnalysis', careerAnalysisSchema);

module.exports = {
  connectMongoDB,
  CareerAnalysisModel,
};
