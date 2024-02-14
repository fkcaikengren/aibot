"use client"

import { useAccessStore } from "../store";
import { removeCookieToken } from "../http/client";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import CopyIcon from '../icons/copy.svg'
import { copyToClipboard } from "../utils";
import { IconButton } from "./Button";

export default function MyInviteCode(props: { inviteCode: string, id: string}) {
  
  const accessStore = useAccessStore()
  const router = useRouter();

  const copyCode = ()=>{
    copyToClipboard(props.inviteCode)
  }

  const copyID = ()=>{
    copyToClipboard(props.id)
  }

  return (
    <div className="flex flex-wrap gap-2 justify-between w-full">
      
      <div className="flex items-center">
        <IconButton icon={<CopyIcon />} text="ID：" onClick={copyID}/>
        <span className='text-gray-600'>{props.id.slice(0,6)}<span className='align-sub'>*****</span>{props.id.slice(-6)} </span>
      </div>
      <div className="flex items-center">
        <IconButton icon={<CopyIcon />} text="邀请码：" onClick={copyCode}/>
        <span className='text-gray-600'>{props.inviteCode} </span>
      </div>
    </div>
  );
  
}
