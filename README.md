# Evaluación de postulantes — versión final de carga para La Paz

## Contenido
- `index.html`: aplicación y generador de informe Word multirrevisor.
- `functions/api/records.js`: API Cloudflare Pages Functions; usa la base D1 existente mediante el binding `DB`.
- `INFORME_MODELO_LA_PAZ.docx`: modelo Word de La Paz proporcionado por el usuario; se conserva el diseño y el color celeste. Los cuadros de evaluación se regeneran según los postulantes seleccionados.
- `ANEXOS.xlsx`: plantilla de exportación Excel.
- `MODELO_IMPORTAR_UNIVERSO.xlsx`: plantilla para importar nuevos universos.
- `UNIVERSO_ITEMS_LA_PAZ_60_CORREGIDO.xlsx`: referencia del universo oficial de 60 ítems.
- `REVISORES_MANIFEST.json` e `IMPORTACION_REVISORES.md`: conteos y observaciones de importación.
- `.nojekyll`: archivo de Pages.

## Revisores precargados
Incluye los módulos JAQUELINE (204 registros únicos) y XIMENA (206 registros únicos), en la misma base D1 y aislados por módulo.

## Duplicado de Jaqueline: ítem fuente 6
El segundo bloque del Formulario 1 etiquetado con número de ítem 6 (filas 47–70 del Excel fuente) está excluido porque repite exactamente los 13 nombres del bloque anterior y ambos indican ENCUESTADOR LA PAZ VI. Se conserva una sola copia de esos 13 postulantes bajo el ítem oficial global 21, que es el ítem correspondiente a Encuestador VI. No se cargan esos datos en el ítem global 6 y no se borran ni alteran datos del módulo principal ni de otros revisores.

## Universo oficial
- Ítems globales 1–15: Supervisores de Campo La Paz I–XV.
- Ítems globales 16–60: Encuestadores La Paz I–XLV.
- Los números locales de encuestadores se convierten al correlativo global sumando 15.

## Informe Word
La opción **Generar informe Word** usa por defecto `INFORME_MODELO_LA_PAZ.docx`. Permite seleccionar uno o varios revisores y postulantes; organiza los cuadros por número de ítem. Se conserva el color celeste del modelo. Los cuadros de ejemplo se reemplazan con los datos seleccionados. Las fechas y horas no disponibles en el sistema permanecen vacías.

## Subida a GitHub / Cloudflare Pages
1. Descomprime el ZIP.
2. Sube el contenido completo a la raíz del repositorio conectado a Cloudflare Pages, conservando la ruta `functions/api/records.js`.
3. Mantén el binding `DB` y la base D1 existentes; no crees otra base ni borres la actual.
4. Haz commit en la rama de despliegue y espera a que Cloudflare termine.
5. Prueba el módulo principal, JAQUELINE y XIMENA, y genera un Word de prueba con unos pocos postulantes.

No se ha desplegado directamente en la cuenta Cloudflare; debe completarse el commit y verificarse el sitio publicado.
