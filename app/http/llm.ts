
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import { REQUEST_TIMEOUT_MS } from "@/app/constant";
import { useAccessStore, useAppConfig, useChatStore } from "../store";


export const ROLES = ["system", "user", "assistant"] as const; 
export type MessageRole = (typeof ROLES)[number];


export interface RequestMessage {
  role: MessageRole;
  content: string;
}

export interface LLMConfig {
  model: string;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

//
export interface ChatOptions {
  messages: RequestMessage[];
  config: LLMConfig;

  onUpdate?: (message: string, chunk: string) => void;
  onFinish: (message: string) => void;
  onError?: (err: Error) => void;
  onController?: (controller: AbortController) => void;
}






// To store message streaming controller
export const ChatControllerPool = {
  controllers: {} as Record<string, AbortController>,

  addController(
    sessionIndex: number,
    messageId: number,
    controller: AbortController,
  ) {
    const key = this.key(sessionIndex, messageId);
    this.controllers[key] = controller;
    return key;
  },

  stop(sessionIndex: number, messageId: number) {
    const key = this.key(sessionIndex, messageId);
    const controller = this.controllers[key];
    controller?.abort();
  },

  stopAll() {
    Object.values(this.controllers).forEach((v) => v.abort());
  },

  hasPending() {
    return Object.values(this.controllers).length > 0;
  },

  remove(sessionIndex: number, messageId: number) {
    const key = this.key(sessionIndex, messageId);
    delete this.controllers[key];
  },

  key(sessionIndex: number, messageIndex: number) {
    return `${sessionIndex},${messageIndex}`;
  },
};




/** 聊天 */
class LLM{
  async  chat(options: ChatOptions) : Promise<void>{

    const {token} = useAccessStore.getState()
    // const token = ''
  
    const messages = options.messages.map((v) => ({
      role: v.role,
      content: v.content,
    }));
  
    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.config.model,
      },
    };
  
    const requestPayload = {
      messages,
      stream: true, //服务端默认true
      model: modelConfig.model,
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.max_tokens,
      // presence_penalty: modelConfig.presence_penalty,
    };
  
    // console.log("[Request] openai payload: ", requestPayload);
  
    const shouldStream = !!options.config.stream;
    const controller = new AbortController();
    options.onController?.(controller);

    const chatPath = `${process.env.NEXT_PUBLIC_API_BASE_URL}/llms/chat`;
    const chatPayload = {
      method: "POST",
      body: JSON.stringify(requestPayload),
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-requested-with": "XMLHttpRequest",
        "withCredentials": 'false' ,
        "Authorization": `Bearer ${token}`
      },
    };

   // make a fetch request
   const requestTimeoutId = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  if(!shouldStream){
    return fetch(chatPath, chatPayload)
      .then(response=>response.json())
      .then(res=>{
        clearTimeout(requestTimeoutId);
        const message =  res.data || "";
        options.onFinish(message);
        return;
      });
  }
  
    return new Promise((resolve, reject) =>{
      let responseText = "";
      let finished = false;

      const finish = () => {
        if (!finished) {
          options.onFinish(responseText);
          finished = true;
        }
      };

      controller.signal.onabort = finish;

      // PS：如果在onopen等钩子中throw new Error()，会导致重新请求（不断retry)
      fetchEventSource(chatPath, {
        ...chatPayload,
        async onopen(res) {
          clearTimeout(requestTimeoutId);
          const contentType = res.headers.get("content-type");
          if (res.ok && contentType === EventStreamContentType) {
            resolve();
            return; // everything's good
          } else if (contentType?.startsWith('application/json') && res.status >= 400) {
            try {
              const resJson = await res.clone().json();
              reject(resJson);
              options.onError?.(new Error(resJson.errMsg));
            } catch {
              resolve();
              options.onError?.(new Error("请求错误，请稍后重试"));
               
            }
            return;
          } 
          resolve();
          options.onError?.(new Error("请求错误，请稍后重试"));
        },
        onmessage(msg) {
          if(msg.event === "error" || msg.event === 'FatalError'){ // event-stream出错
            options.onError?.(new Error(msg.data));
            return 
          }
          if ( finished) { // 结束
            return finish();
          }
          if(msg.data === '')
            return;
          try {
            const parsed = JSON.parse(msg.data)
            const delta = parsed.data;
            if(delta){
              responseText += delta;
              options.onUpdate?.(responseText, delta);
            }
          } catch (e) {
            console.log("[Parsed] failed to parse data", e);
          }
        },
        onclose() {
          finish();
        },
        onerror(e) {
          // TODO: [Bug] 404会一直retry（不断重试请求），未解决
          // event-stream请求错误
          options.onError?.(e);
        },
        openWhenHidden: true,
        
      })
     
    });
    
  }
}
const llm = new LLM()
export default llm;