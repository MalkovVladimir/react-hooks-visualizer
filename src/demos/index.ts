import type { HookDemo } from '../types'
import { useStateDemo } from './useState'
import { useReducerDemo } from './useReducer'
import { useContextDemo } from './useContext'
import { useRefDemo } from './useRef'
import { useImperativeHandleDemo } from './useImperativeHandle'
import { useEffectDemo } from './useEffect'
import { useLayoutEffectDemo } from './useLayoutEffect'
import { useInsertionEffectDemo } from './useInsertionEffect'
import { useEffectEventDemo } from './useEffectEvent'
import { useMemoDemo } from './useMemo'
import { useCallbackDemo } from './useCallback'
import { useTransitionDemo } from './useTransition'
import { useDeferredValueDemo } from './useDeferredValue'
import { useDebugValueDemo } from './useDebugValue'
import { useIdDemo } from './useId'
import { useSyncExternalStoreDemo } from './useSyncExternalStore'
import { useActionStateDemo } from './useActionState'
import { useOptimisticDemo } from './useOptimistic'
import { useFormStatusDemo } from './useFormStatus'

export const demos: HookDemo[] = [
  useStateDemo,
  useReducerDemo,
  useContextDemo,
  useRefDemo,
  useImperativeHandleDemo,
  useEffectDemo,
  useLayoutEffectDemo,
  useInsertionEffectDemo,
  useEffectEventDemo,
  useMemoDemo,
  useCallbackDemo,
  useTransitionDemo,
  useDeferredValueDemo,
  useDebugValueDemo,
  useIdDemo,
  useSyncExternalStoreDemo,
  useActionStateDemo,
  useOptimisticDemo,
  useFormStatusDemo,
]
