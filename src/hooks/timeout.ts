import { useEffect, useRef } from 'react'

const useTimeout = (callback: () => void, delay: number) => {
	const savedCallback = useRef<() => void>()
	useEffect(() => {
		savedCallback.current = callback
	}, [callback])

	useEffect(() => {
		const id = setTimeout(() => {
			savedCallback.current?.()
		}, delay)
		return () => clearTimeout(id)
	}, [delay])
}

export default useTimeout
