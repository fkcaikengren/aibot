export type Updater<T> = (updater: (value: T) => void) => void;


export interface BasePlan {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string; //套餐名
  tokens: number; //token数
  originalPrice:number; //原价
  price: number; //售价
  period: number; //有效天数
  onlyNew: boolean; //仅限新用户
  // llm: LLM;
}

export interface BaseLLM {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  price: number;
  // balances: Balance[];
}
