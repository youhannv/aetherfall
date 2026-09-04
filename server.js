import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app=express();
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:'*',methods:['GET','POST']},pingInterval:12000,pingTimeout:18000});
const PORT=process.env.PORT||10000;
const players=new Map();
const safeText=(s,max=100)=>String(s??'').replace(/[<>]/g,'').trim().slice(0,max);
const safeNum=(n,fallback=0)=>Number.isFinite(Number(n))?Number(n):fallback;
const safeHex=(v,fallback)=>/^#[0-9a-fA-F]{6}$/.test(String(v||''))?String(v):fallback;
function safeAvatar(a={}){
 const hairStyles=['short','buzz','long','curly'],accessories=['none','cap','glasses','backpack'],builds=['slim','standard','strong'];
 return{
  skin:safeHex(a.skin,'#c89570'),hair:safeHex(a.hair,'#2b211b'),
  hairStyle:hairStyles.includes(a.hairStyle)?a.hairStyle:'short',
  top:safeHex(a.top,'#355f8a'),pants:safeHex(a.pants,'#202a34'),shoes:safeHex(a.shoes,'#11151a'),
  accessory:accessories.includes(a.accessory)?a.accessory:'none',
  build:builds.includes(a.build)?a.build:'standard'
 }
}
const roomName=city=>`city:${safeText(city,20)||'paris'}`;

app.get('/',(_,res)=>res.json({name:'StreetQuest Multiplayer',status:'online',players:players.size}));
app.get('/health',(_,res)=>res.status(200).send('ok'));
app.get('/debug',(_,res)=>res.json({
 version:'16.2',
 sockets:io.engine.clientsCount,
 joinedPlayers:players.size,
 players:[...players.values()].map(p=>({name:p.name,city:p.city,x:p.x,z:p.z,avatar:p.avatar}))
}));

function publicPlayer(p){return{id:p.id,name:p.name,city:p.city,x:p.x,z:p.z,yaw:p.yaw,color:p.color,avatar:p.avatar}}
function emitCount(city){const room=io.sockets.adapter.rooms.get(roomName(city));io.to(roomName(city)).emit('world:count',room?.size||0)}
function joinWorld(socket,data={}){
 const previous=players.get(socket.id);if(previous){socket.leave(roomName(previous.city));emitCount(previous.city)}
 const city=safeText(data.city,20)||'paris',p={id:socket.id,name:safeText(data.name,18)||'Joueur',city,x:safeNum(data.x),z:safeNum(data.z),yaw:safeNum(data.yaw),color:Number(data.color)||0x5fa7d8,avatar:safeAvatar(data.avatar),lastMove:0};
 players.set(socket.id,p);socket.join(roomName(city));console.log('[player joined]',p.name,p.city,'players:',players.size);
 const list=[...players.values()].filter(x=>x.city===city).map(publicPlayer);socket.emit('world:players',list);socket.to(roomName(city)).emit('player:joined',publicPlayer(p));emitCount(city)
}

io.on('connection',socket=>{
 console.log('[socket connected]',socket.id,'open sockets:',io.engine.clientsCount);
 socket.on('player:join',data=>joinWorld(socket,data));
 socket.on('player:appearance',data=>{
   const p=players.get(socket.id);if(!p)return;p.avatar=safeAvatar(data?.avatar);
   io.to(roomName(p.city)).emit('player:appearance',publicPlayer(p))
 });
 socket.on('player:move',data=>{
   const p=players.get(socket.id);if(!p)return;const now=Date.now();if(now-p.lastMove<45)return;p.lastMove=now;
   const city=safeText(data.city,20)||p.city;if(city!==p.city){joinWorld(socket,{...p,...data,city});return}
   const nx=safeNum(data.x,p.x),nz=safeNum(data.z,p.z),ny=safeNum(data.yaw,p.yaw);
   if(Math.hypot(nx-p.x,nz-p.z)>12)return; // simple anti-teleport alpha
   p.x=nx;p.z=nz;p.yaw=ny;socket.to(roomName(p.city)).emit('player:moved',publicPlayer(p))
 });
 socket.on('chat:send',data=>{
   const p=players.get(socket.id),message=safeText(data?.message,100);if(!p||!message)return;
   for(const [id,other] of players){if(other.city!==p.city)continue;if(Math.hypot(other.x-p.x,other.z-p.z)<=35)io.to(id).emit('chat:message',{id:p.id,name:p.name,message})}
 });
 socket.on('player:emote',data=>{const p=players.get(socket.id),emote=safeText(data?.emote,4);if(!p||!['👋','👍','😂','😮'].includes(emote))return;io.to(roomName(p.city)).emit('player:emote',{id:p.id,name:p.name,emote})});
 socket.on('disconnect',()=>{const p=players.get(socket.id);console.log('[socket disconnected]',socket.id,p?.name||'not joined');if(!p)return;players.delete(socket.id);socket.to(roomName(p.city)).emit('player:left',publicPlayer(p));emitCount(p.city)})
});
server.listen(PORT,'0.0.0.0',()=>console.log(`StreetQuest server listening on ${PORT}`));
