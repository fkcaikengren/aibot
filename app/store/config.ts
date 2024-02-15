import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StoreKey } from "../constant";



export const ALL_MODELS = [
  {
    name: "gpt-4-0125-preview",
  },
  {
    name: "gpt-3.5-turbo",
  },
  {
    name: "moonshot-v1-8k",
  }
] as const;


export type ModelType = (typeof ALL_MODELS)[number]["name"];

export enum SubmitKey {
  Enter = "Enter",
  CtrlEnter = "Ctrl + Enter",
  ShiftEnter = "Shift + Enter",
  AltEnter = "Alt + Enter",
  MetaEnter = "Meta + Enter",
}

export const DEFAULT_CONFIG = {
  submitKey: SubmitKey.CtrlEnter as SubmitKey,
  avatar: "1f603",
  fontSize: '1rem',
  tightBorder: false,
  disablePromptHint:false,

  modelConfig: { //默认大模型请求参数
    model: "gpt-3.5-turbo" as ModelType,
    temperature: 0.5,
    max_tokens: 4000,
    presence_penalty: 0,
    sendMemory: true,
    compressMessageCountThreshold: 6,  //历史消息个数达到compressMessageCountThreshold
    compressMessageLengthThreshold: 400, //阈值：历史消息的字符总长度达到compressMessageLengthThreshold，采取压缩策略
  },
};


export type ChatConfig = typeof DEFAULT_CONFIG;

export type ChatConfigStore = ChatConfig & {
  reset: () => void;
  update: (updater: (config: ChatConfig) => void) => void;
};

export type ModelConfig = ChatConfig["modelConfig"];



export function limitNumber(
  x: number,
  min: number,
  max: number,
  defaultValue: number,
) {
  if (typeof x !== "number" || isNaN(x)) {
    return defaultValue;
  }

  return Math.min(max, Math.max(min, x));
}


export const ModalConfigValidator = {
  
  max_tokens(x: number) {
    return limitNumber(x, 0, 32000, 2000);
  },
  presence_penalty(x: number) {
    return limitNumber(x, -2, 2, 0);
  },
  temperature(x: number) {
    return limitNumber(x, 0, 1, 1);
  },
};

export const useAppConfig = create<ChatConfigStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_CONFIG,

      reset() {
        set(() => ({ ...DEFAULT_CONFIG }));
      },

      update(updater) {
        const config = { ...get() };
        updater(config);
        set(() => config);
      },
    }),
    {
      name: StoreKey.Config,
      version: 1,
      // migrate(persistedState, version)
       
    },
  ),
);
