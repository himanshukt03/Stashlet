import mongoose, { Schema } from 'mongoose';
import { documentTypes } from '@/lib/validators';

// Define the document schema
const DocumentSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    type: {
      type: String,
      required: [true, 'Document type is required'],
      enum: documentTypes,
    },
    customType: {
      type: String,
      trim: true,
      maxlength: [50, 'Custom type cannot be more than 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [20, 'Tag cannot be more than 20 characters'],
      },
    ],
    issueDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    publicId: {
      type: String,
      required: [true, 'Public ID is required'],
    },
    thumbnailUrl: {
      type: String,
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    isTemporary: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create indexes for efficient querying
DocumentSchema.index({ title: 'text', description: 'text', tags: 'text' });
DocumentSchema.index({ type: 1 });
DocumentSchema.index({ createdAt: -1 });
DocumentSchema.index({ isTemporary: 1 });

// Prevent overwriting the model if it already exists
const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema);

export default Document;