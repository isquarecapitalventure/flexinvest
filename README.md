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

# 'main' refers to the file, 'app' to the FastAPI instance
it will be running on a local port (e.g., localhost:5000 or 127.0.0.1:8000). 




