import test from "node:test";
import assert from "node:assert/strict";
import {
  createWorkOrderInput,
  parseWorkOrder,
  parseWorkOrders,
} from "../src/work-orders/work-order-contract.ts";

const order = {
  id: "00000000-0000-4000-8000-000000000002",
  title: "Cambio de frenos",
  description: null,
  priority: "MEDIUM",
  status: "RECEIVED",
  dueDate: null,
  vehiclePlate: "ABCD12",
  estimatedCost: 45000,
  ownerId: "00000000-0000-4000-8000-000000000001",
  createdAt: "2026-10-15T12:00:00.000Z",
  updatedAt: "2026-10-15T12:00:00.000Z",
};

test("acepta un listado vacío como respuesta válida", () => {
  assert.deepEqual(parseWorkOrders([]), []);
});

test("acepta una orden completa con campos anulables", () => {
  assert.deepEqual(parseWorkOrders([order]), [order]);
});

test("rechaza un envoltorio que no pertenece al contrato", () => {
  assert.throws(() => parseWorkOrders({ items: [order] }), /arreglo JSON/);
});

test("rechaza prioridad o estado desconocidos", () => {
  assert.throws(() => parseWorkOrder({ ...order, priority: "URGENT" }));
  assert.throws(() => parseWorkOrder({ ...order, status: "TODO" }));
});

test("rechaza una fecha inválida", () => {
  assert.throws(() => parseWorkOrder({ ...order, dueDate: "no-es-fecha" }));
});

test("no confunde un campo ausente con un null permitido", () => {
  const incomplete = { ...order };
  delete incomplete.description;
  assert.throws(() => parseWorkOrder(incomplete));
});

test("rechaza un costo no entero o negativo en la respuesta", () => {
  assert.throws(() => parseWorkOrder({ ...order, estimatedCost: 10.5 }));
  assert.throws(() => parseWorkOrder({ ...order, estimatedCost: -1 }));
});

test("normaliza título y patente y envía solo los campos permitidos", () => {
  assert.deepEqual(
    createWorkOrderInput("  Cambio de aceite ", " abcd12 ", "15000"),
    {
      title: "Cambio de aceite",
      vehiclePlate: "ABCD12",
      estimatedCost: 15000,
    },
  );
});

test("rechaza un título compuesto por espacios", () => {
  assert.throws(() => createWorkOrderInput("   ", "ABCD12", ""), /1 y 200/);
});

test("acepta 200 caracteres y rechaza 201", () => {
  assert.equal(
    createWorkOrderInput("A".repeat(200), "ABCD12", "").title.length,
    200,
  );
  assert.throws(
    () => createWorkOrderInput("A".repeat(201), "ABCD12", ""),
    /1 y 200/,
  );
});

test("rechaza patentes inválidas y acepta ambos formatos", () => {
  assert.throws(() => createWorkOrderInput("X", "123", ""), /Patente/);
  assert.equal(createWorkOrderInput("X", "ab1234", "").vehiclePlate, "AB1234");
});

test("el costo vacío vale 0 y rechaza negativos, decimales y excesos", () => {
  assert.equal(createWorkOrderInput("X", "ABCD12", "").estimatedCost, 0);
  assert.throws(() => createWorkOrderInput("X", "ABCD12", "-5"), /costo/);
  assert.throws(() => createWorkOrderInput("X", "ABCD12", "10.5"), /costo/);
  assert.throws(
    () => createWorkOrderInput("X", "ABCD12", "2147483648"),
    /costo/,
  );
});

test("rechaza un id o ownerId que no sea UUID", () => {
  assert.throws(() => parseWorkOrder({ ...order, id: "123" }));
  assert.throws(() => parseWorkOrder({ ...order, ownerId: "no-uuid" }));
});

test("envía la descripción recortada solo si existe y respeta el máximo", () => {
  assert.deepEqual(
    createWorkOrderInput("Frenos", "ABCD12", "", "  Ruido al frenar "),
    {
      title: "Frenos",
      description: "Ruido al frenar",
      vehiclePlate: "ABCD12",
      estimatedCost: 0,
    },
  );
  assert.equal(
    "description" in createWorkOrderInput("Frenos", "ABCD12", "", "   "),
    false,
  );
  assert.throws(() =>
    createWorkOrderInput("Frenos", "ABCD12", "", "x".repeat(501)),
  );
});
