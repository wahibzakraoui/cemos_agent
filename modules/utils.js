const fs = require('fs')
const path = require('path')

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

// get list of serial ports
async function getPorts(){
    const SerialPort = require('serialport')
    try{
      const ports = await SerialPort.list();
      console.log(ports);
      $('.selectCom').empty();
      $.each(ports, function(i, p) {
          $('.selectCom').append($('<option></option>').val(p.path).html(p.path));
      });
      var elems = document.querySelectorAll('select');
      var instances = M.FormSelect.init(elems, {});
    }catch(e){
      console.log(e);
    }
  }


function reloadPrefs(prefsPath){
  var prefs = fs.readFileSync(prefsPath);
  prefs = prefs.toString();
  prefs = JSON.parse(prefs);
  return prefs;
}

fs.writeFileIfNotExist = function(fname, contents, options, callback) {
  if (typeof options === "function") {
      // it appears that it was called without the options argument
      callback = options;
      options = {};
  }
  options = options || {};
  // force wx flag so file will be created only if it does not already exist
  options.flag = 'wx';
  fs.writeFile(fname, contents, options, function(err) {
      var existed = false;
      if (err && err.code === 'EEXIST') {
         // This just means the file already existed.  We
         // will not treat that as an error, so kill the error code
         err = null;
         existed = true;
      }
      if (typeof callback === "function") {
         callback(err, existed);
      }
  });
}

export {pad, reloadPrefs, fs, getPorts}