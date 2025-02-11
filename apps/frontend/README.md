# NXT Chess

## Frontend - SolidJS, TypeScript, Chess Web App

### 🛠️ Getting Started

### Prerequisites

- **Node.js** (>v16)
- **yarn**

### Frontend

#### Local Frontend:

1. Clone this repository:

```bash
git clone https://github.com/tmcarmichael/nxtchess.git
```

2. Navigate to the project directory:

```bash
cd nxtchess
```

3. Navigate to the frontend:

```bash
cd apps/frontend
```

4. Install dependencies:

```bash
yarn install
```

5. Start the development server:

```bash
yarn dev
```

6. Open your browser and navigate to the localhost port suggested by Vite, such as, http://localhost:5173/

#### Local Docker Frontend:

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

...

For more info, see the main README: [https://github.com/tmcarmichael/nxtchess/blob/main/README.md](https://github.com/tmcarmichael/nxtchess/blob/main/README.md)
