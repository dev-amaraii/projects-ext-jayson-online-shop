import { createRoot } from 'react-dom/client'
import '../src/styles.css'
import { Home } from '../src/pages/home/ui/home'

const root = document.getElementById('root')
if (!root) throw new Error('Missing Jayson Tech preview root')
createRoot(root).render(<Home />)
