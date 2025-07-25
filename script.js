const rows = 10, cols = 15;
let maze = [
  [0,1,0,0,0,0,0,1,0,0,1,0,0,0,0],
  [0,1,0,1,1,1,0,1,0,0,1,0,1,1,0],
  [0,0,0,0,0,1,0,1,0,1,1,0,1,0,0],
  [1,1,1,1,0,1,0,1,0,0,0,0,1,0,1],
  [0,0,0,1,0,1,0,1,1,1,1,1,1,0,0],
  [0,1,0,1,0,1,0,0,0,0,0,0,0,0,1],
  [0,1,0,1,0,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,0,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0]
];

const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const statsEl = document.getElementById('stats');

let start = [0,0];
let end = null;
let tileSize = 40;
let visited = new Set();
let queue = [];
let parent = {};
let current = null;
let path = [];
let running = false;
let finished = false;

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      ctx.fillStyle = maze[r][c]===1 ? 'black':'white';
      ctx.fillRect(c*tileSize,r*tileSize,tileSize,tileSize);
      ctx.strokeStyle='#888';
      ctx.strokeRect(c*tileSize,r*tileSize,tileSize,tileSize);
    }
  }
  visited.forEach(key=>{
    let [r,c] = key.split(',').map(Number);
    ctx.fillStyle='lightblue';
    ctx.fillRect(c*tileSize,r*tileSize,tileSize,tileSize);
  });
  ctx.fillStyle='yellow';
  for(let [r,c] of path){
    ctx.fillRect(c*tileSize,r*tileSize,tileSize,tileSize);
  }
  if(current){
    ctx.fillStyle='red';
    ctx.fillRect(current[1]*tileSize,current[0]*tileSize,tileSize,tileSize);
  }
  ctx.fillStyle='green';
  ctx.fillRect(start[1]*tileSize,start[0]*tileSize,tileSize,tileSize);
  if(end){
    ctx.fillStyle='purple';
    ctx.fillRect(end[1]*tileSize,end[0]*tileSize,tileSize,tileSize);
  }
}
let lastStepTime = 0;
let stepDelay = 100; // mili giây giữa B

function bfsStep(){
  if(queue.length===0){
    finished=true;
    statusEl.textContent='Trạng thái: Không tìm thấy đường!';
    return;
  }
  current = queue.shift();
  if(current[0]===end[0] && current[1]===end[1]){
    path=[];
    let n=current.join(',');
    while(n){
      let [rr,cc] = n.split(',').map(Number);
      path.unshift([rr,cc]);
      n = parent[n];
    }
    finished=true;
    statusEl.textContent='✅ Đã tìm thấy đường!';
    return;
  }
  let [r,c] = current;
  let dirs=[[1,0],[-1,0],[0,1],[0,-1]];
  for(let [dr,dc] of dirs){
    let nr=r+dr,nc=c+dc;
    if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&maze[nr][nc]===0){
      let k = nr+','+nc;
      if(!visited.has(k)){
        visited.add(k);
        parent[k]=r+','+c;
        queue.push([nr,nc]);
      }
    }
  }
}

function loop(){
  if(running && !finished){
    bfsStep();
    statsEl.textContent=`Bước: ${Object.keys(parent).length} | Ô đã thăm: ${visited.size} | Độ dài đường đi: ${path.length}`;
  }
  draw();
  requestAnimationFrame(loop);
}
loop();

canvas.addEventListener('mousedown',(e)=>{
  let rect=canvas.getBoundingClientRect();
  let c = Math.floor((e.clientX-rect.left)/tileSize);
  let r = Math.floor((e.clientY-rect.top)/tileSize);
  if(e.button===0){
    if(maze[r][c]===0){
      end=[r,c];
      visited.clear();
      parent={};
      queue=[start];
      visited.add(start.join(','));
      path=[];
      current=null;
      finished=false;
      running=true;
      statusEl.textContent='🔎 Đang tìm đường...';
    }
  }else if(e.button===2){
    if(!(start[0]===r && start[1]===c) && (!end || end[0]!==r||end[1]!==c)){
      maze[r][c]=maze[r][c]===1?0:1;
      resetMaze();
    }
  }
});
canvas.addEventListener('contextmenu',(e)=>e.preventDefault());

function resetMaze(){
  end=null;
  visited.clear();
  parent={};
  queue=[];
  path=[];
  current=null;
  finished=false;
  running=false;
  statusEl.textContent='Trạng thái: Chờ chọn đích';
  statsEl.textContent='Bước: 0 | Ô đã thăm: 0 | Độ dài đường đi: 0';
}

// nút bấm
document.getElementById('btnStart').onclick=()=>{
  if(end){
    running=true;
    statusEl.textContent='🔎 Đang tìm đường...';
  }else{
    alert('Hãy chọn ô đích trước!');
  }
};
document.getElementById('btnPause').onclick=()=>{
  running=false;
  statusEl.textContent='⏸️ Đang tạm dừng';
};
document.getElementById('btnReset').onclick=()=>{
  resetMaze();
};
document.getElementById('btnRandom').onclick=()=>{
  maze = Array.from({length:rows},()=>Array.from({length:cols},()=>Math.random()<0.3?1:0));
  maze[start[0]][start[1]]=0;
  resetMaze();
};
