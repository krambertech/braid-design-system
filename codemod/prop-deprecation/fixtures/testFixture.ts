import { atoms } from 'braid-design-system/css';
import { myShadow } from './shadows';

const atomProps = {
  [true ? 'boxShadow' : 'card']: ['borderNeutralLight', 'borderFormAccent'],
};

const className = atoms({
  top: 0,
  boxShadow: 'borderNeutralLight',
  ...atomProps,
});
