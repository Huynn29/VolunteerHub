import bcrypt from 'bcrypt'
import User from '../models/User.js'

export async function ensureAdminSeed() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME || 'Administrator'
  if (!email || !password) return
  let admin = await User.findOne({ email })
  if (!admin) {
    const hashed = await bcrypt.hash(password, 10)
    admin = await User.create({ name, email, password: hashed, role: 'admin' })
  } else if (admin.role !== 'admin') {
    // Ensure this account always has admin privileges
    admin.role = 'admin'
    admin.isLocked = false
    admin.managerPending = false
    await admin.save()
  }
}


