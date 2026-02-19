import os
import firebase_admin
from firebase_admin import credentials, auth
from .config import settings

if os.path.exists("/etc/secrets/firebase-adminsdk.json"):
    firebase_creds_path = "/etc/secrets/firebase-adminsdk.json"
else:
    firebase_creds_path = settings.firebase_cred_path

def initialize_firebase():
    if not firebase_admin._apps:
        if os.path.exists(firebase_creds_path) and firebase_creds_path:
            cred = credentials.Certificate(firebase_creds_path)
            firebase_admin.initialize_app(cred)
        else:
            print("WARNING: Firebase credentials not found. Authentication will be mocked.")