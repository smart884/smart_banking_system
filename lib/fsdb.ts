import { promises as fs } from 'fs'
import path from 'path'

export type Role = 'customer' | 'admin'
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'blocked'
export type AccountType = 'Savings' | 'Current'
export type TransactionType = 'credit' | 'debit'

export type User = {
  id: string
  firstName: string
  middleName?: string
  lastName: string
  gender?: string
  dob?: string
  email: string
  contactNumber?: string
  altNumber?: string
  address1?: string
  address2?: string
  address3?: string
  pinCode?: string
  aadharNumber?: string
  panNumber?: string
  password: string
  role: Role
  status: UserStatus
  createdAt: string
}

export type Account = {
  id: string
  userId: string
  accountNumber: string
  accountType: AccountType
  balance: number
  ifscCode: string
  branchName: string
}

export type Transaction = {
  id: string
  accountId: string
  type: TransactionType
  amount: number
  description?: string
  date: string
  balanceAfterTransaction: number
}

const dataDir = path.join(process.cwd(), 'data')
const usersFile = path.join(dataDir, 'users.json')
const accountsFile = path.join(dataDir, 'accounts.json')
const transactionsFile = path.join(dataDir, 'transactions.json')

async function ensureFiles() {
  await fs.mkdir(dataDir, { recursive: true })
  const defs: [string, any][] = [
    [usersFile, []],
    [accountsFile, []],
    [transactionsFile, []],
  ]
  for (const [file, def] of defs) {
    try { await fs.access(file) } catch { await fs.writeFile(file, JSON.stringify(def, null, 2)) }
  }
}

async function readJSON<T>(file: string): Promise<T> {
  await ensureFiles()
  const raw = await fs.readFile(file, 'utf-8')
  return JSON.parse(raw) as T
}

async function writeJSON(file: string, data: any) {
  await ensureFiles()
  await fs.writeFile(file, JSON.stringify(data, null, 2))
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export async function getAllUsers() { return readJSON<User[]>(usersFile) }
export async function saveAllUsers(users: User[]) { return writeJSON(usersFile, users) }
export async function getAllAccounts() { return readJSON<Account[]>(accountsFile) }
export async function saveAllAccounts(accounts: Account[]) { return writeJSON(accountsFile, accounts) }
export async function getAllTransactions() { return readJSON<Transaction[]>(transactionsFile) }
export async function saveAllTransactions(items: Transaction[]) { return writeJSON(transactionsFile, items) }

export async function createUser(u: Omit<User, 'id' | 'createdAt'>) {
  const users = await getAllUsers()
  const user: User = { ...u, id: genId(), createdAt: new Date().toISOString() }
  users.push(user)
  await saveAllUsers(users)
  return user
}

export async function createAccount(a: Omit<Account, 'id'>) {
  const accounts = await getAllAccounts()
  const acc: Account = { ...a, id: genId() }
  accounts.push(acc)
  await saveAllAccounts(accounts)
  return acc
}

export async function addTransaction(t: Omit<Transaction, 'id' | 'date'>) {
  const items = await getAllTransactions()
  const tx: Transaction = { ...t, id: genId(), date: new Date().toISOString() }
  items.push(tx)
  await saveAllTransactions(items)
  return tx
}

export const DEFAULT_IFSC = 'SBIN0000123'
export const DEFAULT_BRANCH = 'Main Branch'
export function generateAccountNumber() {
  return 'SB' + Math.floor(1000000000 + Math.random() * 900000000).toString()
}
