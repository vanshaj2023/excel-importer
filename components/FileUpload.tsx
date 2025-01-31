'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import { formatInTimeZone } from 'date-fns-tz'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, 
         AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import DataTable from './DataTable'
import ValidationErrors from './ValidationErrors'

interface SheetData {
  name: string
  data: any[]
  errors: ValidationError[]
}

interface ValidationError {
  sheet: string
  row: number
  error: string
}

export default function FileUpload() {
  const [sheets, setSheets] = useState<SheetData[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>('')
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file || !file.name.endsWith('.xlsx')) {
      return
    }

    setIsUploading(true)
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, {
        cellDates: true,
        cellNF: true,
        cellStyles: true
      })

      const sheetsData: SheetData[] = workbook.SheetNames.map(name => ({
        name,
        data: XLSX.utils.sheet_to_json(workbook.Sheets[name]),
        errors: []
      }))

      // Validate each sheet
      const allErrors: ValidationError[] = []
      sheetsData.forEach(sheet => {
        sheet.data.forEach((row: any, index: number) => {
          const rowErrors = validateRow(row, index + 2)
          if (rowErrors.length) {
            sheet.errors.push(...rowErrors.map(error => ({
              sheet: sheet.name,
              row: index + 2,
              error
            })))
            allErrors.push(...sheet.errors)
          }
        })
      })

      setSheets(sheetsData)
      setErrors(allErrors)
      setSelectedSheet(sheetsData[0]?.name || '')
    } catch (error) {
      console.error('Error processing file:', error)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 2 * 1024 * 1024 // 2MB
  })

  const validateRow = (row: any, rowNumber: number): string[] => {
    const errors: string[] = []

    // Required fields
    if (!row.Name) errors.push(`Row ${rowNumber}: Name is required`)
    if (!row.Amount) errors.push(`Row ${rowNumber}: Amount is required`)
    if (!row.Date) errors.push(`Row ${rowNumber}: Date is required`)

    // Date validation
    if (row.Date) {
      const date = new Date(row.Date)
      const currentMonth = new Date().getMonth()
      if (date.getMonth() !== currentMonth) {
        errors.push(`Row ${rowNumber}: Date must be in current month`)
      }
    }

    // Amount validation
    if (row.Amount && (isNaN(row.Amount) || row.Amount <= 0)) {
      errors.push(`Row ${rowNumber}: Amount must be greater than zero`)
    }

    return errors
  }

  const handleImport = async () => {
    const validData = sheets
      .find(sheet => sheet.name === selectedSheet)
      ?.data.filter((row: any, index: number) => !validateRow(row, index + 2).length)

    if (!validData?.length) return

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: validData, sheet: selectedSheet })
      })

      if (!response.ok) throw new Error('Import failed')
      
      // Handle success
    } catch (error) {
      console.error('Import error:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <p>Processing file...</p>
        ) : isDragActive ? (
          <p>Drop the Excel file here</p>
        ) : (
          <div>
            <p>Drag & drop an Excel file here, or click to select</p>
            <p className="text-sm text-gray-500 mt-2">Only .xlsx files up to 2MB are accepted</p>
          </div>
        )}
      </div>

      {sheets.length > 0 && (
        <div className="space-y-4">
          <select
            value={selectedSheet}
            onChange={(e) => setSelectedSheet(e.target.value)}
            className="border rounded p-2"
          >
            {sheets.map(sheet => (
              <option key={sheet.name} value={sheet.name}>
                {sheet.name}
              </option>
            ))}
          </select>

          <DataTable
            data={sheets.find(sheet => sheet.name === selectedSheet)?.data || []}
            errors={errors.filter(error => error.sheet === selectedSheet)}
          />

          {errors.length > 0 && <ValidationErrors errors={errors} />}

          <Button onClick={handleImport}>
            Import Valid Rows
          </Button>
        </div>
      )}
    </div>
  )
}