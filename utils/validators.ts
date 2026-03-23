import { z } from 'zod'

export const registerSchema = z.object({
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  gender: z.enum(['Male', 'Female', 'Other']),
  dob: z.string(),
  email: z.string().email(),
  contactNumber: z.string().regex(/^\d{10}$/),
  altNumber: z.string().regex(/^\d{10}$/).optional().or(z.literal('').transform(() => undefined)),
  address1: z.string().min(1),
  address2: z.string().optional(),
  address3: z.string().optional(),
  pinCode: z.string().regex(/^\d{6}$/),
  aadharNumber: z.string().regex(/^\d{12}$/),
  panNumber: z.string().regex(/^[A-Z]{5}\d{4}[A-Z]$/i),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  accountType: z.enum(['Savings', 'Current'])
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export const transferSchema = z.object({
  recipientAccountNumber: z.string().min(6),
  ifscCode: z.string().min(6),
  amount: z.number().positive(),
  remarks: z.string().optional()
})

export const billSchema = z.object({
  billType: z.enum(['electricity', 'water', 'gas', 'mobile']),
  amount: z.number().positive()
})
