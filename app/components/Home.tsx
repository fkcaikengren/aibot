"use client"
require("../polyfill");


import { useAccessStore } from "../store";
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





export default function Home() {

  
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
    <div className="flex justify-center ">
      <button 
        className="px-12 py-2 rounded-full hover:bg-gray-200 text-red-600 font-bold"
        onClick={logout}
      >
        退出登录
      </button>
    </div>
  );
  
}
