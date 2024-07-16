import{d as k}from"./chunk-BRXZIKKT.js";import{Fb as p,Fc as w,Gb as g,Rb as y,Sa as l,Va as i,ba as u,fa as x,ib as _,mb as s,nb as f,ob as v,pb as b,qb as P,sb as M,tb as O,ub as e,vb as a,wb as d,xa as C,zb as h}from"./chunk-N6RDKFUZ.js";function z(t,n){if(t&1&&(e(0,"div",9)(1,"span",10),p(2),a(),e(3,"p"),p(4),a()()),t&2){let o=n.$implicit;f("--bg-color",o.color),i(2),g(o.fullName),i(2),g(o.acronym)}}function S(t,n){if(t&1&&(e(0,"a",7),d(1,"svg-icon",11),e(2,"span"),p(3),a()()),t&2){let o=h();s("href","mailto:"+o.contributor().contactInfo.email,l),i(3),g(o.contributor().contactInfo.email)}}function I(t,n){if(t&1&&(e(0,"a",8),d(1,"svg-icon",12),a()),t&2){let o=h();s("href","https://orcid.org/"+o.contributor().contactInfo.orcid,l)}}function T(t,n){if(t&1&&(e(0,"a",8),d(1,"svg-icon",13),a()),t&2){let o=h();s("href","https://github.com/"+o.contributor().contactInfo.github,l)}}var F=(()=>{let n=class n{constructor(){this.themeService=u(w),this.isDarkTheme=!1,this.contributor=C.required(),this.themeService.isDarkTheme().subscribe(m=>this.isDarkTheme=m)}};n.\u0275fac=function(c){return new(c||n)},n.\u0275cmp=x({type:n,selectors:[["app-contributor-card"]],hostVars:2,hostBindings:function(c,r){c&2&&v("dark",r.isDarkTheme)},inputs:{contributor:[1,"contributor"]},standalone:!0,features:[y],decls:15,vars:7,consts:[[1,"outer-container"],[1,"inner-container"],["alt","",3,"src"],[1,"name"],[1,"organizations"],[1,"organization",3,"--bg-color"],[1,"contact-info"],[3,"href"],["target","_blank","rel","noopener noreferrer",3,"href"],[1,"organization"],[1,"tooltip"],["src","assets/icons/fluent-icons/ic_fluent_mail_16_filled.svg"],["src","assets/icons/logos/ORCIDiD.svg","svgAriaLabel","orcid logo"],["src","assets/icons/logos/github.svg","svgAriaLabel","github logo"]],template:function(c,r){c&1&&(e(0,"div",0)(1,"div",1),d(2,"img",2),e(3,"div")(4,"div",3)(5,"p"),p(6),a(),e(7,"div",4),M(8,z,5,4,"div",5,P),a()(),d(10,"hr"),e(11,"div",6),_(12,S,4,2,"a",7)(13,I,2,1,"a",8)(14,T,2,1,"a",8),a()()()()),c&2&&(f("--url","url("+r.contributor().photo+")"),i(2),s("src",r.contributor().photo,l),i(4),g(r.contributor().name),i(2),O(r.contributor().organizations),i(4),b(r.contributor().contactInfo.email?12:-1),i(),b(r.contributor().contactInfo.orcid?13:-1),i(),b(r.contributor().contactInfo.github?14:-1))},dependencies:[k],styles:['[_nghost-%COMP%]{--outer-border-radius-card: 16px;--outer-border-width-card: 2px;--card-border-color: rgb(255 255 255);--img-backdrop-tint: rgba(255, 255, 255, .85);--hr-gradient: linear-gradient(to right, #00000055, #ffffff44);--img-border-color: #ffffffaa;--contact-info-item-bg: rgba(255, 255, 255, .6)}.dark[_nghost-%COMP%], .dark   [_nghost-%COMP%]{--card-border-color: rgb(58, 58, 60);--img-backdrop-tint: rgba(43, 43, 43, .7);--hr-gradient: linear-gradient(to right, #ffffff55, #00000033);--img-border-color: rgba(255, 255, 255, .1);--contact-info-item-bg: rgba(10, 10, 10, .5)}.outer-container[_ngcontent-%COMP%]{position:relative;box-shadow:#0000001a 0 10px 32px;border:var(--outer-border-width-card) solid var(--card-border-color);border-radius:var(--outer-border-radius-card);background:linear-gradient(to right,var(--img-backdrop-tint) 0 100%),var(--url) center no-repeat;background-size:cover;height:100%}.inner-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;gap:26px;-webkit-backdrop-filter:blur(100px);backdrop-filter:blur(100px);border-radius:calc(var(--outer-border-radius-card) - var(--outer-border-width-card));padding:14px 20px;height:100%}@media (width > 576px){.inner-container[_ngcontent-%COMP%]{flex-direction:row}}.name[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;margin-bottom:12px;align-items:center}@media (width > 576px){.name[_ngcontent-%COMP%]{flex-direction:row;gap:16px;margin-bottom:0}}.name[_ngcontent-%COMP%] > p[_ngcontent-%COMP%]{font-weight:600;font-size:1.1875rem;line-height:1.75rem;text-align:center}@media (width > 576px){.name[_ngcontent-%COMP%] > p[_ngcontent-%COMP%]{text-align:left}}.organizations[_ngcontent-%COMP%]{display:flex;gap:8px}.organization[_ngcontent-%COMP%]{display:flex;position:relative;justify-content:center;align-items:center;gap:8px}.organization[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{z-index:1;box-shadow:rgb(from var(--bg-color) r g b / .3) 0 2px 8px -1px;border-radius:16px;background-color:var(--bg-color);padding:6px 10px;color:#fff;font-size:.75rem}.tooltip[_ngcontent-%COMP%]{display:block;position:absolute;top:0;opacity:0;transition:all .3s cubic-bezier(.68,-.55,.265,1.55);box-shadow:0 10px 10px #0000001a;border-radius:16px;background-color:var(--bg-color);padding:6px 10px;pointer-events:none;color:#fff;font-size:.75rem;line-height:1rem;white-space:nowrap}.tooltip[_ngcontent-%COMP%]:before{position:absolute;bottom:-3px;left:50%;transform:translate(-50%) rotate(45deg);transition:all .3s cubic-bezier(.68,-.55,.265,1.55);border-radius:2px;background-color:var(--bg-color);width:10px;height:10px;content:""}.organization[_ngcontent-%COMP%]:hover   .tooltip[_ngcontent-%COMP%]{top:-35px;visibility:visible;opacity:1;pointer-events:auto}p[_ngcontent-%COMP%]{margin:0}hr[_ngcontent-%COMP%]{display:none;border:none;background:var(--hr-gradient);height:2px}@media (width > 576px){hr[_ngcontent-%COMP%]{display:block}}div[_ngcontent-%COMP%] > img[_ngcontent-%COMP%]{display:none;border:4px solid var(--img-border-color);border-radius:100%;width:68px;height:68px}@media (min-width: 576px){div[_ngcontent-%COMP%] > img[_ngcontent-%COMP%]{display:block}}img[_ngcontent-%COMP%] ~ div[_ngcontent-%COMP%]{flex-grow:1}.contact-info[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;--icon-size: 18px}@media (width > 576px){.contact-info[_ngcontent-%COMP%]{justify-content:flex-start}}.contact-info[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{box-shadow:#0000000a 0 5px 16px;border-radius:100%;background-color:var(--contact-info-item-bg);padding:8px;line-height:0}.contact-info[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   [_ngcontent-%COMP%]:is(img, svg)[_ngcontent-%COMP%]{width:var(--icon-size);height:var(--icon-size)}a[_ngcontent-%COMP%]:has( > span[_ngcontent-%COMP%]:nth-child(2)){display:flex;align-items:center;gap:6px;border-radius:24px;font-size:.8125rem;line-height:1.125rem}@media (width > 576px){a[_ngcontent-%COMP%]:has( > span[_ngcontent-%COMP%]:nth-child(2)){padding:0 12px}}a[_ngcontent-%COMP%]:has( > span[_ngcontent-%COMP%]:nth-child(2))   svg-icon[_ngcontent-%COMP%]{display:contents}a[_ngcontent-%COMP%]:has( > span[_ngcontent-%COMP%]:nth-child(2))   svg[_ngcontent-%COMP%]{padding:1px}a[_ngcontent-%COMP%]:has( > span[_ngcontent-%COMP%]:nth-child(2))   span[_ngcontent-%COMP%]:nth-child(2){display:none}@media (width > 576px){a[_ngcontent-%COMP%]:has( > span[_ngcontent-%COMP%]:nth-child(2))   span[_ngcontent-%COMP%]:nth-child(2){display:block}}']});let t=n;return t})();export{F as ContributorCardComponent};
