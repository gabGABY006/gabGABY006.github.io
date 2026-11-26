---
title: "Sustentación del Taller MQL · sample_restaurants"
---

## Título

Sustentación del Taller MQL

## Descripción

Sustentación del [Taller MQL](/evidencias/nosql/taller-mql). Esta vez había que
resolver en el momento tres consultas sobre otra base de prueba de MongoDB
Atlas, `sample_restaurants`, que tiene los restaurantes de Nueva York con su
barrio (`borough`), su tipo de cocina (`cuisine`), su dirección (`address`) y
sus calificaciones.

Los tres puntos fueron:

1. Restaurantes italianos de Brooklyn.
2. Cantidad de restaurantes por tipo de cocina.
3. Top 5 de barrios con más restaurantes.

<div class="evidence-callout">
<strong>¿Cuándo usar <code>find</code> y cuándo <code>aggregate</code>?</strong>
<p>El punto 1 solo filtra documentos y elige qué campos mostrar, así que basta con <code>find</code>. Los puntos 2 y 3 necesitan <strong>contar por grupo</strong>, algo que <code>find</code> no puede hacer, por eso usan el pipeline de agregación con <code>$group</code>.</p>
</div>

## Punto 1 — Restaurantes italianos de Brooklyn

```javascript
use("sample_restaurants");

db.restaurants.find({
     cuisine: "Italian", 
    borough:"Brooklyn"},
    {_id:0, name:1,borough:1, cuisine:1, 
    "adress.street":1});
```

- **El filtro** (primer argumento) tiene dos condiciones, y en `find` varias condiciones en el mismo objeto funcionan como un `AND`: la cocina debe ser `"Italian"` **y** el barrio `"Brooklyn"`.
- **La proyección** (segundo argumento) muestra solo el nombre, el barrio, la cocina y la calle, y oculta el `_id` con `_id: 0`.
- **La calle está dentro de un subdocumento**, así que se accede con notación de punto entre comillas: `"address.street"`.

<div class="evidence-callout">
<strong>Observación</strong>
<p>En la entrega el campo quedó escrito como <code>"adress.street"</code> (con una sola <em>d</em>). En <code>sample_restaurants</code> el campo se llama <code>address</code>, así que con ese error la consulta funciona pero la calle no aparece en el resultado: MongoDB no da error al proyectar un campo que no existe, simplemente no lo muestra.</p>
</div>

La versión corregida es:

```javascript
db.restaurants.find(
  { cuisine: "Italian", borough: "Brooklyn" },
  { _id: 0, name: 1, borough: 1, cuisine: 1, "address.street": 1 }
);
```

## Punto 2 — Restaurantes por tipo de cocina

```javascript
use("sample_restaurants");
db.restaurants.aggregate([
  { $group: { _id: "$cuisine", total: { $sum: 1 } } },
  { $project: { _id: 0, cuisine: "$_id", total: 1 } },
  { $sort: { total: -1 } }
]);
```

1. **`$group`** agrupa los documentos por el valor de `cuisine` (el campo que va en `_id` es la llave del grupo) y `{ $sum: 1 }` suma 1 por cada restaurante, es decir, los cuenta. Es el equivalente a `GROUP BY cuisine` con `COUNT(*)` en SQL.
2. **`$project`** le da forma al resultado: renombra `_id` como `cuisine` y oculta el `_id` original.
3. **`$sort`** con `-1` ordena de mayor a menor cantidad.

## Punto 3 — Top 5 de barrios con más restaurantes

```javascript
use("sample_restaurants");
db.restaurants.aggregate([
  { $group: { _id: "$borough", total: { $sum: 1 } } },
  { $project: { _id: 0, borough: "$_id", total: 1 } },
  { $sort: { total: -1 } },
  {$limit: 5}
]);
```

Es el mismo patrón del punto 2, agrupando por `borough`, con una etapa más al
final: **`$limit: 5`** se queda con los cinco primeros. El orden de las etapas
importa: `$limit` va **después** de `$sort`, porque si fuera antes se quedaría
con cinco grupos cualquiera y no con los cinco barrios con más restaurantes.
Es la misma idea del `ROWNUM` mal ubicado del [Quiz 1](/evidencias/sql/solucion-quiz-1),
pero aquí está bien resuelta.

Un detalle de esta base de datos: además de los cinco barrios de Nueva York,
algunos restaurantes tienen `borough: "Missing"`. Como son pocos, no entran en
el top 5, pero si se quisiera excluirlos explícitamente bastaría con agregar
`{ $match: { borough: { $ne: "Missing" } } }` como primera etapa.

## Lo que aprendí

- **`find` para filtrar, `aggregate` para resumir.** Apenas la pregunta dice "por tipo", "por barrio" o "cuántos", hace falta un `$group`.
- **`$group` + `$sum: 1` es el `COUNT(*)` de MongoDB**, y la llave del grupo siempre va en `_id`.
- **El orden de las etapas cambia el resultado:** `$sort` antes de `$limit` para obtener un top N.
- **Un error de escritura en un nombre de campo no lanza error en MongoDB**, solo devuelve el resultado sin ese campo, así que hay que revisar bien los nombres contra un documento de ejemplo.

## Enlace para compartir el archivo

<a href="/bases-2/taller-mql/sustentacion_sample_restaurants.mongodb" download style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Descargar script (.mongodb)
</a>

<a href="/evidencias/nosql/taller-mql" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Ver el Taller MQL original
</a>

## Detalles

- Fecha: noviembre de 2026
- Motor / herramienta: MongoDB Atlas, base de prueba `sample_restaurants`
- Modalidad: sustentación del Taller MQL
