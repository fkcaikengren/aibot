// import { Analytics } from "@vercel/analytics/react";

import Home from "./components/Home";
import { httpGet } from './http/server';
// Add
// export const dynamic = 'force-dynamic'
// export const revalidate = 3600 // revalidate at most every hour

export default async function App() {
  
  const res = await httpGet('/users/balance')
  if(res.code !== 200){
    return null;
  }

  return (
    <div className="flex flex-col items-center w-full h-full p-4 sm:p-7"> 
      <Home data={res.data}></Home>
    </div>
  );
}
