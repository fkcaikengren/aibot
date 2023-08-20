'use client'

import React,{FC, ReactNode} from 'react'
import { classNames } from '../utils/classNames';

interface CardProps{
  className?: string,
  children: ReactNode,
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Card: FC<CardProps> = ({className, onClick, children}) => {
  return (
  <div onClick={onClick} className={classNames('rounded-xl p-4', className)}>
    {children}
  </div>
  );
}

export default Card