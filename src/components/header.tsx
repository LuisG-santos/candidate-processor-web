import { PackageOpen } from "lucide-react"

export function Header() {
    return (
        <>
            <div className="flex bg-zinc-900 border-b-1 space-x-3 pl-10 pt-2 h-15">
                <PackageOpen className="w-10 h-10 text-white" />
                <div>
                    <h1 className="font-semibold">Candidate Processor</h1>
                    <p className="text-sm text-zinc-500">BTG</p>
                </div>

            </div>
        </>
    )
} 