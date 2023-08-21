"use client"
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Prompt,  usePromptStore } from "../../store/prompt";


import { classNames } from "@/app/utils/classNames";
import { useModal } from "@/app/components/Modal";




export default function EditPromptModal({
  prompt={id:-1, title:'',content:'',isUser:true}}: {prompt?: Prompt }
  ) {
  const promptStore = usePromptStore();
  const {closeModal} = useModal()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();


  return <>
    <div className="px-6 py-5 border-dotted border-b-2">
      <h4 className="text-lg text-bold">{prompt.isUser?'编辑提示词':'查看提示词'}</h4>
    </div>
    <div className="overflow-y-auto px-6 py-6  ">
    <form>
      <div className="">
        <input
          className={classNames("w-full p-2 border rounded-lg mb-4",{
            'border-red-500': !!errors['title']
          })}
          type="text"
          placeholder='名字'
          {... prompt.isUser ?  register('title', {
            required: "必填项",
          }) : {} }
          defaultValue={prompt.title}
          readOnly={!prompt.isUser}
          
        ></input>
        <textarea
          className={classNames("w-full p-2 resize-none leading-normal border rounded-lg",{
            'border-red-500': !!errors['content']
          })}
          placeholder="内容"
          rows={5}
          {... prompt ?  register('content', {
            required: "必填项",
          }):{}}
          defaultValue={prompt.content} 
          readOnly={!prompt.isUser}
        ></textarea>
      </div>
      
    </form>
    </div>
    <div className="px-6 py-5 border-dotted border-t-2 flex flex-row-reverse items-center">
      <button 
        className=" border px-3 py-1 rounded-lg border-violet-500 text-violet-500 bg-violet-300 hover:text-white hover:bg-violet-600 transition-all duration-300"
        type="submit"  
        onClick={
          prompt.isUser ? 
            handleSubmit( 
              (data) => {
                if(prompt.id>=0){ //修改
                  promptStore.update(prompt.id, (savedPrompt)=>{
                    savedPrompt.id = prompt.id;
                    savedPrompt.title = data.title;
                    savedPrompt.content = data.content;
                  })
                }else{
                  promptStore.add({ //添加，add时会设置isUser=true;
                    title: data.title,
                    content: data.content,
                  })
                }
              closeModal();
            })
          : ()=> {closeModal()} 
        }
      >{prompt.isUser ? '确认': '关闭' }</button>
    </div>
  </>
 
  
}


