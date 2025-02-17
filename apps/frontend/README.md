# NXT Chess

## Frontend - TypeScript, SolidJS

### 🛠️ Getting Started

See [primary README](https://github.com/tmcarmichael/nxtchess/blob/main/README.md)

---

### Frontend Dev Steps

#### Local Frontend:

1. Install dependencies:

```bash
yarn install
```

2. Start the development server:

```bash
yarn dev
```

3. Open your browser and navigate to the localhost port suggested by Vite, such as, http://localhost:5173/

---

#### Docker Frontend:

1. Download Docker desktop for Docker and Docker Compose. Or ensure you have both installed. https://www.docker.com/products/docker-desktop/.

2. Navigate to the frontend:

```bash
cd apps/frontend
```

3. Build local container:

```bash
yarn docker:dev:build
```

3. Spin up local container:

```bash
yarn docker:dev:run
```

4. Access container at localhost, http://localhost/

5. Alternatively, use Docker Desktop and look for image 'nxtchess-frontend-dev', click "open in browser".

---

For full project info see main README: [https://github.com/tmcarmichael/nxtchess/blob/main/README.md](https://github.com/tmcarmichael/nxtchess/blob/main/README.md)
