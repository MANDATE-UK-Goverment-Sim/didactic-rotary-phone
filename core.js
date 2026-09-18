(() => {
  const KEY='usher-election-night-v5';
  const channel = ('BroadcastChannel' in window) ? new BroadcastChannel('usher-election-night-v5') : null;
  const D=window.USHER_DATA;
  const defaultPoll={lab:278,con:236,ld:62,ref:32,grn:18,uip:12,oth:12};
  const defaultChanges={lab:-35,con:-62,ld:28,ref:24,grn:9,uip:7,oth:29};
  function exitPollDefaultTime(){
    const d=new Date(); d.setHours(22,0,0,0); if(d<Date.now()) d.setDate(d.getDate()+1); return d.toISOString();
  }
  const defaultState={
    version:5,
    electionName:'USHER GENERAL ELECTION 2026',
    mode:'general',
    currentSlide:'opening',
    selectedSeat:D.constituencies[0].id,
    selectedCouncil:D.councils[0].id,
    exitPoll:defaultPoll,
    exitPollChanges:defaultChanges,
    exitPollVisible:false,
    exitPollTime:exitPollDefaultTime(),
    ticker:[
      {time:'21:44',text:'Exit poll countdown underway',party:'lab'},
      {time:'21:42',text:'Final preparations in declaration centres',party:'con'},
      {time:'21:40',text:'Turnout reports arriving from across Usher',party:'ld'},
      {time:'21:37',text:'First results expected shortly after polls close',party:'ref'}
    ],
    seatResults:{}, councilResults:{},
    winnerParty:null,
    historyParty:'lab',
    autoplay:false,
    controlTheme:'light'
  };

  function mergeSaved(saved){
    if(!saved) return structuredClone(defaultState);
    return {...structuredClone(defaultState),...saved,
      exitPoll:{...defaultPoll,...(saved.exitPoll||{})},
      exitPollChanges:{...defaultChanges,...(saved.exitPollChanges||{})},
      seatResults:saved.seatResults||{}, councilResults:saved.councilResults||{}, ticker:saved.ticker||defaultState.ticker
    };
  }
  let state;
  try{state=mergeSaved(JSON.parse(localStorage.getItem(KEY)));}catch{state=structuredClone(defaultState);}
  const listeners=new Set();
  function emit(){ listeners.forEach(fn=>{try{fn(state)}catch(e){console.error(e)}}); }
  function save(broadcast=true){
    localStorage.setItem(KEY,JSON.stringify(state));
    if(broadcast && channel) channel.postMessage({type:'state',state});
    emit();
  }
  function set(patch){ state={...state,...patch}; save(); }
  function update(mutator){ const next=structuredClone(state); mutator(next); state=next; save(); }
  function reset(){ state=structuredClone(defaultState); save(); }
  function subscribe(fn){ listeners.add(fn); fn(state); return ()=>listeners.delete(fn); }
  if(channel) channel.onmessage=e=>{ if(e.data?.type==='state'){ state=mergeSaved(e.data.state); localStorage.setItem(KEY,JSON.stringify(state)); emit(); } };
  window.addEventListener('storage',e=>{ if(e.key===KEY && e.newValue){ try{state=mergeSaved(JSON.parse(e.newValue));emit();}catch{} } });
  window.USHER={getState:()=>state,set,update,reset,subscribe,save,key:KEY};
})();
