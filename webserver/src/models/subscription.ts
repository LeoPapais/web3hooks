import mongoose from 'mongoose'
import { prop, getModelForClass } from '@typegoose/typegoose'

type SupportedProviders = 'infura'

export class Subscription {
  readonly _id?: mongoose.Schema.Types.ObjectId | string

  @prop({ required: true })
  public hookUrl!: string

  @prop({ required: true })
  public rpcProvider!: SupportedProviders

  @prop({ required: true })
  public providerKey!: string

  @prop({ required: true })
  public subscriptionId!: string

  @prop({ required: false })
  public address?: string

  @prop({ required: false })
  public latestUpdate?: string

  @prop({ required: true })
  public topics?: string[]

}

export const SubscriptionModel = getModelForClass(Subscription)
