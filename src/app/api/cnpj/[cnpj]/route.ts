import { NextRequest, NextResponse } from "next/server"
import { consultarCNPJ, cleanCNPJ, isValidCNPJFormat } from "@/lib/services/cnpj-service"

// Cache de 24 horas
export const revalidate = 86400

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  try {
    const { cnpj } = await params
    const cleanedCNPJ = cleanCNPJ(cnpj)

    if (!isValidCNPJFormat(cleanedCNPJ)) {
      return NextResponse.json(
        { error: true, message: "CNPJ deve ter 14 dígitos", code: "INVALID_FORMAT" },
        { status: 400 }
      )
    }

    const result = await consultarCNPJ(cleanedCNPJ)

    if ("error" in result && result.error) {
      const status = result.code === "NOT_FOUND" ? 404 : 500
      return NextResponse.json(result, { status })
    }

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    })
  } catch (error) {
    console.error("Erro na API de CNPJ:", error)
    return NextResponse.json(
      { error: true, message: "Erro interno ao consultar CNPJ", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
