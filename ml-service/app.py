from flask import Flask, request, jsonify
from flask_cors import CORS
from resume_parser import extract_skills_from_text
import xgboost as xgb
import numpy as np

app = Flask(__name__)
CORS(app)

# Dummy XGBoost model for "Predictive Student Success Matching"
# In a real scenario, this would be trained on historical placements
class MockStudentSuccessModel:
    def predict_proba(self, student_features):
        # Return a mock probability based on the sum of features
        # Assuming features are [num_skills_matched, gpa_proxy, market_demand_proxy]
        score = sum(student_features) / 30.0
        return np.clip(score, 0.1, 0.95)

mock_xgb = MockStudentSuccessModel()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "smaart-ml"}), 200

@app.route('/parse-resume', methods=['POST'])
def parse_resume_endpoint():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({"error": "Missing 'text' in payload"}), 400
        
    text = data['text']
    try:
        skills = extract_skills_from_text(text)
        return jsonify({
            "status": "success",
            "extracted_skills": skills
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict-success', methods=['POST'])
def predict_success_endpoint():
    data = request.json
    if not data or 'features' not in data:
        return jsonify({"error": "Missing 'features' list in payload"}), 400
        
    features = data['features']
    try:
        # Expected format: [skill_match_count, degree_relevance_score, market_demand_score]
        if len(features) != 3:
            return jsonify({"error": "Features must exactly be length 3"}), 400
            
        prob = mock_xgb.predict_proba(features)
        return jsonify({
            "status": "success",
            "success_probability": round(float(prob), 4)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run Flask directly
    app.run(host='0.0.0.0', port=5001, debug=True)
