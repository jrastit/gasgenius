import { css } from 'lit'

export const cardStyle = css`
  :host {
    position: relative;
    background-color: var(--color-background-bg-primary);
    border-radius: 24px;
    width: fit-content;
    height: fit-content;
    display: grid;
    grid-template-columns: minmax(0, auto) 1fr;
    grid-template-rows: minmax(0, auto) 1fr;
    grid-template-areas:
      'overlay-close header'
      'overlay-close content';
  }

  :host(.shadow) {
    box-shadow:
      0 -3px 4px 0 var(--primary-12),
      0 6px 12px 0 var(--primary-12);
  }

  :host(.overlay) {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    width: 100%;
    height: fit-content;
    box-shadow: none;
  }

  .card-content {
    grid-area: content;
    padding: 8px;
    display: flex;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
  }
`
