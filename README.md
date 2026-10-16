# Sistema de evaluación de postulantes — versión final Cloudflare

Este paquete actualiza la aplicación existente de Cloudflare Pages y mantiene el enlace con la base de datos D1. No requiere Node.js, npm ni comandos de terminal.

## Archivos incluidos

- `index.html`: aplicación completa con los 215 postulantes, criterios TDR, formularios 1–4, causales, selector de puntaje, actualización, deshacer/rehacer y exportación por formulario/global con el formato de `ANEXOS.xlsx`.
- `functions/api/records.js`: API de Cloudflare Pages Functions para leer y guardar datos en D1.
- `ANEXOS.xlsx`: plantilla oficial de referencia (también incorporada dentro del HTML para las exportaciones).
- `.nojekyll`: archivo auxiliar.

## Actualizar el proyecto que ya está conectado a Cloudflare

1. Descarga y descomprime este ZIP en tu computadora.
2. Abre el **mismo repositorio de GitHub** que ya está conectado a Cloudflare Pages.
3. En la raíz del repositorio, reemplaza `index.html` y `functions/api/records.js` por los archivos de esta versión. Sube también `README.md`, `.nojekyll` y `ANEXOS.xlsx`.
4. Confirma que la estructura en GitHub quede exactamente así:

   ```text
   index.html
   README.md
   ANEXOS.xlsx
   .nojekyll
   functions/
     api/
       records.js
   ```

5. Pulsa **Commit changes** en GitHub (o guarda los cambios con tu flujo habitual).
6. Como el repositorio ya está enlazado con Cloudflare Pages, el commit iniciará el despliegue automático. Espera a que el deployment termine y abre el sitio publicado.
7. Comprueba que el indicador muestre **“Autoguardado en Cloudflare ✓”**. Cambia un campo, espera el mensaje de guardado y luego pulsa **Actualizar** para confirmar que el valor sigue en la base de datos.

## Importante sobre Cloudflare D1

- El binding existente debe llamarse exactamente `DB` y apuntar a la base de datos D1 actual. No crees otra base ni borres la existente.
- `functions/api/records.js` añade de forma automática las columnas que falten. La migración no elimina las columnas ni borra las evaluaciones existentes.
- La inicialización solo agrega IDs que falten; no reemplaza registros existentes al cargar el sistema.
- No pulses **Restablecer evaluaciones** salvo que realmente quieras borrar los datos de evaluación de los 215 postulantes. Esa acción sincroniza el reinicio a la base de datos compartida.
- La importación de un respaldo reemplaza los datos editables correspondientes a los 215 IDs y los sincroniza con la nube. Descarga un respaldo antes de importarlo.
- Los cambios se guardan campo por campo automáticamente. Si aparece un error de conexión, el sistema conserva una copia local temporal y muestra el error; no asumas que ese cambio llegó a la nube hasta ver el mensaje de guardado.

## Exportaciones

- Cada formulario se exporta en un archivo Excel separado con pestañas para los ocho ítems.
- La exportación global genera un solo libro con 32 pestañas (4 formularios × 8 ítems).
- La exportación usa la plantilla oficial `ANEXOS.xlsx` y requiere conexión a internet para cargar ExcelJS desde jsDelivr.

## Seguridad

Este sistema contiene información de postulantes. Mantén el repositorio privado y limita el acceso al sitio y a la base de datos a las personas autorizadas. La API no incorpora autenticación propia; si el sitio debe estar restringido, configura Cloudflare Access u otro control de acceso aprobado por tu organización.
