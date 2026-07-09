import requests
import json

def test_login(username, password):
    url = "http://localhost:5000/auth/login"
    payload = {
        "username": username,
        "password": password
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    print(f"Testing login for user: {username}")
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error connecting to backend: {e}")
        return False

if __name__ == "__main__":
    # Test with user 's6' and password 'password123' (created by debug script)
    test_login("s6", "password123")
