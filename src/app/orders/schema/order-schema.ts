import z from "zod"
import { ServiceStatus } from "../types"

export const OrderSchema = z.object({
  lab: z.string({ error: "O campo 'lab' é obrigatório" }).min(3, {
    message: "O campo 'lab' deve ter no mínimo 3 caracteres"
  }),
  patient: z.string({ error: "O campo 'patient' é obrigatório" }).min(3, {
    message: "O campo 'patient' deve ter no mínimo 3 caracteres"
  }),
  customer: z.string({ error: "O campo 'customer' é obrigatório" }).min(3, {
    message: "O campo 'customer' deve ter no mínimo 3 caracteres"
  }),
  services: z
    .array(
      z.object({
        name: z.string({ error: "O campo 'name' do serviço é obrigatório" }).min(3, {
          message: "O campo 'name' deve ter no mínimo 3 caracteres"
        }),
        value: z.number({ error: "O campo 'value' do serviço é obrigatório" }).min(1, {
          message: "O campo 'value' do serviço deve ser maior ou igual a 1"
        }),
        status: z
          .enum(Object.values(ServiceStatus), {
            error: "O campo 'status' deve ser: PENDING ou DONE"
          })
          .optional()
      })
    )
    .min(1, { message: "Informe pelo menos um serviço" })
})

export type NewOrderData = z.infer<typeof OrderSchema>
