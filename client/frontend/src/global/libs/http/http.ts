import axios from 'axios';
import { authorizationInterceptor } from './interceptors/authorization';
import { errorHandler } from './errorHandler';

const http = axios.create({
    baseURL: 'http://localhost:8000',
});

http.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('jwtToken') || ''}`;

http.interceptors.request.use(
    authorizationInterceptor
);

http.interceptors.response.use(
    (response) => response,
    (response) => errorHandler(response),
);

export { http };
