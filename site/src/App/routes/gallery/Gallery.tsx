import React, {
  Fragment,
  ReactNode,
  memo,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import {
  RecoilRoot,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { chunk, memoize } from 'lodash';
import copy from 'copy-to-clipboard';
import { useGesture } from '@use-gesture/react';
import { useSpring, a, to } from '@react-spring/web';

import {
  BraidProvider,
  Stack,
  Text,
  Heading,
  Box,
  Badge,
  Inline,
  Link,
  TextLink,
  Columns,
  Column,
  Divider,
  TextLinkButton,
  IconNewWindow,
  IconAdd,
  IconMinus,
  TextDropdown,
  Strong,
} from '../../../../../lib/components';
import docsTheme from '../../../../../lib/themes/docs';
import { getHistory, isNew } from '../../Updates';
import source from '../../../../../lib/utils/source.macro';
import { CopyIcon } from '../../Code/CopyIcon';
import { CodeButton, formatSnippet } from '../../Code/Code';
import { ComponentExample } from '../../../types';
import {
  useThemeSettings,
  ThemedExample,
  ThemeToggle,
} from '../../ThemeSetting';
import {
  galleryComponents as allGalleryComponents,
  getComponentDocs,
} from '../../navigationHelpers';
import { PlayroomStateProvider } from '../../../../../lib/playroom/playroomState';
import { useSourceFromExample } from '../../../../../lib/utils/useSourceFromExample';
import * as icons from '../../../../../lib/components/icons';
import {
  zoom as zoomState,
  fitToScreenDimensions,
  Position,
} from './galleryState';
import { GalleryPanel } from './GalleryPanel';
import { IconButton } from '../../../../../lib/components/iconButtons/IconButton';
import useIcon, { UseIconProps } from '../../../../../lib/hooks/useIcon';
import { SVGProps } from '../../../../../lib/components/icons/SVGTypes';
import { Logo } from '../../Logo/Logo';

import * as styles from './gallery.css';

const DefaultContainer = ({ children }: { children: ReactNode }) => (
  <Fragment>{children}</Fragment>
);

const COLUMN_SIZE = 4;

const galleryComponents = allGalleryComponents.map(({ examples, ...rest }) => ({
  ...rest,
  examples: chunk(examples, COLUMN_SIZE),
}));

const galleryComponentNames = allGalleryComponents.map(({ name }) => name);

export const galleryIcons = Object.keys(icons).map((iconName) => {
  const IconComponent = icons[iconName as keyof typeof icons];

  return {
    name: iconName,
    examples: [
      [
        {
          Container: ({ children }: { children: ReactNode }) => (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              paddingY="medium"
              paddingX="xxlarge"
            >
              <Box flexShrink={0} style={{ height: 60, width: 60 }}>
                {children}
              </Box>
            </Box>
          ),
          Example: () => source(<IconComponent size="fill" />),
          code: `<${iconName} />`,
        },
      ],
    ],
  };
});

type SetName = 'components' | 'icons';
const getRowsFor = memoize((type: SetName) => {
  const items = type === 'components' ? galleryComponents : galleryIcons;

  const ratio = Math.max(
    (window.innerWidth / window.innerHeight) *
      (type === 'components' ? 0.65 : 0.5),
    1,
  );
  const rowLength = Math.floor(Math.sqrt(items.length) * ratio);

  return chunk(items, rowLength);
});

interface RenderExampleProps {
  id: string;
  example: ComponentExample;
}
const RenderExample = ({ id, example }: RenderExampleProps) => {
  const { label, Container = DefaultContainer, background = 'body' } = example;
  const { code, value } = useSourceFromExample(id, example);

  return (
    <BraidProvider styleBody={false} theme={docsTheme}>
      <Stack space="small">
        <Columns space="medium" alignY="center">
          <Column>
            {label ? (
              <Text component="h5" tone="secondary">
                {label}
              </Text>
            ) : null}
          </Column>
          {code ? (
            <Column width="content">
              <CodeButton
                title="Copy code to clipboard"
                onClick={() => copy(formatSnippet(code))}
                successLabel="Copied!"
              >
                <CopyIcon /> Copy code
              </CodeButton>
            </Column>
          ) : null}
        </Columns>
        {value ? (
          <ThemedExample background={background}>
            <Container>
              <Box height="full" width="full" style={{ cursor: 'auto' }}>
                {value}
              </Box>
            </Container>
          </ThemedExample>
        ) : null}
      </Stack>
    </BraidProvider>
  );
};

type JumpTo = (componentName: string) => void;

const GalleryItem = ({
  item,
  jumpTo,
}: {
  item: typeof galleryComponents[number];
  jumpTo: JumpTo;
}) => {
  const componentDocs = getComponentDocs(item.name);
  const relevantNames = componentDocs.subComponents
    ? [item.name, ...componentDocs.subComponents]
    : [item.name];

  const history = getHistory(...relevantNames);
  const markAsNew = isNew(item.name);
  const actualUpdateCount = history.filter(
    (historyItem) => historyItem.isRecent,
  ).length;
  const updateCount = markAsNew ? actualUpdateCount - 1 : actualUpdateCount;

  const isAnIcon = componentDocs.category === 'Icon';

  return (
    <Box
      component="article"
      background="card"
      borderRadius="standard"
      padding={isAnIcon ? 'large' : 'xxlarge'}
      margin={isAnIcon ? 'small' : 'xxlarge'}
      data-braid-component-name={item.name}
      tabIndex={0}
      onDoubleClick={() => jumpTo(item.name)}
    >
      <Stack space={isAnIcon ? 'small' : 'xxlarge'}>
        <Box position="relative">
          <Inline space="small" alignY="center">
            <Heading component="h3" level={isAnIcon ? '3' : '2'}>
              <TextLink
                href={`/components/${item.name}`}
                target="gallery-detail"
              >
                {isAnIcon ? item.name.replace('Icon', '') : item.name}
              </TextLink>
            </Heading>
            {markAsNew ? (
              <Box
                component={Link}
                cursor="pointer"
                href={`/components/${item.name}/releases`}
                target="gallery-detail"
                title="Added in the last two months"
              >
                <Box pointerEvents="none">
                  <Badge tone="positive" weight="strong" bleedY>
                    New
                  </Badge>
                </Box>
              </Box>
            ) : null}
            {updateCount > 0 ? (
              <Box
                component={Link}
                cursor="pointer"
                href={`/components/${item.name}/releases`}
                target="gallery-detail"
                title={`${updateCount} update${
                  updateCount === 1 ? '' : 's'
                } in the last two months`}
              >
                <Box pointerEvents="none">
                  <Badge tone="promote" weight="strong" bleedY>
                    {`${updateCount} update${updateCount === 1 ? '' : 's'}`}
                  </Badge>
                </Box>
              </Box>
            ) : undefined}
          </Inline>
        </Box>

        <Columns space="xlarge">
          {item.examples.map((exampleChunk, idx) => (
            <Column key={`${item.name}_${idx}`}>
              <Stack space="xlarge">
                {exampleChunk.map((example, index) => (
                  <Box
                    component={isAnIcon ? undefined : 'section'}
                    style={{
                      width: isAnIcon ? undefined : '700px',
                    }}
                    key={`${example.label}_${index}`}
                    className={styles.animationsOnlyOnHover}
                  >
                    <PlayroomStateProvider>
                      <RenderExample
                        id={`${item.name.toLowerCase()}_${
                          index + 1 + idx * COLUMN_SIZE
                        }`}
                        example={example}
                      />
                    </PlayroomStateProvider>
                  </Box>
                ))}
              </Stack>
            </Column>
          ))}
        </Columns>

        {componentDocs.alternatives.length > 0 ? (
          <Stack space="large">
            <Divider />
            <Box component="aside">
              <Stack space="large">
                <Text component="h4" size="xsmall" tone="secondary">
                  <span style={{ textTransform: 'uppercase' }}>
                    Alternatives
                  </span>
                </Text>
                <Stack space="medium">
                  {componentDocs.alternatives.map((alt) => (
                    <Text size="xsmall" tone="secondary" key={alt.name}>
                      <Strong>
                        {galleryComponentNames.indexOf(alt.name) > -1 ? (
                          <TextLinkButton
                            weight="weak"
                            hitArea="large"
                            onClick={() => jumpTo(alt.name)}
                          >
                            {alt.name}
                          </TextLinkButton>
                        ) : (
                          <TextLink
                            weight="weak"
                            href={`/components/${alt.name}`}
                            hitArea="large"
                            target="_blank"
                          >
                            {alt.name} <IconNewWindow />
                          </TextLink>
                        )}
                      </Strong>{' '}
                      — {alt.description}
                    </Text>
                  ))}
                </Stack>
              </Stack>
            </Box>
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
};
interface StageProps {
  setName: SetName;
  title: string;
  jumpTo: JumpTo;
}
const Stage = ({ setName, jumpTo, title }: StageProps) => (
  <Box data-braid-component-name={title}>
    <Stack space="xxlarge">
      <Box padding="xxlarge">
        <Heading component="h2" level="1">
          <span style={{ fontSize: '3em' }}>{title}</span>
        </Heading>
      </Box>
      <Box>
        {getRowsFor(setName).map((row, index) => (
          <Columns space="none" key={index}>
            {row.map((item) => (
              <Column key={item.name} width="content">
                <GalleryItem item={item} jumpTo={jumpTo} />
              </Column>
            ))}
          </Columns>
        ))}
      </Box>
    </Stack>
  </Box>
);

const jumpToEdgeThreshold = 80;

const calculateFitToScreenDimensions = (
  contentEl: HTMLDivElement,
): Position => {
  const width = contentEl.scrollWidth;
  const height = contentEl.scrollHeight;
  const xScale =
    (document.documentElement.clientWidth - jumpToEdgeThreshold * 2) / width;
  const yScale =
    (document.documentElement.clientHeight - jumpToEdgeThreshold * 2) / height;
  const scale = Math.min(xScale, yScale);

  return {
    x: (document.documentElement.clientWidth - width * scale) / 2,
    y: (document.documentElement.clientHeight - height * scale) / 2,
    scale,
  };
};

// const zoomStep = 0.4;
const GalleryInternal = () => {
  const { ready } = useThemeSettings();

  const contentWrapperRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const zoomInRef = useRef<HTMLButtonElement | null>(null);
  const zoomOutRef = useRef<HTMLButtonElement | null>(null);

  const [fitToScreenDims, setFitToScreenDimensions] = useRecoilState(
    fitToScreenDimensions,
  );
  const setZoom = useSetRecoilState(zoomState);

  const [{ x: springX, y: springY, scale: springScale }, spring] = useSpring(
    () => ({
      ...fitToScreenDims,
      config: { mass: 1, tension: 350, friction: 40 },
    }),
  );

  const updatePosition = useCallback(
    (newPosition: Partial<Position>) => {
      spring.start(newPosition);

      if (typeof newPosition.scale !== 'undefined') {
        setZoom(newPosition.scale);
      }
    },
    [spring, setZoom],
  );

  useEffect(() => {
    if (contentRef.current) {
      const dimensions = calculateFitToScreenDimensions(contentRef.current);
      setFitToScreenDimensions(dimensions);
      spring.set({ scale: dimensions.scale });
    }
  }, [spring, setFitToScreenDimensions]);

  const zoomIn = useCallback(() => {
    if (springScale.get() < 1) {
      updatePosition({ scale: Math.min(springScale.get() * 1.5, 1) });
    }
  }, [springScale, updatePosition]);

  const zoomOut = useCallback(() => {
    if (springScale.get() > fitToScreenDims.scale) {
      updatePosition({
        scale: Math.max(fitToScreenDims.scale, springScale.get() / 1.5),
      });
    }
  }, [springScale, fitToScreenDims, updatePosition]);

  const fitToScreen = useCallback(() => {
    updatePosition({ x: 0, y: 0, scale: fitToScreenDims.scale });
  }, [updatePosition, fitToScreenDims]);

  const actualSize = useCallback(() => {
    updatePosition({ x: 0, y: 0, scale: 1 });
  }, [updatePosition]);

  useEffect(() => {
    const keyboardZoomHandler = (e: KeyboardEvent) => {
      const cmdOrCtrl = navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey;

      const plus = e.keyCode === 187;
      const minus = e.keyCode === 189;

      if (cmdOrCtrl && (plus || minus)) {
        e.preventDefault();
        e.stopPropagation();

        if (plus && zoomInRef.current) {
          zoomInRef.current.focus();
          zoomIn();
        }

        if (minus && zoomOutRef.current) {
          zoomOutRef.current.focus();
          zoomOut();
        }
      }
    };

    const resizeHandler = () => {
      if (contentRef.current) {
        setFitToScreenDimensions(
          calculateFitToScreenDimensions(contentRef.current),
        );
      }
    };

    window.addEventListener('keydown', keyboardZoomHandler);
    window.addEventListener('resize', resizeHandler);

    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener('gesturestart', preventDefault);
    document.addEventListener('gesturechange', preventDefault);

    return () => {
      window.removeEventListener('keydown', keyboardZoomHandler);
      window.removeEventListener('resize', resizeHandler);
      document.removeEventListener('gesturestart', preventDefault);
      document.removeEventListener('gesturechange', preventDefault);
    };
  }, [setFitToScreenDimensions, zoomIn, zoomOut]);

  const pinchSpeed = 800;
  const wheelSpeed = 600;

  useGesture(
    {
      onDrag: ({ offset, event }) => {
        event.preventDefault();
        updatePosition({ x: offset[0], y: offset[1] });
      },
      onPinch: ({ offset }) => {
        updatePosition({ scale: offset[0] / pinchSpeed });
      },
      onWheel: ({ offset, event }) => {
        event.preventDefault();
        updatePosition({ scale: offset[1] / wheelSpeed });
      },
    },
    {
      target: contentWrapperRef,
      enabled: ready,
      eventOptions: { passive: false },
      wheel: {
        bounds: {
          top: wheelSpeed * fitToScreenDims.scale,
          bottom: wheelSpeed * 2,
        },
      },
      pinch: {
        scaleBounds: {
          min: pinchSpeed * fitToScreenDims.scale,
          max: pinchSpeed * 2,
        },
      },
      drag: {
        pointer: { touch: true },
        from: () => [springX.get(), springY.get()],
      },
    },
  );

  // const jumpTo = useCallback((name: string) => {
  const jumpTo = useCallback(() => {
    //   const component = document.querySelector<HTMLDivElement>(
    //     `[data-braid-component-name=${name}]`,
    //   );
    //   if (controller && component) {
    //     const { scale } = controller.getTransform();
    //     const viewportWidth = document.documentElement.clientWidth;
    //     const viewportHeight = document.documentElement.clientHeight;
    //     const clientRect = component.getBoundingClientRect();
    //     const actualWidth = clientRect.width / scale + jumpToEdgeThreshold * 2;
    //     const actualHeight =
    //       clientRect.height / scale + jumpToEdgeThreshold * 2;
    //     const targetScale = Math.min(
    //       viewportWidth / actualWidth,
    //       viewportHeight / actualHeight,
    //     );
    //     const scaled = (n: number) => n * targetScale;
    //     const targetX =
    //       scaled(-component.offsetLeft + jumpToEdgeThreshold) +
    //       (viewportWidth - scaled(actualWidth)) / 2;
    //     const targetY =
    //       scaled(-component.offsetTop + jumpToEdgeThreshold) +
    //       (viewportHeight - scaled(actualHeight)) / 2;
    //     controller.zoomAbs(targetX, targetY, targetScale);
    //     controller.moveTo(targetX, targetY);
    //   }
  }, []);

  return (
    <>
      <Box
        transition="fast"
        opacity={ready ? undefined : 0}
        className={styles.delayPanels}
      >
        <GalleryPanel top left>
          <Inline space="small" alignY="center">
            <Box
              component={Link}
              display="block"
              paddingX="xxsmall"
              cursor="pointer"
              title="Back to documentation"
              href="/"
            >
              <Logo iconOnly height={28} width={28} />
            </Box>
            <PanelDivider />
            <ThemeToggle size="small" weight="strong" />
          </Inline>
        </GalleryPanel>

        <GalleryPanel bottom right>
          <Inline space="small" alignY="center">
            <Box paddingX="xsmall">
              <JumpToSelector onSelect={jumpTo} />
            </Box>

            <PanelDivider />
            <IconButton
              label="Fit to screen"
              onClick={fitToScreen}
              keyboardAccessible
            >
              {(iconProps) => <IconFitToScreen {...iconProps} />}
            </IconButton>
            <IconButton
              ref={zoomOutRef}
              label="Zoom Out"
              onClick={zoomOut}
              keyboardAccessible
            >
              {(iconProps) => <IconMinus {...iconProps} />}
            </IconButton>
            <Box
              component="button"
              paddingX="xsmall"
              height="full"
              cursor="pointer"
              title="Zoom to actual size"
              onClick={actualSize}
            >
              <CurrentZoom />
            </Box>
            <IconButton
              ref={zoomInRef}
              label="Zoom In"
              onClick={zoomIn}
              keyboardAccessible
            >
              {(iconProps) => <IconAdd {...iconProps} />}
            </IconButton>
          </Inline>
        </GalleryPanel>
      </Box>

      <Box
        outline="none"
        transition="fast"
        opacity={ready ? undefined : 0}
        className={styles.gragCursor}
        ref={contentWrapperRef}
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="fixed"
        userSelect="none"
        top={0}
        left={0}
        right={0}
        bottom={0}
      >
        <a.div
          ref={contentRef}
          style={{
            display: 'flex',
            userSelect: 'none',
            transform: 'perspective(600px)',
            x: springX,
            y: springY,
            scale: to([springScale], (s) => s),
          }}
        >
          <Box component="section">
            <Stage setName="components" title="Components" jumpTo={jumpTo} />
          </Box>
          <Box component="section" style={{ paddingLeft: 800 }}>
            <Stage setName="icons" title="Icons" jumpTo={jumpTo} />
          </Box>
        </a.div>
      </Box>
    </>
  );
};

export const Gallery = () => (
  <RecoilRoot>
    <GalleryInternal />
  </RecoilRoot>
);

const CurrentZoom = () => {
  const currentZoom = useRecoilValue(zoomState);
  return (
    <Text size="small" tone="secondary">
      {Math.round(currentZoom * 100)}%
    </Text>
  );
};

const jumpToPlaceholder = 'Jump to';
const componentList = [jumpToPlaceholder].concat(
  [...galleryComponentNames, 'Icons'].sort(),
);
const JumpToSelector = memo(({ onSelect }: { onSelect: JumpTo }) => {
  const [value, setValue] = useState(jumpToPlaceholder);

  return (
    <Text size="small" tone="secondary">
      <TextDropdown
        id="search"
        label="Jump to component"
        options={componentList}
        value={value}
        onBlur={() => {
          setValue(jumpToPlaceholder);
        }}
        onChange={(name) => {
          setValue(name);

          if (name !== jumpToPlaceholder) {
            onSelect(name);
          }
        }}
      />
    </Text>
  );
});

const PanelDivider = () => <Box aria-hidden className={styles.divider} />;

const IconFitToScreenSvg = ({ title, titleId, ...props }: SVGProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    focusable="false"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M3 5a1 1 0 00-1 1v12a1 1 0 002 0V6a1 1 0 00-1-1zm18 0a1 1 0 00-1 1v12a1 1 0 002 0V6a1 1 0 00-1-1zm-2.077 6.618a.999.999 0 00-.217-.326l-1.999-1.999a1 1 0 00-1.414 1.414l.293.293H8.414l.293-.293a1 1 0 00-1.414-1.414l-2 2a1 1 0 000 1.414l2 2a1 1 0 001.414-1.414L8.414 13h7.172l-.293.293a1 1 0 101.414 1.414l1.999-1.999a1.003 1.003 0 00.217-1.09z" />
  </svg>
);

const IconFitToScreen = (props: UseIconProps) => {
  const iconProps = useIcon(props);

  return <Box component={IconFitToScreenSvg} {...iconProps} />;
};
