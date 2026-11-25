---
title: "Investigación: Índices en MongoDB y la regla ESR"
---

## Introducción

Sin índices, MongoDB tiene que revisar **todos** los documentos de una
colección para responder una consulta (un *collection scan*, o `COLLSCAN` en
el plan). Con un índice adecuado, puede ir directo a los documentos que
necesita (`IXSCAN`). En el Taller MQL vimos esa diferencia con
`explain("executionStats")`.

Esta investigación explica cómo funcionan los índices en MongoDB, los tipos más
usados (de un campo, compuesto, *multikey* y TTL), la regla ESR para ordenar los
campos de un índice compuesto y el costo que tienen los índices sobre las
escrituras.

## 1. Cómo funcionan

Los índices de MongoDB usan una estructura **B-tree**: guardan los valores de
uno o varios campos, ordenados, con una referencia al documento. Eso permite
resolver búsquedas por igualdad, rangos y ordenamientos sin recorrer toda la
colección.

Toda colección tiene desde su creación un índice **único** sobre `_id`, que
impide insertar dos documentos con el mismo `_id` y que no se puede borrar.

```javascript
// Índice de un solo campo
db.movies.createIndex({ year: 1 })        // 1 = ascendente, -1 = descendente

// Ver los índices de una colección
db.movies.getIndexes()
```

## 2. Índice compuesto y prefijos

Un índice compuesto incluye varios campos (hasta 32). Puede usarse para
consultas sobre todos sus campos o sobre sus **prefijos**, es decir, los
primeros campos en orden:

```javascript
db.inventory.createIndex({ item: 1, location: 1, stock: 1 })
```

Este índice sirve para consultas sobre `item`, sobre `item` y `location`, o sobre
los tres campos. No es útil, en cambio, para una consulta que filtra solo por
`location` o solo por `stock`.

## 3. La regla ESR (Equality, Sort, Range)

Para la mayoría de los índices compuestos, el orden recomendado de los campos
es:

1. **E — Igualdad (*Equality*):** primero los campos que se comparan con un valor
   exacto.
2. **S — Ordenamiento (*Sort*):** luego los campos por los que se ordena.
3. **R — Rango (*Range*):** al final los campos con condiciones como `$gt`,
   `$lt` o `$gte`.

```javascript
// Consulta: películas de drama de 2000 en adelante, ordenadas por calificación
db.movies.find(
  { genres: "Drama", year: { $gte: 2000 } }
).sort({ "imdb.rating": -1 })

// Índice siguiendo ESR: igualdad, ordenamiento, rango
db.movies.createIndex({ genres: 1, "imdb.rating": -1, year: 1 })
```

¿Por qué el rango va al final? Porque MongoDB no puede usar el índice para
ordenar los resultados de un filtro de rango. Si el campo de ordenamiento va
antes del rango, el motor obtiene los documentos ya ordenados desde el índice y
evita un ordenamiento en memoria, que es más lento. La documentación aclara una
excepción: si el filtro de rango es muy selectivo (deja pasar muy pocos
documentos), puede convenir ponerlo antes del ordenamiento (ERS).

Esta fue justamente la regla que usamos en el punto 14 del Taller MQL para
pasar de `COLLSCAN` a `IXSCAN`.

## 4. Índices multikey (sobre arreglos)

Cuando se crea un índice sobre un campo que contiene un **arreglo**, MongoDB lo
convierte automáticamente en un índice *multikey*: crea una entrada en el índice
por cada valor distinto del arreglo, todas apuntando al mismo documento.

```javascript
db.movies.createIndex({ genres: 1 })   // genres es un arreglo → índice multikey
```

Una restricción importante: en un índice compuesto *multikey*, cada documento
puede tener **como máximo un** campo indexado que sea arreglo. Si `genres` y
`cast` fueran ambos arreglos, no se podría crear un índice compuesto sobre los
dos.

## 5. Índices TTL (que borran datos solos)

Un índice TTL (*time to live*) es un índice de un solo campo de tipo fecha que
le indica a MongoDB que borre automáticamente los documentos después de cierto
tiempo:

```javascript
// Las sesiones se borran una hora después de su fecha de creación
db.sesiones.createIndex(
  { creada_en: 1 },
  { expireAfterSeconds: 3600 }
)
```

Son útiles para sesiones, códigos de verificación o registros temporales. Hay
que tener en cuenta que el proceso que borra los documentos vencidos corre cada
60 segundos, así que el borrado no es inmediato, y que los índices compuestos no
admiten TTL.

## 6. El costo de los índices

Los índices aceleran las lecturas, pero **hacen más lentas las escrituras**:
cada inserción o actualización también tiene que actualizar todos los índices
de la colección. En colecciones donde se escribe mucho más de lo que se lee,
tener demasiados índices sale caro. Además, ocupan espacio en disco y en
memoria. Por eso conviene crear índices para las consultas frecuentes y revisar
con `explain()` que realmente se estén usando.

## Comparación general

| Tipo | Se crea con | Útil para | A tener en cuenta |
|:---|:---|:---|:---|
| Un campo | `{ campo: 1 }` | Filtros y ordenamientos sobre un campo | Es el caso más simple |
| Compuesto | `{ a: 1, b: -1, c: 1 }` | Consultas que combinan campos | Seguir ESR; solo sirve por prefijos |
| *Multikey* | Automático si el campo es arreglo | Buscar valores dentro de arreglos | Máximo un arreglo por documento en un compuesto |
| TTL | `{ fecha: 1 }` + `expireAfterSeconds` | Borrar datos temporales | Borrado cada ~60 s; solo un campo |
| Único | `{ campo: 1 }, { unique: true }` | Evitar valores repetidos | El de `_id` existe siempre |

## Conclusiones

Un índice en MongoDB funciona igual que en una base relacional en lo esencial
(es un B-tree y tiene un costo en escrituras), pero el modelo documental agrega
casos propios, como los índices *multikey* sobre arreglos y los TTL para datos
que vencen. La regla ESR fue la clave del Taller MQL: el mismo índice con los
campos en otro orden no habría evitado el ordenamiento en memoria. Y, como en
Oracle, la única forma de saber si un índice sirve es revisar el plan de
ejecución.

## Fuentes

1. MongoDB. *Indexes*.  
   https://www.mongodb.com/docs/manual/indexes/
2. MongoDB. *The ESR (Equality, Sort, Range) Guideline*.  
   https://www.mongodb.com/docs/manual/tutorial/equality-sort-range-guideline/
3. MongoDB. *Compound Indexes*.  
   https://www.mongodb.com/docs/manual/core/indexes/index-types/index-compound/
4. MongoDB. *Multikey Indexes*.  
   https://www.mongodb.com/docs/manual/core/indexes/index-types/index-multikey/
5. MongoDB. *TTL Indexes*.  
   https://www.mongodb.com/docs/manual/core/index-ttl/

## Detalles

- Fecha: noviembre de 2026
- Motor / herramienta: MongoDB, base de prueba `sample_mflix`
