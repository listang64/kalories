import { useState } from 'react'
import { LoginScreen } from './LoginScreen'
import { SignupScreen } from './SignupScreen'

export function AuthScreen() {
  const [signup, setSignup] = useState(false)

  return signup ? (
    <SignupScreen account={null} onBack={() => setSignup(false)} />
  ) : (
    <LoginScreen onSignup={() => setSignup(true)} />
  )
}
