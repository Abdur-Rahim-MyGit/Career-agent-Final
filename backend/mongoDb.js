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
  created_at: { type: Date, default: Date.now }
});

const CareerAnalysisModel = mongoose.model('CareerAnalysis', careerAnalysisSchema);

module.exports = {
  connectMongoDB,
  CareerAnalysisModel,
};
