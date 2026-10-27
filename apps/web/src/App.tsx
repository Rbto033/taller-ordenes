import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiErrorMessage } from "./api-error.ts";
import {
  createWorkOrder,
  listWorkOrders,
} from "./work-orders/work-orders.api.ts";
import {
  createWorkOrderInput,
  PAGE_SIZE,
  PRIORITY_LABEL,
  STATUS_LABEL,
} from "./work-orders/work-order-contract.ts";

export default function App() {
  const client = useQueryClient();
  const [title, setTitle] = useState("");
  const [plate, setPlate] = useState("");
  const [cost, setCost] = useState("");
  const [skip, setSkip] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [inputError, setInputError] = useState("");

  const ordersQuery = useQuery({
    queryKey: ["work-orders", { skip, take: PAGE_SIZE }],
    queryFn: ({ signal }) => listWorkOrders(skip, PAGE_SIZE, signal),
  });

  const createMutation = useMutation({
    mutationFn: createWorkOrder,
    onSuccess: async () => {
      setTitle("");
      setPlate("");
      setCost("");
      setInputError("");
      setFeedback(
        "Orden creada. Si el listado no se actualiza, reintenta solo la lectura.",
      );
      setSkip(0);
      await client.invalidateQueries({ queryKey: ["work-orders"] });
    },
  });

  const orders = ordersQuery.data;
  const busy = createMutation.isPending;
  const canSubmit =
    !busy &&
    title.trim().length > 0 &&
    title.trim().length <= 200 &&
    plate.trim().length > 0;

  function clearMessages() {
    setInputError("");
    setFeedback("");
    createMutation.reset();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    clearMessages();
    try {
      createMutation.mutate(createWorkOrderInput(title, plate, cost));
    } catch (error) {
      setInputError(apiErrorMessage(error));
    }
  }

  return (
    <main>
      <header>
        <p className="eyebrow">Taller mecánico</p>
        <h1>Órdenes de trabajo</h1>
        <p>Consulta y registra órdenes del propietario de demostración.</p>
        <p className="notice">
          Entorno didáctico sin inicio de sesión. No ingresar datos sensibles.
        </p>
      </header>

      <section aria-labelledby="create-heading">
        <h2 id="create-heading">Nueva orden</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="wo-title">Título</label>
          <input
            id="wo-title"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              clearMessages();
            }}
            maxLength={200}
            required
            disabled={busy}
          />

          <label htmlFor="wo-plate">Patente</label>
          <input
            id="wo-plate"
            name="vehiclePlate"
            value={plate}
            onChange={(e) => {
              setPlate(e.target.value);
              clearMessages();
            }}
            maxLength={6}
            required
            disabled={busy}
            aria-describedby="plate-help"
          />
          <p id="plate-help" className="muted">
            Formato ABCD12 o AB1234. Se convierte a mayúsculas.
          </p>

          <label htmlFor="wo-cost">Costo estimado (CLP, opcional)</label>
          <input
            id="wo-cost"
            name="estimatedCost"
            inputMode="numeric"
            value={cost}
            onChange={(e) => {
              setCost(e.target.value);
              clearMessages();
            }}
            disabled={busy}
          />

          <button type="submit" disabled={!canSubmit}>
            {busy ? "Creando y sincronizando..." : "Crear orden"}
          </button>
        </form>

        {inputError && (
          <p role="alert" className="error">
            {inputError}
          </p>
        )}
        {createMutation.isError && (
          <p role="alert" className="error">
            {apiErrorMessage(createMutation.error, true)}
          </p>
        )}
        {feedback && (
          <p role="status" className="success">
            {feedback}
          </p>
        )}
      </section>

      <section aria-labelledby="list-heading">
        <div className="section-heading">
          <h2 id="list-heading">Órdenes</h2>
          <button
            type="button"
            onClick={() => void ordersQuery.refetch()}
            disabled={ordersQuery.isFetching || busy}
          >
            Actualizar listado
          </button>
        </div>

        {ordersQuery.isPending && <p role="status">Cargando órdenes...</p>}
        {ordersQuery.isFetching && !ordersQuery.isPending && (
          <p role="status">Actualizando listado...</p>
        )}

        {ordersQuery.isError && (
          <div role="alert" className="error">
            <p>{apiErrorMessage(ordersQuery.error)}</p>
            <p>
              {orders
                ? "Se muestran datos de una lectura anterior; podrían estar desactualizados."
                : "No se pudo consultar esta página. El error no significa que no existan órdenes."}
            </p>
          </div>
        )}

        {!ordersQuery.isError &&
          !ordersQuery.isPending &&
          orders?.length === 0 && (
            <p>
              {skip === 0
                ? "No hay órdenes. Crea la primera."
                : "No hay órdenes en esta página. Vuelve a la anterior."}
            </p>
          )}

        {orders && orders.length > 0 && (
          <ul className="task-list" aria-label="Listado de órdenes de trabajo">
            {orders.map((order) => (
              <li key={order.id}>
                <strong>{order.title}</strong>
                <p>
                  Patente: {order.vehiclePlate} | Estado:{" "}
                  {STATUS_LABEL[order.status]} | Prioridad:{" "}
                  {PRIORITY_LABEL[order.priority]}
                </p>
                <p>
                  Costo estimado: ${order.estimatedCost.toLocaleString("es-CL")}
                </p>
                {order.description !== null && <p>{order.description}</p>}
                <p className="muted">
                  Fecha límite:{" "}
                  {order.dueDate === null
                    ? "Sin fecha"
                    : new Date(order.dueDate).toLocaleString("es-CL")}
                </p>
              </li>
            ))}
          </ul>
        )}

        <nav className="pagination" aria-label="Paginación de órdenes">
          <button
            type="button"
            onClick={() =>
              setSkip((current) => Math.max(0, current - PAGE_SIZE))
            }
            disabled={skip === 0 || ordersQuery.isFetching || busy}
          >
            Anterior
          </button>
          <span>Página {skip / PAGE_SIZE + 1}</span>
          <button
            type="button"
            onClick={() => setSkip((current) => current + PAGE_SIZE)}
            disabled={
              ordersQuery.isFetching ||
              ordersQuery.isError ||
              orders?.length !== PAGE_SIZE ||
              busy
            }
          >
            Siguiente
          </button>
        </nav>
        <p className="muted">
          Hasta 20 órdenes por página. La API no devuelve un total.
        </p>
      </section>
    </main>
  );
}
