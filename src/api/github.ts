import { Octokit } from 'octokit'

const PAGE_SIZE = 100

const octokit = new Octokit({
	auth: import.meta.env.VITE_DEFAULT_GITHUB_TOKEN,
})

export type Repo = Awaited<
	ReturnType<typeof octokit.rest.repos.listForAuthenticatedUser>
>['data'][number]

export type User = {
	avatar_url: string
	contributions: number
	events_url: string
	followers_url: string
	following_url: string
	gists_url: string
	gravatar_id: string
	html_url: string
	id: number
	login: string
	node_id: string
	organizations_url: string
	received_events_url: string
	repos_url: string
	site_admin: boolean
	starred_url: string
	subscriptions_url: string
	type: string
	url: string
}

const githubAPI = (() => {
	const listAllRepos = async (username: string) => {
		let repos: Repo[] = []
		let page = 1
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const { data } = await octokit.rest.repos.listForUser({
				username,
				per_page: PAGE_SIZE,
				page,
			})
			repos = [...repos, ...(data as unknown as Repo[])]
			if (data.length < PAGE_SIZE) {
				return repos
			}
			page++
		}
	}
	const listAllContributors = async (repoFullName: string): Promise<User[]> => {
		let contributors: Repo[] = []
		let page = 1
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const { data } = await octokit.rest.repos.listContributors({
				owner: repoFullName.split('/')[0],
				repo: repoFullName.split('/')[1],
				per_page: PAGE_SIZE,
				page,
			})
			if (Array.isArray(data)) {
				contributors = [...contributors, ...(data as unknown as Repo[])]
				if (data.length < PAGE_SIZE) {
					return contributors as unknown as User[]
				}
			} else {
				return contributors as unknown as User[]
			}
			page++
		}
	}
	const scanUser = async (args: {
		username: string
		limitRepositories?: number
	}) => {
		const { username, limitRepositories } = args
		let repos = await listAllRepos(username)
		if (limitRepositories) {
			repos = repos.slice(0, limitRepositories)
		}
		const reposWithContributors = await Promise.all(
			repos.map(async repo => ({
				...repo,
				contributors: await listAllContributors(repo.full_name),
			})),
		)
		return reposWithContributors.filter(r =>
			r.contributors.some(c => c.login === username),
		)
	}
	return {
		listAllRepos,
		listAllContributors,
		scanUser,
	}
})()

export default githubAPI
