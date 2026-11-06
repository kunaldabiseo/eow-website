(async()=>{
const K='__KEY__';
const p=await (await fetch('https://kunaldabiseo.github.io/eow-website/payload/'+K+'.json?v='+Date.now())).json();
const doc=elementor.documents.getCurrent();
if(+doc.id!==p.pid) return 'PID MISMATCH editor='+doc.id+' payload='+p.pid;
const els=JSON.parse(JSON.stringify(doc.config.elements));
const raw=JSON.stringify(els);
if(raw.includes('eow-ky')) return 'ALREADY HAS eow-ky - stop';
try{localStorage.setItem('eow_bak_'+p.pid, raw);}catch(e){}
let parent=null, col=null;
(function walk(a){for(const e of a){ if(e.id==='f43a878') col=e; if(e.elements&&e.elements.length){ if(e.elements.some(c=>c.id==='5e7ef56')) parent=e; walk(e.elements);} }})(els);
if(!parent) return 'no 5e7ef56';
if(!col) return 'no f43a878';
const ch=parent.elements, i=ch.findIndex(c=>c.id==='5e7ef56'), j=ch.findIndex(c=>c.id==='7472f05');
if(j<=i) return 'bad range '+i+' '+j;
const rid=()=>(Math.random().toString(16).slice(2)+'0000000').slice(0,7);
const assets={id:rid(),elType:'widget',widgetType:'html',settings:{html:'<style id="eow-ky-page-css">'+p.css+'.eow-ky-assets{display:none!important}</style>\n<script type="application/ld+json" class="eow-new-schema">'+p.schema+'</script>',_css_classes:'eow-ky-assets'},elements:[]};
const nw=p.blocks.map(b=>({id:rid(),elType:'widget',widgetType:'html',settings:{html:b.html,_css_classes:b.cls},elements:[]}));
const removed=ch.slice(i,j).map(c=>c.id+':'+(c.widgetType||c.elType));
ch.splice(i,j-i,assets,...nw);
col.settings=col.settings||{}; const cc=(col.settings.css_classes||'').split(' ').filter(Boolean); if(!cc.includes('eow-ky-sticky')) cc.push('eow-ky-sticky'); col.settings.css_classes=cc.join(' ');
const r=await new Promise((res,rej)=>elementorCommon.ajax.addRequest('save_builder',{data:{status:'publish',elements:els},success:res,error:rej}));
return 'SAVED '+K+' pid '+p.pid+' removed '+removed.length+' ['+removed.join(',')+'] added '+(nw.length+1)+' bak '+raw.length+' resp '+JSON.stringify(r).slice(0,120);
})()
