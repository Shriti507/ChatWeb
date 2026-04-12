import { type Request, type Response } from "express";
import { createMessage, getMessagesByChat } from "../services/messageService.js";

export const sendMessage = (req: Request, res: Response) => {
  const message = createMessage(req.body);
  res.json(message);
};

export const getMessages = (req: Request, res: Response) => {
  const chatId=req.params.chatId as string;
  const messages = getMessagesByChat(chatId);
  res.json(messages);
};