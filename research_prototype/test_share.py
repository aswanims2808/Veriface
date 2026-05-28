import requests
import json

def test_share():
    url = "http://localhost:5000/history/5/share"
    try:
        # POST request without auth header (triggers demo mode)
        response = requests.post(url)
        print(f"Status: {response.status_code}")
        if response.headers.get('content-type') == 'application/json':
            data = response.json()
            if 'error' in data:
                with open('error.txt', 'w') as f:
                    f.write(data['error'])
                print("Error written to error.txt")
            else:
                print("Response JSON:", data)
        else:
            print("Response Text:", response.text)
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_share()
