//take raw data
//process it 
//send it to the client

import type { message } from "../models/message.js";

let messages:message[]=[]

export const createMessage=(data:Partial<message>):message=>{
    if (!data.chatId || !data.senderId || !data.content){
        throw new Error("Missing required fields")
    }
    const newMessage:message={
        id:crypto.randomUUID(),
        chatId:data.chatId!,
        senderId:data.senderId!,
        content:data.content!,
        timestamp:Date.now(),
        status:"SENT"
    }
    messages.push(newMessage)

    // console.log(messages)

    return newMessage
}


export const getMessagesByChat = (chatId: string): message[] => {
  return messages.filter((msg) => msg.chatId===chatId);
};





