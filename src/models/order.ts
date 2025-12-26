import { OrderState, OrderStatus, ServiceStatus } from "@app/orders/types"
import mongoose, { Schema, Document, Types } from "mongoose"

interface IService {
  name: string
  value: number
  status: ServiceStatus
}

interface IOrder {
  lab: string
  patient: string
  customer: string
  userId: Types.ObjectId
  state: OrderState
  status: OrderStatus
  services: IService[]
  createdAt: Date
  updatedAt: Date
}

export interface IOrderDocument extends IOrder, Document {}

const ServiceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(ServiceStatus),
      default: ServiceStatus.PENDING
    }
  },
  { _id: false }
)

const OrderSchema = new Schema<IOrderDocument>(
  {
    lab: {
      type: String,
      required: true
    },
    patient: {
      type: String,
      required: true
    },
    customer: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    state: {
      type: String,
      enum: Object.values(OrderState),
      default: OrderState.CREATED
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.ACTIVE
    },
    services: {
      type: [ServiceSchema],
      required: true
    }
  },
  {
    timestamps: true
  }
)

OrderSchema.index({ userId: 1 })
OrderSchema.index({ state: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ userId: 1, state: 1, status: 1 })

export const Order = mongoose.model<IOrderDocument>("Order", OrderSchema)
