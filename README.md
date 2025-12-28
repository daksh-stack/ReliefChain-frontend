# ReliefChain Frontend

Disaster Relief Distribution Tracker - Frontend Application

## Tech Stack

- **React 19** with Vite
- **Socket.io** for real-time updates
- **Axios** for API communication

## Local Development

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start dev server
npm run dev
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Backend WebSocket URL | `http://localhost:5000` |

## Deploy to Vercel

### Option 1: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository: `daksh-stack/ReliefChain-frontend`
4. Configure environment variables:
   - `VITE_API_URL` = `https://your-render-backend.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://your-render-backend.onrender.com`
5. Click "Deploy"

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_API_URL
vercel env add VITE_SOCKET_URL
```

## Production Build

```bash
npm run build
npm run preview
```
