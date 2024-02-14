
import { httpGet } from '../http/server';

import { BaseLLM, BasePlan } from '../typing';
import PlanCard from './components/PlanCard';




export interface Plan extends BasePlan{
  llm: BaseLLM
}

export default async function Pay () {
  return null
}

// export default async function Pay () {
//   const res = await httpGet('/plans')
//   const plans = res.data

//   if(res.code != 200 || !plans){
//     return null;
//   }
  
//   return (
//     <div className="p-4 sm:p-7">
   
//     <h2 className='mt-2 mb-6 ml-1 text-2xl '>购买适合你的套餐</h2>
//       <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-7'>
//         {plans.map((plan: Plan)=>(
//           <PlanCard  key={plan.id} plan={plan}/>
//         ))
//         }
//       </div>
//     </div>
//   );
// }
