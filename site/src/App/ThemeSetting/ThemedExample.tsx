import React, { ReactNode } from 'react';
import { useThemeSettings } from './ThemeSettingContext';
import { BraidProvider, Box } from '../../../../lib/components';
import { BoxProps } from '../../../../lib/components/Box/Box';
import * as styles from './ThemedExample.css';

interface ThemedExampleProps {
  background?: BoxProps['background'];
  children: ReactNode;
}

export function ThemedExample({ background, children }: ThemedExampleProps) {
  const { theme, ready } = useThemeSettings();

  return (
    <Box opacity={!ready ? 0 : undefined} transition="fast">
      <BraidProvider styleBody={false} theme={theme}>
        <Box
          boxShadow={{
            darkMode: 'borderNeutralLarge',
          }}
          background={background || { lightMode: 'body', darkMode: 'bodyDark' }}
          padding={['small', 'medium', 'large']}
          className={styles.unthemedBorderRadius}
        >
          {children}
        </Box>
      </BraidProvider>
    </Box>
  );
}
