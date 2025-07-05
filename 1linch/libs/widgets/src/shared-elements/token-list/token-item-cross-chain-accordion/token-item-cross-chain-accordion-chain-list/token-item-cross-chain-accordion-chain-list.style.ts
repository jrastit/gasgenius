import { css } from 'lit'

export const tokenItemCrossChainAccordionChainListStyle = css`
  :host {
    height: var(--additional-height);
    overflow: hidden;
    transition: height 0.2s;
  }

  .show-more-button-icon-container {
    position: relative;
    width: 24px;
    height: 24px;
  }

  .show-more-button-icon {
    position: absolute;
  }

  .more-icon {
    transition:
      opacity 0.2s,
      transform 0.2s;
  }

  :host(.more) .more-icon {
    opacity: 0;
    transform: rotate(90deg);
  }
`
