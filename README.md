# Evaluación de postulantes — corrección de exportaciones

## Cambios
- Se fuerza el borde negro fino en todas las celdas del área de impresión de cada formulario exportado.
- Se respeta el perímetro de las celdas combinadas para evitar líneas internas no deseadas.
- En Formulario 2, “PROPONENTES HABILITADOS” queda centrado horizontal y verticalmente.
- Se conserva la API de Cloudflare Pages Functions y el binding D1 `DB` existente.

## Actualización
1. En el repositorio de GitHub conectado a Cloudflare Pages, reemplaza `index.html` y `README.md`.
2. Conserva `functions/api/records.js`, `ANEXOS.xlsx`, `MODELO_IMPORTAR_UNIVERSO.xlsx` y `.nojekyll` del paquete.
3. Haz commit en la rama de producción y espera el despliegue.
4. Prueba la exportación por formulario y la global.

No elimines la base D1 existente ni cambies el binding `DB`. No requiere Node.js.
