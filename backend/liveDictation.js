const { randomBytes } = require('node:crypto');
const { WebSocket, WebSocketServer } = require('ws');
const tickets = new Map();

exports.issue = (language, release) => {
  const id = randomBytes(32).toString('hex');
  const timeout = setTimeout(() => { tickets.delete(id); release(); }, 15000);
  tickets.set(id, {language, release, timeout});
  return id;
};

exports.attach = server => {
  const wsServer = new WebSocketServer({noServer:true, maxPayload:65536});
  server.on('upgrade', (req,socket,head) => {
    const path = /^\/api\/transcription\/live\/([0-9a-f]{64})$/.exec(req.url);
    const ticket = path && tickets.get(path[1]);
    if (!ticket) return socket.destroy();
    tickets.delete(path[1]);
    clearTimeout(ticket.timeout);
    socket.once('close',ticket.release);
    wsServer.handleUpgrade(req,socket,head,client => {
      const region = process.env.DEEPGRAM_REGION || 'eu';
      const host = region === 'global' ? 'api.deepgram.com' : 'api.eu.deepgram.com';
      const query = new URLSearchParams({model:'nova-3', language:ticket.language,
        interim_results:'true', punctuate:'true',endpointing:'300'});
      const upstream = new WebSocket('wss://' + host + '/v1/listen?' + query,
        {headers:{Authorization:'Token '+process.env.DEEPGRAM_API_KEY},handshakeTimeout:6000});
      let bytes=0, closing=false;
      const shutdown = () => { if(client.readyState===WebSocket.OPEN)client.close(1011); };
      const timeout=setTimeout(shutdown,70000);
      client.on('error',shutdown);
      client.on('close',()=>{clearTimeout(timeout);upstream.terminate();});
      upstream.on('error',shutdown);
      upstream.on('open',()=>{if(client.readyState===WebSocket.OPEN)client.send('{"type":"ready"}');});
      client.on('message',(data,binary)=>{
        if(closing || upstream.readyState!==WebSocket.OPEN)return shutdown();
        if(binary && (bytes+=data.length)<=1000000)upstream.send(data);
        else if(!binary && data.toString()==='finish'){closing=true;upstream.send('{"type":"CloseStream"}');}
        else shutdown();
      });
      upstream.on('message',data=>{
        if(client.readyState!==WebSocket.OPEN)return;
        const event=JSON.parse(data);
        if(event.type==='Results')client.send(JSON.stringify(event));
      });
      upstream.on('close',code=>{
        if(client.readyState===WebSocket.OPEN)client.close(closing && code===1000?1000:1011);
      });
    });
  });
};
