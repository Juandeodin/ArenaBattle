# ⚔️ Arena Battle

<div align="center">

**Juego multijugador de gladiadores con apuestas y combates narrados por IA**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io/)

</div>

---

## 📜 Descripción

**Arena Battle** es un juego web multijugador ambientado en un coliseo romano donde 2-16 jugadores crean sus propios gladiadores, apuestan en combates 1vs1 y compiten en torneos de eliminación. Los combates son narrados de forma épica por inteligencia artificial (Gemini, OpenAI, o Anthropic) en tiempo real.

El objetivo es simple: **¡Acumula más monedas que tus oponentes y conviértete en el campeón del coliseo!**

### ✨ Características Principales

- 🎮 **Multijugador en tiempo real** con Socket.io
- 🤖 **Narración de combates por IA** con 3 proveedores intercambiables
- 🎲 **Sistema de apuestas** con distribución proporcional y bonus
- 🏆 **Torneos de eliminación** con bracket dinámico (2-16 jugadores)
- 🎨 **Tema visual coliseo romano** con animaciones y efectos
- 🔄 **Sistema de reconexión** automática
- 💰 **Empates múltiples** permitidos (varios ganadores)

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** con TypeScript
- **Vite** como build tool
- **Tailwind CSS** para estilos
- **Socket.io Client** para comunicación real-time
- **React Router** para navegación
- **Lucide React** para iconos

### Backend
- **Node.js** con Express
- **TypeScript** para type safety
- **Socket.io** para WebSockets
- **Google Gemini AI** (primario)
- **OpenAI GPT-4** (alternativo)
- **Anthropic Claude** (alternativo)

---

## 🏗️ Arquitectura

```
Cliente (React) ←→ Socket.io ←→ Servidor (Node.js)
                                      ↓
                        ┌─────────────┴─────────────┐
                        │                           │
                  AI Provider                Repository
                  (Gemini/GPT/Claude)        (In-Memory)
                        │                           │
                        └──→ Combat Simulation ←────┘
                              ↓
                        Tournament Engine
                              ↓
                        Betting System
```

### Componentes Principales

#### Frontend (`client/`)
- **GameContext**: Estado global del juego con Context API
- **Pages**: Home, Lobby, Arena, Victory
- **Socket Service**: Wrapper tipado de Socket.io

#### Backend (`server/`)
- **GameManager**: Orquesta toda la lógica del juego
- **TournamentEngine**: Gestiona brackets y rounds
- **BettingSystem**: Validación y distribución de apuestas
- **CombatSimulator**: Genera combates con IA
- **AI Providers**: Abstracción para múltiples modelos de IA

---

## 🚀 Instalación

### Requisitos
- Node.js 18+ 
- npm o yarn
- API Key de al menos un proveedor de IA (Gemini recomendado)

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/Juandeodin/ArenaBattle.git
cd ArenaBattle
```

2. **Instalar dependencias**
```bash
npm run install:all
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env en la raíz del proyecto
cp .env.example .env
```

Editar `.env` con tus API keys:
```env
# Servidor
PORT=3001
NODE_ENV=development

# IA (configurar al menos una)
AI_PROVIDER=gemini
GEMINI_API_KEY=tu_api_key_aqui
OPENAI_API_KEY=tu_api_key_aqui (opcional)
ANTHROPIC_API_KEY=tu_api_key_aqui (opcional)

# Reglas del juego
INITIAL_COINS=100
MIN_BET=10
BETTING_TIME_SECONDS=30
MAX_PLAYERS=16
```

4. **Iniciar en modo desarrollo**
```bash
npm run dev
```

Esto iniciará:
- Servidor en `http://localhost:3001`
- Cliente en `http://localhost:5173`

---

## 🎮 Cómo Jugar

### 1. Crear o Unirse a una Sala
- Desde la página principal, crea una nueva sala o únete con un código
- Código de sala de 6 caracteres (ej: `ABC123`)

### 2. Crear tu Gladiador
En el lobby:
- Nombre del gladiador (max 30 caracteres)
- Descripción épica (max 200 caracteres)
- 3 habilidades únicas (max 30 caracteres cada una)

### 3. Esperar a los Jugadores
- El host ve el botón "Iniciar Torneo" cuando todos estén listos
- Mínimo 2 jugadores, máximo 16

### 4. Fase de Apuestas (30 segundos)
- Apuesta en cualquiera de los 2 gladiadores
- Mínimo 10 monedas, máximo tu balance completo
- **Bonus del dueño**: +20% si apuestas y gana tu gladiador

### 5. Combate
- La IA narra el combate en tiempo real con efecto typewriter
- Se declara un ganador

### 6. Distribución de Ganancias
- Las ganancias se distribuyen proporcionalmente entre apostadores ganadores
- Se muestra la lista de pagos

### 7. Victoria
- El torneo continúa hasta la final
- Gana quien acumule más monedas
- Empates permitidos (múltiples ganadores)

---

## 📁 Estructura del Proyecto

```
ArenaBattle/
├── client/                     # Frontend React
│   ├── src/
│   │   ├── pages/             # Páginas de la aplicación
│   │   │   ├── Home.tsx       # Pantalla inicial
│   │   │   ├── Lobby.tsx      # Sala de espera
│   │   │   ├── Arena.tsx      # Torneo y combates
│   │   │   └── Victory.tsx    # Pantalla de victoria
│   │   ├── context/
│   │   │   └── GameContext.tsx # Estado global
│   │   ├── services/
│   │   │   └── socket.ts      # Cliente Socket.io
│   │   ├── types/
│   │   │   └── index.ts       # Interfaces TypeScript
│   │   ├── App.tsx            # Router principal
│   │   └── index.css          # Estilos globales
│   └── vite.config.ts
│
├── server/                     # Backend Node.js
│   ├── src/
│   │   ├── socket/
│   │   │   ├── gameManager.ts # Lógica principal del juego
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── aiProvider.ts        # Interfaz IA
│   │   │   ├── geminiProvider.ts    # Google Gemini
│   │   │   ├── openaiProvider.ts    # OpenAI GPT
│   │   │   └── anthropicProvider.ts # Anthropic Claude
│   │   ├── game/
│   │   │   ├── tournamentEngine.ts  # Sistema de torneos
│   │   │   ├── bettingSystem.ts     # Sistema de apuestas
│   │   │   └── combatSimulator.ts   # Simulador de combates
│   │   ├── data/
│   │   │   └── repository.ts        # Repositorio de datos
│   │   └── index.ts
│   └── tsconfig.json
│
├── .env                        # Variables de entorno (no commiteado)
├── .env.example                # Plantilla de configuración
├── context.md                  # Documentación completa del proyecto
├── package.json                # Scripts de monorepo
└── README.md                   # Este archivo
```

---

## ⚙️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor y cliente simultáneamente
npm run dev:server       # Solo servidor
npm run dev:client       # Solo cliente

# Producción
npm run build            # Build de ambos proyectos
npm run build:server     # Build del servidor
npm run build:client     # Build del cliente
npm start                # Inicia servidor en producción

# Instalación
npm run install:all      # Instala todas las dependencias
```

---

## 🔧 Configuración Avanzada

### Cambiar Proveedor de IA

En el archivo `.env`, modifica la variable `AI_PROVIDER`:

```env
AI_PROVIDER=gemini      # Google Gemini (recomendado, gratuito)
AI_PROVIDER=openai      # OpenAI GPT-4o-mini
AI_PROVIDER=anthropic   # Anthropic Claude 3 Haiku
```

### Ajustar Reglas del Juego

```env
INITIAL_COINS=100            # Monedas iniciales por jugador
MIN_BET=10                   # Apuesta mínima
BETTING_TIME_SECONDS=30      # Tiempo de apuestas (segundos)
MAX_PLAYERS=16               # Máximo de jugadores por partida
```

**Nota**: El bonus del dueño (20%) está hardcoded en `BettingSystem`.

---

## 🎨 Tema Visual

El juego utiliza un tema inspirado en el coliseo romano:

- **Fuentes**: Cinzel (títulos), Inter (cuerpo)
- **Colores**: Dorado arena, oro brillante, rojo sangre, bronce, piedra
- **Animaciones**: Float, pulse, glow, typewriter
- **Componentes**: Cards de piedra, botones dorados, badges de habilidades

---

## 🌐 Comunicación Socket.io

### Eventos del Cliente → Servidor

| Evento | Descripción |
|--------|-------------|
| `room:create` | Crea una nueva sala |
| `room:join` | Une/reconecta a una sala |
| `room:leave` | Sale de la sala |
| `gladiator:create` | Crea un gladiador |
| `game:start` | Inicia el torneo (solo host) |
| `game:continue` | Avanza al siguiente combate (solo host) |
| `bet:place` | Realiza una apuesta |
| `bet:skip` | No apuesta en este combate |

### Eventos del Servidor → Cliente

| Evento | Descripción |
|--------|-------------|
| `game:state` | Estado completo del juego |
| `game:error` | Mensaje de error |
| `game:narration` | Narración del combate |
| `game:countdown` | Countdown de apuestas |
| `player:joined` | Jugador nuevo en sala |
| `player:left` | Jugador salió |
| `match:start` | Nuevo combate comenzando |
| `match:result` | Resultados y pagos |
| `tournament:end` | Torneo finalizado |

---

## 📊 Sistema de Apuestas

### Fórmula de Distribución

```
totalPool = suma de todas las apuestas
winningPool = suma de apuestas al ganador

Para cada apuesta ganadora:
  proportion = bet.amount / winningPool
  winnings = totalPool * proportion
  
  Si es dueño del gladiador:
    winnings += winnings * 0.20  (bonus +20%)
```

### Ejemplo

- Pool total: **100 monedas**
- Apuestas al ganador: **40 monedas**
- Jugador A apostó **30** (dueño):
  - Base: 100 × (30/40) = **75**
  - Bonus: 75 × 0.20 = **15**
  - Total: **90 monedas** ✨
- Jugador B apostó **10**:
  - Total: 100 × (10/40) = **25 monedas**

---

## 🤖 Integración con IA

### Prompt Template

La IA recibe los datos de ambos gladiadores y debe retornar:

```json
{
  "narration": "Narración épica del combate (máx 100 palabras)",
  "winner": 1 | 2
}
```

### Fallback

Si la IA falla:
- Winner aleatorio (50/50)
- Narración genérica usando datos de los gladiadores

---

## 🚧 Roadmap

### Versión Actual (v1.0)
- ✅ Sistema multijugador básico
- ✅ Torneos de eliminación
- ✅ Sistema de apuestas
- ✅ 3 proveedores de IA
- ✅ Reconexión automática

### Futuras Features
- [ ] Base de datos persistente (PostgreSQL/MongoDB)
- [ ] Sistema de cuentas y autenticación
- [ ] Rankings globales y estadísticas
- [ ] Diferentes modos de juego
- [ ] Items y mejoras para gladiadores
- [ ] Chat en tiempo real
- [ ] Replay de combates
- [ ] Torneos programados
- [ ] Sistema de temporadas

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Reglas Importantes

⚠️ **Antes de hacer cualquier cambio, lee el archivo `context.md`**

Cuando realices cambios:
- Actualiza `context.md` con las modificaciones
- Mantén coherencia con la arquitectura existente
- Sigue los patrones de código establecidos
- Documenta nuevas funcionalidades

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 👥 Autor

**Juandeodin** - [GitHub](https://github.com/Juandeodin)

---

## 🙏 Agradecimientos

- Google Gemini AI por la narración de combates
- La comunidad de React y Node.js
- Socket.io por la comunicación en tiempo real
- Todos los gladiadores que lucharon valientemente en la arena

---

<div align="center">

**¡Que comience la batalla!** ⚔️

*¿Serás tú quien alce la victoria en el coliseo?*

</div>

