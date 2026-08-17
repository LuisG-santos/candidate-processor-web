import axios from "axios"

export const s3Upload = async (uploadUrl: string, file: File) => {
    try {
        const response = await axios.put(uploadUrl, file, {
            headers: {
                "Content-Type": "text/csv"
            }
        })

        return response.status === 200
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log("Status:", error.response?.status)
            console.log("S3 response:", error.response?.data)
            console.log("S3 headers:", error.response?.headers)
        }

        throw error
    }
}