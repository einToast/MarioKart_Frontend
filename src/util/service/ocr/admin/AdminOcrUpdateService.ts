import { AdminOcrApi } from "../../../api";
import { ProviderInputDTO, ProviderReturnDTO } from "../../../api/config/dto";

export const updateProviderConfig = async (providerName: string, config: ProviderInputDTO): Promise<ProviderReturnDTO> => {
    return await AdminOcrApi.updateProviderConfig(providerName, config);
}
