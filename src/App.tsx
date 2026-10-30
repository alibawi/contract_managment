import { Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from './components/Layout'
import AlertsCenter from './pages/contracts/AlertsCenter'
import ContractCard from './pages/contracts/ContractCard'
import ContractTypes from './pages/contracts/ContractTypes'
import ContractWizard from './pages/contracts/ContractWizard'
import ContractsList from './pages/contracts/ContractsList'
import AgreementsList from './pages/agreements/AgreementsList'
import Resolve from './pages/agreements/Resolve'
import Simulator from './pages/agreements/Simulator'
import Health from './pages/Health'
import Delegations from './pages/workflow/Delegations'
import ApprovalStages from './pages/workflow/ApprovalStages'
import Tasks from './pages/workflow/Tasks'
import Home from './pages/Home'

export default function App() {
  // Keying on the path remounts forms when navigating between /x/new and /x/:id
  const { pathname } = useLocation()
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contracts" element={<ContractsList />} />
        <Route path="/contracts/new" element={<ContractWizard key={pathname} />} />
        <Route path="/contracts/:id" element={<ContractCard key={pathname} />} />
        <Route path="/contracts/:id/edit" element={<ContractWizard key={pathname} />} />
        <Route path="/contract-types" element={<ContractTypes />} />
        <Route path="/alerts" element={<AlertsCenter />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/delegations" element={<Delegations />} />
        <Route path="/settings/approval-stages" element={<ApprovalStages />} />
        <Route path="/agreements" element={<AgreementsList />} />
        <Route path="/agreements/simulator" element={<Simulator />} />
        <Route path="/agreements/resolve" element={<Resolve />} />
        <Route path="/health" element={<Health />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </AppLayout>
  )
}
