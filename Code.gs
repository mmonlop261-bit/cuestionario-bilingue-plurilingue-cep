// IMPORTANTE: reemplaza el código anterior en Apps Script y actualiza la implementación.
const SHEET_NAME='RESPUESTAS';
function doPost(e){
 const lock=LockService.getScriptLock();
 try{
  lock.waitLock(20000);
  const datos=JSON.parse(e.postData.contents);
  if(!datos||Array.isArray(datos)||typeof datos!=='object')throw Error('Datos no válidos');
  const hoja=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if(!hoja)throw Error('No existe la hoja RESPUESTAS');
  const headers=hoja.getRange(1,1,1,hoja.getLastColumn()).getDisplayValues()[0];
  const id=Utilities.getUuid(),fecha=new Date();
  const fila=headers.map(h=>{
   const key=String(h).trim();
   if(key==='ID respuesta')return id;
   if(key==='Fecha y hora')return fecha;
   const v=datos[key];
   if(v===undefined||v===null)return '';
   if(Array.isArray(v))return v.join(' | ');
   if(typeof v==='object')return JSON.stringify(v);
   if(typeof v==='string'&&/^[=+\-@]/.test(v))return "'"+v;
   return v;
  });
  hoja.appendRow(fila);
  return json({ok:true,mensaje:'Respuesta registrada correctamente',id});
 }catch(error){return json({ok:false,error:String(error.message||error)})}
 finally{if(lock.hasLock())lock.releaseLock()}
}
function doGet(){return json({ok:true,mensaje:'Servicio de recepción de respuestas activo'})}
function json(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)}
