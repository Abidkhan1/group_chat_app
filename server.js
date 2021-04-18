const http = require('http');
const path = require('path');
const fs   = require('fs');

const server = http.createServer((req, res)=>{


    // let filePath = path.join(__dirname,'public','index.html')

         let filePath = path.join(
          __dirname,
          'public',
          req.url === '/' ? 'index.html' : req.url
           )
        
         let extname = path.extname(filePath);

         let contentType = 'text/html';

         switch (extname) {
            case '.js' :
                contentType='text/javascript'
                break;
            case '.css':
                contentType='text/css'
                break;
            case '.json':
                contentType='application/json'
                break;
            case '.png':
                contentType='image/png'
                break;
            case '.jpg':
                contentType='image/jpg'
                break;
         }

         fs.readFile(filePath, (err,content)=>{
             if(err){
                if(err.code === 'ENOENT'){
                  console.log('filePath:',filePath)
                    console.log(err.code);
                    //page not found load 404
                    fs.readFile(path.join(__dirname,'public','404.html'), (err, content)=>{
                      if(err) throw err;
                        res.writeHead(200, {'Content-Type' : 'text/html'})
                        res.end(content);
                      })
                }else{
                    // some server error
                    res.writeHead(500);
                    res.end(`Server Error ${err.code}`);
                }
             }else{
                 //success
                 res.writeHead(200, {'Content-Type':contentType});
                 res.end(content,'UTF8');
             }
         })
});


//Socket Io code 
const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });

const users = {}

io.on('connection', socket=>{
    socket.on('new-user',name=>{
        users[socket.id] = name
        socket.broadcast.emit('user-connected',name)
    })

    socket.on('send-chat-message',message=>{
        console.log('message:',message)
        socket.broadcast.emit('chat-message',{message:message, name:users[socket.id]})
    })

    socket.on('disconnect',()=>{
        socket.broadcast.emit('user-disconnected',users[socket.id])
        delete users[socket.id]
    })
})
//Socket io code

const PORT = process.env.PORT || 3000 ;

server.listen(PORT , console.log(`server runing on ${PORT}`));






