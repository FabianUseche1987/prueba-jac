# JAC Connect

Proyecto académico: aplicación web para gestionar las Juntas de Acción Comunal de Colombia.
Equipo de 4 personas que está aprendiendo. Antes de trabajar, lee el contexto y el plan:

@docs/CONTEXTO.md
@docs/PLAN_DE_TRABAJO.md

## Reglas de trabajo

- Responder, nombrar el código y escribir comentarios en **español**. Explicar cada cambio de forma sencilla (qué se hizo y por qué).
- Avanzar **paso a paso** según el plan. Al terminar un paso, marcarlo en `PLAN_DE_TRABAJO.md` y anotar las decisiones en la sección 8 de `CONTEXTO.md`.
- Código simple: sin librerías innecesarias ni abstracciones complicadas.
- Frontend: preferir clases de Bootstrap a CSS propio; reutilizar `.btn-jac`, `<app-modal-confirmar>` y `<app-login-form>`.
- Base de datos: todo cambio va en un script nuevo en `database/migraciones/` y se refleja en `database/schema.sql`. Nunca cambios "a mano" sin script.
- Seguridad: nunca escribir credenciales ni datos del servidor en archivos del repositorio. Van en `backend/.env`, que git ignora.
- **Git: NUNCA hacer merge, push ni pull request hacia `main`.** `main` se publica automáticamente en Hostinger y contiene la versión presentada a la profesora. Se trabaja en ramas `feature/...` (ver sección 12 de `docs/CONTEXTO.md`).
