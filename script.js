const $=s=>document.querySelector(s), feed=$('#feed');
let recognition=null,listening=false;
const synth=window.speechSynthesis;
const memory={name:'Mohit'};

function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function log(who,msg){const p=document.createElement('p');p.innerHTML=`<b>${escapeHtml(who)}:</b> ${escapeHtml(msg)}`;feed.prepend(p)}
function speak(text){
  text=String(text||'').replace(/\*\*/g,'');
  log('NOVA',text);
  if(!synth)return;
  synth.cancel();
  const u=new SpeechSynthesisUtterance(text);u.lang='hi-IN';u.rate=.96;u.pitch=.88;
  const voices=synth.getVoices();
  const v=voices.find(x=>/^hi(-|_)?IN/i.test(x.lang))||voices.find(x=>/Hindi/i.test(x.name));
  if(v)u.voice=v;
  synth.speak(u);
}

function sayTime(){return `अभी ${new Intl.DateTimeFormat('hi-IN',{timeStyle:'medium',timeZone:'Asia/Kolkata'}).format(new Date())} है।`}
function sayDate(){return `आज ${new Intl.DateTimeFormat('hi-IN',{dateStyle:'full',timeZone:'Asia/Kolkata'}).format(new Date())} है।`}
async function getWeather(){
  try{
    let lat=26.9124,lon=75.7873,place='जयपुर';
    if(navigator.geolocation){
      try{const p=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:3500}));lat=p.coords.latitude;lon=p.coords.longitude;place='आपकी current location';}catch(e){}
    }
    const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`);
    if(!r.ok)throw new Error('weather');
    const d=await r.json(),c=d.current;
    const map={0:'साफ आसमान',1:'मुख्यतः साफ',2:'आंशिक बादल',3:'बादल',45:'कोहरा',48:'कोहरा',51:'हल्की बूंदाबांदी',53:'बूंदाबांदी',55:'तेज बूंदाबांदी',61:'हल्की बारिश',63:'बारिश',65:'तेज बारिश',71:'हल्की बर्फ',80:'बारिश की बौछार',81:'बारिश की बौछार',82:'तेज बौछार',95:'गरज के साथ बारिश'};
    $('#weather').textContent=`${Math.round(c.temperature_2m)}°C`;
    return `${place} में अभी तापमान ${Math.round(c.temperature_2m)} डिग्री है, महसूस ${Math.round(c.apparent_temperature)} डिग्री जैसा हो रहा है। ${map[c.weather_code]||'मौसम सामान्य है'}। हवा ${Math.round(c.wind_speed_10m)} किलोमीटर प्रति घंटे है।`;
  }catch(e){return 'अभी live weather नहीं मिल पाया। Location permission देकर फिर पूछो।'}
}

function normalizeQuery(q){
  return String(q||'').toLowerCase().replace(/[?？!！,.،。]/g,' ').replace(/\s+/g,' ').trim();
}
function localBrain(q){
  const x=normalizeQuery(q);
  if(!x)return 'हाँ Mohit, मैं सुन रहा हूँ।';

  // IMPORTANT: specific intents first, so natural sentences are not mis-routed.
  if(/(मौसम|weather|तापमान|temperature|बारिश|rain|बादल|cloud|गरमी|गर्मी|ठंड|सर्दी)/.test(x))return null;
  if(/(कितने बजे|क्या समय|समय क्या|अभी समय|time|clock)/.test(x))return sayTime();
  if(/(आज की तारीख|आज तारीख|तारीख क्या|date|आज कौन सा दिन|today)/.test(x))return sayDate();

  if(/(तुम कौन|तुम्हारा नाम|आप कौन|who are you|your name|what are you)/.test(x))
    return 'मैं NOVA हूँ, Mohit का personal AI assistant। मैं तुम्हारी आवाज़ समझकर जवाब देने और supported phone actions में मदद करने के लिए बना हूँ।';
  if(/(जोक|joke|हंसाओ|funny|मजाक|मज़ाक)/.test(x))
    return 'Mohit, मेरा processor इतना तेज है कि कभी-कभी Wi-Fi भी मुझसे पूछता है—भाई थोड़ा धीरे चल! 😄';
  if(/(मूड|खुश|happy|sad|उदास|कैसा महसूस)/.test(x))
    return 'Boss, mood चाहे जैसा हो, मैं तुम्हारे साथ हूँ। चलो आज कुछ अच्छा करते हैं। 😎';
  if(/(मोटिवेट|motivat|हार मान|confidence|हिम्मत)/.test(x))
    return 'याद रखो: perfect होने का इंतज़ार मत करो। एक छोटा कदम अभी उठाओ—बाकी रास्ता हम साथ तय करेंगे।';
  if(/(धन्यवाद|thank|thanks|शुक्रिया)/.test(x))return 'Anytime, boss! 😎';
  if(/^(हैलो|hello|hi|hey|नमस्ते|नमस्कार)(\s|$)/.test(x))return 'नमस्ते Mohit! NOVA online है। बताओ, आज क्या करना है?';
  if(/(मदद|help|क्या कर सकते|commands)/.test(x))return 'मैं time, date, live weather, jokes, motivation, normal बातचीत और supported phone controls संभाल सकता हूँ। Android app में background voice mode भी है।';
  if(/(बैटरी|battery)/.test(x))return window.Android&&Android.getBattery?'बैटरी status check कर रहा हूँ।':'Browser में battery access सीमित है; native NOVA app में यह बेहतर तरीके से जोड़ा जा सकता है।';
  if(/(whatsapp|व्हाट्सएप)/.test(x))return 'WhatsApp खोल रहा हूँ।';
  if(/(youtube|यूट्यूब)/.test(x))return 'YouTube खोल रहा हूँ।';
  if(/(instagram|इंस्टाग्राम)/.test(x))return 'Instagram खोल रहा हूँ।';
  if(/(कैमरा|camera)/.test(x))return 'Camera खोल रहा हूँ।';
  return 'मैंने तुम्हारी बात सुनी है। इस public website में private AI API key डालना सुरक्षित नहीं है। अभी मैं built-in commands संभाल रहा हूँ; पूरी सामान्य बातचीत के लिए secure AI backend जोड़ना अगला चरण है।';
}

async function runCommand(q){
  const x=q.toLowerCase();
  if(/(whatsapp|व्हाट्सएप)/.test(x)&&window.Android){Android.openApp('whatsapp');return 'WhatsApp खोल रहा हूँ।';}
  if(/(youtube|यूट्यूब)/.test(x)&&window.Android){Android.openApp('youtube');return 'YouTube खोल रहा हूँ।';}
  if(/(instagram|इंस्टाग्राम)/.test(x)&&window.Android){Android.openApp('instagram');return 'Instagram खोल रहा हूँ।';}
  if(/(chrome|browser|ब्राउज़र)/.test(x)&&window.Android){Android.openApp('chrome');return 'Browser खोल रहा हूँ।';}
  if(/(camera|कैमरा)/.test(x)&&window.Android){Android.openApp('camera');return 'Camera खोल रहा हूँ।';}
  if(/(wi.?fi|वाई.?फाई)/.test(x)&&window.Android){Android.openSettings('wifi');return 'Wi-Fi settings खोल रहा हूँ।';}
  if(/(bluetooth|ब्लूटूथ)/.test(x)&&window.Android){Android.openSettings('bluetooth');return 'Bluetooth settings खोल रहा हूँ।';}
  if(/(आवाज़ बढ़ाओ|volume up|volume बढ़ाओ)/.test(x)&&window.Android){Android.volume(true);return 'Volume बढ़ा रहा हूँ।';}
  if(/(आवाज़ कम|volume down|volume घटाओ)/.test(x)&&window.Android){Android.volume(false);return 'Volume कम कर रहा हूँ।';}
  const local=localBrain(q);
  if(local!==null)return local;
  return await getWeather();
}

async function ask(){const q=$('#q').value.trim();if(!q)return;log('YOU',q);$('#q').value='';$('#status').textContent='THINKING';const a=await runCommand(q);$('#status').textContent=listening?'LISTENING':'STANDBY';speak(a)}
$('#ask').onclick=ask;
$('#q').addEventListener('keydown',e=>{if(e.key==='Enter')ask()});
document.querySelectorAll('[data-cmd]').forEach(b=>b.onclick=()=>{$('#q').value=b.dataset.cmd;ask()});
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=async()=>{const a=b.dataset.action;if(window.Android){if(['whatsapp','youtube','instagram','chrome','camera'].includes(a))Android.openApp(a);else if(a==='wifi'||a==='bluetooth')Android.openSettings(a);else Android.openSettings('general')}else speak(`${a} खोलने के लिए NOVA Android app इस्तेमाल करें।`)});

function start(){
 if(!('webkitSpeechRecognition'in window||'SpeechRecognition'in window)){speak('इस browser में microphone speech recognition उपलब्ध नहीं है।');return}
 const R=window.SpeechRecognition||window.webkitSpeechRecognition;recognition=new R();recognition.lang='hi-IN';recognition.continuous=true;recognition.interimResults=false;
 recognition.onstart=()=>{listening=true;document.body.classList.add('listening');$('#status').textContent='LISTENING';$('#voiceState').textContent='ON'};
 recognition.onend=()=>{if(listening)try{recognition.start()}catch(e){}};
 recognition.onerror=e=>{if(e.error==='not-allowed'){listening=false;$('#voiceState').textContent='BLOCKED';speak('Microphone permission blocked है। Browser site settings में microphone Allow करो।')}};
 recognition.onresult=async e=>{const t=e.results[e.results.length-1][0].transcript;const x=t.toLowerCase();log('YOU',t);if(x.includes('nova')||x.includes('नोवा')){const q=x.replace(/nova|नोवा/gi,'').trim();$('#status').textContent='THINKING';const a=await runCommand(q);$('#status').textContent='LISTENING';speak(q?a:'हाँ Mohit, मैं सुन रहा हूँ।')}};
 try{recognition.start()}catch(e){}
}
function stop(){listening=false;document.body.classList.remove('listening');$('#status').textContent='STANDBY';$('#voiceState').textContent='OFF';recognition?.stop()}
$('#mic').onclick=()=>listening?stop():start();
$('#speak').onclick=()=>speak('हाँ Mohit, NOVA online है। मैं सुन रहा हूँ।');
$('#theme').onclick=()=>{document.documentElement.style.setProperty('--c',getComputedStyle(document.documentElement).getPropertyValue('--c').trim()==='#54e8ff'?'#ff6adf':'#54e8ff');document.documentElement.style.setProperty('--c2','#9b7bff')};
setInterval(()=>{$('#clock').textContent=new Intl.DateTimeFormat('en-IN',{timeStyle:'medium',hour12:false,timeZone:'Asia/Kolkata'}).format(new Date());$('#date').textContent=new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeZone:'Asia/Kolkata'}).format(new Date())},500);
if(!navigator.onLine)$('#network').textContent='OFFLINE';

// === NOVA secure AI backend bridge ===
window.novaAskBackend = async function(message, useWeb=false){
  const base=(window.NOVA_CONFIG&&window.NOVA_CONFIG.BACKEND_URL||'').replace(/\/$/,'');
  if(!base)return null;
  try{
    const history=Array.from(document.querySelectorAll('#feed p')).slice(0,10).reverse().map(p=>{
      const t=p.textContent||'',i=t.indexOf(':'); if(i<0)return null;
      const who=t.slice(0,i).trim().toUpperCase();
      return {role:who==='YOU'?'user':'assistant',content:t.slice(i+1).trim()};
    }).filter(Boolean);
    const r=await fetch(base,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,history,useWeb})});
    if(!r.ok)return null; const d=await r.json(); return d.reply||null;
  }catch(e){return null;}
};
const novaOldRunCommand=window.runCommand;
window.runCommand=async function(q){
  const normalized=String(q||'').toLowerCase();
  const builtIn=/(मौसम|weather|तापमान|temperature|बारिश|rain|कितने बजे|समय|time|clock|तारीख|date|जोक|joke|मजाक|मज़ाक|मोटिवेट|motivat|whatsapp|व्हाट्सएप|youtube|यूट्यूब|instagram|इंस्टाग्राम|camera|कैमरा|wi.?fi|वाई.?फाई|bluetooth|ब्लूटूथ|volume|आवाज़|तुम कौन|तुम्हारा नाम|hello|हैलो|नमस्ते|help|मदद)/.test(normalized);
  if(!builtIn){
    const ai=await window.novaAskBackend(q,/latest|today|news|current|अभी|आज|ताज़ा|ताजा/.test(normalized));
    if(ai)return ai;
  }
  return await novaOldRunCommand(q);
};
