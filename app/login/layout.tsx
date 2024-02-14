import Image from "next/image";
import Logo from '../images/logo.png'
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const serverCookie = cookies();
  const token = serverCookie.get('token')?.value;
  //阻止认证成功的用户进入此页面
  if(token){
      redirect('/auth')
  }

  return (
    <div className="w-full h-full flex justify-center items-center bg-gradient-to-tl from-violet-500 to-blue-400">
      <div className="bg-white px-8 py-6 w-full h-full sm:h-auto sm:w-96 sm:rounded-lg flex flex-col justify-center text-sm sm:text-base relative">
        <header className="flex flex-col justify-center items-center mb-8 sm:mt-8">
          <Image
            className='rounded-2xl'
            src={Logo}
            alt='logo'
            width={60}
            height={60}
          />
        </header>
        {children}
      </div>
    </div>
  );
}
