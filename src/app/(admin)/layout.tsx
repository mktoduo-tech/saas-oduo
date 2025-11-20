import "@/app/globals.css"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Providers } from "./providers"
import { AdminLayoutClient } from "@/components/admin/admin-layout-client"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <Providers>
      <AdminLayoutClient
        tenantName={session.user.tenantName || ""}
        userName={session.user.name || ""}
        userEmail={session.user.email || ""}
      >
        {children}
      </AdminLayoutClient>
    </Providers>
  )
}
