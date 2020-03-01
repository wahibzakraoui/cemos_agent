// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const path = require('path')
const Swal = require('sweetalert2')
const ipc = require('electron').ipcRenderer
const {app} = require('electron').remote
import {pad, getPorts, fs, reloadPrefs} from './modules/utils.js'
const SerialPort = require('serialport')
const Delimiter = require('@serialport/parser-delimiter')

let prefs = {};

var prefsPath = path.join(app.getPath('userData'), 'data.json')

var prefsJSON = JSON.stringify({
  serial: {
    COMin: "COM3",
    COMout: "COM4"
  }
});

let COMin, COMout;

document.addEventListener('DOMContentLoaded', function() {

  $('.brand-logo').text("CEMOS AGENT "+app.getVersion());

  // usage
  fs.writeFileIfNotExist(prefsPath, prefsJSON, function(err, existed) {
    if (err) {
        console.error("Error handling preferences file.");
    } else {
        // data was written or file already existed
        // existed flag tells you which case it was
        prefs = reloadPrefs(prefsPath);
        console.log(prefs);
    }
  });

  prefs = reloadPrefs(prefsPath);
  COMin = prefs.serial.COMin;
  COMout = prefs.serial.COMout;

  console.log('Prefs Path', prefsPath);
  console.log('Prefs String', prefs);
  console.log('Listening on serial ports ', COMin, COMout);

  // in port
  const portin = new SerialPort(COMin)
  const parserin = portin.pipe(new Delimiter({ delimiter: '\r' }))
  // out port
  const portout = new SerialPort(COMout)
  const parserout = portout.pipe(new Delimiter({ delimiter: '\r' }))
  let comPorts;
  const debugMode = true;

  getPorts();

  parserin.on('data', function (data) {
    data = data.toString();
    console.log(COMin, " ", data);
    var sign = data.substring(0, 2); 
    var weight = parseFloat(data.substring(5, 12)); 
    var displayOne = new SegmentDisplay("displayOne");
    displayOne.pattern         = "######";
    displayOne.displayAngle    = 6;
    displayOne.digitHeight     = 20;
    displayOne.digitWidth      = 14;
    displayOne.digitDistance   = 2.5;
    displayOne.segmentWidth    = 2;
    displayOne.segmentDistance = 0.3;
    displayOne.segmentCount    = 7;
    displayOne.cornerType      = 3;
    displayOne.colorOn         = "#24dd22";
    displayOne.colorOff        =  "#1e2228";
    displayOne.setValue(pad(weight, 6));
    displayOne.draw();
    ipc.send('update-in-weight', weight);
  });

  parserout.on('data', function (dataout) {
    dataout = dataout.toString();
    console.log(COMout, " ", dataout);
    var sign = dataout.substring(0, 2); 
    var weightout = parseFloat(dataout.substring(5, 12));
    var displayTwo = new SegmentDisplay("displayTwo");
    displayTwo.pattern         = "######";
    displayTwo.displayAngle    = 6;
    displayTwo.digitHeight     = 20;
    displayTwo.digitWidth      = 14;
    displayTwo.digitDistance   = 2.5;
    displayTwo.segmentWidth    = 2;
    displayTwo.segmentDistance = 0.3;
    displayTwo.segmentCount    = 7;
    displayTwo.cornerType      = 3;
    displayTwo.colorOn         = "#e91e63";
    displayTwo.colorOff        = "#1e2228";
    displayTwo.setValue(pad(weightout, 6));
    displayTwo.draw();
    ipc.send('update-out-weight', weightout);
  });
});


ipc.on('update_available', () => {
  Swal.fire(
    'Telecharger mise a jour?',
    'Une nouvelle version de CEMOS AGENT est disponible.',
    'question'
  )
});

ipc.on('update_downloaded', () => {
  Swal.fire({
    title: 'Mettre a jour maintenant?',
    text: "Merci de mettre a jour l'applicatiopn pour eviter tout probleme!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Oui, mettre a jour!'
  }).then((result) => {
    if (result.value) {
      ipc.send('update-app', {});
    }
  })
});