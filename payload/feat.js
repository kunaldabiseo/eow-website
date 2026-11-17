(async()=>{
const out=[];
for(const K of __KEYS__){
 const p=await (await fetch('https://kunaldabiseo.github.io/eow-website/payload/'+K+'.json?v='+Date.now())).json();
 const name=p.title.split(' Expert')[0];
 const fname=K+'-expert-ophthalmology-witness.jpg';
 const page=await wp.apiFetch({path:'/wp/v2/pages/'+p.pid+'?context=edit&_fields=id,featured_media,slug'});
 if(page.featured_media){ const m=await wp.apiFetch({path:'/wp/v2/media/'+page.featured_media+'?_fields=source_url'}); out.push(K+' ALREADY '+m.source_url); continue; }
 const ex=await wp.apiFetch({path:'/wp/v2/media?search='+encodeURIComponent(K+'-expert-ophthalmology-witness')+'&_fields=id,source_url,slug'});
 let media=ex.find(m=>m.source_url.endsWith('/'+fname));
 if(!media){
  const blob=await (await fetch('https://kunaldabiseo.github.io/eow-website/featured/'+fname)).blob();
  media=await wp.apiFetch({path:'/wp/v2/media',method:'POST',body:blob,headers:{'Content-Type':'image/jpeg','Content-Disposition':'attachment; filename="'+fname+'"'}});
  await wp.apiFetch({path:'/wp/v2/media/'+media.id,method:'POST',data:{alt_text:name+' Expert Ophthalmology Witness',title:name+' Expert Ophthalmology Witness'}});
 }
 await wp.apiFetch({path:'/wp/v2/pages/'+p.pid,method:'POST',data:{featured_media:media.id}});
 out.push(K+' pid '+p.pid+' media '+media.id+' '+media.source_url);
 await new Promise(r=>setTimeout(r,3000));
}
return out.join('\n');
})()
