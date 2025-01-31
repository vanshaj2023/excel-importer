import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

const DataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  verified: Boolean,
  sheetName: String
}, { timestamps: true })

const Data = mongoose.models.Data || mongoose.model('Data', DataSchema)

export async function POST(request: Request) {
  if (!MONGODB_URI) {
    return NextResponse.json(
      { error: 'MongoDB URI not configured' },
      { status: 500 }
    )
  }

  try {
    await mongoose.connect(MONGODB_URI)
    const { data, sheet } = await request.json()

    const documents = data.map((row: Record<string, unknown>) => ({
      name: row.Name as string,
      amount: row.Amount as number,
      date: new Date(row.Date as string),
      verified: row.Verified === 'Yes',
      sheetName: sheet
    }))

    await Data.insertMany(documents)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    )
  }
}
