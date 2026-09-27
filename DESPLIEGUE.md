# Despliegue del Cotizador WebMCP

Rama: `feature/cotizador-webmcp` · Preparado por el equipo de la Hackatón FAE USACH 2026.

Esta rama suma al Radar un **cotizador de métodos MCP**, **tres herramientas WebMCP**, un **servidor MCP
remoto** en `/api/mcp` y un **mapa con los límites reales de las 16 regiones**. Para publicarla hay que hacer tres cosas, en este orden.

---

## 1. Cargar la clave de la IA en Vercel (5 minutos)

La propuesta la genera una función de servidor (`api/cotizar.ts`). La clave nunca llega al navegador.

1. Vercel → proyecto del Radar → **Settings → Environment Variables**.
2. Agregar `GEMINI_API_KEY` con una clave de [Google AI Studio](https://aistudio.google.com/apikey),
   en los entornos **Production** y **Preview**.
3. Opcional: `GEMINI_MODEL` para fijar un modelo. Si se deja vacío, el servidor elige uno disponible para la clave.

Alternativa: `OPENAI_API_KEY` (y opcional `OPENAI_MODEL`). Se usa solo si no hay clave de Gemini.

> Sin clave, el cotizador funciona igual para las tres empresas de ejemplo, y lo indica en pantalla.
> Para datos reales, la clave es obligatoria.

## 2. Publicar las reglas de Firestore (5 minutos)

La rama agrega la colección `mcp_solicitudes` a `firestore.rules`. Sin publicar las reglas, las solicitudes
no se guardan (la propuesta se muestra igual, con un aviso).

**Desde la consola**, que es lo más directo porque el proyecto usa una base con nombre propio:

1. Firebase Console → Firestore → seleccionar la base `ai-studio-buildingaroundch-…` (la de `firebase-applet-config.json`).
2. Pestaña **Reglas** → reemplazar por el contenido completo de `firestore.rules` de esta rama → **Publicar**.

Qué permiten las reglas nuevas:

| Acción | Quién |
| :--- | :--- |
| Leer solicitudes (alimentan el mapa) | Cualquiera. No contienen datos de contacto |
| Crear una solicitud | Cualquiera, con validación de campos. Siempre nace como `postulando` |
| Aprobar o revertir (`estado`) | Solo `cabscryptocontacto@gmail.com` |
| Eliminar | Solo `cabscryptocontacto@gmail.com` |

El nombre de la empresa solo puede guardarse en la colección pública si la empresa lo autorizó.
Los datos de contacto, cuando se dejan, van a `business_submissions`, que sigue siendo privada.

## 3. Revisar la vista previa y fusionar

1. Abrir el Pull Request de esta rama hacia `main`. Vercel genera sola una **URL de vista previa**.
2. Revisar en esa URL la lista de verificación de abajo.
3. Fusionar a `main`. Vercel publica en `radar.browns.studio`.

### Lista de verificación

- [ ] `/cotizador` abre y el menú muestra la pestaña **Cotizador**.
- [ ] Con una empresa inventada, **Ver la propuesta** abre la hoja con métodos MCP y precio.
- [ ] "Ver solicitudes en el mapa" abre la pestaña Mapa con la región de esa empresa coloreada.
- [ ] En `/admin` → **Solicitudes MCP**, la solicitud aparece; **Aprobar** la pasa a conectada.
- [ ] En el mapa principal, la capa **Solicitudes MCP** colorea la región; al hacer clic se abre su panel y el botón **Cotizar** lleva al cotizador con la región elegida.
- [ ] En `/webmcp`, **Sumar mi Empresa al Mapa** lleva al cotizador.
- [ ] Abrir `<url-de-vista-previa>/api/mcp` en el navegador muestra la lista de herramientas (respuesta 405 con descripción: es lo esperado).
- [ ] Conectado desde Claude o el MCP Inspector, `getTiposMCPGenerados` devuelve datos y no un error.

---

## Qué cambió en el código

| | Archivo | Qué hace |
| :--- | :--- | :--- |
| Nuevo | `api/mcp.ts`, `server/mcp.ts` | Servidor MCP remoto (Streamable HTTP) con las mismas tres herramientas |
| Nuevo | `api/cotizar.ts` | Función de Vercel: recibe el formulario y devuelve la propuesta |
| Nuevo | `server/cotizar.ts` | Núcleo compartido: prompt, llamada a la IA, validación y límite por IP |
| Nuevo | `src/components/Cotizador.tsx` | Formulario, mapa de solicitudes y panel de demostración |
| Nuevo | `src/components/PropuestaModal.tsx` | La propuesta como documento: PDF, WhatsApp y copiar |
| Nuevo | `src/services/cotizadorService.ts` | Firestore (`mcp_solicitudes`, `business_submissions`) y modo demo |
| Nuevo | `src/lib/webmcp.ts` | Registro de las herramientas WebMCP |
| Nuevo | `src/data/cotizadorData.ts` | Paquetes, opciones del formulario y ejemplos |
| Nuevo | `src/data/chileRegionsGeo.ts` | Límites reales de las regiones (fuente: github.com/caracena/chile-geojson) |
| Nuevo | `src/components/MapaRegiones.tsx` | Mapa de coropletas de la pestaña Mapa: capas, leyenda, recuadro al pasar el cursor y vista de tabla |
| Nuevo | `src/components/PanelRegion.tsx` | Panel lateral de cada región: empresas conectadas, postulantes, directorio, eventos y botón para cotizar |
| Eliminado | `src/components/ChileMap.tsx`, `ChileSilhouetteMap.tsx` | Reemplazados por los dos anteriores (siguen en el historial de git) |
| Cambio | `src/components/AdminDashboard.tsx` | Pestaña **Solicitudes MCP** con Aprobar, Revertir y Eliminar |
| Cambio | `src/App.tsx`, `Navbar.tsx` | Ruta `/cotizador`, pestaña y botón en la barra móvil |
| Cambio | `src/components/WebMcpBusinessSection.tsx` | El botón principal lleva al cotizador |
| Cambio | `src/types.ts`, `firestore.rules`, `vercel.json`, `vite.config.ts`, `src/index.css` | Tipos, permisos, rutas `/api`, API en desarrollo, impresión |

La sección `WebMcpBusinessSection` y su formulario original no se eliminaron; el botón principal ahora
lleva al cotizador, que cumple la misma función con diagnóstico incluido.

## Herramientas WebMCP

Se registran en todo el sitio con `document.modelContext` (Chrome reciente) o `navigator.modelContext` (anterior).

| Herramienta | Qué hace |
| :--- | :--- |
| `getListaEmpresasConMCP` | Empresas conectadas con MCP, filtrables por región |
| `getTiposMCPGenerados` | Métodos MCP propuestos y tareas que más se repiten |
| `solicitar_precotizacion` | Completa y envía el cotizador, y devuelve la propuesta |

Para probarlas: Chrome con `chrome://flags/#enable-webmcp-testing` activado y la extensión
**WebMCP – Model Context Tool Inspector**. El cotizador muestra "WebMCP activo: 3 herramientas" cuando quedaron registradas.

## Servidor MCP remoto: usar el Radar desde Claude o ChatGPT

WebMCP solo funciona con un asistente que corre dentro del navegador, con el sitio abierto. Para que
**cualquier** asistente pueda consultar el Radar, la rama agrega un servidor MCP en:

```
https://radar.browns.studio/api/mcp
```

Tiene las mismas tres herramientas, no requiere sesión y usa las mismas reglas de Firestore que el sitio:
lee solo datos públicos y crea solicitudes sin datos de contacto.

**Conectarlo en Claude.** Ajustes → Conectores → Agregar conector personalizado → pegar la URL. Luego, en un chat:
"¿Qué empresas tienen MCP en Chile?" o "Cotiza la conexión MCP para una panadería de Los Lagos que responde
precios por WhatsApp".

**Conectarlo en ChatGPT.** Requiere un plan con conectores MCP propios (según OpenAI: Business, Enterprise o Edu,
en beta). Ajustes → Aplicaciones → Modo desarrollador → Crear → pegar la URL, sin autenticación.

**Probarlo sin cuenta de pago.** `npx @modelcontextprotocol/inspector`, con transporte *Streamable HTTP* y la URL anterior.

> **Revisar antes de publicar: restricciones de la clave web de Firebase.** El servidor MCP lee y escribe en
> Firestore por su API REST usando la clave pública de `firebase-applet-config.json`. Si esa clave tiene
> restricción por *referente HTTP* en Google Cloud (Credenciales → la clave → Restricciones de aplicación),
> las llamadas desde el servidor responden `403`. En ese caso, crear una clave aparte restringida solo a la
> API de Firestore y cargarla en el código, o quitar la restricción por referente de la actual.
> Las reglas de Firestore siguen protegiendo los datos en ambos casos.

## Modo demostración

`/cotizador?demo=1` guarda todo en el navegador y muestra un panel para aprobar empresas sin iniciar sesión.
No toca Firestore. Sirve para presentaciones; se sale con el enlace **Salir** del aviso amarillo.

## Desarrollo local

```bash
npm install --legacy-peer-deps
# en .env: GEMINI_API_KEY=...
npm run dev          # http://localhost:3000, incluye /api/cotizar
npm run lint && npm run build
```

`npm run dev` atiende `/api/cotizar` con el mismo código que usa Vercel, así que no hace falta la CLI de Vercel.

## Costos y límites

- **IA**: una llamada por propuesta. La capa gratuita de Gemini alcanza para uso moderado; sobre eso se cobra por uso.
- **Límite por IP**: 8 propuestas por minuto, para proteger la cuota ante abuso.
- **Vercel y Firestore**: dentro de los planes actuales para este volumen.

## Pendiente para una segunda etapa

- Diagnóstico profundo para quienes aceptan la pre-cotización.
- Agente que resuma las solicitudes cada semana y proponga servicios estandarizados.
- Dividir el bundle con `import()` dinámico (el aviso de tamaño de Vite ya existía antes de esta rama).
