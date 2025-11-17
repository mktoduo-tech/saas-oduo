"use client"

import { useState } from "react"
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, CreditCard, AlertCircle, CheckCircle, Clock, FileText, Download } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
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

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    category: "Locação",
    description: "Aluguel Betoneira - Cliente João Silva",
    amount: 1200,
    date: "2024-01-15",
    status: "paid",
    paymentMethod: "PIX",
  },
  {
    id: "2",
    type: "expense",
    category: "Fornecedor",
    description: "Compra Peças de Reposição",
    amount: 3500,
    date: "2024-01-10",
    status: "paid",
    paymentMethod: "Boleto",
  },
  {
    id: "3",
    type: "income",
    category: "Locação",
    description: "Aluguel Escavadeira - Cliente Maria Santos",
    amount: 8500,
    date: "2024-01-20",
    status: "pending",
    dueDate: "2024-02-05",
  },
  {
    id: "4",
    type: "expense",
    category: "Manutenção",
    description: "Manutenção Preventiva Equipamentos",
    amount: 2200,
    date: "2024-01-05",
    status: "paid",
    paymentMethod: "Cartão Crédito",
  },
  {
    id: "5",
    type: "income",
    category: "Locação",
    description: "Aluguel Guindaste - Cliente Carlos Oliveira",
    amount: 15000,
    date: "2024-01-25",
    status: "pending",
    dueDate: "2024-02-10",
  },
  {
    id: "6",
    type: "expense",
    category: "Operacional",
    description: "Combustível e Lubrificantes",
    amount: 1800,
    date: "2024-01-12",
    status: "overdue",
    dueDate: "2024-01-20",
  },
  {
    id: "7",
    type: "expense",
    category: "Salário",
    description: "Folha de Pagamento Janeiro",
    amount: 12000,
    date: "2024-01-30",
    status: "pending",
    dueDate: "2024-02-05",
  },
  {
    id: "8",
    type: "income",
    category: "Locação",
    description: "Aluguel Equipamentos Diversos - Cliente Ana Costa",
    amount: 4200,
    date: "2024-01-18",
    status: "paid",
    paymentMethod: "PIX",
  },
]

interface DREData {
  receitas: { label: string; value: number }[]
  despesas: { label: string; value: number }[]
}

const mockDRE: DREData = {
  receitas: [
    { label: "Receita de Locações", value: 45000 },
    { label: "Receita de Serviços", value: 8500 },
    { label: "Outras Receitas", value: 2300 },
  ],
  despesas: [
    { label: "Custos Operacionais", value: 12000 },
    { label: "Salários e Encargos", value: 18000 },
    { label: "Manutenção", value: 5500 },
    { label: "Marketing", value: 3200 },
    { label: "Despesas Administrativas", value: 4800 },
    { label: "Impostos", value: 6200 },
  ],
}

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [createDialog, setCreateDialog] = useState(false)
  const [transactionType, setTransactionType] = useState("")

  // Calcular métricas
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  const pendingIncome = transactions
    .filter(t => t.type === "income" && t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingExpense = transactions
    .filter(t => t.type === "expense" && (t.status === "pending" || t.status === "overdue"))
    .reduce((sum, t) => sum + t.amount, 0)

  const overdueCount = transactions.filter(t => t.status === "overdue").length

  // DRE Calculations
  const totalReceitas = mockDRE.receitas.reduce((sum, r) => sum + r.value, 0)
  const totalDespesas = mockDRE.despesas.reduce((sum, d) => sum + d.value, 0)
  const lucroLiquido = totalReceitas - totalDespesas
  const margemLucro = totalReceitas > 0 ? ((lucroLiquido / totalReceitas) * 100).toFixed(1) : "0"

  const handleCreateTransaction = () => {
    toast.success("Transação criada com sucesso! (exemplo)")
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 font-headline tracking-wide">ODuo Finance</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            BPO + SaaS - Gestão Financeira Completa
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
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {balance >= 0 ? "Positivo" : "Negativo"}
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
              R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              A receber: R$ {pendingIncome.toLocaleString("pt-BR")}
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
              R$ {totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              A pagar: R$ {pendingExpense.toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Alertas</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{overdueCount}</div>
            <p className="text-xs text-muted-foreground">
              {overdueCount === 1 ? "Conta vencida" : "Contas vencidas"}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contas a Receber */}
        <TabsContent value="receivables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-headline tracking-wide">Contas a Receber</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Total: R$ {pendingIncome.toLocaleString("pt-BR")}
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
                          onClick={() => toast.success("Marcar como pago (exemplo)")}
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
                Total: R$ {pendingExpense.toLocaleString("pt-BR")}
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
                          onClick={() => toast.success("Marcar como pago (exemplo)")}
                          className="text-xs sm:text-sm"
                        >
                          <CreditCard className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Pagar</span>
                          <span className="sm:hidden">💳</span>
                        </Button>
                      </div>
                    </div>
                  ))}
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
                  R$ {totalReceitas.toLocaleString("pt-BR")}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xs sm:text-sm font-medium">Despesas Totais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-red-600">
                  R$ {totalDespesas.toLocaleString("pt-BR")}
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
                    lucroLiquido >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  R$ {lucroLiquido.toLocaleString("pt-BR")}
                </div>
                <p className="text-xs text-muted-foreground">
                  Margem: {margemLucro}%
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
                <div className="space-y-4">
                  {mockDRE.receitas.map((item, index) => (
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
                            width: `${(item.value / totalReceitas) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-headline tracking-wide">Despesas</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Detalhamento das despesas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDRE.despesas.map((item, index) => (
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
                            width: `${(item.value / totalDespesas) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
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
                ✓ Sua empresa está com fluxo de caixa {balance >= 0 ? "positivo" : "negativo"}
              </p>
              <p>
                ✓ Margem de lucro de {margemLucro}%{" "}
                {parseFloat(margemLucro) > 15 ? "(saudável)" : "(atenção necessária)"}
              </p>
              <p>
                {overdueCount > 0
                  ? `⚠ Atenção: ${overdueCount} conta(s) vencida(s)`
                  : "✓ Nenhuma conta vencida"}
              </p>
              <p className="break-words">
                ✓ Previsão de caixa para próximo mês: R${" "}
                {(balance + pendingIncome - pendingExpense).toLocaleString("pt-BR")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
