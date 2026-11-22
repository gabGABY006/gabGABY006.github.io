---
title: 'BountyLine'
---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:031c24,50:0a5a62,100:e8408f&height=200&section=header&text=BOUNTYLINE&fontSize=60&fontColor=19f5f0&fontAlignY=40&stroke=031c24&strokeWidth=2&desc=Base%20de%20datos%20h%C3%ADbrida%3A%20MySQL%20%2B%20MongoDB&descSize=16&descColor=ff7ab8&descAlignY=62" alt="BountyLine" width="100%"/>

![Curso](https://img.shields.io/badge/Bases_de_Datos_2-proyecto_final-031c24?style=flat-square&labelColor=031c24&color=19f5f0)
![MySQL](https://img.shields.io/badge/MySQL-8.4-031c24?style=flat-square&labelColor=031c24&color=1de9a0)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-031c24?style=flat-square&labelColor=031c24&color=e8408f)

### [![Descargar toda la documentación](https://img.shields.io/badge/⬇_DESCARGAR_TODA_LA_DOCUMENTACI%C3%93N-ZIP-19f5f0?style=for-the-badge&labelColor=031c24)](https://download-directory.github.io/?url=https://github.com/gabGABY006/BountyLine/tree/main/docs)

</div>

**BountyLine** es un sistema de gestión de cazarrecompensas: un usuario publica una misión con recompensa, los cazarrecompensas se postulan, uno es asignado, ejecuta la misión y cobra. Proyecto final de **Bases de Datos 2**, Universidad El Bosque. Usa MySQL para lo transaccional (14 tablas, 24 procedimientos, 14 triggers) y MongoDB para lo social (3 colecciones).

## Documentación por fase

<a href="/evidencias/proyecto/bountyline/fase-1" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Fase 1 · Propuesta y modelado
</a>

<a href="/evidencias/proyecto/bountyline/fase-2" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Fase 2 · Implementación e integración
</a>

<a href="/evidencias/proyecto/bountyline/cierre" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Informe ejecutivo y cierre
</a>

## Pantallas de la aplicación

**Inicio de sesión**

<a href="/bases-2/bountyline/inicio.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/bountyline/inicio.png" alt="Acceso a BountyLine con selección de tipo de cuenta y perfil operativo." class="evidence-shot" /></a>

**Registro**

<a href="/bases-2/bountyline/registro.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/bountyline/registro.png" alt="Registro de BountyLine con alias, correo y selección del rol inicial." class="evidence-shot" /></a>

## Del cierre de una misión al pago de la recompensa

¿Qué ocurre si se intenta cerrar una misión dos veces? En MySQL, `sp_cerrar_mision` bloquea la misión, comprueba quién solicita el cierre y exige que siga en curso. El procedimiento libera la recompensa, registra el pago y el cobro y cambia el estado en una sola transacción. Si falla una operación, el manejador ejecuta `ROLLBACK`. Un segundo cierre encuentra la misión cerrada y se rechaza.

Los mensajes siguen otro recorrido: MongoDB guarda un documento por mensaje y permite consultar el historial por misión y fecha. Así, cada decisión de almacenamiento responde a una operación concreta de BountyLine.

## Evidencias por criterio de evaluación

| Criterio | Qué revisar | Evidencia |
| :-- | :-- | :-- |
| **Modelado y diseño · 20 %** | La especialización de Cuenta, contrastada con el diccionario y las claves del modelo relacional. | [Modelo ER extendido](/bases-2/bountyline/fase-1/modelo-entidad-relacion-extendido.pdf) |
| **Base de datos relacional · 20 %** | En `02_logica.sql`, `sp_cerrar_mision` desde el bloqueo de la misión hasta el pago, los movimientos y el `COMMIT`. | [Scripts de la fase 2](/evidencias/proyecto/bountyline/fase-2) |
| **MongoDB · 15 %** | Qué se guarda en `publicaciones`, `mensajes_chat` y `bitacora_actividad`. Las agregaciones están en `04_consultas.js`. | [Modelo documental](/bases-2/bountyline/fase-2/modelo-documental.pdf) |
| **Aplicación web e integración · 15 %** | El recorrido desde la aplicación hasta MySQL, contrastado con el documento de conexión a MongoDB. | [Conexión con MySQL](/bases-2/bountyline/fase-2/conexion-de-la-aplicacion-con-la-base-relacional.pdf) |
| **Gestión del proyecto · 15 %** | Los hitos del cronograma y la matriz de siete riesgos, con responsables y mitigaciones. | [Acta de constitución](/bases-2/bountyline/fase-1/acta-de-constitucion.pdf) |
| **Documentación y profesionalismo · 10 %** | Las decisiones técnicas, los resultados, las lecciones aprendidas y las referencias del equipo. | [Informe ejecutivo](/bases-2/bountyline/cierre/informe-ejecutivo-final.pdf) |
| **Video y sustentación · 5 %** | La demostración grabada del proyecto en su entorno local. | [Ver demostración](https://youtu.be/qVt9Vf7JouA) |

## Video de demostración

<div class="evidence-video"><iframe title="Demostración de BountyLine" loading="lazy" src="https://www.youtube-nocookie.com/embed/qVt9Vf7JouA" allowfullscreen></iframe></div>

## Enlaces rápidos

|                          |                                                                               |
| :----------------------- | :---------------------------------------------------------------------------- |
| Repositorio              | [github.com/gabGABY006/BountyLine](https://github.com/gabGABY006/BountyLine)  |
| Video de demostración    | [youtu.be/qVt9Vf7JouA](https://youtu.be/qVt9Vf7JouA)                          |
| Scripts de MySQL         | [`bd/mysql`](https://github.com/gabGABY006/BountyLine/tree/main/bd/mysql)     |
| Scripts de MongoDB       | [`bd/mongodb`](https://github.com/gabGABY006/BountyLine/tree/main/bd/mongodb) |
| Carpeta de documentación | [`docs`](https://github.com/gabGABY006/BountyLine/tree/main/docs)             |

## Modelos de datos

- [Modelo ER extendido](https://github.com/gabGABY006/BountyLine/blob/main/docs/Modelo%20ER%20Extendido%20BountyLine.pdf)
- [Modelo ER de Peter Chen](https://github.com/gabGABY006/BountyLine/blob/main/docs/Modelo%20ER%20Peter%20Chen%20BountyLine.pdf)
- [Modelo relacional (pata de gallo)](https://github.com/gabGABY006/BountyLine/blob/main/docs/Relacional%20Crows%20Foot.pdf)
- [Modelo documental de MongoDB](https://github.com/gabGABY006/BountyLine/blob/main/docs/9.4.%20Modelo%20Documental%20MongoDB%20BountyLine.pdf)
- [Diccionario de datos](https://github.com/gabGABY006/BountyLine/blob/main/docs/5.%20Diccionario%20de%20Datos%20BountyLine.pdf)

## Scripts

| MySQL                                                                                            | MongoDB                                                                                              |
| :----------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| [01_creacion.sql](https://github.com/gabGABY006/BountyLine/blob/main/bd/mysql/01_creacion.sql)   | [01_colecciones.js](https://github.com/gabGABY006/BountyLine/blob/main/bd/mongodb/01_colecciones.js) |
| [02_logica.sql](https://github.com/gabGABY006/BountyLine/blob/main/bd/mysql/02_logica.sql)       | [02_insercion.js](https://github.com/gabGABY006/BountyLine/blob/main/bd/mongodb/02_insercion.js)     |
| [03_insercion.sql](https://github.com/gabGABY006/BountyLine/blob/main/bd/mysql/03_insercion.sql) | [03_usuarios.js](https://github.com/gabGABY006/BountyLine/blob/main/bd/mongodb/03_usuarios.js)       |
| [04_usuarios.sql](https://github.com/gabGABY006/BountyLine/blob/main/bd/mysql/04_usuarios.sql)   | [04_consultas.js](https://github.com/gabGABY006/BountyLine/blob/main/bd/mongodb/04_consultas.js)     |

## Documentación

- **Implementación:** [análisis del RDBMS](https://github.com/gabGABY006/BountyLine/blob/main/docs/9.2.%20Documento%20de%20An%C3%A1lisis%20de%20selecci%C3%B3n%20de%20RDBMS%20BountyLine.pdf) · [implementación del RDBMS](https://github.com/gabGABY006/BountyLine/blob/main/docs/9.3.%20Documento%20de%20Implementacion%20de%20RDBMS%20BountyLine.pdf) · [implementación de MongoDB](https://github.com/gabGABY006/BountyLine/blob/main/docs/9.5%20Documento%20de%20Implementacion%20MongoDB%20BountyLine.pdf) · [conexión a MySQL](https://github.com/gabGABY006/BountyLine/blob/main/docs/9.5.1%20Documento%20de%20Conexi%C3%B3n%20Aplicaci%C3%B3n%20BD%20Relacional%20BountyLine.pdf) · [conexión a MongoDB](https://github.com/gabGABY006/BountyLine/blob/main/docs/9.5.2%20Documento%20de%20Conexi%C3%B3n%20Aplicaci%C3%B3n%20MongoDB%20BountyLine.pdf)
- **Reportes SQL:** [documento de reportes](https://github.com/gabGABY006/BountyLine/blob/main/docs/8.%20Documento%20SQL%20de%20Reportes%20BountyLine.pdf)
- **Operación:** [recuperación de desastres](https://github.com/gabGABY006/BountyLine/blob/main/docs/6.%20Plan%20Recuperacion%20Desastres%20BountyLine.pdf) · [políticas de backups](https://github.com/gabGABY006/BountyLine/blob/main/docs/7.%20Definicion%20Politicas%20Backups%20BountyLine.pdf) · [procesos ETL](https://github.com/gabGABY006/BountyLine/blob/main/docs/11.Procesos%20ETL%20Propuesta%20BountyLine.pdf)
- **Gestión:** [acta de constitución](https://github.com/gabGABY006/BountyLine/blob/main/docs/4.%20Acta%20de%20Constitucion%20BountyLine.pdf) · [informe ejecutivo](https://github.com/gabGABY006/BountyLine/blob/main/docs/10.%20Informe%20Ejecutivo%20Final%20BountyLine.pdf) · [acta de cierre](https://github.com/gabGABY006/BountyLine/blob/main/docs/9.6%20Acta%20de%20Cierre%20de%20Proyecto%20BountyLine.pdf)
- **Diagramas UML:** [clases](https://github.com/gabGABY006/BountyLine/blob/main/docs/Diagrama%20de%20Clases%20BountyLine.pdf) · [objetos](https://github.com/gabGABY006/BountyLine/blob/main/docs/Diagrama%20de%20Objetos%20BountyLine.pdf) · [paquetes](https://github.com/gabGABY006/BountyLine/blob/main/docs/Diagrama%20de%20Paquetes%20BountyLine.pdf) · [despliegue](https://github.com/gabGABY006/BountyLine/blob/main/docs/Diagrama%20de%20Despliegue%20BountyLine.pdf)

## Lo que aprendí

- **Los conceptos importan más que la sintaxis.** Pasar de PL/SQL en Oracle al lenguaje procedimental de MySQL nos obligó a entender bien excepciones, transacciones y triggers, porque la lógica es la misma pero cambia cómo se declaran los manejadores de error.
- **La lógica crítica va en la base de datos.** Retener, pagar y reembolsar créditos se hace en procedimientos con `START TRANSACTION`, `COMMIT` y `ROLLBACK`. Así la atomicidad no depende del backend y pudimos quitarle al usuario de la aplicación los permisos de `INSERT`, `UPDATE` y `DELETE`.
- **Cada motor para lo que mejor hace.** Decidir qué va a MongoDB con criterios claros (volumen, estructura variable y que no necesite transacciones) evitó que la base documental terminara siendo una copia del modelo relacional.
- **La documentación hay que revisarla contra el código.** Al cerrar encontramos versiones de software y nombres de columnas que ya no coincidían con los scripts. Revisar los documentos antes de cada entrega habría evitado ese trabajo extra.
- **Las credenciales nunca van en el repositorio.** Desde el inicio es mejor leerlas de variables de entorno.

## Guía del proyecto

<details class="evidence-drop">
<summary>Consultar la guía del profesor</summary>

<iframe title="Guía del proyecto" src="/bases-2/bountyline/guia-proyecto.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

</details>

## Equipo

[@gabGABY006](https://github.com/gabGABY006) (Gabriella Castro) · [@linasof](https://github.com/linasof) (Lina Patiño) · [@JulianRH15](https://github.com/JulianRH15) (Julián Rodríguez)
