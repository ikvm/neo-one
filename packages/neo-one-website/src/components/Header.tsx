// tslint:disable no-any
import { Link, Logo } from '@neo-one/react-common';
import * as React from 'react';
import { RouteData } from 'react-static';
import { as, Flex, styled, Toolbar } from 'reakit';
import { ifProp, prop, withProp } from 'styled-tools';
import { ComponentProps } from '../types';
import { RouterLink } from './RouterLink';

const Wrapper = styled(Flex)`
  width: 100%;
  justify-content: center;
  background-color: ${prop('theme.primary')};
  z-index: 9999;
  padding: 0 36px;

  @media (max-width: 768px) {
    padding: 0 8px;
  }
`;

const StyledToolbar = styled(Toolbar)`
  && {
    height: 100%;
    grid-gap: 8px;
    padding: 0 16px;
  }

  ${/* sc-sel */ Toolbar.Focusable as any} {
    outline: none;
  }

  @media (max-width: 768px) {
    padding: 0 8px;
  }
`;

const FocusableRouterLink = as(Link as any)(as(RouterLink)(Toolbar.Focusable));

const LogoLink = styled(FocusableRouterLink)`
  display: block;
  margin-right: 36px;
  margin-bottom: 12px;
  margin-top: 12px;
  height: 56px;

  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 8px;
    margin-top: 8px;
  }
`;

const NavigationLink: any = styled(FocusableRouterLink)<{ readonly active: boolean }>`
  display: flex;
  align-items: center;
  ${prop('theme.fontStyles.headline')};
  height: 100%;
  padding-top: 5px;
  ${ifProp('active', withProp('theme.accent', (color) => `color: ${color};`))};
  border-bottom: 5px solid ${ifProp('active', prop('theme.accent'), 'transparent')};
  text-decoration: none;

  &:hover {
    color: ${prop('theme.accent')};
  }

  &:focus {
    color: ${prop('theme.accent')};
  }

  &.active {
    color: ${prop('theme.accent')};
  }
`;

const FocusableLink: any = as(Link as any)(Toolbar.Focusable);

interface Props {
  readonly path: string;
}

const BlogLink = ({ path }: Props) => (
  // @ts-ignore
  <RouteData>
    {({ mostRecentBlogPostSlug }: { readonly mostRecentBlogPostSlug: string }) => (
      <NavigationLink
        linkColor="gray"
        active={path === 'blog'}
        data-test="header-blog"
        to={`/blog/${mostRecentBlogPostSlug}`}
      >
        Blog
      </NavigationLink>
    )}
  </RouteData>
);

export const Header = ({ path, ...props }: Props & ComponentProps<typeof Wrapper>) => (
  <Wrapper {...props}>
    <StyledToolbar>
      <Toolbar.Content>
        <LogoLink data-test="header-logo" to="/">
          <Logo />
        </LogoLink>
        <NavigationLink linkColor="gray" active={path === 'docs'} data-test="header-docs" to="/docs/getting-started">
          Docs
        </NavigationLink>
        <NavigationLink linkColor="gray" active={path === 'tutorial'} data-test="header-tutorial" to="/tutorial">
          Tutorial
        </NavigationLink>
        <NavigationLink linkColor="gray" active={path === 'course'} data-test="header-course" to="/course">
          Course
        </NavigationLink>
        <BlogLink path={path} />
      </Toolbar.Content>
      <Toolbar.Content align="end">
        <FocusableLink
          linkColor="gray"
          data-test="header-github"
          href="https://github.com/neo-one-suite/neo-one"
          target="_blank"
        >
          GitHub
        </FocusableLink>
      </Toolbar.Content>
    </StyledToolbar>
  </Wrapper>
);
