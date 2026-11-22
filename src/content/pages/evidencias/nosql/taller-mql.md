---
title: "Taller MQL · Películas y modelos documentales"
---

## Título

Taller MQL

## Descripción

Usando MongoDB Atlas y la base de prueba 'sample_mflix' se hizo un taller en clase con consultas MQL, desde consultas más sencillas, hasta consultas más complejas usando índices

Consultamos películas de `sample_mflix`, agrupamos resultados y comparamos la ejecución de una consulta antes y después de crear un índice compuesto. En la parte D presentamos modelos documentales con ejemplos en JSON.

<div class="evidence-callout">
<strong>¿Qué cambia cuando MongoDB utiliza un índice?</strong>
<p>El punto 14 repite una consulta sobre películas y compara su plan antes y después de crear un índice compuesto. La pregunta es cuántos documentos debe examinar el motor para obtener los resultados.</p>
<p>En el script, localiza <code>executionStats</code> y compara <code>totalDocsExamined</code> y el plan ganador. En el informe puedes contrastar esa evidencia con la consulta original.</p>
</div>

## Consultas, agregación e índices

<iframe title="Consultas, agregación e índices" src="/bases-2/taller-mql/consultas.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

## Parte D · Modelos documentales

<iframe title="Parte D · Modelos documentales" src="/bases-2/taller-mql/Modelos_ParteD_Taller_MQL.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

## Script MQL · Partes A, B y C

<div class="evidence-code">

```javascript
/* global use */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
//PARTE A

//PUNTO 1
// Filtra Drama con year entre 2000 y 2010 ($gte/$lte) e imdb.rating >= 8.
// Proyecta title, year e imdb.rating sin _id, ordena por rating descendente y limita a 10.
// Para el conteo total se cambia .limit(10) por .count().
use("sample_mflix");
db.movies.find(
  { genres: "Drama", year: { $gte: 2000, $lte: 2010 }, "imdb.rating": { $gte: 8 } },
  { _id: 0, title: 1, year: 1, "imdb.rating": 1 }
).sort({ "imdb.rating": -1 }).limit(10);

// PUNTO 2
// cast: "Tom Hanks" busca el actor dentro del arreglo de actores.
// $ne en directors excluye las películas donde Steven Spielberg aparece como director.
use("sample_mflix");
db.movies.find(
  { cast: "Tom Hanks", directors: { $ne: "Steven Spielberg" } },
  { _id: 0, title: 1, year: 1, directors: 1 }
).sort({ year: 1 });

// PUNTO 3
// $size: 3 exige que el arreglo genres tenga exactamente 3 elementos.
// $all exige que contenga Comedy y Romance, sin importar el orden.
use("sample_mflix");
db.movies.find(
  { genres: { $size: 3, $all: ["Comedy", "Romance"] } },
  { _id: 0, title: 1, year: 1, genres: 1 }
);

// PUNTO 4
// $or une dos condiciones: $exists: false (no tiene el campo rated)
// o $in (su valor es "UNRATED" o "NOT RATED"). Conteo: agregar .count() al final.
use("sample_mflix");
db.movies.find(
  { $or: [ { rated: { $exists: false } }, { rated: { $in: ["UNRATED", "NOT RATED"] } } ] },
  { _id: 0, title: 1, year: 1, rated: 1 }
);

// PUNTO 5
// Expresión regular: ^the ancla el inicio, man$ ancla el final y .* permite cualquier texto en medio.
// La opción i hace la búsqueda sin distinguir mayúsculas de minúsculas.
use("sample_mflix");
db.movies.find(
  { title: { $regex: /^the.*man$/i } },
  { _id: 0, title: 1 }
);

// Parte B - AGREGACIÓN

// 6. 
// Filtra registros con rating numérico válido y separa cada género del arreglo con $unwind. Luego agrupa por género acumulando
// métricas estadísticas, filtra los que superan las 500 películas, redondea el promedio a dos decimales y ordena el resultado 
// de mayor a menor rating.

use("sample_mflix");
db.movies.aggregate([
 { $match: { "imdb.rating": { $type: "number" } } },
 { $unwind: "$genres" },
 { 
 $group: { 
   _id: "$genres", 
  totalPeliculas: { $sum: 1 }, 
   promedioRating: { $avg: "$imdb.rating" }, 
  maxRating: { $max: "$imdb.rating" } 
  } 
 },
 { $match: { totalPeliculas: { $gt: 500 } } },
 { 
 $project: { 
 genero: "$_id", 
 totalPeliculas: 1, 
 promedioRating: { $round: ["$promedioRating", 2] }, 
 maxRating: 1, 
 _id: 0 
 } 
 },
 { $sort: { promedioRating: -1 } }
]);

// 7. 
// Selecciona películas con rating >= 7.5, desglosa el arreglo de directores y agrupa para contar su producción
// total acumulando los títulos en un arreglo. Tras filtrar aquellos con al menos 5 películas y limitar a los 5 
// primeros, recorta la lista de títulos a un máximo de 3 mediante $slice.

use("sample_mflix");
db.movies.aggregate([
 { $match: { "imdb.rating": { $gte: 7.5 }, "directors": { $exists: true, $ne: [] } } },
 { $unwind: "$directors" },
 { 
 $group: { 
 _id: "$directors", 
 totalPeliculas: { $sum: 1 }, 
 titulos: { $push: "$title" } 
 } 
 },
 { $match: { totalPeliculas: { $gte: 5 } } },
 { $sort: { totalPeliculas: -1 } },
 { $limit: 5 },
 { 
 $project: { 
 director: "$_id", 
 totalPeliculas: 1, 
 titulosMuestra: { $slice: ["$titulos", 3] }, 
 _id: 0 
 } 
 }
]);

// 8.
// Selecciona películas desde el año 1950 en adelante, añade un campo calculado para agruparlas por década,
// cuenta el total por cada una y las ordena cronológicamente.

use("sample_mflix");
db.movies.aggregate([
 { $match: { "year": { $gte: 1950, $type: "number" } } },
 { 
 $addFields: { 
 decade: { 
 $concat: [ 
 { $toString: { $multiply: [ { $floor: { $divide: [ "$year", 10 ] } }, 10 ] } }, 
 "s" ] 
} 
 } 
 },
 { 
 $group: { 
 _id: "$decade", 
 totalPeliculas: { $sum: 1 } 
 } 
 },
 { $sort: { _id: 1 } },
 { 
 $project: { 
 decada: "$_id", 
 totalPeliculas: 1, 
 _id: 0 
 } 
 }
]);

// 9.
// Filtra películas con países válidos y rating numérico, desglosa el arreglo de países, agrupa por país 
// calculando el total de películas y el rating promedio, filtra los países con al menos 50 películas, 
// redondea el promedio a dos decimales y ordena de mayor a menor rating.

use("sample_mflix");
db.movies.aggregate([
  { $match: { "countries": { $exists: true, $ne: [] }, "imdb.rating": { $type: "number" } } },
  { $unwind: "$countries" },
  { 
    $group: { 
      _id: "$countries", 
      totalPeliculas: { $sum: 1 }, 
      promedioRating: { $avg: "$imdb.rating" } 
    } 
  },
  { $match: { totalPeliculas: { $gte: 50 } } },
  { 
    $project: { 
      pais: "$_id", 
      totalPeliculas: 1, 
      promedioRating: { $round: ["$promedioRating", 2] }, 
      _id: 0 
    } 
  },
  { $sort: { promedioRating: -1 } }
]);

// 10.
// Selecciona películas con rating >= 8.0, desglosa el arreglo de actores (cast) y agrupa para contar su 
// participación total acumulando los títulos en un arreglo. Filtra aquellos con al menos 4 películas, 
// ordena de mayor a menor, limita a los 10 primeros y recorta la lista de títulos a un máximo de 3 mediante $slice.

use("sample_mflix");
db.movies.aggregate([
  { $match: { "imdb.rating": { $gte: 8.0 }, "cast": { $exists: true, $ne: [] } } },
  { $unwind: "$cast" },
  { 
    $group: { 
      _id: "$cast", 
      totalPeliculas: { $sum: 1 }, 
      titulos: { $push: "$title" } 
    } 
  },
  { $match: { totalPeliculas: { $gte: 4 } } },
  { $sort: { totalPeliculas: -1 } },
  { $limit: 10 },
  { 
    $project: { 
      actor: "$_id", 
      totalPeliculas: 1, 
      titulosMuestra: { $slice: ["$titulos", 3] }, 
      _id: 0 
    } 
  }
]);

//PARTE C
//Punto 11. Crear una coleccion llamada peliculas_pareja por medio de merge, 
// con las peliculas de 2015, el cual contenga un campo calculado para categoria utilizando switch.

use("sample_mflix");
db.movies.aggregate([
  { $match: { year: 2015 } }, 
  {
    $project: {
      titulo: "$title",  
      generos: "$genres", 
      rating: "$imdb.rating",    
      categoria: {
        $switch: {
          branches: [
            { case: { $gte: ["$imdb.rating", 7.5] }, then: "Alta" },
            { case: { $gte: ["$imdb.rating", 6] }, then: "Media" }
          ],
          default: "baja"
        }
      }
    }
  },
  { 
    $merge: { 
      into: "peliculas_pareja", 
      whenMatched: "replace", 
      whenNotMatched: "insert" 
    } 
  }
]);

//Punto 12. Con updateMany agregar el campo revisado: 
// incrementar el ranking de las peliculas un 0.1 las 
// cuales sean de categoria media, reportar.
//utilizando peliculas_pareja ya que en el punto anterior se creo esa coleccion.

use("sample_mflix");
db.peliculas_pareja.updateMany(
  { categoria: "Media" }, 
  { 
    $set: { revisado: true }, 
    $inc: { rating: 0.1 }     
  }
);

//Punto 13. Con deleteMany eliminar las peliculas 
// de catgoria baja y reportar cuantos documentos se borraron.

use("sample_mflix");
db.peliculas_pareja.deleteMany(
  { categoria: "baja" }
);

//Punto 14. Ejecutar la consulta del punto 1 con .explain("executionStats") 
// antes y después de crear un índice compuesto, comparar totalDocsExamined, 
// executionTimeMillis y la etapa del plan ganador, y para terminar eliminar 
// el indice CredentialsContainer.

// Ejecuta la consulta del punto 1 con explain("executionStats") antes y después de crear el índice.
// Sin índice hace COLLSCAN (lee toda la colección); con el índice ESR {genres, imdb.rating, year} pasa a IXSCAN
// y bajan totalDocsExamined y executionTimeMillis. Al final se elimina el índice con dropIndex.

// 14.1 ANTES del índice: MongoDB lee toda la colección (COLLSCAN).
use("sample_mflix");
const antes = db.movies.find(
  { genres: "Drama", year: { $gte: 2000, $lte: 2010 }, "imdb.rating": { $gte: 8 } },
  { _id: 0, title: 1, year: 1, "imdb.rating": 1 }
).sort({ "imdb.rating": -1 }).limit(10).explain("executionStats");

({
  totalDocsExamined: antes.executionStats.totalDocsExamined,
  executionTimeMillis: antes.executionStats.executionTimeMillis,
  nReturned: antes.executionStats.nReturned,
  planGanador: antes.queryPlanner.winningPlan
});

// 14.2 Crear el índice compuesto con la regla ESR:
// E (Equality) = genres, S (Sort) = imdb.rating, R (Range) = year.
use("sample_mflix");
db.movies.createIndex({ genres: 1, "imdb.rating": -1, year: 1 }, { name: "idx_punto14" });

// 14.3 DESPUÉS del índice: la misma consulta ahora usa el índice (IXSCAN).
use("sample_mflix");
const despues = db.movies.find(
  { genres: "Drama", year: { $gte: 2000, $lte: 2010 }, "imdb.rating": { $gte: 8 } },
  { _id: 0, title: 1, year: 1, "imdb.rating": 1 }
).sort({ "imdb.rating": -1 }).limit(10).explain("executionStats");

({
  totalDocsExamined: despues.executionStats.totalDocsExamined,
  executionTimeMillis: despues.executionStats.executionTimeMillis,
  nReturned: despues.executionStats.nReturned,
  planGanador: despues.queryPlanner.winningPlan
});

// 14.4 Eliminar el índice creado.
use("sample_mflix");
db.movies.dropIndex("idx_punto14");
```

</div>

## Enlace para compartir el archivo

<a href="/bases-2/taller-mql/consultas.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Ver informe de consultas (PDF)
</a>

<a href="/bases-2/taller-mql/Modelos_ParteD_Taller_MQL.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Ver modelos documentales (PDF)
</a>

<a href="/bases-2/taller-mql/SCRIPT_TALLER.mongodb" download style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Descargar script (.mongodb)
</a>

<a href="https://github.com/gabGABY006/bases-de-datos-2/blob/main/taller_castro_pati%C3%B1o_rodr%C3%ADguez.mongodb" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Ver MQL en GitHub
</a>

## Detalles

- Fecha: 03/11/2026
- Motor / herramienta: MongoDB Atlas, base de prueba `sample_mflix`
- Integrantes: Lina Sofia Patiño, Gabriella Michelle Castro y Julián Samuel Rodríguez
