import { ValidationError } from "next/dist/compiled/amphtml-validator"

interface ValidationErrorsProps {
    errors: ValidationError[]
  }
  
  export default function ValidationErrors({ errors }: ValidationErrorsProps) {
    const errorsBySheet = errors.reduce((acc: Record<string, ValidationError[]>, error) => {
      if (!acc[error.sheet]) {
        acc[error.sheet] = []
      }
      acc[error.sheet].push(error)
      return acc
    }, {})
  
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Validation Errors</h3>
        {Object.entries(errorsBySheet).map(([sheet, sheetErrors]) => (
          <div key={sheet} className="mb-4">
            <h4 className="font-medium text-red-700 mb-2">Sheet: {sheet}</h4>
            <ul className="list-disc pl-5 space-y-1">
              {sheetErrors.map((error, index) => (
                <li key={index} className="text-red-600">
                  Row {error.row}: {error.error}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }