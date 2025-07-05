import { IEnvironment } from '@1inch-community/models'
import { html, render } from 'lit'
import { bootstrapApplicationContext } from './context'
import './global-application-context.element'

export async function bootstrapApplication(
  entryPointFactory: () => Promise<unknown>,
  env: IEnvironment
): Promise<void> {
  await Promise.all([entryPointFactory(), bootstrapApplicationContext(env)])

  const template = html`
    <global-application-context>
      <app-root id="app-root"></app-root>
      <div id="overlay-container"></div>
    </global-application-context>
  `
  render(template, document.body)
}
