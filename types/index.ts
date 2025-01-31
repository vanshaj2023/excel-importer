export interface SheetData {
    name: string
    data: any[]
    errors: ValidationError[]
  }
  
  export interface ValidationError {
    sheet: string
    row: number
    error: string
  }