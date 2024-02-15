
import LoadingIcon from "./icons/three-dots.svg";

export default function DashboardLoading() {
  return <div className="h-40 w-full flex-1 flex flex-col justify-center items-center">
      <LoadingIcon className="w-12"/>
      <div className="text-sm mt-1 text-gray-500">努力加载中...</div>
    </div>
}