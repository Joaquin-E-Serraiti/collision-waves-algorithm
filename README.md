# Collision Waves Algorithm

![Visualization of the result produced by the algorithm](/images/collision-waves-result.png)

This is a pathfinding algorithm. It is guaranteed to find some shortest path from any node to any other, if there is one. This algorithm only stores some of the nodes it explores in memory, not all of them. But it needs to re-explore some of them many times. This way, it trades off space complexity for time complexity.

I made this algorithm because, while working with 2d grids, I noticed how some pathfinding algorithms might need to store a lot of nodes in memory to later reconstruct the shortest path from any node to any other. This algorithm is an alternative that I know works on 2d and 3d grids, and believe could work on other kinds of graphs.

## How it works

![Visualization of the process](/images/collision_waves_algorithm-visualization-gif.gif)

The algorithm generates “waves” that expand and collide with each other. Each wave explores all the nodes it covers, but only keeps in memory the nodes at the frontier. The rest of the nodes are forgotten. 

At the point of collision between 2 waves, an “origin point” is generated. This origin point is guaranteed to be part of some shortest path. From each origin point, new waves are expanded to later collide and repeat the cycle. Each cycle, the new origin points are generated closer to the previous origin points. 

After enough expansions and collisions, the new origin points are generated adjacent to the previous origin points, and at that moment all the origin points form a shortest path from the start to the end / goal node.

### The first collision cycle

The algorithm starts with 2 origin points: 1 at the “start” node and 1 at the “end” node. It can also start with just 1 origin point at the start node, if the goal is unknown.

From each one of the 2 starting origin points, a wave is expanded. Both waves grow at the same pace, meaning that the “radii” of the waves are always the same. The waves collide when the frontier of one wave makes contact with the frontier of the other wave. Wherever those waves collide, a new origin point is generated.

If both waves collide at the edge of 2 nodes instead of colliding at an exact node, then those 2 nodes form a new single origin point. 

Because the 2 waves expand at the same pace, the new origin point is guaranteed to be at the middle of the 2 starting origin points. 

This is the first “collision cycle”. After the new origin point is generated, the waves reset and start to expand again in the next collision cycle.

### The second collision cycle

Now, with the new origin point, 3 waves are expanded. However, because there is a new origin point, the waves now need to expand less to collide with each other. In fact, because the new origin point is in the middle, each wave only needs to expand half as much as the waves of the previous collision cycle (meaning that they would have half as many layers, or half the radius). In this collision cycle, 2 new origin points would be generated: one between wave 1 and wave 2, and one between wave 2 and wave 3.

### The following collision cycles

In the next collision cycle, 5 waves would be expanded and 4 new origin points would be generated. Next would be 9 waves and 8 new origin points. Then it would be 17 waves and 16 new origin points. And so on.

In each collision cycle, the radius each wave has to reach to collide gets halved and the number of origin points roughly doubles. The distance between the newly generated origin points and the origin points of the waves that collided also gets halved.

This occurs until the waves collide when they have only one layer, which means that the new origin points are adjacent to the previous origin points. At that moment, a shortest path has been found.

In general, the closer a node is to a shortest path, the more times it will get re-explored.

## Performance calculations

Let’s assume we know that the shortest path from a node A and a node B has a distance of $D$ nodes.

