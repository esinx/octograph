# Octograph

Repo Link: [https://github.com/esinx/octograph](https://github.com/esinx/octograph)

> Social affiliation network from GitHub contributions

**For Live Demo, please visit https://octograph.esinx.net**

**Octograph** uses GitHub API to fetch user contributions and build a social affiliation network based on the repositories they have contributed to. The resulting graph is an undirected bipartite graph of users and repositories, where an edge between a user and a repository indicates that the user has contributed to the repository.

The graph effectively is a social affiliation network that demonstrates Membership closure / Focal closure, depending on how we interpret contributions as a form of membership or focal closure. The graph can be used to analyze the social structure of the GitHub community and identify communities of users who have contributed to similar repositories.

The graph is visualized using [@nivo/network](https://nivo.rocks/network/). Octograph uses [octokit](https://github.com/octokit) from GitHub to fetch user contributions and build the graph. Each fetch request takes a while to load, so the graph is built incrementally as the data is fetched by using an internal cache store (this could be improved using the GraphQL API, but in this project I've used the rest endpoints for simplicity). The octokit library makes HTTP REST requests to the GitHub API under the hood, and each fetch request is the equivalent of performing a 2-layer BFS on the starting node (first layer being the repositories the user has contributed to, and the second layer being the users who have contributed to those repositories). See the [instructions](#instructions) section for more details on how to use the application.

## Topics
- Social Networks
  - **Octograph** is a visualization of a social affiliation network based on GitHub contributions.
- Information Networks
  - **Octograph** uses GitHub API to fetch user contributions (through the HTTP REST API)

## How To Run

This website is deployed on [octograph.esinx.net](https://octograph.esinx.net/). You can also run it locally by following the steps below.

### Running Locally

1. Clone the repository
```bash
git clone htps://github.com/esinx/octograph.git
```

2. Install dependencies
```bash
cd octograph
yarn
```

3. Setup Environment Variables

You will need a GitHub API token to run the application. You can create one by following the instructions [here](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token).

Create a `.env` file in the root directory of the project and add the following line:
```
VITE_DEFAULT_GITHUB_TOKEN=(YOUR_GITHUB_TOKEN)
```

4. Run the application
```bash
yarn dev
```

## Instructions

1. Enter a GitHub username in the text input in the bottom left corner of the screen and click the "Create Graph" button. This will fetch the user's contributions and build the graph.
2. Hover on nodes to see the user or repository name.
3. Click on a node to perform a 2-layer BFS on the node and fetch the contributions of the users or repositories in the second layer. (This will take a while to load)
4. Pan through the graph view and explore the GitHub contribution graph! You can also use the sliders on the top right corner to adjust the graph layout. You can configure the node distances and the centering strength(the higher it is, the more the nodes will be centered around a node with high centrality) of the graph.

## Screenshots

![octograph1](./screenshots/1.png?raw=true)
![octograph2](./screenshots/2.png?raw=true)
![octograph3](./screenshots/3.png?raw=true)
![octograph4](./screenshots/4.png?raw=true)