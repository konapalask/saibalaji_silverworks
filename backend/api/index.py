import sys
import os

# Add the parent directory (backend) to the Python path so app modules can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

# Export ASGI application for Vercel
app = app
