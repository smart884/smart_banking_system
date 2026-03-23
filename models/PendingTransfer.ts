import mongoose, { Schema, model, models, Types } from 'mongoose'

export interface IPendingTransfer extends mongoose.Document {
  requesterUserId: Types.ObjectId
  fromAccountId: Types.ObjectId
  toAccountNumber: string
  ifscCode: string
  amount: number
  remarks?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

const PendingTransferSchema = new Schema<IPendingTransfer>({
  requesterUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fromAccountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  toAccountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  amount: { type: Number, required: true },
  remarks: { type: String },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' }
}, { timestamps: true })

const PendingTransfer = models.PendingTransfer || model<IPendingTransfer>('PendingTransfer', PendingTransferSchema)
export default PendingTransfer
