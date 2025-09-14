import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { router } from './router'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotificationProvider } from './contexts/NotificationContext'
import ElementSizeDebugger from './components/Debug/ElementSizeDebugger'
import './styles/globals.css'
import './debug-reset.css'

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
          <ElementSizeDebugger />
        </NotificationProvider>
      </ThemeProvider>
    </Provider>
  )
}

export default App