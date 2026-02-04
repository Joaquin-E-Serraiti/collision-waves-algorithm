function isNeighbourValid(nodeIndex,neighbourIndex,columns,rows) {
    if (neighbourIndex < 0 || neighbourIndex > ((columns*rows)-1)) {
        return false
    }

    const neighbourCol = neighbourIndex%columns;
    const neighbourRow = Math.floor(neighbourIndex/columns);
    const nodeCol = nodeIndex%columns;
    const nodeRow = Math.floor(nodeIndex/columns);

    const colDiff = nodeCol - neighbourCol;
    const rowDiff = nodeRow - neighbourRow;

    if (colDiff > 1 || colDiff < -1 || rowDiff > 1|| rowDiff < -1) {
        return false
    }
    
    return true
}

function expandWave(originPointId, neighbouringOriginPointsId, originPointsMap, maxId, newOriginPoints,grid,collisionDirection) {

    if (!grid.algorithmCanRun) {return}
    let collisionFound = false;

    const newLayer = new Set()
    const originPointLayer1 = originPointsMap.get(originPointId).layer1;
    const originPointLayer2 = originPointsMap.get(originPointId).layer2;

    const prevOriginPointId = neighbouringOriginPointsId[0];
    const nextOriginPointId = neighbouringOriginPointsId[1];
    let prevOriginPointLayer2 = null; 
    let nextOriginPointLayer2 = null;
    if (prevOriginPointId !== null) {
        prevOriginPointLayer2 = originPointsMap.get(prevOriginPointId).layer2;
    }
    if (nextOriginPointId !== null) {
        nextOriginPointLayer2 =  originPointsMap.get(nextOriginPointId).layer2;
    }

    for (const nodeIndex of originPointLayer2) {
        if (!grid.algorithmCanRun) {return}

        const candidates = [nodeIndex+1,nodeIndex-1,nodeIndex+grid.COLUMNS,nodeIndex-grid.COLUMNS]

        for (const neighbourIndex of candidates) {
            if (!grid.algorithmCanRun) {return}

            if (grid.squares_states[neighbourIndex] === grid.STATES.WALL) {continue}
            if (!isNeighbourValid(nodeIndex,neighbourIndex,grid.COLUMNS,grid.ROWS)) {
                continue
            }
            if (originPointLayer1.has(neighbourIndex) || originPointLayer2.has(neighbourIndex)) {continue}


            if (prevOriginPointLayer2 !== null && prevOriginPointLayer2.has(neighbourIndex)) {
                if (collisionFound || collisionDirection === "next") {continue}
                newOriginPoints.push({
                    indices:[neighbourIndex], 
                    id:maxId[0],
                    prevOriginPointId:prevOriginPointId,nextOriginPointId:originPointId})
                maxId[0] += 1;
                collisionFound = true;
                collisionDirection = "prev";
                continue
            }
            if (nextOriginPointLayer2 !== null && nextOriginPointLayer2.has(neighbourIndex)) {
                if (collisionFound || collisionDirection === "prev") {continue}
                newOriginPoints.push({
                    indices:[neighbourIndex,nodeIndex], 
                    id:maxId[0],
                    prevOriginPointId:originPointId,nextOriginPointId:nextOriginPointId})
                maxId[0] += 1;
                collisionFound = true;
                collisionDirection = "next";
                continue
            }

            newLayer.add(neighbourIndex)
            if (!grid.algorithmCanRun) {return}
        }
    }

    return [newLayer,collisionDirection];
}

async function expansionCycle(originPointsMap,maxId,newOriginPoints,grid) {
    let currentPointId = "start";
    let collisionDirection = null; // null: direction not yet identified; "next": direction = next origin point wave; "prev": direction = previous origin point wave
  
    while (currentPointId !== null) {
        if (!grid.algorithmCanRun) {return}
        const originPointData = originPointsMap.get(currentPointId);

        const result = await expandWave(currentPointId,originPointData.
            neighbouringOriginPointsId,originPointsMap,maxId,newOriginPoints,grid,collisionDirection);
        if (!grid.algorithmCanRun) {return}
        const newLayer = result[0]
        collisionDirection = result[1]

        if (newLayer !== null) {

            originPointData.layer1 = originPointData.layer2;
            originPointData.layer2 = newLayer;
        }

        currentPointId = originPointData.neighbouringOriginPointsId[1];
    }
}

async function collisionCycle(originPointsMap,maxId,grid) {
    const newOriginPoints = [];
    let expansionsCounter = 0;
    
    colorOriginPoints(originPointsMap,grid);
    while (newOriginPoints.length === 0) {
        if (!grid.algorithmCanRun) {return}
        await expansionCycle(originPointsMap,maxId,newOriginPoints,grid);
        if (!grid.algorithmCanRun) {return}
        expansionsCounter++;
    }
    for (const originPointData of originPointsMap) {
        if (!grid.algorithmCanRun) {return}
        originPointData[1].layer1 = new Set(originPointData[1].originPointIndices);
        originPointData[1].layer2 = new Set(originPointData[1].originPointIndices);
    }
    for (const newOriginPoint of newOriginPoints) {
        if (!grid.algorithmCanRun) {return}
        const prevOriginPointId = newOriginPoint.prevOriginPointId;
        const nextOriginPointId = newOriginPoint.nextOriginPointId;
        const indices = newOriginPoint.indices;
        originPointsMap.get(prevOriginPointId).neighbouringOriginPointsId[1] = newOriginPoint.id;
        originPointsMap.get(nextOriginPointId).neighbouringOriginPointsId[0] = newOriginPoint.id;
        originPointsMap.set(newOriginPoint.id,{neighbouringOriginPointsId:[prevOriginPointId,nextOriginPointId],originPointIndices:indices, layer1:new Set(indices), layer2:new Set(indices)})
    }
    return expansionsCounter
}


export async function collisionWaves(grid) {

    const start = grid.startIndex;
    const end = grid.endIndex;

    const originPointsMap = new Map();

    originPointsMap.set("start",{neighbouringOriginPointsId:[null,"end"],originPointIndices:[start],layer1:new Set([start]),layer2:new Set([start])});
    originPointsMap.set("end",{neighbouringOriginPointsId:["start",null],originPointIndices:[end],layer1:new Set([end]),layer2:new Set([end])});

    const maxId = [1];
    let numberOfExpansionsForCollision = Infinity;

    while (numberOfExpansionsForCollision > 1) {
        if (!grid.algorithmCanRun) {return}
        numberOfExpansionsForCollision = await collisionCycle(originPointsMap,maxId,grid);
        if (!grid.algorithmCanRun) {return}
    }

    colorOriginPoints(originPointsMap,grid)

    return originPointsMap;
}

function colorOriginPoints(originPointsMap,grid) {
    for (const ogData of originPointsMap) {
        const ogIndices = ogData[1].originPointIndices;
        for (const index of ogIndices) {
            if (index === grid.endIndex) {
                grid.colorSquare(index,grid.COLORS.END);
                continue
            } else if (index === grid.startIndex) {
                grid.colorSquare(index,grid.COLORS.START);
                continue
            }
            grid.colorSquare(index,"rgb(154, 221, 255)")
        }
    }

}
