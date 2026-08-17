import { getJob } from "./job"

export const waitForJobCompletion = async(jobId: string) => {
    const delay = (ms: number) => {
        new Promise(resolve => setTimeout(resolve, ms))
    }
    while(true){
        const job = await getJob(jobId);

        if(job.status === 'COMPLETED'){
            return job
        }

        if(job.status === "FAILED"){
            throw new Error("Erro ao processar o arquivo")
        }
        await delay(3000)
    }
}