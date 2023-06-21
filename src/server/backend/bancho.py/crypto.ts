import bcrypt from 'bcryptjs'

export async function encryptBanchoPassword(pwMd5: string, rounds = 11) {
  const salt = await bcrypt.genSalt(rounds)
  const pwBcrypt = await bcrypt.hash(pwMd5, salt)
  return pwBcrypt
}
export async function compareBanchoPassword(pwMd5: string, pwBcrypt: string) {
  return await bcrypt.compare(pwMd5, pwBcrypt)
}
