const express = require('express')
const { auth, requireRoles } = require('../middleware/auth')
const { readJSON, writeJSON, files } = require('../utils/db')
const router = express.Router()

router.get('/pending', auth(), requireRoles(['clerk']), async (_req, res) => {
  const users = await readJSON(files.usersFile)
  res.json({ users: users.filter(u => u.status === 'pending') })
})

router.patch('/verify', auth(), requireRoles(['clerk']), async (req, res) => {
  const { userId } = req.body || {}
  const users = await readJSON(files.usersFile)
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  users[idx].status = 'verified'
  await writeJSON(files.usersFile, users)
  res.json({ success: true })
})

module.exports = router

