"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { Bell, Search, Menu, LogOut, User, Settings, CreditCard, Loader2 } from "lucide-react"
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

interface Notification {
    id: string
    type: "info" | "warning" | "success"
    title: string
    message: string
    time: string
    link?: string
}

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
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loadingNotifications, setLoadingNotifications] = useState(true)

    useEffect(() => {
        fetchNotifications()
        // Atualizar notificações a cada 2 minutos
        const interval = setInterval(fetchNotifications, 120000)
        return () => clearInterval(interval)
    }, [])

    const fetchNotifications = async () => {
        try {
            const response = await fetch("/api/notifications")
            if (response.ok) {
                const data = await response.json()
                setNotifications(data.notifications || [])
                setUnreadCount(data.unreadCount || 0)
            }
        } catch (error) {
            console.error("Erro ao buscar notificações:", error)
        } finally {
            setLoadingNotifications(false)
        }
    }

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/login" })
    }

    const handleNotificationClick = (notification: Notification) => {
        if (notification.link) {
            router.push(notification.link)
            setNotificationsOpen(false)
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "warning":
                return "⚠️"
            case "success":
                return "✅"
            default:
                return "ℹ️"
        }
    }

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
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] flex items-center justify-center text-[10px] font-bold text-white">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="bg-gray-900 border-white/10">
                        <SheetHeader>
                            <SheetTitle className="text-white">Notificações</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6 space-y-4">
                            {loadingNotifications ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                            notification.type === "warning"
                                                ? "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20"
                                                : notification.type === "success"
                                                ? "bg-green-500/10 hover:bg-green-500/20 border border-green-500/20"
                                                : "bg-white/5 hover:bg-white/10"
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <span>{getNotificationIcon(notification.type)}</span>
                                                <h4 className="font-medium text-white text-sm">{notification.title}</h4>
                                            </div>
                                            <span className="text-xs text-zinc-500">{notification.time}</span>
                                        </div>
                                        <p className="text-sm text-zinc-400 mt-1 pl-6">{notification.message}</p>
                                    </div>
                                ))
                            ) : (
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
