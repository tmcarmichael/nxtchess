# Next Generation Chess 'nxtchess' (Inspiration from Lichess.org)

12/30/24:
The initial steps of building a **high-performance multiplayer chess platform**. This project is inspired by **Lichess.org**, aiming to provide a **free-to-play**, **ad-free** chess experience. The platform will focus on delivering exceptional performance, intuitive gameplay, and scalability for real-time multiplayer interactions.

## 🚀 Vision

The long-term goal is to create a **community-driven chess platform** that prioritizes:

- **Accessibility**: Free for everyone, forever.
- **Performance**: A seamless experience, even on low-end devices.
- **Transparency**: Open-source with no ads or paywalls.
- **Fair Play**: Incorporating anti-cheat mechanisms to ensure a fair environment for players of all skill levels.

This project is currently in its **early stages**, focusing on the frontend. Future iterations will include multiplayer capabilities, accounts, database of games, game analysis tools, and experimental AI integrations.

---

## 💻 Tech Stack

### Frontend: **SolidJS**

The frontend is built with **SolidJS**, a modern JavaScript library known for its **fine-grained reactivity** and **high performance**. Why was **SolidJS** chosen?

1. **Fine-Grained Reactivity**:

   - Unlike traditional virtual DOM-based libraries (e.g., React), SolidJS updates the DOM precisely where changes occur.
   - This granular approach minimizes unnecessary renders and improves performance, especially for highly interactive interfaces like a chessboard.

2. **Minimal Overhead**:

   - SolidJS compiles components into lightweight, efficient JavaScript code. There's no runtime virtual DOM diffing, which makes the app faster and more memory-efficient.

3. **Scalability**:

   - The reactive core of SolidJS allows the app to scale seamlessly without introducing complexity. This will be critical as we implement multiplayer features, live spectating, and analysis tools.

### Styling

- **CSS Modules** are used for scoped, maintainable styling, ensuring that each component has its own isolated styles.
- The chessboard design is minimalistic, with clean visuals optimized for both desktop and mobile experiences.

---

## 📜 Roadmap

What’s planned?

### Phase 1: Core Gameplay

- [x] Chessboard rendering.
- [x] Responsive design.
- [ ] Implement full chess rules (move validation, checkmate detection, etc.).
- [ ] Add drag-and-drop functionality for intuitive piece movement.
- [ ] Highlight squares for legal moves when clicking pieces.

### Phase 2: Multiplayer 1

- [ ] Account creation and sign in.
- [ ] Database for accounts, played games, rating system and more.
- [ ] Caching layer for database.
- [ ] Integrate WebSocket-based real-time communication for multiplayer gameplay.

### Phase 3: Multiplayer 2

- [ ] Spectator mode for watching live games.
- [ ] Rating system and matchmaking.

### Phase 4: AI and Analysis

- [ ] Integrate an AI engine (e.g., Stockfish) for single-player games and post-game analysis.
- [ ] Allow users to explore opening libraries and endgames.

### Phase 5: Community Features

- [ ] Tournament system.
- [ ] Player profiles and statistics.
- [ ] Anti-cheat mechanisms.

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** (v16 or later)
- **npm** (v7 or later)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/tmcarmichael/nxtchess.git
   ```
2. Navigate to the project directory:
   ```bash
   cd nxtchess
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to the localhost port suggested by Vite, such as:
   ```
   Local:   http://localhost:5173/
   ```

---

## 🤝 Contributing

Contributions welcome!

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b my-new-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add some feature"
   ```
4. Push to the branch:
   ```bash
   git push origin my-new-feature
   ```
5. Open a pull request.

---

## 🌟 Acknowledgments

This project is inspired by the work of **Lichess.org**, a community-driven chess platform that sets the standard for free, ad-free, and open-source chess experiences.

---

## 📧 Contact

For inquiries, suggestions, or feedback, feel free to reach out:

- Email: ThomasCarmichael@pm.me
- GitHub Issues: [Submit an Issue](https://github.com/tmcarmichael/nxtchess/issues)
