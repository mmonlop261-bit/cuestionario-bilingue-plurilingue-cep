// Proxy servidor: evita exponer credenciales y permite confirmar el registro.
const SCRIPT_URL=process.env.GOOGLE_SCRIPT_URL;
module.exports=async function(req,res){
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'Método no permitido'});
  if(!SCRIPT_URL)return res.status(503).json({ok:false,error:'Falta configurar GOOGLE_SCRIPT_URL en Vercel'});
  try{
    const data=typeof req.body==='string'?JSON.parse(req.body):req.body;
    if(!data||typeof data!=='object'||Array.isArray(data))return res.status(400).json({ok:false,error:'Datos no válidos'});
    if(JSON.stringify(data).length>50000)return res.status(413).json({ok:false,error:'Respuesta demasiado extensa'});
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
    let upstream;try{upstream=await fetch(SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(data),redirect:'follow',signal:controller.signal})}finally{clearTimeout(timeout)}
    const raw=await upstream.text();let parsed;try{parsed=JSON.parse(raw)}catch{throw Error('Google Apps Script no devolvió una confirmación JSON. Revisa el despliegue y los permisos.')} 
    if(!upstream.ok||!parsed.ok)throw Error(parsed.error||'No se confirmó el registro en Google Sheets');
    return res.status(200).json({ok:true,id:parsed.id||null});
  }catch(e){return res.status(502).json({ok:false,error:e.message||'Error de conexión'})}
};
