const fs = require('fs');

async function test() {
    const imagePath = '/Users/tapan/.gemini/antigravity/brain/defc6736-297c-4854-844e-9143c415d0b3/plastic_bag_waste_1777370420210.png';
    const buffer = fs.readFileSync(imagePath);
    const base64 = buffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64}`;

    try {
        const response = await fetch('http://localhost:5001/api/complaints', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageUrl: dataUri,
                location: { lat: 40.71, lng: -74.01 },
                description: 'test image',
                userId: 'u1'
            })
        });
        
        const result = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", result);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
