import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import mongoose from 'mongoose';
import Templates from '@/models/Template';
import { getUserFromRequest } from '@/lib/auth';

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const allowedRoles = ['developer', 'admin', 'employee'];

    const user = getUserFromRequest(request);

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!allowedRoles.includes(user.role as string)) {
      return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const allowedRoles = ['developer'];

    const user = getUserFromRequest(request);

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!allowedRoles.includes(user.role as string)) {
      return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid or missing ID parameter' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (body.name) {
      const existingTemplate = await Templates.findOne({
        name: body.name,
        _id: { $ne: id }
      });
      if (existingTemplate) {
        return NextResponse.json(
          { message: 'A template with this name already exists' },
          { status: 409 }
        );
      }
    }

    const updatedTemplate = await Templates.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedTemplate) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Template updated successfully',
      result: updatedTemplate,
    });
  } catch (error: any) {
    console.error('Error updating template:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { error: 'Error updating template' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const allowedRoles = ['developer'];

    const user = getUserFromRequest(request);

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!allowedRoles.includes(user.role as string)) {
      return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

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