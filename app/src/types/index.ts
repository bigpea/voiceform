export interface PDFField {
  name: string
  type: 'text' | 'checkbox' | 'radio' | 'dropdown'
  value: string
  label: string
}

export interface UnderstandRequest {
  transcript: string
  availableFields: string[]
}

export interface UnderstandResult {
  field: string
  value: string
  confidence: number
}

export interface FillPDFRequest {
  pdfBase64: string
  fields: Record<string, string>
}

export interface FieldsResponse {
  fields: PDFField[]
}

export interface UnderstandResponse {
  results: UnderstandResult[]
}

export interface FillPDFResponse {
  pdfBase64: string
}
