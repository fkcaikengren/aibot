

export function prettyObject(msg: any) {
  const obj = msg;
  if (typeof msg !== "string") {
    msg = JSON.stringify(msg, null, "  ");
  }
  if (msg === "{}") {
    return obj.toString();
  }
  if (msg.startsWith("```json")) {
    return msg;
  }
  return ["```json", msg, "```"].join("\n");
}



export function displayTokensNum(num:number):string|number{
  if(num <=0 )
    return num;
  const fa = num/10000
  const a = Math.floor(fa)
  num = num%10000;
  if(num%1000 === 0){
    if(num>0){
      return `${fa.toFixed(1)}W`
    }else{
      return `${fa.toFixed(0)}W`
    }
  }

  // 分隔处理
  return num.toLocaleString();
}