"use client"

import { useAccessStore } from "../store";
import { removeCookieToken } from "../http/client";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import CopyIcon from '../icons/copy.svg'
import { copyToClipboard } from "../utils";
import { IconButton } from "./Button";

export default function MyInviteCode(props: { inviteCode: string, email: string}) {
  
  const accessStore = useAccessStore()
  const router = useRouter();

  const copyCode = ()=>{
    copyToClipboard(props.inviteCode)
  }

  const copyEmail = ()=>{
    copyToClipboard(props.email)
  }

  return (
    <div className="flex flex-col gap-2 w-full">
    

      <div className="flex items-center">
        <IconButton icon={<CopyIcon />} text="邮箱：" onClick={copyEmail}/>
        <span className='text-gray-600'>{props.email} </span>
      </div>
      <div className="flex items-center">
        <IconButton icon={<CopyIcon />} text="邀请码：" onClick={copyCode}/>
        <span className='text-gray-600'>{props.inviteCode} </span>
      </div>
    </div>
  );
  
}
