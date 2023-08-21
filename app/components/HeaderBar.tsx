'use client'

import React,{MouseEvent} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import BarsIcon from '../icons/bars-3.svg'
import { useModal } from './Modal'
import SideBar, { MENUS } from './SideBar'


const HeaderBar = () => {

  const pathname = usePathname()
  const menu = MENUS.find(menu=>menu.path===pathname)
  const { openModal, closeModal } = useModal()

  const handleClickExpand = (e: MouseEvent<HTMLButtonElement>)=>{
    openModal(
      <SideBar close={closeModal} /> ,
      {
        containerClass: 'h-full w-64 overflow-y-auto bg-white duration-300 ease-in-out transition-transform -translate-x-full',
        transitionEndStyle:{
          transform: 'translateX(0)'
        },
        transitionDuration:300,
      }
    )
  }
  return <>
   
      <header className='w-full h-[50px] sm:h-14 border-b flex justify-center items-center relative'>
        <button className='sm:hidden w-10 h-10 absolute top-1/2 left-3 -translate-y-1/2'
          onClick={handleClickExpand}>
        <BarsIcon className='w-8 h-8' />
        </button>
        <h1 className='text-lg font-bold'>{menu?.name}</h1>
      </header>
  </>
}

export default HeaderBar
