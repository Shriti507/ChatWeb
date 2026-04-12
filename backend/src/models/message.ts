export type message={
    id: string;
    chatId:string;
    senderId:string;
    content:string;
    timestamp:number;
    status: "PENDING" | "SENT" | "READ";
}

