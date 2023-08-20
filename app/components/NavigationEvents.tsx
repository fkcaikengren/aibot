"use client"
import {  useMemo } from "react"
import { usePathname, } from "next/navigation"
import SideBar from "./SideBar";
import HeaderBar from "./HeaderBar";


const whiteList = ['/login', '/auth']; 

export default function NavigationEvents({
  children,
}: {
  children: React.ReactNode;
}){

  const pathname = usePathname()
 
  const inWhiteList = useMemo(() => { //在白名单内
    return whiteList.some(prefix => pathname.startsWith(prefix));
  }, [pathname])




  if( inWhiteList){
    return <>children</>
  }

  return <>
      <div className='hidden sm:block sm:w-60 min-h-screen transition-all border-r'>
        <SideBar></SideBar>
      </div> 
      <section  className="flex-1 flex flex-col max-w-full sm:max-w-[calc(100%-15rem)] ">
        <HeaderBar></HeaderBar>
        <div className='flex-1 max-h-full overflow-y-auto bg-gray-100 '>{children}</div>
      </section>
    </>

}