import { create } from "zustand";
import { persist } from "zustand/middleware";


import { ALL_MODELS, ModelType, useAppConfig } from "./config";
import { createEmptyMask, Mask } from "./mask";
import { StoreKey } from "../constant";
import llm, { RequestMessage } from "../http/llm";
import { ChatControllerPool } from "../http/llm";
import { prettyObject } from "../utils/format";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { toast } from "react-hot-toast";


export type ChatMessage = RequestMessage & {
  date: string;
  streaming?: boolean;
  isError?: boolean;
  id?: number;
  model?: ModelType;
};

export function createMessage(override: Partial<ChatMessage>): ChatMessage {
  return {
    id: Date.now(),
    date: new Date().toLocaleString(),
    role: "user",
    content: "",
    ...override,
  };
}



export interface ChatSession {
  id: number;
  topic: string;

  memoryPrompt: string;  //记忆提示（历史对话的总结内容）
  messages: ChatMessage[];
  lastUpdate: number;
  lastSummarizeIndex: number; //上次总结的索引
  clearContextIndex?: number; //上下文清空的索引

  mask: Mask;
}


export const DEFAULT_TOPIC = "新的聊天";
export const BOT_HELLO: ChatMessage = createMessage({
  role: "assistant",
  content: "你好，有什么可以帮你的吗",
});

function createEmptySession(modelName?:string): ChatSession {
  return {
    id: Date.now() + Math.random(),
    topic: DEFAULT_TOPIC,
    memoryPrompt: "",
    messages: [],
    lastUpdate: Date.now(),
    lastSummarizeIndex: 0,

    mask: createEmptyMask(modelName),
  };
}

function initCurrentSessionIndex(){
  return ALL_MODELS.reduce((acc,item,i)=> {acc[item.name]=i; return acc}, {} as Record<string, number>)
}

interface ChatStore {
  sessions: ChatSession[];
  sessionIndexes: Record<string, number>;
  globalId: number;

  clearSessions: () => void;
  selectSession: (id: number) => void;
  newSession: (mask?: Mask) => void;
  deleteSession: (id: number) => boolean;
  currentSession: () => ChatSession;
  currentSessions: () => ChatSession[];
  currentSessionIndex: ()=> number;
  
  onNewMessage: (message: ChatMessage) => void;
  onUserInput: (content: string) => Promise<void>;
  summarizeSession: () => void;
  updateCurrentSession: (updater: (session: ChatSession) => void) => void;
  updateMessage: (
    sessionIndex: number,
    messageIndex: number,
    updater: (message?: ChatMessage) => void,
  ) => void;
  resetSession: () => void;
  getMessagesWithMemory: () => ChatMessage[];
  getMemoryPrompt: () => ChatMessage;

  clearAllData: () => void;
}

function countMessages(msgs: ChatMessage[]) {
  return msgs.reduce((pre, cur) => pre + cur.content.length, 0);
}


export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: ALL_MODELS.map(model=>createEmptySession(model.name)),
      sessionIndexes: initCurrentSessionIndex(),
      globalId: 0,

      clearSessions() {
        set(() => ({
          sessions: ALL_MODELS.map(model=>createEmptySession(model.name)),
          sessionIndexes: initCurrentSessionIndex(),
        }));
      },

      selectSession(id: number) {
        const {model} = useAppConfig.getState().modelConfig
        const index = get().sessions.findIndex(ssn=>ssn.id === id)
        set({
          sessionIndexes: {
            ...get().sessionIndexes,
            [model]: index
          }
        });
      },



      newSession(mask) {
        const {model} = useAppConfig.getState().modelConfig
        const session = createEmptySession();
        const sessionIndexes = get().sessionIndexes

        set(() => ({ globalId: get().globalId + 1 }));
        session.id = get().globalId;

        if (mask) {
          session.mask = { ...mask };
          session.topic = mask.name;
        }

        const newSessionIndexes = {} as Record<string,number>
        for(const key in sessionIndexes){
          newSessionIndexes[key] = sessionIndexes[key]+1
        }

        set((state) => ({
          sessionIndexes: {...newSessionIndexes,[model]: 0},
          sessions: [session].concat(state.sessions),
        }));
      },

      deleteSession(id) {
        const index = get().sessions.findIndex(ssn=>ssn.id === id)
        
        const {model} = useAppConfig.getState().modelConfig
        const sessionIndexes = get().sessionIndexes
        const deletedSession = get().sessions[index];
        
        if (!deletedSession) return false;

        const sessions = get().sessions.slice();
        sessions.splice(index, 1); //删除
        const existIdx = sessions.findIndex((session)=> session.mask.modelConfig.model === model)
        
        //无新对话
        if(existIdx === -1 ){ //创建新的

          const session = createEmptySession(model);
          set(() => ({ globalId: get().globalId + 1 }));
          session.id = get().globalId;
          
          const newSessionIndexes = {} as Record<string,number>;
          for(const key in sessionIndexes){
            newSessionIndexes[key] = sessionIndexes[key] < index ? sessionIndexes[key]+1 : sessionIndexes[key];
          }
          
          set((state) => ({
            sessionIndexes: {...newSessionIndexes,[model]: 0},
            sessions: [session].concat(sessions),
          }));

          return true;
        }

        const newSessionIndexes = {} as Record<string,number>;
        for(const key in sessionIndexes){
          newSessionIndexes[key] = sessionIndexes[key] < index ? sessionIndexes[key] : sessionIndexes[key]-1;
        }

        //删除当前对话
        if(sessionIndexes[model] === index){ //删除当前的session,则指向第一个
          set((state) => ({
            sessionIndexes: {...newSessionIndexes,[model]: existIdx},
            sessions,
          }));
          return true;
        }

        // 直接删除
        set((state) => ({
          sessionIndexes: {...newSessionIndexes},
          sessions,
        }));
        return true;
      },

      currentSession() {
        let index = get().currentSessionIndex();
        const sessions = get().sessions;

        if (index < 0 || index >= sessions.length ) { //可能有些session被删除
          index =  Math.min(sessions.length - 1, Math.max(0, index));
        }
    

        const session = sessions[index];

        return session;
      },

      currentSessions() {
        const {model} = useAppConfig.getState().modelConfig;
        return get().sessions.filter(ssn => ssn.mask.modelConfig.model === model)
      },

      currentSessionIndex() {
        const {model} = useAppConfig.getState().modelConfig;
        return get().sessionIndexes[model];
      },

      onNewMessage(message) {
        get().updateCurrentSession((session) => {
          session.lastUpdate = Date.now();
        });
        get().summarizeSession();
      },

      /** 用户提交输入 */
      async onUserInput(content) {

        const session = get().currentSession();
        const modelConfig = session.mask.modelConfig;
        const {model} = modelConfig

        const userMessage: ChatMessage = createMessage({
          role: "user",
          content,
        });

        const botMessage: ChatMessage = createMessage({
          role: "assistant",
          streaming: true,
          id: userMessage.id! + 1,
          model,
        });

        const systemInfo = createMessage({
          role: "system",
          content: `IMPORTANT: You are a virtual assistant powered by the ${
            model
          } model, now time is ${new Date().toLocaleString()}}`,
          id: botMessage.id! + 1,
        });

        // get recent messages
        const systemMessages = [];
        // if user define a mask with context prompts, wont send system info
        if (session.mask.context.length === 0) {
          systemMessages.push(systemInfo);
        }

        const recentMessages = get().getMessagesWithMemory();
        const sendMessages = systemMessages.concat(
          recentMessages.concat(userMessage),
        );
        const sessionIndex = get().sessionIndexes[model];
        const messageIndex = get().currentSession().messages.length + 1;

        // save user's and bot's message
        get().updateCurrentSession((session) => {
          session.messages.push(userMessage);
          session.messages.push(botMessage);
        });

        // make request
        // console.log("[send Messages] ", sendMessages);
        return llm.chat({
          messages: sendMessages,
          config: { ...modelConfig, stream: true },
          onUpdate(message) {
            botMessage.streaming = true;
            if (message) {
              botMessage.content = message;
            }
            set(() => ({})); //强制刷新
          },
          onFinish(message) {
            botMessage.streaming = false;
            if (message) {
              botMessage.content = message;
              get().onNewMessage(botMessage);
            }
            ChatControllerPool.remove(
              sessionIndex,
              botMessage.id ?? messageIndex,
            );
            set(() => ({})); //强制刷新
          },
          onError(error) {
            const isAborted = error.message.includes("aborted");
            botMessage.content =
              "\n\n" +
              prettyObject({
                error: true,
                message: error.message,
              });
            botMessage.streaming = false;
            userMessage.isError = !isAborted;
            botMessage.isError = !isAborted;

            set(() => ({}));//强制刷新
            ChatControllerPool.remove(
              sessionIndex,
              botMessage.id ?? messageIndex,
            );

            console.error("[Chat] failed ", error);
          },
          onController(controller) {
            // collect controller for stop/retry
            ChatControllerPool.addController(
              sessionIndex,
              botMessage.id ?? messageIndex,
              controller,
            );
          },
        });
      },

      getMemoryPrompt() {
        const session = get().currentSession();

        return {
          role: "system",
          content:
            session.memoryPrompt.length > 0
              ? `这是历史聊天总结作为前情提要：${session.memoryPrompt}` 
              : "",
          date: "",
        } as ChatMessage;
      },

      // 获取总结信息和后面的对话
      getMessagesWithMemory() {
        const session = get().currentSession();
        const modelConfig = session.mask.modelConfig;

        const context = session.mask.context.slice();
        // 带上记忆提示（总结）
        if (
          modelConfig.sendMemory &&
          session.memoryPrompt &&
          session.memoryPrompt.length > 0 && 
          (session.clearContextIndex ?? 0) < session.lastSummarizeIndex
        ) {
          const memoryPrompt = get().getMemoryPrompt();
          context.push(memoryPrompt);
        }
        
        const recentIndex = Math.max(
          session.lastSummarizeIndex,
          session.clearContextIndex ?? 0,
        );
        const recentMessages = session.messages.slice(recentIndex).filter((msg) => !msg.isError);
        return context.concat(recentMessages);
      },

      updateMessage(
        sessionIndex: number,
        messageIndex: number,
        updater: (message?: ChatMessage) => void,
      ) {
        const sessions = get().sessions;
        const session = sessions.at(sessionIndex);
        const messages = session?.messages;
        updater(messages?.at(messageIndex));
        set(() => ({ sessions }));
      },

      resetSession() {
        get().updateCurrentSession((session) => {
          session.messages = [];
          session.memoryPrompt = "";
        });
      },


      // 总结对话，产生记忆提示
      summarizeSession() {
        const session = get().currentSession();

        // remove error messages if any
        const messages = session.messages;

        
        const modelConfig = session.mask.modelConfig;
        const summarizeIndex = Math.max(
          session.lastSummarizeIndex,
          session.clearContextIndex ?? 0,
        );
        let toBeSummarizedMsgs = messages.slice(summarizeIndex);

        
        const msgs = toBeSummarizedMsgs.filter((msg) => !msg.isError)
        const msgsWordLength = msgs.slice(0,-2).reduce((acc,msg)=>(msg.content.length+acc), 0)
        
        //对话少于compressMessageCountThreshold||字数少于compressMessageLengthThreshold，则不总结
        if(msgs.length < modelConfig.compressMessageCountThreshold  
          || msgsWordLength < modelConfig.compressMessageLengthThreshold){  
          return;
        }
        const lastSummarizeIndex = session.messages.length-2; 
        toBeSummarizedMsgs = toBeSummarizedMsgs
            .slice(0, -2)
            .filter((msg) => !msg.isError)
        // add memory prompt
        toBeSummarizedMsgs.unshift(get().getMemoryPrompt());
        

        // 内容总结
        if (
          modelConfig.sendMemory
        ) {
          llm.chat({
            messages: toBeSummarizedMsgs.concat({
              role: "system",
              content: "简要总结一下对话内容，用作后续的上下文提示 prompt，控制在 200 字以内",
              date: "",
            }),
            config: { ...modelConfig, stream: true },
            onUpdate(message) {
              session.memoryPrompt = message;
            },
            onFinish(message) {
              session.lastSummarizeIndex = lastSummarizeIndex;
            },
            onError(err) {
              console.error("[Summarize] ", err);
            },
          });
        }
      },

     

      updateCurrentSession(updater) {
        const {model} = useAppConfig.getState().modelConfig
        const sessions = get().sessions;
        const index = get().sessionIndexes[model];
        updater(sessions[index]);
        set(() => ({ sessions }));
      },

      clearAllData() {
        localStorage.clear();
        location.reload();
      },
    }),
    {
      name: StoreKey.Chat,
      version: 1,
    },
  ),
);



if (process.env.NODE_ENV === 'development') {
  mountStoreDevtool('ChatStore', useChatStore);

}