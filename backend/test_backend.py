import asyncio
import websockets
import json
import base64
import cv2
import numpy as np
import requests

REST_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000/ws/stream?client_id=tester_001"

def create_dummy_image_base64():
    # Create a dummy green image representing a fake "face"
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    img[:] = (0, 255, 0)
    # encode self to base64
    _, buffer = cv2.imencode('.jpg', img)
    b64_str = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{b64_str}"

def test_rest_endpoints():
    print("--- Testing REST endpoints ---")
    
    # 1. Test Health
    try:
        r = requests.get(f"{REST_URL}/health")
        print("Health Endpoint Status:", r.status_code)
        print("Health Endpoint Data:", r.json())
    except Exception as e:
        print(f"Health check failed: {e}")

    # 2. Test History
    try:
        r = requests.get(f"{REST_URL}/api/v1/emotions/history?limit=5")
        print("\nHistory Endpoint Status:", r.status_code)
        print("History Endpoint Data:", r.json())
    except Exception as e:
        print(f"History check failed: {e}")

    # 3. Test Trends
    try:
        r = requests.get(f"{REST_URL}/api/v1/emotions/trends?hours_ago=24")
        print("\nTrends Endpoint Status:", r.status_code)
        print("Trends Endpoint Data:", r.json())
    except Exception as e:
        print(f"Trends check failed: {e}")

async def test_websocket():
    print("\n--- Testing WebSocket Streaming ---")
    try:
        async with websockets.connect(WS_URL) as ws:
            print("Connected to WebSocket.")
            
            b64_img = create_dummy_image_base64()
            payload = {"image": b64_img}
            
            print("Sending test frame...")
            await ws.send(json.dumps(payload))
            
            response = await ws.recv()
            print("Received response from server:")
            print(json.dumps(json.loads(response), indent=2))
            
    except Exception as e:
        print(f"WebSocket test failed: {e}")

if __name__ == "__main__":
    test_rest_endpoints()
    asyncio.run(test_websocket())
