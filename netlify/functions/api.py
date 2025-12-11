from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add parent directories to path to import modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'api'))

# Import the Flask app from api/app.py
from api.app import app

def handler(event, context):
    """
    Netlify serverless function handler for Flask app
    """
    # Convert Netlify event to WSGI environ
    from werkzeug.wrappers import Request, Response
    from io import BytesIO
    
    # Get the path from the event
    path = event.get('path', '/')
    if path.startswith('/.netlify/functions/api'):
        path = path.replace('/.netlify/functions/api', '')
    
    # Build the environ dict
    environ = {
        'REQUEST_METHOD': event.get('httpMethod', 'GET'),
        'SCRIPT_NAME': '',
        'PATH_INFO': path,
        'QUERY_STRING': event.get('rawQuery', ''),
        'CONTENT_TYPE': event.get('headers', {}).get('content-type', ''),
        'CONTENT_LENGTH': str(len(event.get('body', ''))),
        'SERVER_NAME': event.get('headers', {}).get('host', 'localhost').split(':')[0],
        'SERVER_PORT': '443',
        'SERVER_PROTOCOL': 'HTTP/1.1',
        'wsgi.version': (1, 0),
        'wsgi.url_scheme': 'https',
        'wsgi.input': BytesIO(event.get('body', '').encode('utf-8') if isinstance(event.get('body', ''), str) else event.get('body', b'')),
        'wsgi.errors': sys.stderr,
        'wsgi.multithread': False,
        'wsgi.multiprocess': False,
        'wsgi.run_once': False,
    }
    
    # Add headers
    for key, value in event.get('headers', {}).items():
        key = key.upper().replace('-', '_')
        if key not in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
            environ[f'HTTP_{key}'] = value
    
    # Call the Flask app
    response = Response.from_app(app, environ)
    
    # Convert Flask response to Netlify response
    return {
        'statusCode': response.status_code,
        'headers': dict(response.headers),
        'body': response.get_data(as_text=True)
    }
