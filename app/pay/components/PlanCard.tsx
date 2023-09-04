"use client"
import Card from "@/app/components/Card";
import { Plan } from "../page";
import { displayTokensNum } from "@/app/utils/format";
import CheckIcon from '../../icons/check.svg'
import { useModal } from "@/app/components/Modal";
import { useAccessStore } from "@/app/store";
import { toast } from "react-hot-toast";
import { copyToClipboard } from "@/app/utils";
import { useEffect, useState } from "react";


function PayModal({plan}: {plan:Plan}){
  const {closeModal} = useModal()
  const {id, email} = useAccessStore()
  const copyContent = `套餐ID：${plan.id}
套餐：${plan.name}
描述：${plan.llm.name} - ${displayTokensNum(plan.tokens)} tokens
金额：${plan.price}元
用户ID：${id}
邮箱：${email}
  `
  return  <>
    <div className="px-6 py-5 border-dotted border-b-2">
      <h4 className="text-violet-500 text-lg text-bold">确认购买套餐</h4>
    </div>
    <div className="overflow-y-auto px-6 py-6">
      <p>购买此套餐，需先添加管理员微信（微信：<span className='text-green-400'>ai_caikengren</span>），复制如下购买信息发送给管理员微信。</p>
      <div className="mt-4 text-gray-600">
        <p>套餐ID：{plan.id}</p>
        <p>套餐：{plan.name}</p>
        <p>描述：{plan.llm.name} - {displayTokensNum(plan.tokens)} tokens</p>
        <p>金额：{plan.price}元</p>
        <p>用户ID：{id.slice(0,6)}<span className='align-sub'>*****</span>{id.slice(-6)}</p>
        <p>邮箱：{email}</p>
      </div>
    </div>
    <div className="px-6 py-5 border-dotted border-t-2 flex justify-center items-center">
      <button className="px-4 py-1 rounded-lg bg-violet-500 text-white hover:bg-violet-600" onClick={()=>{
        copyToClipboard(copyContent).then(_=>{
          closeModal()
        }).catch(_=>null)
      }}>
      确认复制购买信息
      </button>
    </div>
  </>
}

export default function PlanCard({plan}: {plan:Plan}){

  const {openModal} = useModal()
  const accessStore = useAccessStore();
  const [userNew, setUserNew] = useState(false)

  useEffect(()=>{
    setUserNew(accessStore.new)
  }, [])

  return <Card 
    className='bg-white flex flex-col items-center duration-300 ease-in-out hover:shadow-xl hover:-translate-y-px'
    onClick={(e)=>{
      openModal(<PayModal plan={plan}/> , {containerClass:"flex flex-col justify-between ai-absolute-center rounded-2xl bg-white w-[calc(100%-32px)] sm:w-[520px] "})
      e.preventDefault()
    }}
    >
  <h3 className="text-lg text-gray-900  mb-3">{plan.name}</h3>
  {/* content */}
  <ul className='py-1'>
    {[plan.llm.name, 
      `${displayTokensNum(plan.tokens)} tokens` , 
      plan.period===-1?'永久有效':`${plan.period} 天`
    ].map((desc,idx)=>(
      <li key={idx} className='flex justify-start items-center pb-1'>
        <CheckIcon className='w-5 h-5 text-green-600 mr-2'></CheckIcon>
        <span className="text-gray-600">{desc}</span>
      </li>
    ))}
    {plan.onlyNew && userNew &&
      <li key={'onlyNew'} className='flex justify-start items-center pb-1'>
        <CheckIcon className='w-5 h-5 text-green-600 mr-2'></CheckIcon>
        <span className="text-gray-600">仅限新用户</span>
      </li>
    }
  </ul>
  {/* Price */}
  <div className="mt-2 mb-4">
    <div className="text-gray-800 font-bold flex items-end">
      <span className="text-xl line-through">￥{plan.originalPrice}</span>
      <div className="ml-2">
        <span className="text-2xl">￥</span>
        <span className="text-3xl" >{plan.price}</span>
      </div>
    </div>
  </div>
  <button 
    className="px-10 py-1 rounded-md text-violet-500 bg-violet-200 hover:text-white hover:bg-violet-500" >
    订阅
  </button>
</Card>
}