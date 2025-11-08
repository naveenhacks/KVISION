
// Mocks a backend API for delete operations.
// In a real application, this would use fetch() to make network requests.

const SIMULATED_DELAY = 500; // ms
const FAILURE_RATE = 0.1; // 10% chance of failure

type ApiSuccessResponse = { success: true; message: string };
type ApiErrorResponse = { success: false; message: string };
type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

const logRequest = (endpoint: string, id: string | number) => {
    console.log(`[API REQUEST] ==> DELETE ${endpoint}/${id}`, { timestamp: new Date().toISOString() });
};

const logResponse = (endpoint: string, response: ApiResponse) => {
    console.log(`[API RESPONSE] <== ${endpoint}`, response);
};

export const apiDelete = (endpoint: string, id: string): Promise<ApiSuccessResponse> => {
    logRequest(endpoint, id);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < FAILURE_RATE) {
                const errorResponse: ApiErrorResponse = {
                    success: false,
                    message: "An unexpected error occurred on the server. Please try again.",
                };
                logResponse(endpoint, errorResponse);
                reject(errorResponse);
            } else {
                const successResponse: ApiSuccessResponse = {
                    success: true,
                    message: `${endpoint} with ID ${id} was successfully deleted.`,
                };
                logResponse(endpoint, successResponse);
                resolve(successResponse);
            }
        }, SIMULATED_DELAY);
    });
};

// Specific endpoints as requested by the user
export const removeUser = (id: string) => apiDelete('/api/remove/user', id);
export const removeHomework = (id: string) => apiDelete('/api/remove/homework', id);
export const removeNotice = (id: string) => apiDelete('/api/remove/notice', id);
export const removeImage = (id: string) => apiDelete('/api/remove/image', id);
export const removeMessage = (id: string) => apiDelete('/api/remove/message', id);
// Note: /api/remove/teacher and /api/remove/student are covered by removeUser