import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/:locale/dashboard/invoices',
        destination: '/:locale/dashboard/sales/invoices',
        permanent: true,
      },
      {
        source: '/:locale/dashboard/customers',
        destination: '/:locale/dashboard/sales/customers',
        permanent: true,
      },
      {
        source: '/:locale/dashboard/inventory',
        destination: '/:locale/dashboard/inventory/products',
        permanent: true,
      },
    ]
  },
}

export default withNextIntl(nextConfig);
