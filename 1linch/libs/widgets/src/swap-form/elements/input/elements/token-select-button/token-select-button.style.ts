import { css } from 'lit'

export const tokenSelectButtonStyle = css`
  :host {
    width: fit-content;
    color: var(--color-content-content-primary);
  }

  .select-token-button {
    border: none;
    background-color: transparent;
    display: flex;
    align-items: center;
    cursor: pointer;
    color: var(--color-content-content-primary);
    border-radius: 16px;
    padding: 8px;
    margin-left: -8px;
    transition: background-color 0.2s;
    outline: none;
    user-select: none;
    width: fit-content;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 0;
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    -webkit-tap-highlight-color: transparent;
  }

  .symbol-chain-view {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-left: 8px;
  }

  .symbol {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .chain {
    font-size: 12px;
    font-weight: 400;
    color: var(--color-content-content-secondary);
  }

  .icon {
    transform: rotate(-90deg);
  }

  .select-token-text {
    white-space: nowrap;
  }

  @media (hover: hover) {
    .select-token-button:hover {
      background-color: var(--color-background-bg-positive-hover);
    }
  }
`
