# eShop React

Frontend React/Vite para Catalog.API, Basket.API y Orders.API.

## Variables De Entorno

```env
VITE_CATALOG_API_URL=https://<catalog-api-public-url>
VITE_BASKET_API_URL=https://<basket-api-public-url>
VITE_ORDERS_API_URL=https://<orders-api-public-url>
```

En Netlify configurar esas variables en Site settings > Environment variables y volver a desplegar.

## Flujo De Compra

1. El usuario agrega productos desde `/products` al Basket existente.
2. En `/basket` presiona `Realizar compra`.
3. React genera una `Idempotency-Key` por intento logico y la conserva si la solicitud falla para poder reintentar sin duplicar.
4. React llama `POST /api/orders` en Orders.API enviando `customerId` y `basketId` con el usuario actual del carrito.
5. Orders.API recalcula importes y devuelve la orden creada.
6. React muestra la confirmacion con productos, subtotal, impuestos y total.
7. `/orders` consulta el historial del cliente mediante `GET /api/orders/customer/{customerId}`.
8. `/orders` permite buscar una orden por ID con `GET /api/orders/{id}` y cambiar estado con `PATCH /api/orders/{id}/status`.

## Identificacion Del Cliente

La aplicacion no tiene autenticacion formal. El cliente comprador se identifica con el mismo valor que usa Basket.API como dueno del carrito. Ese valor se guarda en `localStorage` con la clave `eshop-basket-user-name`; si no existe, se usa `usuario-demo`.

Para crear la orden, React envia ese valor como `customerId` y `basketId` porque el Basket existente se consulta con `/basket/{userName}`.

La barra superior incluye un selector de cliente activo para simular el usuario con sesion iniciada. Al cambiar de cliente, React consulta otro carrito y `/orders` muestra las ordenes de ese cliente, sin crear un sistema de login ni contrasenas.

## Ejecucion

```bash
npm install
npm run dev
```

Build de produccion:

```bash
npm run build
```

## Validacion Manual

- Configurar `VITE_ORDERS_API_URL`.
- Agregar un producto al carrito.
- Presionar `Realizar compra`.
- Confirmar que se muestra el ID de orden y totales.
- Abrir `/orders` y confirmar que la orden aparece en el historial.

## Evidencias Para El Examen

- Basket con productos.
- Confirmacion de compra.
- Historial de ordenes.
- Variables configuradas en Netlify.
- URL publica del frontend.

## Notas Del Template

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
