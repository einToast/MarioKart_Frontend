import axios from 'axios';
import {
    AuthenticationRequestDTO,
    AuthenticationResponseDTO,
    UserDTO,
    UserPasswordsDTO,
    UserTokenDTO,
    UserCreationDTO,
    UpdateUserDTO
} from './config/dto';
import {API_BASE_URL} from "./config/constants";
import apiClient from "./config/apiClient";

const BASE_URL = `${API_BASE_URL}/users`;

export const login = async (request: AuthenticationRequestDTO): Promise<AuthenticationResponseDTO> => {
    try {
        const response = await apiClient.post<AuthenticationResponseDTO>(`${BASE_URL}/login`, request);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Email oder Passwort ist falsch');
            } else {
                throw new Error('Login fehlgeschlagen');
            }
        }
        throw error;
    }
};

export const registerUserPassword = async (userPasswords: UserPasswordsDTO, token: string): Promise<UserDTO> => {
    try {
        const response = await apiClient.put<UserDTO>(`${BASE_URL}/register/${token}`, userPasswords);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Token nicht gefunden');
            } else  if (error.response?.status === 401){
                throw new Error('Token ist abgelaufen');
            } else if (error.response?.status === 400){
                throw new Error('Passwörter stimmen nicht überein');
            } else {
                throw new Error('Registrierung fehlgeschlagen');
            }
        }
        throw error;
    }
};

export const createUsers = async (userCreations: UserCreationDTO[]): Promise<UserTokenDTO[]> => {
    try {
        const response = await apiClient.post<UserTokenDTO[]>(BASE_URL, userCreations);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Nutzer konnte nicht erstellt werden');
            }
        }
        throw error;
    }
};

export const getUsers = async (): Promise<UserDTO[]> => {
    try {
        const response = await apiClient.get<UserDTO[]>(BASE_URL);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Nutzer konnten nicht geladen werden');
            }
        }
        throw error;
    }
};

export const deleteUser = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/${id}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Nutzer konnte nicht gelöscht werden');
            }
        }
        throw error;
    }
};

export const updateUser = async (id: number, updateUser: UpdateUserDTO): Promise<UserDTO> => {
    try {
        const response = await apiClient.put<UserDTO>(`${BASE_URL}/${id}`, updateUser);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Nutzer nicht gefunden');
            } else if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else if (error.response?.status === 400){
                throw new Error('Fehlerhafte Anfrage');
            } else{
                throw new Error('Nutzer konnte nicht aktualisiert werden');
            }
        }
        throw error;
    }
};
