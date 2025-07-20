import { useEffect } from 'react'
import PullToRefresh from 'pulltorefreshjs'

export function usePullToRefresh() {
  useEffect(() => {
    PullToRefresh.init({
      mainElement: 'body',
      instructionsPullToRefresh: 'Swipe down to refresh',
      instructionsReleaseToRefresh: 'Release to refresh',
      instructionsRefreshing: 'Refreshing...',
      onRefresh() {
        window.location.reload()
      }
    })
    return () => {
      PullToRefresh.destroyAll()
    }
  }, [])
}
