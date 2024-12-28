import {env} from "../../../../env.js";
export const API_BASE_URL = `${env.REACT_APP_BACKEND_PROTOCOL}://${env.REACT_APP_BACKEND_URL}:${env.REACT_APP_BACKEND_PORT}/${env.REACT_APP_BACKEND_PATH}`;
export const WS_BASE_URL = `${env.REACT_APP_BACKEND_WS_PROTOCOL}://${env.REACT_APP_BACKEND_WS_URL}:${env.REACT_APP_BACKEND_WS_PORT}/${env.REACT_APP_BACKEND_WS_PATH}`;
export const errorToastColor = '#CD7070';
export const successToastColor = '#68964C';
console.log(API_BASE_URL);
console.log(WS_BASE_URL);
