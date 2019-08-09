/**
 * create a simple Redux
 */


const createStore = function (reducer, initState) {
    let state = initState
    let listeners = []

    // 订阅
    function subscribe(listener) {
        listeners.push(listener)
    }

    function dispatch(action) {
        state = reducer(state, action)
        // 通知
        listeners.find(listener => listener.key === action.key).fn()
    }

    function getState() {
        return state
    }

    return {
        subscribe,
        dispatch,
        getState
    }
}

let initState = {
    info: {
        name: 'Lilei',
        desc: 'he is a student'
    },
    counter: {
        count: 0
    }
}
// e.g. action: { type: '', other: '' }
/*counterReducer, 一个子reducer*/
/*注意：counterReducer 接收的 state 是 state.counter*/
const counterReducer = function (state, action) {
    switch (action.type) {
        case 'INCREMENT':
            return {
                ...state,
                count: state.count + 1
            };

        case 'DECREMENT':
            return {
                ...state,
                count: state.count - 1
            };

        default:
            return state
    }
}
const infoRecucer = function (state, action) {
    switch (action.type) {
        case 'SET_NAME':
            return {
                ...state,
                name: action.content
            };

        case 'SET_DESC':
            return {
                ...state,
                desc: action.content
            };

        default:
            return state
    }
}
const combineReducers = function (reducers) {
    const reducerKeys = Object.keys(reducers)

    return function (state, action) {
        let newState = {}
        // 遍历执行所有 reducer，返回一个新的 state
        reducerKeys.forEach(key => {
            const reducer = reducers[key]
            const oldStateForKey = state[key] // key 对应的 oldState
            const newStateForKey = reducer(oldStateForKey, action) // key 对应的 newState
            newState[key] = newStateForKey
        })
        return newState
    }
}
const reducer = combineReducers({
    info: infoRecucer,
    counter: counterReducer
})
const store = createStore(reducer, initState)
const next = store.dispatch

const timeMiddleware = (store) => (next) => (action) => {
    console.log('time', new Date().toLocaleDateString())
    next(action)
}
const loggerMiddleware = (store) => (next) => (action) => {
    console.log('this state', store.getState())
    console.log('action', action)
    next(action)
    console.log('next state', store.getState())
}
const exceptionMiddleware = (store) => (next) => (action) => {
    try {
        next(action)
    } catch (error) {
        console.log('错误报告：', error)
    }
}

const time = timeMiddleware(store)
const logger = loggerMiddleware(store)
const exception = exceptionMiddleware(store)

store.dispatch = exception(time(logger(next)))

store.subscribe({
    key: 'counter',
    fn: function () {
        let {
            counter
        } = store.getState()
        console.log(counter.count)
    }
})
store.subscribe({
    key: 'info',
    fn: function () {
        let {
            info
        } = store.getState()
        console.log(info.name, info.desc)
    }
})

store.dispatch({
    key: 'counter',
    type: 'INCREMENT'
})
// store.dispatch({
//     key: 'info',
//     type: 'SET_DESC',
//     content: 'he is a worker'
// })