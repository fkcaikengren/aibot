import Card from '../components/Card';
import AppEnglishIcon from '../icons/app-english.svg'
import CardLink from '../components/CardLink'

export default async function AIApps() {
    return (
      <div className="p-4 sm:p-7 h-full">
          <CardLink href='/apps/study-language' external className='bg-white w-[120px] h-[120px] cursor-pointer flex flex-col items-center justify-center'>
            <AppEnglishIcon className='w-10 h-10 mb-2' /> 
            <div className='text-center'>语言学习</div>
          </CardLink>
  
      
    </div>
    );
}
  