import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import { Users } from "lucide-react";
import type { Candidate } from "@/types/candidates";

interface candidateTableProps{
    candidates: Candidate[]
}

export function CandidatesTable({candidates}: candidateTableProps) {

    return (
        <>
            <div className="bg-zinc-900 border-2 rounded-lg p-6">
                <div className="pb-5 flex items-center gap-3">
                    <Users className="w-10 h-10" />
                    <h2 className="text-lg">Candidatos aprovados</h2>
                </div>

                <Table className="border-2 rounded-xl">
                    <TableHeader className="bg-zinc-800 rounded-xl">
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>E-mail</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Nota</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {candidates.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell>{c.name}</TableCell>
                                <TableCell>{c.email}</TableCell>
                                <TableCell>{c.phone}</TableCell>
                                <TableCell>{c.note}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    )
}