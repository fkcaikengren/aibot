"use client"

import { IconButton } from '@/app/components/Button';
import { useAccessStore } from '@/app/store';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import pick from 'lodash/pick'
import { useRouter } from 'next/navigation';
import { httpPost, saveCookieToken } from '@/app/http/client';
import { classNames } from '@/app/utils/classNames';
import { EMAIL_REGEX, PASSWORD_REGEX } from '@/app/constant';

interface FormItems{
  cname: string,
  fieldName: string;
  type: string;
  placeholder: string;
  reg: RegExp;
  errMsg: string;
}

const formItems: FormItems[] = [
  {
    cname: "邮箱",
    fieldName:'email',
    type: 'email',
    placeholder: '请输入邮箱',
    reg: EMAIL_REGEX,
    errMsg: '邮箱格式错误',
  },
  {
    cname: "密码",
    fieldName:'password',
    type: 'password',
    placeholder: '请输入密码',
    reg: PASSWORD_REGEX,
    errMsg: '长度需大于6位',
  }
]

export default function LoginForm(){
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const accessStore = useAccessStore();


  const onLogin = handleSubmit((body)=>{
    setLoading(true)
    httpPost('/sessions', body, false).then(res=>{
      if(res.code >= 200 && res.code < 400  && res.data){
        res.data.token = res.data.accessToken
        // 保存用户信息
        accessStore.init(pick(res.data, ['token', 'refreshToken','id', 'nickname', 'avatar', 'email', 'phone', 'role', 'new']))
        // 保存到cookie
        saveCookieToken(res.data.token)
        
        // 跳转
        toast.success("登录成功")
        router.push('/')
      }else{
        setLoading(false)
      }
      
    })
  })
  
  return <form className='leading-normal'
      onSubmit={onLogin}>
          {
            formItems.map(item=>(
              <div key={item.fieldName} className='flex flex-col'>
               
                <input className='rounded-full border w-full px-4 py-2 bg-white overflow-hidden hover:border-violet-500 leading-normal focus:border-violet-500'
                  placeholder={item.placeholder}
                  type={item.type}
                  {...register(item.fieldName, {
                    required: `请输入${item.cname}`,
                    pattern: {
                      value: item.reg,
                      message: item.errMsg
                    },
                  })} />
            
                <p className='pl-3 min-h-[26px] leading-tight text-red-600 text-sm'>{errors[item.fieldName]?.message as string}</p>
              </div>
            ))
          }

          <div className='flex'>
          <button 
            className={classNames('flex-1 py-2 px-4 text-white bg-violet-500 hover:bg-violet-600 disabled:bg-violet-600 rounded-full ',{
              'cursor-pointer':!loading,
              'cursor-progress': loading
            })}
            disabled={loading}
            type="submit" >
              {loading?"登录中...":"登录"}
          </button>
          </div>
          
        </form>
}