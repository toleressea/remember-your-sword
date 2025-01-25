## Purpose

Simple bible memory helper, where you specify a bible chapter (NKJV only atm) and type it out, helping you see mistakes and providing help if asked for.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Via Local

Install `npm` and the necessary packages via `npm install`

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### Via Docker

```bash
docker build -t remember-your-sword:latest .
docker run --rm -p 8001:8001 remember-your-sword:latest
```

## Usage

Open [http://localhost:8001](http://localhost:8001) with your browser to see the result.