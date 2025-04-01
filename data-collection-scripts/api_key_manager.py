# api_key_manager.py

import os
from alpha_vantage_keygen import generate_api_key
from dotenv import load_dotenv, set_key
from helpers import connect_nordvpn, disconnect_nordvpn

ENV_FILE = ".env"
ENV_VAR_NAME = "API_KEY_ALPHAVANTAGE_sbabel_umass_edu"

# Load environment variables
load_dotenv()

class APIKeyManager:
    def __init__(self):
        self.api_keys = os.getenv(ENV_VAR_NAME, '').split(',')
        self.api_keys = [key.strip() for key in self.api_keys if key.strip()]
        if not self.api_keys:
            raise ValueError(f"No API keys found in the environment variable '{ENV_VAR_NAME}'.")
        self.index = 0

    def get_current_key(self):
        return self.api_keys[self.index]

    def rotate_key(self):
        self.index = (self.index + 1) % len(self.api_keys)
        print(f"[APIKeyManager] Rotated to key: {self.get_current_key()}")
        return self.get_current_key()

    def add_new_key(self):
        print("[APIKeyManager] Generating new API key...")
        new_key = generate_api_key()
        if new_key:
            self.api_keys.append(new_key)
            self.index = len(self.api_keys) - 1
            # Append to .env file
            updated = ','.join(self.api_keys)
            set_key(ENV_FILE, ENV_VAR_NAME, updated)
            print(f"[APIKeyManager] New API key added and set in .env: {new_key}")
            return new_key
        else:
            print("[APIKeyManager] Failed to generate new key.")
            return None

    def reconnect_vpn(self):
        print("[APIKeyManager] Rotating VPN...")
        disconnect_nordvpn()
        connect_nordvpn()

    def handle_failure_and_continue(self):
        # Rotate key and change IP, then return new working key
        self.rotate_key()
        self.reconnect_vpn()

    def fallback_to_new_key(self):
        # If all keys fail, generate a new one and switch to it
        return self.add_new_key()
