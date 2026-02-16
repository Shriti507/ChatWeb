
Full-Stack Real-Time Messaging Engine   

---

## Project Overview  

A high-performance, browser-based real-time messaging engine designed to deliver seamless communication—even in unreliable network conditions.  

Unlike traditional web chat systems that fail during connectivity drops, It follows a Local-First synchronization strategy. Messages created while offline are safely stored in the browser and automatically reconciled with the backend once connectivity is restored.  

---

## Key Features  

### 1. Real-Time Message 

#### Bi-Directional Communication  
- Powered by Socket.io  
- Instant, low-latency message delivery  
- No page refresh required  

#### Presence Management  
- Real-time tracking of:
  - Online / Offline user states  
  - "User is typing..." indicators  
- Efficient event broadcasting architecture  



### 2. Synchronization & Persistence 

#### Offline-First Workflow  
- Messages created during network downtime are:
  - Stored in IndexedDB or LocalStorage  
  - Marked with a PENDING status  
- UI remains fully responsive  


---

## Technical Stack  

### Backend  
- Node.js  
- TypeScript  
- Express.js  

### Database  
- PostgreSQL or MySQL  
- Prisma ORM  

### Real-Time 
- Socket.io  

### Frontend  
- React.js 

### Offline Storage  
- IndexedDB (Primary)   


