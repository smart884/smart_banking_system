const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuid } = require('uuid')
const db = require('../utils/firebase') // For Firestore
const { readJSON, writeJSON, files } = require('../utils/db') // Fallback to local JSON DB

const router = express.Router()

// REGISTER
router.post('/register', async (req, res) => {
  const body = req.body || {}
  // Required fields based on Registration.jsx
  const required = ['f_name', 'l_name', 'email', 'password', 'aadhar_no', 'pan_no']
  for (const k of required) if (!body[k]) return res.status(400).json({ error: `Missing ${k}` })
  
  if (!String(body.email).includes('@')) return res.status(400).json({ error: 'Invalid email' })
  if (String(body.password).length < 6) return res.status(400).json({ error: 'Password too short' })
  
  try {
    let users = [];
    if (db) {
      const snapshot = await db.collection('users').where('email', '==', body.email).limit(1).get();
      if (!snapshot.empty) return res.status(409).json({ error: 'Email already exists' })
    } else {
      users = await readJSON(files.usersFile)
      if (users.find(u => u.email === body.email)) return res.status(409).json({ error: 'Email already exists' })
    }

    const hash = await bcrypt.hash(body.password, 10)
    const user = {
      id: uuid(),
      f_name: body.f_name,
      m_name: body.m_name || '',
      l_name: body.l_name,
      gender: body.gender || '',
      dob: body.dob || '',
      email: body.email,
      contact_no: body.contact_no || '',
      alt_no: body.alt_no || '',
      address1: body.address1 || '',
      address2: body.address2 || '',
      address3: body.address3 || '',
      pin_code: body.pin_code || '',
      aadhar_no: body.aadhar_no,
      pan_no: body.pan_no,
      role: (body.user_type || 'User').toLowerCase(),
      status: 'pending',
      password: hash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (db) {
      await db.collection('users').doc(user.id).set(user);
    } else {
      users.push(user)
      await writeJSON(files.usersFile, users)
    }
    
    res.json({ success: true, message: 'Registration successful. Pending approval.' })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Server error during registration' })
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password are required' 
    })
  }

  try {
    let user = null;

    if (db) {
      const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
      if (!snapshot.empty) {
        user = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      }
    } else {
      const users = await readJSON(files.usersFile)
      user = users.find(u => u.email === email)
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      })
    }

    // Removed strict status check to allow dashboard access as requested
    // if (user.status !== 'approved') {
    //   return res.status(403).json({ 
    //     success: false, 
    //     message: 'Your account is pending approval from the admin.' 
    //   })
    // }

    const token = jwt.sign(
      { sub: user.id, role: user.role, email: user.email }, 
      process.env.JWT_SECRET || 'smartbank_secret_key', 
      { expiresIn: '7d' }
    )

    const { password: _, ...publicUser } = user
    res.json({ 
      success: true, 
      message: 'Login successful',
      token, 
      user: publicUser 
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: 'Server error during login' })
  }
})

// SEED ROLES
router.get('/seed-roles', async (_req, res) => {
  try {
    if (db) return res.json({ success: true, message: 'Firebase seeding not implemented' })
    
    const users = await readJSON(files.usersFile)
    const roles = [
      { id: 'manager-1', f_name: 'Manager', l_name: 'User', email: 'manager@smartbank.local', role: 'manager' },
      { id: 'clerk-1', f_name: 'Clerk', l_name: 'User', email: 'clerk@smartbank.local', role: 'clerk' },
      { id: 'admin-1', f_name: 'Admin', l_name: 'User', email: 'admin@smartbank.local', role: 'admin' }
    ]

    for (const r of roles) {
      if (!users.find(u => u.role === r.role)) {
        users.push({
          ...r, m_name: '', gender: '', dob: '', contact_no: '', alt_no: '',
          address1: '', address2: '', address3: '', pin_code: '', aadhar_no: '', pan_no: '',
          status: 'approved', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          password: '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36xSzs.W8sELpAo0P5u/9yK'
        })
      }
    }
    await writeJSON(files.usersFile, users)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Seeding error' })
  }
})

module.exports = router
