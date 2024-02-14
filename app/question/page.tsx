import Image from "next/image";



import ShareImg from '../images/share.png'


export default async function Question () {

  return (
    <div className="p-4 sm:p-7">
   
      <div className='flex flex-col gap-2'>
        
        <div className='bg-white flex flex-col items-start rounded-xl p-4'>
          <h3 className="text-lg text-gray-900  mb-3">
          1.token的消耗是如何计算的?
          </h3>
          <div className="p-2">
          <p>
          对于中文文本1个token大约是0.44个汉字。这个换算不是绝对准确的，我们的请求的token数是由我们的提示和请求的回复长度决定的。通常1000个Token约等于750个英文单词或者440汉字。
          </p>
          </div>
        </div>
        <div className='bg-white flex flex-col items-start rounded-xl p-4'>
          <h3 className="text-lg text-gray-900  mb-3">
          2.如何获取GPT4的token?
          </h3>
          <div className="p-2 flex flex-col gap-1">
            <div>
              <p className="font-bold">方式一</p>
              <p className="pl-2">
                别人填写你邀请码完成注册，你和对方将各自获得 3K个 GPT4 token。
              </p>
            </div>
            <div>
              <p className="font-bold">方式二</p>
              <div className="pl-2">
                <p>1）将下面图片(请下载图片)和文字分享到朋友圈，截图朋友圈发送给网站管理员。分享即可获得 10K个 GPT4 token， 每多一个赞可多获得5K个, 最多可获得 50K个 token。</p>
                <p>2）添加网站管理员WX : <span className='text-green-400'>ai_caikengren</span>。将你分享朋友圈的截图和你的用户ID（在首页复制）发送到网站管理员WX。</p>
              </div>

              <div className="border mt-2">
                <p className="text-center mt-2"> 我在用免费的ChatGPT网站：aiyongheng.top (爱用恒.top)，一起来用用看吧！</p>
                <div className='flex items-center justify-center mt-4'>
                  <div className="w-60 h-60">
                    <Image
                      src={ShareImg}
                      alt="avatar"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
