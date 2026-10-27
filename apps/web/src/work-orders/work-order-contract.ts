export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type WorkOrderStatus = "RECEIVED" | "IN_REPAIR" | "READY" | "DELIVERED";

export interface WorkOrder {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: WorkOrderStatus;
  dueDate: string | null;
  vehiclePlate: string;
  estimatedCost: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkOrderInput {
  title: string;
  vehiclePlate: string;
  estimatedCost: number;
}

export const PAGE_SIZE = 20;
const MAX_COST = 2_147_483_647;
const PLATE_PATTERN = /^([A-Z]{4}\d{2}|[A-Z]{2}\d{4})$/;

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

export const STATUS_LABEL: Record<WorkOrderStatus, string> = {
  RECEIVED: "Recibida",
  IN_REPAIR: "En reparación",
  READY: "Lista",
  DELIVERED: "Entregada",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDateString(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isWorkOrder(value: unknown): value is WorkOrder {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.title === "string" &&
    (value.description === null || typeof value.description === "string") &&
    typeof value.priority === "string" &&
    ["LOW", "MEDIUM", "HIGH"].includes(value.priority) &&
    typeof value.status === "string" &&
    ["RECEIVED", "IN_REPAIR", "READY", "DELIVERED"].includes(value.status) &&
    (value.dueDate === null || isDateString(value.dueDate)) &&
    typeof value.vehiclePlate === "string" &&
    value.vehiclePlate.length > 0 &&
    typeof value.estimatedCost === "number" &&
    Number.isInteger(value.estimatedCost) &&
    value.estimatedCost >= 0 &&
    typeof value.ownerId === "string" &&
    value.ownerId.length > 0 &&
    isDateString(value.createdAt) &&
    isDateString(value.updatedAt)
  );
}

export function parseWorkOrder(value: unknown): WorkOrder {
  if (!isWorkOrder(value)) {
    throw new Error(
      "Respuesta incompatible: se esperaba una orden de trabajo con el contrato de la API.",
    );
  }
  return value;
}

export function parseWorkOrders(value: unknown): WorkOrder[] {
  if (!Array.isArray(value)) {
    throw new Error(
      "Respuesta incompatible: GET /work-orders debe devolver un arreglo JSON.",
    );
  }
  return value.map((item: unknown) => parseWorkOrder(item));
}

export function createWorkOrderInput(
  title: string,
  vehiclePlate: string,
  estimatedCost: string,
): CreateWorkOrderInput {
  const normalizedTitle = title.trim();
  if (normalizedTitle.length === 0 || normalizedTitle.length > 200) {
    throw new Error(
      "El título debe tener entre 1 y 200 caracteres, sin espacios exteriores.",
    );
  }

  const plate = vehiclePlate.trim().toUpperCase();
  if (!PLATE_PATTERN.test(plate)) {
    throw new Error("Patente inválida (ej: ABCD12 o AB1234).");
  }

  const rawCost = estimatedCost.trim();
  let cost = 0;
  if (rawCost !== "") {
    if (!/^\d+$/.test(rawCost) || Number(rawCost) > MAX_COST) {
      throw new Error(
        "El costo estimado debe ser un entero entre 0 y 2147483647.",
      );
    }
    cost = Number(rawCost);
  }

  return { title: normalizedTitle, vehiclePlate: plate, estimatedCost: cost };
}
