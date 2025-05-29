import { Graph } from '@cosmos.gl/graph'
import { createCosmos } from '../../create-cosmos'
import { generateMeshData } from '../../generate-mesh-data'
import { LassoSelection } from './lasso'

export const lassoSelection = (): {div: HTMLDivElement; graph: Graph; destroy: () => void } => {
  const nClusters = 25
  const { pointPositions, pointColors, pointClusters } = generateMeshData(150, 150, nClusters, 1.0)

  const { div, graph } = createCosmos({
    pointPositions,
    pointColors,
    pointClusters,
    simulationGravity: 1.5,
    simulationCluster: 0.3,
    simulationRepulsion: 8,
    pointSize: 8,
    backgroundColor: '#1a1a2e',
    pointGreyoutOpacity: 0.2,
    onClick: (index: number | undefined): void => {
      if (index === undefined) {
        graph.unselectPoints()
      }
    },
  })

  graph.setZoomLevel(0.4)

  const lassoSelection = new LassoSelection(div, (lassoPoints) => {
    graph.selectPointsInLasso(lassoPoints)
  })

  const actionsDiv = document.createElement('div')
  actionsDiv.className = 'actions'
  div.appendChild(actionsDiv)

  const lassoButton = document.createElement('div')
  lassoButton.className = 'action'
  lassoButton.textContent = 'Enable Lasso Selection'
  lassoButton.addEventListener('click', () => {
    lassoSelection.enableLassoMode()
  })
  actionsDiv.appendChild(lassoButton)

  const destroy = (): void => {
    lassoSelection.destroy()
    if (actionsDiv.parentNode) {
      actionsDiv.parentNode.removeChild(actionsDiv)
    }
  }

  return { div, graph, destroy }
}
