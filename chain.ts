import {
  StateType,
  StoreType,
  StoreConfig,
  CommandType
} from './chain.types'

export const INITIAL_STATE: StateType = {
  contract: {},
  wallet: {}
};

const Store = ({
  initialState = INITIAL_STATE,
  onMutation 
}: StoreConfig = {}): StoreType => {
  let state = { ...initialState }
  const stateHistory: StateType[] = []
  const commandHistory: CommandType[] = []
  
  const execute: StoreType['execute'] = (command) => {
    commandHistory.push(command)
    const prevState = { ...state }
    state = command.execute({ ...state })
    stateHistory.push(prevState)
    if (onMutation) onMutation({ ...state })
  }
  
  const undo: StoreType['undo'] = () => {
    const command = commandHistory.pop()
    if (!command) return state
    state = command.undo({ ...state })
    stateHistory.pop()
    if (onMutation) onMutation({ ...state })
  }
    
  const getState: StoreType['getState'] = () => ({ ...state })
  
  const getStateHistory: StoreType['getStateHistory'] = () => ([ ...stateHistory ])
  
  const getCommandHistory: StoreType['getCommandHistory'] = () => ([ ...commandHistory ])
    
  const select: StoreType['select'] = func => func(getState())
  
  const debug: StoreType['debug'] = command => {
    return {
      stateHistory: getStateHistory(),
      commandHistory: getCommandHistory(),
      state: getState(),
      stateNext: command ? command.execute({ ...state }) : undefined
    }
  }
  
  return {
    execute,
    undo,
    select,
    getState,
    getStateHistory,
    getCommandHistory,
    debug
  }
}

export default Store
