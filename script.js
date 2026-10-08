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

function localBrain(q){
  const x=q.toLowerCase().trim();
  if(!x)return 'हाँ Mohit, मैं सुन रहा हूँ।';
  if(/(तुम कौन|तुम्हारा नाम|who are you|your name)/.test(x))return 'मैं NOVA हूँ, Mohit का personal AI assistant। मैं तुम्हारे साथ normal बातचीत, voice commands और supported phone actions में मदद करने के लिए बना हूँ।';
  if(/(समय|कितने बजे|time|clock)/.test(x))return sayTime();
  if(/(तारीख|आज कौन सा दिन|date|day)/.test(x))return sayDate();
  if(/(मौसम|weather|तापमान|temperature|बारिश)/.test(x))return null;
  if(/(जोक|joke|हंसाओ|funny)/.test(x))return 'Mohit, मेरा processor इतना तेज है कि कभी-कभी Wi-Fi भी मुझसे पूछता है—भाई थोड़ा धीरे चल! 😄';
  if(/(मूड|खुश|happy|sad|उदास)/.test(x))return 'Boss, mood चाहे जैसा हो, आज एक छोटा सा काम पूरा करके जीत शुरू करते हैं। मैं यहीं हूँ। 😎';
  if(/(मोटिवेट|motivat|हार मान|confidence)/.test(x))return 'याद रखो: perfect होने का इंतज़ार मत करो। एक छोटा कदम अभी उठाओ—बाकी रास्ता NOVA तुम्हारे साथ तय करेगा।';
  if(/(धन्यवाद|thank|thanks)/.test(x))return 'Anytime, boss! 😎';
  if(/(हैलो|hello|hi|hey|नमस्ते)/.test(x))return 'नमस्ते Mohit! NOVA online है। बताओ, आज क्या करना है?';
  if(/(मदद|help|क्या कर सकते)/.test(x))return 'मैं time, date, live weather, बातचीत, jokes, motivation और supported phone controls संभाल सकता हूँ। Android app में background voice mode भी है।';
  if(/(बैटरी|battery)/.test(x))return window.Android&&Android.getBattery?'बैटरी status check कर रहा हूँ।':'Browser में battery access सीमित है; native NOVA app में यह बेहतर तरीके से जोड़ा जा सकता है।';
  if(/(whatsapp|व्हाट्सएप)/.test(x))return 'WhatsApp खोल रहा हूँ।';
  if(/(youtube|यूट्यूब)/.test(x))return 'YouTube खोल रहा हूँ।';
  if(/(instagram|इंस्टाग्राम)/.test(x))return 'Instagram खोल रहा हूँ।';
  if(/(कैमरा|camera)/.test(x))return 'Camera खोल रहा हूँ।';
  return 'मैंने तुम्हारी बात समझने की कोशिश की। इस वेबसाइट में secure AI Brain जोड़ने के लिए private server/API endpoint चाहिए; public GitHub page में secret API key रखना सुरक्षित नहीं है। फिलहाल मैं time, date, weather, conversation और built-in commands तुरंत संभाल सकता हूँ।';
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
