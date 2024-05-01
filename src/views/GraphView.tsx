import {
	InputLink,
	InputNode,
	LinkProps,
	NetworkDataProps,
	NodeProps,
	ResponsiveNetwork,
} from '@nivo/network'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'

import githubAPI, { Repo, User } from '@/api/github'
import { cn, removeDuplicatesBy } from '@/utils'

interface UserNode extends InputNode {
	type: 'user'
	node_id: string
	user: User
}

interface RepoNode extends InputNode {
	type: 'repo'
	node_id: string
	repo: Repo
}

type Node = UserNode | RepoNode

interface Link extends InputLink {
	node_id: string
	source: string
	target: string
	contributions: number
}

function createGraph(repos: Awaited<ReturnType<typeof githubAPI.scanUser>>) {
	const nodes: Node[] = [
		...(repos.flatMap(r =>
			r.contributors.map(c => ({
				type: 'user',
				id: c.node_id,
				node_id: c.node_id,
				user: c,
			})),
		) as UserNode[]),
		...(repos.map(r => ({
			type: 'repo',
			id: r.node_id,
			node_id: r.node_id,
			repo: r,
		})) as RepoNode[]),
	]
	const links: Link[] = repos.flatMap(({ node_id, contributors }) =>
		contributors.map(c => ({
			node_id,
			source: c.node_id,
			target: node_id,
			contributions: c.contributions,
		})),
	)
	return {
		nodes: removeDuplicatesBy(nodes, n => n.node_id),
		links: removeDuplicatesBy(links, l => l.node_id + l.source + l.target),
	}
}

const NodeComponent: React.FC<NodeProps<Node>> = ({
	node,
	node: { data },
	onClick,
	onMouseEnter,
	onMouseLeave,
	onMouseMove,
}) => {
	const content = (() => {
		if (data.type === 'user') {
			return (
				<image
					transform={`translate(-${node.size / 2},-${node.size / 2})`}
					href={data.user.avatar_url}
					width={node.size}
					height={node.size}
					clipPath={`inset(0% round ${node.size / 2}px)`}
				/>
			)
		} else {
			return <circle r={node.size / 2} fill="#22\22ff" />
		}
	})()
	return (
		<g
			onMouseEnter={e => onMouseEnter?.(node, e)}
			onMouseLeave={e => onMouseLeave?.(node, e)}
			onMouseMove={e => onMouseMove?.(node, e)}
			onClick={e => {
				e.stopPropagation()
				onClick?.(node, e)
			}}
			transform={`translate(${node.x},${node.y})`}
		>
			{content}
		</g>
	)
}

const LinkComponent: React.FC<LinkProps<Node, Link>> = ({
	link,
	link: { data },
}) => {
	return (
		<line
			x1={link.source.x}
			y1={link.source.y}
			x2={link.target.x}
			y2={link.target.y}
			stroke={`rgba(0, 0, 0, ${Math.max(0.1, data.contributions / 50)})`}
			strokeWidth={link.thickness}
			strokeLinecap="round"
		/>
	)
}

const GitHubNetwork: React.FC<NetworkDataProps<Node, Link>> = ({ data }) => {
	const draggingRef = useRef(false)
	const [margin, setMargin] = useState({ top: 0, right: 0, bottom: 0, left: 0 })
	return (
		<div
			className={cn(['w-screen', 'h-screen'])}
			onMouseDown={() => {
				draggingRef.current = true
			}}
			onMouseMove={e => {
				if (!draggingRef.current) return
				setMargin(m => ({
					top: m.top + e.movementY,
					right: m.right - e.movementX,
					bottom: m.bottom - e.movementY,
					left: m.left + e.movementX,
				}))
			}}
			onMouseUp={() => {
				draggingRef.current = false
			}}
		>
			<ResponsiveNetwork<Node, Link>
				data={data}
				theme={{
					background: 'transparent',
				}}
				margin={margin}
				linkDistance={100}
				distanceMin={1}
				centeringStrength={0.3}
				repulsivity={data.nodes.length}
				nodeSize={n => (n.type === 'user' ? 40 : 20)}
				activeNodeSize={n => (n.type === 'user' ? 40 : 20)}
				inactiveNodeSize={n => (n.type === 'user' ? 40 : 20)}
				nodeBorderWidth={1}
				nodeBorderColor={{
					from: 'color',
					modifiers: [['darker', 0.8]],
				}}
				linkThickness={4}
				linkBlendMode="multiply"
				linkColor={() => '#33333333'}
				motionConfig="gentle"
				nodeComponent={NodeComponent}
				linkComponent={LinkComponent}
				nodeTooltip={({ node }) => {
					if (node.data.type === 'user') {
						return (
							<div
								className={cn([
									'flex',
									'flex-col',
									'items-center',
									'bg-background',
									'p-4',
									'w-[200px]',
									'rounded-lg',
									'shadow-lg',
								])}
							>
								<img
									className="w-10 h-10 rounded-full"
									src={node.data.user.avatar_url}
									alt={node.data.user.login}
								/>
								<p>{node.data.user.login}</p>
							</div>
						)
					} else {
						return (
							<div>
								<p>{node.data.repo.name}</p>
								<p>{node.data.repo.description}</p>
							</div>
						)
					}
				}}
				onClick={node => {
					console.log(node)
				}}
			/>
		</div>
	)
}

type GraphViewProps = {
	username: string
}

const GraphView: React.FC<GraphViewProps> = ({ username }) => {
	const { data: repos } = useSuspenseQuery({
		queryKey: ['github', username, 'repos'],
		queryFn: async () =>
			await githubAPI.scanUser({ username, limitRepositories: 50 }),
	})
	const graphData = useMemo(() => {
		if (!repos) return { nodes: [], links: [] }
		return createGraph(repos)
	}, [repos])
	return (
		<div>
			<div className={cn(['w-screen', 'h-screen', 'relative'])}>
				<GitHubNetwork data={graphData} />
				<div
					className={cn([
						'dotted-background',
						'-z-50',
						'absolute',
						'top-0',
						'right-0',
						'bottom-0',
						'left-0',
					])}
				></div>
			</div>
		</div>
	)
}

export default GraphView
