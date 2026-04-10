const SAYINGS = ["Back in my day...","I know a shortcut","That’s too expensive","I’m not lost","They don’t make ’em like they used to","Just watch this","You call that driving?","Need anything from the store?","That’s a good deal","Turn that down","Who touched the thermostat?","I could fix that","Don’t tell grandma","That reminds me of...","Want some advice?","That’ll put hair on your chest","I’ve got a guy for that","When I was your age...","Not bad, not bad","That’s how they get ya","Mark my words","Listen here","No need for instructions","It still works fine"];
const boardEl = document.getElementById('bingo-board');
const statusEl = document.getElementById('status');
function shuffle(arr){return [...arr].sort(() => Math.random()-0.5);}
function createBoard(){
 boardEl.innerHTML=''; statusEl.textContent='';
 const sayings=shuffle(SAYINGS).slice(0,24); sayings.splice(12,0,'FREE');
 sayings.forEach(text=>{
  const div=document.createElement('div');
  div.className='square'+(text==='FREE'?' marked':'');
  div.textContent=text;
  div.addEventListener('click',()=>{if(text!=='FREE') div.classList.toggle('marked'); checkBingo();});
  boardEl.appendChild(div);
 });
}
function checkBingo(){
 const squares=[...document.querySelectorAll('.square')];
 const marked=squares.map(s=>s.classList.contains('marked'));
 const wins=[];
 for(let i=0;i<5;i++){wins.push([0,1,2,3,4].map(j=>i*5+j)); wins.push([0,1,2,3,4].map(j=>j*5+i));}
 wins.push([0,6,12,18,24],[4,8,12,16,20]);
 statusEl.textContent=wins.some(combo=>combo.every(i=>marked[i]))?'🎉 BINGO! 🎉':'';
}
document.getElementById('newCard').addEventListener('click',createBoard);
createBoard();