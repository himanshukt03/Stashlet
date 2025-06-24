# Stashlet

Stashlet is a modern document management and organization web application. It allows to securely upload, store, tag, and categorize documents, making it easy to manage and retrieve important files in one place.

[Live Demo](https://stashlet.vercel.app/)

## Features

- **Document Upload**: Easily upload and store various types of documents.
- **Tagging & Organization**: Tag documents and browse by tags for quick retrieval.
- **Categories**: Organize documents by predefined or custom categories (e.g., Financial, Medical, Legal, Personal, Work, etc.).
- **Recent Documents**: View a list of your most recently added documents.
- **Search & Filter**: Quickly search and filter documents by type, tag, or custom criteria.
- **Cloud Storage Integration**: Supports uploading files to Cloudinary for scalable, secure storage.
- **Dashboard**: Centralized dashboard for uploading, managing, and browsing all your documents.
- **Responsive UI**: Built with modern UI components for a smooth user experience.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- A MongoDB instance (local or cloud, e.g., MongoDB Atlas)
- Cloudinary account for file storage

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/himanshukt03/Stashlet.git
   cd Stashlet
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the project root with the following example contents:

   ```
   MONGODB_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

- `app/` - Next.js application routes (dashboard, categories, tags, documents, etc.)
- `components/` - Reusable UI and dashboard components
- `lib/` - Utility libraries for database and cloud integration
- `models/` - Mongoose models for MongoDB
- `public/` - Static files and assets

## Core Technologies

- **Next.js** (App Router)
- **TypeScript**
- **MongoDB** (with Mongoose)
- **Cloudinary** (file storage)
- **Radix UI** (UI primitives)
- **Tailwind CSS** (styling)

## Usage

- Upload documents from the Dashboard
- Browse and filter documents by category or tags
- Manage recent uploads and view all stored documents
- Tag documents for easy grouping and searching

## Contributing

Contributions are welcome! Please open issues or pull requests for enhancements and bug fixes.

## License

This project is currently unlicensed. Please contact the author for usage terms.

## Author

- [himanshukt03](https://github.com/himanshukt03)
