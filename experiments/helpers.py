import subprocess
import os

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
print(disconnect_nordvpn())
