import logo from "@/assets/icon.png"

export function Header() {
    return (
        <>
            <div className="flex bg-zinc-900 items-center border-b-1 pl-10 gap-3 pt-2 h-15">
                <img src={logo} alt="Candidate Processor" className="w-auto h-10 rounded-xl"></img>
                <div>
                    <h1 className="font-semibold">Candidate Processor</h1>
                    <p className="text-sm text-zinc-500">BTG</p>
                </div>

            </div>
        </>
    )
} 