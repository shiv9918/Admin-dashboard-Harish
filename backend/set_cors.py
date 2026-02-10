import firebase_admin
from firebase_admin import credentials, storage
from google.cloud import storage as gcs

def set_cors():
    cred = credentials.Certificate('serviceAccountKey.json')
    
    # Try multiple bucket names manually
    names = [
        'admin-dashboard-5c0bb.firebasestorage.app',
        'admin-dashboard-5c0bb.appspot.com',
        'admin-dashboard-5c0bb'
    ]
    
    for name in names:
        try:
            print(f"Attempting bucket: {name}")
            # Use gcs client directly
            gcs_client = gcs.Client.from_service_account_json('serviceAccountKey.json')
            bucket = gcs_client.bucket(name)
            
            # Check if bucket exists
            if not bucket.exists():
                print(f"Bucket {name} does not exist.")
                continue

            bucket.cors = [
                {
                    "origin": ["*"],
                    "responseHeader": ["Content-Type", "x-goog-resumable"],
                    "method": ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
                    "maxAgeSeconds": 3600
                }
            ]
            bucket.patch()
            print(f"✅ Success updated CORS for {name}")
            return
        except Exception as e:
            print(f"Error for {name}: {e}")

if __name__ == "__main__":
    set_cors()
