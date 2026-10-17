import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { RotateNotice } from './components/RotateNotice'
import { Toast } from './components/Toast'
import { auth } from './config/firebase'
import { useAppUpdate } from './hooks/useAppUpdate'
import { signOutUser } from './lib/auth'
import { AuthScreen } from './screens/AuthScreen'
import { HomeScreen } from './screens/HomeScreen'
import { SignupScreen } from './screens/SignupScreen'
import { SplashScreen } from './screens/SplashScreen'
import { useMe, useSession, useSignup } from './store/sessionStore'

export default function App() {
  useAppUpdate()
  const status = useSession((s) => s.status)
  const people = useSession((s) => s.people)
  const signingUp = useSignup((s) => s.busy)
  const me = useMe()
  const view = signingUp || status === 'signedOut' ? 'auth' : status === 'ready' && me ? `home-${me.uid}` : status

  return (
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {view === 'auth' ? (
              <AuthScreen />
            ) : view === 'loading' ? (
              <SplashScreen />
            ) : view === 'migrating' ? (
              <SplashScreen message="Préparation de votre foyer…" />
            ) : view === 'incomplete' ? (
              <SignupScreen account={auth.currentUser} onBack={() => void signOutUser()} />
            ) : (
              me && <HomeScreen me={me} people={people} />
            )}
          </motion.div>
        </AnimatePresence>
      </ErrorBoundary>
      <Toast />
      <RotateNotice />
    </MotionConfig>
  )
}
