# Evaluación de postulantes — versión final de carga para La Paz

## Contenido
- `index.html`: aplicación, exportaciones Excel con revisión previa y generador de informe Word multirrevisor.
- `functions/api/records.js`: API Cloudflare Pages Functions; usa la base D1 existente mediante el binding `DB`.
- `INFORME_MODELO_LA_PAZ.docx`: modelo Word proporcionado por el usuario. Se conserva el color celeste; los cuadros se regeneran según los postulantes seleccionados.
- `ANEXOS.xlsx`: plantilla oficial de exportación Excel.
- `MODELO_IMPORTAR_UNIVERSO.xlsx`: plantilla para importar nuevos universos.
- `UNIVERSO_ITEMS_LA_PAZ_45.xlsx`: referencia del universo oficial de numeración por tipo de cargo: supervisores 1–15 y encuestadores 1–45.
- `REVISORES_MANIFEST.json` e `IMPORTACION_REVISORES.md`: conteos y observaciones de importación.
- `.nojekyll`: archivo de Pages.

## Mejoras del informe Word
- Cada cuadro lleva un título con número de ítem, cargo y tipo de formulario.
- Se normaliza el texto de los cuadros a Arial 8 pt; los números correlativos se generan una sola vez, con la misma letra y tamaño que el resto del cuadro.
- Se elimina el espaciado excesivo y se agrega un espacio uniforme entre cuadros.
- La nómina de proponentes tiene columnas N°, ÍTEM, PROPONENTE, FECHA y HORA. Fecha y hora quedan vacías para completar con el reporte de apertura; no se inventan.
- Las aclaraciones de empate aparecen inmediatamente debajo del cuadro del ítem correspondiente cuando hay puntajes finales iguales de 50 o más; no quedan como nota general al final. Se eliminan las aclaraciones de ejemplo que nombraban a postulantes de otro informe.
- La tabla final de acefalías se llena con los ítems sin postulantes habilitados en V-1 + V-3 con evaluación C-2 completa, según los módulos seleccionados. En el diálogo Word se marcan por defecto todos los módulos disponibles, y el usuario puede desmarcar los que no correspondan.
- Se conserva el color celeste del modelo Word y la narración base.

## Revisión previa de Excel
Antes de descargar un Excel global o por formulario, aparece una ventana de confirmación con:
- cantidad de registros y nombres únicos;
- ítems incluidos en el archivo;
- cantidad que continúa en V-1 y cantidad habilitada por V-1 + V-3;
- cantidad con puntaje final mayor a 70 y exactamente 70;
- posibles acefalías;
- inconsistencias con número de ítem, nombre de la persona y descripción del problema.

La ventana permite cancelar la descarga para corregir los datos antes de generar el archivo. El listado de inconsistencias incluye el ítem, el nombre de la persona y el detalle del problema. La revisión se muestra antes de exportar tanto el libro global como cada formulario individual.

## Revisores precargados
Incluye los módulos JAQUELINE (204 registros únicos) y XIMENA (206 registros únicos), en la misma base D1 y aislados por módulo.

## Duplicado de Jaqueline: ítem fuente 6
El segundo bloque del Formulario 1 etiquetado con número de ítem 6 (filas 47–70 del Excel fuente) está excluido porque repite exactamente los 13 nombres del bloque anterior y ambos indican ENCUESTADOR LA PAZ VI. Se conserva una sola copia de esos 13 postulantes bajo el ítem visible 6 de encuestador (identificador interno del registro de Encuestador VI), que es el ítem correspondiente a Encuestador VI. No se cargan esos datos en el ítem 6 de supervisor y no se borran ni alteran datos del módulo principal ni de otros revisores.

## Universo oficial
- Ítems visibles de supervisores 1–15: Supervisores de Campo La Paz I–XV.
- Ítems visibles de encuestadores: 1–45 (numeración independiente de supervisores).
- La numeración que se muestra en pantalla, informes y plantillas es independiente por tipo de cargo; el sistema conserva internamente la asociación de cada cargo para no alterar los registros guardados.

## Subida a GitHub / Cloudflare Pages
1. Descomprime el ZIP.
2. Sube el contenido completo a la raíz del repositorio conectado a Cloudflare Pages, conservando la ruta `functions/api/records.js`.
3. Mantén el binding `DB` y la base D1 existentes; no crees otra base ni borres la actual.
4. Haz commit en la rama de despliegue y espera a que Cloudflare termine.
5. Prueba el módulo principal, JAQUELINE y XIMENA. Antes de descargar Excel, revisa la ventana previa. Genera un Word de prueba con pocos postulantes y verifica títulos, numeración, espacios, fechas/horas vacías y notas de empate.

No se ha desplegado directamente en la cuenta Cloudflare; debe completarse el commit y verificarse el sitio publicado.


## Versión LP-1.9.0 (18/10/2026)
- Identificador de versión visible en la cabecera y en la revisión previa del informe Word.
- Resumen previo por ítem: proponentes incluidos, habilitados, posibles adjudicados con puntaje final superior a 50 y personas empatadas en la nota máxima. Los ítems sin proponentes incluidos se resaltan en rojo.
- La tabla de recomendaciones genera una sola fila por ítem y propone únicamente al postulante con la nota máxima superior a 50. Si no hay proponentes incluidos, nadie supera 50 o existe empate en la nota máxima, la fila queda resaltada en amarillo para revisión manual.
- Se mantiene la base D1 y el binding `DB` existentes.


Actualización LP-1.9.0: pop-up previo ampliado para mostrar el universo sin desplazamiento interno en escritorio, conteo de evaluados, habilitados y posibles adjudicados por ítem; acefalías identificadas con el universo completo de los revisores incluidos cuando no hay habilitados o no existe posible adjudicado con puntaje superior a 50; plantilla Word corregida para reemplazar todas las referencias a Santa Cruz por La Paz.


## LP-1.9.0
- La revisión previa consulta todos los universos guardados de los revisores seleccionados; no limita el informe al universo activo en la pestaña.
- Distingue proponentes cargados de proponentes incluidos en Word; solo marca rojo si no hay registros cargados para el cargo.
- Las notas sobre puntajes menores a 50 y los empates aparecen debajo del cuadro del ítem correspondiente.


## LP-1.9.0 — Exportación global corregida
- La exportación global por evaluador incluye todos los universos guardados y crea nombres de pestaña únicos por grupo para evitar el error “Worksheet name already exists”.
- Se añade “Exportación global · todos los revisores”, que recupera datos de todos los módulos desde Cloudflare y exporta los cuatro formularios por ítem, revisor y universo.
- Si un módulo no se puede recuperar desde Cloudflare, la exportación global completa se cancela con un error explícito para evitar generar un libro parcial.


## LP-1.9.0 — Impresión de anexos Formulario 1
- Se añade el botón “Imprimir anexos · Formulario 1”.
- Abre una vista de impresión con todos los formularios preliminares de todos los revisores y universos, organizados por revisor, universo e ítem.
- Orientación horizontal A4, márgenes amplios, anchos de columna definidos, bordes completos, encabezados de tabla repetidos al continuar en otra página y filas que procuran no partirse entre páginas.
- El navegador permite imprimir en papel o guardar como PDF.
- La impresión recupera datos desde Cloudflare y cancela con un mensaje si no puede recuperar todos los módulos.


## LP-1.9.0 — Anexos Word Formulario 1
- Se añade descarga DOCX de los anexos del Formulario 1 en un documento Word horizontal.
- Cada cuadro lleva únicamente un título con número de ítem y descripción de cargo.
- La tabla replica las 17 columnas del modelo oficial ANEXOS.xlsx, sin columnas adicionales, nombres de evaluadores ni encabezados extra.
- Los encabezados se repiten si una tabla continúa en otra página.
- Los nombres de pestañas y archivos Excel ya no incluyen identificadores de evaluadores.


## LP-1.9.4 · Visualizador global del Formulario 4

- Añade la pestaña **Visualizador global · todos los ítems**, consolidando los proponentes habilitados de todos los módulos y universos sin mostrar columnas de revisor.
- Añade **Descargar Excel global · Formulario 4**: un único cuadro/hoja, con N.º, ítem, cargo, proponente, C-1, C-2, puntaje final y estado de puntajes.
- Ordena las notas finales de mayor a menor y deja al final los registros con puntaje pendiente, sin inventar notas.
- Si no se puede recuperar el conjunto global completo, el visualizador/exportador informa el error y no genera un archivo parcial.


## LP-1.9.4 — Exportación global Formulario 2 y control departamental
- Añade un exportador oficial global del Formulario 2 que consolida los ítems de todos los módulos y universos, sin mostrar nombres de evaluadores.
- Añade un libro Excel de resumen departamental con una hoja de resumen por persona y una hoja de detalle por ítem, identificando habilitaciones cruzadas, discrepancias y causales de descalificación.
- Los registros repetidos del mismo proponente en el mismo ítem se consolidan para el control departamental; la habilitación en más de un ítem se marca en rojo.
