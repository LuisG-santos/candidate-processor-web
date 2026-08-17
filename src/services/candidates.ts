import { api } from "./api";

export const getCandidates = async (jobId: string) => {
    try {
        const response = await api.get(`/job/${jobId}/candidates`)
        return response.data;
    } catch (error) {
        console.log("Erro ao processar os candidatos: ", error)
        throw error;
    }
} 