import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Toast } from './components/Toast'
import { useAppUpdate } from './hooks/useAppUpdate'
import { useAuth } from './hooks/useAuth'
import { HomeScreen } from './screens/HomeScreen'
import { LoginScreen } from './screens/LoginScreen'

export default function App() {
  useAppUpdate()
  const { profile, ready } = useAuth()

  return (
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>
        <AnimatePresence mode="wait" initial={false}>
          {ready && (
            <motion.div
              key={profile ? `home-${profile.id}` : 'login'}
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {profile ? <HomeScreen profile={profile} /> : <LoginScreen />}
            </motion.div>
          )}
        </AnimatePresence>
      </ErrorBoundary>
      <Toast />
    </MotionConfig>
  )
}
