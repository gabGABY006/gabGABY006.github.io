---
title: "Investigación: Tipos de bases de datos NoSQL"
---

## Introducción

NoSQL agrupa modelos de bases de datos que organizan la información de formas
distintas al modelo relacional tradicional. El término suele entenderse como
“not only SQL”: no significa que todas estas bases de datos sean iguales ni
que ninguna permita hacer consultas. Su diseño prioriza necesidades como
escalar entre varios servidores, manejar grandes volúmenes de datos o
representar información flexible y conectada.

Esta investigación presenta cuatro modelos comunes: clave-valor, documentos,
columnas anchas y grafos. La clasificación describe cómo se organiza y
consulta principalmente la información; algunos productos combinan más de un
modelo.

## 1. Clave-valor

En este modelo, cada elemento se guarda asociado a una clave única. La clave
permite recuperar el valor directamente, como si se consultara un diccionario.
El valor puede ser texto, un número, datos binarios u otra estructura que el
sistema admita.

- **Ventajas:** acceso rápido por clave y estructura sencilla.
- **Limitaciones:** buscar por atributos que no forman parte de la clave puede
  ser limitado o requerir estructuras adicionales.
- **Usos habituales:** caché, sesiones de usuario, carritos de compra y
  preferencias.
- **Ejemplo de sistema:** Redis.

## 2. Documentos

Las bases de datos documentales almacenan registros como documentos, a menudo
en formatos similares a JSON o BSON. Un documento reúne en una sola estructura
atributos relacionados, y los documentos de una colección no siempre tienen
que compartir exactamente los mismos campos.

- **Ventajas:** estructura flexible y natural para datos jerárquicos; permite
  consultar campos y combinar operaciones de lectura y agregación.
- **Limitaciones:** hay que diseñar con cuidado la duplicación de datos y las
  relaciones entre documentos; una estructura flexible no elimina la
  necesidad de validar la calidad de los datos.
- **Usos habituales:** catálogos, perfiles, contenido y aplicaciones cuyo
  modelo evoluciona con frecuencia.
- **Ejemplo de sistema:** MongoDB.

Este es el modelo relacionado con el taller MQL de este portafolio. En
MongoDB, los documentos se organizan en colecciones. Por ejemplo, sobre la
colección `movies` de `sample_mflix`, una consulta MQL puede filtrar películas
de drama posteriores a 1999, mostrar algunos campos y ordenar el resultado:

```javascript
db.movies
  .find(
    { genres: "Drama", year: { $gte: 2000 } },
    { title: 1, year: 1, _id: 0 }
  )
  .sort({ year: -1 })
  .limit(5);
```

MQL (MongoDB Query Language) permite expresar filtros y operaciones sobre
documentos. En una agregación, por ejemplo, se pueden encadenar etapas como
`$match`, `$group` y `$sort` para filtrar, resumir y ordenar datos. Los
índices pueden ayudar a acelerar consultas frecuentes, pero deben elegirse
según los filtros y ordenamientos que realmente utiliza la aplicación.

## 3. Columnas anchas

Las bases de datos de columnas anchas organizan la información mediante filas
y familias de columnas. Cada fila se identifica con una clave, pero las
columnas pueden variar entre filas. Se diseñan para distribuir datos en
varios nodos y atender consultas predecibles a gran escala.

- **Ventajas:** distribución horizontal y buen rendimiento para patrones de
  acceso diseñados de antemano.
- **Limitaciones:** el modelo y las consultas deben pensarse según las
  preguntas que hará la aplicación; no siempre es práctico consultar datos de
  cualquier forma.
- **Usos habituales:** eventos, telemetría y grandes volúmenes de escrituras
  distribuidas.
- **Ejemplos de sistemas:** Apache Cassandra y HBase.

En Cassandra, por ejemplo, el diseño de tablas parte de las consultas
esperadas: la clave de partición determina cómo se distribuyen los datos y
las columnas de agrupación ordenan datos dentro de una partición. Por eso, el
modelado suele ser distinto al de una base relacional normalizada.

## 4. Grafos

Las bases de datos de grafos representan entidades como nodos y sus conexiones
como relaciones. Tanto los nodos como las relaciones pueden tener propiedades.
Este modelo pone el énfasis en recorrer conexiones, en vez de reconstruirlas
mediante múltiples uniones entre tablas.

- **Ventajas:** representa relaciones de manera explícita y facilita consultas
  de recorridos entre entidades conectadas.
- **Limitaciones:** no es automáticamente la mejor opción para cualquier dato;
  las consultas que no dependen de relaciones pueden ajustarse mejor a otros
  modelos.
- **Usos habituales:** redes sociales, recomendaciones, rutas, dependencias y
  detección de conexiones entre entidades.
- **Ejemplo de sistema:** Neo4j.

## Comparación general

| Modelo | Estructura principal | Adecuado cuando... | Ejemplos |
|:---|:---|:---|:---|
| Clave-valor | Clave asociada a un valor | Se necesita recuperar información directamente por una clave | Redis |
| Documentos | Documentos agrupados en colecciones | Los registros tienen estructura flexible o jerárquica | MongoDB |
| Columnas anchas | Filas con familias de columnas | Se requiere distribuir grandes volúmenes y se conocen los patrones de consulta | Cassandra, HBase |
| Grafos | Nodos conectados por relaciones | Las conexiones entre entidades son centrales para las consultas | Neo4j |

## ¿Cómo elegir un modelo?

La elección depende del problema y no solo del volumen de datos. Conviene
preguntarse:

1. ¿Qué consultas realizará la aplicación con mayor frecuencia?
2. ¿Los datos son jerárquicos, simples o principalmente una red de relaciones?
3. ¿Se necesita consistencia inmediata entre varias operaciones o se aceptan
   ciertas concesiones para distribuir el sistema?
4. ¿Cómo cambiará el esquema y quién validará la información?
5. ¿Qué índices, particiones y operaciones requiere el patrón de uso real?

NoSQL no implica que todas las bases de datos tengan el mismo comportamiento
de consistencia, ni que carezcan de esquema. Cada producto ofrece garantías y
herramientas diferentes, y el diseño debe revisarse junto con los requisitos
de la aplicación.

## Conclusiones

Los cuatro modelos resuelven necesidades distintas: clave-valor facilita
recuperar datos por identificador; documentos agrupan atributos flexibles;
columnas anchas distribuyen grandes conjuntos con patrones de acceso
definidos; y grafos priorizan las relaciones entre entidades. La parte NoSQL
del curso se conecta especialmente con el modelo documental: en el taller de
MongoDB, MQL se utiliza para consultar documentos y explorar operaciones e
índices. Comprender el modelo de datos ayuda a escribir consultas adecuadas y
a decidir cuándo una solución NoSQL tiene sentido.

## Fuentes

1. MongoDB. *Introduction to Data Modeling*.  
   https://www.mongodb.com/docs/manual/core/data-modeling-introduction/
2. MongoDB. *Query Documents*.  
   https://www.mongodb.com/docs/manual/tutorial/query-documents/
3. Redis. *Data types*.  
   https://redis.io/docs/latest/develop/data-types/
4. Apache Cassandra. *Data modeling*.  
   https://cassandra.apache.org/doc/latest/cassandra/developing/data-modeling/intro.html
5. Neo4j. *Graph database concepts*.  
   https://neo4j.com/docs/getting-started/appendix/graphdb-concepts/
