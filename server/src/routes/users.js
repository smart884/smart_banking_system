const express = require('express')
const { auth, requireRoles } = require('../middleware/auth')
const { readJSON, writeJSON, files } = require('../utils/db')
const { db } = require('../../firebase')
const bcrypt = require('bcryptjs')
const router = express.Router()

router.get('/me', auth(), async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.sub).get()
    if (!userDoc.exists) return res.status(404).json({ error: 'Not found' })
    const user = userDoc.data()
    const { password, ...publicUser } = user
    
    // Also fetch account if it exists
    const accountsSnapshot = await db.collection('accounts').where('userId', '==', req.user.sub).limit(1).get()
    const account = accountsSnapshot.empty ? null : { id: accountsSnapshot.docs[0].id, ...accountsSnapshot.docs[0].data() }
    
    res.json({ user: { ...publicUser, id: req.user.sub }, account })
  } catch (error) {
    console.error('Fetch me error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

router.patch('/profile', auth(), async (req, res) => {
  const users = await readJSON(files.usersFile)
  const idx = users.findIndex(u => u.id === req.user.sub)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  const allowed = ['firstName','middleName','lastName','contactNumber','altNumber','address1','address2','address3','pinCode']
  for (const k of allowed) if (k in req.body) users[idx][k] = req.body[k]
  users[idx].updatedAt = new Date().toISOString()
  await writeJSON(files.usersFile, users)
  res.json({ success: true })
})

router.patch('/password', auth(), async (req, res) => {
  const { currentPassword, newPassword } = req.body || {}
  if (!newPassword || String(newPassword).length < 8) return res.status(400).json({ error: 'Invalid password' })
  const users = await readJSON(files.usersFile)
  const idx = users.findIndex(u => u.id === req.user.sub)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  const ok = await bcrypt.compare(currentPassword || '', users[idx].password)
  if (!ok) return res.status(400).json({ error: 'Invalid current password' })
  users[idx].password = await bcrypt.hash(newPassword, 10)
  await writeJSON(files.usersFile, users)
  res.json({ success: true })
})

router.get('/', auth(), requireRoles(['admin']), async (_req, res) => {
  const users = await readJSON(files.usersFile)
  res.json({ users: users.map(({ password, ...u }) => u) })
})

router.patch('/approve', auth(), requireRoles(['admin']), async (req, res) => {
  const { userId } = req.body || {}
  const users = await readJSON(files.usersFile)
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  users[idx].status = 'approved'
  await writeJSON(files.usersFile, users)
  res.json({ success: true })
})

router.patch('/block', auth(), requireRoles(['admin']), async (req, res) => {
  const { userId, block } = req.body || {}
  const users = await readJSON(files.usersFile)
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  users[idx].status = block ? 'blocked' : 'approved'
  await writeJSON(files.usersFile, users)
  res.json({ success: true })
})

module.exports = router

