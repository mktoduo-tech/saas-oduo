"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { Bell, Search, Menu, LogOut, User, Settings, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

interface HeaderProps {
    user?: {
        name?: string | null
        email?: string | null
        image?: string | null
    }
    onMenuClick?: () => void
}

export function Header({ user, onMenuClick }: HeaderProps) {
    const router = useRouter()
    const [notificationsOpen, setNotificationsOpen] = useState(false)

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/login" })
    }

    // Notifications mock data
    const notifications = [
        { id: 1, title: "Nova reserva", message: "Cliente João fez uma nova reserva", time: "5 min" },
        { id: 2, title: "Pagamento recebido", message: "Pagamento de R$ 150,00 confirmado", time: "1h" },
        { id: 3, title: "Equipamento devolvido", message: "Betoneira 400L foi devolvida", time: "2h" },
    ]

    return (
        <div className="border-b border-white/10 bg-gray-900/50 backdrop-blur-xl h-16 px-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden text-zinc-400 hover:text-white" onClick={onMenuClick}>
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="hidden md:flex items-center relative">
                    <Search className="absolute left-3 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Buscar..."
                        className="pl-9 w-64 bg-black/20 border-white/5 focus:border-blue-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-white hover:bg-white/5">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="bg-gray-900 border-white/10">
                        <SheetHeader>
                            <SheetTitle className="text-white">Notificações</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6 space-y-4">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-white text-sm">{notification.title}</h4>
                                        <span className="text-xs text-zinc-500">{notification.time}</span>
                                    </div>
                                    <p className="text-sm text-zinc-400 mt-1">{notification.message}</p>
                                </div>
                            ))}
                            {notifications.length === 0 && (
                                <p className="text-center text-zinc-500 py-8">Nenhuma notificação</p>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>

                <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block" />

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-white/10 hover:ring-white/20 transition-all p-0 overflow-hidden">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-medium">
                                    {user?.name?.slice(0, 2).toUpperCase() || "US"}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-gray-900/95 backdrop-blur-xl border-white/10 text-zinc-200" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-white">{user?.name}</p>
                                <p className="text-xs leading-none text-zinc-400">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                            <Link href="/configuracoes" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Perfil
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                            <Link href="/configuracoes" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Configurações
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                            <Link href="/financeiro" className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Faturamento
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer flex items-center gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Sair
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
