import React, { ReactElement } from 'react';
import clsx, { ClassValue } from 'clsx';
import { renderBackgroundProvider } from './BackgroundContext';
import { atoms, Atoms } from '../../css/atoms/atoms';
import { useColoredBoxClasses } from './ColoredBox';

export interface BoxRendererProps extends Omit<Atoms, 'reset'> {
  component?: Atoms['reset'];
  className?: ClassValue;
  children: (className: string) => ReactElement | null;
}

const ColoredBoxRenderer = ({
  background,
  children,
  className,
}: {
  background: NonNullable<BoxRendererProps['background']>;
  children: BoxRendererProps['children'];
  className: string;
}) => {
  const colorClasses = useColoredBoxClasses(background);
  const element = children(clsx(className, colorClasses));

  return renderBackgroundProvider(background, element);
};

export const BoxRenderer = ({
  children,
  component = 'div',
  className,
  background,
  ...props
}: BoxRendererProps) => {
  const atomicClasses = atoms({ reset: component, ...props });

  return background ? (
    <ColoredBoxRenderer
      background={background}
      className={clsx(className, atomicClasses)}
    >
      {children}
    </ColoredBoxRenderer>
  ) : (
    children(clsx(className, atomicClasses))
  );
};
