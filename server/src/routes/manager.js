const express = require('express')
const { auth, requireRoles } = require('../middleware/auth')
const { readJSON, writeJSON, files } = require('../utils/db')
const { db } = require('../../firebase') // Use unified firebase.js from server root
const fs = require('fs')
const path = require('path')
const { v4: uuid } = require('uuid')
const router = express.Router()
const pendingFile = path.join(__dirname, '..', 'data', 'pendingTransfers.json')

router.get('/users', auth(), requireRoles(['manager']), async (_req, res) => {
  try {
    if (db) {
      const snapshot = await db.collection('users').get();
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json({ users });
    } else {
      const users = await readJSON(files.usersFile);
      return res.json({ users });
    }
  } catch (error) {
    console.error('Manager fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
})

router.get('/transfers', auth(), requireRoles(['manager']), async (_req, res) => {
  const list = fs.existsSync(pendingFile) ? JSON.parse(fs.readFileSync(pendingFile, 'utf-8')) : []
  res.json({ pending: list.filter(x => x.status === 'pending') })
})

router.post('/transfers/decide', auth(), requireRoles(['manager']), async (req, res) => {
  const { id, approve } = req.body || {}
  const list = fs.existsSync(pendingFile) ? JSON.parse(fs.readFileSync(pendingFile, 'utf-8')) : []
  const idx = list.findIndex(x => x.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  const item = list[idx]
  if (!approve) { list[idx].status = 'rejected'; fs.writeFileSync(pendingFile, JSON.stringify(list, null, 2)); return res.json({ success: true }) }
  // perform transfer now
  const accounts = await readJSON(files.accountsFile)
  const from = accounts.find(a => a.accountId === item.fromAccountId)
  const to = accounts.find(a => a.accountId === item.toAccountId)
  if (!from || !to) return res.status(404).json({ error: 'Account not found' })
  if (from.balance < item.amount) return res.status(400).json({ error: 'Insufficient balance' })
  from.balance -= item.amount; to.balance += item.amount
  await writeJSON(files.accountsFile, accounts)
  const txs = await readJSON(files.transactionsFile)
  const now = new Date().toISOString()
  txs.push({ transactionId: uuid(), accountId: from.accountId, type: 'debit', amount: item.amount, description: 'Manager approved transfer', date: now, balanceAfterTransaction: from.balance })
  txs.push({ transactionId: uuid(), accountId: to.accountId, type: 'credit', amount: item.amount, description: 'Manager approved transfer', date: now, balanceAfterTransaction: to.balance })
  await writeJSON(files.transactionsFile, txs)
  list[idx].status = 'approved'
  fs.writeFileSync(pendingFile, JSON.stringify(list, null, 2))
  res.json({ success: true })
})

module.exports = router

