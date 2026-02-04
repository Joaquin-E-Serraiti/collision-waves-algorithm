# Collision Waves Algorithm

![Visualization of the result produced by the algorithm](/images/collision-waves-result.png)

This is a pathfinding algorithm. In graphs with uniform edge costs, it is guaranteed to find some shortest path from any node to any other, if there is one. This algorithm only stores some of the nodes it explores in memory, not all of them. But it needs to re-explore some of them many times. This way, it trades off space complexity for time complexity.

I made this algorithm because, while working with 2d grids, I noticed how some pathfinding algorithms might need to store a lot of nodes in memory to later reconstruct the shortest path from any node to any other. This algorithm is an alternative that I know works on 2d and 3d grids, and believe could work on other kinds of graphs.

- Here is the [implementation code](/collision-waves.js) of the algorithm.
- You can visualize the algorithm using [this tool](https://joaquin-e-serraiti.github.io/JES-Interactive-Grid/). Just select "Collision Waves" as the pathfinding algorithm in the left-side menu.

## How it works

![Visualization of the process](/images/collision_waves_algorithm-visualization-gif.gif)

The algorithm generates “waves” that expand and collide with each other. Each wave explores all the nodes it covers, but only keeps in memory the nodes at the frontier. The rest of the nodes are forgotten. 

At the point of collision between 2 waves, an “origin point” is generated. This origin point is guaranteed to be part of some shortest path. From each origin point, new waves are expanded to later collide and repeat the cycle. Each cycle, the new origin points are generated closer to the previous origin points. 

After enough expansions and collisions, the new origin points are generated adjacent to the previous origin points, and at that moment all the origin points form a shortest path from the start to the end / goal node.

### The first collision cycle

![Image of first collision cycle](/images/first-collision-cycle.png)

The algorithm starts with 2 origin points: 1 at the “start” node and 1 at the “end” node. It can also start with just 1 origin point at the start node, if the goal is unknown.

From each one of the 2 starting origin points, a wave is expanded. Both waves grow at the same pace, meaning that the “radii” of the waves are always the same. The waves collide when the frontier of one wave makes contact with the frontier of the other wave. Wherever those waves collide, a new origin point is generated.

If both waves collide at the edge of 2 nodes instead of colliding at an exact node, then those 2 nodes form a new single origin point.

If the frontiers make contact in multiple nodes / edges, it means that there are multiple shortest paths. In those cases only the first node/edge where the collison occured is considered to become an origin point.

Because the 2 waves expand at the same pace, the new origin point is guaranteed to be at the middle of the 2 starting origin points. 

This is the first “collision cycle”. After the new origin point is generated, the waves reset and start to expand again in the next collision cycle.

### The second collision cycle

![Image of second collision cycle](/images/second-collision-cycle.png)

Now, with the new origin point, 3 waves are expanded. However, because there is a new origin point, the waves now need to expand less to collide with each other. In fact, because the new origin point is in the middle, each wave only needs to expand half as much as the waves of the previous collision cycle (meaning that they would have half as many layers, or half the radius). In this collision cycle, 2 new origin points would be generated: one between wave 1 and wave 2, and one between wave 2 and wave 3.

### The following collision cycles

In the next collision cycle, 5 waves would be expanded and 4 new origin points would be generated. Next would be 9 waves and 8 new origin points. Then it would be 17 waves and 16 new origin points. And so on.

In each collision cycle, the radius each wave has to reach to collide gets halved and the number of origin points roughly doubles. The distance between the newly generated origin points and the origin points of the waves that collided also gets halved.

This occurs until the waves collide when they have only one layer, which means that the new origin points are adjacent to the previous origin points. At that moment, a shortest path has been found.

In general, the closer a node is to a shortest path, the more times it will get re-explored.

## Performance calculations

Let’s assume we know that the shortest path from a node A to a node B has a length of $D$ nodes.

### Radius of each wave

Each of the first 2 waves would reach a radius equal to $\frac{D}{2}$ before collision. The waves of the next collision cycle would reach a radius of $\frac{D}{4}$. The next $\frac{D}{8}$, and so on...

The radius before collision of each wave would be of $\frac{D}{2^x}$ nodes, where $x$ is the number of the collision cycle (the number of the first collision cycle would be 1).

### Number of origin points per collision cycle

There is 1 new origin point in the first collision cycle, there are 2 in the second collision cycle, 4 on the third and 8 on the fourth.

The number of newly generated origin points in each cycle would be $2^{x-1}$.

The number of origin points already present in each cycle would be $2^{x-1}+1$.

### Number of collision cycles until the shortest path is generated

Now, if the max radius of each wave before collision starts at $\frac{D}{2}$, and in each collision cycle it gets halved, the max radius of the waves before collision would reach 1 node in approximately $\log_{2}{(D)}$ collision cycles.

When the max radius reaches 1 node, it means that all origin points form a “chain” of orthogonally adjacent nodes from the “start” node to the “end” node. Because all origin points form part of some shortest path, this “chain” is a shortest path from the start node to the end node.

### Area of a wave in a 2d square grid

The area of a wave would be all the nodes it has covered / explored.

The waves expand layer by layer, incrementing the radius by 1 node / square.

![Wave layers](/images/wave-layers.jpg)

Let’s assume the grid is empty. In the first layer, there are 4 squares: the squares orthogonally adjacent to the origin point (there can be 6 squares if the origin point is on an edge, meaning that it is formed by 2 squares instead of 1, but I will omit this case for simplicity). The second layer has 8 squares, the third has 12 squares, and the fourth has 16. 

The number of squares per layer grows linearly: each layer has 4 more squares than the previous one.

In an empty grid, the number of squares a layer has is $L \times 4$, with $L$ being the number of the layer.

A wave of radius $R$ would have $R$ layers. The last layer would have $R \times 4$ squares. The previous one would have $(R-1) \times 4$.

The sum of the squares in all the layers of a wave (which is the number of all the squares it has explored), is equal to $(1 \times 4)+(2 \times 4)+(3 \times 4)$… Until reaching $(R \times 4)$. That is equal to $(1 + 2 + 3 + \dots + R) \times 4$, or $\frac{R(R+1)}{2} \times 4$, or $2R(R+1)$.

So, in an empty grid, the number of nodes covered / explored by a wave is equal to $2R(R+1)$, where $R$ is the radius of the wave and how many layers it has. This is the worst-case scenario; if the grid wasn't empty and had obstacles or dead-ends, the number of nodes explored would be less, not more.

### Difference in area

If you have 1 wave of radius $R$ and another wave of radius $2R$, the bigger wave would have explored $4R(2R+1)$ nodes, which is the same as $8(R^2)+4R$, and the smaller wave would have explored $2R(R+1)$ nodes, which is the same as $2(R^2)+2R$.

2 waves of radius $R$ would have explored $4(R^2)+4R$ nodes, which is roughly half of what 1 wave of radius $2R$ would have explored.

### How many nodes are explored to find a shortest path

The maximum radius each wave would reach before collision is equal to $\frac {D}{2^x}$, $x$ being the number of the collision cycle, starting from 1. $x$ can only be equal or lower than $\log_{2}{(D)}$ (approximately).

Assuming an empty grid, the number of nodes each wave would have explored before collision is equal to $2 \frac{D}{2^x}(\frac{D}{2^x}+1)$.

There are 2 waves in the first collision cycle, so the total number of nodes explored in that cycle would be $4 \frac{D}{2}(\frac{D}{2}+1)$, which can be simplified to $D^2+2D$.

In each collision cycle the number of waves roughly doubles and the radius each wave reaches gets halved. Because 2 waves with radius $R$ explore roughly half as much as 1 wave with radius $2R$, the total number of nodes explored in each collision cycle also gets halved.

So, if the number of nodes explored in the first collision cycle was $N$, the number of nodes explored in the next cycle would be $\frac{N}{2}$, and in the next would be  $\frac{N}{4}$, and so on. This would be the same as adding $N+\frac{N}{2}+\frac{N}{4}+\frac{N}{8}+ \dots $, $\log_{2}{(D)}$ times. That sum converges to $2N$.

If $N$ equals $D^2+2D$, $2N$ would be equal to $2(D^2)+4D$. So, the total number of node explorations (including re-explorations) that the algorithm does in an empty grid is roughly $2(D^2)+4D$ (an empty grid is the worst-case scenario), where $D$ is the length of the shortest path from start node to the end node.

### How many nodes are kept in memory

The algorithm only remembers the nodes at the frontier of each wave. To be precise, it remembers the nodes of the last 2 layers of each wave.

A wave collides when reaching a radius of $\frac {D}{2^x}$. The maximum number of nodes explored by that wave that are in memory is $4(\frac {D}{2^x})+4(\frac {D}{2^x}-1)$, or $4(\frac {2D}{2^x}-1)$, or $8(\frac {D}{2^x})-4$. The max number of nodes in memory per wave depends on the radius of the wave.

A wave of radius $R$ has $8R-4$ nodes in memory. A wave of radius $2R$ has $16R-4$ nodes in memory. 2 waves of radius $R$ have, in total, $16R-8$ nodes in memory. So, 2 waves of radius $R$ have 4 less nodes in memory than 1 wave of radius $2R$.

Because the number of waves roughly doubles per collision cycle, and the radius of each wave gets halved, the sum of the maximum number of nodes per wave stored in memory should slightly decrease with each collision cycle. So, the total number of wave-frontier nodes in memory at any moment shouldn’t surpass $8D-4$ (approximately).

To that we have to add the number of nodes from the origin points, which can’t surpass $D$ because when the number of nodes from the origin points reaches $D$, it means that a shortest path has been found.

Then, the total number of nodes in memory shouldn’t surpass $9D-4$ (approximately).

## What to expect of this algorithm

$D$ = length of the shortest path

In a 2d square grid:

- Maximum number of node explorations, including re-explorations = $2(D^2)+4D$ (approximately)

- Maximum number of nodes in memory = $9D-4$ (approximately)

The advantage of this algorithm is that it only needs to store in memory the nodes at the frontier of each wave, which, in a 2d square grid, is a lot less than all the nodes covered by each wave. In fact, the bigger the wave, the bigger the memory save. 

So, the advantage comes from the fact that the size of the frontier of a wave grows slower than its area. However, if I'm not mistaken, this wouldn't work the same way on some other types of graphs.

If the number of nodes in the frontiers of the waves doesn't increase slower than the number of nodes in the area of the waves, then this algorithm wouldn't be very convenient.

## Considerations

- I might have done mistakes while analizing the algorithm's performance or writing this document. Please let me know if you notice something and I will try to fix it or improve it.

- The code for the implementation of this algorithm might be messy and not very readable. It might also have some bugs or inefficiencies. If you see a bug or something that could be improved, feel free to let me know.
