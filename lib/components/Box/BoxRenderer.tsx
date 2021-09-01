import React, { ReactElement } from 'react';
import clsx, { ClassValue } from 'clsx';
import { renderBackgroundProvider } from './BackgroundContext';
import { atoms, Atoms } from '../../css/atoms/atoms';
import { useColouredBoxClasses } from './ColouredBox';

export interface BoxRendererProps extends Omit<Atoms, 'reset'> {
  component?: Atoms['reset'];
  className?: ClassValue;
  children: (className: string) => ReactElement | null;
}

const ColouredBoxRenderer = ({
  background,
  children,
  className,
}: {
  background: NonNullable<BoxRendererProps['background']>;
  children: BoxRendererProps['children'];
  className: string;
}) => {
  const colourClasses = useColouredBoxClasses(background);
  const element = children(clsx(className, colourClasses));

  return renderBackgroundProvider(background, element);
};

export const BoxRenderer = ({
  children,
  component = 'div',
  className,
  ...props
}: BoxRendererProps) => {
  const atomicClasses = atoms({ reset: component, ...props });

  return props.background ? (
    <ColouredBoxRenderer
      background={props.background}
      className={clsx(className, atomicClasses)}
    >
      {children}
    </ColouredBoxRenderer>
  ) : (
    children(clsx(className, atomicClasses))
  );
};
