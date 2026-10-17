import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../config/firebase'
import { signupCodeFromDoc, type SignupCode } from '../lib/signupCodes'

export function useSignupCodes(): SignupCode[] {
  const [codes, setCodes] = useState<SignupCode[]>([])

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, 'signupCodes'), orderBy('createdAt', 'desc')),
        (snapshot) => setCodes(snapshot.docs.map(signupCodeFromDoc)),
        () => undefined,
      ),
    [],
  )

  return codes
}
