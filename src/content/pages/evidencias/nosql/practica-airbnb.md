---
title: "Práctica de MongoDB · Alojamientos de Airbnb"
---

## Título

Práctica de MongoDB con alojamientos de Airbnb

## Descripción

Usando la base de prueba `sample_airbnb` insertamos alojamientos y consultamos sus precios, tipos de propiedad y servicios con MQL (`find`, `sort`, proyecciones, `insertOne`, `updateOne` y `updateMany`). El desarrollo reúne los ejercicios que resolvimos, con código y capturas de los resultados.

<div class="evidence-callout">
<strong>¿Cómo se consulta un alojamiento por precio?</strong>
<p>En el ejercicio 8 se buscan alojamientos con precio inferior a 75. El filtro decide qué documentos entran y la proyección muestra únicamente el nombre, el precio y el tipo de propiedad.</p>
<p>Compara ese ejercicio con el punto 13, que selecciona alojamientos con exactamente 20 servicios. El desarrollo parcial conserva el código y las capturas de los ejercicios realizados.</p>
</div>

## Desarrollo parcial del taller

<iframe title="Desarrollo parcial del taller" src="/bases-2/practica-airbnb/practica.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

## Guía del taller

<iframe title="Guía del taller" src="/bases-2/practica-airbnb/guia.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

## Lo que aprendí

- **Filtro y proyección son dos cosas distintas.** El primer argumento de `find` decide qué documentos entran (por ejemplo, precio menor a 75) y el segundo decide qué campos se muestran.
- **Los documentos pueden tener estructuras anidadas.** Consultar servicios (`amenities`) o campos dentro de objetos exige entender cómo se guardan los arreglos y los subdocumentos.
- **`updateOne` y `updateMany` no son lo mismo.** Con el mismo filtro, uno modifica solo el primer documento que encuentra y el otro todos los que coinciden, así que hay que revisar bien el filtro antes de ejecutar.

## Enlace para compartir el archivo

<a href="/bases-2/practica-airbnb/practica.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Ver desarrollo del taller (PDF)
</a>

<a href="/bases-2/practica-airbnb/guia.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Ver guía del taller (PDF)
</a>

## Detalles

- Fecha: noviembre de 2026
- Motor / herramienta: MongoDB, base de prueba `sample_airbnb`
- Integrantes: Gabriella Castro, Lina Patiño y Julián Rodríguez
