import { useState } from 'react'

import RootSuspense from '@/components/RootSuspense'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import MultiProvider from '@/providers/MultiProvider'
import QueryClientProvider from '@/providers/QueryClientProvider'
import { cn } from '@/utils'
import GraphView from '@/views/GraphView'

const Header: React.FC = () => (
	<div
		className={cn([
			'absolute',
			'top-4',
			'left-4',
			'bg-background',
			'p-4',
			'rounded-lg',
			'shadow-2xl',
			'z-30',
		])}
	>
		<div className={cn(['text-2xl', 'font-bold', 'text-center'])}>
			octograph
		</div>
	</div>
)

const UsernameCard: React.FC<{
	value?: string
	onSubmit?: (username: string) => void
}> = ({ value, onSubmit }) => {
	const [username, setUsername] = useState<string>(value ?? '')
	return (
		<div
			className={cn([
				'absolute',
				'bottom-4',
				'left-4',
				'text-bold',
				'text-lg',
				'bg-background',
				'py-4',
				'px-8',
				'rounded-lg',
				'shadow-2xl',
				'w-[400px]',
				'z-30',
			])}
		>
			<div className={cn(['text-md', 'text-bold', 'mb-2'])}>
				GitHub Username
			</div>
			<Input
				id="username"
				value={username}
				onChange={e => setUsername(e.target.value)}
				className={cn(['p-2', 'rounded-lg', 'w-full', 'mb-2'])}
			/>
			<Button
				onClick={() => {
					onSubmit?.(username)
				}}
				className={cn(['p-2', 'rounded-lg', 'w-full'])}
			>
				Create Graph
			</Button>
		</div>
	)
}

const App: React.FC = () => {
	const [username, setUsername] = useState('esinx')
	return (
		<MultiProvider providers={[<QueryClientProvider />, <RootSuspense />]}>
			<div className={cn(['relative', 'w-screen', 'h-screen'])}>
				<Header />
				<UsernameCard value={username} onSubmit={setUsername} />
				<GraphView username={username} />
			</div>
		</MultiProvider>
	)
}

export default App
