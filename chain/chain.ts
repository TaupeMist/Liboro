import {
  StateType,
  StoreType,
  StoreConfig,
  CommandType
} from './types'

export const INITIAL_STATE: StateType = {
  contract: {},
  wallet: {}
};

const Store = ({
  initialState = INITIAL_STATE,
  onMutation
}: StoreConfig = {}): StoreType => {
  let state = { ...initialState }
  let dateTime: Date = undefined

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
    stateHistory.pop()
  }

  const getState: StoreType['getState'] = () => ({ ...state })

  const getContract: StoreType['getContract'] = contractId => getState().contract[contractId]

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

  const getDateTime: StoreType['getDateTime'] = () => {
    return dateTime || new Date
  }

  const setDateTime: StoreType['setDateTime'] = (newDateTime: Date) => {
    dateTime = newDateTime
  }

  const incrementDay: StoreType['incrementDay'] = (days = 1) => {
    setDateTime(new Date(getDateTime().getDate() + days))
  }

  return {
    execute,
    undo,
    select,
    getState,
    getContract,
    getStateHistory,
    getCommandHistory,
    getDateTime,
    setDateTime,
    incrementDay,
    debug
  }
}

export default Store
