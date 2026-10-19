import { createRootRoute, HeadContent, Scripts, Outlet } from '@tanstack/react-router'
import '../styles.css'
export const Route = createRootRoute({ head: () => ({ meta: [{ title: 'Jayson Tech — Gadget Store Demo' }, { name: 'description', content: 'Jayson Tech online shop concept demo' }] }), component: () => <><HeadContent/><Outlet/><Scripts/></> })
