import mongoose, { Schema, models, model, Types } from 'mongoose'
import { AccountType } from '@/types'

export interface IAccount extends mongoose.Document {
  userId: Types.ObjectId
  accountNumber: string
  accountType: AccountType
  balance: number
  ifscCode: string
  branchName: string
}

const AccountSchema = new Schema<IAccount>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    accountNumber: { type: String, unique: true, required: true },
    accountType: { type: String, enum: ['Savings', 'Current'], required: true },
    balance: { type: Number, default: 0 },
    ifscCode: { type: String, required: true },
    branchName: { type: String, required: true }
  },
  { timestamps: true }
)

const Account = models.Account || model<IAccount>('Account', AccountSchema)
export default Account
