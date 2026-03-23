import mongoose, { Schema, models, model, Types } from 'mongoose'
import { TransactionType } from '@/types'

export interface ITransaction extends mongoose.Document {
  accountId: Types.ObjectId
  type: TransactionType
  amount: number
  description?: string
  date: Date
  balanceAfterTransaction: number
}

const TransactionSchema = new Schema<ITransaction>(
  {
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    balanceAfterTransaction: { type: Number, required: true }
  },
  { timestamps: true }
)

const Transaction = models.Transaction || model<ITransaction>('Transaction', TransactionSchema)
export default Transaction
