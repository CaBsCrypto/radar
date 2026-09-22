## 🚀 Resumen del Pull Request

### ¿Qué problema resuelve o qué funcionalidad agrega?
<!-- Describe brevemente la funcionalidad, pantalla o módulo implementado -->

### 🧩 Módulos Afectados
- [ ] 🗺️ Mapa Territorial Regional (`src/components/ChileMap.tsx`)
- [ ] 📅 Agenda de Eventos y Hackathons (`src/components/EventsHistory.tsx`)
- [ ] 🤖 Hub de Empresas & WebMCP (`src/components/WebMcpBusinessSection.tsx`)
- [ ] 🛡️ Panel Administrativo (`src/components/AdminDashboard.tsx`)
- [ ] 📦 Modelos de Datos o Tipos (`src/types.ts`)
- [ ] ☁️ Firebase / Firestore (`src/lib/firebase.ts` o `firestore.rules`)
- [ ] 📄 Documentación (`README.md`, `AGENTS.md`, `ESTUDIANTES.md`)

---

## 📸 Capturas de Pantalla / Demo
<!-- Pega aquí capturas de pantalla, GIFs o videos cortos demostrando la funcionalidad en el navegador -->

---

## ✅ Checklist de Calidad y Verificación

Por favor marca todas las casillas antes de solicitar la revisión de los mentores:

- [ ] **Ramas Aisladas**: Este PR proviene de una rama `feature/*` o `fix/*` (no de `main`).
- [ ] **Tipado de TypeScript**: Se ejecutó `npm run lint` (`tsc --noEmit`) sin errores de tipos.
- [ ] **Compilación de Producción**: Se ejecutó `npm run build` y el bundle de Vite se generó limpiamente.
- [ ] **Pruebas Locales**: Se verificó el funcionamiento visual e interactivo en `http://localhost:3000`.
- [ ] **Integridad de Datos**: Si se agregaron campos nuevos, están tipados en `src/types.ts` y cumplen `firestore.rules`.
- [ ] **Sin Secretos Expuestos**: No se incluyeron API keys privadas ni credenciales en el código fuente.

---

## 💬 Notas Adicionales para los Mentores / Evaluadores
<!-- Comentarios sobre decisiones de diseño, dudas o próximos pasos -->
