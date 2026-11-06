(async()=>{
const K='__KEY__';
const p=await (await fetch('https://kunaldabiseo.github.io/eow-website/payload/'+K+'.json?v='+Date.now())).json();
const pid=+new URLSearchParams(location.search).get('post');
if(pid!==p.pid) return 'PID MISMATCH '+pid+' vs '+p.pid;
const forms=[...document.querySelectorAll('.metabox-location-normal, .metabox-location-side, .metabox-location-advanced')];
const set=(n,v)=>{const i=forms.map(f=>f.querySelector('[name="'+n+'"]')).find(Boolean); if(!i) throw new Error('missing '+n); i.value=v;};
set('yoast_wpseo_title',p.title); set('yoast_wpseo_metadesc',p.meta);
set('yoast_wpseo_opengraph-image','https://www.expertophthalmologywitness.com/wp-content/uploads/2026/01/dr-lefkowitz.jpg'); set('yoast_wpseo_opengraph-image-id','2633');
const fd=new FormData(document.querySelector('.metabox-base-form'));
forms.forEach(f=>{for(const [k,v] of new FormData(f)) fd.append(k,v);});
const r=await fetch(window._wpMetaBoxUrl,{method:'POST',body:fd,credentials:'same-origin'});
return 'YOAST '+K+' '+r.status;
})()
