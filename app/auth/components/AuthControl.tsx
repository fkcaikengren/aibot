"use client"

import {  httpGet, loadCookieToken, removeCookieToken, saveCookieToken } from "@/app/http/client";
import { useAccessStore } from "@/app/store";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import * as clientCookie from 'react-cookies'

/* 实现服务端的401错误处理、刷新access token功能
场景：
  cookie和内存中的token都过期了
  cookie中的token被清除

*/
export default function AuthControl() {
  const router  = useRouter()
  const searchParams = useSearchParams()


  const logout = ()=>{
     //退出登录
     useAccessStore.getState().reset();
     removeCookieToken();
     router.push('/login')
  }

  useEffect(()=>{
    
    (async ()=>{

      const token = loadCookieToken();
      if(!token){
        logout();
        return;
      }

      const res = await httpGet('/verify_token'); 
      if(res.code >= 200 && res.code<400){ //成功
        
        const {token} = useAccessStore.getState()
        console.log('set token: ', token)
        saveCookieToken(token)
        const path = searchParams.get('redirect')
        if(path)
          router.push(`${path}?from=auth`)
        else
          router.push('/')
        router.refresh(); //!important. 跳转路由时“刷新”，触发server component request（不会刷新浏览器）
      }else{
        logout();
      }
      
    })();
  },[])
  return null;
}