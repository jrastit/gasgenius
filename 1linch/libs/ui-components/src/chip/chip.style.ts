import { css } from 'lit'

export const chipStyle = css`
  :host {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    background: var(--color-background-bg-secondary);
  }

  .chip-content {
    font-family:
      Roboto Flex,
      sans-serif;
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0;
    vertical-align: middle;
    color: var(--color-content-content-primary);
    gap: 4px;
    border-radius: 8px;
    padding: 2px 8px;
  }
`
