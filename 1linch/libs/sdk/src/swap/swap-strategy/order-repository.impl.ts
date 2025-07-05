import { LongTimeCache } from '@1inch-community/core/cache'
import { IOrderRepository, OrderData } from '@1inch-community/models'
import { Hash } from 'viem'

export class OrderRepositoryImpl implements IOrderRepository {
  private static readonly dataSource = new LongTimeCache<string, OrderData>(
    'strategy-orders',
    /* ttlDays */ 3
  )

  async saveOrder(order: OrderData): Promise<void> {
    OrderRepositoryImpl.dataSource.set(order.hash, order)
  }

  async getOrder(orderHash: Hash): Promise<OrderData | null> {
    return OrderRepositoryImpl.dataSource.get(orderHash)
  }

  async deleteOrder(orderHash: Hash): Promise<void> {
    OrderRepositoryImpl.dataSource.delete(orderHash)
  }
}
