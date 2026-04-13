# Electron Licensing Integration Guide

This guide explains how to connect your Electron POS client (`KINETIC_POS`) to the licensing backend safely and securely.

## 1. Retrieve a Unique Device ID
You should use a consistent hardware identifier. A common library for this is `node-machine-id`. In your Electron main process or preload script:

```javascript
// Install: npm install node-machine-id
const { machineIdSync } = require('node-machine-id');

// Get unique ID for this machine
const deviceId = machineIdSync();
```

## 2. API Communication (Preload Script)
Expose the licensing functions to your React frontend via `contextBridge` in `electron/preload.js`.

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('licenseAPI', {
  activate: (licenseKey, deviceId) => 
    fetch('https://your-backend-url.com/api/license/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, deviceId })
    }).then(res => res.json()),

  validate: (licenseKey, deviceId) =>
    fetch('https://your-backend-url.com/api/license/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, deviceId })
    }).then(res => res.json())
});
```

## 3. Best Practices for Security
- **Secure Persistence**: Store the `license_key` and current `activation_status` locally in a secure way (e.g., using `electron-store` with encryption or a local SQLite DB).
- **Periodic Validation**: Don't just validate on startup. Perform a background validation every 24-48 hours to check if the license has been revoked or expired.
- **Grace Period**: If the backend is unreachable, allow a "grace period" (e.g., 7 days) if the license was recently validated, so the POS remains functional during internet outages.

## 4. Example Activation Flow (React)
In your `login-screen.tsx`:

```tsx
const handleActivate = async () => {
  setIsLoading(true);
  try {
    const deviceId = await window.electron.getMachineId(); // via preload
    const result = await window.licenseAPI.activate(inputKey, deviceId);
    
    if (result.success) {
      toast.success("License activated!");
      // Proceed to login
    } else {
      toast.error(result.error);
    }
  } catch (err) {
    toast.error("Network error");
  } finally {
    setIsLoading(false);
  }
};
```
