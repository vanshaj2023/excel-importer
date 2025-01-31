'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Trash2 } from 'lucide-react'
import { ValidationError } from 'next/dist/compiled/amphtml-validator'

interface DataTableProps {
  data: Record<string, unknown>[]
  errors: ValidationError[]
}

export default function DataTable({ data, errors }: DataTableProps) {
  const [rows, setRows] = useState(data)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const rowsPerPage = 10

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return date
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  const handleDelete = (index: number) => {
    setDeleteIndex(index)
  }

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      const newRows = [...rows]
      newRows.splice(deleteIndex, 1)
      setRows(newRows)
      setDeleteIndex(null)
    }
  }

  const startIndex = (page - 1) * rowsPerPage
  const paginatedRows = rows.slice(startIndex, startIndex + rowsPerPage)
  const totalPages = Math.ceil(rows.length / rowsPerPage)

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Verified</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, index) => (
              <tr key={index} className={
                errors.some(e => e.row === index + 2) ? 'bg-red-50' : ''
              }>
                <td className="border p-2">{row.Name as string}</td>
                <td className="border p-2">{formatNumber(row.Amount as number)}</td>
                <td className="border p-2">{formatDate(row.Date as string)}</td>
                <td className="border p-2">{row.Verified ? 'Yes' : 'No'}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <AlertDialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this row? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
