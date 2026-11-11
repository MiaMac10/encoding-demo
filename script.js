"use strict";

// Static, local-only PSYC 402 practice experiment. No data are sent anywhere.
const STRATEGIES = [
  {id:"maintenance", name:"Maintenance rehearsal", instruction:"Repeat each word silently to yourself several times while it is on the screen. Focus on repeating the word rather than thinking about its meaning."},
  {id:"self_reference", name:"Self-reference", instruction:"For each word, think about how it connects to your own life, experiences, or preferences. Make a personal connection while it is on the screen."},
  {id:"imagery", name:"Mental imagery", instruction:"For each word, create a vivid mental picture of the object. Imagine what it looks like in a specific scene."}
];
const WORD_LISTS = [
  ["apple","chair","river","candle","window","basket"],
  ["pencil","garden","mirror","bottle","ladder","turtle"],
  ["blanket","camera","orange","bridge","pillow","flower"]
];
const WORD_SECONDS = 4;
const DISTRACTOR_SECONDS = 30;
const content = document.getElementById("content");
const stage = document.getElementById("stage");
const progressCount = document.getElementById("progress-count");
const progressBar = document.getElementById("progress-bar");
let session = null;
let activeTimer = null;

function shuffle(items){
  const result = [...items];
  for(let i=result.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [result[i],result[j]]=[result[j],result[i]];
  }
  return result;
}
function setProgress(label, blocks){
  stage.textContent=label;
  progressCount.textContent=`${blocks} / 3 blocks`;
  progressBar.style.width=`${Math.round(blocks/3*100)}%`;
}
function clearTimer(){if(activeTimer!==null){clearInterval(activeTimer);activeTimer=null;}}
function button(label,handler,secondary=false){
  const el=document.createElement("button");el.type="button";el.className=`button${secondary?" secondary":""}`;el.textContent=label;el.addEventListener("click",handler);return el;
}
function node(tag,text,className=""){
  const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el;
}
function screen(title,description){
  clearTimer();content.replaceChildren();content.append(node("h2",title));
  if(description)content.append(node("p",description));
}
function welcome(){
  setProgress("Welcome",0);
  screen("How does studying affect memory?","You will study 18 words across three blocks, using a different memory strategy in each block. Each word appears for 4 seconds.");
  const list=document.createElement("ul");
  ["Read the instructions before each block.","After all 18 words, count backward by 3s for 30 seconds.","Type as many studied words as you remember, in any order.","See your scores and download two CSV data files."].forEach(t=>list.append(node("li",t)));
  content.append(list,node("p","Do not write down the words or use other memory aids. The order of strategies and word lists changes for each new session.","notice"),button("Begin experiment",startSession));
}
function startSession(){
  const strategyOrder=shuffle(STRATEGIES);
  const listOrder=shuffle(WORD_LISTS.map((_,i)=>i));
  session={id:`session-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,started:new Date().toISOString(),blocks:strategyOrder.map((s,i)=>({strategy:s,listId:listOrder[i]+1,words:[...WORD_LISTS[listOrder[i]]]})),trials:[],blockIndex:0,recallRaw:"",recallEntries:[],distractorStart:null,distractorEntries:[],distractorInput:"",completed:null};
  blockIntro();
}
function blockIntro(){
  const i=session.blockIndex;
  if(i===3){distractorIntro();return;}
  const block=session.blocks[i];setProgress(`Block ${i+1}: ${block.strategy.name}`,i);
  screen(`Block ${i+1} of 3: ${block.strategy.name}`,block.strategy.instruction);
  content.append(node("p","Six words will appear, one at a time, for 4 seconds each. Try to follow this strategy for every word.","notice"),button("Start this block",()=>showWord(0)));
}
function showWord(index){
  const i=session.blockIndex,block=session.blocks[i];
  if(index===block.words.length){session.blockIndex++;blockIntro();return;}
  setProgress(`Block ${i+1}: ${block.strategy.name}`,i);
  screen(`Block ${i+1} · Word ${index+1} of 6`,"");
  content.append(node("div",block.words[index].toUpperCase(),"word"));
  const countdown=node("p",`Next word in ${WORD_SECONDS}s`,"center timer");content.append(countdown);
  session.trials.push({trial:session.trials.length+1,block:i+1,position:index+1,strategy:block.strategy.id,strategy_name:block.strategy.name,list_id:block.listId,word:block.words[index],duration_seconds:WORD_SECONDS});
  const started=performance.now();
  activeTimer=setInterval(()=>{
    const left=Math.max(0,Math.ceil(WORD_SECONDS-(performance.now()-started)/1000));
    countdown.textContent=`Next word in ${left}s`;
    if(left===0){clearTimer();showWord(index+1);}
  },100);
}
function distractorIntro(){
  setProgress("Distractor task",3);
  screen("30-second distractor task","Before recalling the words, you will count backward by 3s from a randomly chosen three-digit number.");
  content.append(node("p","Type each next number and press Enter. Continue until the 30-second timer ends. This is not a memory test; just keep counting.","notice"),button("Start 30-second countdown",startDistractor));
}
function startDistractor(){
  const startingNumber=300+Math.floor(Math.random()*600);
  session.distractorStart=startingNumber;
  setProgress("Distractor task",3);
  screen("Count backward by 3s",`Start at ${startingNumber}. Type the next number (${startingNumber-3}) and press Enter. Keep subtracting 3.`);
  const timer=node("p","Time remaining: 30s","timer");
  const input=document.createElement("input");input.className="field";input.type="number";input.inputMode="numeric";input.placeholder="Next number";input.setAttribute("aria-label","Next number in countdown");
  const feedback=node("p","Numbers entered: 0","muted small");
  const form=document.createElement("form");form.append(input,button("Submit number",()=>{}));
  // Prevent form submission and avoid the helper button's independent click handler.
  form.lastChild.remove();
  const submit=document.createElement("button");submit.className="button";submit.type="submit";submit.textContent="Submit number";form.append(submit);
  form.addEventListener("submit",event=>{
    event.preventDefault();if(input.value.trim()==="")return;
    session.distractorEntries.push(input.value.trim());feedback.textContent=`Numbers entered: ${session.distractorEntries.length}`;input.value="";input.focus();
  });
  content.append(timer,form,feedback);input.focus();
  const started=performance.now();
  activeTimer=setInterval(()=>{
    const left=Math.max(0,Math.ceil(DISTRACTOR_SECONDS-(performance.now()-started)/1000));
    timer.textContent=`Time remaining: ${left}s`;
    if(left===0){clearTimer();recallScreen();}
  },100);
}
function recallScreen(){
  setProgress("Free recall",3);
  screen("Recall the studied words","Type as many of the 18 studied words as you can remember, from any block and in any order. You may separate words using spaces, commas, or new lines. Do not worry about capitalization.");
  const area=document.createElement("textarea");area.className="field";area.placeholder="Enter remembered words here…";area.setAttribute("aria-label","Remembered words");
  content.append(area,button("Submit recall and see results",()=>{
    session.recallRaw=area.value;session.recallEntries=parseRecall(area.value);session.completed=new Date().toISOString();showResults();
  }));
}
function parseRecall(text){return text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g)||[];}
function distance(a,b){
  if(Math.abs(a.length-b.length)>1)return 2;
  let prev=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
    const row=[i];for(let j=1;j<=b.length;j++)row[j]=Math.min(row[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=row;
  }
  return prev[b.length];
}
function scoreRecall(){
  const remaining=[...session.recallEntries];
  // Match exact responses first; then allow one-letter typos for words >= 5 letters.
  const matches=new Map();
  for(const trial of session.trials){
    const at=remaining.indexOf(trial.word);
    if(at!==-1){matches.set(trial.trial,remaining.splice(at,1)[0]);}
  }
  for(const trial of session.trials){
    if(matches.has(trial.trial)||trial.word.length<5)continue;
    const at=remaining.findIndex(w=>w.length>=4&&distance(w,trial.word)===1);
    if(at!==-1)matches.set(trial.trial,remaining.splice(at,1)[0]);
  }
  return matches;
}
function showResults(){
  setProgress("Results",3);
  const matches=scoreRecall();
  screen("Your memory results","Below is the number of words you recalled for each encoding strategy (out of six). Each studied word can earn credit only once.");
  const table=document.createElement("table");
  const head=document.createElement("tr");["Encoding strategy","Words recalled"].forEach(t=>head.append(node("th",t)));table.append(head);
  for(const s of STRATEGIES){
    const trials=session.trials.filter(t=>t.strategy===s.id),score=trials.filter(t=>matches.has(t.trial)).length;
    const tr=document.createElement("tr");tr.append(node("td",s.name),node("td",`${score} / 6`));table.append(tr);
  }
  content.append(table);
  const chart=node("div","");
  for(const s of STRATEGIES){
    const score=session.trials.filter(t=>t.strategy===s.id&&matches.has(t.trial)).length;
    const line=node("div","","barline");const label=node("span",s.name);
    const bg=node("div","","bar-bg"),fill=node("div","","bar-fill");fill.style.width=`${score/6*100}%`;bg.append(fill);
    line.append(label,bg,node("strong",`${score}/6`));chart.append(line);
  }
  content.append(chart);
  const total=matches.size;content.append(node("p",`Total recalled: ${total} / 18 words.`,"notice"));
  content.append(button("Download summary CSV",()=>downloadCSV("summary",matches)),button("Download trial-level CSV",()=>downloadCSV("trials",matches),true));
  content.append(node("p","The summary CSV contains one data row for this session. The trial-level CSV contains 18 data rows, one for each studied word. Downloads are stored on your device; this site does not collect them.","muted small"));
  content.append(button("Start a new randomized session",welcome,true));
}
function csvCell(value){const s=String(value??"");return `"${s.replaceAll('"','""')}"`;}
function csv(rows){return rows.map(row=>row.map(csvCell).join(",")).join("\r\n")+"\r\n";}
function downloadCSV(kind,matches){
  const scores=Object.fromEntries(STRATEGIES.map(s=>[s.id,session.trials.filter(t=>t.strategy===s.id&&matches.has(t.trial)).length]));
  let rows;
  if(kind==="summary"){
    rows=[
      ["session_id","started_at","completed_at","strategy_order","list_assignment","maintenance_recall","self_reference_recall","imagery_recall","total_recall","distractor_start","distractor_responses","recall_text"],
      [session.id,session.started,session.completed,session.blocks.map(b=>b.strategy.id).join(" | "),session.blocks.map(b=>`${b.strategy.id}:list${b.listId}`).join(" | "),scores.maintenance,scores.self_reference,scores.imagery,matches.size,session.distractorStart,session.distractorEntries.join(" | "),session.recallRaw]
    ];
  }else{
    rows=[["session_id","trial","block","serial_position","strategy","list_id","studied_word","presentation_seconds","recalled","matched_response"]];
    for(const t of session.trials)rows.push([session.id,t.trial,t.block,t.position,t.strategy,t.list_id,t.word,t.duration_seconds,matches.has(t.trial)?1:0,matches.get(t.trial)||""]);
  }
  const blob=new Blob([csv(rows)],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=`encoding_${kind}_${session.id}.csv`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
welcome();
