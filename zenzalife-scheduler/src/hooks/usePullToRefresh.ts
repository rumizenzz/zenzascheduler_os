import { useEffect } from 'react'
import PullToRefresh from 'pulltorefreshjs'
import './pulltorefresh.css'

let initialized = false

function resetTopSpacing() {
  ;[document.documentElement, document.body, document.getElementById('root')].forEach(
    (el) => {
      if (el) {
        const target = el as HTMLElement
        target.style.marginTop = '0'
        target.style.paddingTop = '0'
        target.style.transform = 'none'
      }
    },
  )
  window.scrollTo({ top: 0, left: 0 })
}

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
  resetTopSpacing()
}

export function destroyPullToRefresh() {
  if (initialized) {
    PullToRefresh.destroyAll()
    initialized = false
  }
  resetTopSpacing()
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
