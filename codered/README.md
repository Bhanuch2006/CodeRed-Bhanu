# CodeRed 🎮

A thrilling multiplayer coding game where players are assigned roles as either **Fixers** (who try to fix bugs) or **Saboteurs** (who try to prevent fixes without getting caught).

## 🎯 Game Overview

CodeRed is a social deduction game built with Next.js and Socket.io. Players work with buggy code snippets:
- **Fixers** attempt to identify and fix bugs
- **Saboteurs** try to sabotage fixes while staying undetected
- After each round, players vote on who they think is the saboteur

## 🚀 Features

- **Real-time multiplayer** gameplay using Socket.io
- **Role assignment** system (Fixer vs Saboteur)
- **Code editor** with Monaco Editor
- **Buzzer system** for submitting code
- **Voting mechanism** to identify saboteurs
- **Live activity feed** tracking game events
- **Scoring system** with points for successful fixes/sabotages
- **Responsive design** with Tailwind CSS

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd codered
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` if needed:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## 🎮 Running the Game

### Development Mode
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
codered/
├─ app/
│  ├─ layout.tsx              # Root layout
│  ├─ page.tsx                # Landing page (Create/Join)
│  ├─ lobby/[room]/page.tsx   # Lobby screen
│  ├─ game/[room]/page.tsx    # Main game screen
│  └─ api/socket/route.ts     # Socket.io server
│
├─ components/
│  ├─ ui/                     # Reusable UI components
│  ├─ CodeEditor.tsx          # Monaco editor wrapper
│  ├─ Buzzer.tsx              # Buzzer button
│  ├─ PlayerList.tsx          # Player list UI
│  ├─ Timer.tsx               # Countdown timer
│  ├─ RoleReveal.tsx          # Role reveal modal
│  └─ ActivityFeed.tsx        # Activity log
│
├─ lib/
│  ├─ socket.ts               # Client socket instance
│  ├─ roomManager.ts          # Room management logic
│  ├─ validator.ts            # Bug validation
│  ├─ constants.ts            # Game constants & tasks
│  └─ types.ts                # TypeScript types
│
└─ styles/
   └─ globals.css             # Global styles
```

## 🎲 How to Play

1. **Create or Join a Room**
   - Host creates a room and shares the 6-digit code
   - Players join using the room code

2. **Lobby**
   - Wait for 3-8 players to join
   - Players ready up
   - Host starts the game

3. **Game Rounds**
   - Roles are assigned (Fixer or Saboteur)
   - Players see buggy code
   - **Fixers** try to fix the bug
   - **Saboteurs** try to prevent fixes or make subtle changes
   - First player to press the buzzer submits their code

4. **Voting Phase**
   - Players vote for who they suspect is the saboteur
   - Points are awarded/deducted based on success

5. **Win Condition**
   - After all rounds, the player with the highest score wins!

## 🎯 Scoring

- **Bug Fix Success** (Fixer): +100 points
- **Bug Fix Failure** (Fixer): -20 points
- **Sabotage Success** (Saboteur): +150 points
- **Sabotage Caught** (Saboteur): -50 points
- **Catch Saboteur** (Voter): +75 points
- **False Accusation** (Voter): -30 points

## 🔧 Game Settings

- **Min Players**: 3
- **Max Players**: 8
- **Default Rounds**: 5
- **Round Duration**: 180 seconds (3 minutes)
- **Saboteur Count**: 1 per 3 players

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Socket.io
- **Code Editor**: Monaco Editor
- **State Management**: React Hooks

## 📝 Adding New Bug Tasks

Edit `lib/constants.ts` and add to the `BUG_TASKS` array:

```typescript
{
  id: 'task-id',
  description: 'Description of the bug',
  language: 'javascript', // or 'python'
  code: `// Buggy code here`,
  solution: 'The correct fix',
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🎮 Future Enhancements

- [ ] Add more programming languages
- [ ] Custom room settings
- [ ] Player statistics and leaderboards
- [ ] Spectator mode
- [ ] Chat system
- [ ] Sound effects and animations
- [ ] Mobile app version

## 🐛 Known Issues

- Socket.io needs proper WebSocket configuration for production deployment
- Game state persistence not implemented (rooms are in-memory only)

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Happy Coding! May the best debugger win! 🚀**
