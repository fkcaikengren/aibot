import * as React from "react";

import { classNames } from '../utils/classNames';

export function IconButton(props: {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: JSX.Element;
  text?: string;
  textClassName?: string;
  className?: string;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <button
      className={classNames(
        ' overflow-hidden cursor-pointer flex justify-center items-center',
        props.className)}
      onClick={props.onClick}
      title={props.title}
      disabled={props.disabled}
      role="button"
    >
      {props.icon && (
        props.icon
      )}

      {props.text && (
        <div className={props.textClassName||''}>{props.text}</div>
      )}
    </button>
  );
}
