import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { RotateNotice } from './components/RotateNotice'
import { Toast } from './components/Toast'
import { useAppUpdate } from './hooks/useAppUpdate'
import { HomeScreen } from './screens/HomeScreen'
import { LoginScreen } from './screens/LoginScreen'
import { SplashScreen } from './screens/SplashScreen'
import { useMe, useSession } from './store/sessionStore'

export default function App() {
  useAppUpdate()
  const status = useSession((s) => s.status)
  const people = useSession((s) => s.people)
  const me = useMe()

  return (
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>
        <AnimatePresence mode="wait" initial={false}>
          {status !== 'loading' && (
            <motion.div
              key={me ? `home-${me.uid}` : status}
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {status === 'ready' && me ? (
                <HomeScreen me={me} people={people} />
              ) : status === 'migrating' || status === 'incomplete' ? (
                <SplashScreen status={status} />
              ) : (
                <LoginScreen />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </ErrorBoundary>
      <Toast />
      <RotateNotice />
    </MotionConfig>
  )
}
