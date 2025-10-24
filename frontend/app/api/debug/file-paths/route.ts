import { NextRequest, NextResponse } from 'next/server'
import { DummyDataService } from '@/lib/dummy-data-service'

export async function GET(request: NextRequest) {
  try {
    const pathTest = DummyDataService.testFilePaths()
    
    return NextResponse.json({
      status: 'File path diagnostic',
      results: pathTest
    })
  } catch (error) {
    console.error('Error in file path test:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}