# Hydra Server Deployment to Render

This document outlines the steps needed to deploy the Hydra server application to Render for remote access.

## Current Server Configuration Analysis

The current server (`backend/server.js`) has been updated to use Render's PORT environment variable:

```javascript
// Use Render's PORT environment variable, or HTTPS_PORT, or default to 8000
var port = process.env.PORT || process.env.HTTPS_PORT || 8000;
server.listen(port, function () {
  console.log(`server available at http://localhost:${port}`)
})
```

## Required Changes Summary

### 1. Server Port Configuration (Completed)
The server has been updated to use Render's PORT environment variable.

### 2. Render Configuration File (Completed)
Created a `render.yaml` file in the root directory with the following content:

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

### 3. Package.json Scripts
The root `package.json` already has the correct scripts for deployment:

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

1. All required code changes have been implemented
2. The `render.yaml` file has been created in the root directory
3. Commit all changes to your repository
4. Connect your repository to Render
5. Deploy the service

## Testing Locally

Before deploying, you can test the changes locally:

1. Set the PORT environment variable:
   ```bash
   export PORT=3000
   ```

2. Run the server:
   ```bash
   yarn serve
   ```

3. Access the application at http://localhost:3000

Note: If you're using Node.js v24+, you may encounter compatibility issues with the nedb package which uses deprecated APIs. For deployment to Render, this won't be an issue as we've specified Node.js version 16 in the render.yaml file.

If you need to test locally with Node.js v24+, you can either:
- Use a Node.js version manager like nvm to switch to Node.js 16
- Or update the nedb package to a more recent version that's compatible with newer Node.js versions

## Render Deployment Configuration

When setting up on Render, use these settings:

- Build Command: `yarn install`
- Start Command: `yarn serve`
- Environment Variables:
  - NODE_VERSION: 16 (as specified in render.yaml)

## Additional Considerations

1. Ensure all static assets are properly served
2. Check WebSocket connections work through Render's infrastructure
3. Verify CORS settings are appropriate for remote access
4. Consider adding health check endpoints if needed