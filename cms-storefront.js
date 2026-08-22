(function(){
  'use strict';
  async function init(){
    if(!window.RoyraDB || !window.RoyraDB.isConfigured()) return;
    try{
      const banners = await window.RoyraDB.getBanners();
      if(banners.length){
        const b=banners[0];
        const hero=document.querySelector('.hero-bg-img');
        if(hero && b.desktop_image_url) hero.src=b.desktop_image_url;
        const title=document.querySelector('.hero-title'); if(title && b.title) title.innerHTML=String(b.title).replace(/\n/g,'<br>');
        const eyebrow=document.querySelector('.hero-eyebrow'); if(eyebrow) eyebrow.textContent=b.name || 'NEW COLLECTION';
        const subtitle=document.querySelector('.hero-subtitle'); if(subtitle && b.subtitle) subtitle.textContent=b.subtitle;
        const desc=document.querySelector('.hero-desc'); if(desc && b.description) desc.textContent=b.description;
        const cta=document.getElementById('hero-shop-now-btn'); if(cta){cta.textContent=b.button_text||'SHOP NOW →'; if(b.button_link) cta.href=b.button_link;}
        if(hero && b.mobile_image_url){
          let picture=hero.parentElement.querySelector('source[data-cms-mobile]');
          if(!picture){ picture=document.createElement('source'); picture.dataset.cmsMobile='1'; picture.media='(max-width: 700px)'; hero.parentElement.tagName==='PICTURE'?hero.parentElement.prepend(picture):null; }
          if(picture && hero.parentElement.tagName==='PICTURE') picture.srcset=b.mobile_image_url;
        }
      }
      const settings=await window.RoyraDB.getSiteSettings(['announcement_text','announcement_subtext','footer_copyright']);
      const ann=document.querySelector('.announcement-text'); if(ann && settings.announcement_text) ann.textContent=settings.announcement_text;
      const sub=document.querySelector('.announcement-sub'); if(sub && settings.announcement_subtext) sub.textContent=settings.announcement_subtext;
      if(settings.footer_copyright){ document.querySelectorAll('[data-footer-copyright]').forEach(el=>el.textContent=settings.footer_copyright); }
      const collections=await window.RoyraDB.getCollections();
      const featured=collections.filter(c=>c.featured).sort((a,b)=>(a.display_order||0)-(b.display_order||0));
      if(featured.length){
        const section=document.getElementById('royra-featured-collections');
        if(section){
          section.innerHTML=featured.slice(0,4).map(c=>`<a class="cms-collection-card" href="collections.html?slug=${encodeURIComponent(c.slug)}"><div class="cms-collection-card-image"><img src="${c.collection_image_url||c.banner_image_url||'assets/products/product-01.jpg'}" alt="${c.name||''}"></div><div class="cms-collection-card-copy"><span>${c.name||''}</span><small>${c.short_description||'Explore collection →'}</small></div></a>`).join('');
          section.parentElement.style.display='block';
        }
      }
    }catch(e){ console.warn('[Royra CMS storefront] unavailable',e); }
  }
  document.addEventListener('DOMContentLoaded', init);
})();
