const net = require('net');
const { spawn } = require('child_process');
const os = require('os');
const ffmpeg = 'c:/led_server/backend/node_modules/ffmpeg-static/ffmpeg.exe';

const scanLocalSubnetForRtsp = () => new Promise((resolve) => {
  const ifaces = os.networkInterfaces();
  const subnets = [];
  for (const [name, addrs] of Object.entries(ifaces)) {
    for (const a of addrs) {
      if (a.family === 'IPv4' && !a.internal && a.address.startsWith('192.168.')) {
        const parts = a.address.split('.');
        subnets.push(`${parts[0]}.${parts[1]}.${parts[2]}`);
      }
    }
  }

  const found = [];
  let pending = 0;
  for (const prefix of subnets) {
    for (let i = 1; i <= 254; i++) {
      pending++;
      const ip = `${prefix}.${i}`;
      const c = net.createConnection({ host: ip, port: 554, timeout: 350 }, () => {
        found.push(ip);
        c.end();
      });
      c.on('error', () => {});
      c.on('timeout', () => c.destroy());
      c.on('close', () => {
        pending--;
        if (pending === 0) resolve(found);
      });
    }
  }
  setTimeout(() => resolve(found), 2500);
});

(async () => {
  console.log('Testing scanLocalSubnetForRtsp...');
  const found = await scanLocalSubnetForRtsp();
  console.log('Found cameras:', found);
})();
