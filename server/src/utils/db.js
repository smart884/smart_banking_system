const fs = require('fs')
const fsp = require('fs').promises
const path = require('path')

const dataDir = path.join(__dirname, '..', 'data')
const usersFile = path.join(dataDir, 'users.json')
const accountsFile = path.join(dataDir, 'accounts.json')
const transactionsFile = path.join(dataDir, 'transactions.json')
const billsFile = path.join(dataDir, 'bills.json')
const registrationsFile = path.join(dataDir, 'registrations.json')

async function ensureFiles() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  const defs = [
    [usersFile, []],
    [accountsFile, []],
    [transactionsFile, []],
    [billsFile, []],
    [registrationsFile, []],
  ]
  for (const [file, def] of defs) {
    try { await fsp.access(file) } catch { await fsp.writeFile(file, JSON.stringify(def, null, 2)) }
  }
}

async function readJSON(file) { await ensureFiles(); return JSON.parse(await fsp.readFile(file, 'utf-8')) }
async function writeJSON(file, data) { await ensureFiles(); await fsp.writeFile(file, JSON.stringify(data, null, 2)) }

module.exports = {
  files: { usersFile, accountsFile, transactionsFile, billsFile, registrationsFile },
  readJSON,
  writeJSON,
  ensureFiles
}
