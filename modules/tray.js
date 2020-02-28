export let myTray = [
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