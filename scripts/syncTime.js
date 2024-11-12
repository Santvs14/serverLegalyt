// syncTime.js
const { exec } = require('child_process');

// Función para sincronizar la hora
const syncTime = () => {
    exec('sudo ntpdate -u pool.ntp.org', (err, stdout, stderr) => {
        if (err) {
            console.error(`Error sincronizando el tiempo: ${err}`);
            return;
        }
        console.log(`Hora sincronizada: ${stdout}`);
    });
};

// Exportar la función
module.exports = syncTime;
