export function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

// get list of serial ports
export async function getPorts(){
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