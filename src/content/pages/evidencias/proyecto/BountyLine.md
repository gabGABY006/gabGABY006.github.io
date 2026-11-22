---
title: "BountyLine"
---

<p class="evidence-back"><a href="/evidencias/proyecto">← Volver a Proyecto</a></p>

<p class="evidence-kicker">Bases de Datos 2 · Proyecto final</p>

<p class="evidence-team">Gabriella Castro, Lina Patiño y Julián Rodríguez</p>

En BountyLine los jugadores publican misiones y los cazarrecompensas se postulan para resolverlas. Estas son las pantallas de acceso y creación de cuenta del proyecto.

<nav class="evidence-phases" aria-label="Documentación del proyecto"><a href="/evidencias/proyecto/bountyline/fase-1">Fase 1 · Propuesta y modelado</a><a href="/evidencias/proyecto/bountyline/fase-2">Fase 2 · Implementación e integración</a><a href="/evidencias/proyecto/bountyline/cierre">Informe ejecutivo y cierre</a></nav>

## Del cierre de una misión al pago de la recompensa

¿Qué ocurre si se intenta cerrar una misión dos veces? En MySQL, `sp_cerrar_mision` bloquea la misión, comprueba quién solicita el cierre y exige que siga en curso. El procedimiento libera la recompensa, registra el pago y el cobro y cambia el estado en una sola transacción. Si falla una operación, el manejador ejecuta `ROLLBACK`. Un segundo cierre encuentra la misión cerrada y se rechaza.

Los mensajes siguen otro recorrido: MongoDB guarda un documento por mensaje y permite consultar el historial por misión y fecha. Así, cada decisión de almacenamiento responde a una operación concreta de BountyLine.

## Evidencias por criterio de evaluación

<ul class="evidence-cards">
<li><h3>Modelado y diseño · 20 %</h3><p>Examinar la especialización de Cuenta y contrastarla con el diccionario y las claves del modelo relacional.</p><a href="/bases-2/bountyline/fase-1/modelo-entidad-relacion-extendido.pdf">Modelo ER extendido</a></li>
<li><h3>Base de datos relacional · 20 %</h3><p>En 02_logica.sql, seguir sp_cerrar_mision desde el bloqueo de la misión hasta el pago, los movimientos y el COMMIT.</p><a href="/evidencias/proyecto/bountyline/fase-2">Abrir scripts de la fase 2</a></li>
<li><h3>MongoDB · 15 %</h3><p>Revisar qué se guarda en publicaciones, mensajes_chat y bitacora_actividad. Las agregaciones están en 04_consultas.js.</p><a href="/bases-2/bountyline/fase-2/modelo-documental.pdf">Modelo documental</a></li>
<li><h3>Aplicación web e integración · 15 %</h3><p>Seguir el recorrido desde la aplicación hasta MySQL y contrastarlo con el documento de conexión a MongoDB.</p><a href="/bases-2/bountyline/fase-2/conexion-de-la-aplicacion-con-la-base-relacional.pdf">Conexión con MySQL</a></li>
<li><h3>Gestión del proyecto · 15 %</h3><p>Consultar los hitos del cronograma y la matriz de siete riesgos, con responsables y mitigaciones.</p><a href="/bases-2/bountyline/fase-1/acta-de-constitucion.pdf">Acta de constitución</a></li>
<li><h3>Documentación y profesionalismo · 10 %</h3><p>Consultar las decisiones técnicas, los resultados, las lecciones aprendidas y las referencias del equipo.</p><a href="/bases-2/bountyline/cierre/informe-ejecutivo-final.pdf">Informe ejecutivo</a></li>
<li><h3>Video y sustentación · 5 %</h3><p>Ver la demostración grabada del proyecto en su entorno local.</p><a href="https://youtu.be/qVt9Vf7JouA">Ver demostración</a></li>
</ul>

## Inicio de sesión

<a href="/bases-2/bountyline/inicio.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/bountyline/inicio.png" alt="Acceso a BountyLine con selección de tipo de cuenta y perfil operativo." class="evidence-shot" /></a>

## Registro

<a href="/bases-2/bountyline/registro.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/bountyline/registro.png" alt="Registro de BountyLine con alias, correo y selección del rol inicial." class="evidence-shot" /></a>

<details class="evidence-drop">
<summary>Consultar la guía del proyecto</summary>

<iframe title="Guía del proyecto" src="/bases-2/bountyline/guia-proyecto.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>
<p><a href="/bases-2/bountyline/guia-proyecto.pdf" target="_blank" rel="noopener noreferrer">Abrir guía del proyecto en PDF</a></p>

</details>

<p><a href="https://github.com/gabGABY006/BountyLine" target="_blank" rel="noopener noreferrer">Repositorio del proyecto en GitHub</a></p>
