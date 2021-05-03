const http = require('http');
const path = require('path');
const fs   = require('fs');
const axios = require('axios');

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
const url = "http://omnicode.tech/wego/dev"; 
// const url = "http://localhost/weGO";

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

    //////////Wego emits/listeners here
    socket.on("hello_connect",()=>{
        console.log('Hello from client.');
        socket.broadcast.emit('server_emit','server_emit:: response from server');
      });

      socket.on('user_connected',function(user_id){
        console.log('user connected id : '+user_id);
        socket.emit('received');
    })

    socket.on('mobile_event',function(user_id){
        console.log('Mobile Event Received with user_id : '+user_id);
        socket.emit('mobile_event_received','Mobile Event Received successfully.');
    })

    socket.on('add_ride',function(data){
        let obj = JSON.parse(data);

        console.log('add_ride Data : ',obj);
        var options = {
            headers: {
                'User-Agent': 'axios'
            }
        };
        //make Axios call to add new ride
        axios.post(url+"/api/add_new_ride",obj)
        .then(response=>{
          console.log('response:',response.data.data.ride);
          socket.broadcast.emit('new_ride_created',JSON.stringify({
            ride:response.data.data.ride,
          }));
        })
        .catch(err=>{
          console.log('error:',err);
        })
    })//add ride listener

    socket.on('new_location',function(data){
      //this will provide user_id, lat, long
        let obj = JSON.parse(data);
        console.log('new_location Data : ',obj);
        var options = {
            headers: {
                'User-Agent': 'axios'
            }
        };
        //make Axios call to add new ride
        axios.post(url+"/api/update_user_location",obj)
        .then(response=>{
          console.log('update_user_location response:');
          socket.broadcast.emit('location_updated','Location updated successfully');
        })
        .catch(err=>{
          console.log('error:',err);
        })
    })//new_location listener
})
//Socket io code

const PORT = process.env.PORT || 3000 ;

server.listen(PORT , console.log(`server runing on ${PORT}`));






