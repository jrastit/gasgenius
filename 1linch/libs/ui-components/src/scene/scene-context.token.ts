import { createContext } from '@lit/context'
import { ISceneContext } from './scene-context'

export const sceneContext = createContext<ISceneContext>(Symbol('scene context'))
