
import LoginForm from "./components/LoginForm";
import Image from "next/image";
import Link from 'next/link'

// background-image: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%);


export default async function LoginPage() {
  
    return (
      <div>
        <h3 className="text-xl font-bold text-center">用户登录</h3>
        <main>
          <div className="pt-6">
            <LoginForm />
            <div className='flex flex-row-reverse items-center mt-6'>
              <Link className='cursor-pointer text-violet-500  hover:text-violet-600 pr-3'
                href={'/login/register'}>
              立即注册
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }
  





