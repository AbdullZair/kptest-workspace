"""
HIS (Hospital Information System) Mock Server
Simulates HIS API for development and testing.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import hashlib

app = Flask(__name__)
CORS(app)

# Mock patient database
MOCK_PATIENTS = {
    "12345678901": {  # PESEL
        "cart_number": "CART001",
        "first_name": "Jan",
        "last_name": "Kowalski",
        "date_of_birth": "1980-01-15",
        "gender": "MALE",
        "his_patient_id": "HIS-12345"
    },
    "98765432109": {
        "cart_number": "CART002",
        "first_name": "Anna",
        "last_name": "Nowak",
        "date_of_birth": "1990-05-20",
        "gender": "FEMALE",
        "his_patient_id": "HIS-67890"
    },
    "11111111111": {
        "cart_number": "CART003",
        "first_name": "Piotr",
        "last_name": "Wiśniewski",
        "date_of_birth": "1975-03-10",
        "gender": "MALE",
        "his_patient_id": "HIS-11111"
    }
}

# API Key for authentication
VALID_API_KEYS = ["dev-api-key", "test-api-key", "prod-api-key-12345"]


def verify_api_key():
    """Verify API key from request header."""
    api_key = request.headers.get('X-API-Key', '')
    return api_key in VALID_API_KEYS


@app.route('/api/v1/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "UP",
        "service": "his-mock",
        "timestamp": datetime.utcnow().isoformat()
    })


@app.route('/api/v1/patients/verify', methods=['POST'])
def verify_patient():
    """
    Verify patient identity and retrieve basic demographic data.
    
    Request:
    {
        "pesel": "12345678901",
        "cart_number": "CART001"
    }
    
    Response (success):
    {
        "verified": true,
        "patient": {
            "pesel": "12345678901",
            "first_name": "Jan",
            "last_name": "Kowalski",
            "date_of_birth": "1980-01-15",
            "gender": "MALE",
            "his_patient_id": "HIS-12345"
        }
    }
    
    Response (not found):
    {
        "verified": false,
        "error": "Patient not found"
    }
    """
    if not verify_api_key():
        return jsonify({"error": "Invalid API key"}), 401
    
    data = request.get_json()
    pesel = data.get('pesel', '')
    cart_number = data.get('cart_number', '')
    
    # Log the verification attempt
    app.logger.info(f"HIS verification request - PESEL: {pesel}, Cart: {cart_number}")
    
    # Find patient
    patient = MOCK_PATIENTS.get(pesel)
    
    if not patient:
        return jsonify({
            "verified": False,
            "error": "Patient not found"
        }), 404
    
    if patient["cart_number"] != cart_number:
        return jsonify({
            "verified": False,
            "error": "Cart number does not match"
        }), 400
    
    return jsonify({
        "verified": True,
        "patient": {
            "pesel": patient["pesel"],
            "first_name": patient["first_name"],
            "last_name": patient["last_name"],
            "date_of_birth": patient["date_of_birth"],
            "gender": patient["gender"],
            "his_patient_id": patient["his_patient_id"]
        }
    })


@app.route('/api/v1/patients/<pesel>', methods=['GET'])
def get_patient(pesel):
    """
    Get patient demographic data by PESEL.
    """
    if not verify_api_key():
        return jsonify({"error": "Invalid API key"}), 401
    
    patient = MOCK_PATIENTS.get(pesel)
    
    if not patient:
        return jsonify({
            "error": "Patient not found"
        }), 404
    
    return jsonify({
        "pesel": patient["pesel"],
        "first_name": patient["first_name"],
        "last_name": patient["last_name"],
        "date_of_birth": patient["date_of_birth"],
        "gender": patient["gender"],
        "his_patient_id": patient["his_patient_id"]
    })


@app.route('/api/v1/patients/exists', methods=['GET'])
def patient_exists():
    """
    Check if patient exists by PESEL and cart number.
    """
    if not verify_api_key():
        return jsonify({"error": "Invalid API key"}), 401
    
    pesel = request.args.get('pesel', '')
    cart_number = request.args.get('cart_number', '')
    
    patient = MOCK_PATIENTS.get(pesel)
    exists = patient is not None and patient["cart_number"] == cart_number
    
    return jsonify({
        "exists": exists,
        "pesel": pesel
    })


@app.route('/api/v1/statistics', methods=['GET'])
def statistics():
    """
    Get mock statistics.
    """
    if not verify_api_key():
        return jsonify({"error": "Invalid API key"}), 401
    
    return jsonify({
        "total_patients": len(MOCK_PATIENTS),
        "last_updated": datetime.utcnow().isoformat()
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081, debug=True)
