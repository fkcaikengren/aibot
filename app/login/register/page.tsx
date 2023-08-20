
import Logo from '../../images/logo.png'
import Image from "next/image";
import Link from 'next/link'
import RegisterForm from '../components/RegisterForm'
// background-image: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%);


export default async function RegisterPage() {
    return (
      <div>
        
        <h3 className="text-xl font-bold text-center">新用户注册</h3>
        <main>
          <div className="pt-6">
            <RegisterForm />
            <div className='flex flex-row-reverse items-center mt-6'>
              <div>
                <span className='mr-1'>已有账号 👉</span>
                <Link className='cursor-pointer text-violet-500  hover:text-violet-600 pr-3'
                  href={'/login'}>
                    立即登录
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  





