
'use client'
import Link from 'next/link'
import APP_LANGUAGE_CONFIG, { APP_LANGUAGE_PATHNAME } from '../config';
import { usePathname } from "next/navigation";

const FunctionBar = ()=>{

  const pathname = usePathname()

   {/* 底部tabs */}
  return <div className='absolute bottom-0 left-0 w-full  h-[54px]'>
    <div
   className="h-full flex flex-row items-center justify-around border-t md:border-t-0 max-w-3xl m-auto"
   role="tablist">
  
   {APP_LANGUAGE_CONFIG.map(tab=>{
     const BottomIcon = tab.Icon
     const targetHref = `${APP_LANGUAGE_PATHNAME}${tab.pathname}`
     return (
       <Link
       key={tab.id}
       className='flex flex-col items-center'
       href={targetHref}
       >
        <BottomIcon className='w-6 h-6'/>
        {pathname === targetHref &&
          <span>
            {tab.name}
          </span>
        }
      </Link>
    )
   })

   }
 </div>
  </div>
}



export default FunctionBar