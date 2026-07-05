'use client'

import * as React from 'react'
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Receipt,
  RotateCcw,
  Sparkles,
  MoreHorizontal,
  Edit,
  Trash,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AddTransactionDialog } from './add-transaction-dialog'
import { EditTransactionDialog } from './edit-transaction-dialog'
import { DeleteTransactionDialog } from './delete-transaction-dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { categories, categoryList, type CategoryId } from '@/lib/data'
import { formatINR, formatDate } from '@/lib/format'
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
  created_at: string
  updated_at: string
}

export function TransactionsClient({ userId }: { userId: string }) {
  const [transactions, setTransactions] = React.useState<DBTransaction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Dialog states
  const [editingTransaction, setEditingTransaction] = React.useState<DBTransaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = React.useState<DBTransaction | null>(null)

  // Filters state
  const [search, setSearch] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all')
  const [typeFilter, setTypeFilter] = React.useState<string>('all')

  const fetchTransactions = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setTransactions(data || [])
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch transactions.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  React.useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setTypeFilter('all')
  }

  // Client-side filtering logic
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.merchant.toLowerCase().includes(search.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(search.toLowerCase()))

      const matchesCategory =
        categoryFilter === 'all' || tx.category === categoryFilter

      const matchesType =
        typeFilter === 'all' || tx.transaction_type === typeFilter

      return matchesSearch && matchesCategory && matchesType
    })
  }, [transactions, search, categoryFilter, typeFilter])

  // Summary Metrics
  const metrics = React.useMemo(() => {
    let income = 0
    let expense = 0
    transactions.forEach((tx) => {
      if (tx.transaction_type === 'income') {
        income += tx.amount
      } else {
        expense += tx.amount
      }
    })
    return {
      totalIncome: income,
      totalExpense: expense,
      netCashflow: income - expense,
    }
  }, [transactions])

  const hasActiveFilters = search !== '' || categoryFilter !== 'all' || typeFilter !== 'all'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage, filter, and track all your income and expenses in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddTransactionDialog userId={userId} onSuccess={fetchTransactions} />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Summary Cards (Only show if there are transactions in the workspace) */}
      {transactions.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="relative overflow-hidden border border-border/80 bg-card/90 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Income</span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ArrowUpRight className="size-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="tabnum text-2xl font-bold tracking-tight text-foreground">
                {formatINR(metrics.totalIncome)}
              </span>
            </div>
          </Card>

          <Card className="relative overflow-hidden border border-border/80 bg-card/90 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Expenses</span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <ArrowDownRight className="size-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="tabnum text-2xl font-bold tracking-tight text-foreground">
                {formatINR(metrics.totalExpense)}
              </span>
            </div>
          </Card>

          <Card className="relative overflow-hidden border border-border/80 bg-card/90 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Net Cashflow</span>
              <div className={cn(
                "flex size-8 items-center justify-center rounded-lg",
                metrics.netCashflow >= 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
              )}>
                <TrendingUp className="size-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className={cn(
                "tabnum text-2xl font-bold tracking-tight",
                metrics.netCashflow >= 0 ? "text-primary" : "text-destructive"
              )}>
                {metrics.netCashflow >= 0 ? '+' : ''}{formatINR(metrics.netCashflow)}
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Main Table and Filter Area */}
      <Card className="border border-border/80 bg-card/90 shadow-xl backdrop-blur-sm">
        {/* Search and Filters Bar */}
        <div className="flex flex-col gap-4 border-b border-border/80 p-5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search merchants or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-muted/15 border-border/50 pl-9 focus-visible:ring-primary/40 h-10 w-full"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="size-3.5 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={(v) => { if (v) setCategoryFilter(v) }}>
                <SelectTrigger className="bg-muted/15 border-border/50 focus:ring-primary/40 h-10 w-[150px] text-left">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/80 text-foreground">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryList.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={(v) => { if (v) setTypeFilter(v) }}>
              <SelectTrigger className="bg-muted/15 border-border/50 focus:ring-primary/40 h-10 w-[130px] text-left">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/80 text-foreground">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
                className="h-10 hover:bg-muted/30 text-muted-foreground hover:text-foreground px-3"
              >
                <RotateCcw className="size-3.5 mr-1.5" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <span className="size-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <p className="text-sm font-medium">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          /* Empty State: No Transactions Exist at all */
          <div className="flex flex-col items-center justify-center text-center p-12 py-20 max-w-md mx-auto">
            <div className="relative flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary shadow-inner">
              <Sparkles className="size-7 animate-pulse text-primary" />
            </div>
            <h3 className="mt-6 text-lg font-semibold tracking-tight text-foreground">
              No transactions recorded yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Start building your financial workspace by recording your first real transaction now.
            </p>
            <div className="mt-6">
              <AddTransactionDialog userId={userId} onSuccess={fetchTransactions} />
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          /* Empty Filter State: Filter results yield empty */
          <div className="flex flex-col items-center justify-center text-center p-12 py-20 max-w-sm mx-auto">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted/30 text-muted-foreground">
              <Receipt className="size-6" />
            </div>
            <h3 className="mt-4 text-md font-medium text-foreground">
              No transactions found
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Try adjusting your search criteria or filters to find what you are looking for.
            </p>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="mt-4 border-border/60 hover:bg-muted/40"
            >
              Clear filters
            </Button>
          </div>
        ) : (
          /* Transactions Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/5">
                  <th className="p-4 pl-6">Merchant</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 pr-6 text-right w-[80px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-sm">
                {filteredTransactions.map((tx) => {
                  const catId = tx.category as CategoryId
                  const cat = categories[catId] || {
                    label: tx.category,
                    icon: Receipt,
                    color: 'var(--chart-3)',
                  }
                  const IconComponent = cat.icon
                  const isIncome = tx.transaction_type === 'income'

                  return (
                    <tr
                      key={tx.id}
                      className="group hover:bg-muted/10 transition-colors duration-150"
                    >
                      {/* Merchant & Notes */}
                      <td className="p-4 pl-6">
                        <div className="font-medium text-foreground leading-tight">{tx.merchant}</div>
                        {tx.notes && (
                          <div className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">
                            {tx.notes}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span
                          style={{
                            color: cat.color,
                            backgroundColor: `${cat.color}15`,
                            borderColor: `${cat.color}25`,
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
                        >
                          <IconComponent className="size-3.5" />
                          {cat.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-muted-foreground whitespace-nowrap">
                        {formatDate(tx.transaction_date)}
                      </td>

                      {/* Payment Method */}
                      <td className="p-4 text-muted-foreground font-medium">
                        {tx.payment_method}
                      </td>

                      {/* Type */}
                      <td className="p-4">
                        <span className={cn(
                          "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border",
                          isIncome
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-muted text-muted-foreground border-border/40"
                        )}>
                          {isIncome ? 'Income' : 'Expense'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="p-4 text-right">
                        <span className={cn(
                          "tabnum font-semibold text-base tracking-tight",
                          isIncome ? "text-primary" : "text-foreground/90"
                        )}>
                          {isIncome ? '+' : '-'}{formatINR(tx.amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="hover:bg-muted/40 text-muted-foreground hover:text-foreground rounded-md h-7 w-7"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent className="w-32 bg-card border border-border/80 text-foreground" align="end">
                            <DropdownMenuItem
                              onClick={() => setEditingTransaction(tx)}
                              className="cursor-pointer gap-2"
                            >
                              <Edit className="size-3.5 text-muted-foreground" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingTransaction(tx)}
                              className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                              <Trash className="size-3.5" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit and Delete Dialogs */}
      <EditTransactionDialog
        transaction={editingTransaction}
        open={!!editingTransaction}
        onOpenChange={(open) => { if (!open) setEditingTransaction(null) }}
        userId={userId}
        onSuccess={fetchTransactions}
      />
      <DeleteTransactionDialog
        transaction={deletingTransaction}
        open={!!deletingTransaction}
        onOpenChange={(open) => { if (!open) setDeletingTransaction(null) }}
        userId={userId}
        onSuccess={fetchTransactions}
      />
    </div>
  )
}
