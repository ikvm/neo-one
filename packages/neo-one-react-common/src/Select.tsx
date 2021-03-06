// tslint:disable no-any match-default-export-name
import * as React from 'react';
import SelectBase from 'react-select';
import { styled } from 'reakit';
import { prop } from 'styled-tools';

// tslint:disable-next-line:no-any
const StyledSelect: any = styled(SelectBase)`
  border: 1px solid rgba(0, 0, 0, 0.3);
  background-color: ${prop('theme.gray0')};
  outline: none;

  & > .react-select__control {
    background-color: ${prop('theme.gray0')};
    border: 0;
    border-radius: 0;
    box-shadow: none;
    cursor: pointer;

    &:hover {
      border: 0;
      box-shadow: inset 0 0 999em rgba(0, 0, 0, 0.1);
    }

    & > .react-select__indicators {
      & > .react-select__indicator-separator {
        background-color: ${prop('theme.black')};
        opacity: 0.2;
      }

      & > .react-select__indicator {
        color: ${prop('theme.black')};
      }
    }
  }

  & .react-select__menu {
    background-color: ${prop('theme.gray0')};
    width: auto;

    & .react-select__option {
      color: ${prop('theme.black')};
      cursor: pointer;
    }

    & .react-select__option.react-select__option--is-selected {
      background-color: ${prop('theme.accent')};
      opacity: 0.8;
    }

    & .react-select__option.react-select__option--is-focused {
      background-color: ${prop('theme.accent')};
      opacity: 1;
    }
  }
`;

export function Select({ 'data-test': dataTest, ...props }: any) {
  return (
    <div data-test={dataTest}>
      <StyledSelect classNamePrefix="react-select" {...props} />
    </div>
  );
}
