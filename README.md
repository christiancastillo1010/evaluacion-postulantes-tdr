# Sistema de evaluación de postulantes — 7 módulos y una sola base D1

Este paquete mantiene el módulo principal y seis módulos de evaluadores dentro de una única base Cloudflare D1. No requiere Node.js, npm, Wrangler ni terminal.

## Archivos que deben quedar en la raíz del repositorio

```text
/index.html
/README.md
/.nojekyll
/ANEXOS.xlsx
/MODELO_IMPORTAR_UNIVERSO.xlsx
/functions/api/records.js
```

## Configuración de Cloudflare

Conserva la base D1 existente y el binding `DB`. La API crea de manera automática las tablas adicionales `module_records` y `module_settings`, preservando la tabla histórica `records` del módulo principal.

## Módulos y nombre del evaluador

Hay un módulo principal y seis módulos de evaluación. Cada módulo mantiene sus propias evaluaciones y exportaciones dentro de la misma base. Usa el botón **Cambiar nombre · ...** para asignar el nombre real de cada evaluador; el nombre se guarda en D1 y aparece en las pestañas y en los nombres de exportación.

## Agregar personas o importar un universo

- En el módulo principal, Formulario 1 permite añadir personas a los ítems oficiales existentes.
- En cualquiera de los seis módulos de evaluador, si todavía no hay un universo, pulsa **+ Agregar persona** y completa el nombre del universo, ítem, cargo y nombre de la persona. Así se crea el universo con su primer registro; luego puedes seguir añadiendo personas manualmente.
- También puedes pulsar **Descargar modelo de universo (.xlsx)**. El botón genera el archivo de Excel en el navegador. Si ExcelJS no carga, intenta descargar el modelo estático y, como último recurso, descarga un CSV compatible con la importación.
- El modelo contiene la hoja `UNIVERSO` con columnas `N° DE ÍTEM`, `CARGO / DISTRIBUCIÓN` y `NOMBRE COMPLETO DEL PROPONENTE`.

## Duplicados compartidos

La API devuelve un catálogo global de nombres duplicados: detecta duplicados dentro de cada universo y comparte el resultado con los siete módulos. La lista histórica `INITIAL_DUPLICATES` también se aplica en todos los módulos. Si un nombre se corrige en Formulario V-1, el módulo actual actualiza el catálogo compartido al guardar; otros usuarios verán los cambios al pulsar **Actualizar** o al cambiar de módulo.

## Exportaciones

Cada módulo conserva exportaciones por formulario y globales basadas en `ANEXOS.xlsx`, sin mezclar los puntajes de otros módulos.

## Actualizar GitHub

Reemplaza `index.html`, `functions/api/records.js` y `README.md`; conserva `ANEXOS.xlsx`, `MODELO_IMPORTAR_UNIVERSO.xlsx` y `.nojekyll`. Haz commit en la rama conectada a Cloudflare Pages y espera el despliegue automático. No elimines la base ni cambies el binding `DB`.

## Seguridad

La separación por módulo evita mezclar datos accidentalmente, pero no sustituye la autenticación. Si cada evaluador debe tener acceso exclusivo a su módulo, añade Cloudflare Access o autenticación con permisos.
