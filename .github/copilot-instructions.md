# GitHub Copilot Instructions - Arena Battle

## Contexto del Proyecto

Este proyecto es **Arena Battle**, un juego web multijugador de gladiadores con apuestas y combates simulados por IA.

**IMPORTANTE**: Antes de responder cualquier pregunta o realizar cambios, SIEMPRE lee el archivo `context.md` en la raíz del proyecto. Este archivo contiene:
- Arquitectura completa del sistema
- Flujo del juego y reglas
- Estructura de datos y modelos
- Sistema de eventos Socket.io
- Configuración y variables de entorno
- Guías de desarrollo y mejores prácticas

## Responsabilidades al Hacer Cambios

Cuando realices CUALQUIER cambio en el código (crear, modificar o eliminar archivos), debes:

1. **Actualizar context.md** inmediatamente con:
   - Nuevas funcionalidades añadidas
   - Cambios en la arquitectura
   - Nuevas dependencias instaladas
   - Modificaciones en el flujo del juego
   - Nuevos endpoints o eventos Socket.io
   - Cambios en modelos de datos
   - Nuevas variables de entorno
   - Scripts npm agregados

2. **Mantener coherencia** con:
   - La arquitectura existente
   - Los patrones de código establecidos
   - El tema visual del coliseo romano
   - Las reglas del juego documentadas

3. **Documentar decisiones**:
   - Por qué se hizo el cambio
   - Impacto en otras partes del sistema
   - Consideraciones de performance
   - Migraciones necesarias

## Formato de Actualización de context.md

Cuando actualices context.md:

```markdown
## [Nueva Sección o Modificación]
[Descripción clara del cambio]

### Ejemplo de Uso
[Código o ejemplo si aplica]

### Consideraciones
- Punto 1
- Punto 2

---
**Actualizado**: [Fecha]
**Por**: [Descripción breve del cambio]
```

## Áreas Clave del Proyecto

### Frontend (client/)
- **Stack**: React 18 + TypeScript + Vite + Tailwind
- **Estilo**: Tema coliseo romano (colores arena, dorado, rojo sangre)
- **Estado**: GameContext con Context API
- **Comunicación**: Socket.io client
- **Páginas**: Home, Lobby, Arena, Victory

### Backend (server/)
- **Stack**: Node.js + Express + TypeScript + Socket.io
- **IA**: Gemini (primario), OpenAI, Anthropic (intercambiables)
- **Lógica**: TournamentEngine, BettingSystem, CombatSimulator
- **Datos**: MemoryRepository (preparado para DB)

### Comunicación
- **Eventos cliente → servidor**: room:create, room:join, gladiator:create, bet:place, etc.
- **Eventos servidor → cliente**: game:state, match:start, match:result, tournament:end, etc.

## Reglas del Juego (NO MODIFICAR sin actualizar context.md)

- **Jugadores**: 2-16 por partida
- **Dinero inicial**: 100 monedas
- **Apuesta mínima**: 10 monedas
- **Tiempo de apuestas**: 30 segundos
- **Bonus dueño**: +20% si gana tu gladiador
- **Empates**: Permitidos (múltiples ganadores)
- **Reconexión**: Permitida, gladiador sigue activo

## Comandos Importantes

```bash
# Desarrollo (ambos proyectos)
npm run dev

# Solo servidor
cd server && npm run dev

# Solo cliente
cd client && npm run dev

# Build producción
npm run build

# Instalar todas las dependencias
npm run install:all
```

## Variables de Entorno (.env)

```bash
AI_PROVIDER=gemini|openai|anthropic
GEMINI_API_KEY=...
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
INITIAL_COINS=100
MIN_BET=10
BETTING_TIME_SECONDS=30
MAX_PLAYERS=16
```

## Mejores Prácticas

1. **TypeScript**: Tipar todo, usar interfaces definidas en types/
2. **Socket.io**: Usar eventos tipados, broadcast a rooms específicos
3. **React**: Evitar prop drilling, usar Context para estado global
4. **CSS**: Usar clases de Tailwind, seguir tema romano
5. **IA**: Manejar errores con fallback, timeout razonable
6. **Validaciones**: Tanto en cliente como servidor

## Patrones de Código

### Eventos Socket.io (server)
```typescript
socket.on('event:name', async (data, callback) => {
  const { player, room } = await this.getPlayerAndRoom(socket);
  if (!player || !room) {
    socket.emit('game:error', 'Error message');
    return;
  }
  // Lógica
  await repo.updateRoom(room);
  this.broadcastGameState(room.code);
});
```

### Componentes React (client)
```typescript
export default function Component() {
  const { gameState, currentPlayer, action } = useGame();
  
  // Estado local si necesario
  const [state, setState] = useState(initialValue);
  
  // Efectos
  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    };
  }, [deps]);
  
  return (
    <div className="card-stone p-6">
      {/* JSX */}
    </div>
  );
}
```

## Debugging

- **Cliente**: Console del navegador, React DevTools
- **Servidor**: Logs en consola con `console.log`, watch con tsx
- **Socket.io**: Monitor en Network tab, eventos en consola
- **Estado**: Verificar `gameState` en GameContext

## Testing Local

1. Abrir múltiples pestañas de navegador
2. Crear sala en una pestaña
3. Unirse desde otras con el código
4. Probar todo el flujo del juego

## Recursos Adicionales

- Socket.io docs: https://socket.io/docs/v4/
- React docs: https://react.dev/
- Tailwind docs: https://tailwindcss.com/
- Gemini API: https://ai.google.dev/docs

---

**RECUERDA**: Antes de CUALQUIER cambio o respuesta, lee `context.md` para entender el estado actual del proyecto.
