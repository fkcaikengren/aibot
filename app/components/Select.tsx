
import DownIcon from "../icons/down.svg";
import { classNames } from "../utils/classNames";



export function Select(
  props: React.DetailedHTMLProps<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  >,
) {
  const { className, children, ...otherProps } = props;
  return (
    <div className={classNames('relative')}>
      <select className={classNames('h-full appearance-none cursor-pointer bg-white', className)} {...otherProps}>
        {children}
      </select>
      <DownIcon className='absolute top-1/2 right-1 -translate-y-1/2' />
    </div>
  );
}