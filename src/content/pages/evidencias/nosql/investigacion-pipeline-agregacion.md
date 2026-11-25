---
title: "Investigación: El pipeline de agregación en MongoDB"
---

## Introducción

Con `find` se pueden filtrar y proyectar documentos, pero muchas preguntas
necesitan más: agrupar, calcular promedios, combinar colecciones o
transformar la forma de los documentos. Para eso MongoDB tiene el **pipeline de
agregación**, el equivalente aproximado a combinar `WHERE`, `GROUP BY`, `JOIN` y
`ORDER BY` en SQL.

Un pipeline es una lista de **etapas**: cada etapa recibe documentos, hace una
operación y le pasa el resultado a la siguiente, como una línea de producción.
Esta investigación explica las etapas principales, muestra ejemplos con la base
de prueba `sample_mflix` que usamos en el taller y resume cómo escribir
pipelines eficientes.

## 1. Cómo funciona un pipeline

```javascript
db.coleccion.aggregate([
  { etapa1 },   // la salida de esta etapa...
  { etapa2 },   // ...es la entrada de esta
  { etapa3 }
])
```

- Cada etapa procesa los documentos que recibe y entrega el resultado a la
  siguiente.
- Un pipeline ejecutado con `aggregate()` **no modifica** los documentos de la
  colección, a menos que termine en una etapa `$out` o `$merge`, que escriben el
  resultado en otra colección.

## 2. Etapas principales

| Etapa | Qué hace | Equivalente aproximado en SQL |
|:---|:---|:---|
| `$match` | Filtra documentos | `WHERE` / `HAVING` |
| `$project`, `$set` | Elige, renombra o calcula campos | Lista del `SELECT` |
| `$group` | Agrupa y aplica acumuladores (`$sum`, `$avg`, `$max`...) | `GROUP BY` |
| `$sort` | Ordena | `ORDER BY` |
| `$limit`, `$skip` | Limita o salta resultados | `FETCH FIRST` / `OFFSET` |
| `$unwind` | Crea un documento por cada elemento de un arreglo | (no existe directo) |
| `$lookup` | Une con otra colección | `LEFT OUTER JOIN` |

## 3. Ejemplo: promedio de calificación por género

En `sample_mflix`, cada película tiene un arreglo `genres`. Para saber el
promedio de IMDb por género, primero hay que "desarmar" el arreglo con
`$unwind`:

```javascript
db.movies.aggregate([
  { $match: { year: { $gte: 2000 }, "imdb.rating": { $type: "number" } } },
  { $unwind: "$genres" },
  { $group: {
      _id: "$genres",
      promedio: { $avg: "$imdb.rating" },
      peliculas: { $sum: 1 }
  } },
  { $match: { peliculas: { $gte: 100 } } },     // como un HAVING
  { $sort: { promedio: -1 } },
  { $limit: 5 },
  { $project: { _id: 0, genero: "$_id", promedio: { $round: ["$promedio", 2] }, peliculas: 1 } }
])
```

1. `$match` deja solo películas desde el año 2000 con calificación numérica.
2. `$unwind` convierte una película con tres géneros en tres documentos.
3. `$group` agrupa por género y calcula el promedio y la cantidad.
4. El segundo `$match` filtra grupos, como un `HAVING`.
5. `$sort`, `$limit` y `$project` ordenan, recortan y dan formato.

## 4. Unir colecciones con $lookup

`$lookup` hace un *left outer join* con otra colección de la misma base de
datos y agrega a cada documento un **arreglo** con los documentos que
coinciden. Si no hay coincidencias, el arreglo queda vacío.

```javascript
db.movies.aggregate([
  { $match: { title: "The Godfather" } },
  { $lookup: {
      from: "comments",
      localField: "_id",
      foreignField: "movie_id",
      as: "comentarios"
  } },
  { $project: { title: 1, total_comentarios: { $size: "$comentarios" } } }
])
```

Para que `$lookup` sea rápido, el campo `foreignField` de la otra colección
debería estar indexado. Aun así, si una consulta necesita unir colecciones todo
el tiempo, vale la pena revisar si esos datos deberían estar embebidos.

## 5. Escribir pipelines eficientes

- **Filtrar lo antes posible:** un `$match` al inicio reduce los documentos que
  pasan a etapas costosas como `$group`, `$lookup` o `$unwind`, y además puede
  aprovechar los índices de la colección.
- **El optimizador ayuda, pero no hace milagros:** MongoDB reordena algunas
  etapas automáticamente; por ejemplo, mueve un `$match` antes de un `$sort`
  para ordenar menos documentos, y une un `$unwind` con el `$lookup` anterior
  para no crear documentos intermedios enormes. Con la opción `explain` se puede
  ver cómo quedó el pipeline después de optimizarlo.
- **Límites de memoria:** las etapas que necesitan más de 100 MB de memoria
  (como `$group` o un `$sort` sin índice) escriben archivos temporales en disco,
  según la configuración `allowDiskUseByDefault` desde MongoDB 6.0.
- **Otros límites:** un pipeline puede tener máximo 1.000 etapas, y cada
  documento del resultado no puede pasar de 16 MB.

## Comparación general

| Pregunta | `find` | `aggregate` |
|:---|:---|:---|
| Filtrar y proyectar | Sí | Sí (`$match`, `$project`) |
| Agrupar y calcular totales | No | Sí (`$group`) |
| Trabajar con elementos de arreglos | Limitado | Sí (`$unwind`) |
| Unir colecciones | No | Sí (`$lookup`) |
| Guardar el resultado en otra colección | No | Sí (`$out`, `$merge`) |

## Conclusiones

El pipeline de agregación es la herramienta que convierte a MongoDB en algo más
que un almacén de documentos: permite hacer análisis completos dentro de la
base de datos. En el taller MQL usamos agregaciones sobre `sample_mflix`, y en
el proyecto BountyLine las consultas de MongoDB (`04_consultas.js`) también se
apoyan en etapas como estas. La lección principal es pensar en el orden: filtrar
primero, transformar después y unir colecciones solo cuando de verdad haga
falta.

## Fuentes

1. MongoDB. *Aggregation Pipeline*.  
   https://www.mongodb.com/docs/manual/core/aggregation-pipeline/
2. MongoDB. *Aggregation Pipeline Optimization*.  
   https://www.mongodb.com/docs/manual/core/aggregation-pipeline-optimization/
3. MongoDB. *Aggregation Pipeline Limits*.  
   https://www.mongodb.com/docs/manual/core/aggregation-pipeline-limits/
4. MongoDB. *$lookup (aggregation stage)*.  
   https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/

## Detalles

- Fecha: noviembre de 2026
- Motor / herramienta: MongoDB, base de prueba `sample_mflix`
