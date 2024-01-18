'use client'

import { ReactNode } from "react"
import Card from "./Card"
import { useRouter } from "next/navigation";


interface CardLinkProps {
  className?: string,
  children: ReactNode,
  href: string,
  external?: boolean
}


const CardLink = ({className, children, href, external}: CardLinkProps) => {
  const router = useRouter();
  return <Card className={className} onClick={(e) => {
    console.log(href)
    if(external) {
      window.open(`http://${window.location.host}${href}`, '_blank')
    } else {
      router.push(href)
    }
  }}>
    {children}
  </Card>
}

export default CardLink  