import { useState } from "react"
import { UploadCloud } from "lucide-react"
import { Button } from "./ui/button"
import { Play } from "lucide-react"
import { postjobs } from "@/services/job"
import { toast } from "sonner"
import { s3Upload } from "@/services/upload"
import { waitForJobCompletion } from "@/services/jobPolling"
import { getCandidates } from "@/services/candidates"
import type { Candidate } from "@/types/candidates"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Loader2 } from "lucide-react"
interface uploadAreaProps {
    setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>
}

export function UploadArea({ setCandidates }: uploadAreaProps) {
    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    type ProcessingStep =
        | "idle"
        | "creating-job"
        | "uploading"
        | "processing"

    const [processingStep, setProssesingStep] = useState<ProcessingStep>("idle")
    const isProcessing = processingStep !== "idle"

    function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
        e.preventDefault()
        setIsDragging(false)
        const dropped = e.dataTransfer.files?.[0]
        if (dropped) setFile(dropped)
    }

    const handleProcess = async () => {
        try {
            if (!file) {
                toast.error("Arquivo obrigatório")
                return
            }
            setProssesingStep("creating-job")
            const job = await postjobs(file.name)
            setProssesingStep("uploading")
            const { id, upload_url } = job
            await s3Upload(upload_url, file)
            setProssesingStep("processing")
            const completedJob = await waitForJobCompletion(id)
            const candidates = await getCandidates(completedJob.id)
            setCandidates(candidates)
            setProssesingStep("idle")
        } catch (error) {
            setProssesingStep("idle")
            toast.error("Erro ao processar o arquivo")
            console.log("Error ao processar o arquivo: ", error)
        }
    }


    return (
        <div className="bg-zinc-900 border-2 rounded-lg p-6">
            <div className="flex gap-4 p-2">
                <UploadCloud className="w-12 h-12" />
                <div className="flex flex-col">
                    <h1 className="font-bold">Processar arquivo</h1>
                    <p className="text-sm text-zinc-500">Envie um arquivo CSV contendo os dados e as notas do candidato</p>
                </div>

            </div>
            <div className="flex flex-col pt-3 space-y-4">
                <label
                    htmlFor="file-upload"
                    onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-500 p-12 text-center transition-colors ${isDragging ? "border-blue-600 bg-primary/5" : "border-blue-900"
                        }`}
                >
                    <UploadCloud className="size-8 text-muted-foreground" />
                    <p className="font-medium">Arraste e solte seu arquivo aqui</p>
                    <p className="text-sm text-muted-foreground">ou clique para selecionar</p>

                    {file && (
                        <p className="mt-2 text-sm text-foreground">{file.name}</p>
                    )}

                    <input
                        id="file-upload"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => {
                            const selected = e.target.files?.[0]
                            if (selected) setFile(selected)
                        }}
                    />
                </label>

                <Button onClick={handleProcess} className="bg-blue-600 text-white self-end hover:bg-blue-800"><Play className="size-4" />Processar arquivo</Button>

                <Dialog open={isProcessing}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Processando arquivo
                            </DialogTitle>

                            <DialogDescription>
                                Aguarde enquanto processamos os candidatos.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex items-center gap-3">
                            <Loader2 className="size-5 animate-spin" />

                            <span>
                                {processingStep === "creating-job" &&
                                    "Criando processamento..."}

                                {processingStep === "uploading" &&
                                    "Enviando arquivo..."}

                                {processingStep === "processing" &&
                                    "Processando candidatos..."}
                            </span>
                        </div>
                    </DialogContent>

                </Dialog>
            </div>
        </div>
    )
}
