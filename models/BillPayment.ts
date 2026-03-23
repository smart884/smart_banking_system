import mongoose, { Schema, models, model, Types } from 'mongoose'
import { BillType } from '@/types'

export interface IBillPayment extends mongoose.Document {
  accountId: Types.ObjectId
  billType: BillType
  amount: number
  status: string
  date: Date
}

const BillPaymentSchema = new Schema<IBillPayment>(
  {
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    billType: { type: String, enum: ['electricity', 'water', 'gas', 'mobile'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'paid' },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

const BillPayment = models.BillPayment || model<IBillPayment>('BillPayment', BillPaymentSchema)
export default BillPayment
