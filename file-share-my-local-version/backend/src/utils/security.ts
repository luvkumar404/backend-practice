export async function hashPassword(password: string): Promise<string> {
  // Bun natively uses argon2id for password hashing
  return await Bun.password.hash(password);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await Bun.password.verify(password, hash);
}
