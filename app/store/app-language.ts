import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mountStoreDevtool } from 'simple-zustand-devtools';
import { StoreKey } from "../constant";


export interface AppLanguageStore {
  studyLang: string, 
  updateStudyLang: (lang: string)=>void
}

export const useAppLanguageStore = create<AppLanguageStore>()(
  persist(
    // Access相关的状态和更新方法
    (set, get) => ({
      studyLang: "英语",
      updateStudyLang(lang: string) {
        set(() => ({ studyLang:lang }));
      },
      
    }),
    // 持久化配置
    {
  name: StoreKey.AppLanguage,
      version: 1,
    },
  ),
);


// if (process.env.NODE_ENV === 'development') {
//   mountStoreDevtool('AccessStore', useAccessStore);

// }