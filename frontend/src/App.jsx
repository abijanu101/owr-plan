import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PlanProvider } from './context/PlanContext';
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
import PlanResults from './pages/PlanResults'
import Login from './pages/Login'
import Signup from './pages/Signup'

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
                            <Route path='/login' element={<Login />} />
                            <Route path='/signup' element={<Signup />} />

                            <Route path='/' element={<>hi</>} />
                            <Route path='/entities' element={<>entities</>} />
                            <Route path='/entities/:id' element={<EntityDetails />} />
                            <Route path='/activities' element={<>activities</>} />
                            <Route path='/activities/create' element={<CreateActivity />} />
                            <Route path='/activities/:id/edit' element={<EditActivity />} />
                            <Route path='/activities/:id' element={<>activity typeshi</>} />

                            <Route path='/visualize' element={<>schedule visualization here</>} />

                            <Route element={<PlanProvider />}>
                                <Route path='/plan' element={<Plan />} />
                                <Route path='/plan/constraints' element={<StructuredPlan />} />
                                <Route path='/plan/results' element={<PlanResults />} />
                            </Route>

                            <Route path='/ledgers' element={<>list of expense ledgers page</>} />
                            <Route path='/ledgers/:id' element={<>ledger typeshi</>} />

                            <Route path='/playground' element={<Playground />} />
                        </Routes>
                    </div>
                </div>
            </BrowserRouter>

        </EntityProvider>
    </>
}