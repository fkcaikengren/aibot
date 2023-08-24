"use client";

import { useModal } from "@/app/components/Modal";
import { EMAIL_REGEX, PASSWORD_REGEX } from "@/app/constant";
import { httpGet, httpPost } from "@/app/http/client";
import { classNames } from "@/app/utils/classNames";
import { useRouter } from "next/navigation";
import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

interface FormItems {
  cname: string,
  fieldName: string;
  type: string;
  placeholder: string;
  reg: RegExp;
  errMsg: string;
  suffix?:string;
  
}

const formItems: FormItems[] = [
  {
    cname: "邮箱地址",
    fieldName: "email",
    type: "email",
    placeholder: '邮箱地址',
    reg: EMAIL_REGEX,
    errMsg: "邮箱格式错误",
  },
  {
    cname: "邮箱验证码",
    fieldName: "emailCode",
    type: "text",
    placeholder: '邮箱验证码',
    reg: /\d{6}/,
    errMsg: '邮箱验证码不正确',
  },
  {
    cname: "密码",
    fieldName:'password',
    type: 'password',
    placeholder: '密码',
    reg: PASSWORD_REGEX,
    errMsg: '长度需大于6位',
  },
  {
    cname: "重复密码",
    fieldName:'repeatPassword',
    type: 'password',
    placeholder: '重复密码',
    reg: PASSWORD_REGEX,
    errMsg: '长度需大于6位',
  },
  {
    cname: "邀请码",
    fieldName:'inviteCode',
    type: 'text',
    placeholder: '邀请码（选填）',
    reg: /.*/,
    errMsg: '',
  }

];


function TermsModal(){
  const {closeModal} = useModal()
  return  <>
    <div className="px-6 py-5 border-dotted border-b-2">
      <h3 className="text-violet-500 text-lg text-bold">踩坑人服务条款协议</h3>
    </div>
    <div className="flex-1 overflow-y-auto px-6 py-3">
    <p>尊敬的用户： </p>
    <p>欢迎使用踩坑人AI（以下简称“本网站”）！在使用本网站之前，请仔细阅读本隐私权政策（以下简称“本政策”）。</p>
    <p>本政策说明本网站如何收集、使用、披露、处理、保护用户信息和平台使用规范。请注意，一旦您访问或使用本网站，即表示您同意接受本政策的全部条款和条件。 </p>
    
    <h4 className="text-lg text-bold my-2">一、信息收集 </h4>
    <p>1.1 当您访问或使用本网站时，我们可能会收集您的个人信息，包括但不限于您的姓名、电子邮件地址、电话号码、IP地址、设备信息等。我们收集这些信息是为了提供更好的服务和用户体验。 </p>
    <p>1.2 我们可能会通过本网站或其他途径收集您的信息，包括但不限于通过Cookies、标记和其他技术收集的信息。  </p>
    <p>1.3 我们不会主动收集或处理与您的个人敏感信息相关的信息，例如您的种族、宗教信仰、政治倾向、健康状况、性取向等。如果您提供这些信息，我们将按照法律法规的要求对其进行保护。 </p>
    
    <h4 className="text-lg text-bold my-2">二、信息使用</h4>
    <p>2.1 我们将使用您的信息为您提供服务，并改进和优化我们的服务。 
      2.2 我们可能将您的信息用于本网站或其他产品或服务的推广或市场营销目的。 
      2.3 我们不会将您的个人信息出售、出租或交易给第三方。 </p>

    <h4 className="text-lg text-bold my-2">三、信息披露</h4>
    <p>3.1 我们可能会在以下情况下披露您的个人信息：</p>
    <ul>
      <li>(1) 按照法律法规、法院命令、政府部门的要求或者其他法律程序的规定进行披露； </li>
      <li>(2) 为保护我们的权利、财产或安全，以及我们的用户或公众的权利、财产或安全而必须披露的情况； </li>
      <li>(3) 与我们的附属公司、合作伙伴和服务提供商共享您的信息，以便他们能够为您提供服务。</li>
    </ul>
       
    <h4 className="text-lg text-bold my-2">四、信息处理 </h4>
    <p>4.1 我们将采取合理的安全措施保护您的个人信息，并防止未经授权的访问、使用或泄露。 </p>
    <p>4.2 我们将采取合理的技术手段收集、存储和处理您的个人信息，并将根据法律法规的要求对其进行保护。 </p>
      
    <h4 className="text-lg text-bold my-2">五、未成年人信息保护  </h4>
    <p> 5.1 本网站适用于年满18岁或以上的成年人。我们不会有意向未满18岁的儿童收集他们的个人信息。如果我们得知您提供给我们的信息属于未成年人的个人信息，我们将立即采取合理措施删除该信息。 </p>
    
    <h4 className="text-lg text-bold my-2">六、用户发布内容规范</h4>
    <p>6.1 用户不得利用“踩坑人 AI”账号或本网站功能服务制作、上传、复制、发布、传播如下法律、法规和政策禁止的内容： </p>

    <ul>
      <li>(1) 反对宪法所确定的基本原则的；</li>
      <li>(2) 危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；</li>
      <li>(3) 损害国家荣誉和利益的；</li>
      <li>(4) 煽动民族仇恨、民族歧视，破坏民族团结的；</li>
      <li>(5) 破坏国家宗教政策，宣扬邪教和封建迷信的；</li>
      <li>(6) 散布谣言，扰乱社会秩序，破坏社会稳定的；</li>
      <li>(7) 散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；</li>
      <li>(8) 侮辱或者诽谤他人，侵害他人合法权益的；</li>
      <li>(9) 含有法律、行政法规禁止的其他内容的信息。</li>
    </ul>
    
    <p>6.2 用户不得利用“踩坑人 AI”账号或本网站功能服务制作、上传、复制、发布、传播如下干扰“功能服务”正常运营，以及侵犯其他用户或第三方合法权益的内容：</p>
    <ul>
      <li>(1) 含有任何性或性暗示的；</li>
      <li>(2) 含有辱骂、恐吓、威胁内容的；</li>
      <li>(3) 含有骚扰、垃圾广告、恶意信息、诱骗信息的；</li>
      <li>(4) 涉及他人隐私、个人信息或资料的；</li>
      <li>(5) 侵害他人名誉权、肖像权、知识产权、商业秘密等合法权利的；</li>
      <li>(6) 含有其他干扰本服务正常运营和侵犯其他用户或第三方合法权益内容的信息。</li>
    </ul>


    <h4 className="text-lg text-bold my-2">七、平台服务使用规范</h4>
    <p>7.1 在接受我们服务的过程中，您不得从事下列行为：</p>
    <ul>
      <li>(1) 在使用我们平台服务过程中实施的所有行为均遵守国家法律、法规等规范文件及我们平台各项规则的规定和要求，不违背社会公共利益或公共道德，不损害他人的合法权益，不违反本协议及相关规则。您如果违反前述承诺，产生任何法律后果的，您应以自己的名义独立承担所有的法律责任，并确保我们免于因此产生任何损失或增加费用。</li>
      <li>(2) 不发布国家禁止发布的信息（除非取得合法且足够的许可），不发布涉嫌侵犯他人知识产权或其它合法权益的信息，不发布违背社会公共利益或公共道德、公序良俗的信息，不发布其它涉嫌违法或违反本协议及各类规则的信息。</li>
      <li>(3) 不对我们平台上的任何数据作商业性利用，包括但不限于在未经我们事先书面同意的情况下，以复制、传播等任何方式使用我们平台站上展示的资料。</li>
      <li>(4) 不使用任何装置、软件或例行程序干预或试图干预我们平台的正常运作或正在我们平台上进行的任何活动。您不得采取任何将导致不合理的庞大数据负载加诸我们平台网络设备的行动。</li>
    </ul>
    <p>7.2 您同意，在发现本网站任何内容不符合法律规定，或不符合本用户协议规定的，您有义务及时通知我们。如果您发现您的个人信息被盗用、您的版权或者其他权利被侵害，请将此情况告知我们并同时提供如下信息和材料：</p>
    <ul>
      <li>(1) 侵犯您权利的信息的网址，编号或其他可以找到该信息的细节；</li>
      <li>(2) 您是所述的版权或者其他权利的合法拥有者的权利证明；</li>
      <li>(3) 您的联系方式，包括联系人姓名，地址，电话号码和电子邮件；</li>
    </ul>

    <h4 className="text-lg text-bold my-2">八、免责声明</h4>
    <p>8.1 踩坑人 AI无法对用户发表的回答或评论的正确性进行完全性保证。用户在踩坑人 AI发表的内容仅表明其个人的立场和观点，并不代表踩坑人 AI的立场或观点。作为内容的发表者，需自行对所发表内容负责，因所发表内容引发的一切纠纷，由该内容的发表者承担全部法律及连带责任。踩坑人 AI不承担任何法律及连带责任。 </p>
    <p>8.2 踩坑人 AI不保证网络服务一定能满足用户的要求，也不保证网络服务不会中断，对网络服务的及时性、安全性、准确性也都不作保证。 </p>
    <p>8.3 对于因不可抗力或踩坑人 AI不能控制的原因造成的网络服务中断或其它缺陷，踩坑人 AI不承担任何责任，但将尽力减少因此而给用户造成的损失和影响。</p>
    
    <h4 className="text-lg text-bold my-2">九、其他</h4>
    <p>9.1 本政策适用于本网站的所有用户。如果您是本网站的注册用户，您还应遵守与注册服务相关的协议。 </p>
    <p>9.2 我们可能会不定期地更新和修订本政策。在本政策发生重大变化时，我们将在本网站发布更新版本。在更新版本发布后，您继续访问或使用本网站，即视为您同意受更新版本的政策约束。 </p>
    <p>9.3 本政策的解释、执行和纠纷解决均适用中华人民共和国的法律。如本政策与中华人民共和国的法律相抵触，以法律规定为准。 本隐私权政策最近更新日期为：2023年8月9日。</p>
    </div>
    <div className="px-6 py-5 border-dotted border-t-2 flex flex-row-reverse">
      <button className=" border px-3 py-1 rounded-lg border-violet-500 text-violet-500 bg-violet-300 hover:text-white hover:bg-violet-600  transition-all duration-300" onClick={()=>closeModal()}>确定</button>
    </div>
    </>
}

export default function RegisterFrom() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    getValues,
  } = useForm({mode:'onBlur'});

  const router = useRouter();
  const countdownInterval = useRef<any>(0);
  const { openModal } = useModal()
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0)

  useEffect(()=>{
    onClickTerms();
    return ()=>{
      if(countdownInterval.current>0){
        clearInterval(countdownInterval.current);
      }
    }
  },[])

  const onClickTerms = (e?: MouseEvent<HTMLAnchorElement>)=>{
    openModal(<TermsModal /> , { containerClass:"flex flex-col justify-between ai-absolute-center rounded-2xl bg-white w-11/12 h-5/6 sm:w-3/4 sm:h-3/4 max-w-[800px] text-gray-600"})
    e?.preventDefault()
  }

  const onGetEmailCode = useCallback(async ()=>{
    
    //发送验证码
    const emailAddr = getValues('email');
    if(!EMAIL_REGEX.test(emailAddr))
      return ;
    setSending(true)
    const res = await httpGet(`/email_codes/${emailAddr}`);
    setSending(false);
    if(res.code >=400 || res.code <200 )
      return
    
    setCountdown(90);
    let startCountdown = true;
    
    countdownInterval.current = setInterval(function() {
      if(startCountdown)
        startCountdown = false;

      setCountdown(countdown=>{
        if ((countdown-1) <= 0 && !startCountdown) {
          clearInterval(countdownInterval.current);
        }
        return countdown-1;
      });
      
    }, 1000);
  },[getValues])

  const onRegister = handleSubmit((body)=>{

    //验证两次密码
    if(body.repeatPassword !== body.password){
      setError('repeatPassword', { type: 'custom', message: '两次密码不一致!!!' });
      return;
    }
    
    setLoading(true)
    httpPost('/users', body).then(res=>{
      if(res.code === 200){
        toast.success("注册成功")
        router.push('/login')
      }else{
        setLoading(false)
      }
    })
  })



  return (
    <form className="leading-normal" onSubmit={handleSubmit((data) => console.log(data))}>
      {formItems.map((item) => (
        <div key={item.fieldName} className="flex flex-col">
          <div className="relative">
            <input
              className={classNames('rounded-full border w-full px-4 py-2 bg-white overflow-hidden hover:border-violet-500  focus:border-violet-500',{
                'pr-28':item.fieldName==='emailCode'
              })}
              placeholder={item.placeholder}
              type={item.type}
              {...register(item.fieldName, {
                required: item.fieldName==='inviteCode'? false: `请输入${item.cname}`,
                onChange:item.fieldName==='repeatPassword'?(e)=> {
                  if(e.target?.value === getValues("password")){
                    clearErrors('repeatPassword'); // for clear single input error
                  }else{
                    setError('repeatPassword', { type: 'custom', message: '两次密码不一致' });
                  }
                } : undefined,
                pattern: {
                  value: item.reg,
                  message: item.errMsg,
                },
              })}
            />
            {item.fieldName==='emailCode' &&
              <button type="button"
                className={classNames("absolute right-0 top-0 inline-block w-28 pr-4 py-2  rounded-r-full border border-transparent hover:border-gray-200",{
                  'text-gray-400':(sending || countdown>0),
                  'cursor-wait':(sending || countdown>0)
                })}
                disabled={sending || countdown>0}
                onClick={onGetEmailCode}
              >
                {sending ? '发送中...' :(countdown>0?`${countdown}s`:'获取验证码')}
              </button>
            }
          </div>
          <p className="pl-3 min-h-[26px]  text-red-600 text-sm">
            {errors[item.fieldName]?.message as string}
          </p>
        </div>
      ))}
      {/* 服务条款 */}
      <div>
        <div className="pl-3 flex items-center">
          <input type="checkbox" 
            className="w-4 h-4 bg-gray-100 border-gray-300 rounded-xl checked:bg-violet-400 hover:cursor-pointer"
            value="" 
            id="TermCheckInRegister" 
            {...register('agree', {
              required: "使用本站必须同意服务条款",
            })}
            />
          <label
            className="inline-block pl-[0.2rem] mr-1 hover:cursor-pointer"
            htmlFor="TermCheckInRegister"
          >
            注册即代表同意
          </label>
          <a
            className="text-violet-400 hover:text-violet-600 hover:cursor-pointer"
            onClick={onClickTerms}
          >
            服务条款
          </a>
        </div>
        <p className="pl-3 min-h-[26px]  text-red-600 text-sm">
            {errors['agree']?.message as string}
          </p>
      </div>
      <div className="flex">
        <button
          className={classNames('flex-1 py-2 px-4 text-white bg-violet-500 hover:bg-violet-600 disabled:bg-violet-600 rounded-full ',{
            'cursor-pointer':!loading,
            'cursor-progress': loading
          })}
          disabled={loading}
          type="submit" 
          onClick={onRegister}
          >
            {loading?"处理中...":"注册"}
        </button>
      </div>
    </form>
  );
}
