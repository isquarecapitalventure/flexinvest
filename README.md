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

```sh
source venv/bin/activate

pip install --upgrade pip

pip install fastapi uvicorn[standard] gunicorn

gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8091 --workers 3

cd opt/fastapiapp

gunicorn -k uvicorn.workers.UvicornWorker server:app --bind 0.0.0.0:8091 --workers 3

gunicorn -w 4 -b 0.0.0.0:8000 --timeout 120 server:app

pip install -r requirements.txt

pip install fastapi uvicorn[standard]


source venv/bin/activate
pip install "fastapi[standard]"
 pip install fastapi uvicorn
pip show fastapi
uvicorn server:app --reload
python server.py
uvicorn app.main:app --reload
python -m venv venv
uvicorn server:app --reload
python server.py
gunicorn -w 4 -b 0.0.0.0:8091 --timeout 120 server:app
pip install uvicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker server:app --bind 0.0.0.0:8091

```

Updating Your App (Deploying New Versions)

When you change your code on GitHub, deploy updates like this:

ssh root@YOUR_SERVER_IP
cd /opt/fastapiapp
git pull
source venv/bin/activate
pip install -r requirements.txt if using one
systemctl restart fastapi | kill -HUP $(pgrep gunicorn) | Status

pip install uvicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker server:app --bind 0.0.0.0:8000
uvicorn server:app --reload

---

#!/bin/bash
git pull origin main
source venv/bin/activate
pip install -r requirements.txt

# Kill the old gunicorn process

pkill -f gunicorn

# Start it back up in the background (using nohup so it stays alive)

nohup gunicorn -w 4 -k uvicorn.workers.UvicornWorker server:app --bind 0.0.0.0:8091 > output.log 2>&1 &


_____________________
gunicorn -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8091 --timeout 120 server:app


uvicorn server:app --host 0.0.0.0 --port 8000 --reload