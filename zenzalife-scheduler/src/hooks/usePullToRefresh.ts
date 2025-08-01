import { useEffect } from 'react'
import PullToRefresh from 'pulltorefreshjs'
import './pulltorefresh.css'

let initialized = false

export function initPullToRefresh() {
  if (initialized) return
  PullToRefresh.init({
    mainElement: '#root',
    instructionsPullToRefresh: 'Swipe down to refresh',
    instructionsReleaseToRefresh: 'Release to refresh',
    instructionsRefreshing: 'Refreshing...',
    onRefresh() {
      window.location.reload()
    }
  })
  initialized = true
}

export function destroyPullToRefresh() {
  if (!initialized) return
  PullToRefresh.destroyAll()
  initialized = false
}
export function usePullToRefresh(enabled = true) {
  useEffect(() => {
    if (enabled) {
      initPullToRefresh()
      return () => {
        destroyPullToRefresh()
      }
    }
    destroyPullToRefresh()
  }, [enabled])
}
