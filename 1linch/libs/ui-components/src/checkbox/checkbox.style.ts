import { css } from 'lit'

export const checkboxStyle = css`
  :host {
    cursor: pointer;

    width: 16px;
    height: 16px;
  }

  .checkbox-body {
    border-radius: 4px;
    border: 1px solid var(--color-content-content-primary);
    width: 100%;
    height: 100%;
    transition: border-color 0.2s;
  }

  @media (hover: hover) {
    .checkbox-body:hover {
      border-color: var(--color-content-content-secondary);
    }
  }
`
