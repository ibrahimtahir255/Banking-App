/*imports the three routing pieces: BrowserRouter: turns on routing for your whole app,
Routes: a container for your route definitions
Route: maps one URL path to one component */
import { BrowserRouter, Routes, Route } from 'react-router-dom' 
import HomePage from './pages/HomePage' // imports HomePage component
import AccountDetailsPage from './pages/AccountDetailsPage'
import CreateAccountPage from './pages/CreateAccountPage'
import DepositPage from './pages/DepositPage'
import TransactionHistoryPage from './pages/TransactionHistoryPage'
import WithdrawPage from './pages/WithdrawPage'

import './App.css' // imports a CSS file for styling

function App(){
  // wraps everything inside it, enabling routing for your entire app
  return (
    <BrowserRouter>
      {/* a container for your list of <Route> definitions */}
      <Routes>
        {/* the actual mapping: when the URL path is /, render the HomePage component*/}
        <Route path="/" element={<HomePage />}/>
        <Route path="/account" element={<AccountDetailsPage />}/>
        <Route path="/create-account" element={<CreateAccountPage />}/>
        <Route path="/deposit" element={<DepositPage />}/>
        <Route path="/transaction-history" element={<TransactionHistoryPage />}/>
        <Route path="/withdraw" element={<WithdrawPage />}/>
      </Routes>
    </BrowserRouter>
  )
}
export default App
