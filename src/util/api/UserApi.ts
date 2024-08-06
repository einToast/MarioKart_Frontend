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

export const login = async (request: AuthenticationRequestDTO): Promise<AuthenticationResponseDTO> => {
    try {
        const response = await axios.post<AuthenticationResponseDTO>(`${API_BASE_URL}/login`, request);
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const registerUserPassword = async (userPasswords: UserPasswordsDTO, token: string): Promise<UserDTO> => {
    try {
        const response = await axios.put<UserDTO>(`${API_BASE_URL}/register/${token}`, userPasswords);
        return response.data;
    } catch (error) {
        console.error('Error registering user password:', error);
        throw error;
    }
};

export const createUsers = async (userCreations: UserCreationDTO[]): Promise<UserTokenDTO[]> => {
    try {
        const response = await axios.post<UserTokenDTO[]>(API_BASE_URL, userCreations);
        return response.data;
    } catch (error) {
        console.error('Error creating users:', error);
        throw error;
    }
};

export const getUsers = async (): Promise<UserDTO[]> => {
    try {
        const response = await axios.get<UserDTO[]>(API_BASE_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const deleteUser = async (id: number): Promise<void> => {
    try {
        await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

export const updateUser = async (id: number, updateUser: UpdateUserDTO): Promise<UserDTO> => {
    try {
        const response = await axios.put<UserDTO>(`${API_BASE_URL}/${id}`, updateUser);
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};
