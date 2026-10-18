# Control de importación de revisores

## Reglas aplicadas

- El universo global tiene 60 ítems: 1–15 supervisores de campo y 16–60 encuestadores.
- Los encuestadores en los Excel fuente llevan numeración local; el sistema los ubica en el universo global sumando 15 al ordinal local.
- Se usa Formulario 1 como base de postulantes, Formulario 3 para los componentes C-2 y Formulario 4 para cotejar los totales.
- No se reconstruyen los componentes de C-2 a partir de un total aislado.
- Los bloques duplicados exactos no se duplican en el sistema.

## Observaciones de los archivos fuente

- JAQUELINE EVALUACIÓN.xlsx Form 1, fila de encabezado 27: número fuente 5 no coincide con el ordinal del cargo VI; se usó el cargo y el universo oficial (ítem 21).
- JAQUELINE EVALUACIÓN.xlsx Form 4, fila 64: número fuente 17 no coincide con el ordinal del cargo XV; se cotejó con Formulario 1 y Formulario 3 antes de asignar el ítem oficial.
- JAQUELINE EVALUACIÓN.xlsx Form 4, fila 64: el cargo del encabezado apunta al ítem 30, pero los postulantes corresponden al ítem oficial 32; se usó el ítem concordante con Formulario 1.
- JAQUELINE EVALUACIÓN.xlsx: el Formulario 1 repite el bloque de postulantes del ítem local VI (13 nombres); los duplicados se consolidaron y no se cargaron dos veces.
- Módulo JAQUELINE: 204 postulantes únicos importados de 1 archivo(s).
  - JAQUELINE EVALUACIÓN.xlsx: 21 bloques de Formulario 1, 217 filas fuente de postulantes, 21 filas en Formulario 3 y 21 filas en Formulario 4.
- XIMENA ITEMS ENCUESTADOR.xlsx Form 1, fila de encabezado 75: el prefijo del cargo indica AUXILIAR 1 pero el universo oficial define ENCUESTADOR como AUXILIAR 2; se normalizó el rótulo sin cambiar los datos del postulante.
- XIMENA ITEMS ENCUESTADOR.xlsx Form 1, fila de encabezado 115: el prefijo del cargo indica AUXILIAR 1 pero el universo oficial define ENCUESTADOR como AUXILIAR 2; se normalizó el rótulo sin cambiar los datos del postulante.
- XIMENA ITEMS ENCUESTADOR.xlsx Form 1, fila de encabezado 138: el prefijo del cargo indica AUXILIAR 1 pero el universo oficial define ENCUESTADOR como AUXILIAR 2; se normalizó el rótulo sin cambiar los datos del postulante.
- XIMENA ITEMS ENCUESTADOR.xlsx Form 4, fila 19: número fuente 3 no coincide con el ordinal del cargo IV; se cotejó con Formulario 1 y Formulario 3 antes de asignar el ítem oficial.
- XIMENA ITEMS ENCUESTADOR.xlsx Form 3, fila 1: el encabezado de cargo no coincide con los postulantes; se ubicó el cuadro en el ítem oficial 16 por coincidencia con Formulario 1 y Formulario 4.
- Módulo XIMENA: 206 postulantes únicos importados de 2 archivo(s).
  - XIMENA ITEMS ENCUESTADOR.xlsx: 4 bloques de Formulario 1, 125 filas fuente de postulantes, 6 filas en Formulario 3 y 6 filas en Formulario 4.
  - XIMENA ITEMS SUPERVISOR.xlsx: 3 bloques de Formulario 1, 81 filas fuente de postulantes, 15 filas en Formulario 3 y 15 filas en Formulario 4.


## Ajuste solicitado antes del despliegue

- Se deja vacío el bloque fuente de Jaqueline etiquetado como ítem 6 (Formulario 1, filas 47–70), porque repite exactamente los 13 nombres del bloque anterior.
- Se conserva una sola vez el bloque canónico de ENCUESTADOR LA PAZ VI, asignado al ítem oficial global 21 conforme al universo La Paz (encuestadores locales 1–45 se mapean a los ítems globales 16–60).
- No se cargan esos registros en el ítem global 6. No se borran ni modifican registros del módulo principal u otros revisores.
- El informe Word predeterminado es `INFORME_MODELO_LA_PAZ.docx`, tomado del modelo final proporcionado. Se conserva el color celeste y la estructura de la plantilla; los cuadros de evaluación se reemplazan por los datos seleccionados.
