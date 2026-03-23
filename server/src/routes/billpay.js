const express = require('express')
const { auth } = require('../middleware/auth')
const { readJSON, writeJSON, files } = require('../utils/db')
const { v4: uuid } = require('uuid')
const router = express.Router()

router.post('/', auth(), async (req, res) => {
  const { billType, amount } = req.body || {}
  const amt = Number(amount)
  if (!billType || !amt || amt <= 0) return res.status(400).json({ error: 'Invalid input' })
  const accounts = await readJSON(files.accountsFile)
  const acc = accounts.find(a => a.userId === req.user.sub)
  if (!acc) return res.status(404).json({ error: 'Account not found' })
  if (acc.balance < amt) return res.status(400).json({ error: 'Insufficient balance' })
  acc.balance -= amt
  await writeJSON(files.accountsFile, accounts)
  const txs = await readJSON(files.transactionsFile)
  txs.push({ transactionId: uuid(), accountId: acc.accountId, type: 'debit', amount: amt, description: `Bill payment: ${billType}`, date: new Date().toISOString(), balanceAfterTransaction: acc.balance })
  await writeJSON(files.transactionsFile, txs)
  const bills = await readJSON(files.billsFile)
  bills.push({ billId: uuid(), accountId: acc.accountId, billType, amount: amt, status: 'paid', date: new Date().toISOString() })
  await writeJSON(files.billsFile, bills)
  res.json({ success: true })
})

module.exports = router

