# Hydra Server Deployment to Render

This document outlines the steps needed to deploy the Hydra server application to Render for remote access.

## Current Server Configuration Analysis

The current server (`backend/server.js`) has the following configuration:

```javascript
var httpsPort = process.env.HTTPS_PORT !== undefined ? process.env.HTTPS_PORT : 8000
server.listen(httpsPort, function () {
  console.log(`server available at http://localhost:${httpsPort}`)
})
```

This configuration needs to be updated to work with Render's environment variables.

## Required Changes

### 1. Update Server Port Configuration

The server needs to be updated to use Render's PORT environment variable. Modify `backend/server.js` to include:

```javascript
// Use Render's PORT environment variable, or HTTPS_PORT, or default to 8000
var port = process.env.PORT || process.env.HTTPS_PORT || 8000;
server.listen(port, function () {
  console.log(`server available at http://localhost:${port}`)
})
```

### 2. Create Render Configuration File

Create a `render.yaml` file in the root directory with the following content:

```yaml
services:
  - type: web
    name: hydra-server
    env: node
    buildCommand: yarn install
    startCommand: yarn serve
    envVars:
      - key: NODE_VERSION
        value: 16
```

### 3. Update Package.json Scripts (Optional)

Ensure the root `package.json` has the correct scripts for deployment:

```json
{
  "scripts": {
    "serve": "yarn --cwd backend start",
    "build:editor": "yarn --cwd frontend/web-editor build",
    "watch:editor": "yarn --cwd frontend/web-editor watch",
    "build:api": "yarn --cwd frontend/hydra-functions build",
    "dev": "yarn watch:editor & yarn serve",
    "start": "yarn serve"
  }
}
```

## Deployment Steps

1. Make the server port configuration change in `backend/server.js`
2. Create the `render.yaml` file in the root directory
3. Commit all changes to your repository
4. Connect your repository to Render
5. Deploy the service

## Testing Locally

Before deploying, test the changes locally:

1. Set the PORT environment variable:
   ```bash
   export PORT=3000
   ```

2. Run the server:
   ```bash
   yarn serve
   ```

3. Access the application at http://localhost:3000

## Render Deployment Configuration

When setting up on Render, use these settings:

- Build Command: `yarn install`
- Start Command: `yarn serve`
- Environment Variables:
  - NODE_VERSION: 16 (or appropriate version)

## Additional Considerations

1. Ensure all static assets are properly served
2. Check WebSocket connections work through Render's infrastructure
3. Verify CORS settings are appropriate for remote access
4. Consider adding health check endpoints if needed