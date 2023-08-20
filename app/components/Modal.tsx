'use client'
import { classNames } from '@/app/utils/classNames';


import React, {FC, PropsWithChildren, 
  createContext, useContext,
  useState, useEffect, 
  useCallback, MouseEvent, useRef, CSSProperties,  } from 'react';
import { createPortal } from 'react-dom';



interface ModalOptions {
  name?: string;
  containerClass?: string;
  transitionEndStyle?: CSSProperties;
  transitionDuration?: number; //毫秒
}

interface CompoundModal extends ModalOptions {
  elem: JSX.Element;
}

export const modalContext = createContext({
  openModal: (modal: JSX.Element, options?:ModalOptions) => {},
  closeModal: () => {},
});

export const useModal = ()=>useContext(modalContext)


const modals:CompoundModal[] = []




const Modal: FC<PropsWithChildren<{}>> = ({children})=> {
  const [hasDom, setHasDom] = useState(false);
  const [actives, setActives] = useState<string[]>([]);
  const modalRefs = useRef<(HTMLDivElement|null)[]>([]);

  useEffect(() => {
    setHasDom(true);
  }, [setHasDom]);

  const openModal = useCallback(
    (modal: JSX.Element, options:ModalOptions={}) => {
      const name = options.name || modal.type.name;
      setActives((state)=>state.concat(name));
      modals.push({
        elem: modal, 
        ...options,
      })

      setTimeout(()=>{
        //修改dom
        const ref = modalRefs.current[modalRefs.current.length-1]
        if(ref && options.transitionEndStyle ){
          Object.keys(options.transitionEndStyle).forEach((key:any)=>{
            ref.style[key] = options.transitionEndStyle?.[key as keyof CSSProperties] as string ||'';
          })
        }
      },1)
      
    },
    [setActives]
  );

  const closeModal = useCallback(() => {
    const modal = modals.pop()
    setTimeout(()=>{
      setActives(state => state.slice(0, -1));
    },modal?.transitionDuration ?? 0)

    //修改dom
    const ref = modalRefs.current[modalRefs.current.length-1]
    if(ref && modal?.transitionEndStyle ){
      Object.keys(modal.transitionEndStyle).forEach((key:any)=>{
        ref.style[key] = '';
      })
    }

  }, [setActives]);


  const onClickMask = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      closeModal();
    },
    [closeModal]
  );


  return (
    <modalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {hasDom &&
        actives.map((active, i) => {
          const modal = modals[i];
          return createPortal(
            <div className='absolute top-0 left-0 z-50 w-screen h-screen' >
              <div  
                ref={ref=>{modalRefs.current[i]=ref}} 
                className={classNames('absolute z-10',modal.containerClass)}>
                {modal.elem}
              </div>
              <div className='absolute top-0 left-0 w-full h-full bg-zinc-500/40 -z-1'
                onClick={onClickMask}></div>
            </div>,
            document.body
          )
        })}
    </modalContext.Provider>
  );
}

export default Modal;