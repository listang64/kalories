export type ProfileId = 'nico' | 'chachou'

export interface Profile {
  id: ProfileId
  name: string
  email: string
  uid: string
  color: 'violet' | 'rouge'
  colorA: string
  colorB: string
}

export const PROFILES: Record<ProfileId, Profile> = {
  nico: {
    id: 'nico',
    name: 'Nico',
    email: 'nico@kalories.app',
    uid: 'Ai6mNQSmQ9M4kSixvyrZORNhbxF2',
    color: 'violet',
    colorA: '#7C3AED',
    colorB: '#C084FC',
  },
  chachou: {
    id: 'chachou',
    name: 'Chachou',
    email: 'chachou@kalories.app',
    uid: 'PDR3pus71PSnyTnsaJ1CRc2BAXs2',
    color: 'rouge',
    colorA: '#E11D48',
    colorB: '#FB7185',
  },
}

export const PROFILE_LIST = [PROFILES.nico, PROFILES.chachou]

export function profileByUid(uid: string): Profile | null {
  return PROFILE_LIST.find((p) => p.uid === uid) ?? null
}

export function profileById(id: string | null): Profile | null {
  return id === 'nico' || id === 'chachou' ? PROFILES[id] : null
}

export function otherProfile(profile: Profile): Profile {
  return profile.id === 'nico' ? PROFILES.chachou : PROFILES.nico
}
