# Sistema de evaluación de postulantes — 7 módulos con una sola base D1

Esta versión mantiene el módulo principal existente y agrega seis módulos de trabajo para Evaluador 1 a Evaluador 6. **Todos los módulos utilizan una única base de datos Cloudflare D1**, mediante el binding `DB`. Los datos se mantienen separados por módulo en la base: el módulo principal conserva la tabla histórica `records`; los seis evaluadores utilizan `module_records` con una clave compuesta por módulo e ID.

## Archivos del repositorio

Sube los siguientes archivos a la raíz del repositorio conectado a Cloudflare Pages y conserva las rutas:

```text
/index.html
/README.md
/.nojekyll
/ANEXOS.xlsx
/MODELO_IMPORTAR_UNIVERSO.xlsx
/functions/api/records.js
```

No se necesita Node.js, npm, Wrangler ni terminal.

## Cloudflare: una sola base de datos

Conserva la base D1 que ya utilizas. En **Workers & Pages → tu proyecto Pages → Settings → Bindings**, verifica que exista un único binding:

```text
Variable name: DB
Database: tu base D1 existente
```

No crees seis bases nuevas ni agregues bindings `DB_EVALUADOR_*`. La API crea automáticamente la tabla `module_records` dentro de la misma base al recibir una solicitud. También verifica y conserva la tabla histórica `records` del módulo principal.

Después de subir los archivos a GitHub, espera el despliegue automático de Cloudflare Pages. Si el binding `DB` ya existe, no necesitas cambiarlo.

## Cómo funcionan los módulos

- **Módulo principal:** continúa leyendo y escribiendo la tabla existente `records`, para no alterar el almacenamiento histórico de los 215 postulantes.
- **Evaluador 1 a Evaluador 6:** guardan sus registros en `module_records`, cada uno bajo su propia clave de módulo. Aunque dos módulos tengan IDs iguales, no se mezclan porque la clave de almacenamiento es `(module_key, id)`.
- Los universos, nombres, decisiones preliminares, causales, puntajes y exportaciones permanecen separados dentro de cada módulo.
- Los cambios de nombre desde el Formulario 1 se guardan en el módulo activo.
- Si V-1 se marca como descalificado/no continúa, V-3 queda como no requerido.

## Importar un universo

1. Entra al módulo del evaluador correspondiente.
2. Pulsa **Descargar modelo de universo**.
3. Completa la hoja `UNIVERSO` con número de ítem, cargo/distribución y nombre completo.
4. Pulsa **Importar otro universo** y selecciona el archivo.
5. El universo se guarda dentro del módulo activo. No sobrescribe los datos de los demás módulos.

## Exportaciones

Cada módulo tiene sus propias exportaciones por formulario y global. Los archivos usan la plantilla oficial `ANEXOS.xlsx` y generan pestañas por ítem, sin combinar la información de otros módulos.

## Prueba recomendada

1. Abre el módulo principal y verifica que continúe apareciendo el universo original.
2. Abre Evaluador 1 e importa un universo pequeño de prueba.
3. Modifica un nombre y una decisión, espera el indicador de guardado y pulsa Actualizar.
4. Abre Evaluador 2: no debe mostrar los datos de Evaluador 1.
5. Comprueba las exportaciones individuales y globales desde cada módulo.

## Seguridad

La separación de datos por módulo evita mezclas accidentales, pero los botones de pestañas no constituyen autenticación. Si cada evaluador debe tener acceso exclusivo, protege la aplicación con Cloudflare Access o implementa inicio de sesión y permisos por módulo antes de trabajar con datos sensibles.
