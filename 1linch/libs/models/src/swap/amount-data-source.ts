import { IBigFloat } from '../big-float'

export interface IAmountDataSource {
  getMaxAmount(): Promise<IBigFloat>
}
