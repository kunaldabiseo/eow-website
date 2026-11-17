(async()=>{
const pid=+new URLSearchParams(location.search).get('post');
const forms=[...document.querySelectorAll('.metabox-location-normal, .metabox-location-side, .metabox-location-advanced')];
const get=n=>forms.map(f=>f.querySelector('[name="'+n+'"]')).find(Boolean);
for(const n of ['yoast_wpseo_opengraph-image','yoast_wpseo_opengraph-image-id']){ const i=get(n); if(!i) return 'missing '+n; i.value=''; }
const fd=new FormData(document.querySelector('.metabox-base-form'));
forms.forEach(f=>{for(const [k,v] of new FormData(f)) fd.append(k,v);});
const r=await fetch(window._wpMetaBoxUrl,{method:'POST',body:fd,credentials:'same-origin'});
const pg=await wp.apiFetch({path:'/wp/v2/pages/'+pid+'?context=edit&_fields=featured_media'});
return 'OGCLEAR '+pid+' '+r.status+' featured_media '+pg.featured_media;
})()
