const express = require('express')
const { auth } = require('../middleware/auth')
const { readJSON, writeJSON, files } = require('../utils/db')
const { v4: uuid } = require('uuid')
const fs = require('fs')
const path = require('path')
const router = express.Router()
const pendingFile = path.join(__dirname, '..', 'data', 'pendingTransfers.json')

router.get('/', auth(), async (req, res) => {
  const accounts = await readJSON(files.accountsFile)
  const acc = accounts.find(a => a.userId === req.user.sub)
  if (!acc) return res.json({ transactions: [] })
  const txs = await readJSON(files.transactionsFile)
  res.json({ transactions: txs.filter(t => t.accountId === acc.accountId) })
})

router.post('/transfer', auth(), async (req, res) => {
  const { toAccountNumber, amount, remarks } = req.body || {}
  const amt = Number(amount)
  if (!toAccountNumber || !amt || amt <= 0) return res.status(400).json({ error: 'Invalid input' })
  const accounts = await readJSON(files.accountsFile)
  const from = accounts.find(a => a.userId === req.user.sub)
  const to = accounts.find(a => a.accountNumber === toAccountNumber)
  if (!from || !to) return res.status(404).json({ error: 'Account not found' })
  if (from.balance < amt) return res.status(400).json({ error: 'Insufficient balance' })
  // Manager approval for large transfers
  const NEED_APPROVAL = 10000
  if (amt > NEED_APPROVAL) {
    const pending = fs.existsSync(pendingFile) ? JSON.parse(fs.readFileSync(pendingFile, 'utf-8')) : []
    pending.push({ id: uuid(), fromAccountId: from.accountId, toAccountId: to.accountId, amount: amt, remarks: remarks || '', status: 'pending', date: new Date().toISOString() })
    fs.writeFileSync(pendingFile, JSON.stringify(pending, null, 2))
    return res.json({ success: true, pending: true, message: 'Transfer pending manager approval' })
  }
  from.balance -= amt; to.balance += amt
  await writeJSON(files.accountsFile, accounts)
  const txs = await readJSON(files.transactionsFile)
  const now = new Date().toISOString()
  txs.push({ transactionId: uuid(), accountId: from.accountId, type: 'debit', amount: amt, description: remarks || `Transfer to ${to.accountNumber}`, date: now, balanceAfterTransaction: from.balance })
  txs.push({ transactionId: uuid(), accountId: to.accountId, type: 'credit', amount: amt, description: remarks || `Transfer from ${from.accountNumber}`, date: now, balanceAfterTransaction: to.balance })
  await writeJSON(files.transactionsFile, txs)
  res.json({ success: true })
})

module.exports = router
