// Helper function to get auth token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    // We only need the Authorization header for this internal API call
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : {'Content-Type': 'application/json'};
};

export const generateComputerDescription = async (name: string, purchaseYear: number): Promise<string> => {
    try {
        const response = await fetch('/api/ai/generate-description', {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ name, purchaseYear }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Failed to generate description from server');
        }

        const data = await response.json();
        return data.description;

    } catch (error) {
        console.error("Error fetching AI description from backend:", error);
        return `สร้างคำอธิบายด้วย AI สำหรับ ${name} ไม่สำเร็จ`;
    }
};
