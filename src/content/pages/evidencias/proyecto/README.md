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

## Equipo

[@gabGABY006](https://github.com/gabGABY006) (Gabriella Castro) · [@linasof](https://github.com/linasof) (Lina Patiño) · [@JulianRH15](https://github.com/JulianRH15) (Julián Rodríguez)
