# Evaluación de postulantes — GitHub + Cloudflare D1

Esta versión NO necesita Node.js para instalar, ejecutar o mantener la aplicación.

## Estructura
- `index.html` — sistema
- `data.js` — 215 postulantes y duplicados
- `functions/api/records.js` — API de autoguardado en Cloudflare D1

## Autoguardado
Cada cambio se guarda en D1 automáticamente. La página carga primero lo que está en el servidor. Los campos se guardan por registro y campo, evitando que un usuario tenga que pulsar "Guardar".

## Publicación
1. Crea un repositorio en GitHub y sube estos archivos conservando la carpeta `functions/api/`.
2. En Cloudflare: Workers & Pages > Create application > Pages > Connect to Git.
3. Selecciona el repositorio.
4. Framework preset: None.
5. Build command: dejar vacío.
6. Build output directory: `/` (o dejar el valor que Cloudflare indique para sitio estático).
7. Deploy.
8. En el proyecto: Settings > Bindings > Add > D1 database.
9. Variable name: `DB`.
10. Selecciona la base D1 y guarda.
11. Haz un nuevo Deploy.
12. Abre la URL de Cloudflare. La primera carga crea automáticamente los 215 registros en D1.

IMPORTANTE: Pages Functions requiere despliegue mediante Git; Cloudflare indica que Direct Upload no admite Functions. 
