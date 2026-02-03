# Here are your Instructions

cd path/to/your/project-folder
python3 -m venv venv

# or on Windows: python -m venv venv

source venv/bin/activate

# for macox/linux

.\venv\Scripts\activate

# for windows

pip install -r requirements.txt

# Install Project Dependencies

python your_script_name.py

# or on some systems: python3 your_script_name.py

Run the Backend Application
For a FastAPI application:
uvicorn main:app --reload
uvicorn server:app --reload
uvicorn server:app --reload

# 'main' refers to the file, 'app' to the FastAPI instance

it will be running on a local port (e.g., localhost:5000 or 127.0.0.1:8000).

# tips

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python server.py

## PYTHON FAST API ON PRODUCTION

**What We’ll Build**

## We’ll deploy a FastAPI app so that:

    It runs behind gunicorn + uvicorn workers
    It’s managed by systemd (auto-start on reboot, restart on crash)
    It’s served via nginx as a reverse proxy
    It’s protected with HTTPS using Let’s Encrypt
    It uses environment variables for secrets (no hardcoded tokens)
    It’s easy to update with a simple git pull + restart

## I’ll assume:

    You’re using Ubuntu 20.04+ on your VPS
    You have SSH access
    You have a domain pointing to the VPS IP (optional but recommended)

For more details [visit guide](https://dev.to/lasisi_ibrahimpelumi_dc0/running-fastapi-in-production-on-a-vps-step-by-step-5e4d)
