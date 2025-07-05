import { css } from 'lit'

export const tokenItemCrossChainAccordionChainViewStyle = css`
  :host {
    display: flex;
    height: 60px;
    width: 100%;
    cursor: pointer;
    border-radius: 16px;
    margin-top: 4px;
    padding: 12px 16px;
    box-sizing: border-box;
    color: var(--color-content-content-primary);
    transition: background-color 0.2s;
    align-items: center;
    gap: 8px;
    overflow: hidden;
  }

  :host(.disabled) {
    filter: grayscale(100%);
    opacity: 0.5;
    cursor: not-allowed !important;
  }

  .chain-view-container {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 8px;
  }

  .corner-icon:dir(rtl) {
    transform: scaleX(-1);
  }

  .left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-left: auto;
    gap: 4px;
  }

  .right:dir(rtl) {
    margin-right: auto;
    margin-left: 0;
  }

  .balance {
    color: var(--color-content-content-primary);
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 24px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .fiat-balance {
    color: var(--color-content-content-secondary);
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  @media (hover: hover) {
    :host(:not(.disabled):hover) {
      background-color: var(--color-background-bg-active);
    }
  }
`
