import type { JSX, ReactNode } from 'react';
import styles from './Container.module.css';

export interface ContainerProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function Container({ children, className }: ContainerProps): JSX.Element {
  const combinedClassName = className
    ? `${styles.container} ${className}`.trim()
    : styles.container;

  return <div className={combinedClassName}>{children}</div>;
}
