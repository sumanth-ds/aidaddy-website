import sys
import os
import json

# Add parent directories to path to import modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

# Import the Flask app from backend/app.py
from backend.app import app

def handler(event, context):
    """
    Netlify serverless function handler for Flask app
    """
    try:
        # Convert Netlify event to WSGI environ
        from werkzeug.wrappers import Response
        from io import BytesIO
        
        # Get the path from the event
        path = event.get('path', '/')
        
        # Remove the Netlify functions prefix
        if path.startswith('/.netlify/functions/api'):
            path = path.replace('/.netlify/functions/api', '')
        
        # Ensure path starts with /
        if not path:
            path = '/'
        elif not path.startswith('/'):
            path = '/' + path
        
        # Get request body
        body = event.get('body', '')
        if event.get('isBase64Encoded', False) and body:
            import base64
            body = base64.b64decode(body)
        elif isinstance(body, str):
            body = body.encode('utf-8')
        elif body is None:
            body = b''
        
        # Build the environ dict
        environ = {
            'REQUEST_METHOD': event.get('httpMethod', 'GET'),
            'SCRIPT_NAME': '',
            'PATH_INFO': path,
            'QUERY_STRING': event.get('rawQuery', '') or '',
            'CONTENT_TYPE': event.get('headers', {}).get('content-type', 'application/json'),
            'CONTENT_LENGTH': str(len(body)),
            'SERVER_NAME': event.get('headers', {}).get('host', 'localhost').split(':')[0],
            'SERVER_PORT': '443',
            'SERVER_PROTOCOL': 'HTTP/1.1',
            'wsgi.version': (1, 0),
            'wsgi.url_scheme': 'https',
            'wsgi.input': BytesIO(body),
            'wsgi.errors': sys.stderr,
            'wsgi.multithread': False,
            'wsgi.multiprocess': False,
            'wsgi.run_once': False,
        }
        
        # Add headers (normalize header names)
        for key, value in event.get('headers', {}).items():
            key_upper = key.upper().replace('-', '_')
            if key_upper not in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
                environ[f'HTTP_{key_upper}'] = value
        
        # Call the Flask app
        response = Response.from_app(app, environ)
        
        # Get response headers as dict
        response_headers = {}
        for key, value in response.headers:
            response_headers[key] = value
        
        # Ensure CORS headers are present
        origin = event.get('headers', {}).get('origin', '')
        if origin:
            response_headers['Access-Control-Allow-Origin'] = origin
            response_headers['Access-Control-Allow-Credentials'] = 'true'
            response_headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response_headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        
        # Convert Flask response to Netlify response
        return {
            'statusCode': response.status_code,
            'headers': response_headers,
            'body': response.get_data(as_text=True)
        }
    
    except Exception as e:
        # Log error and return 500
        print(f"Error in Netlify function: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'error': 'Internal server error', 'details': str(e)})
        }
