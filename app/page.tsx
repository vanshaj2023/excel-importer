import FileUpload from '@/components/FileUpload'
import { Suspense } from 'react'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Excel Data Importer</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <FileUpload />
      </Suspense>
    </main>
  )
}