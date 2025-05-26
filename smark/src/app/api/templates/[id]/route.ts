import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import mongoose from 'mongoose';
import Templates from '@/models/Template';
import { getUserFromRequest } from '@/lib/auth';
import {sanitizeRequest} from "@/lib/utils/sanitizeRequest";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const allowedRoles = ['developer', 'admin', 'employee'];

    const user = getUserFromRequest(request);

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!allowedRoles.includes(user.role as string)) {
      return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid or missing ID parameter' },
        { status: 400 }
      );
    }

    const template = await Templates.findById(id);
    if (!template) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Template found',
      result: template,
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Error fetching template' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();

  const allowedRoles = ['developer', 'admin'];
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
  }

  const { id } = await params;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return NextResponse.json({ message: 'Invalid or missing ID' }, { status: 400 });
  }

  const result = await sanitizeRequest(request, {
    requiredFields: ['name', 'type', 'html'],
    enums: [{ field: 'type', allowed: ['email', 'telegram'] }]
  });
  if (!result.ok) return result.response;
  const body = result.data;

  const existing = await Templates.findOne({ name: body.name, _id: { $ne: id } });
  if (existing) {
    return NextResponse.json({ message: 'Template name already exists' }, { status: 409 });
  }

  try {
    const updated = await Templates.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ message: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Template updated successfully', result: updated });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Error updating template' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const allowedRoles = ['developer'];

    const user = getUserFromRequest(request);

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!allowedRoles.includes(user.role as string)) {
      return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid or missing ID parameter' },
        { status: 400 }
      );
    }

    const deletedTemplate = await Templates.findByIdAndDelete(id);
    if (!deletedTemplate) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Template deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Error deleting template' },
      { status: 500 }
    );
  }
}