const express = require("express")
const app=express()
//const client= require("socket.io").listen(4000).sockets;
const client= require("socket.io")();
//const mongo = require('mongodb').MongoClient;


// mongo.connect("mongodb://127.0.0.1", function (err, db) {
//
//     if (err) {
//         throw err
//     }
//
//    const model= db.db('ChatApp')
//
//     console.log("Mongo db connected ....")
//
//
//    client.on("connection", function (socket) {
//
//         let chat=model.collection('Chat')
//
//         //Create function to send status
//         sendStatus= function(s){
//             socket.emit('status',s)
//         }
//
//         chat.find().limit(10).sort({_id:1}).toArray(function(err,res){
//
//             if(err)
//             {
//                 throw err
//             }
//
//             socket.emit('output',res)
//
//         })
//
//        socket.on('input',function(data) {
//
//            let name = data.name;
//            let message = data.message;
//
//            if (name == '' || message == '') {
//                return sendStatus("Please enter a name and a message ")
//            }
//            else{
//
//                chat.insert({name:name,message:message},function () {
//                    client.emit('output',[data])
//
//                    sendStatus({message:"Message sent",clear:true})
//                })
//
//            }
//        })
//
//
//        socket.on('clear',function(data)
//        {
//            chat.remove({}, function(){
//
//                client.emit('cleared')
//            })
//        })
//    })
//
// })



const mongoose= require('mongoose')
const Schema=mongoose.Schema;

mongoose.connect("mongodb://localhost/ChatApp",function () {
    console.log("Mongoose is connected")

    var chatSchema=new Schema({
        name:{
            type:String,
            required:true
        },
        message:{
            type:String,
            required: true
        }
    })

    var Chat=mongoose.model("Chat",chatSchema)


    const port=process.env.PORT || 4000

    const server=app.listen(port, function(){
        console.log(`App listening at port ${port}`)
    })

    client.attach(server)
    client.on("connection", function (io) {

        //Create function to send status
        sendStatus = function (s) {
            io.emit('status', s)
        }

        //find chats
        Chat.find({}).limit(100).sort({_id: 1}).then((chats) => {
            //send chats
            client.emit('output', chats)
            console.log(chats)
        }).catch((e) => {
            console.log(e.toString())
        })

        // accepting request
        
                io.on('input', async function(data){
                    let name=data.name
                    let message=data.message

                    if(name =='' || message==''){
                        return  sendStatus("Please enter a name and a message ")
                    }

                    let chat=new Chat({
                        name:data.name,
                        message:data.message
                    })

                    await chat.save().then((saved)=>{

                        console.log(saved)
                        client.emit('output',[saved])
                        sendStatus({
                            message: "Message Sent",
                            clear:true
                        })
                    }).catch((e)=>{
                        console.log(e.toString())
                    })




                })

                io.on("clear", function(data){
                    Chat.remove({}).then(()=>{
                        console.log("All chats deleted")
                        sendStatus("Data Cleared")
                        client.emit("cleared")
                    }).catch((e)=>{
                        console.log(e.toString())
                    })

                })

            })


})