"use client"


import { useEffect, useMemo, useState } from "react";
import { useModal } from "@/app/components/Modal";
import { IconButton } from "@/app/components/Button";

import { Prompt, SearchService, usePromptStore } from "../../store/prompt";

import ReloadIcon from "../../icons/reload.svg";
import AddIcon from "../../icons/add.svg";
import DeleteIcon from "../../icons/delete.svg";
import EditIcon from "../../icons/edit.svg";
import EyeIcon from "../../icons/eye.svg";
import LoadingIcon from '../../icons/three-dots.svg'
import EditPromptModal from "./EditPromptModal";
import { httpGet } from "@/app/http/client";


export default function UserPrompt(props: { onClose?: () => void }) {
  const promptStore = usePromptStore();
  const {userPrompts, builtinPrompts, getAllPrompts} = promptStore

  const [searchInput, setSearchInput] = useState("");
  const [searchPrompts, setSearchPrompts] = useState<Prompt[]>([]);
  
  const [clientReady, setClientReady] = useState(false);
  const [loading, setLoading] = useState(false)

  const {openModal} = useModal()

  // const builtinPromptsLength = useMemo(()=>{
  //   return Object.keys(builtinPrompts).length;
  // },[builtinPrompts])

  const allPrompts = useMemo(()=>{
    return getAllPrompts();
  }, [userPrompts, builtinPrompts])

  const prompts = useMemo(()=>{
    if(!clientReady){
      return []
    }
    const prompts = searchInput.length > 0 ? searchPrompts : allPrompts;
    return prompts;
  },[allPrompts, searchInput, searchPrompts, clientReady])

  useEffect(() => {
    if (searchInput.length > 0) {
      const searchResult = SearchService.search(searchInput);
      setSearchPrompts(searchResult);
    } else {
      setSearchPrompts([]);
    }
  }, [searchInput]);

  useEffect(()=>{
    setTimeout(()=>{
      setClientReady(true);
    },10)
  }, [])

  const onLoadPrompts = ()=>{
    setLoading(true)
    httpGet('/prompts/cn').then(res=>{
      if(res.code===200 && res.data){
        //初始化
        const builtinPromptsArray = res.data.map(
          (arr: string[],i:number) =>
            ({
              id: parseFloat((i/res.data.length).toFixed(6)),
              title:arr[0],
              content:arr[1],
            } as Prompt),
        );

        SearchService.updateBuiltinPrompts(builtinPromptsArray)
        promptStore.setBuiltinPrompts(builtinPromptsArray);
      }
      setLoading(false)
    })
  }

  const actionBtnClass = 'hover:bg-gray-200 p-2 rounded-lg'

  const modalOptions = useMemo(()=> 
    ({containerClass:"flex flex-col justify-between ai-absolute-center rounded-2xl bg-white w-[calc(100%-32px)] sm:w-[520px]"}),
  [])

  return (
    <div className="h-full flex flex-col ">
      <input
        type="text"
        className='w-full p-2 rounded-lg mb-4 border'
        placeholder={'搜索提示词'}
        value={searchInput}
        onInput={(e) => setSearchInput(e.currentTarget.value)}
      ></input>

      <div className='relative flex-1 max-w-full overflow-y-auto border rounded-lg '>
        {prompts.map((v, _) => (
          <div className='flex justify-between border-b px-3 py-2' key={v.id ?? v.title}>
            <div className='flex-1 max-w-[calc(100%-5.5rem)]'>
              <div className='font-bold text-base'>{v.title}</div>
              <div className='text-ellipsis whitespace-nowrap overflow-hidden'>
                {v.content}
              </div>
            </div>

            <div className='flex items-center justify-end gap-1'>
              {v.isUser && (
                <IconButton
                  icon={<DeleteIcon className='w-5 h-5'/>}
                  className={actionBtnClass}
                  onClick={() => promptStore.remove(v.id!)}
                />
              )}
              {v.isUser ? (
                <IconButton
                  icon={<EditIcon className='w-5 h-5'/>}
                  className={actionBtnClass}
                  onClick={() => {
              
                    openModal(<EditPromptModal prompt={v}/>, modalOptions)
                  }}
                />
              ) : (
                <IconButton
                  icon={<EyeIcon className='w-5 h-5'/>}
                  className={actionBtnClass}
                  onClick={() => openModal(<EditPromptModal prompt={v}/>, modalOptions)}
                />
              )}

            </div>
          </div>
        ))}
        {loading &&
          <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-[rgba(255,255,255,0.9)]">
            <LoadingIcon className="w-12"/>
          </div>
        }
      </div>

      <div className="flex flex-row-reverse justify-between items-center  mt-4">
        
        <div className='flex items-center flex-shrink-0'>
          <IconButton
            key="load"
            className="hover:bg-gray-200 p-2 rounded-lg border mr-3"
            disabled={loading}
            onClick={onLoadPrompts}
            icon={<ReloadIcon className='w-[1.125rem] h-[1.125rem] mr-1'/>}
            text={'下载最新提示词'}
          />
          <IconButton
            key="add"
            className="hover:bg-gray-200 p-2 rounded-lg border"
            onClick={() =>{openModal(<EditPromptModal/>, modalOptions)}}
            icon={<AddIcon className='w-5 h-5 mr-1'/>}
            text={'新增'}
          />
        </div>
        <div className="text-gray-500">共计 {prompts.length}条 提示词</div>
      </div>
    </div>

  );
}
