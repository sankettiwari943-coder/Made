import React from 'react';
import clsx from 'clsx';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'default' | 'narrow' | 'prose';
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'default',
  className,
  ...props
}) => {
  const sizeClass = {
    default: 'container',
    narrow: 'container-narrow',
    prose: 'container-prose',
  }[size];

  return (
    <div className={clsx(sizeClass, className)} {...props}>
      {children}
    </div>
  );
};
