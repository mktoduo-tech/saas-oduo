export default function TenantStorefrontPage({
  params,
}: {
  params: { tenant: string }
}) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Loja: {params.tenant}</h1>
      <p className="text-muted-foreground">
        Página pública da locadora (storefront) será implementada em breve
      </p>
    </div>
  )
}
