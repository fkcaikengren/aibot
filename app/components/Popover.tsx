"use client"

export default function Popover(props: {
  children: JSX.Element;
  content: JSX.Element;
  open?: boolean;
  onClose?: () => void;
}) {
  return (
    <div className='relative z-10'>
      {props.children}
      {props.open && (
        <div className='absolute left-0 bottom-[calc(100%+1rem)]'>
          <div className='fixed left-0 top-0 w-screen h-screen' onClick={props.onClose}></div>
          {props.content}
        </div>
      )}
    </div>
  );
}