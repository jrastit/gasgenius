import { css } from 'lit'

export const swapOptionItemStyle = css`
  :host {
    width: 100%;
    height: 40px;
    padding: 8px 0;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .title {
    color: var(--color-content-content-secondary);
    font-size: var(--font-size);
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
  }

  .content {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--primary);
    text-align: right;
    font-size: var(--font-size);
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
    transition:
      opacity 0.2s,
      transform 0.2s,
      color 0.2s;
    will-change: opacity;
  }

  .loader {
    background-color: var(--color-background-bg-secondary);
    height: 24px;
    width: 120px;
    border-radius: 8px;
    will-change: filter;
    transition: background-color 0.2s;
    animation: stub-loader-animation 3s ease-in-out infinite;
  }

  @keyframes stub-loader-animation {
    0%,
    100% {
      filter: opacity(1);
    }
    50% {
      filter: opacity(0.5);
    }
  }
`
