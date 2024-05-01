/// <reference types="vite/client" />

interface ImportMetaEnv {
	VITE_DEFAULT_GITHUB_TOKEN?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
