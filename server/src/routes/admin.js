const express = require('express')
const { auth, requireRoles } = require('../middleware/auth')
const { readJSON, files } = require('../utils/db')
const router = express.Router()

router.get('/transactions', auth(), requireRoles(['admin']), async (_req, res) => {
  const txs = await readJSON(files.transactionsFile)
  res.json({ transactions: txs })
})

router.get('/analytics', auth(), requireRoles(['admin']), async (_req, res) => {
  const users = await readJSON(files.usersFile)
  const txs = await readJSON(files.transactionsFile)
  const totalUsers = users.length
  const approvedUsers = users.filter(u => u.status === 'approved').length
  const totalTransactions = txs.length
  const totalVolume = txs.reduce((s, t) => s + Number(t.amount || 0), 0)
  res.json({ totalUsers, approvedUsers, totalTransactions, totalVolume })
})

module.exports = router
