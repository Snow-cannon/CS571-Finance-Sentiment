import subprocess
import os
import requests
import re

# Ensure /usr/bin is in the PATH
# os.environ["PATH"] += os.pathsep + "/usr/bin"


def connect_nordvpn(country='United_States'):
    # Connect to a server in a specific country
    result = subprocess.run(["nordvpn", "connect", country], capture_output=True, text=True)
    # print(result.stdout)
    if result.returncode != 0:
        print("Error connecting:", result.stderr)

def disconnect_nordvpn():
    # result = subprocess.run(["nordvpn", "disconnect"], capture_output=True, text=True)
    result = subprocess.run(['nordvpn', 'd'], capture_output=True, shell=True)
    # print(result.stdout)
    if result.returncode != 0:
        print("Error disconnecting:", result.stderr)

# # Example usage
# connect_nordvpn('United_States')
# # Do your proxy requests here...

# save as alpha_vantage_keygen.py


LOG_FILE = "alpha_vantage_keys.log"
BASE_EMAIL = "sbabel+av{}@umass.edu"
BASE_SUFFIX = 5  # Starting suffix, change if needed
CSRF_TOKEN = 'SzU67QH4QixIv3z7GhRmbe3UWRTq2805'
REFERER = 'https://www.alphavantage.co/support/'


def get_last_email_index():
    if not os.path.exists(LOG_FILE):
        return BASE_SUFFIX

    with open(LOG_FILE, 'r') as f:
        lines = f.readlines()

    for line in reversed(lines):
        match = re.search(r'sbabel\+av(\d+)@umass\.edu', line)
        if match:
            return int(match.group(1))
    return BASE_SUFFIX


def generate_api_key():
    index = get_last_email_index() + 1
    while True:
        email = BASE_EMAIL.format(index)

        headers = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-CSRFToken': CSRF_TOKEN,
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': REFERER,
            'Cookie': f'csrftoken={CSRF_TOKEN}',
        }

        data = {
            'first_text': 'deprecated',
            'last_text': 'deprecated',
            'occupation_text': 'Student',
            'organization_text': 'University of Massachusetts',
            'email_text': email,
        }

        response = requests.post('https://www.alphavantage.co/create_post/', headers=headers, data=data)

        if not response.ok:
            print(f"Request failed for {email}: {response.status_code}")
            return None

        json_response = response.json()
        print(f"Response for {email}:", json_response)

        if 'Redundant origin' in json_response.get('text', ''):
            print(f"Redundant origin for {email}, trying next index...")
            index += 1
            continue

        match = re.search(r'API key (?:is|:)\s*([A-Z0-9]+)', json_response.get('text', ''))
        if match:
            api_key = match.group(1)
            log_entry = f"Email: {email}, API Key: {api_key}\n"
            with open(LOG_FILE, 'a') as f:
                f.write(log_entry)
            print("API Key generated and logged:", api_key)
            return api_key
        else:
            print("API key not found in response.")
            return None
