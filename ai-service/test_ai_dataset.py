import requests
import os
import json

# URLs of images to test
TEST_IMAGES = {
    "Waste 1 (Scattered Trash)": "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800&auto=format&fit=crop&q=60",
    "Waste 2 (Garbage Bin)": "https://images.unsplash.com/photo-1595278069441-2f03ce888b54?w=800&auto=format&fit=crop&q=60",
    "Waste 3 (Litter on Beach)": "https://images.unsplash.com/photo-1618477461853-cf6ed80fbfc9?w=800&auto=format&fit=crop&q=60",
    "Non-Waste 1 (Clean Street)": "https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=800&auto=format&fit=crop&q=60",
    "Non-Waste 2 (Person)": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=60"
}

API_URL = "http://localhost:8000/detect"

def run_tests():
    print("Starting AI Dataset Testing...")
    print("=" * 60)
    
    results_summary = []
    
    for name, url in TEST_IMAGES.items():
        print(f"Testing {name}...")
        
        # Download image
        try:
            img_data = requests.get(url).content
            with open("temp_test.jpg", "wb") as f:
                f.write(img_data)
        except Exception as e:
            print(f"Failed to download image {name}: {e}")
            continue
            
        # Submit to API
        try:
            with open("temp_test.jpg", "rb") as f:
                files = {"file": ("temp_test.jpg", f, "image/jpeg")}
                response = requests.post(API_URL, files=files)
                
            if response.status_code == 200:
                result = response.json()
                status = "✅ PASS" if ("Non-Waste" not in name and result["is_waste"]) or ("Non-Waste" in name and not result["is_waste"]) else "❌ FAIL"
                print(f"  Result: is_waste={result['is_waste']} (Confidence: {result.get('confidence', 0):.4f})")
                print(f"  Message: {result.get('message', '')}")
                print(f"  Status: {status}")
                results_summary.append({"name": name, "status": status, "is_waste": result['is_waste']})
                
            # The backend API was updated previously in complaints.ts to expect 400 when not waste
            # Wait, no, the AI SERVICE returns 200 with is_waste=False.
            # Only the Node backend returns 400 if the AI service returns is_waste=False.
            # But we are calling the AI SERVICE directly here! So it should be 200.
                
            else:
                print(f"  API Error: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"  API Request Failed: {e}")
            
        print("-" * 60)

    # Cleanup
    if os.path.exists("temp_test.jpg"):
        os.remove("temp_test.jpg")

if __name__ == "__main__":
    run_tests()
