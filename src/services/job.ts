import { api } from "./api"

export const getJob = async (jobId: string) => {
    try {
        const response = await api.get(`job/${jobId}`)
        return response.data
    } catch (error) {
        console.log("Erro ao buscar o job: ", error)
        throw error;

    }
}

export const postjobs = async (filename: string) => {
    const response = await api.post("/job", {filename: filename})
    return response.data
}