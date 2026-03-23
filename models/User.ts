import mongoose, { Schema, models, model } from 'mongoose'
import { Role } from '@/types'

export interface IUser extends mongoose.Document {
  firstName: string
  middleName?: string
  lastName: string
  gender: string
  dob: Date
  email: string
  contactNumber: string
  altNumber?: string
  address1: string
  address2?: string
  address3?: string
  pinCode: string
  aadharNumber: string
  panNumber: string
  role: Role
  status: 'pending' | 'approved' | 'rejected' | 'blocked'
  password: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: Date, required: true },
    email: { type: String, unique: true, required: true },
    contactNumber: { type: String, required: true },
    altNumber: { type: String },
    address1: { type: String, required: true },
    address2: { type: String },
    address3: { type: String },
    pinCode: { type: String, required: true },
    aadharNumber: { type: String, unique: true, required: true },
    panNumber: { type: String, unique: true, required: true },
    role: { type: String, enum: ['customer', 'clerk', 'manager', 'admin'], default: 'customer' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'blocked'], default: 'pending' },
    password: { type: String, required: true }
  },
  { timestamps: true }
)

const User = models.User || model<IUser>('User', UserSchema)
export default User
