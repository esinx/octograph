import { LoaderCircle } from 'lucide-react'
import React, { PropsWithChildren, Suspense, useState } from 'react'

import useTimeout from '@/hooks/timeout'
import { cn } from '@/utils'

const Splash: React.FC = () => {
	return (
		<div
			className={cn([
				'grid',
				'place-items-center',
				'min-h-screen',
				'animate-spin',
			])}
		>
			<LoaderCircle size={64} />
		</div>
	)
}

type RootSuspenseProps = {
	timeout?: number
}

const RootSuspense: React.FC<PropsWithChildren<RootSuspenseProps>> = ({
	timeout = 500,
	children,
}) => {
	const [pastTimeout, setPastTimeout] = useState(false)
	useTimeout(() => {
		setPastTimeout(true)
	}, timeout)
	return (
		<Suspense fallback={pastTimeout ? <Splash /> : null}>{children}</Suspense>
	)
}

export default RootSuspense
