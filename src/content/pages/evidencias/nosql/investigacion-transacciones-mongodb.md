---
title: "Investigación: Transacciones y consistencia en MongoDB"
---

## Introducción

Una idea muy repetida es que las bases de datos NoSQL "no tienen
transacciones". En MongoDB eso no es cierto: cada operación sobre un documento
es atómica y, además, existen transacciones ACID que abarcan varios documentos,
colecciones e incluso varios *shards*. Lo que cambia frente a una base
relacional es **cuándo** conviene usarlas y cómo se configura la garantía de
lectura y escritura.

Esta investigación explica la atomicidad de un documento, las transacciones
multidocumento, los parámetros *read concern* y *write concern*, y las
limitaciones que hay que tener en cuenta al diseñar.

## 1. Atomicidad de un solo documento

En MongoDB, una operación de escritura sobre **un** documento es atómica:
aunque modifique varios campos o elementos de un arreglo, nadie ve el documento
a medio actualizar. Como el modelo documental permite **embeber** datos
relacionados dentro del mismo documento, muchos casos que en SQL necesitarían
una transacción se resuelven con una sola operación.

```javascript
// El pedido y sus productos viven en el mismo documento:
// agregar un producto y recalcular el total es una sola operación atómica.
db.pedidos.updateOne(
  { _id: 8, estado: "BORRADOR" },
  {
    $push: { items: { producto: "PRU-100", cantidad: 2, precio: 45000 } },
    $inc:  { total: 90000 }
  }
)
```

Por eso la documentación de MongoDB insiste en que, para muchos escenarios, un
buen modelo de datos (documentos embebidos y arreglos) minimiza la necesidad de
transacciones.

## 2. Transacciones multidocumento

Cuando una operación de negocio debe modificar **varios** documentos y todos los
cambios deben quedar o ninguno, se usa una transacción. Se abre dentro de una
**sesión** y todas las operaciones deben pasar esa sesión:

```javascript
const session = db.getMongo().startSession();
const cuentas = session.getDatabase("banco").cuentas;

session.startTransaction({
  readConcern:  { level: "snapshot" },
  writeConcern: { w: "majority" }
});

try {
  cuentas.updateOne({ _id: "A", saldo: { $gte: 300000 } }, { $inc: { saldo: -300000 } });
  cuentas.updateOne({ _id: "B" },                         { $inc: { saldo:  300000 } });
  session.commitTransaction();     // ambos cambios se vuelven visibles juntos
} catch (e) {
  session.abortTransaction();      // ningún cambio se vuelve visible
  throw e;
} finally {
  session.endSession();
}
```

Si la transacción se aborta, los cambios se descartan sin haber sido visibles
nunca. Si la sesión termina con una transacción abierta, esa transacción
también se aborta.

## 3. Read concern y write concern

En una base relacional el aislamiento se elige con un nivel como *read
committed* o *serializable*. En MongoDB las garantías se configuran con dos
parámetros, que en una transacción se definen a nivel de la transacción (no de
cada operación):

**Read concern**: qué tan "confirmados" deben estar los datos que se leen.

| Nivel | Qué devuelve |
|:---|:---|
| `local` | Lo más reciente que tiene el nodo, aunque todavía podría deshacerse |
| `majority` | Datos confirmados por la mayoría de los miembros del *replica set* |
| `snapshot` | Una foto consistente de datos confirmados por la mayoría, sincronizada entre *shards* |

**Write concern**: cuántos miembros deben confirmar la escritura antes de
responder.

| Valor | Qué significa |
|:---|:---|
| `w: 1` | Basta con el nodo primario; si hay una falla, la transacción podría perderse |
| `w: "majority"` | La escritura se aplicó en la mayoría de los miembros con voto (es el valor predeterminado para transacciones desde MongoDB 5.0) |

Para que `majority` y `snapshot` den sus garantías completas, la transacción
debe confirmarse con `writeConcern: { w: "majority" }`.

## 4. Limitaciones y costos

- **Requieren un *replica set* o un *cluster* con *shards*.** Un servidor
  `mongod` independiente (*standalone*) no soporta transacciones.
- **Tienen un límite de tiempo.** Por defecto una transacción debe durar menos
  de un minuto (`transactionLifetimeLimitSeconds`); si se pasa, se considera
  expirada y se aborta.
- **Cuestan más que una escritura sobre un documento.** La propia documentación
  advierte que las transacciones no deben reemplazar un buen diseño del
  esquema.
- **Hay operaciones restringidas**, como escribir en colecciones *capped* o en
  las bases `config`, `admin` y `local`.

## Comparación con una base relacional

| Aspecto | Oracle / MySQL | MongoDB |
|:---|:---|:---|
| Unidad atómica básica | La sentencia | El documento |
| Transacciones de varias operaciones | Lo normal | Disponibles, pero se recomiendan solo cuando hacen falta |
| Cómo se configura la garantía | Nivel de aislamiento | *Read concern* y *write concern* |
| Forma de evitar transacciones | Normalizar no las evita | Embeber datos que cambian juntos |

## Conclusiones

MongoDB sí ofrece transacciones ACID, pero su filosofía es distinta a la de una
base relacional: primero se intenta que los datos que cambian juntos vivan en el
mismo documento, para aprovechar la atomicidad de un documento, y las
transacciones multidocumento quedan para los casos que de verdad las necesitan.
Esto se conecta con el proyecto BountyLine, donde decidimos dejar el manejo de
créditos y pagos en MySQL, con transacciones y procedimientos, y llevar a
MongoDB la información social (publicaciones, chat y bitácora), que no necesita
transacciones entre varios documentos.

## Fuentes

1. MongoDB. *Transactions*.  
   https://www.mongodb.com/docs/manual/core/transactions/
2. MongoDB. *Production Considerations (Transactions)*.  
   https://www.mongodb.com/docs/manual/core/transactions-production-consideration/
3. MongoDB. *Default MongoDB Read Concerns/Write Concerns*.  
   https://www.mongodb.com/docs/manual/reference/mongodb-defaults/

## Detalles

- Fecha: noviembre de 2026
- Motor / herramienta: MongoDB
