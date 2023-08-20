import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StoreKey } from "../constant";
// import { BOT_HELLO } from "./chat";
import { ALL_MODELS } from "./config";
import { mountStoreDevtool } from 'simple-zustand-devtools';


export interface AccessControlStore {

  token: string, 
  refreshToken: string,

  id: string,
  nickname: string,
  avatar: string,
  email: string,
  phone: string,
  
  updateToken: (_: string) => void;
  init :(_:object) => void;
  reset:()=>void;
}

const DEFAULT_ACCESS_STORE = {
  token: "", 
  refreshToken: "",

  id: "",
  nickname: "",
  avatar: "",
  email: "",
  phone: "",
}

export const useAccessStore = create<AccessControlStore>()(
  persist(
    // Access相关的状态和更新方法
    (set, get) => ({
      ...DEFAULT_ACCESS_STORE,
          
      updateToken(token: string) {
        set(() => ({ token }));
      },

      init(user:object){
        set(()=>({
          ...user
        }))
      },

      reset(){
        set(()=>({
          ...DEFAULT_ACCESS_STORE
        }))
      }
      
    }),
    // 持久化配置
    {
      name: StoreKey.Access,
      version: 1,
    },
  ),
);


if (process.env.NODE_ENV === 'development') {
  mountStoreDevtool('AccessStore', useAccessStore);

}