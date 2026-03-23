const express = require('express')
const { auth } = require('../middleware/auth')
const { readJSON, writeJSON, files } = require('../utils/db')
const router = express.Router()

router.get('/', auth(), async (req, res) => {
  const accounts = await readJSON(files.accountsFile)
  const acc = accounts.find(a => a.userId === req.user.sub)
  res.json({ account: acc || null })
})

module.exports = router

