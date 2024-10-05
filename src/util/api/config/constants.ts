import {env} from "../../../../env.js";
// export const API_BASE_URL = 'https://mariokart.eintoast.de/api';
// export const API_BASE_URL = 'http://localhost:8080/api';
export const API_BASE_URL = `${env.REACT_APP_BACKEND_PROTOCOL}://${env.REACT_APP_BACKEND_URL}:${env.REACT_APP_BACKEND_PORT}/api`;
export const errorToastColor = '#CD7070';
export const successToastColor = '#68964C';
console.log(API_BASE_URL);
