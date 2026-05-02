import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PlanProvider } from './context/PlanContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/navbar'
import Playground from './pages/playground'
import Plan from './pages/plan'
import Breadcrumbs from './components/Breadcrumbs'
import { EntityProvider } from './context/EntityContext'
import CreateActivity from './pages/CreateActivity'
import EditActivity from './pages/EditActivity'
import StructuredPlan from './pages/StructuredPlan'
import EntityDetails from './pages/EntityDetails'
import Ledger from './pages/Ledger'
import BlockVisualization from './pages/BlockVisualization'
import PlanResults from './pages/PlanResults'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ActivitiesPage from './pages/ActivitiesPage';
import EntitiesPage from './pages/EntitiesPage';


export default function App() {
    return <>
        <AuthProvider>
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
                            <Route path="/entities" element={<EntitiesPage />} />
                            <Route path='/entities/:id' element={<EntityDetails />} />
                            <Route path="/activities" element={<ActivitiesPage />} />
                            <Route path='/activities/create' element={<CreateActivity />} />
                            <Route path='/activities/:id/edit' element={<EditActivity />} />
                            <Route path='/activities/:id' element={<>activity typeshi</>} />

                            <Route path='/visualize' element={<BlockVisualization />} />

                            <Route element={<PlanProvider />}>
                                <Route path='/plan' element={<Plan />} />
                                <Route path='/plan/constraints' element={<StructuredPlan />} />
                                <Route path='/plan/results' element={<PlanResults />} />
                            </Route>

                            <Route path='/ledgers' element={<Ledger />} />
                            <Route path='/ledgers/:id' element={<>ledgers id something</>} />

                            <Route path='/playground' element={<Playground />} />
                        </Routes>
                    </div>
                </div>
            </BrowserRouter>

        </EntityProvider>
        </AuthProvider>
    </>
}

