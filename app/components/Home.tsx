"use client"
require("../polyfill");

import Image from "next/image";
import Card from "./Card";
import { useAccessStore } from "../store";
import MyAvatar from '../images/avatar.jpeg'
import { displayTokensNum } from "../utils/format";
import { removeCookieToken } from "../http/client";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";


// TODO: 加载字体
// const loadAsyncGoogleFont = () => {
//   const linkEl = document.createElement("link");
//   linkEl.rel = "stylesheet";
//   linkEl.href =
//     "/google-fonts/css2?family=Noto+Sans+SC:wght@300;400;700;900&display=swap";
//   document.head.appendChild(linkEl);
// };





export default function Home({data}: {data:any}) {

  const {avatar , nickname, email, balances} = data;
  const accessStore = useAccessStore()
  const router = useRouter();

  const logout = useDebouncedCallback(
    () => {
       // 清空access-store和cookie
       accessStore.reset();
       removeCookieToken();
       router.push('/login')
    },
    500,
    { leading: true, trailing: true },
  );

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div>
        <Card className="bg-white flex">
          <Image
            className="rounded-full border border-violet-300 "
            src={avatar || MyAvatar}
            alt="avatar"
            width={80}
            height={80}
          />
          <div className="pl-5 flex flex-col items-start justify-around">
            <div className="flex">
              <div className="text-3xl text-violet-500">
                {nickname}
              </div>
            </div>
            <div className="flex">
              <div className="bg-violet-300 rounded-sm text-white px-1 mr-2 flex-shrink-0">
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
                  <p>剩余 <span className="text-xl font-bold">{displayTokensNum(bl.total - bl.used)}</span> tokens</p>
                  <p>已使用{displayTokensNum(bl.used)} / 总计{displayTokensNum(bl.total)} tokens</p>
                </Card> 
              ))
            }
            
          </div>
        </Card>
      </div>

      <div className="flex justify-center ">
        <button 
          className="px-12 py-2 rounded-full hover:bg-gray-200 text-red-600 font-bold"
          onClick={logout}
        >
          退出登录
        </button>
      </div>
    </div>
  );
  
}
