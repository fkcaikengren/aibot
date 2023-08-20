import { HttpRequest } from "./config"




const registerHttpFunctions = (http: HttpRequest)=>{
   function httpGet(url:string, withToken:boolean=true, needErrHandle:boolean=true) {
    return http(url, {
      method: 'GET',
      withToken,
      needErrHandle,
    })
  }
  function httpPost(url:string, body:object, withToken:boolean=true, needErrHandle:boolean=true ) {
    return http(url, {
      method: 'POST',
      body,
      withToken,
      needErrHandle,
    })
  }

  return {httpGet, httpPost}
}

export default registerHttpFunctions;