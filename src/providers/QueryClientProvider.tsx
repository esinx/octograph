import {
	QueryClient,
	QueryClientProvider as TanstackQueryClientProvider,
} from '@tanstack/react-query'
import { PropsWithChildren } from 'react'

const queryClient = new QueryClient({})

const QueryClientProvider: React.FC<PropsWithChildren> = ({ children }) => {
	return (
		<TanstackQueryClientProvider client={queryClient}>
			{children}
		</TanstackQueryClientProvider>
	)
}

export default QueryClientProvider
