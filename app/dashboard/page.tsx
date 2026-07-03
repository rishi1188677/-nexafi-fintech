"use client"

import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { CashflowChart } from "@/components/dashboard/cashflow-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { ScoreRing } from "@/components/dashboard/score-ring"
import { InsightList, InsightHeader } from "@/components/dashboard/insight-list"
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog"
import { useDashboardStore } from "@/components/dashboard/store"
import { categories, goals } from "@/lib/data"
import { formatINR, relativeDay } from "@/lib/format"

export default function OverviewPage() {
  const { stats, transactions, budgets } = useDashboardStore()

  const spendByCategory = budgets
    .map((b) => ({ name: categories[b.category].label, value: b.spent }))
    .sort((a, b) => b.value - a.value)

  const recent = transactions.slice(0, 6)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Overview" description="Your financial snapshot for March 2026.">
        <AddTransactionDialog />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total balance" value={formatINR(stats.totalBalance)} change={4.2} icon={Wallet} />
        <StatCard label="Income this month" value={formatINR(stats.monthlyIncome)} change={6.1} icon={TrendingUp} />
        <StatCard
          label="Spending this month"
          value={formatINR(stats.monthlyExpenses)}
          change={-3.4}
          icon={TrendingDown}
        />
        <StatCard label="Savings rate" value={`${stats.savingsRate}%`} change={2.8} icon={PiggyBank} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cash flow</CardTitle>
            <p className="text-sm text-muted-foreground">Income vs. expenses over the last 6 months</p>
          </CardHeader>
          <CardContent>
            <CashflowChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial health</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <ScoreRing score={stats.healthScore} />
            <p className="text-center text-sm text-muted-foreground text-pretty">
              A strong score. Keeping your savings rate above 30% is boosting your resilience.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Spending by category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={spendByCategory} />
            <div className="mt-4 flex flex-col gap-2">
              {spendByCategory.slice(0, 4).map((c) => (
                <div key={c.name} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="tabnum font-medium">{formatINR(c.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent transactions</CardTitle>
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/dashboard/transactions" />}>
              View all
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border/60">
            {recent.map((t) => {
              const cat = categories[t.category]
              const Icon = cat.icon
              const income = t.amount > 0
              return (
                <div key={t.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.merchant}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {cat.label} • {relativeDay(t.date)}
                    </p>
                  </div>
                  <span className={`tabnum text-sm font-medium ${income ? "text-primary" : "text-foreground"}`}>
                    {income ? "+" : "-"}
                    {formatINR(Math.abs(t.amount))}
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <InsightHeader />
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/dashboard/insights" />}>
              Explore
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <InsightList limit={3} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Goals</CardTitle>
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/dashboard/goals" />}>
              <ArrowUpRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {goals.slice(0, 3).map((g) => {
              const pct = Math.round((g.saved / g.target) * 100)
              return (
                <div key={g.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">{g.name}</span>
                    <span className="tabnum text-muted-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} />
                  <p className="tabnum mt-1 text-xs text-muted-foreground">
                    {formatINR(g.saved)} of {formatINR(g.target)}
                  </p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
