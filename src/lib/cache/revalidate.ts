"use server"

import { revalidateTag } from "next/cache"
import { CACHE_TAGS } from "./index"

// Profile padrão para invalidação
const REVALIDATE_PROFILE = "default"

/**
 * Invalida o cache do dashboard para um tenant
 */
export async function revalidateDashboard(tenantId: string) {
  revalidateTag(CACHE_TAGS.DASHBOARD, REVALIDATE_PROFILE)
  revalidateTag(`tenant-${tenantId}`, REVALIDATE_PROFILE)
}

/**
 * Invalida o cache de equipamentos para um tenant
 */
export async function revalidateEquipments(tenantId: string) {
  revalidateTag(CACHE_TAGS.EQUIPMENTS, REVALIDATE_PROFILE)
  revalidateTag(CACHE_TAGS.STOCK_ALERTS, REVALIDATE_PROFILE)
  revalidateTag(`tenant-${tenantId}`, REVALIDATE_PROFILE)
}

/**
 * Invalida o cache de clientes para um tenant
 */
export async function revalidateCustomers(tenantId: string) {
  revalidateTag(CACHE_TAGS.CUSTOMERS, REVALIDATE_PROFILE)
  revalidateTag(`tenant-${tenantId}`, REVALIDATE_PROFILE)
}

/**
 * Invalida o cache de reservas para um tenant
 */
export async function revalidateBookings(tenantId: string) {
  revalidateTag(CACHE_TAGS.BOOKINGS, REVALIDATE_PROFILE)
  revalidateTag(CACHE_TAGS.DASHBOARD, REVALIDATE_PROFILE)
  revalidateTag(`tenant-${tenantId}`, REVALIDATE_PROFILE)
}

/**
 * Invalida o cache de alertas de estoque para um tenant
 */
export async function revalidateStockAlerts(tenantId: string) {
  revalidateTag(CACHE_TAGS.STOCK_ALERTS, REVALIDATE_PROFILE)
  revalidateTag(`tenant-${tenantId}`, REVALIDATE_PROFILE)
}

/**
 * Invalida todo o cache de um tenant
 */
export async function revalidateTenantCache(tenantId: string) {
  revalidateTag(`tenant-${tenantId}`, REVALIDATE_PROFILE)
}
