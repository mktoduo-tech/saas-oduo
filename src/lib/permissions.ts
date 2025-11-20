export type Role = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "OPERATOR" | "VIEWER"

type Permission =
  | "CREATE_USER"
  | "EDIT_USER"
  | "DELETE_USER"
  | "CREATE_EQUIPMENT"
  | "EDIT_EQUIPMENT"
  | "DELETE_EQUIPMENT"
  | "CREATE_BOOKING"
  | "EDIT_BOOKING"
  | "DELETE_BOOKING"
  | "CREATE_CUSTOMER"
  | "EDIT_CUSTOMER"
  | "DELETE_CUSTOMER"
  | "VIEW_REPORTS"
  | "MANAGE_INTEGRATIONS"
  | "MANAGE_SETTINGS"

const rolePermissions: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "CREATE_USER",
    "EDIT_USER",
    "DELETE_USER",
    "CREATE_EQUIPMENT",
    "EDIT_EQUIPMENT",
    "DELETE_EQUIPMENT",
    "CREATE_BOOKING",
    "EDIT_BOOKING",
    "DELETE_BOOKING",
    "CREATE_CUSTOMER",
    "EDIT_CUSTOMER",
    "DELETE_CUSTOMER",
    "VIEW_REPORTS",
    "MANAGE_INTEGRATIONS",
    "MANAGE_SETTINGS",
  ],
  ADMIN: [
    "CREATE_USER",
    "EDIT_USER",
    "DELETE_USER",
    "CREATE_EQUIPMENT",
    "EDIT_EQUIPMENT",
    "DELETE_EQUIPMENT",
    "CREATE_BOOKING",
    "EDIT_BOOKING",
    "DELETE_BOOKING",
    "CREATE_CUSTOMER",
    "EDIT_CUSTOMER",
    "DELETE_CUSTOMER",
    "VIEW_REPORTS",
    "MANAGE_INTEGRATIONS",
    "MANAGE_SETTINGS",
  ],
  MANAGER: [
    "CREATE_EQUIPMENT",
    "EDIT_EQUIPMENT",
    "CREATE_BOOKING",
    "EDIT_BOOKING",
    "CREATE_CUSTOMER",
    "EDIT_CUSTOMER",
    "VIEW_REPORTS",
  ],
  OPERATOR: ["CREATE_BOOKING", "EDIT_BOOKING", "CREATE_CUSTOMER", "VIEW_REPORTS"],
  VIEWER: ["VIEW_REPORTS"],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) || false
}

export function canManageUsers(role: Role): boolean {
  return hasPermission(role, "CREATE_USER")
}

export function canManageEquipment(role: Role): boolean {
  return hasPermission(role, "CREATE_EQUIPMENT")
}

export function canManageBookings(role: Role): boolean {
  return hasPermission(role, "CREATE_BOOKING")
}

export function canManageCustomers(role: Role): boolean {
  return hasPermission(role, "CREATE_CUSTOMER")
}
