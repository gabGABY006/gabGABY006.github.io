---
title: "Investigación: 16 patrones de diseño de MongoDB"
---

## Introducción

En MongoDB, diseñar una colección significa decidir cómo se guardarán los
documentos para responder bien a las consultas de la aplicación. No hay un
único diseño ideal: depende de qué datos se consultan juntos, con qué
frecuencia cambian y cuánto pueden crecer.

MongoDB documenta patrones de modelado en varias categorías; no presenta una
lista universal y cerrada de exactamente 16. Para esta investigación reúno
16 patrones y estrategias de modelado documentados por MongoDB, incluidos
algunos enfoques relacionados. No todos son intercambiables ni tienen el
mismo propósito.

## Patrones para organizar documentos y relaciones

### 1. Documentos embebidos

Guarda datos relacionados dentro del mismo documento, como una dirección
embebida en el perfil de una persona. Es útil cuando suelen consultarse juntos
y se actualizan como una unidad. Reduce lecturas adicionales, pero hay que
evitar documentos que crezcan sin límite y recordar el límite de tamaño BSON
de 16 MiB.

### 2. Referencias

Guarda el identificador de otro documento en vez de copiar todos sus datos.
Por ejemplo, un pedido puede guardar `clienteId`. Conviene cuando la entidad
relacionada se consulta por separado, cambia con frecuencia o puede tener
muchos elementos asociados.

### 3. Referencia extendida

Combina una referencia con una copia de unos pocos campos relacionados que se
leen con frecuencia. Un pedido puede guardar `clienteId` y también el nombre
que se muestra en la lista de pedidos. Así se evitan algunas consultas
adicionales, a cambio de mantener esa copia sincronizada.

### 4. Subconjunto

Mantiene en el documento principal solo los elementos más consultados y deja
el resto en otra colección. Por ejemplo, un producto puede guardar sus diez
reseñas recientes y las reseñas completas permanecer en `reviews`. Reduce
cuánto debe leerse para las consultas habituales.

### 5. Atributos

Agrupa campos opcionales o variables en una lista de pares clave-valor. En
vez de tener muchos campos de características distintos, un producto puede
tener `atributos: [{ nombre: "color", valor: "azul" }]`. Facilita consultar
atributos variados con índices comunes; no es necesario aplicarlo si los
campos son fijos y conocidos.

### 6. Cubetas (*Bucket*)

Agrupa elementos relacionados y de tamaño controlado en un documento. Por
ejemplo, las mediciones de un sensor pueden agruparse por intervalos de tiempo
o por cantidad. Puede reducir el número de documentos y hacer más sencilla la
lectura por grupos; es importante limitar el tamaño de cada cubeta.

### 7. Valores atípicos (*Outlier*)

Trata por separado los documentos excepcionales que acumulan muchos más
elementos que los demás. Un libro muy popular podría guardar sus reseñas más
recientes y trasladar las adicionales a otra colección. Así los casos
habituales no cargan con documentos o índices enormes.

### 8. Polimórfico

Guarda en una colección documentos con algunas diferencias de estructura,
pero relacionados por un propósito común. Una colección `deportistas` puede
tener campos compartidos y campos específicos del deporte. Un campo como
`tipo` ayuda a identificar las variantes y consultar campos comunes en
conjunto.

### 9. Herencia

Es una forma de agrupar documentos con una entidad base y variantes
relacionadas. Por ejemplo, libros impresos, electrónicos y audiolibros pueden
compartir `titulo` y `autor`, y tener campos propios como `paginas` o
`duracion`. Es útil cuando se consultan juntos; se relaciona con el patrón
polimórfico, no es una técnica totalmente independiente.

### 10. Colección única (*Single Collection*)

Agrupa en una colección documentos relacionados de tipos distintos y usa
referencias para expresar sus relaciones. Puede ser útil en modelos donde se
necesita recuperar documentos relacionados con pocas consultas y se desea
evitar duplicar información. Se diferencia del patrón polimórfico: aquí el
énfasis está en agrupar documentos conectados, no solo en permitir distintas
formas.

## Patrones para preparar y optimizar datos

### 11. Computado

Calcula y guarda de antemano un resultado que se consulta con frecuencia.
Por ejemplo, almacenar el promedio y la cantidad de reseñas de un producto
evita recalcularlos para cada visita. Hay que decidir cuándo recalcularlos
para que los valores no queden desactualizados.

### 12. Aproximación

Guarda una cifra aproximada cuando no se necesita exactitud inmediata y
actualizarla en cada evento sería costoso. Un contador de visitas podría
sumarse por lotes. No es adecuado para saldos, inventarios u otros datos que
deban ser exactos.

### 13. Colecciones de series temporales

Usa colecciones de series temporales para mediciones ordenadas por fecha,
como temperatura de sensores o métricas de una aplicación. MongoDB organiza
internamente las mediciones en cubetas y ofrece opciones apropiadas para
consultas temporales. El campo de tiempo y los metadatos deben elegirse según
las consultas esperadas.

### 14. Archivo

Separa datos antiguos o consultados rara vez de los datos activos. Por
ejemplo, pedidos recientes pueden permanecer en la colección principal y los
históricos pasar a almacenamiento o colección de archivo. Esto puede reducir
el tamaño del conjunto de datos consultado con frecuencia, pero se debe
conservar una forma de recuperar el historial cuando haga falta.

## Patrones para cambios y evolución

### 15. Versionado de esquema

Incluye un campo como `schemaVersion` para identificar la estructura de cada
documento. Si el esquema evoluciona, la aplicación puede reconocer documentos
antiguos y nuevos durante una migración gradual. No guarda por sí solo el
historial de los valores; indica la versión de su estructura.

### 16. Versionado de documentos

Conserva copias de versiones anteriores de un documento, normalmente en otra
colección. Por ejemplo, una póliza actual puede mantenerse en `policies` y
sus cambios históricos en `policyRevisions`. Sirve para auditoría o para
consultar el estado anterior, pero se debe planificar cuánto tiempo conservar
las revisiones.

## ¿Cómo elegir?

Antes de aplicar un patrón, conviene identificar las consultas más comunes y
el ciclo de vida de los datos:

1. ¿Qué información necesita recuperar junta cada pantalla o proceso?
2. ¿Los arreglos embebidos tienen un límite conocido o pueden crecer sin
   límite?
3. ¿Qué datos cambian con frecuencia y cuáles pueden duplicarse?
4. ¿Qué precisión y qué nivel de actualidad requieren los resultados
   calculados?
5. ¿Se necesita historial, retención o separación de datos antiguos?

Los patrones pueden combinarse, pero cada combinación agrega decisiones de
sincronización, índices y mantenimiento. Por ejemplo, un producto puede usar
documentos embebidos para sus detalles, el patrón de subconjunto para mostrar
reseñas recientes y un valor computado para su calificación promedio. La
decisión debe basarse en el patrón de acceso real, no en aplicar todos los
patrones por defecto.

## Conclusiones

Estos patrones muestran que el modelo documental de MongoDB permite distintas
formas de organizar información según el uso de la aplicación. Embebidos,
referencias y sus variantes ayudan a modelar relaciones; cubetas, subconjuntos
y valores computados ajustan la lectura y el tamaño de los datos; y los
patrones de versionado y archivo permiten manejar su evolución e historial.
No existe una receta única: comprender las consultas esperadas es el primer
paso para elegir un diseño adecuado.

## Fuentes

1. MongoDB. *Design Patterns*.  
   https://www.mongodb.com/docs/manual/data-modeling/design-patterns/
2. MongoDB. *Embedded Data*.  
   https://www.mongodb.com/docs/manual/data-modeling/embedding/
3. MongoDB. *References*.  
   https://www.mongodb.com/docs/manual/data-modeling/referencing/
4. MongoDB. *Group Data: Bucket, Outlier y Subset Patterns*.  
   https://www.mongodb.com/docs/manual/data-modeling/design-patterns/group-data/
5. MongoDB. *Polymorphic Data: Polymorphic and Inheritance Patterns*.  
   https://www.mongodb.com/docs/manual/data-modeling/design-patterns/polymorphic-data/
6. MongoDB. *Handle Computed Values: Computed and Approximation Patterns*.  
   https://www.mongodb.com/docs/manual/data-modeling/design-patterns/handle-computed-values/
7. MongoDB. *Document and Schema Versioning*.  
   https://www.mongodb.com/docs/manual/data-modeling/design-patterns/data-versioning/
8. MongoDB. *Single Collection Pattern*.  
   https://www.mongodb.com/docs/manual/data-modeling/design-patterns/single-collection/
9. MongoDB. *Archive Pattern*.  
   https://www.mongodb.com/docs/manual/data-modeling/design-patterns/archive/
10. MongoDB. *Time Series Collections*.  
    https://www.mongodb.com/docs/manual/core/timeseries-collections/
