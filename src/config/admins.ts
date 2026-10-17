const ADMINS = ['Ai6mNQSmQ9M4kSixvyrZORNhbxF2', 'PDR3pus71PSnyTnsaJ1CRc2BAXs2']

export function isAdmin(uid: string): boolean {
  return ADMINS.includes(uid)
}
