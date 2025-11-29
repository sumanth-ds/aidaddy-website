import requests

import os
from dotenv import load_dotenv
load_dotenv('backend/.env')
load_dotenv('.env')

BASE_URL = os.getenv('BACKEND_URL') or os.getenv('VITE_API_BASE_URL')
if not BASE_URL:
    raise RuntimeError('BACKEND_URL or VITE_API_BASE_URL environment variable must be set to run this test script')

def test_email(to=None):
    payload = {}
    if to:
        payload['to'] = to
    resp = requests.post(f"{BASE_URL}/debug/email-test", json=payload)
    print(resp.status_code, resp.text)

if __name__ == '__main__':
    # Optional: pass recipient as environment or just use default
    import sys
    email = sys.argv[1] if len(sys.argv) > 1 else None
    test_email(email)
