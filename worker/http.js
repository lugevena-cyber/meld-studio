export class ApiError extends Error {constructor(status,message){super(message);this.status=status;}}
export const json=(body,status=200,extra={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Vary':'Cookie',...extra}});
export async function limitedBody(request,limit){
 const reader=request.body?.getReader();if(!reader)return new Uint8Array();const chunks=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw new ApiError(413,'文件或数据过大');}chunks.push(value);}}finally{reader.releaseLock();}
 const data=new Uint8Array(size);let offset=0;for(const c of chunks){data.set(c,offset);offset+=c.length;}return data;
}
export async function bodyJSON(request,limit=8*1024*1024){try{return JSON.parse(new TextDecoder().decode(await limitedBody(request,limit)));}catch(e){if(e instanceof ApiError)throw e;throw new ApiError(400,'请求必须是有效 JSON');}}
