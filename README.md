# Sistema de evaluación de postulantes — versión GitHub estática

## Incluye
- `index.html`: aplicación completa con los 215 postulantes originales.
- `ANEXOS.xlsx`: plantilla de referencia. El sistema también la incorpora dentro del HTML para generar los reportes.
- `.nojekyll`: evita procesamiento innecesario de GitHub Pages.

## Funciones
- Formulario 1: registro V-1/V-3 y decisión manual CONTINÚA o DESCALIFICADO/NO CONTINÚA.
- Catálogos de causales con búsqueda y justificación obligatoria al elegir OTROS.
- Formulario 2: lista automática por ítem de quienes tienen CONTINÚA en V-1.
- Formulario 3: selector de formación corregido; experiencia general 0–15; experiencia específica adicional 0–10; total C-2 calculado hasta 35.
- Formulario 4: reporte final automático C-1 + C-2 hasta 70.
- Exportación individual de cada formulario: un archivo Excel con 8 pestañas, una por ítem.
- Exportación global: un archivo Excel con 32 pestañas, cuatro formularios por cada uno de los ocho ítems.
- Botones Actualizar, Deshacer y Rehacer.
- Autoguardado local, respaldo e importación de respaldo.

## Publicar en GitHub Pages sin Node.js
1. Descarga y descomprime el ZIP.
2. En GitHub, crea un repositorio.
3. Usa **Add file → Upload files** y sube el contenido de esta carpeta en la raíz del repositorio. No subas una carpeta contenedora adicional.
4. Abre **Settings → Pages**.
5. En **Build and deployment**, elige **Deploy from a branch**.
6. Selecciona la rama `main` y la carpeta `/(root)`, y guarda.
7. Espera a que GitHub Pages publique el sitio y abre la URL que muestra en esa sección.

No necesita Node.js, npm ni comandos de terminal.

## Notas importantes
- Para generar archivos Excel, el navegador debe tener conexión a internet para cargar ExcelJS desde jsDelivr.
- El autoguardado de esta versión es local al navegador/dispositivo. No sincroniza los cambios entre computadoras ni es una base de datos en la nube. La integración Cloudflare se prepara después de aprobar esta versión.
- `Actualizar` guarda la pantalla actual y vuelve a leer el último respaldo local guardado. `Deshacer` y `Rehacer` funcionan mientras la pestaña permanece abierta; no sustituyen un respaldo.
- Antes de usar datos reales, descargue un respaldo con frecuencia.
- Los nombres de postulantes son datos personales. Evite publicar el repositorio de forma pública si no cuenta con autorización para exponerlos.
