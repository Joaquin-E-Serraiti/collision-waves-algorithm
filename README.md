# Collision Waves Algorithm

![Visualization of the result produced by the algorithm](/images/img%201.png)

This is a pathfinding algorithm. It is guaranteed to find some shortest path from any node to any other, if there is one. This algorithm only stores some of the nodes it explores in memory, not all of them. But it needs to re-explore some of them many times. This way, it trades off space complexity for time complexity.

I made this algorithm because, while working with 2d grids, I noticed how some pathfinding algorithms might need to store a lot of nodes in memory to later reconstruct the shortest path from any node to any other. This algorithm is an alternative that I know works on 2d and 3d grids, and believe could work on other kinds of graphs.

## How it works
