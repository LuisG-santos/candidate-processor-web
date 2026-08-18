import { UploadArea } from './components/uploadArea'
import './App.css'
import { Header } from './components/header'
import { CandidatesTable } from './components/candidatesTable'
import { useState } from 'react'
import type { Candidate } from './types/candidates'

function App() {
  const [candidates, setCandidates] = useState<Candidate[]>([])

  return (
    <>
    <header><Header/></header>
    <div className='flex flex-col p-7 gap-7'>
      <UploadArea setCandidates={setCandidates}/>
      <CandidatesTable candidates={candidates}/>
    </div>
    <div className='bg-zinc-900 border-t-1 p-7'>
      <p className='text-sm text-zinc-500'>Candidate Processor ©2026</p>
    </div>
      
    </>
  )
}

export default App
