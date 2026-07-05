'use client'

import * as React from 'react'
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  Info,
  ShieldCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { categoryList, type CategoryId } from '@/lib/data'
import { formatINR } from '@/lib/format'
import { cn } from '@/lib/utils'

interface DBTransaction {
  id: string
  user_id: string
  merchant: string
  amount: number
  transaction_type: 'income' | 'expense'
  category: string
  payment_method: string
  transaction_date: string
  notes: string | null
}

interface ImportCsvDialogProps {
  userId: string
  transactions: DBTransaction[]
  onSuccess: () => void
}

// RFC 4180 CSV Parser
function parseCSV(text: string): string[][] {
  const lines: string[][] = []
  let row: string[] = []
  let inQuotes = false
  let currentVal = ''

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim())
      currentVal = ''
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      row.push(currentVal.trim())
      if (row.some(val => val !== '')) {
        lines.push(row)
      }
      row = []
      currentVal = ''
      if (char === '\r' && nextChar === '\n') {
        i++
      }
    } else {
      currentVal += char
    }
  }
  if (currentVal || row.length > 0) {
    row.push(currentVal.trim())
    if (row.some(val => val !== '')) {
      lines.push(row)
    }
  }
  return lines
}

// Dynamic Date Parser
function parseDateString(val: string): string | null {
  const clean = val.trim()
  if (!clean) return null

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const d = new Date(clean)
    return isNaN(d.getTime()) ? null : clean
  }

  // DD/MM/YYYY or MM/DD/YYYY or DD-MM-YYYY
  const parts = clean.split(/[\/\-\.\s]/)
  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10)
    const p1 = parseInt(parts[1], 10)
    const p2 = parseInt(parts[2], 10)

    if (p2 > 1000) { // e.g. Year is p2
      let day = p0
      let month = p1
      const year = p2

      if (p0 > 12) {
        day = p0
        month = p1
      } else if (p1 > 12) {
        day = p1
        month = p0
      } else {
        // Default to DD/MM/YYYY
        day = p0
        month = p1
      }

      const formatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const d = new Date(formatted)
      return isNaN(d.getTime()) ? null : formatted
    } else if (p0 > 1000) { // Year is p0
      const year = p0
      const month = p1
      const day = p2
      const formatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const d = new Date(formatted)
      return isNaN(d.getTime()) ? null : formatted
    }
  }

  const fallback = new Date(clean)
  if (!isNaN(fallback.getTime())) {
    return fallback.toISOString().split('T')[0]
  }

  return null
}

// Amount Sanitizer (Handles ₹, commas, and spaces)
function parseAmountString(val: string): number | null {
  const clean = val.replace(/[₹\s,]/g, '').trim()
  if (!clean) return null
  const num = parseFloat(clean)
  return isNaN(num) ? null : num
}

// Fuzz-narration cleaner for Indian Bank Statements
function cleanMerchantName(narration: string): string {
  if (!narration) return 'Other'
  
  let cleaned = narration.toUpperCase().trim()

  // Remove common banking transaction prefix patterns
  cleaned = cleaned.replace(/^UPI[-/_]/, '')
  cleaned = cleaned.replace(/^(POS|ACH|IMPS|NEFT|RTGS|CARD|FT|TRANSFER|TRF|WDL|DEP|BILLPAY|CHQ|CLG)[-/\s_]+/, '')
  cleaned = cleaned.replace(/^(DR|CR|PAYMENT TO|PAYMENT FROM|RECEIVED BY|SENT TO)[-/\s_]+/, '')

  // Specific common merchant matches
  if (cleaned.includes('ZOMATO')) return 'Zomato'
  if (cleaned.includes('SWIGGY')) return 'Swiggy'
  if (cleaned.includes('NETFLIX')) return 'Netflix'
  if (cleaned.includes('AMAZON')) return 'Amazon'
  if (cleaned.includes('FLIPKART')) return 'Flipkart'
  if (cleaned.includes('MYNTRA')) return 'Myntra'
  if (cleaned.includes('AJIO')) return 'Ajio'
  if (cleaned.includes('UBER')) return 'Uber'
  if (cleaned.includes('OLA')) return 'Ola'
  if (cleaned.includes('RAPIDO')) return 'Rapido'
  if (cleaned.includes('SPOTIFY')) return 'Spotify'
  if (cleaned.includes('HOTSTAR')) return 'Hotstar'
  if (cleaned.includes('NETPLAY') || cleaned.includes('JIO') || cleaned.includes('RELIANCE')) return 'Jio'
  if (cleaned.includes('AIRTEL')) return 'Airtel'
  if (cleaned.includes('PAYTM') || cleaned.includes('ONE97')) return 'Paytm'
  
  if (cleaned.includes('SALARY') || cleaned.includes('PAYROLL') || cleaned.includes('STIPEND')) return 'Salary Credit'
  if (cleaned.includes('RENT')) return 'Rent'

  // Clean trailing UPI details (/123456789012/ or @okaxis etc.)
  cleaned = cleaned.replace(/\/[\d]{12}\/.*/g, '')
  cleaned = cleaned.replace(/@\w+/g, '')
  cleaned = cleaned.replace(/\d+/g, '') // Remove numbers
  cleaned = cleaned.replace(/[-_/*@&()]/g, ' ') // Replace symbols with spaces

  // Title case conversion
  cleaned = cleaned.trim().toLowerCase().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  
  return cleaned.trim() || 'Other'
}

// Rule-based Category Resolver with strict "other" fallback
function resolveCategory(cleanedMerchant: string, originalNarration: string): string {
  const merchant = cleanedMerchant.toLowerCase()
  const narration = originalNarration.toLowerCase()

  // 1. Food & Dining
  if (
    merchant.includes('zomato') ||
    merchant.includes('swiggy') ||
    merchant.includes('restaurant') ||
    merchant.includes('cafe') ||
    narration.includes('zomato') ||
    narration.includes('swiggy') ||
    narration.includes('restaurant') ||
    narration.includes('cafe')
  ) {
    return 'food'
  }

  // 2. Travel
  if (
    merchant.includes('uber') ||
    merchant.includes('ola') ||
    merchant.includes('rapido') ||
    merchant.includes('fuel') ||
    merchant.includes('petrol') ||
    merchant.includes('travel') ||
    narration.includes('uber') ||
    narration.includes('ola') ||
    narration.includes('rapido') ||
    narration.includes('fuel') ||
    narration.includes('petrol')
  ) {
    return 'travel'
  }

  // 3. Shopping (Strictly only when matching shopping keywords)
  if (
    merchant.includes('amazon') ||
    merchant.includes('flipkart') ||
    merchant.includes('myntra') ||
    merchant.includes('ajio') ||
    narration.includes('amazon') ||
    narration.includes('flipkart') ||
    narration.includes('myntra') ||
    narration.includes('ajio')
  ) {
    return 'shopping'
  }

  // 4. Entertainment
  if (
    merchant.includes('netflix') ||
    merchant.includes('spotify') ||
    merchant.includes('prime') ||
    merchant.includes('hotstar') ||
    narration.includes('netflix') ||
    narration.includes('spotify') ||
    narration.includes('prime') ||
    narration.includes('hotstar')
  ) {
    return 'entertainment'
  }

  // 5. Income
  if (
    merchant.includes('salary') ||
    merchant.includes('stipend') ||
    merchant.includes('payroll') ||
    narration.includes('salary') ||
    narration.includes('stipend') ||
    narration.includes('payroll')
  ) {
    return 'income'
  }

  // 6. Bills & Utilities
  if (
    merchant.includes('rent') ||
    merchant.includes('electricity') ||
    merchant.includes('gas') ||
    merchant.includes('broadband') ||
    merchant.includes('recharge') ||
    merchant.includes('bill') ||
    narration.includes('rent') ||
    narration.includes('electricity') ||
    narration.includes('gas') ||
    narration.includes('broadband') ||
    narration.includes('recharge') ||
    narration.includes('bill')
  ) {
    return 'bills'
  }

  // 7. Health
  if (
    merchant.includes('pharmacy') ||
    merchant.includes('hospital') ||
    merchant.includes('doctor') ||
    merchant.includes('medical') ||
    merchant.includes('medicine') ||
    narration.includes('pharmacy') ||
    narration.includes('hospital') ||
    narration.includes('doctor') ||
    narration.includes('medical') ||
    narration.includes('medicine')
  ) {
    return 'health'
  }

  return 'other' // Fallback to "other" as requested
}

interface BankPreset {
  name: string
  detect: (headers: string[]) => boolean
  mappings: {
    splitAmount: 'single' | 'split'
    merchant: string
    date: string
    amount: string
    debit: string
    credit: string
    type: string
    notes: string
  }
}

// Synonyms lists for auto mapping
const COLUMN_SYNONYMS = {
  date: ['date', 'txn date', 'transaction date', 'value date', 'posting date', 'tran date'],
  merchant: ['description', 'narration', 'particulars', 'transaction remarks', 'details'],
  debit: ['debit', 'withdrawal', 'withdrawals', 'dr', 'paid out', 'amount debited', 'debit amount'],
  credit: ['credit', 'deposit', 'deposits', 'cr', 'paid in', 'amount credited', 'credit amount'],
  amount: ['amount', 'transaction amount', 'value'],
  type: ['type', 'transaction type', 'flow', 'cr/dr', 'dr/cr'],
  notes: ['notes', 'description', 'particulars', 'narration'],
  paymentMethod: ['mode', 'payment mode', 'channel', 'type', 'upi/imps/neft/rtgs/card']
}

const findBestMatch = (headers: string[], keys: string[] | string | undefined | null) => {
  if (!headers || !Array.isArray(headers)) return ''
  const lowerHeaders = headers.map(h => typeof h === 'string' ? h.toLowerCase().trim() : '')
  
  if (!keys) return ''
  const keysArray = Array.isArray(keys) ? keys : [keys]
  
  for (const key of keysArray) {
    if (typeof key !== 'string') continue
    const lowerKey = key.toLowerCase()
    const idx = lowerHeaders.findIndex(h => h && (h.includes(lowerKey) || lowerKey.includes(h)))
    if (idx !== -1) return headers[idx]
  }
  return ''
}

const BANK_PRESETS: BankPreset[] = [
  {
    name: 'HDFC Bank Statement',
    detect: (headers) => {
      const lower = headers.map(h => h.toLowerCase().trim())
      return lower.includes('chq./ref.no.') && lower.includes('withdrawal amt.') && lower.includes('deposit amt.')
    },
    mappings: {
      splitAmount: 'split',
      merchant: 'Narration',
      date: 'Date',
      amount: '',
      debit: 'Withdrawal Amt.',
      credit: 'Deposit Amt.',
      type: '',
      notes: 'Narration'
    }
  },
  {
    name: 'ICICI Bank Statement',
    detect: (headers) => {
      const lower = headers.map(h => h.toLowerCase().trim())
      return lower.includes('transaction remarks') && lower.includes('cheque number')
    },
    mappings: {
      splitAmount: 'split',
      merchant: 'Transaction Remarks',
      date: 'Transaction Date',
      amount: '',
      debit: 'Withdrawal (Dr)',
      credit: 'Deposit (Cr)',
      type: '',
      notes: 'Transaction Remarks'
    }
  },
  {
    name: 'SBI Bank Statement',
    detect: (headers) => {
      const lower = headers.map(h => h.toLowerCase().trim())
      return lower.includes('ref no./cheque no.') && lower.includes('debit') && lower.includes('credit')
    },
    mappings: {
      splitAmount: 'split',
      merchant: 'Description',
      date: 'Txn Date',
      amount: '',
      debit: 'Debit',
      credit: 'Credit',
      type: '',
      notes: 'Description'
    }
  },
  {
    name: 'Axis Bank Statement',
    detect: (headers) => {
      const lower = headers.map(h => h.toLowerCase().trim())
      return lower.includes('particulars') && lower.includes('dr') && lower.includes('cr')
    },
    mappings: {
      splitAmount: 'split',
      merchant: 'PARTICULARS',
      date: 'Tran Date',
      amount: '',
      debit: 'DR',
      credit: 'CR',
      type: '',
      notes: 'PARTICULARS'
    }
  },
  {
    name: 'Kotak Bank Statement',
    detect: (headers) => {
      const lower = headers.map(h => h.toLowerCase().trim())
      return lower.includes('description') && lower.includes('dr / cr') && lower.includes('amount')
    },
    mappings: {
      splitAmount: 'single',
      merchant: 'Description',
      date: 'Transaction Date',
      amount: 'Amount',
      debit: '',
      credit: '',
      type: 'Dr / Cr',
      notes: 'Description'
    }
  }
]

interface ValidatedRow {
  raw: string[]
  mapped: {
    merchant: string
    amount: number
    transaction_type: 'income' | 'expense'
    category: string
    payment_method: string
    transaction_date: string
    notes: string | null
  } | null
  valid: boolean
  status: 'valid' | 'duplicate' | 'invalid' | 'ambiguous'
  error: string | null
  isDuplicate: boolean
}

export function ImportCsvDialog({ userId, transactions, onSuccess }: ImportCsvDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState<'upload' | 'mapping' | 'preview' | 'importing' | 'success'>('upload')
  const [error, setError] = React.useState<string | null>(null)

  // File variables
  const [fileName, setFileName] = React.useState('')
  const [headers, setHeaders] = React.useState<string[]>([])
  const [rawRows, setRawRows] = React.useState<string[][]>([])
  const [detectedPreset, setDetectedPreset] = React.useState('Generic bank CSV')

  // Configurations
  const [splitAmount, setSplitAmount] = React.useState<'single' | 'split'>('single')
  const [merchantCol, setMerchantCol] = React.useState('')
  const [amountCol, setAmountCol] = React.useState('')
  const [debitCol, setDebitCol] = React.useState('')
  const [creditCol, setCreditCol] = React.useState('')
  const [dateCol, setDateCol] = React.useState('')
  const [categoryCol, setCategoryCol] = React.useState('')
  const [paymentCol, setPaymentCol] = React.useState('')
  const [typeCol, setTypeCol] = React.useState('')
  const [notesCol, setNotesCol] = React.useState('')

  // Rows and previews
  const [validatedRows, setValidatedRows] = React.useState<ValidatedRow[]>([])
  const [skipDuplicates, setSkipDuplicates] = React.useState(true)
  const [progress, setProgress] = React.useState(0)
  const [importSummary, setImportSummary] = React.useState({
    total: 0,
    imported: 0,
    duplicatesSkipped: 0,
    invalidSkipped: 0,
    ambiguousSkipped: 0
  })

  React.useEffect(() => {
    if (!open) {
      setStep('upload')
      setError(null)
      setFileName('')
      setHeaders([])
      setRawRows([])
      setDetectedPreset('Generic bank CSV')
      setMerchantCol('')
      setAmountCol('')
      setDebitCol('')
      setCreditCol('')
      setDateCol('')
      setCategoryCol('')
      setPaymentCol('')
      setTypeCol('')
      setNotesCol('')
      setValidatedRows([])
      setImportSummary({ total: 0, imported: 0, duplicatesSkipped: 0, invalidSkipped: 0, ambiguousSkipped: 0 })
      setProgress(0)
    }
  }, [open])

  // Run auto-matching for header fields
  function applyMatches(csvHeaders: string[], mappings: any) {
    setSplitAmount(mappings.splitAmount)
    setMerchantCol(mappings.merchant || findBestMatch(csvHeaders, COLUMN_SYNONYMS.merchant))
    setDateCol(mappings.date || findBestMatch(csvHeaders, COLUMN_SYNONYMS.date))
    setAmountCol(mappings.amount || findBestMatch(csvHeaders, COLUMN_SYNONYMS.amount))
    setDebitCol(mappings.debit || findBestMatch(csvHeaders, COLUMN_SYNONYMS.debit))
    setCreditCol(mappings.credit || findBestMatch(csvHeaders, COLUMN_SYNONYMS.credit))
    setTypeCol(mappings.type || findBestMatch(csvHeaders, COLUMN_SYNONYMS.type))
    setNotesCol(mappings.notes || findBestMatch(csvHeaders, COLUMN_SYNONYMS.notes))
    setCategoryCol(findBestMatch(csvHeaders, ['category', 'tag']))
    setPaymentCol(findBestMatch(csvHeaders, COLUMN_SYNONYMS.paymentMethod))
  }

  function handleFileLoad(text: string, name: string) {
    try {
      const rows = parseCSV(text)
      if (rows.length < 2) {
        setError('CSV file must have a header row and at least one transaction row.')
        return
      }

      const csvHeaders = rows[0].map(h => typeof h === 'string' ? h.trim() : String(h || '').trim())
      setHeaders(csvHeaders)
      setRawRows(rows.slice(1))
      setFileName(name)

      // Preset Check
      const matchingPreset = BANK_PRESETS.find(p => p.detect(csvHeaders))
      if (matchingPreset) {
        setDetectedPreset(matchingPreset.name)
        applyMatches(csvHeaders, matchingPreset.mappings)
      } else {
        setDetectedPreset('Generic bank CSV')
        applyMatches(csvHeaders, {
          splitAmount: findBestMatch(csvHeaders, COLUMN_SYNONYMS.debit) && findBestMatch(csvHeaders, COLUMN_SYNONYMS.credit) ? 'split' : 'single',
          merchant: '',
          date: '',
          amount: '',
          debit: '',
          credit: '',
          type: '',
          notes: ''
        })
      }

      setStep('mapping')
      setError(null)
    } catch (err: any) {
      setError(err?.message || 'Error processing CSV statement file.')
    }
  }

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          handleFileLoad(event.target.result as string, file.name)
        }
      }
      reader.readAsText(file)
    } else {
      setError('Please upload a valid CSV file.')
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          handleFileLoad(event.target.result as string, file.name)
        }
      }
      reader.readAsText(file)
    }
  }

  // Preset Selection Override
  function handlePresetChange(presetName: string) {
    if (presetName === 'Generic bank CSV') {
      setDetectedPreset('Generic bank CSV')
      applyMatches(headers, {
        splitAmount: 'single',
        merchant: '',
        date: '',
        amount: '',
        debit: '',
        credit: '',
        type: '',
        notes: ''
      })
    } else {
      const preset = BANK_PRESETS.find(p => p.name === presetName)
      if (preset) {
        setDetectedPreset(preset.name)
        applyMatches(headers, preset.mappings)
      }
    }
  }

  // Dynamic Validation Engine
  function handleMapColumns() {
    if (!merchantCol) return setError('Merchant mapping is required.')
    if (splitAmount === 'single' && !amountCol) return setError('Amount mapping is required.')
    if (splitAmount === 'split' && !debitCol && !creditCol) return setError('Debit or Credit column mapping is required.')
    if (!dateCol) return setError('Date mapping is required.')
    setError(null)

    const results: ValidatedRow[] = rawRows.map(row => {
      const rawDescription = row[headers.indexOf(merchantCol)]?.trim() || ''
      const rawDateStr = row[headers.indexOf(dateCol)]?.trim() || ''
      const rawCategoryStr = categoryCol ? (row[headers.indexOf(categoryCol)]?.trim() || '') : ''
      const rawPaymentStr = paymentCol ? (row[headers.indexOf(paymentCol)]?.trim() || 'Other') : 'Other'
      const rawNotesStr = notesCol ? (row[headers.indexOf(notesCol)]?.trim() || '') : ''

      let rowAmount = 0
      let rowType: 'income' | 'expense' = 'expense'
      let rowError: string | null = null
      let isAmbiguous = false

      // Parse Amount & Debit/Credit
      if (splitAmount === 'single') {
        const amtVal = parseAmountString(row[headers.indexOf(amountCol)] || '')
        if (amtVal === null) {
          rowError = 'Amount missing or invalid.'
        } else {
          // If transaction type is mapped
          if (typeCol) {
            const typeVal = (row[headers.indexOf(typeCol)] || '').toLowerCase()
            if (typeVal.includes('income') || typeVal.includes('credit') || typeVal.includes('deposit') || typeVal.includes('cr') || typeVal.includes('paid in') || typeVal.includes('cr.')) {
              rowType = 'income'
            } else {
              rowType = 'expense'
            }
            rowAmount = Math.abs(amtVal)
            if (rowType === 'income' && amtVal < 0) {
              rowError = 'Negative income amounts not allowed.'
            }
          } else {
            // Infer type from sign
            if (amtVal < 0) {
              rowType = 'expense'
              rowAmount = Math.abs(amtVal)
            } else {
              rowType = 'income'
              rowAmount = amtVal
            }
          }
        }
      } else {
        // Split columns (Debit/Credit logic)
        const debVal = debitCol ? parseAmountString(row[headers.indexOf(debitCol)] || '') : null
        const credVal = creditCol ? parseAmountString(row[headers.indexOf(creditCol)] || '') : null

        const hasDebit = debVal !== null && debVal > 0
        const hasCredit = credVal !== null && credVal > 0

        if (hasDebit && hasCredit) {
          isAmbiguous = true
          rowError = 'Ambiguous row: both debit and credit columns contain positive values.'
        } else if (!hasDebit && !hasCredit) {
          rowError = 'Invalid row: both debit and credit amounts are empty.'
        } else if (hasDebit) {
          rowType = 'expense'
          rowAmount = Math.abs(debVal)
        } else if (hasCredit) {
          rowType = 'income'
          rowAmount = credVal
        }
      }

      // Parse Date
      const parsedDate = parseDateString(rawDateStr)
      if (!parsedDate) {
        rowError = rowError || 'Invalid date format.'
      }

      // Check required fields safeguard
      if (!rawDescription) {
        rowError = rowError || 'Narration/Merchant name is missing.'
      }

      const cleanedMerchant = cleanMerchantName(rawDescription)
      const suggestedCategory = resolveCategory(cleanedMerchant, rawDescription || rawNotesStr)

      // Duplicate Check with Notes fallback
      let isDup = false
      if (!rowError && parsedDate) {
        isDup = transactions.some(tx => 
          tx.merchant.toLowerCase().trim() === cleanedMerchant.toLowerCase().trim() &&
          Math.abs(tx.amount) === rowAmount &&
          tx.transaction_date.slice(0, 10) === parsedDate &&
          (tx.notes === null || tx.notes.toLowerCase().trim() === rawDescription.toLowerCase().trim())
        )
      }

      let rowStatus: 'valid' | 'duplicate' | 'invalid' | 'ambiguous' = 'valid'
      if (rowError) {
        rowStatus = isAmbiguous ? 'ambiguous' : 'invalid'
      } else if (isDup) {
        rowStatus = 'duplicate'
      }

      return {
        raw: row,
        mapped: rowError ? null : {
          merchant: cleanedMerchant,
          amount: rowAmount,
          transaction_type: rowType,
          category: suggestedCategory,
          payment_method: rawPaymentStr || 'Other',
          transaction_date: parsedDate as string,
          notes: rawDescription // Keep raw narration in notes safeguard
        },
        valid: !rowError,
        status: rowStatus,
        error: rowError,
        isDuplicate: isDup
      }
    })

    setValidatedRows(results)
    setStep('preview')
  }

  // Row edit handlers in preview
  const updateMerchant = (index: number, val: string) => {
    setValidatedRows(prev => prev.map((row, idx) => {
      if (idx === index && row.mapped) {
        const cleaned = val.trim()
        const isDup = transactions.some(tx => 
          tx.merchant.toLowerCase().trim() === cleaned.toLowerCase() &&
          Math.abs(tx.amount) === row.mapped!.amount &&
          tx.transaction_date.slice(0, 10) === row.mapped!.transaction_date &&
          (tx.notes === null || tx.notes.toLowerCase().trim() === (row.mapped!.notes || '').toLowerCase().trim())
        )
        return {
          ...row,
          isDuplicate: isDup,
          status: isDup ? 'duplicate' : 'valid',
          mapped: {
            ...row.mapped,
            merchant: val
          }
        }
      }
      return row
    }))
  }

  const updateType = (index: number, type: 'income' | 'expense') => {
    setValidatedRows(prev => prev.map((row, idx) => {
      if (idx === index) {
        // Resolve ambiguity error if we change type
        const newMapped = row.mapped ? {
          ...row.mapped,
          transaction_type: type
        } : {
          // If was invalid/ambiguous, reconstruct a mapped row
          merchant: cleanMerchantName(row.raw[headers.indexOf(merchantCol)]),
          amount: splitAmount === 'single'
            ? Math.abs(parseAmountString(row.raw[headers.indexOf(amountCol)]) || 0)
            : Math.max(
                Math.abs(parseAmountString(row.raw[headers.indexOf(debitCol)]) || 0),
                Math.abs(parseAmountString(row.raw[headers.indexOf(creditCol)]) || 0)
              ),
          transaction_type: type,
          category: 'other',
          payment_method: paymentCol ? (row.raw[headers.indexOf(paymentCol)] || 'Other') : 'Other',
          transaction_date: parseDateString(row.raw[headers.indexOf(dateCol)]) || '',
          notes: row.raw[headers.indexOf(merchantCol)] || null
        }

        const hasValidDate = !!newMapped.transaction_date
        const hasValidMerchant = !!newMapped.merchant
        const hasValidAmount = newMapped.amount > 0

        const isValid = hasValidDate && hasValidMerchant && hasValidAmount
        const isDup = isValid ? transactions.some(tx => 
          tx.merchant.toLowerCase().trim() === newMapped.merchant.toLowerCase().trim() &&
          Math.abs(tx.amount) === newMapped.amount &&
          tx.transaction_date.slice(0, 10) === newMapped.transaction_date &&
          (tx.notes === null || tx.notes.toLowerCase().trim() === (newMapped.notes || '').toLowerCase().trim())
        ) : false

        return {
          ...row,
          mapped: newMapped,
          valid: isValid,
          error: isValid ? null : 'Unresolved fields',
          isDuplicate: isDup,
          status: isValid ? (isDup ? 'duplicate' : 'valid') : 'invalid'
        }
      }
      return row
    }))
  }

  const updateCategory = (index: number, category: string) => {
    setValidatedRows(prev => prev.map((row, idx) => {
      if (idx === index && row.mapped) {
        return {
          ...row,
          mapped: {
            ...row.mapped,
            category
          }
        }
      }
      return row
    }))
  }

  // Import execution
  async function handleImport() {
    setStep('importing')
    setProgress(0)

    const validRows = validatedRows.filter(r => r.valid)
    const rowsToInsert: Partial<DBTransaction>[] = []
    let skippedDups = 0
    let skippedAmbig = validatedRows.filter(r => r.status === 'ambiguous').length

    validRows.forEach(r => {
      if (r.isDuplicate && skipDuplicates) {
        skippedDups++
      } else if (r.mapped) {
        rowsToInsert.push({
          ...r.mapped,
          user_id: userId // Associate user_id safeguard
        })
      }
    })

    const totalToInsert = rowsToInsert.length
    if (totalToInsert === 0) {
      setImportSummary({
        total: rawRows.length,
        imported: 0,
        duplicatesSkipped: skippedDups,
        invalidSkipped: validatedRows.filter(r => r.status === 'invalid').length,
        ambiguousSkipped: skippedAmbig
      })
      setStep('success')
      onSuccess()
      return
    }

    const supabase = createClient()
    const batchSize = 50
    let importedCount = 0

    try {
      // Safe batch insertion
      for (let i = 0; i < totalToInsert; i += batchSize) {
        const batch = rowsToInsert.slice(i, i + batchSize)
        const { error: insertErr } = await supabase
          .from('transactions')
          .insert(batch)

        if (insertErr) throw insertErr

        importedCount += batch.length
        setProgress(Math.round(((i + batch.length) / totalToInsert) * 100))
      }

      setImportSummary({
        total: rawRows.length,
        imported: importedCount,
        duplicatesSkipped: skippedDups,
        invalidSkipped: validatedRows.filter(r => r.status === 'invalid').length,
        ambiguousSkipped: skippedAmbig
      })
      setStep('success')
      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'Error occurred during bulk insert statement processing.')
      setStep('preview')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="border-border/60 hover:bg-muted/40 h-9 text-xs gap-1.5" />}>
        <Upload className="size-3.5" />
        Import Bank Statement
      </DialogTrigger>

      <DialogContent className="border border-border/80 bg-card/95 text-card-foreground shadow-2xl backdrop-blur-md max-w-4xl w-[95vw] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/40 shrink-0">
          <DialogTitle className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Import Bank Statement
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Upload a CSV statement from your bank. NexaFi will detect columns, clean merchant names, categorize transactions, and let you review before import.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Step 1: Upload Dropzone */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-border/70 hover:border-primary/50 rounded-xl p-10 text-center flex flex-col items-center justify-center gap-4 bg-muted/15 transition-all group cursor-pointer relative"
            >
              <Input
                id="bankCsvFile"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-150 shadow-inner">
                <Upload className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Drag & Drop your bank statement CSV here</p>
                <p className="text-xs text-muted-foreground">or click to browse local folders</p>
              </div>
            </div>

            {/* Privacy note */}
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground flex gap-2 items-start leading-normal">
              <ShieldCheck className="size-4.5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground font-medium block">Privacy Guarantee</strong>
                <span>Files are parsed in your browser and are not uploaded as raw statements. NexaFi will never ask for your bank login credentials or passwords.</span>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive flex items-center gap-1.5">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Mapping configuration */}
        {step === 'mapping' && (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 bg-muted/20 border border-border/40 rounded-lg p-3 text-xs leading-normal">
              <div className="flex justify-between sm:justify-start gap-4">
                <span className="text-muted-foreground">Statement File:</span>
                <span className="font-semibold text-foreground">{fileName} ({rawRows.length} rows)</span>
              </div>
              <div className="flex justify-between sm:justify-start gap-4 sm:border-l sm:border-border/40 sm:pl-4">
                <span className="text-muted-foreground">Detected Preset:</span>
                <span className="font-semibold text-primary">{detectedPreset}</span>
              </div>
            </div>

            {/* Manual preset override select */}
            <div className="grid gap-1.5">
              <Label htmlFor="preset-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Statement Preset</Label>
              <Select value={detectedPreset} onValueChange={handlePresetChange}>
                <SelectTrigger id="preset-select" className="bg-muted/15 border-border/50 h-9 text-xs">
                  <SelectValue placeholder="Choose bank format" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/80 text-foreground text-xs">
                  <SelectItem value="Generic bank CSV">Generic Bank CSV (Auto-Detect)</SelectItem>
                  {BANK_PRESETS.map(p => (
                    <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Column amount type */}
            <div className="grid gap-1.5 border-t border-border/40 pt-4">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount configuration</Label>
              <div className="flex gap-4 text-xs mt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={splitAmount === 'single'}
                    onChange={() => setSplitAmount('single')}
                    className="accent-primary"
                  />
                  <span>Single Amount Column</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={splitAmount === 'split'}
                    onChange={() => setSplitAmount('split')}
                    className="accent-primary"
                  />
                  <span>Separate Debit and Credit Columns</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
              {/* Merchant / Particulars */}
              <div className="grid gap-1.5">
                <Label htmlFor="merchant-col-map" className="text-xs font-medium text-muted-foreground">Particulars / Narration *</Label>
                <Select value={merchantCol} onValueChange={setMerchantCol}>
                  <SelectTrigger id="merchant-col-map" className="bg-muted/15 border-border/50 h-9 text-xs">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/80 text-foreground text-xs">
                    {headers.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="grid gap-1.5">
                <Label htmlFor="date-col-map" className="text-xs font-medium text-muted-foreground">Transaction Date *</Label>
                <Select value={dateCol} onValueChange={setDateCol}>
                  <SelectTrigger id="date-col-map" className="bg-muted/15 border-border/50 h-9 text-xs">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/80 text-foreground text-xs">
                    {headers.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Columns */}
              {splitAmount === 'single' ? (
                <>
                  <div className="grid gap-1.5">
                    <Label htmlFor="amount-col-map" className="text-xs font-medium text-muted-foreground">Amount Column *</Label>
                    <Select value={amountCol} onValueChange={setAmountCol}>
                      <SelectTrigger id="amount-col-map" className="bg-muted/15 border-border/50 h-9 text-xs">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border/80 text-foreground text-xs">
                        {headers.map(h => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="type-col-map" className="text-xs font-medium text-muted-foreground">Dr/Cr Indicator (Optional)</Label>
                    <Select value={typeCol} onValueChange={setTypeCol}>
                      <SelectTrigger id="type-col-map" className="bg-muted/15 border-border/50 h-9 text-xs">
                        <SelectValue placeholder="Infer from amount sign" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border/80 text-foreground text-xs">
                        <SelectItem value="_infer">Infer from amount sign</SelectItem>
                        {headers.filter(h => h !== amountCol).map(h => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-1.5">
                    <Label htmlFor="debit-col-map" className="text-xs font-medium text-muted-foreground">Debit Column (Withdrawals)</Label>
                    <Select value={debitCol} onValueChange={setDebitCol}>
                      <SelectTrigger id="debit-col-map" className="bg-muted/15 border-border/50 h-9 text-xs">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border/80 text-foreground text-xs">
                        <SelectItem value="_none">None</SelectItem>
                        {headers.map(h => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="credit-col-map" className="text-xs font-medium text-muted-foreground">Credit Column (Deposits)</Label>
                    <Select value={creditCol} onValueChange={setCreditCol}>
                      <SelectTrigger id="credit-col-map" className="bg-muted/15 border-border/50 h-9 text-xs">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border/80 text-foreground text-xs">
                        <SelectItem value="_none">None</SelectItem>
                        {headers.map(h => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Payment Mode */}
              <div className="grid gap-1.5">
                <Label htmlFor="payment-col-map" className="text-xs font-medium text-muted-foreground">Payment Mode / Type (Optional)</Label>
                <Select value={paymentCol} onValueChange={setPaymentCol}>
                  <SelectTrigger id="payment-col-map" className="bg-muted/15 border-border/50 h-9 text-xs">
                    <SelectValue placeholder="Default to 'Other'" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/80 text-foreground text-xs">
                    <SelectItem value="_none">Default to 'Other'</SelectItem>
                    {headers.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="grid gap-1.5">
                <Label htmlFor="notes-col-map" className="text-xs font-medium text-muted-foreground">Raw Remarks column (Optional)</Label>
                <Select value={notesCol} onValueChange={setNotesCol}>
                  <SelectTrigger id="notes-col-map" className="bg-muted/15 border-border/50 h-9 text-xs">
                    <SelectValue placeholder="Use particulars column" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/80 text-foreground text-xs">
                    <SelectItem value="_none">Use particulars column</SelectItem>
                    {headers.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Interactive scrollable Preview with Inline Edit */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center bg-muted/20 border border-border/40 rounded-lg p-3 text-xs leading-normal">
              <div>
                <p className="text-muted-foreground">
                  Summary: <strong className="text-primary">{validatedRows.filter(r => r.valid).length} valid</strong> rows ready,{' '}
                  <strong className="text-destructive">{validatedRows.filter(r => r.status === 'invalid').length} invalid</strong> skipped,{' '}
                  {validatedRows.some(r => r.status === 'ambiguous') && (
                    <strong className="text-blue-500 font-semibold">{validatedRows.filter(r => r.status === 'ambiguous').length} ambiguous (requires resolving type below)</strong>
                  )}{' '}
                  {validatedRows.some(r => r.isDuplicate) && (
                    <span className="text-amber-500 font-semibold">({validatedRows.filter(r => r.isDuplicate).length} duplicates flagged)</span>
                  )}
                </p>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-foreground shrink-0 font-medium mt-1 sm:mt-0 select-none">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="accent-primary size-3.5"
                />
                <span>Skip duplicates</span>
              </label>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Statement Preview & Inline Editor</span>
              <div className="border border-border/60 rounded-lg overflow-auto max-h-[320px] bg-muted/5 z-0">
                <table className="w-full min-w-[900px] text-xs text-left border-collapse">
                  <thead className="sticky top-0 bg-muted/95 border-b border-border/60 text-muted-foreground backdrop-blur-xs z-10">
                    <tr>
                      <th className="px-3 py-2 font-medium w-[25%] min-w-[200px]">Original Bank Narration</th>
                      <th className="px-3 py-2 font-medium w-[20%] min-w-[160px]">Cleaned Merchant</th>
                      <th className="px-3 py-2 font-medium w-[15%] min-w-[110px]">Amount</th>
                      <th className="px-3 py-2 font-medium w-[10%] min-w-[90px]">Type</th>
                      <th className="px-3 py-2 font-medium w-[18%] min-w-[150px]">Suggested Category</th>
                      <th className="px-3 py-2 font-medium w-[12%] min-w-[90px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-foreground/90">
                    {validatedRows.map((row, idx) => {
                      if (row.status === 'invalid') {
                        return (
                          <tr key={idx} className="bg-destructive/5 text-destructive">
                            <td className="px-3 py-2.5 font-medium max-w-[160px] truncate" title={row.raw[headers.indexOf(merchantCol)]}>
                              {row.raw[headers.indexOf(merchantCol)] || 'Unknown Narration'}
                            </td>
                            <td colSpan={4} className="px-3 py-2.5 font-semibold text-[10px] text-destructive-foreground">
                              Error: {row.error}
                            </td>
                            <td className="px-3 py-2.5 text-destructive font-medium flex items-center gap-1">
                              <AlertTriangle className="size-3.5" /> Skip
                            </td>
                          </tr>
                        )
                      }

                      // Mapped fields
                      const mapped = row.mapped!
                      return (
                        <tr key={idx} className={cn(
                          row.isDuplicate && skipDuplicates && "opacity-60",
                          row.status === 'ambiguous' && "bg-blue-500/5 text-blue-900 dark:text-blue-200"
                        )}>
                          {/* Narration */}
                          <td className="px-3 py-2.5 max-w-[160px] truncate text-[11px] text-muted-foreground" title={row.raw[headers.indexOf(merchantCol)]}>
                            {row.raw[headers.indexOf(merchantCol)]}
                          </td>
                          {/* Cleaned Merchant (Editable) */}
                          <td className="px-3 py-2">
                            <Input
                              value={mapped.merchant}
                              onChange={(e) => updateMerchant(idx, e.target.value)}
                              className="h-8 py-0.5 text-xs bg-background/50 focus-visible:ring-1 focus-visible:ring-primary/40 w-full min-w-[140px]"
                            />
                          </td>
                          {/* Amount */}
                          <td className="px-3 py-2 tabnum font-semibold text-foreground">
                            {formatINR(mapped.amount)}
                            <div className="text-[9px] text-muted-foreground mt-0.5">{mapped.transaction_date}</div>
                          </td>
                          {/* Transaction Type (Selectable) */}
                          <td className="px-3 py-2">
                            <select
                              value={mapped.transaction_type}
                              onChange={(e) => updateType(idx, e.target.value as 'income' | 'expense')}
                              className="h-8 rounded-md border border-input bg-background/50 px-1 py-0.5 text-xs outline-hidden w-full min-w-[85px]"
                            >
                              <option value="expense">Expense</option>
                              <option value="income">Income</option>
                            </select>
                          </td>
                          {/* Category select dropdown */}
                          <td className="px-3 py-2">
                            <select
                              value={mapped.category}
                              onChange={(e) => updateCategory(idx, e.target.value)}
                              className="h-8 w-full rounded-md border border-input bg-background/50 px-1 py-0.5 text-xs outline-hidden min-w-[130px]"
                            >
                              {categoryList.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          {/* Status Badge */}
                          <td className="px-3 py-2.5">
                            {row.status === 'ambiguous' ? (
                              <span className="text-blue-500 font-semibold flex items-center gap-0.5 text-[10px]" title="Resolve by selecting correct Transaction Type">
                                <HelpCircle className="size-3.5" /> Ambiguous
                              </span>
                            ) : row.isDuplicate ? (
                              <span className="text-amber-500 font-semibold flex items-center gap-0.5 text-[10px]">
                                <AlertTriangle className="size-3.5" /> Duplicate
                              </span>
                            ) : (
                              <span className="text-primary font-semibold flex items-center gap-0.5 text-[10px]">
                                <CheckCircle2 className="size-3.5" /> Ready
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Importing loader */}
        {step === 'importing' && (
          <div className="py-14 flex flex-col items-center justify-center gap-4">
            <Loader2 className="size-8 text-primary animate-spin" />
            <div className="w-full max-w-xs space-y-2">
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-center text-muted-foreground font-semibold">Bulk inserting statement transactions... {progress}%</p>
            </div>
          </div>
        )}

        {/* Step 5: Success Summary */}
        {step === 'success' && (
          <div className="py-4 flex flex-col items-center justify-center text-center gap-4">
            <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold tracking-tight text-foreground">Statement Processed</h3>
              <p className="text-xs text-muted-foreground">Transactions have been loaded and cleaned in your database workspace.</p>
            </div>

            <div className="bg-muted/15 border border-border/50 rounded-lg p-4 text-xs max-w-sm w-full divide-y divide-border/20 space-y-2.5">
              <div className="flex justify-between items-center pb-2">
                <span className="text-muted-foreground font-medium">Total Rows Scanned</span>
                <span className="font-semibold text-foreground">{importSummary.total}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-primary font-bold">Successfully Mapped & Imported</span>
                <span className="font-bold text-primary">+{importSummary.imported}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Duplicates Flagged & Skipped</span>
                <span className="font-semibold text-foreground">{importSummary.duplicatesSkipped}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-destructive font-medium">Invalid Rows Skipped</span>
                <span className="font-semibold text-destructive">{importSummary.invalidSkipped}</span>
              </div>
              {importSummary.ambiguousSkipped > 0 && (
                <div className="flex justify-between items-center pt-2.5">
                  <span className="text-blue-500 font-medium">Unresolved Ambiguous Skipped</span>
                  <span className="font-semibold text-blue-500">{importSummary.ambiguousSkipped}</span>
                </div>
              )}
            </div>
          </div>
        )}

        </div>

        {/* Footer controls */}
        <DialogFooter className="p-6 pt-4 border-t border-border/40 shrink-0 flex gap-2 sm:justify-between">
          <div>
            {step === 'mapping' && (
              <Button type="button" variant="outline" onClick={() => setStep('upload')} className="border-border/60 hover:bg-muted/40 h-9 px-4 text-xs">
                Back to Upload
              </Button>
            )}
            {step === 'preview' && (
              <Button type="button" variant="outline" onClick={() => setStep('mapping')} className="border-border/60 hover:bg-muted/40 h-9 px-4 text-xs">
                Back to Mapping
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step !== 'importing' && step !== 'success' && (
              <DialogClose render={<Button type="button" variant="outline" className="border-border/60 hover:bg-muted/40 h-9 px-4 text-xs" />}>
                Cancel
              </DialogClose>
            )}
            {step === 'mapping' && (
              <Button type="button" onClick={handleMapColumns} className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 font-medium px-4 text-xs gap-1">
                Process Mappings
                <ChevronRight className="size-4" />
              </Button>
            )}
            {step === 'preview' && (
              <Button
                type="button"
                onClick={handleImport}
                disabled={validatedRows.filter(r => r.valid).length === 0}
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 font-medium px-4 text-xs gap-1"
              >
                Confirm Import
                <ArrowRight className="size-4" />
              </Button>
            )}
            {step === 'success' && (
              <DialogClose render={<Button type="button" className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 font-medium px-5 text-xs" />}>
                Done
              </DialogClose>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
