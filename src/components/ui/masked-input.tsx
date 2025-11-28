"use client"

import * as React from "react"
import InputMask from "react-input-mask"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

// Máscaras predefinidas
export const masks = {
  cpf: "999.999.999-99",
  cnpj: "99.999.999/9999-99",
  cep: "99999-999",
  phone: "(99) 9999-9999",
  cellphone: "(99) 99999-9999",
  date: "99/99/9999",
} as const

export type MaskType = keyof typeof masks

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  mask: string | MaskType
  value?: string
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  maskChar?: string | null
  alwaysShowMask?: boolean
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value, onChange, onBlur, className, maskChar = "_", alwaysShowMask = false, ...props }, ref) => {
    // Resolve a máscara se for um tipo predefinido
    const resolvedMask = mask in masks ? masks[mask as MaskType] : mask

    return (
      <InputMask
        mask={resolvedMask}
        value={value}
        onChange={(e) => onChange?.(e.target.value, e)}
        onBlur={onBlur}
        maskChar={maskChar}
        alwaysShowMask={alwaysShowMask}
      >
        {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
          <Input
            {...inputProps}
            {...props}
            ref={ref}
            className={cn(className)}
          />
        )}
      </InputMask>
    )
  }
)
MaskedInput.displayName = "MaskedInput"

// Input de CPF
interface CPFInputProps extends Omit<MaskedInputProps, "mask"> {}

export const CPFInput = React.forwardRef<HTMLInputElement, CPFInputProps>(
  (props, ref) => <MaskedInput {...props} ref={ref} mask="cpf" placeholder="000.000.000-00" />
)
CPFInput.displayName = "CPFInput"

// Input de CNPJ
interface CNPJInputProps extends Omit<MaskedInputProps, "mask"> {}

export const CNPJInput = React.forwardRef<HTMLInputElement, CNPJInputProps>(
  (props, ref) => <MaskedInput {...props} ref={ref} mask="cnpj" placeholder="00.000.000/0000-00" />
)
CNPJInput.displayName = "CNPJInput"

// Input de CPF ou CNPJ (detecta automaticamente)
interface CPFCNPJInputProps extends Omit<MaskedInputProps, "mask"> {
  value?: string
}

export const CPFCNPJInput = React.forwardRef<HTMLInputElement, CPFCNPJInputProps>(
  ({ value = "", ...props }, ref) => {
    // Remove caracteres não numéricos para contar
    const numericValue = value.replace(/\D/g, "")

    // Se tiver mais de 11 dígitos, usa máscara de CNPJ
    const mask = numericValue.length > 11 ? "cnpj" : "cpf"
    const placeholder = numericValue.length > 11 ? "00.000.000/0000-00" : "000.000.000-00"

    return (
      <MaskedInput
        {...props}
        ref={ref}
        value={value}
        mask={mask}
        placeholder={placeholder}
      />
    )
  }
)
CPFCNPJInput.displayName = "CPFCNPJInput"

// Input de CEP
interface CEPInputProps extends Omit<MaskedInputProps, "mask"> {}

export const CEPInput = React.forwardRef<HTMLInputElement, CEPInputProps>(
  (props, ref) => <MaskedInput {...props} ref={ref} mask="cep" placeholder="00000-000" />
)
CEPInput.displayName = "CEPInput"

// Input de Telefone (detecta fixo ou celular)
interface PhoneInputProps extends Omit<MaskedInputProps, "mask"> {
  value?: string
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = "", ...props }, ref) => {
    // Remove caracteres não numéricos para contar
    const numericValue = value.replace(/\D/g, "")

    // Se tiver mais de 10 dígitos, usa máscara de celular
    const mask = numericValue.length > 10 ? "cellphone" : "phone"
    const placeholder = numericValue.length > 10 ? "(00) 00000-0000" : "(00) 0000-0000"

    return (
      <MaskedInput
        {...props}
        ref={ref}
        value={value}
        mask={mask}
        placeholder={placeholder}
      />
    )
  }
)
PhoneInput.displayName = "PhoneInput"

export { MaskedInput }
