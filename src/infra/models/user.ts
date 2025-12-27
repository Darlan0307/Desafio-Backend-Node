import mongoose, { Schema, Document } from "mongoose"

interface IUser {
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

export const User = mongoose.model<IUserDocument>("User", UserSchema)
