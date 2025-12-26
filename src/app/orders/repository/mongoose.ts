import { Order } from "@models/order"
import { NewOrderData, OrderPatchStateData } from "../schema"
import { OrderData, OrderDocumentPopulated, OrderListQueries } from "../types"
import { OrderRepository } from "./repository"
import { buildPagination } from "@shared/repository"
import { buildWhereCondition } from "../helpers"
import { DataListResponse } from "src/@types/global-types"
import { CreateEntityError, GetEntityError, UpdateEntityError } from "@infra/errors"

export class MongooseOrderRepository implements OrderRepository {
  async create(userId: string, data: NewOrderData): Promise<OrderData> {
    try {
      const newOrder = await Order.create({
        userId,
        lab: data.lab,
        patient: data.patient,
        customer: data.customer,
        services: data.services
      })

      const populatedOrder = await Order.findById(newOrder._id)
        .populate("userId", "_id email")
        .lean<OrderDocumentPopulated>()

      if (!populatedOrder) {
        throw new CreateEntityError("Erro ao criar o pedido")
      }

      return this.mapToOrderData(populatedOrder)
    } catch (error) {
      throw new CreateEntityError("Erro ao criar o pedido: " + JSON.stringify(error))
    }
  }

  async get(id: string): Promise<OrderData | null> {
    try {
      const order = await Order.findById(id)
        .populate("userId", "_id email")
        .lean<OrderDocumentPopulated>()

      if (!order) {
        return null
      }

      return this.mapToOrderData(order)
    } catch (error) {
      throw new GetEntityError("Erro ao obter o pedido: " + JSON.stringify(error))
    }
  }

  async list(queries: OrderListQueries): Promise<DataListResponse<OrderData>> {
    const { skip, limit } = buildPagination(queries.pagination)
    const whereCondition = buildWhereCondition(queries.filters)

    try {
      const [totalRecords, orders] = await Promise.all([
        Order.countDocuments(whereCondition),
        Order.find(whereCondition)
          .populate("userId", "_id email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean<OrderDocumentPopulated[]>()
      ])

      const currentPage = queries.pagination.page || 1

      const totalPages = Math.ceil(totalRecords / limit)

      return {
        data: orders.map((order) => this.mapToOrderData(order)),
        totalRecords,
        totalPages,
        currentPage,
        perPage: limit
      }
    } catch (error) {
      throw new Error("Erro ao listar os pedidos: " + JSON.stringify(error))
    }
  }

  async updateState(id: string, data: OrderPatchStateData): Promise<OrderData> {
    try {
      const newOrder = await Order.findByIdAndUpdate(
        id,
        {
          state: data.state
        },
        {
          new: true
        }
      )
        .populate("userId", "_id email")
        .lean<OrderDocumentPopulated>()

      if (!newOrder) {
        throw new UpdateEntityError("Erro ao atualizar o pedido")
      }

      return this.mapToOrderData(newOrder)
    } catch (error) {
      throw new UpdateEntityError("Erro ao atualizar o pedido: " + JSON.stringify(error))
    }
  }

  private mapToOrderData(order: OrderDocumentPopulated): OrderData {
    return {
      id: order._id.toString(),
      lab: order.lab,
      patient: order.patient,
      customer: order.customer,
      state: order.state,
      status: order.status,
      services: order.services.map((service) => {
        return {
          name: service.name,
          value: service.value,
          status: service.status
        }
      }),
      user: {
        id: order.userId._id.toString(),
        email: order.userId.email
      },
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }
  }
}
