import os
import re
import requests

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
        # pattern = r'API key\s*(?:is:|:)\s*([A-Z0-9]+)'
        pattern = r'key\s*(?:is:|:)\s*([A-Z0-9]+)'
        match = re.search(pattern, json_response.get('text', ''))
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
