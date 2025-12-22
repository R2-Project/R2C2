import { AxiosResponse } from 'axios';

export const errorHandler = (response: AxiosResponse) => {
    // You can handle specific status codes here
    if (response.status === 401) {
        // Handle unauthorized error, e.g., redirect to login
        console.error('Unauthorized! Redirecting to login...');
    } else if (response.status >= 400 && response.status < 500) {
        // Handle other client errors
        console.error(`Client error: ${response.statusText}`);
    } else if (response.status >= 500) {
        // Handle server errors
        console.error(`Server error: ${response.statusText}`);
    }

    return Promise.reject(response);
};