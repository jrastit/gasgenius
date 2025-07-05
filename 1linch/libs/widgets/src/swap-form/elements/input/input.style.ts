import { css } from 'lit'

export const inputStyle = css`
  :host {
    display: grid;
    grid-auto-flow: column;
    height: 128px;
    border-radius: 16px;
    box-sizing: border-box;
    align-items: center;
    background-color: var(--color-background-bg-secondary);
    padding: 16px;
    color: var(--color-content-content-secondary);
    grid-template-areas:
      'title balance'
      'token-icon input'
      'token-name fiat-balance';
    grid-template-columns: min-content auto;
    grid-template-rows: auto auto;
    transition:
      background-color 0.2s,
      border 0.2s,
      box-shadow 0.2s;
  }

  :host(.disabled) {
    background-color: var(--color-background-bg-primary);
    border: 1px solid var(--color-border-border-tertiary);
  }

  :host(.focus) {
    box-shadow: inset 0 0 0 1px var(--primary-12);
  }

  .title {
    grid-area: title;
    width: fit-content;
  }

  .token-icon {
    grid-area: token-icon;
  }

  .token-name {
    grid-area: token-name;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .balance {
    grid-area: balance;
    justify-self: end;
  }

  .input {
    grid-area: input;
    display: flex;
    align-items: center;
    justify-self: end;
    height: 48px;
    font-size: 24px;
    font-weight: 600;
    line-height: 32px;
    letter-spacing: 0;
    text-align: right;
    color: var(--color-content-content-primary);
  }

  .fiat-balance {
    grid-area: fiat-balance;
    justify-self: end;
  }

  .real-input {
    width: 100%;
  }

  @media (hover: hover) {
    :host(:not(.disabled):hover) {
      box-shadow: inset 0 0 0 1px var(--primary-12);
    }
  }
`
