export function generateAccountNumber() {
  const base = Date.now().toString().slice(-8)
  const rand = Math.floor(1000 + Math.random() * 9000).toString()
  return `SB${base}${rand}`
}

export const DEFAULT_IFSC = 'SBIN0001234'
export const DEFAULT_BRANCH = 'Main Branch'
