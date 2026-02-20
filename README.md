# Real-Time Messaging Engine

## Introduction

This is a simple real-time chat application.

It allows users to:
- Send and receive messages instantly
- See who is online
- See typing indicators
- Continue chatting even if the internet goes down

If the connection is lost:
- Messages are saved in the browser
- The app still works
- Messages automatically send when the internet comes back

The main goal of this project is to build a **fast, reliable, and offline-friendly chat system**.

---

##  Tech Used

- Backend: Node.js, Express, Socket.io
- Frontend: React.js
- Database: PostgreSQL or MySQL
- ORM: Prisma
- Offline Storage: IndexedDB

---

## Setup (Step-by-Step)

### Clone the Project

```bash
git clone https://github.com/Shriti507/ChatWeb.git
cd ChatWeb
```

### Setup Backend

```bash
cd backend
npm install
npm run dev
```

### Setup Frontend

```bash
cd frontend
npm install
npm run dev
```