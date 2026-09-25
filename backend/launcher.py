import os
import sys
import subprocess
import time
import webbrowser

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
manage_py = os.path.join(BASE_DIR, "manage.py")

process = subprocess.Popen(
    [sys.executable, manage_py, "runserver", "0.0.0.0:8000", "--noreload"],
    cwd=BASE_DIR
)

time.sleep(5)

webbrowser.open("http://127.0.0.1:8000/")

try:
    process.wait()
except KeyboardInterrupt:
    process.terminate()