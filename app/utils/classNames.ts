// 键为string,值为boolean的对象类型
interface StringBooleanObject{
  [key:string]:boolean
}


type classItemType = string|undefined|StringBooleanObject;


export function classNames(...classes: classItemType[]) : string {
  return classes.filter(Boolean).map((classItem)=>{
    if(typeof classItem === 'string'){
      return classItem;
    }else if(typeof classItem === 'object'){
      return Object.keys(classItem as object).filter(key=>classItem[key]).map(key=>key).join(' ')
    }
    return ''

  }).join(' ')
}