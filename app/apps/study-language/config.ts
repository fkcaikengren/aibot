
import BottomSearchIcon  from '../../icons/bottom-search.svg'
import BottomTableIcon  from '../../icons/bottom-table.svg'
import BottomAnalysisIcon  from '../../icons/bottom-analysis.svg'
import BottomArticleIcon  from '../../icons/bottom-article.svg'
import BottomRateIcon  from '../../icons/bottom-rate.svg'

const APP_LANGUAGE_CONFIG = [
  {
    id:0,
    name:"查短语",
    Icon: BottomSearchIcon,
    pathname: '/vocabulary',
    defaultMessage: `请输入短语。\n
**输入举例**
输入英语： throw a wrench in
输入日语： いい颜（かお）をしない
输入德语： ab und zu`,
    tips:[],
    context: (content: string ="", lang:string ="")=>{
      const query = content.trim();
      if(!query) return ""
     
      return `以一种美观的markdown格式返回回答内容，要求如下：
1.用中文解释${lang}短语"${content}"的用法。
2.列出3句关于该短语的${lang}电视剧/电影例句，并给出例句出自哪部影视作品和例句的中文翻译。
输出格式如下：
**解释**：
...
**影视例句**：
例句1： ...
出处：《...》
翻译：...

例句2： ...
出处：《...》
翻译：...

例句3： ...
出处：《...》
翻译：...
`
    }
   },
  {
    id:1,
    name:"生词表",
    Icon: BottomTableIcon,
    pathname: '/word-table',
    defaultMessage: `请输入生词，用逗号隔开（每次输入的单词数量建议在100词以内）。\n
**输入举例**
输入： invite, pitch, dispatch
输入： ケーキ, オレンジ, 祝う`,
    tips:[],
    context: (content: string, lang:string ="")=>{
      return `生成${lang}单词表：请解释以下单词，生成一个markdown格式的表格，表格的列从左到右依次是：词汇、解释、词性、短语搭配、例句（每个单词信息占一行，多个短语放在一个单元格）。
      ${lang}单词：${content}`
    }
  },
  {
    id:2,
    name:"句法分析",
    Icon: BottomAnalysisIcon,
    pathname: '/sen-grammar',
    defaultMessage: `请输入要分析的句子。\n
**输入举例**：
输入英语句子：
It's that my idea of them as this romantic couple was a lie.

输入英语句子：
It’s all deliciously ironic when you consider that Shakespeare, who earns their living, was himself an actor (with a beard) and did his share of noise-making. 

输入西班牙语句子：
Los sentimientos están en el cerebro,no en el corazón. Sin embargo cuando algo o alguien te hiere te duele el pecho, no la cabeza. 
    `,
    tips:[], //我希望你担任${lang}老师。我会发给你一些${lang}句子，
    context: (content: string, lang:string ="")=>{
      return `请你用中文为我提供的${lang}句子进行语法分析，以美观的markdown格式返回回答内容。
分析示例格式：「
**句子**：...

**该句子的结构成分**：
...

**详细语法分析**：
...

**翻译**：
...

**难点词汇/短语**：
...
」
我给的句子如下：
${content} 
`
    }
  },
  {
    id:3,
    name:"词生文",
    Icon: BottomArticleIcon,
    pathname: '/word-article',
    defaultMessage: `请输入用于生成短文的单词（用逗号隔开），生成文章较长，单词数请控制在10个左右。
**输入举例**：
输入：
ambition, island, passport, throw, performance, locomotion, radiate, baggy, wrinkle
    `,
    tips:[],
    context: (content: string, lang: string)=>{
      return `用以下的单词生成一篇可读性强、有意思的${lang}文章，要求在文章里面给以下单词进行**加粗**标记：
${content}`
    }
  },
  {
    id:4,
    name:"造句评分",
    Icon: BottomRateIcon,
    pathname: '/sen-rating',
    defaultMessage: `请输入你造的句子。

**输入举例**

输入： 
It's advisable to make friend with people around you.

输入：
My friend, jackie, got hurt in the basketball competition held by university in last Saturday.

  `,
    tips:[],
    context: (content: string, lang: string)=>{
      return `请你担任${lang}老师，对我造的句子进行评分（满分10分），如果存在语法错误请具体指出，对于不合理的句子进行润色。此外提改写的句子（换一种表达，意思不变）。

我造的句子：${content}`
    }
  },
]

export const APP_LANGUAGE_PATHNAME = '/apps/study-language'


export const SUPPORT_LANGUAGES = [
  "英语",
  "俄语",
  "日语",
  "法语",
  "德语",
  "韩语",
  "泰语",
  "越南语",
  "韩语",
  "西班牙语",
  "阿拉伯语",
  "葡萄牙语",
  "乌尔都语",
  "土耳其语",
  "意大利语",
  "荷兰语",
  "波兰语",
  "乌克兰语",
  "罗马尼亚语",
  "菲律宾语",
  "希伯来语",
  "瑞典语",
  "塞尔维亚语",
  "匈牙利语",
  "希腊语",
  "捷克语",
  "泰米尔语",
  "保加利亚语",
  "丹麦语",
  "斯洛伐克语",
  "挪威语",
  "芬兰语",
  "拉脱维亚语",
  "爱沙尼亚语",
  "阿尔巴尼亚语",
  "克罗地亚语",
  "塞尔维亚语",
  "波斯语"
]


export default APP_LANGUAGE_CONFIG

