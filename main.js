const { spawn } = require("child_process");
const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");


const isDev = process.env.NODE_ENV === "development";
let backendProcess;

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    title: "Kusum Medical RMS",
    width: 1920,
    height: 1080,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
    },
  });

  const indexPath = isDev
    ? "http://localhost:3000"
    : `file://${path.join(app.getAppPath(), "frontend", "out", "index.html")}`;

  mainWindow.loadURL(indexPath).catch((err) => {
    console.error("Failed to load frontend:", err);
  }); 
};

const startBackend = () => {
  if (isDev) {
    console.log("Backend is assumed to be running in development mode...");
  } else {
    console.log("Starting backend in production mode...");

    // Adjust path to match the new location
    const nodePath = path.join(process.resourcesPath, "node.exe"); // This should now point correctly
    const backendPath = path.join(process.resourcesPath, "backend", "dist", "index.js");

    console.log(`Node path: ${nodePath}`);
    console.log(`Backend path: ${backendPath}`);

    // Check if Node executable exists
    if (fs.existsSync(nodePath)) {
      backendProcess = spawn(nodePath, [backendPath]);

      backendProcess.on("error", (err) => {
        console.error("Failed to start backend process:", err);
      });

      backendProcess.stdout.on("data", (data) => {
        console.log(`Backend stdout: ${data}`);
      });

      backendProcess.stderr.on("data", (data) => {
        console.error(`Backend stderr: ${data}`);
      });

      backendProcess.on("exit", (code) => {
        console.log(`Backend process exited with code ${code}`);
      });
    } else {
      console.error("Node.js binary not found at:", nodePath);
    }
  }
};

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Graceful shutdown on SIGTERM
process.on("SIGTERM", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  app.quit();
});
