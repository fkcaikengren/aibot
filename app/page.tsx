// import { Analytics } from "@vercel/analytics/react";

import Home from "./components/Home";
import { httpGet } from './http/server';
import Image from "next/image";
import Card from "./components/Card";

import MyAvatar from './images/avatar.jpeg'
import { displayTokensNum } from "./utils/format";

// Add
// export const dynamic = 'force-dynamic'
// export const revalidate = 3600 // revalidate at most every hour

export default async function App() {
  
  const res = await httpGet('/users/balance')
  if(res.code !== 200){
    return null;
  }
  const {avatar , nickname, email, balances} = res.data;



  return (
    <div className="flex flex-col items-center w-full h-full p-4 sm:p-7"> 
       <div className="w-full h-full flex flex-col justify-between">
      <div>
        <Card className="bg-white flex">
          <Image
            className="rounded-full border border-violet-300 w-[68px] sm:w-[80px]"
            src={avatar || MyAvatar}
            alt="avatar"
            width={80}
            height={80}
          />
          <div className="pl-4 sm:pl-5 flex flex-col items-start justify-around">
            <div className="flex">
              <div className="text-2xl sm:text-3xl text-violet-500">
                {nickname}
              </div>
            </div>
            <div className="flex leading-tight sm:leading-normal">
              <div className="bg-violet-300 rounded-md text-white px-[2px] sm:px-[4px] mr-2 flex-shrink-0">
                邮箱
              </div>
              <p className=" text-gray-600">{email}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white mt-10 flex flex-col">
          <h3 className="text-lg text-black font-semibold mb-4 ml-1">我的订阅</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {balances && 
              balances.map((bl:any, idx:number)=>(
                <Card key={idx} className="text-white bg-gradient-to-r from-[#a6c1ee] to-[#fbc2eb] flex flex-col">
                  <h4 className="text-2xl mb-2">{bl.llm.name}</h4>
                  {bl.llm.name !== 'gpt-3.5-turbo' &&
                    <>
                    <p>剩余 <span className="text-xl font-bold">{displayTokensNum(bl.total - bl.used)}</span> tokens</p>
                    <p>已使用{displayTokensNum(bl.used)} / 总计{displayTokensNum(bl.total)} tokens</p>
                    </>
                  }
                  {bl.llm.name === 'gpt-3.5-turbo' &&
                    <p className="text-xl font-bold">免费</p>
                  }
                 
                </Card> 
              ))
            }
            
          </div>
        </Card>
      </div>

      <Home></Home>
    </div>
    </div>
  );
}
