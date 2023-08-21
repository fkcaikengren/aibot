"use client"
import { useDebouncedCallback } from "use-debounce";
import { useState, useRef, useEffect, useLayoutEffect, MouseEvent, useMemo } from "react";

import SendWhiteIconX from "../icons/send-white.svg";
import AddIcon from "../icons/add.svg";
import ClockIcon from '../icons/clock.svg'
import CloseIcon from '../icons/close.svg'
import DeleteIcon from '../icons/delete.svg'
import ChatIcon from '../icons/chat.svg'
import ClearIcon from '../icons/clear.svg'


import {
  ChatMessage,
  SubmitKey,
  useChatStore,
  BOT_HELLO,
  createMessage,
  useAppConfig,
  DEFAULT_TOPIC,
  ModelType,
} from "../store";


import BotIcon from "../icons/bot.svg";
import BlackBotIcon from "../icons/black-bot.svg";
import MyAvatar from '../images/avatar.jpeg'



import {
  copyToClipboard,
  selectOrCopy,
} from "../utils";


import { ChatControllerPool } from "../http/llm";
import { Prompt, usePromptStore } from "../store/prompt";
import Locale from "../locales";

import { IconButton } from "./Button";

import { LAST_INPUT_KEY,  MOBILE_MAX_WIDTH,  REQUEST_TIMEOUT_MS } from "../constant";
import { prettyObject } from "../utils/format";

import { classNames } from '../utils/classNames';
import { usePathname,useRouter, useSearchParams } from "next/navigation";

import {Markdown}  from './Markdown'

import { useModal } from "./Modal";
import Image from "next/image";
import Popover from "./Popover";
import { toast } from "react-hot-toast";
// import { useWindowSize } from "react-use";



const DEFAULT_TEXTAREA_HEIGHT = "35px"

   

export function Avatar(props: { model?: ModelType; avatar?: string }) {
  const className = 'h-8 min-h-8 w-8 min-w-8 flex justify-center items-center border rounded-xl'
  if (props.model) {
    return (
      <div >
        {props.model?.startsWith("gpt-4") ? (
          <BlackBotIcon className={className} />
        ) : (
          <BotIcon className={className} />
        )}
      </div>
    );
  }

  return (
    <Image
        className='h-8 w-8 border rounded-xl'
        src={props.avatar || MyAvatar}
        alt='avatar'
        width={80}
        height={80} />
  );
}


function ChatHistoryModal(props:{closeActionPopover:()=>void}) {
  const {closeModal} = useModal()
  const [currentSession, sessions, selectSession, deleteSession] =  useChatStore(state=>([
    state.currentSession(),
    state.currentSessions(),
    state.selectSession,
    state.deleteSession,
  ]))
  const actionBtnClass = 'hover:bg-gray-200 p-2 rounded-lg';
  return < >
        <div className="flex items-center justify-between px-6 py-5 ">
          <h4 className="text-lg text-bold">历史对话</h4>
          <IconButton
            className="hover:bg-gray-100 p-2 rounded-lg" 
            icon={<CloseIcon className='w-6 h-6 '/>}
            onClick={()=>{
              closeModal(); 
              props.closeActionPopover();
            }}
          /> 
        </div>
        <div className='flex-1 overflow-y-auto border rounded-lg mx-4 mb-1'>
          {sessions.map((ssn, i) => (
            <div key={ssn.id} 
              className={classNames('flex flex-col border-b last:border-0 px-3 py-2 hover:bg-gray-100' ,{
                'bg-gray-100':currentSession.id===ssn.id
              })}
              
              onClick={()=>{
              selectSession(ssn.id)
            }}>
              <div className="flex w-full justify-between items-center ">
                <div className='flex-1  font-bold text-ellipsis whitespace-nowrap overflow-hidden'>
                  {/* {ssn.topic}  */}
                    {new Date(ssn.lastUpdate).toLocaleString()}
                </div>
                <IconButton
                    icon={<DeleteIcon className='w-5 h-5'/>}
                    className={actionBtnClass}
                    onClick={(e) => {
                      e.stopPropagation();
                      if(deleteSession(ssn.id)){
                        toast.success("删除成功")
                      }
                    }}
                  />
              </div>

              <div className='flex items-center justify-between text-sm text-gray-500' >
                  <div>
                  {ssn.mask.modelConfig.model} / {ssn.messages.length}条对话
                  </div>
                  
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm mx-4 py-3 text-right">对话信息保存在本地，仅保留最近的30条对话</p>
      </>
}




function useSubmitHandler() {
  const config = useAppConfig();
  const submitKey = config.submitKey;

  const shouldSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return false;
    if (e.key === "Enter" && e.nativeEvent.isComposing) return false;
    return (
      (config.submitKey === SubmitKey.AltEnter && e.altKey) ||
      (config.submitKey === SubmitKey.CtrlEnter && e.ctrlKey) ||
      (config.submitKey === SubmitKey.ShiftEnter && e.shiftKey) ||
      (config.submitKey === SubmitKey.MetaEnter && e.metaKey) ||
      (config.submitKey === SubmitKey.Enter &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.metaKey)
    );
  };

  return {
    submitKey,
    shouldSubmit,
  };
}

export function PromptHints(props: {
  prompts: Prompt[];
  onPromptSelect: (prompt: Prompt) => void;
}) {
  const noPrompts = props.prompts.length === 0;
  const [selectIndex, setSelectIndex] = useState(0);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectIndex(0);
  }, [props.prompts.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (noPrompts) return;
      if (e.metaKey || e.altKey || e.ctrlKey) {
        return;
      }
      // arrow up / down to select prompt
      const changeIndex = (delta: number) => {
        e.stopPropagation();
        e.preventDefault();
        const nextIndex = Math.max(
          0,
          Math.min(props.prompts.length - 1, selectIndex + delta),
        );
        setSelectIndex(nextIndex);
        selectedRef.current?.scrollIntoView({
          block: "center",
        });
      };

      if (e.key === "ArrowUp") {
        changeIndex(1);
      } else if (e.key === "ArrowDown") {
        changeIndex(-1);
      } else if (e.key === "Enter") {
        const selectedPrompt = props.prompts.at(selectIndex);
        if (selectedPrompt) {
          props.onPromptSelect(selectedPrompt);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.prompts.length, selectIndex]);

  if (noPrompts) return null;
  return (
    <div className='min-h-5 max-h-[50vh] overflow-auto mb-2 border rounded-lg p-1 flex flex-col-reverse gap-1'>
      {props.prompts.map((prompt, i) => (
        <div
          ref={i === selectIndex ? selectedRef : null}
          className={
            classNames("w-full p-2 box-border border rounded-lg border-transparent")
           
          }
          style={i === selectIndex?{borderColor:'var(--primary)'}:{}}
          key={prompt.title + i.toString()}
          onClick={() => props.onPromptSelect(prompt)}
          onMouseEnter={() => setSelectIndex(i)}
        >
          <div className='font-bold text-sm'>
            {prompt.title}
          </div>
          <div className='text-sm text-ellipsis whitespace-nowrap overflow-hidden'>
            {prompt.content}
          </div>
        </div>
      ))}
    </div>
  );
}

function ClearContextDivider() {
  const chatStore = useChatStore();
  return (
    <div
      className='mt-6 py-1 border-y border-gray-100 shadow-inner flex justify-center items-center  ai-divider-mask text-sm '
    >
      <div className='text-gray-500'>
        上下文已清除
      </div>
      {/* <div className='translate-y-0 opacity-100  transition-all duration-100 absolute text-gray-500 group-hover:-translate-y-1/2 group-hover:opacity-0'>
        上下文已清除
      </div>
      <div className='-translate-y-1/2 opacity-0 transition-all duration-300 relative text-violet-500 group-hover:translate-y-0 group-hover:opacity-100'>
        恢复上下文
      </div> */}
    </div>
  );
}

function useScrollToBottom() {
  // for auto-scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollToBottom = () => {
    const dom = scrollRef.current;
    if (dom) {
      setTimeout(() => (dom.scrollTop = dom.scrollHeight), 1);
    }
  };

  // auto scroll
  useLayoutEffect(() => {
    autoScroll && scrollToBottom();
  });

  return {
    scrollRef,
    autoScroll,
    setAutoScroll,
    scrollToBottom,
  };
}



export function Chat() {
  type RenderMessage = ChatMessage & { preview?: boolean };
  const router = useRouter();
  const pathname = usePathname()
  const searchParams = useSearchParams();
  const chatStore = useChatStore();
  const [session,sessions, sessionIndex, deleteSession] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessions(),
    state.currentSessionIndex(),
    state.deleteSession,
  ]);
  const config = useAppConfig();
  const fontSize = config.fontSize;

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { submitKey, shouldSubmit } = useSubmitHandler();
  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(true);
  const [actionsVisible, setActionsVisible] = useState(false)
  // const {width, height} = useWindowSize();
  // const isMobileScreen = width < MOBILE_MAX_WIDTH;
  

  const onChatBodyScroll = (e: HTMLElement) => {
    const isTouchBottom = e.scrollTop + e.clientHeight >= e.scrollHeight - 100;
    setHitBottom(isTouchBottom);
  };

  // prompt hints
  const promptStore = usePromptStore();
  const [promptHints, setPromptHints] = useState<Prompt[]>([]);
  const onSearch = useDebouncedCallback(
    (text: string) => {
      setPromptHints(promptStore.search(text));
    },
    200,
    { leading: true, trailing: true },
  );

  const onPromptSelect = (prompt: Prompt) => {
    setPromptHints([]);
    inputRef.current?.focus();
    setTimeout(() => setUserInput(prompt.content), 60);
  };

  useEffect(()=>{
    if(inputRef.current){
      inputRef.current.style.height = DEFAULT_TEXTAREA_HEIGHT;
      if(userInput.length > 0)
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  // only search prompts when user input is short
  const SEARCH_TEXT_LIMIT = 30;
  const onInput = (text: string) => {
    setUserInput(text);
    const n = text.trim().length;
    if (n === 0) {
      setPromptHints([]);
    } else if (!config.disablePromptHint && n < SEARCH_TEXT_LIMIT) {
      // check if need to trigger auto completion
      if (text.startsWith("/")) {
        let searchText = text.slice(1);
        onSearch(searchText);
      }
    }
  }
  const handleUserInputError = (err:any)=>{
    setIsLoading(false);
    router.push(`/auth?redirect=${pathname}`);
    
  }

  const doSubmit = (userInput: string) => {
    if (userInput.trim() === "") return;
    setIsLoading(true);
    chatStore.onUserInput(userInput).then(() => setIsLoading(false)).catch(handleUserInputError)
    
    localStorage.setItem(LAST_INPUT_KEY, userInput);
    setUserInput("");
    setPromptHints([]);
    
    setAutoScroll(true);
  };

  // stop response
  const onUserStop = (messageId: number) => {
    ChatControllerPool.stop(sessionIndex, messageId);
  };

  useEffect(() => {

    // 是否停止所有信息
    chatStore.updateCurrentSession((session) => {
      const stopTiming = Date.now() - REQUEST_TIMEOUT_MS;
      session.messages.forEach((m) => {
        // check if should stop all stale messages
        if (m.isError || new Date(m.date).getTime() < stopTiming) {
          if (m.streaming) {
            m.streaming = false;
          }

          if (m.content.length === 0) {
            m.isError = true;
            m.content = prettyObject({
              error: true,
              message: "empty response",
            });
          }
        }
      });

    });

    // 如果来自/auth，检查最后的消息是否需要重发
    const from = searchParams.get('from')
    if(from === 'auth'){
      router.push(pathname);
      if(session.messages.length){
        const msg = session.messages[session.messages.length-1]
        if(msg.isError){
          onResend(msg.id ?? -1);
        }
      }
      
    }

    // 定期清理sessions
    const sessionsThreshhold = 30;
    if(sessions.length > sessionsThreshhold){
      sessions.slice(sessionsThreshhold).forEach(ssn=>{
        deleteSession(ssn.id)
      })
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // check if should send message
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if ArrowUp and no userInput, fill with last input
    if (
      e.key === "ArrowUp" &&
      userInput.length <= 0 &&
      !(e.metaKey || e.altKey || e.ctrlKey)
    ) {
      setUserInput(localStorage.getItem(LAST_INPUT_KEY) ?? "");
      e.preventDefault();
      return;
    }
    if (shouldSubmit(e) && promptHints.length === 0) {
      doSubmit(userInput);
      e.preventDefault();
    }
  };
  const onRightClick = (e: any, message: ChatMessage) => {
    // copy to clipboard
    if (selectOrCopy(e.currentTarget, message.content)) {
      e.preventDefault();
    }
  };

  const findLastUserIndex = (messageId: number) => {
    // find last user input message and resend
    let lastUserMessageIndex: number | null = null;
    for (let i = 0; i < session.messages.length; i += 1) {
      const message = session.messages[i];
      if (message.id === messageId) {
        break;
      }
      if (message.role === "user") {
        lastUserMessageIndex = i;
      }
    }

    return lastUserMessageIndex;
  };

  const deleteMessage = (userIndex: number) => {
    chatStore.updateCurrentSession((session) =>{
        session.messages.splice(userIndex, 2)
        //更新session的相关索引
        if(session.lastSummarizeIndex > userIndex)
          session.lastSummarizeIndex = Math.max(session.lastSummarizeIndex-2, 0);
        if((session.clearContextIndex ?? 0) > userIndex)
          session.clearContextIndex = Math.max((session.clearContextIndex ?? 0) - 2, 0) ;
    });
  };

  const onDelete = (botMessageId: number) => {
    const userIndex = findLastUserIndex(botMessageId);
    if (userIndex === null) return;
    deleteMessage(userIndex);
    
  };

  const onResend = (botMessageId: number) => {
    // find last user input message and resend
    const userIndex = findLastUserIndex(botMessageId);
    if (userIndex === null) return;

    setIsLoading(true);
    const content = session.messages[userIndex].content;
    deleteMessage(userIndex);
    chatStore.onUserInput(content).then(() => setIsLoading(false)).catch().catch(handleUserInputError);
    inputRef.current?.focus();
  };

  const context: RenderMessage[] = session.mask.hideContext
    ? []
    : session.mask.context.slice();


  context.push(BOT_HELLO);

  // clear context index = context length + index in messages
  const clearContextIndex =
    (session.clearContextIndex ?? -1) >= 0
      ? session.clearContextIndex! + context.length
      : -1;

  // preview messages
  const messages = context
  .concat(session.messages as RenderMessage[])
  
  useLayoutEffect(()=>{
    if(isLoading)
      messages.push({
        ...createMessage({
          role: "assistant",
          content: "……",
        }),
        preview: true,
      })
  }, [isLoading])
    

  const [showPromptModal, setShowPromptModal] = useState(false);

  const renameSession = () => {
    const newTopic = prompt(Locale.Chat.Rename, session.topic);
    if (newTopic && newTopic !== session.topic) {
      chatStore.updateCurrentSession((session) => (session.topic = newTopic!));
    }
  };

  const { openModal } = useModal()
  

  const onClickChatHistory = ()=>{
    openModal(
      <ChatHistoryModal closeActionPopover={()=>{setActionsVisible(false)}} />,
      {
        containerClass: "flex flex-col justify-between ai-absolute-center rounded-2xl bg-white h-3/4 w-[calc(100%-32px)] sm:w-[520px]"
      }
    );
  }

  const onNewSession = ()=>{
    chatStore.newSession();
    setActionsVisible(false);
  }


  const onClearContext =() => {
    if(session.clearContextIndex === session.messages.length)
      return;
    chatStore.updateCurrentSession((session) => {
      session.clearContextIndex = session.messages.length;
      session.memoryPrompt = ""; // will clear memory
    });
    setActionsVisible(false);
    scrollToBottom()
  }

  const onClickSessionActions = (e: MouseEvent<HTMLButtonElement>)=>{
    setActionsVisible(true);
  }


  return (
    <div className=' h-full relative px-4 overflow-auto bg-white' 
      key={session.id}
      ref={scrollRef}
      onScroll={(e) => onChatBodyScroll(e.currentTarget)}
      onMouseDown={() => inputRef.current?.blur()}
      onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
      onTouchStart={() => {
        setAutoScroll(false);
      }}
    >
      <div className="h-full flex flex-col  max-w-[1024px] m-auto">

       {/* 对话区 */}
      <div
        className='flex-1 py-10'
      >
        {messages.map((message, i) => {
          const isUser = message.role === "user";
          const showActions =
            !isUser &&
            i > 0 &&
            message.content.length !== 0;
          const showTyping = message.streaming;

          const shouldShowClearContextDivider = i === clearContextIndex - 1;
          const topActionClassNames = 'opacity-50 hover:opacity-100 cursor-pointer whitespace-nowrap mr-3 first:mr-0'
          return (
            <div key={i}>
              <div
                className={classNames('flex flex-row',{
                  'flex-row-reverse':isUser
                })}
              >
                <div className={classNames('group max-w-[calc(100%-50px)] sm:max-w-4/5 flex flex-col items-start',{
                  'items-end': isUser
                })}>
                  <div className='mt-5'>
                    {isUser ? (
                      <Avatar avatar={''}  />
                    ) : (
                      <Avatar model={config.modelConfig.model} />
                    )}
                  </div>
                  {showTyping && (
                    <div className='text-sm text-gray-500 mt-1'>
                      {"正在输入…"}
                    </div>
                  )}
                  <div className={classNames(
                    'relative border-box max-w-full mt-3 rounded-xl p-3 text-sm  bg-gray-100 break-words',
                    {'bg-violet-500': isUser}
                  )}>
                    {showActions && (
                      <div className='absolute -top-6 left-0 min-w-[140px] w-full text-sm flex flex-row-reverse opacity-0 transition-opacity group-hover:opacity-100 '>
                        {message.streaming ? (
                          <div
                            className={topActionClassNames}
                            onClick={() => onUserStop(message.id ?? i)}
                          >
                            停止
                          </div>
                        ) : (
                          <>
                            <div
                              className={topActionClassNames}
                              onClick={() => onDelete(message.id ?? i)}
                            >
                              删除
                            </div>
                            <div
                              className={topActionClassNames}
                              onClick={() => onResend(message.id ?? i)}
                            >
                              重试
                            </div>
                          </>
                        )}

                        <div
                          className={topActionClassNames}
                          onClick={() => copyToClipboard(message.content)}
                        >
                          复制
                        </div>
                      </div>
                    )}
                  
                    <Markdown
                      content={message.content}
                      loading={
                        (message.preview || message.content.length === 0) &&
                        !isUser
                      }
                      onContextMenu={(e) => onRightClick(e, message)}
                      onDoubleClickCapture={() => {
                        return;
                      }}
                      fontSize={fontSize}
                      fontColor={isUser?'white':'var(--black)'}
                      parentRef={scrollRef}
                      defaultShow={i >= messages.length - 10}
                    />
                  </div>
                  {!isUser && !message.preview && (
                    <div className='flex flex-row-reverse w-full text-sm pt-1'>
                      <div className='text-gray-500'>
                        {message.date.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {shouldShowClearContextDivider && <ClearContextDivider />}
            </div>
   
          );
           
        })}
      </div>

        {/* 输入区 */}
      <div className='sticky bg-white  bottom-0'>
        <PromptHints prompts={promptHints} onPromptSelect={onPromptSelect} />

        <div className="flex gap-3 items-end pb-4 pt-2">
        <Popover
            content={
              <div className="relative m-h-[100px] w-[9rem] bg-white border rounded-lg">
                <div className="hover:bg-gray-100 w-full"> 
                  <IconButton
                    className="pl-3 pr-7 py-2" 
                    icon={<ClockIcon className='w-5 h-5 mr-1'/>}
                    text='历史对话'
                    onClick={onClickChatHistory}
                  />
                </div>
                <div className="hover:bg-gray-100 w-full"> 
                  <IconButton
                    className="pl-3 pr-7 py-2"
                    icon={<ChatIcon className='w-5 h-5 mr-1 '/>}
                    text='新建对话'
                    onClick={onNewSession}
                  />  
                </div>
                <div className="hover:bg-gray-100 w-full"> 
                  <IconButton
                    className="pl-3 pr-4 py-2"
                    icon={<ClearIcon className='w-5 h-5 mr-1'/>}
                    text='清除上下文'
                    onClick={onClearContext}
                  />
                </div>
              </div>
            }
            open={actionsVisible}
            onClose={() => setActionsVisible(false)}
          >
            
          <IconButton 
            icon={<AddIcon className='w-8 h-8 mb-2'/>}
            onClick={onClickSessionActions}
          />
          </Popover>
          
          
          <div className='flex-1 flex items-end gap-3 border p-1 rounded-3xl shadow-sm' >
            <div className="flex-1 pl-3 flex items-center">
              <textarea
                ref={inputRef}
                className={"w-full overflow-x-hidden resize-none text-sm leading-normal max-h-[160px] bg-transparent py-1"}
                placeholder={`${submitKey} 发送，/ 触发提示词`}
                onInput={(e) => onInput(e.currentTarget.value)}
                value={userInput}
                onKeyDown={onInputKeyDown}
                onFocus={() => setAutoScroll(true)}
                onBlur={() => setAutoScroll(false)}
                style={{height: DEFAULT_TEXTAREA_HEIGHT }} 
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

      </div>
    </div>
  );
}
