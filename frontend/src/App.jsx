import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar'
import Playground from './pages/playground'
import Plan from './pages/plan'
import Breadcrumbs from './components/Breadcrumbs'
import TimePicker from './components/Pickers/TimePicker'
import DateTimePicker from './components/Pickers/DateTimePicker'
import DateTimeRangePicker from './components/Pickers/DateTimeRangePicker'
import { EntityProvider } from './context/EntityContext'
import CreateActivity from './pages/CreateActivity'
import EditActivity from './pages/EditActivity'
import StructuredPlan from './pages/StructuredPlan'
import EntityDetails from './pages/EntityDetails'
import Ledger from './pages/Ledger'
import BlockVisualization from './pages/BlockVisualization'

export default function App() {
    return <>
        <EntityProvider>
            <BrowserRouter>
                <div className="flex flex-col h-full">
                    <Navbar />
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-7xl mx-auto">
                            <Breadcrumbs />
                        </div>
                        <Routes>
                            <Route path='/login' element={<>bye</>} />
                            <Route path='/signup' element={<>bye</>} />

                            <Route path='/' element={<>home</>} />
                            <Route path='/entities' element={<>entities</>} />
                            <Route path='/entities/:id' element={<EntityDetails />} />
                            <Route path='/activities' element={<>activities</>} />
                            <Route path='/activities/create' element={<CreateActivity />} />
                            <Route path='/activities/:id/edit' element={<EditActivity />} />
                            <Route path='/activities/:id' element={<>activity typeshi</>} />

                            <Route path='/visualize' element={<BlockVisualization />} />
                            <Route path='/plan' element={<Plan />} />
                            <Route path='/plan/structured' element={<StructuredPlan />} />
                            <Route path='/ledgers' element={<Ledger />} />
                            <Route path='/ledgers/:id' element={<>ledger typeshi</>} />

                            <Route path='/playground' element={<Playground />} />

                            {/* Individual Component Routes */}
                            <Route path='/time-picker' element={<div className="p-12 max-w-5xl mx-auto"><TimePicker /></div>} />
                            <Route path='/date-time-picker' element={<div className="p-12 max-w-5xl mx-auto"><DateTimePicker /></div>} />
                            <Route path='/date-time-range-picker' element={<div className="p-12 max-w-5xl mx-auto"><DateTimeRangePicker /></div>} />
                        </Routes>
                    </div>
                </div>
            </BrowserRouter>
        </EntityProvider>
    </>
}