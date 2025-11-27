import type { Metadata } from "next";
import { Open_Sans, Poppins, Montserrat } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const openSans = Open_Sans({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
});

const poppins = Poppins({
    weight: ["400", "500", "600", "700"],
    subsets: ["latin"],
    variable: "--font-headline",
    display: "swap",
});

const montserrat = Montserrat({
    subsets: ["latin"],
    variable: "--font-body",
    display: "swap",
});

export const metadata: Metadata = {
    title: "ODuoLoc - Gestão de Locação Reinventada",
    description: "Plataforma completa para gerenciar suas reservas, equipamentos e clientes",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" className="dark">
            <body className={cn(
                openSans.variable,
                poppins.variable,
                montserrat.variable,
                "min-h-screen bg-background antialiased"
            )}>
                {children}
                <Toaster />
            </body>
        </html>
    );
}
