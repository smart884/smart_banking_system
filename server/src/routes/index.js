const express = require('express')
const router = express.Router()
const { readJSON, writeJSON, files } = require('../utils/db')
const bcrypt = require('bcryptjs')

router.get('/test', (_req, res) => {
  res.json({ ok: true, message: 'SmartBank API is working' })
})

router.post('/register', async (req, res) => {
  try {
    console.log('Incoming Data:', req.body)
    const body = req.body || {}
    const required = ['f_name','m_name','l_name','gender','address1','pin_code','contact_no','email','dob','password','aadhar_no','pan_no','user_type']
    for (const k of required) if (!body[k]) return res.status(400).json({ message: `Missing ${k}` })
    const genderOk = ['Male','Female','Other'].includes(body.gender)
    if (!genderOk) return res.status(400).json({ message: 'Invalid gender' })
    if (!String(body.email).includes('@')) return res.status(400).json({ message: 'Invalid email' })
    if (!/^\d{10,}$/.test(String(body.contact_no))) return res.status(400).json({ message: 'Invalid contact_no' })
    if (body.alt_no && !/^\d{10,}$/.test(String(body.alt_no))) return res.status(400).json({ message: 'Invalid alt_no' })
    if (!/^\d{12}$/.test(String(body.aadhar_no))) return res.status(400).json({ message: 'Invalid aadhar_no' })
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(String(body.pan_no))) return res.status(400).json({ message: 'Invalid pan_no' })
    const userTypeOk = ['User','Clerk','Manager'].includes(body.user_type)
    if (!userTypeOk) return res.status(400).json({ message: 'Invalid user_type' })
    const regs = await readJSON(files.registrationsFile)
    const existingUser = regs.find(u => u.email === body.email)
    if (existingUser) return res.status(400).json({ message: 'Email already registered' })
    if (regs.find(r => String(r.aadhar_no) === String(body.aadhar_no))) return res.status(400).json({ message: 'Aadhar already exists' })
    if (regs.find(r => String(r.pan_no).toUpperCase() === String(body.pan_no).toUpperCase())) return res.status(400).json({ message: 'PAN already exists' })
    const reg_id = regs.length ? Math.max(...regs.map(r => Number(r.reg_id) || 0)) + 1 : 1
    const now = new Date().toISOString()
    const hashed = await bcrypt.hash(String(body.password), 10)
    const record = {
      reg_id,
      f_name: String(body.f_name),
      m_name: String(body.m_name),
      l_name: String(body.l_name),
      gender: body.gender,
      address1: String(body.address1),
      address2: String(body.address2 || ''),
      address3: String(body.address3 || ''),
      pin_code: String(body.pin_code),
      contact_no: String(body.contact_no),
      alt_no: String(body.alt_no || ''),
      email: String(body.email),
      dob: String(body.dob),
      password: hashed,
      aadhar_no: String(body.aadhar_no),
      pan_no: String(body.pan_no).toUpperCase(),
      user_type: body.user_type,
      status: 'Pending',
      created_at: now,
      updated_at: now
    }
    regs.push(record)
    await writeJSON(files.registrationsFile, regs)
    console.log('Registered reg_id:', reg_id)
    return res.status(201).json({ message: 'User registered successfully' })
  } catch (e) {
    console.error('Register error:', e)
    res.status(500).json({ message: 'Server error' })
  }
})

router.use('/auth', require('./auth'))
router.use('/users', require('./users'))
router.use('/accounts', require('./accounts'))
router.use('/transactions', require('./transactions'))
router.use('/billpay', require('./billpay'))
router.use('/admin', require('./admin'))
router.use('/manager', require('./manager'))
router.use('/clerk', require('./clerk'))

module.exports = router
