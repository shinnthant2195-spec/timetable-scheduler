// src/utils/apiClient.js

export async function apiFetch(endpoint, options = {}) {
    const response = await fetch(endpoint, options);

    // Intercept 4xx and 5xx errors
    if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status}`;
        try {
            // Attempt to parse the JSON payload from GlobalExceptionHandler
            const errorData = await response.json();
            if (errorData.message) {
                errorMessage = errorData.message;
            }
        } catch (e) {
            // Fallback if the backend response isn't JSON
            console.error("Non-JSON error response intercepted.");
        }
        
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
    }

    // Gracefully handle 204 No Content (commonly used for DELETE operations)
    if (response.status === 204) {
        return null;
    }

    return response.json();
}