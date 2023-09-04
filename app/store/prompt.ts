import { create } from "zustand";
import { persist } from "zustand/middleware";
import Fuse from "fuse.js";
import { StoreKey } from "../constant";
import { mountStoreDevtool } from "simple-zustand-devtools";

export interface Prompt {
  id: number;
  title: string;
  content: string;
  isUser?: boolean;
}

export interface PromptStore {
  latestId: number;
  userPrompts: Record<number, Prompt>; //用户自定义提示词
  builtinPrompts:  Record<number, Prompt>;  //内置提示词

  add: (prompt: Omit<Prompt, "id"|"isUser">) => number;
  get: (id: number) => Prompt | undefined;
  remove: (id: number) => void;
  update: (id: number, updater: (prompt: Prompt) => void) => void;
  setBuiltinPrompts: (prompts:Prompt[])=> void;

  promptsToArray :(prompts: Record<number, Prompt>) => Prompt[];
  getAllPrompts: () => Prompt[];
  search: (text: string) => Prompt[];
}

export const SearchService = {
  ready: false,
  builtinEngine: new Fuse<Prompt>([], { keys: ["title"] }),
  userEngine: new Fuse<Prompt>([], { keys: ["title"] }),
  count: {
    builtin: 0,
  },

  init(builtinPrompts: Prompt[], userPrompts: Prompt[]) {
    if (this.ready) {
      return;
    }
    this.builtinEngine.setCollection(builtinPrompts);
    this.userEngine.setCollection(userPrompts);
    this.ready = true;
  },

  updateBuiltinPrompts(builtinPrompts: Prompt[]){
    this.builtinEngine.setCollection(builtinPrompts);
  },

  remove(id: number) {
    this.userEngine.remove((doc) => doc.id === id);
  },

  add(prompt: Prompt) {
    this.userEngine.add(prompt);
  },
  
  search(text: string) {
    const userResults = this.userEngine.search(text);
    const builtinResults = this.builtinEngine.search(text);
    return userResults.concat(builtinResults).map((v) => v.item);
  },

  
};

export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      latestId: 0,
      userPrompts: {},
      builtinPrompts: {},
      builtinLoaded:false,

      add(prompt) {
        const prompts = get().userPrompts;
        const newPrompt = {...prompt, id: get().latestId + 1, isUser: true}
        prompts[newPrompt.id] = newPrompt;
        SearchService.add(newPrompt)
        set(() => ({
          latestId: newPrompt.id!,
          userPrompts: {...prompts},
        }));

        return newPrompt.id!;
      },

      get(id) {
        const targetPrompt = get().userPrompts[id];

        if (!targetPrompt) {
          return get().builtinPrompts[id];
        }

        return targetPrompt;
      },

      remove(id) {
        const prompts = get().userPrompts;
        delete prompts[id];
        SearchService.remove(id);

        set(() => ({
          userPrompts: {...prompts},
        }));
      },

      update(id: number, updater) {
        const prompt = get().userPrompts[id] 
        if(!prompt)
          return;

        SearchService.remove(id);
        updater(prompt);
        const prompts = get().userPrompts;
        prompts[id] = prompt;
        set(() => ({ userPrompts:{...prompts} }));
        SearchService.add(prompt);
      },

      setBuiltinPrompts(prompts:Prompt[]){
        const builtinPrompts = prompts.reduce((acc:Record<number, Prompt>, prompt:Prompt)=>{
          acc[prompt.id] = prompt;
          return acc;
        },{})
        set(()=>({builtinPrompts}))
      },
      

      promptsToArray(prompts: Record<number, Prompt>) {
        const promptValues = Object.values(prompts ?? {});
        promptValues.sort((a, b) => (b.id && a.id ? b.id - a.id : 0));
        return promptValues;
      },

      getAllPrompts(){
        const {builtinPrompts, userPrompts, promptsToArray} = get();
        return promptsToArray(userPrompts).concat(promptsToArray(builtinPrompts));
      },

      search(text) {
        if (text.length === 0) {
          // return all rompts
          return get().getAllPrompts();
        }
        return SearchService.search(text) as Prompt[];
      },


    }),

    {
      name: StoreKey.Prompt,
      version: 1,
      onRehydrateStorage(){
        //  水合（localStorage和内存的状态融合时触发，只运行于客户端，只发生一次，发生在nextjshydrate之前）
        
        return (state, error) => {
          if (error) {
            console.log('an error happened during hydration', error)
          } else {
            const {promptsToArray, userPrompts, builtinPrompts} = state as PromptStore;
            const userPromptArray = promptsToArray(userPrompts) ?? [];
            const builtinPromptArray = promptsToArray(builtinPrompts) ?? [];
            SearchService.init(builtinPromptArray, userPromptArray);
          }
        }
      },
    },
  ),
);





if (process.env.NODE_ENV === 'development') {
  mountStoreDevtool('PromptStore', usePromptStore);

}