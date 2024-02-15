import * as clientCookie from 'react-cookies'
import { useAccessStore } from "../store";
import {  HttpOptions } from "./config";
import { toast } from "react-hot-toast";
import registerHttpFunctions from "./register";

import { AUTH_MAX_AGE, } from "@/app/config/auth";


export function saveCookieToken(token:string){
   //重新设置cookie（token）
   clientCookie.save('token', token,  {path: '/', maxAge: AUTH_MAX_AGE})
}

export function removeCookieToken(){
  clientCookie.remove('token', {path:'/'})
}

export function loadCookieToken(){
  return clientCookie.load('token');
}

const DEFAULT_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  "withCredentials": "false" , //在跨域的情况，是否要将cookie传给跨域的服务端
}



export const httpRequest = async (url:string, options:HttpOptions)=>{
  const {method, body, withToken=true, needErrHandle=true, ...otherOptions} = options;
  const accessStore = useAccessStore.getState();
  let auth = "";
  if( withToken){
    auth = `Bearer ${accessStore.token}` 
  }
  const fetchOptions : RequestInit = {
    method,
    headers: {
      ...DEFAULT_HEADERS,
      "Authorization": auth
    },
    body: body? JSON.stringify(body) : undefined,
    ...otherOptions,
  }
  url = `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`
  return fetch(url, fetchOptions)
      .then(response => { //处理未认证错误
        if(response.status === 401) {
          //尝试刷新token
          const refreshFetchOptions : RequestInit = {
            method:'POST',
            headers: {
              ...DEFAULT_HEADERS,
              },
            body: JSON.stringify({"refresh_token": accessStore.refreshToken})
          }
          return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/refresh_token`, refreshFetchOptions)
          .then(response2=>response2.json())
          .then(res=>{
            if (res.code >= 200 && res.code < 400 && res.data) {
              // 更新access Token
              const {accessToken} = res.data
              accessStore.updateToken(accessToken)
              saveCookieToken(accessToken)
              // console.log('refresh get accessToken:', accessToken);
              fetchOptions.headers = {
                ...DEFAULT_HEADERS,
                "Authorization": `Bearer ${accessToken}`
              }
              return fetch(url, fetchOptions) 
            }
            return response;
          })
        }
        return response;
      }) 
      .then(response => response.json()) //获取数据
      .then(res => {           //处理数据
        if (res.code >=200 && res.code < 400) {
          return res;
        }
        //处理接口错误
        if(needErrHandle){
          toast.error(res.errMsg)
        }
        return res;
      })
      .catch(err=>{ //出现意外错误
        toast.error(err.message)
        return {code: 5000, errMsg:err.message}; //返回成功的promise,内容为错误信息
      });

}



export const {httpGet, httpPost} =  registerHttpFunctions(httpRequest)