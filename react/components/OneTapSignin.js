import React, {
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from 'react'
import PropTypes from 'prop-types'
import { useRuntime } from 'vtex.render-runtime'
import { Helmet } from 'vtex.render-runtime'
import { getProfile } from '../utils/profile'
import { SELF_APP_NAME_AND_VERSION } from '../common/global'
import { AuthStateLazy, serviceHooks } from 'vtex.react-vtexid' // why not AuthStateLazy

const getSessionPromise = () =>
  !window ||
  !window.__RENDER_8_SESSION__ ||
  !window.__RENDER_8_SESSION__.sessionPromise
    ? Promise.resolve(null)
    : window.__RENDER_8_SESSION__.sessionPromise

const onLoginPage = current => current === 'store.login'

const OneTapSignin = ({ shouldOpen }) => {
  const formRef = useRef()
  const { account } = useRuntime()
  const [startSession] = serviceHooks.useStartLoginSession()

  const prompt = useCallback(
    clientId => {
      google.accounts.id.initialize({
        client_id: clientId,
        auto_select: window.localStorage && localStorage.gsi_auto === true,
        callback: ({ credential }) => {
          if (window.localStorage) localStorage.setItem('gsi_auto', true)
          const form = formRef.current
          form.method = 'POST'
          form.action = new URL(
            '/api/vtexid/google/onetap/signin',
            window.location.href
          )
          form['credential'].value = credential
          form.submit()
        },
      })
      google.accounts.id.prompt()
    },
    [formRef.current]
  )

  useEffect(() => {
    if (shouldOpen) return

    getSessionPromise().then(async data => {
      const sessionProfile = getProfile((data || {}).response)
      if (sessionProfile) return

      const { href: baseUrl } = window.location
      const resp = await fetch(
        new URL('/api/vtexid/google/onetap/id', baseUrl).href
      )
      const googleClientId = await resp.json()
      const { enabled, clientId } = googleClientId || {}
      if (/*!enabled,  || */ !clientId) return

      startSession()

      if (window.google) {
        prompt(clientId)
      } else {
        window.onGoogleLibraryLoad = () => {
          prompt(clientId)
        }
      }
    })
    return () => {
      if (!window || !window.google) return
      google.accounts.id.cancel()
    }
  }, [account, shouldOpen])

  return shouldOpen ? (
    <>
      <Helmet>
        <script src="https://accounts.google.com/gsi/client"></script>
      </Helmet>
      <form id="gsi" className="dn" ref={formRef}>
        <input name="account" value={account} />
        <input name="credential" />
      </form>
    </>
  ) : null
}

OneTapSignin.propTypes = {
  shouldOpen: PropTypes.bool.isRequired,
  shouldClose: PropTypes.bool,
}

const Wrapper = props => {
  const { page } = useRuntime()

  if (onLoginPage(page) || !window.location) return null

  return (
    <Suspense fallback={null}>
      <AuthStateLazy
        skip
        scope="STORE"
        parentAppId={SELF_APP_NAME_AND_VERSION}
        returnUrl={window.location.href}
      >
        <OneTapSignin {...props} />
      </AuthStateLazy>
    </Suspense>
  )
}

export default Wrapper

export const OneTapSignOut = () => {
  window.localStorage && localStorage.setItem('gsi_auto', false)
  window.google && google.accounts.id.disableAutoSelect()
}
