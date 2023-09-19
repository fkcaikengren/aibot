"use client"

import { useRef, useState } from "react";
import { IconButton } from "@/app/components/Button";
import llm, { RequestMessage } from "@/app/http/llm";
import SendWhiteIconX from '@/app/icons/send-white.svg'
import APP_LANGUAGE_CONFIG, { SUPPORT_LANGUAGES } from "../config";
import { Markdown } from "@/app/components/Markdown";
import CuteBotIcon from '@/app/icons/cute-bot.svg'
import { Select } from "@/app/components/Select";
import { useAppLanguageStore } from "@/app/store/app-language";


export type AppChatMessage = {
  streaming: boolean;
  content: string;
};



export default function LanguageChat({
  id
}: {id: number}) {
  const langChatConfig = APP_LANGUAGE_CONFIG[id];
  const defaultAppChatMessage = {
    streaming:false,
    content:langChatConfig.defaultMessage
  }

  const {studyLang, updateStudyLang} =  useAppLanguageStore();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AppChatMessage>(defaultAppChatMessage)


  const handleUserInputError = (err:any)=>{
    
    setResult({
      streaming:false,
      content:"``` \n处理失败，请重试！\n```"
    })
    setIsLoading(false);
    console.error("[Language Chat] failed ", err);
  }

 
  // 请求
  const doSubmit = (userInput: string) => {
    const content = userInput.trim() 
    if (content === "") return;
    const data =  langChatConfig.context(content, studyLang)

    // 清空输入框
    setUserInput("");
    setIsLoading(true);
    
    const messages: RequestMessage[] = [
      {
        "role": "user",
        "content": data,
      }
    ];
    llm.languageChat(messages, {
      onUpdate: (message)=> {
        setResult({
          streaming:true,
          content:message
        })
      },
      onFinish(message) {
        setResult({
          streaming: false,
          content: message,
        })
      },
      onError(error) {
        handleUserInputError(error)
      },
    }).then(() => {
      setIsLoading(false)
    }).catch(handleUserInputError)
    
    
    
  };

  const shouldSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return false;
    if (e.key === "Enter" && e.nativeEvent.isComposing) return false;
    return !!e.ctrlKey
  };


  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (shouldSubmit(e) ) {
      doSubmit(userInput);
      e.preventDefault();
    }
  };

    return (
      <>
        <div className='sticky bg-white top-0 z-10'>
          <div className="flex gap-3 items-end pb-4 pt-2">
            
            <div className='flex-1 flex items-end gap-3 border p-1 rounded-3xl shadow-sm' >
              
              <div className="flex-1 pl-3 flex items-center">
                <textarea
                  ref={inputRef}
                  className={"w-full overflow-x-hidden resize-none text-sm leading-normal max-h-[160px] bg-transparent py-1"}
                  placeholder={`Ctrl + Enter 发送`}
                  onInput={(e) => setUserInput(e.currentTarget.value)}
                  value={userInput}
                  onKeyDown={onInputKeyDown}
                
                  style={{height:  "35px" }} 
                  autoFocus={false}
                />
              </div>
              <IconButton
                icon={<SendWhiteIconX className='w-6 h-6'/>}
                className='text-white bg-violet-500 hover:bg-violet-600 p-2 rounded-full'
                onClick={() => doSubmit(userInput)}
              />
            </div>
          </div>
        </div>
      
        {/* 展示 */}
        <div className='group max-w-full md:max-w-4/5 flex flex-col items-start'>
          <div className="mt-5  flex flex-row items-center">
            <div className='flex flex-row items-start'>
              <CuteBotIcon className='h-8 min-h-8 w-8 min-w-8  p-1 flex justify-center items-center '/>
              <h2 className="ml-2 text-sm text-violet-600">语言智能助手</h2>
            </div>
            <Select className="ml-3 p-1 pr-2 border rounded-md"
              value={studyLang || SUPPORT_LANGUAGES[0]}
              onChange={(e) => {
                updateStudyLang(e.target.value );
              }}
              >
                {SUPPORT_LANGUAGES.map((option,i)=>(
                  <option key={i} value={option}>
                  {option}
                  </option>))
                }
            </Select>
          </div>
          
          {result.streaming &&
            <div className='text-sm text-gray-500 mt-1'>
                {"处理中…"}
            </div>
          }
          <div className='relative text-sm lg:text-base leading-normal border-box max-w-full mt-3 rounded-xl p-3 bg-gray-100 break-words'>
              <Markdown
                content={result.content}
                loading={isLoading}
                defaultShow={true}
              />
          </div>
        </div>
 
      </>
    );
  }
  