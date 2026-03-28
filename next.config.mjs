/** @type {import('next').NextConfig} */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const nextConfig = {
  ...(BASE_PATH ? { output: 'export' } : {}),
  images: { unoptimized: true },
  basePath: BASE_PATH,
}
export default nextConfig
