const express = require('express');

const genServer = (serverName, port, rootHTML) => {
  const app = express();
  app.use(express.static('public'));
  app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/${rootHTML}`);
  });
  const listener = app.listen(port, function() {
    const myPort = listener.address().port;
    console.log(`${serverName} is listening on port ${myPort}: https://localhost:${myPort}`);
  });
};

/** A simple server hosting an article page and a podcast page
 * in a differen port (=simulating cross domain situation). */
genServer('📝 Portalog', 3000, 'view/portalog.html');
genServer('🎧 TTT Archive', 3001, 'view/ttt.html');