"use client"

import { useState, useEffect } from "react"
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, CreditCard, AlertCircle, CheckCircle, FileText, Download, Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Transaction {
  id: string
  type: "income" | "expense"
  category: string
  description: string
  amount: number
  date: string
  status: "paid" | "pending" | "overdue"
  dueDate?: string
  paymentMethod?: string
}

interface DREData {
  receitas: { label: string; value: number }[]
  despesas: { label: string; value: number }[]
}

interface FinancialStats {
  transactions: Transaction[]
  dre: DREData
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
    pendingIncome: number
    pendingExpense: number
    overdueCount: number
    totalReceitas: number
    totalDespesas: number
    lucroLiquido: number
    margemLucro: string
  }
}

export default function FinanceiroPage() {
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [createDialog, setCreateDialog] = useState(false)
  const [transactionType, setTransactionType] = useState("")

  useEffect(() => {
    fetchFinancialData()
  }, [])

  const fetchFinancialData = async () => {
    try {
      const response = await fetch("/api/financial/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Erro ao buscar dados financeiros:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTransaction = () => {
    toast.success("Funcionalidade em desenvolvimento")
    setCreateDialog(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-600">Pago</Badge>
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>
      case "overdue":
        return <Badge variant="destructive">Vencido</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const transactions = stats?.transactions || []
  const dre = stats?.dre || { receitas: [], despesas: [] }
  const summary = stats?.summary || {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    pendingIncome: 0,
    pendingExpense: 0,
    overdueCount: 0,
    totalReceitas: 0,
    totalDespesas: 0,
    lucroLiquido: 0,
    margemLucro: "0",
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 font-headline tracking-wide">ODuo Finance</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gestão Financeira Completa
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
          <Dialog open={createDialog} onOpenChange={setCreateDialog}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Transação</DialogTitle>
                <DialogDescription>
                  Adicione uma receita ou despesa
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select value={transactionType} onValueChange={setTransactionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    placeholder="Ex: Aluguel de Equipamento"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1000.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="locacao">Locação</SelectItem>
                      <SelectItem value="servico">Serviço</SelectItem>
                      <SelectItem value="fornecedor">Fornecedor</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="salario">Salário</SelectItem>
                      <SelectItem value="operacional">Operacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data de Vencimento *</Label>
                  <Input
                    id="date"
                    type="date"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateTransaction} className="flex-1">
                    Criar Transação
                  </Button>
                  <Button variant="outline" onClick={() => setCreateDialog(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {summary.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.balance >= 0 ? "Positivo" : "Negativo"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {summary.totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              A receber: R$ {summary.pendingIncome.toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {summary.totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              A pagar: R$ {summary.pendingExpense.toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Alertas</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.overdueCount}</div>
            <p className="text-xs text-muted-foreground">
              {summary.overdueCount === 1 ? "Conta vencida" : "Contas vencidas"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="cashflow" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full grid grid-cols-2 lg:grid-cols-4 h-auto gap-1">
          <TabsTrigger value="cashflow" className="text-xs sm:text-sm">
            <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Fluxo de Caixa</span>
            <span className="sm:hidden">Fluxo</span>
          </TabsTrigger>
          <TabsTrigger value="receivables" className="text-xs sm:text-sm">
            <TrendingUp className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Contas a Receber</span>
            <span className="sm:hidden">Receber</span>
          </TabsTrigger>
          <TabsTrigger value="payables" className="text-xs sm:text-sm">
            <TrendingDown className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Contas a Pagar</span>
            <span className="sm:hidden">Pagar</span>
          </TabsTrigger>
          <TabsTrigger value="dre" className="text-xs sm:text-sm">
            <FileText className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            DRE
          </TabsTrigger>
        </TabsList>

        {/* Fluxo de Caixa */}
        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-headline tracking-wide">Fluxo de Caixa</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Todas as movimentações financeiras</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div
                          className={`p-2 rounded-full flex-shrink-0 ${
                            transaction.type === "income"
                              ? "bg-green-100 dark:bg-green-900"
                              : "bg-red-100 dark:bg-red-900"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                            <h3 className="font-medium text-sm sm:text-base truncate">{transaction.description}</h3>
                            {getStatusBadge(transaction.status)}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-muted-foreground">
                            <span>{transaction.category}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>
                              {new Date(transaction.date).toLocaleDateString("pt-BR")}
                            </span>
                            {transaction.dueDate && transaction.status !== "paid" && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span className="text-[10px] sm:text-xs">
                                  Vence:{" "}
                                  {new Date(transaction.dueDate).toLocaleDateString("pt-BR")}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-base sm:text-lg font-bold text-right sm:text-left ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}R${" "}
                        {transaction.amount.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma transação encontrada</p>
                  <p className="text-sm mt-2">As transações aparecerão aqui quando houver reservas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contas a Receber */}
        <TabsContent value="receivables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-headline tracking-wide">Contas a Receber</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Total: R$ {summary.pendingIncome.toLocaleString("pt-BR")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions
                  .filter(t => t.type === "income" && t.status === "pending")
                  .map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base mb-1 truncate">{transaction.description}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Vencimento:{" "}
                          {transaction.dueDate
                            ? new Date(transaction.dueDate).toLocaleDateString("pt-BR")
                            : "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                        <div className="text-base sm:text-lg font-bold text-green-600">
                          R${" "}
                          {transaction.amount.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => toast.success("Funcionalidade em desenvolvimento")}
                          className="text-xs sm:text-sm"
                        >
                          <CheckCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Receber</span>
                          <span className="sm:hidden">✓</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                {transactions.filter(t => t.type === "income" && t.status === "pending")
                  .length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">
                    Nenhuma conta a receber
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contas a Pagar */}
        <TabsContent value="payables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-headline tracking-wide">Contas a Pagar</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Total: R$ {summary.pendingExpense.toLocaleString("pt-BR")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions
                  .filter(
                    t =>
                      t.type === "expense" &&
                      (t.status === "pending" || t.status === "overdue")
                  )
                  .map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg ${
                        transaction.status === "overdue"
                          ? "border-red-300 bg-red-50 dark:bg-red-950"
                          : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <h3 className="font-medium text-sm sm:text-base truncate">{transaction.description}</h3>
                          {getStatusBadge(transaction.status)}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Vencimento:{" "}
                          {transaction.dueDate
                            ? new Date(transaction.dueDate).toLocaleDateString("pt-BR")
                            : "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                        <div className="text-base sm:text-lg font-bold text-red-600">
                          R${" "}
                          {transaction.amount.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        <Button
                          size="sm"
                          variant={transaction.status === "overdue" ? "destructive" : "default"}
                          onClick={() => toast.success("Funcionalidade em desenvolvimento")}
                          className="text-xs sm:text-sm"
                        >
                          <CreditCard className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Pagar</span>
                          <span className="sm:hidden">💳</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                {transactions.filter(
                  t =>
                    t.type === "expense" &&
                    (t.status === "pending" || t.status === "overdue")
                ).length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">
                    Nenhuma conta a pagar
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DRE */}
        <TabsContent value="dre" className="space-y-4">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs sm:text-sm font-medium">Receitas Totais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  R$ {summary.totalReceitas.toLocaleString("pt-BR")}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xs sm:text-sm font-medium">Despesas Totais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-red-600">
                  R$ {summary.totalDespesas.toLocaleString("pt-BR")}
                </div>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-xs sm:text-sm font-medium">Lucro Líquido</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-xl sm:text-2xl font-bold ${
                    summary.lucroLiquido >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  R$ {summary.lucroLiquido.toLocaleString("pt-BR")}
                </div>
                <p className="text-xs text-muted-foreground">
                  Margem: {summary.margemLucro}%
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-headline tracking-wide">Receitas</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Detalhamento das receitas</CardDescription>
              </CardHeader>
              <CardContent>
                {dre.receitas.length > 0 ? (
                  <div className="space-y-4">
                    {dre.receitas.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs sm:text-sm">
                          <span className="font-medium sm:font-normal">{item.label}</span>
                          <span className="font-medium text-green-600">
                            R$ {item.value.toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-600"
                            style={{
                              width: `${summary.totalReceitas > 0 ? (item.value / summary.totalReceitas) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">Nenhuma receita registrada</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-headline tracking-wide">Despesas</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Detalhamento das despesas</CardDescription>
              </CardHeader>
              <CardContent>
                {dre.despesas.length > 0 ? (
                  <div className="space-y-4">
                    {dre.despesas.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs sm:text-sm">
                          <span className="font-medium sm:font-normal">{item.label}</span>
                          <span className="font-medium text-red-600">
                            R$ {item.value.toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-600"
                            style={{
                              width: `${summary.totalDespesas > 0 ? (item.value / summary.totalDespesas) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">Nenhuma despesa registrada</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary/10 dark:bg-primary/20 border-primary/30 dark:border-primary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                Análise de Saúde Financeira
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs sm:text-sm space-y-2 text-foreground">
              <p>
                ✓ Sua empresa está com fluxo de caixa {summary.balance >= 0 ? "positivo" : "negativo"}
              </p>
              <p>
                ✓ Margem de lucro de {summary.margemLucro}%{" "}
                {parseFloat(summary.margemLucro) > 15 ? "(saudável)" : "(atenção necessária)"}
              </p>
              <p>
                {summary.overdueCount > 0
                  ? `⚠ Atenção: ${summary.overdueCount} conta(s) vencida(s)`
                  : "✓ Nenhuma conta vencida"}
              </p>
              <p className="break-words">
                ✓ Previsão de caixa para próximo mês: R${" "}
                {(summary.balance + summary.pendingIncome - summary.pendingExpense).toLocaleString("pt-BR")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
