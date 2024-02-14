'use client'

import {  MouseEvent,  useCallback,  useEffect,  useMemo,  useState } from 'react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import Logo from '../images/logo.png'

import { classNames } from '../utils/classNames'
import { ModelType, useAppConfig } from '../store'
import BotIcon from "../icons/bot.svg";
import BlackBotIcon from "../icons/black-bot.svg";
import KimiIcon from "../icons/kimi.svg";
import QuestionIcon from '../icons/question.svg'
import BeakerIcon from '../icons/beaker.svg'
import ApplicationsIcon from '../icons/applications.svg'

// 首页的点击路径

export interface MenuInfo{
  id: string;
  name: string;
  info: string;
  img: string | JSX.Element | undefined | null;
  path: string;
  border: boolean,
  model?: ModelType
}


export const MENUS:MenuInfo[] = [
  {
    id:'0',
    name: process.env.NEXT_PUBLIC_WEBSITE_NAME as string,
    info: '',
    img: null,
    path: '/',
    border: false,
  },
  {
    id: '1',
    name: 'GPT3.5',
    info: '免费',  
    img: <BotIcon className='w-9 h-9'/>,
    path: '/gpt',
    border: false,
    model: 'gpt-3.5-turbo'
  },
  {
    id: '2',
    name: 'GPT4',
    info:'限制',  
    img: <BlackBotIcon className='w-9 h-9'/>, 
    path: '/gpt-4',
    border: false,
    model: 'gpt-4-0125-preview'
  },
  {
    id: '3',
    name: 'Kimi',
    info: '免费',  
    img: <KimiIcon className="w-9 h-9 p-[3px]"/>,
    path: '/kimi',
    border: true,
    model: 'moonshot-v1-8k'
  },

  // {
  //   id: '4',
  //   name: '订阅 GPT4',//'充值',
  //   info:'',  
  //   img: <CurrencyYenIcon className="w-9 h-9 p-[3px]"/>,
  //   path: '/pay',
  //   border: true,
  // },
  {
    id: '4',
    name: '常见问题',
    info:'',  
    img: <QuestionIcon className="w-9 h-9 p-1 "/>,
    path: '/question',
    border: true,
  },
  {
    id: '5',
    name: '提示词',
    info:'',  
    img: <BeakerIcon className="w-9 h-9  p-1"/>,
    path: '/setting',
    border: true,
  },
  {
    id: '6',
    name: 'AI应用',
    info:'',  
    img: <ApplicationsIcon className="w-9 h-9 pl-2 p-1"/>,
    path: '/apps',
    border: true,
  }
]





const SideBar = ({close}:{close?:()=>void}) => {
  const router = useRouter()
  const pathname = usePathname()
  const menuId = useMemo(()=>(
    MENUS.find(menu=>menu.path === pathname)?.id || '0'
  ),[pathname]);
  
  const config = useAppConfig()
 

  
  const handleMenuClick = (e: MouseEvent<HTMLAnchorElement>, id:string)=>{
    e.preventDefault()
    const curMenu = MENUS.find((menu)=>menu.id === id)
    if(curMenu){
      if(curMenu.model){
        const modelConfig = { ...config.modelConfig };
        modelConfig.model = curMenu.model 
        // 修改当前模型
        config.update((config) => (config.modelConfig = modelConfig));
      }
      router.push(curMenu.path)
      if(close)
        close();
    }
    
  } 
  return <>
   
      <header className='h-[50px] sm:h-14 py-1 border-b flex items-center'>
        <a className='flex items-center px-4 w-full cursor-pointer' onClick={(e)=> handleMenuClick(e, '0')}>
          <Image
            className='rounded-xl w-8 sm:w-9'
            src={Logo}
            alt='logo'
            width={36}
            height={36}
          />
          <h1 className='text-xl text-violet-500 ml-3'>{process.env.NEXT_PUBLIC_WEBSITE_NAME}</h1>
        </a>
      </header>
      <ul className="">
        {MENUS.slice(1).map((menu:MenuInfo) => (
         <li key={menu.id} className={classNames(
            "hover:bg-gray-100 cursor-pointer sm:justify-start flex items-center justify-center",
            {'bg-gray-200':menu.id === menuId},
            {'border-b': menu.border}
          )}>
            <a className='flex items-center w-full px-4 py-3' href="#" onClick={(e)=> handleMenuClick(e, menu.id)}>
              {typeof menu.img === 'string' &&
                <Image
                  width={300}
                  height={150}
                  className="w-9 rounded-full object-cover"
                  src={menu.img as string}
                  alt="thumbnail"
                />
              }
              {typeof menu.img !== 'string' && menu.img}
              <div className='pl-2 hover:text-white transition-colors'>
              <p className="text-gray-900 text-base font-medium tracking-wide "> {menu.name}</p>
              {menu.info && <p className='text-gray-500 text-sm'>{menu.info}</p>}
              </div>
            </a>
          </li>
        ))
        }
      </ul>
      
  </>
}

export default SideBar
