import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function removeDuplicatesBy<T>(arr: T[], fn: (item: T) => unknown) {
	return arr.filter(
		(item, index, self) => self.findIndex(i => fn(i) === fn(item)) === index,
	)
}
