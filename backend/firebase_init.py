import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
import os

def initialize_firebase():
    """
    Initialize Firebase Admin SDK
    
    To use Firebase Admin, you need to:
    1. Download service account JSON from Firebase Console
    2. Save it as /app/backend/secrets/firebase-admin.json
    3. Restart the backend server
    
    For now, this returns None to allow the app to run without Firebase Admin.
    Firebase client SDK in frontend will work independently.
    """
    try:
        # Check for service account key in multiple locations
        # 1. Docker/Production path
        docker_path = '/app/backend/secrets/firebase-admin.json'
        # 2. Local development path (same directory as this script)
        local_path = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')
        
        service_account_path = None
        if os.path.exists(docker_path):
            service_account_path = docker_path
        elif os.path.exists(local_path):
            service_account_path = local_path
            
        if service_account_path:
            if not firebase_admin._apps:
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred, {
                    'storageBucket': os.environ.get('FIREBASE_STORAGE_BUCKET', 'admin-dashboard-5c0bb.firebasestorage.app')
                })
            print(f"✅ Firebase Admin SDK initialized using {service_account_path}")
            return firestore.client()
        else:
            print("⚠️  Firebase Admin SDK not configured. Frontend will use Firebase Client SDK.")
            print("📝 To enable backend Firebase features:")
            print(f"   1. Download service account JSON from Firebase Console")
            print(f"   2. Save as {docker_path} (for Docker) or {local_path} (local)")
            return None
    except Exception as e:
        print(f"Firebase Admin initialization error: {e}")
        return None

db = initialize_firebase()
