import {
	InputLink,
	InputNode,
	LinkProps,
	NetworkDataProps,
	NodeProps,
	ResponsiveNetwork,
} from '@nivo/network'
import { useQuery } from '@tanstack/react-query'
import { LoaderCircle } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import githubAPI, { Repo, User } from '@/api/github'
import { Slider } from '@/components/ui/slider'
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

function mergeGraphs(graphs: ReturnType<typeof createGraph>[]) {
	const nodes = removeDuplicatesBy(
		graphs.flatMap(g => g.nodes),
		n => n.node_id,
	)
	const links = removeDuplicatesBy(
		graphs.flatMap(g => g.links),
		l => l.node_id + l.source + l.target,
	)
	return { nodes, links }
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
					style={{ cursor: 'pointer' }}
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

const GitHubNetwork: React.FC<
	NetworkDataProps<Node, Link> & {
		onNodeClick?: (node: Node) => void
	}
> = ({ data, onNodeClick }) => {
	const draggingRef = useRef(false)
	const [zoom, setZoom] = useState(10)
	const [centeringStrength, setCenteringStrength] = useState(0.15)
	const [margin, setMargin] = useState({ top: 0, right: 0, bottom: 0, left: 0 })
	return (
		<div
			className={cn(['w-screen', 'h-screen', 'relative'])}
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
			<div
				className={cn([
					'absolute',
					'top-4',
					'right-4',
					'p-4',
					'z-10',
					'bg-background',
					'shadow-2xl',
					'rounded-lg',
				])}
			>
				<div className={cn(['flex', 'flex-col', 'space-y-4'])}>
					<div className={cn(['text-md', 'font-bold'])}>Node Distances</div>
					<Slider
						className={cn(['w-[200px]'])}
						min={1}
						max={10}
						value={[zoom]}
						step={0.01}
						onValueChange={([value]) => {
							setZoom(value)
						}}
					/>
					<div className={cn(['text-md', 'font-bold'])}>Centering Strength</div>
					<Slider
						className={cn(['w-[200px]'])}
						min={0}
						max={1}
						step={0.01}
						value={[centeringStrength]}
						onValueChange={([value]) => {
							setCenteringStrength(value)
						}}
					/>
				</div>
			</div>

			<div
				className={cn([
					'absolute',
					'bottom-4',
					'right-4',
					'p-4',
					'z-10',
					'w-[200px]',
					'bg-background',
					'shadow-2xl',
					'rounded-lg',
				])}
			>
				<div className={cn(['flex', 'flex-col', 'space-y-4', 'items-center'])}>
					<div className={cn(['text-md', 'text-gray-500'])}>
						# Nodes: {data.nodes.length}
					</div>
					<div className={cn(['text-md', 'text-gray-500'])}>
						# Edges: {data.links.length}
					</div>
				</div>
			</div>

			<ResponsiveNetwork<Node, Link>
				data={data}
				theme={{
					background: 'transparent',
				}}
				margin={margin}
				linkDistance={200}
				distanceMin={1}
				centeringStrength={centeringStrength}
				repulsivity={
					(Math.log2(data.nodes.length) * Math.log(zoom)) / Math.log(50)
				}
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
									'mw-[200px]',
									'rounded-lg',
									'shadow-2xl',
								])}
							>
								<img
									className="w-10 h-10 rounded-full"
									src={node.data.user.avatar_url}
									alt={node.data.user.login}
								/>
								<div
									className={cn([
										'text-xl',
										'font-bold',
										'mt-2',
										'text-center',
									])}
								>
									@{node.data.user.login}
								</div>
								<div>
									<a
										href={node.data.user.html_url}
										className={cn(['text-blue-500', 'underline'])}
									>
										{node.data.user.html_url}
									</a>
								</div>
							</div>
						)
					} else {
						return (
							<div
								className={cn([
									'bg-background',
									'p-4',
									'mw-[200px]',
									'rounded-lg',
									'shadow-2xl',
								])}
							>
								<div className={cn(['text-xl', 'font-bold'])}>
									{node.data.repo.name}
								</div>
								<div>
									<a
										href={node.data.repo.html_url}
										className={cn(['text-blue-500', 'underline'])}
									>
										{node.data.repo.html_url}
									</a>
								</div>
								<div>{node.data.repo.description}</div>
							</div>
						)
					}
				}}
				onClick={node => {
					onNodeClick?.(node.data)
				}}
			/>
		</div>
	)
}

type GraphViewProps = {
	username: string
}

const GraphView: React.FC<GraphViewProps> = ({ username }) => {
	const [expandedUsers, setExpandedUsers] = useState<string[]>([])
	const {
		data: reposList,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['github', username, 'repos', ...expandedUsers],
		queryFn: async ({ queryKey: [, username, , ...expandedUsers] }) => {
			const allUsers = [username, ...expandedUsers]
			const reposList = await Promise.all(
				allUsers.map(user =>
					githubAPI.scanUser({ username: user, limitRepositories: 50 }),
				),
			)
			return reposList
		},
	})
	const graphData = useMemo(() => {
		if (!reposList) return { nodes: [], links: [] }
		return mergeGraphs(reposList.map(r => createGraph(r)))
	}, [reposList])
	return (
		<div>
			<div className={cn(['w-screen', 'h-screen', 'relative'])}>
				{error && (
					<div
						className={cn([
							'grid',
							'place-items-center',
							'w-screen',
							'h-screen',
							'bg-red-500',
							'bg-opacity-50',
							'z-50',
						])}
					>
						<div
							className={cn([
								'text-bold',
								'text-lg',
								'flex',
								'flex-col',
								'items-center',
								'bg-background',
								'p-4',
								'rounded-lg',
								'shadow-2xl',
								'w-[400px]',
							])}
						>
							<div className={cn(['text-red-500', 'mb-2'])}>Error</div>
							<div>{error.message}</div>
						</div>
					</div>
				)}
				{isLoading && (
					<div
						className={cn([
							'grid',
							'place-items-center',
							'w-screen',
							'h-screen',
							'bg-black',
							'bg-opacity-50',
							'z-50',
							'pointer-events-none',
						])}
					>
						<div
							className={cn([
								'text-bold',
								'text-lg',
								'flex',
								'flex-col',
								'items-center',
								'bg-background',
								'p-4',
								'rounded-lg',
								'shadow-2xl',
								'w-[400px]',
								'animate-pulse',
							])}
						>
							Reloading Data
							<div className={cn(['mt-4', 'animate-spin'])}>
								<LoaderCircle size={64} />
							</div>
						</div>
					</div>
				)}
				<GitHubNetwork
					data={graphData}
					onNodeClick={node => {
						if (node.type === 'user') {
							setExpandedUsers([...expandedUsers, node.user.login])
						}
					}}
				/>
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
