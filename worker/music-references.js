import {limitedBody} from './http.js';

const jackson=/迈克尔[·・\s-]*杰克逊|michael jackson|\bmj\b|billie jean|thriller|in the closet/i;
const rhythm=/linn(?:drum)?|martyn ware|鼓机|drum machine|synthwave|合成器流行/i;
const studies=[
 {matches:jackson,title:'Melohum · 迈克尔·杰克逊编曲研习',
  url:'https://blog.discmakers.com/2010/05/in-the-studio-with-michael-jackson/',
  notes:'Build the groove with a tight backbeat and a short, syncopated electric bass figure. Add muted guitar or clavinet on alternate offbeats. Use occasional brass answers and a separate sustained string layer. Bring voices in gradually and reserve the clearest new hook for the fuller section. For a harder New Jack Swing take, leave space between short kicks, bass and percussion hits. These are original arrangement exercises inspired by abstract techniques.'},
 {matches:rhythm,title:'Melohum · 鼓机段落研习',
  url:'https://articles.roland.com/careers-in-music-technology-and-chart-toppers-with-martyn-ware/',
  notes:'Keep a stable drum motif for three bars. On the fourth bar, introduce a short kick pickup and a brief hat rest before the next section. Let bass answer the kick and keep the lead phrasing and pauses intact.'},
];
const subjects=[
 [jackson,'Michael Jackson'],
 [/new\s*jack\s*swing|新杰克摇摆/i,'New jack swing'],
 [/synthwave|合成波/i,'Synthwave'],
 [/dubstep|回响贝斯/i,'Dubstep'],
 [/funk|放克/i,'Funk'],
 [/disco|迪斯科/i,'Disco'],
 [/bossa(?:\s*nova)?|波萨诺瓦/i,'Bossa nova'],
 [/\br\s*&\s*b\b|节奏布鲁斯/i,'Rhythm and blues'],
 [/爵士|\bjazz\b/i,'Jazz'],
 [/萨尔萨|salsa/i,'Salsa music'],
];

export async function musicReferences(message,online){
 const references=studies.filter(study=>study.matches.test(message)).map(({title,url,notes})=>({title,url,notes}));
 if(!online)return references;
 const known=subjects.find(([pattern])=>pattern.test(message))?.[1];
 const named=/(?:^|[，。\n])\s*(?:参考|风格是|风格为|借鉴)\s*([\p{L}\p{M} .'-]{2,32})(?:风格|[，。\n]|$)/u.exec(message)?.[1]?.trim();
 const subject=known||named;
 if(!subject)return references;
 const detailed=/\d+\s*(?:bpm|小节)/i.test(message)&&/verse|chorus|副歌|主歌|前奏|段落/i.test(message);
 if(detailed&&!/参考|借鉴|查找|搜|research/i.test(message))return references;
 const host=/[\p{Script=Han}]/u.test(subject)?'zh.wikipedia.org':'en.wikipedia.org';
 const url=new URL('/w/api.php','https://'+host);
 url.search=new URLSearchParams({action:'query',generator:'search',gsrsearch:subject,gsrnamespace:'0',gsrlimit:'2',
  prop:'extracts',exintro:'1',explaintext:'1',exchars:'850',format:'json',formatversion:'2'}).toString();
 try{
  const response=await fetch(url.href,{headers:{'Api-User-Agent':'Melohum/1.0 (https://melohum.com; music style references)'},signal:AbortSignal.timeout(3500)});
  if(!response.ok)return references;
  const data=JSON.parse(new TextDecoder().decode(await limitedBody(response,64*1024)));
  for(const page of (data.query?.pages||[]).slice(0,2)){
   if(!Number.isInteger(page.pageid)||typeof page.title!=='string'||!page.extract)continue;
   references.push({title:page.title.slice(0,100),url:`https://${host}/?curid=${page.pageid}`,notes:String(page.extract).slice(0,850)});
  }
 }catch{/* A lookup can fail without interrupting composition. */}
 return references;
}
