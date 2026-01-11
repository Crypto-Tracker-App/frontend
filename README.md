# Crypto Tracker Frontend

A modern React-based frontend application for the Azure Crypto Tracker platform. This application provides a user-friendly interface for tracking cryptocurrency portfolios, setting price alerts, and receiving real-time notifications.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Setup](#development-setup)
- [Building for Production](#building-for-production)
- [Testing](#testing)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [API Integration](#api-integration)
- [Contributing](#contributing)

## Overview

The Crypto Tracker Frontend is part of a microservices-based cryptocurrency tracking platform deployed on Azure Kubernetes Service (AKS). It provides an intuitive interface for users to manage their crypto portfolios, monitor price changes, and receive timely alerts.

## Features

- **User Authentication**: Secure JWT-based authentication with login and registration
- **Portfolio Management**: Track multiple cryptocurrency holdings and view portfolio value
- **Price Alerts**: Set custom price alerts for cryptocurrencies
- **Real-time Notifications**: Push notifications for price alerts using Service Workers
- **Responsive Design**: Mobile-friendly interface that works across all devices
- **Protected Routes**: Role-based access control for authenticated users

## Technology Stack

- **React 19.2.0**: Modern UI library
- **Vite 7.2.4**: Fast build tool and development server
- **React Router DOM 7.11.0**: Client-side routing
- **Nginx**: Production web server
- **Docker**: Containerization
- **Vitest**: Unit testing framework
- **Service Workers**: Push notification support

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js**: Version 20.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Docker**: (Optional) For containerized deployment
- **kubectl**: (Optional) For Kubernetes deployment

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Crypto-Tracker-App/frontend.git
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm ci
   ```

## Development Setup

### Local Development

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser**:
   Navigate to `http://localhost:5173` (default Vite port)

3. **Configure API endpoint**:
   Edit `public/config.js` to point to your local backend:
   ```javascript
   window.__APP_CONFIG__ = {
     API_BASE_URL: 'http://localhost:8000',  // Your local backend URL
     VAPID_PUBLIC_KEY: 'your_vapid_public_key_here',
   };
   ```

### Environment-Specific Configuration

The application uses runtime configuration that can be modified without rebuilding:

- **Development**: Edit `public/config.js` directly
- **Production**: Configuration is injected via Kubernetes ConfigMap

## Building for Production

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Preview the production build locally**:
   ```bash
   npm run preview
   ```

The build output will be in the `dist/` directory.

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

Run linting:

```bash
npm run lint
```

## Docker Deployment

### Build Docker Image

```bash
docker build -t cryptotracker.azurecr.io/frontend:latest .
```

### Run Locally with Docker

```bash
docker run -p 8080:80 cryptotracker.azurecr.io/frontend:latest
```

Access the application at `http://localhost:8080`

### Push to Azure Container Registry

```bash
# Login to ACR
az acr login --name cryptotracker

# Push the image
docker push cryptotracker.azurecr.io/frontend:latest
```

## Kubernetes Deployment

The application is deployed on Azure Kubernetes Service (AKS) in the `norwayeast` region.

### Prerequisites for Kubernetes Deployment

- Azure CLI installed and logged in
- kubectl configured to connect to the AKS cluster

### Connect to AKS Cluster

```bash
az aks get-credentials --resource-group crypto-tracker --name crypto-tracker
```

### Apply Kubernetes Manifests

Assuming you have Kubernetes manifests in a `k8s/` directory:

```bash
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/frontend-configmap.yaml
```

### Verify Deployment

```bash
kubectl get pods -n default
kubectl get services -n default
kubectl logs -f deployment/frontend
```

## Project Structure

```
frontend/
├── public/               # Static assets
│   ├── config.js        # Runtime configuration (replaced by ConfigMap in prod)
│   └── sw.js            # Service Worker for push notifications
├── src/
│   ├── assets/          # Styles and static resources
│   │   └── styles/      # CSS files
│   ├── components/      # Reusable React components
│   │   └── ProtectedRoute.jsx
│   ├── config/          # Configuration loader
│   │   └── index.js
│   ├── context/         # React Context providers
│   │   └── AuthContext.jsx
│   ├── pages/           # Page components
│   │   ├── Alerts.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Portfolio.jsx
│   │   └── Register.jsx
│   ├── services/        # API service layer
│   │   ├── alertService.js
│   │   ├── authService.js
│   │   ├── coinService.js
│   │   ├── notificationService.js
│   │   └── portfolioService.js
│   ├── test/            # Test files
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Application entry point
├── Dockerfile           # Multi-stage Docker build
├── nginx.conf           # Nginx configuration for production
├── package.json         # NPM dependencies and scripts
├── vite.config.js       # Vite configuration
├── vitest.config.js     # Vitest test configuration
└── README.md            # This file
```

## Configuration

### Runtime Configuration (`public/config.js`)

The application uses runtime configuration that can be updated without rebuilding:

```javascript
window.__APP_CONFIG__ = {
  API_BASE_URL: 'http://your-api-url',
  VAPID_PUBLIC_KEY: 'your_vapid_public_key_here',
};
```

### Kubernetes ConfigMap

In production, this file is replaced by a Kubernetes ConfigMap:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
data:
  config.js: |
    window.__APP_CONFIG__ = {
      API_BASE_URL: 'http://20.251.246.218',
      VAPID_PUBLIC_KEY: 'production_key_here',
    };
```

Mount this ConfigMap to `/usr/share/nginx/html/config.js` in your deployment.

## API Integration

The frontend communicates with the following backend microservices:

- **Authentication Service**: User login, registration, and JWT management
- **Portfolio Service**: Manage cryptocurrency holdings
- **Alert Service**: Create and manage price alerts
- **Coin Service**: Fetch cryptocurrency data and prices
- **Notification Service**: Handle push notifications

All services use JWT authentication. The JWT token is stored in memory and passed in request headers.

### Service Files

- `authService.js`: Handles authentication operations
- `portfolioService.js`: Portfolio CRUD operations
- `alertService.js`: Alert management
- `coinService.js`: Cryptocurrency data fetching
- `notificationService.js`: Push notification subscription

## Contributing

### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. **Push to remote**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request** on GitHub

### Code Style Guidelines

- Use functional React components with hooks
- Follow ESLint rules (run `npm run lint`)
- Write tests for new features
- Keep components small and focused
- Use meaningful variable and function names
- Document complex logic with comments

### Testing Guidelines

- Write unit tests for all new components
- Test user interactions and edge cases
- Maintain test coverage above 80%
- Use `@testing-library/react` for component testing

## Troubleshooting

### Common Issues

**Issue**: `npm ci` fails with dependency errors
- **Solution**: Delete `node_modules/` and `package-lock.json`, then run `npm install`

**Issue**: Development server won't start
- **Solution**: Check if port 5173 is already in use, or specify a different port in `vite.config.js`

**Issue**: API calls return CORS errors
- **Solution**: Ensure your backend CORS configuration allows requests from your frontend origin

**Issue**: Service Worker not registering
- **Solution**: Service Workers require HTTPS in production. Ensure your deployment uses HTTPS.

**Issue**: Docker build fails
- **Solution**: Ensure you have enough disk space and Docker daemon is running

## Azure Resources

- **Resource Group**: crypto-tracker
- **AKS Cluster**: crypto-tracker
- **Container Registry**: cryptotracker.azurecr.io
- **Region**: norwayeast
- **Namespace**: default