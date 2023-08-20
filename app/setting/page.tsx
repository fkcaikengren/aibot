import Card from '../components/Card';
import CheckIcon from '../icons/check.svg'
import UserPrompt from './components/UserPrompt';




export default async function Profile () {
  
  return (
    <div className="p-4 sm:p-7 h-full">
      <Card className='bg-white h-full'>
        <UserPrompt />
      </Card>
    </div>
  );
}
