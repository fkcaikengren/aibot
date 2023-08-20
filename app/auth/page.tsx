import LoadingIcon from "../icons/three-dots.svg";
import AuthControl from "./components/AuthControl";

export default async function AuthPage() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <LoadingIcon className="w-12"/>
      <AuthControl />
    </div>
  );
}
  