import { api } from "../api.ts";
import { parseWorkOrder, parseWorkOrders } from "./work-order-contract.ts";
import type { CreateWorkOrderInput, WorkOrder } from "./work-order-contract.ts";

export async function listWorkOrders(
  skip: number,
  take: number,
  signal?: AbortSignal,
): Promise<WorkOrder[]> {
  const response = await api.get<unknown>("/work-orders", {
    params: { skip, take },
    signal,
  });
  return parseWorkOrders(response.data);
}

export async function createWorkOrder(
  input: CreateWorkOrderInput,
): Promise<WorkOrder> {
  const response = await api.post<unknown>("/work-orders", input);
  try {
    return parseWorkOrder(response.data);
  } catch {
    throw new Error(
      "La API respondió a la creación con un formato inesperado. Comprueba el listado antes de repetir.",
    );
  }
}
