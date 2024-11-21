import { Express } from 'express'
import routeStockManage from './manage'

export default function routeStock(app: Express) {
  routeStockManage(app)
}
