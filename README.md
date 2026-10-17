# Sistema de evaluación de postulantes — versión optimizada para Cloudflare D1

## Archivos en la raíz del repositorio

```text
/index.html
/README.md
/.nojekyll
/ANEXOS.xlsx
/MODELO_IMPORTAR_UNIVERSO.xlsx
/functions/api/records.js
```

## Cloudflare

- Conserva la base D1 existente y el binding `DB`.
- No hace falta crear nuevas bases ni instalar Node.js.
- La API agrega mediante migración una columna `deleted` y la tabla `shared_other_causes`; no elimina los registros anteriores. Las personas eliminadas se marcan como eliminadas para que no reaparezcan al recargar, y el historial de borrado permite restaurarlas con Deshacer.
- El guardado de varios campos se envía por lotes para reducir solicitudes al servicio. Cada lote de cambios se limita a 1.000 campos y la API agrupa las escrituras D1 en lotes de 40.

## Módulos y universos

Hay un módulo principal y seis módulos de evaluadores en la misma base D1. Cada módulo mantiene sus evaluaciones aisladas. Se puede cambiar el nombre visible de cada evaluador. Los duplicados y las causales de `OTROS` se comparten entre todos los módulos; al pulsar Actualizar o cambiar de módulo se refrescan los catálogos compartidos.

## Ítems y criterio de experiencia

El sistema incluye los 60 ítems entregados. En el Formulario 3, el criterio de experiencia laboral adicional cambia automáticamente según el cargo:

- **Supervisor:** un punto por cada dos meses adicionales al año requerido, con máximo de 15 puntos.
- **Encuestador:** un punto por cada dos meses adicionales a los ocho meses requeridos, con máximo de 15 puntos.

El modelo de importación incluye los 60 ítems, el cargo y el tipo como referencia. Si un ítem tiene varias personas, repite el número y el cargo en filas separadas y completa un nombre por fila.

## Importación

El importador busca la fila de encabezados dentro de las primeras 40 filas, por lo que omite títulos o filas de portada antes de los encabezados. Las columnas reconocidas son `N° DE ÍTEM`, `CARGO / DISTRIBUCIÓN` y `NOMBRE COMPLETO DEL PROPONENTE`. Solo importa filas con ítem, cargo y nombre completos.

## Formulario 1

- Se pueden corregir nombres y eliminar personas de la lista del universo activo.
- La eliminación se guarda en Cloudflare mediante marca lógica para evitar que los 215 registros base vuelvan a aparecer al recargar.
- La causal `OTROS` se guarda en el registro y se agrega al catálogo compartido del tipo V-1 o V-3, para reutilizarla desde los demás módulos.

## Exportaciones

- Exportación por formulario, separada por ítem.
- Exportación global con todos los formularios por ítem.
- Las exportaciones usan `ANEXOS.xlsx` como plantilla, conservando la estructura oficial y combinaciones de celdas.
- En el Formulario 3 de Excel se escribe el criterio correcto de experiencia según si el cargo es supervisor o encuestador.

## Desplazamiento

Se desactivaron las barras horizontales sincronizadas y las columnas pegajosas que podían producir temblores. Las tablas usan una barra horizontal nativa y el desplazamiento vertical de la página, sin contenedores verticales anidados.

## Actualizar GitHub

1. Reemplaza `index.html`, `functions/api/records.js` y `README.md`.
2. Conserva `ANEXOS.xlsx` y `.nojekyll`; reemplaza también `MODELO_IMPORTAR_UNIVERSO.xlsx` por el incluido.
3. Haz commit en la rama conectada a Cloudflare Pages y espera el despliegue automático.
4. No elimines la base D1 ni cambies el binding `DB`.

## Límites gratuitos y uso

El código agrupa las actualizaciones para evitar una solicitud por cada campo modificado. Seis universos de alrededor de 200 personas (aprox. 1.200 registros más el módulo principal) son un volumen modesto para una aplicación de este tamaño con uso normal; aun así, los límites reales dependen de cuántas veces se editen datos, se actualicen catálogos y se exporte. Revisa las métricas de Workers y D1 en Cloudflare durante los primeros días para confirmar el consumo real.

## Seguridad

La separación por módulo evita mezclar datos accidentalmente, pero no reemplaza autenticación. Si cada evaluador debe tener acceso exclusivo a su módulo, configura Cloudflare Access o autenticación con permisos.


## Exportación global corregida

- El exportador sincroniza los cambios pendientes del módulo activo antes de generar el libro.
- Cada módulo y universo exporta únicamente sus propios registros; no mezcla los datos de otros evaluadores.
- El Excel incluye pestañas para los ítems que sí tienen postulantes en el universo activo, ordenados desde el primer ítem con datos. Esto evita que las primeras pestañas vacías parezcan un archivo sin información.
- Si no se pueden asociar los registros con un ítem o el libro queda incompleto, la aplicación muestra un error y no descarga un archivo vacío.
- El nombre del archivo identifica el módulo/evaluador y el universo exportado.
