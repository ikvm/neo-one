import { Link as LinkBase, styled } from 'reakit';
import { prop, switchProp } from 'styled-tools';

export const Link = styled(LinkBase)<{ readonly linkColor: 'primary' | 'gray' | 'accent' }>`
  color: ${switchProp('linkColor', {
    primary: prop('theme.primary'),
    accent: prop('theme.accent'),
    gray: prop('theme.gray6'),
  })};
  ${prop('theme.fonts.axiformaBold')};
  ${prop('theme.fontStyles.body1')};
  text-decoration: none;

  &:hover {
    color: ${prop('theme.primaryDark')};
    text-decoration: none;
  }

  &:focus {
    color: ${prop('theme.primaryDark')};
    text-decoration: none;
  }

  &:active {
    color: ${prop('theme.primaryDark')};
    text-decoration: none;
  }
`;
