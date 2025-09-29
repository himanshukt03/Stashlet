# Stashlet

![Next.js](https://img.shields.io/badge/Next.js-13+-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS%20S3-Storage-F8911C?logo=amazon-s3&logoColor=white)
![AWS DynamoDB](https://img.shields.io/badge/AWS%20DynamoDB-NoSQL-4053D6?logo=amazon-dynamodb&logoColor=white)
![AWS Lambda](https://img.shields.io/badge/AWS%20Lambda-Serverless-FF9900?logo=aws-lambda&logoColor=white)

Stashlet is a full-stack document vault that combines a modern Next.js dashboard with AWS-native storage. Upload receipts, contracts, IDs, or design assets, tag and filter them with ease, and let AWS S3, DynamoDB, and optionally Lambda handle the heavy lifting behind the scenes.

> **Live Demo** → [stashlet.vercel.app](https://stashlet.vercel.app/)

---

## Table of Contents

1. [Highlights](#highlights)
2. [Architecture Overview](#architecture-overview)
3. [AWS Services used](#aws-services)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Development Workflow](#development-workflow)

---

## Highlights

- **Intuitive dashboard** for uploading, browsing, and editing document metadata.
- **Powerful filters** across tags, categories, expiry dates, and free-text search.
- **Scalable storage** with AWS S3 plus optional thumbnail generation via Lambda.
- **Server-rendered and client-enhanced** using Next.js App Router and React Server Components.
- **Type-safe data access** through a DynamoDB repository with schema validation.
- **Responsive UI** built with Tailwind CSS and Radix UI primitives.

## Architecture Overview

```
Client Dashboard (Next.js + Tailwind)
        │
        │ 1. Upload form submission
        ▼
API Route /api/documents (Next.js edge/server runtime)
        │
        ├─► Validates payload & file type
        ├─► Streams file → AWS S3 (documents/{uuid}/...)
        ├─► Persists metadata → DynamoDB table
        └─► (Optional) Invokes AWS Lambda for thumbnail generation

Browser fetches dashboard data
        │
        ▼
Server components query DynamoDB repository and render pages
```

## AWS Services

| Service | Role | Notes |
| --- | --- | --- |
| ![S3](https://img.shields.io/badge/-S3-569A31?logo=amazon-s3&logoColor=white) | Binary storage | Stores original documents and (optionally) generated thumbnails. |
| ![DynamoDB](https://img.shields.io/badge/-DynamoDB-4053D6?logo=amazon-dynamodb&logoColor=white) | Metadata database | Captures document metadata (title, tags, size, timestamps). Auto-provisioned locally via `AWS_AUTO_CREATE_TABLE=true`. |
| ![Lambda](https://img.shields.io/badge/-Lambda-FF9900?logo=aws-lambda&logoColor=white) | Optional thumbnail worker | Triggered after image uploads to produce smaller thumbnail assets. Configure with `AWS_RESIZE_LAMBDA_FUNCTION_NAME`. |
| ![IAM](https://img.shields.io/badge/-IAM-232F3E?logo=amazon-aws&logoColor=white) | Access control | Provide credentials via environment variables or the AWS SDK default provider chain. |

## Getting Started
### Installation

```bash
git clone https://github.com/himanshukt03/Stashlet.git
cd Stashlet
npm install
```

## Environment Variables

Create a `.env.local` file in the project root. The sample below covers every supported flag:

```
# Core AWS configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=

# S3 document storage
AWS_S3_BUCKET_NAME=stashlet-dev-bucket
AWS_S3_PUBLIC_URL_BASE=
AWS_S3_FORCE_PUBLIC_READ=false
AWS_S3_THUMBNAIL_PREFIX=thumbnails

# DynamoDB metadata table
AWS_DOCUMENTS_TABLE_NAME=stashlet-documents
AWS_AUTO_CREATE_TABLE=true

# Optional Lambda thumbnail generator
AWS_RESIZE_LAMBDA_FUNCTION_NAME=
```

