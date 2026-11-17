(async()=>{
const doc=elementor.documents.getCurrent();
let raw=JSON.stringify(doc.config.elements);
const before=raw.length;
const map=[['rhose-island-expert-ophthalmology-witness-dr-todd-lefkowitz','rhode-island-expert-ophthalmology-witness'],['wyoming-expert-ophthalmology-witness-dr-todd-lefkowitz','wyoming-expert-ophthalmology-witness']];
let n=0; for(const [a,b] of map){ const c=raw.split(a).length-1; n+=c; raw=raw.split(a).join(b); }
if(!n) return 'NOTHING TO REPLACE pid '+doc.id;
const els=JSON.parse(raw);
const r=await new Promise((res,rej)=>elementorCommon.ajax.addRequest('save_builder',{data:{status:'publish',elements:els},success:res,error:rej}));
return 'URLFIX pid '+doc.id+' replaced '+n+' status '+(r&&r.status);
})()
