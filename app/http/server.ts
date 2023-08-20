import { cookies } from "next/headers";
import {  HttpOptions } from "./config";
import { redirect } from "next/navigation";
import registerHttpFunctions from "./register";
import { isRedirectError } from "next/dist/client/components/redirect";




export const httpRequest = async (url:string, options:HttpOptions)=>{
  const serverCookie = cookies();
  const token = serverCookie.get('token')?.value
  const {method, body, withToken=true,needErrHandle=true, ...otherOptions} = options;
  let auth = '';
  if( withToken){
    auth = `Bearer ${token}` 
  }
  const fetchOptions : RequestInit = {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      "Authorization": auth
      },
    body: body? JSON.stringify(body) : undefined,
    ...otherOptions,
  }
  url = `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`

  return fetch(url, fetchOptions)
      .then(response => { //处理401错误
        if(needErrHandle && response.status === 401){
          redirect('/auth')  //这个一定会抛出错误，交给Next处理才能实现重定向
        }
        return response
      })
      .then(response=>response.json()) //获取数据
      .catch(err=>{ //出现意外错误 (比如前面重定向了)
        if(isRedirectError(err)){
          throw err;
        }
        return {code: 5000, errMsg:err.message}; //返回成功的promise,内容为错误信息
      });
}



export const {httpGet, httpPost} =  registerHttpFunctions(httpRequest)