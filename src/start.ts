import { execSync } from 'child_process'

try {
  console.log('Running seed/index.js...')
  execSync('node dist/seed/index.js', { stdio: 'inherit' })

  console.log('Running seed/permissionToRole.js...')
  execSync('node dist/seed/permissionToRole.js', { stdio: 'inherit' })

  console.log('Starting main app...')
  execSync('node dist/src/main.js', { stdio: 'inherit' })
} catch (err) {
  console.error('Startup sequence failed:', err)
  process.exit(1)
}
