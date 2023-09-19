import FunctionBar from "./components/FunctionBar";



export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  
  return (
    <div className="bg-white p-4 md:px-8 md:py-6 w-full h-full relative max-w-[1440px] m-auto">
      <div className=" w-full h-[calc(100%-56px)] overflow-y-auto">
      {children}
      </div>
      
      <FunctionBar />
  </div>
  );
}
