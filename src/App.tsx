import RootSuspense from '@/components/RootSuspense'
import MultiProvider from '@/providers/MultiProvider'
import QueryClientProvider from '@/providers/QueryClientProvider'
import GraphView from '@/views/GraphView'

const App: React.FC = () => {
	return (
		<MultiProvider providers={[<QueryClientProvider />, <RootSuspense />]}>
			<GraphView username="esinx" />
		</MultiProvider>
	)
}

export default App
