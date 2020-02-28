// Modules to control application life and create native browser window
const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron')
const path = require('path')
var url = require('url')
var iconpath = path.join(__dirname, 'icon.ico')
const Store = require('./modules/store.js');

const gotTheLock = app.requestSingleInstanceLock();

let mainWindow;
let http;
let tray;

let inWeight = 0.00;
let outWeight = 0.00;

let myTray = [
  {
    label: 'Stop Server', click: function () {
      stopServer();
    }
  },
  {
    label: 'Show', click: function () {
      mainWindow.show();
    }
  },
  {
    label: 'Minimize', click: function () {
      mainWindow.hide();
    }
  },
  {
    label: 'Quit', click: function () {
      isQuiting = true;
      app.quit();
    }
  }
]

// try to get a single instance
if (!gotTheLock) {
  app.quit()
} else {
  // app is already running
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  });

  app.on('ready', function () {
    createWindow();
    mainWindow.hide();
    var app = require('express')();
    var cors = require('cors')
    app.use(cors())
    http = require('http').createServer(app);
    var moment = require('moment');

    app.get('/', function (req, res) {
      res.json(
        {
          in_weight: inWeight,
          out_weight: outWeight,
          date: moment().format(),
          timestamp: moment().valueOf()
        });
    });

    http.listen(3000, function () {
      console.log('listening on *:3000');
    });

  });
}

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})


app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.on('update-in-weight', function (event, weight) {
  inWeight = weight;
})

ipcMain.on('update-out-weight', function (event, weight) {
  outWeight = weight;
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
function createWindow() {
  // create tray icon first
  tray = new Tray(path.join(__dirname, 'icon.ico'));
  tray.setContextMenu(Menu.buildFromTemplate(myTray));

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    resizable: false,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    icon: iconpath
  })

  //remove Menu
  mainWindow.setMenu(null)
  // handle window events
  mainWindow.on('minimize', function (event) {
    event.preventDefault();
    mainWindow.hide();
  });
  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()
}

function stopServer() {
  myTray[0] = {
    label: 'Start Server', click: function () {
      startServer();
    }
  };
  if (http.close()) {
    tray.setContextMenu(Menu.buildFromTemplate(myTray));
    tray.setImage(path.join(__dirname, 'icon-offline.ico'));
  }
}

function startServer() {
  myTray[0] = {
    label: 'Stop Server', click: function () {
      stopServer();
    }
  };
  http.listen(3000, function () {
    console.log('listening on *:3000');
    tray.setImage(path.join(__dirname, 'icon.ico'));
  });
  tray.setContextMenu(Menu.buildFromTemplate(myTray));
}