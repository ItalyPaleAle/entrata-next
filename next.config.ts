import type { NextConfig } from 'next'

import { name as packageName, version as packageVersion } from './package.json'

const nextConfig: NextConfig = {
    publicRuntimeConfig: {
        package: {
            name: packageName,
            version: packageVersion,
        },
    },
}

export default nextConfig
