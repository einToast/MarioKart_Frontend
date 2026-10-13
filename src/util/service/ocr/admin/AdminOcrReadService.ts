import { AdminOcrApi } from "../../../api";
import { ProviderReturnDTO } from "../../../api/config/dto";

export const getAvailableProviders = async (): Promise<string[]> => {
    return await AdminOcrApi.getAvailableProviders();
}

export const getProviderModels = async (providerName: string): Promise<string[]> => {
    return await AdminOcrApi.getProviderModels(providerName);
}

export const getProviderConfig = async (providerName: string): Promise<ProviderReturnDTO> => {
    return await AdminOcrApi.getProviderConfig(providerName);
}
